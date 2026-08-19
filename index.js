let scene, camera, renderer, world, ground;
let player, playerBody, obstacles = [], debris = [], snowflakes, hills = [];
let trailParticles = [], speedLines = [], landParticles = [];
let score = 0, giftCount = 0, gameActive = false, currentSpeed = 0, startTime, terrainDistance = 0;
let WORLD_WIDTH = 65;
let keys = {};
const RIDE_HEIGHT = 0.58;
let playerX = 0, playerY = RIDE_HEIGHT, playerVelX = 0, playerVelY = 0;
let isJumping = false;
let sounds = {};
let sky;

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
}

function setVisible(id, visible, display = 'block') {
    const element = document.getElementById(id);
    if (element) element.style.display = visible ? display : 'none';
}

const game = {
    config: {
        graphics: localStorage.getItem('sr3d_gfx') || 'medium',
        sensitivity: parseFloat(localStorage.getItem('sr3d_sens')) || 1.2,
        volume: parseFloat(localStorage.getItem('sr3d_vol')) || 0.8,
        skin: parseInt(localStorage.getItem('sr3d_skin')) || 0,
        fov: parseInt(localStorage.getItem('sr3d_fov')) || 70
    },

    init() {
        this.setupThree();
        this.setupPhysics();
        this.createWorld();
        this.setupAudio();
        this.setupUI();
        this.setupControls();
        
        // Hide loader with a smooth fade after a short delay
        const loader = document.getElementById('loader');
        if(loader) {
            setTimeout(() => {
                loader.style.transition = 'opacity 0.5s ease';
                loader.style.opacity = '0';
                setTimeout(() => { 
                    if(loader && loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 500);
            }, 300); // Short delay to ensure scene is rendered
        }
        
        this.animate();
    },

    setupThree() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x102f52);
        scene.fog = new THREE.FogExp2(0x102f52, 0.00042);

        camera = new THREE.PerspectiveCamera(this.config.fov, window.innerWidth / window.innerHeight, 0.1, 15000);
        camera.position.set(0, 9, 30);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        
        if(this.config.graphics === 'high') {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        document.body.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xd7efff, 0x183555, 1.15));
        const sun = new THREE.DirectionalLight(0xfff4dc, 1.8);
        sun.position.set(-180, 420, 260);
        if(this.config.graphics === 'high') sun.castShadow = true;
        scene.add(sun);
    },

    setupPhysics() {
        world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.defaultContactMaterial.friction = 0.35;
        world.defaultContactMaterial.restitution = 0;

        // The visual slope is flat through the ride lane; this physical snow plane
        // prevents the kinematic sled from ever falling through the world.
        const snowBody = new CANNON.Body({ mass: 0 });
        snowBody.addShape(new CANNON.Plane());
        snowBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(snowBody);
    },


    getSnowHeight(x, z) {
        const rollingSlope = Math.sin(z * .008) * 2.2 + Math.sin(z * .021 + x * .02) * .65;
        const sideBank = Math.max(0, Math.abs(x) - 31);
        return rollingSlope + sideBank * sideBank * .011 + Math.sin(x * .055) * Math.min(sideBank, 42) * .28;
    },

    createWorld() {
        this.createSky();
        const gGeo = new THREE.PlaneGeometry(6000, 25000, 80, 80);
        const pos = gGeo.attributes.position.array;
        for(let i=0; i<pos.length; i+=3) {
            const x = pos[i];
            const z = -pos[i + 1];
            pos[i + 2] = this.getSnowHeight(x, z);
        }
        gGeo.computeVertexNormals();
        const gMat = new THREE.MeshStandardMaterial({ color: 0xd8edf6, roughness: 0.94, metalness: 0.01 });
        ground = new THREE.Mesh(gGeo, gMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const snowGeo = new THREE.BufferGeometry();
        const snowCount = this.config.graphics === 'high' ? 6000 : 2000;
        const pts = [];
        for(let i=0; i<snowCount; i++) pts.push(Math.random()*4000-2000, Math.random()*800, Math.random()*4000-2000);
        snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        snowflakes = new THREE.Points(snowGeo, new THREE.PointsMaterial({
            color: 0xffffff, 
            size: 0.15, 
            transparent: true, 
            opacity: 0.15,
            depthWrite: false
        }));
        scene.add(snowflakes);

        const group = new THREE.Group();
        const sled = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 4.2), new THREE.MeshStandardMaterial({
            color: [0xc0392b, 0x2980b9, 0x27ae60][this.config.skin], 
            metalness: 0.6,
            emissive: [0xc0392b, 0x2980b9, 0x27ae60][this.config.skin],
            emissiveIntensity: 0.2
        }));
        sled.castShadow = true;
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.2), new THREE.MeshStandardMaterial({color: 0x111111}));
        seat.position.y = 0.5;
        const runnerMaterial = new THREE.MeshStandardMaterial({ color: 0xb9e9ff, metalness: .9, roughness: .18 });
        [-.82, .82].forEach(x => {
            const runner = new THREE.Mesh(new THREE.BoxGeometry(.18, .16, 4.7), runnerMaterial);
            runner.position.set(x, -.31, 0);
            runner.castShadow = true;
            group.add(runner);
        });
        const noseStripe = new THREE.Mesh(new THREE.BoxGeometry(.22, .12, 3.7), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x28465b, emissiveIntensity: .45 }));
        noseStripe.position.set(0, .23, -.08);
        group.add(sled, seat, noseStripe);
        
        const glow = new THREE.PointLight([0xffffff, 0x2980b9, 0x27ae60][this.config.skin], 1.5, 15);
        glow.position.y = 2;
        group.add(glow);

        player = group;
        player.position.set(0, playerY, 0);
        player.renderOrder = 999;
        scene.add(player);

        playerBody = new CANNON.Body({ mass: 1, type: CANNON.Body.KINEMATIC, collisionResponse: false });
        playerBody.addShape(new CANNON.Box(new CANNON.Vec3(1.2, 1, 2.1)));
        playerBody.position.set(0, playerY, 0);
        world.addBody(playerBody);

        for(let i=0; i<300; i++) this.spawnObstacle(-600 - i * 45);
        
        for(let i=0; i<55; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const hill = new THREE.Mesh(new THREE.ConeGeometry(95 + Math.random()*120, 210 + Math.random()*170, 7), new THREE.MeshStandardMaterial({color: 0x244d72, roughness: 1}));
            hill.position.set(side * (260 + Math.random()*300), 70, -i * 360 - 500);
            hill.rotation.y = Math.random() * Math.PI;
            scene.add(hill);
        }

        this.createScenery();
    },

    createSky() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#071a35');
        gradient.addColorStop(0.48, '#174a75');
        gradient.addColorStop(1, '#b8ddec');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthWrite: false });
        sky = new THREE.Mesh(new THREE.PlaneGeometry(5000, 1800), material);
        sky.position.set(0, 420, -1050);
        sky.renderOrder = -10;
        scene.add(sky);

        const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(52, 32), new THREE.MeshBasicMaterial({ color: 0xffe7a8, transparent: true, opacity: 0.9 }));
        sunDisc.position.set(-430, 510, -1000);
        scene.add(sunDisc);
    },

    createScenery() {
        const trunk = new THREE.MeshStandardMaterial({ color: 0x4a2d1b, roughness: 1 });
        const needles = new THREE.MeshStandardMaterial({ color: 0x0d4d38, roughness: .9 });
        const ice = new THREE.MeshStandardMaterial({ color: 0xe8fbff, roughness: .45, metalness: .15 });
        const marker = new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x007a9a, emissiveIntensity: .75 });

        for (let i = 0; i < 110; i++) {
            const side = i % 2 ? 1 : -1;
            const tree = new THREE.Group();
            const scale = .6 + Math.random() * 1.25;
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(.55 * scale, .8 * scale, 6 * scale, 7), trunk);
            stem.position.y = 3 * scale;
            tree.add(stem);
            for (let tier = 0; tier < 3; tier++) {
                const crown = new THREE.Mesh(new THREE.ConeGeometry((5.8 - tier) * scale, 8 * scale, 8), needles);
                crown.position.y = (6 + tier * 3.4) * scale;
                tree.add(crown);
            }
            tree.position.set(side * (95 + Math.random() * 330), 0, -i * 105 - 130);
            tree.rotation.y = Math.random() * Math.PI;
            scene.add(tree);
        }

        for (let i = 0; i < 70; i++) {
            const side = i % 2 ? 1 : -1;
            const post = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, 6, 8), ice);
            pole.position.y = 3;
            const beacon = new THREE.Mesh(new THREE.SphereGeometry(.55, 10, 8), marker);
            beacon.position.y = 6.1;
            post.add(pole, beacon);
            post.position.set(side * (48 + Math.random() * 20), 0, -i * 180 - 100);
            scene.add(post);
        }

        const moon = new THREE.Mesh(new THREE.SphereGeometry(75, 24, 18), new THREE.MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: .82 }));
        moon.position.set(-420, 340, -1300);
        scene.add(moon);
        const moonGlow = new THREE.PointLight(0x9adfff, 1.4, 1300);
        moonGlow.position.copy(moon.position);
        scene.add(moonGlow);
    },

    spawnObstacle(z) {
        const type = Math.random();
        const x = (Math.random() - 0.5) * WORLD_WIDTH * 2.8;
        let mesh, shape, bodyY, isMoving = false;

        if(type < 0.1) { // Gift
            mesh = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshStandardMaterial({color: 0xf1c40f, metalness: 0.6}));
            bodyY = 1.75; shape = new CANNON.Box(new CANNON.Vec3(1.75, 1.75, 1.75));
        } else if(type < 0.2) { // Rock
            mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 0), new THREE.MeshStandardMaterial({color: 0x444444, flatShading: true}));
            bodyY = 2.5; shape = new CANNON.Sphere(5);
        } else if(type < 0.3) { // Speed Boost Pad (Interactive)
            mesh = new THREE.Group();
            const pad = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 8), new THREE.MeshStandardMaterial({color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5}));
            const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0, 3, 4, 3), new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff}));
            arrow.rotation.x = -Math.PI/2; arrow.position.y = 0.5;
            mesh.add(pad, arrow);
            bodyY = 0.2; shape = new CANNON.Box(new CANNON.Vec3(5, 0.2, 4));
        } else if(type < 0.4) { // Ramp
            mesh = new THREE.Group();
            const ramp = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 25), new THREE.MeshStandardMaterial({color: 0xdddddd}));
            ramp.rotation.x = -0.25;
            mesh.add(ramp);
            bodyY = 3; shape = new CANNON.Box(new CANNON.Vec3(7.5, 3, 12.5));
        } else if(type < 0.5) { // Giant Moving Snowball (New)
            mesh = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
            bodyY = 6; shape = new CANNON.Sphere(6);
            isMoving = true;
        } else { // Tree
            mesh = new THREE.Group();
            mesh.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 6), new THREE.MeshStandardMaterial({color: 0x3d2b1f})));
            for(let l=0; l<4; l++) {
                const leaves = new THREE.Mesh(new THREE.ConeGeometry(8 - l*1.5, 10, 8), new THREE.MeshStandardMaterial({color: 0x0a3d24}));
                leaves.position.y = 8 + l*5; mesh.add(leaves);
            }
            bodyY = 12; shape = new CANNON.Box(new CANNON.Vec3(2.5, 9, 2.5));
        }

        mesh.position.set(x, 0, z);
        scene.add(mesh);
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.set(x, bodyY, z);
        
        // Triggers for non-fatal objects
        if(type < 0.1 || type < 0.3 || type < 0.4) body.isTrigger = true;

        body.addEventListener("collide", (e) => {
            if(!gameActive) return;
            const isPlayer = (e.body === playerBody || e.target === playerBody);
            if(isPlayer) {
                if(type < 0.1) { // Gift
                    giftCount++;
                    setText('gifts-hud', giftCount);
                    localStorage.setItem('sr3d_gifts', (parseInt(localStorage.getItem('sr3d_gifts') || 0) + 1));
                    this.playSound('gift');
                    scene.remove(mesh); world.removeBody(body);
                } else if(type < 0.3) { // Speed Boost
                    currentSpeed += 25;
                    this.playSound('boost');
                } else if(type < 0.4) { // Ramp
                    if(!isJumping) { isJumping = true; playerVelY = 35; this.playSound('boost'); }
                } else { // Crash (Trees, Rocks, Snowballs)
                    this.crash();
                }
            }
        });

        world.addBody(body);
        obstacles.push({ mesh, body, type, isMoving, originalX: x });
    },

    start(diff) {
        const dMap = { easy: 70, medium: 110, hard: 160 };
        currentSpeed = dMap[diff];
        score = 0;
        giftCount = 0;
        terrainDistance = 0;
        playerX = 0;
        playerVelX = 0;
        playerVelY = 0;
        playerY = RIDE_HEIGHT;
        isJumping = false;
        setText('gifts-hud', '0');
        setText('score-hud', '0');
        setVisible('menu', false);
        const hud = document.getElementById('hud');
        if (hud) hud.style.visibility = 'visible';
        
        gameActive = true;
        startTime = Date.now();
        this.playSound('bg');
        this.playSound('slide');
    },

    crash() {
        if(!gameActive) return;
        gameActive = false;
        this.stopSound('slide');
        this.playSound('crash');
        
        for(let i=0; i<40; i++) {
            const size = 0.3 + Math.random() * 0.7;
            const m = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshStandardMaterial({color: [0xc0392b, 0x2980b9, 0x27ae60][this.config.skin]}));
            const b = new CANNON.Body({ mass: 1 });
            b.addShape(new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)));
            b.position.set(player.position.x, player.position.y, player.position.z);
            b.velocity.set((Math.random()-0.5)*80, 40 + Math.random()*30, (Math.random()-0.5)*80);
            scene.add(m); world.addBody(b);
            debris.push({mesh: m, body: b});
        }
        scene.remove(player);
        setVisible('game-over', true, 'flex');
        setText('final-time', Math.floor(score) + 's');
        setText('final-gifts', giftCount);
        
        // Save high score
        const best = parseInt(localStorage.getItem('sr3d_hs') || 0);
        if(score > best) {
            localStorage.setItem('sr3d_hs', Math.floor(score));
        }
    },

    retry() { location.reload(); },
    toMenu() { location.reload(); },

    setupAudio() {
        const urls = {
            bg: 'https://assets.mixkit.co/music/preview/mixkit-winter-forest-background-ambience-1210.mp3',
            crash: 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-impact-3012.mp3',
            gift: 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-confirmation-914.mp3',
            slide: 'https://assets.mixkit.co/sfx/preview/mixkit-shoveling-snow-step-2443.mp3',
            boost: 'https://assets.mixkit.co/sfx/preview/mixkit-fast-rocket-whoosh-1714.mp3'
        };
        for(let key in urls) {
            sounds[key] = new Audio(urls[key]);
            if(key === 'bg' || key === 'slide') sounds[key].loop = true;
            sounds[key].volume = this.config.volume;
        }
    },

    playSound(key) { if(sounds[key]) { sounds[key].currentTime = 0; sounds[key].play().catch(()=>{}); } },
    stopSound(key) { if(sounds[key]) sounds[key].pause(); },

    setupUI() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.tab-btn, .panel').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            };
        });
        setText('best-hud', localStorage.getItem('sr3d_hs') || 0);
        setText('garage-gifts', localStorage.getItem('sr3d_gifts') || 0);
        const gfx = document.getElementById('gfx-quality');
        const sens = document.getElementById('sens');
        const fov = document.getElementById('fov-range');
        const volume = document.getElementById('audio-vol');
        if (gfx) gfx.value = this.config.graphics;
        if (sens) sens.value = this.config.sensitivity;
        if (fov) fov.value = this.config.fov;
        if (volume) volume.value = this.config.volume;
    },

    setupControls() {
        window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
        window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;
    },

    updateSetting(key, val) {
        this.config[key] = val;
        localStorage.setItem('sr3d_' + key, val);
        if(key === 'fov') { camera.fov = parseInt(val); camera.updateProjectionMatrix(); }
        if(key === 'graphics') location.reload();
        if(key === 'volume') for(let k in sounds) sounds[k].volume = val;
    },

    setSkin(id) {
        this.config.skin = id;
        localStorage.setItem('sr3d_skin', id);
        if(player) {
            player.children[0].material.color.set([0xc0392b, 0x2980b9, 0x27ae60][id]);
            player.children[0].material.emissive.set([0xc0392b, 0x2980b9, 0x27ae60][id]);
        }
    },

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = 0.016;

        if(!gameActive) {
            if(playerBody) { playerBody.velocity.set(0,0,0); playerBody.position.set(playerX, playerY, 0); }
            if(player) player.position.set(0, playerY, 0);
            debris.forEach(d => { d.mesh.position.copy(d.body.position); d.mesh.quaternion.copy(d.body.quaternion); });
            world.step(dt);
        }

        if(gameActive) {
            let input = 0;
            if(keys['a'] || keys['arrowleft']) input -= 1;
            if(keys['d'] || keys['arrowright']) input += 1;
            
            playerVelX += input * 360 * this.config.sensitivity * dt;
            playerVelX *= 0.82;
            playerX += playerVelX * dt;
            playerX = Math.max(-WORLD_WIDTH/2 - 20, Math.min(WORLD_WIDTH/2 + 20, playerX));

            terrainDistance += currentSpeed * dt;
            const surfaceAtSled = this.getSnowHeight(playerX, -terrainDistance);
            const surfaceAtOrigin = this.getSnowHeight(playerX, 0);
            // Shift the generated snow so the rendered surface and sled share one height.
            if (ground) ground.position.y = surfaceAtSled - surfaceAtOrigin;
            const rideSurface = surfaceAtSled + RIDE_HEIGHT;

            if((keys[" "] || keys["w"] || keys["arrowup"]) && !isJumping) {
                isJumping = true; playerVelY = 32;
                this.playSound("boost");
            }
            if(isJumping) {
                playerVelY -= 65 * dt;
                playerY += playerVelY * dt;
                if(playerY <= rideSurface) { playerY = rideSurface; isJumping = false; }
            } else {
                playerY = rideSurface;
            }

            player.position.set(playerX, playerY, 0);
            player.rotation.z += (-input * 0.45 - player.rotation.z) * 0.18;
            player.rotation.y = -player.rotation.z * 0.6;
            playerBody.position.copy(player.position);

            score = (Date.now() - startTime) / 1000;
            setText('score-hud', Math.floor(score));
            setText('speed-val', Math.floor(currentSpeed * 1.5));
            currentSpeed += 0.4 * dt;

            const speedFOV = parseInt(this.config.fov) + (currentSpeed - 60) * 0.3;
            camera.fov += (speedFOV - camera.fov) * 0.05;
            camera.updateProjectionMatrix();

            obstacles.forEach(obj => {
                obj.body.position.z += currentSpeed * dt;
                if(obj.isMoving) {
                    obj.body.position.x = obj.originalX + Math.sin(Date.now()*0.002 + obj.body.position.z*0.01) * 30;
                    obj.mesh.rotation.x += 0.1;
                }
                if(obj.body.position.z > 250) {
                    obj.body.position.z = -12000;
                    obj.body.position.x = (Math.random()-0.5) * WORLD_WIDTH * 2.5;
                    obj.originalX = obj.body.position.x;
                }
                obj.mesh.position.copy(obj.body.position);
            });

            const snow = snowflakes.geometry.attributes.position.array;
            for(let i=1; i<snow.length; i+=3) {
                snow[i] -= 3.5; if(snow[i] < 0) snow[i] = 600;
            }
            snowflakes.geometry.attributes.position.needsUpdate = true;

            camera.position.x += (playerX * 0.85 - camera.position.x) * 0.08;
            camera.position.y += (playerY + 8 + (currentSpeed-60)*0.06 - camera.position.y) * 0.07;
            camera.position.z += (30 - camera.position.z) * 0.06;
            camera.lookAt(playerX * 0.4, playerY + 1.2, -90);

            world.step(dt);
        }
        renderer.render(scene, camera);
    }
};

let booted = false;

function setLoaderStatus(message, isError = false) {
    let status = document.getElementById("loader-status");
    if (!status) {
        status = document.createElement("div");
        status.id = "loader-status";
        status.style.cssText = "margin-top:14px;max-width:330px;color:rgba(255,255,255,.6);font:13px Rajdhani,sans-serif;letter-spacing:1px;text-align:center";
        const loader = document.getElementById("loader");
        if (loader) loader.appendChild(status);
    }
    status.textContent = message;
    status.style.color = isError ? "#ff8a80" : "";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 520);
}

function bootGame() {
    if (booted) return;
    if (!window.THREE || !window.CANNON) {
        setLoaderStatus("Unable to load the 3D engine. Check your internet connection, then reload.", true);
        return;
    }
    booted = true;
    try {
        setLoaderStatus("Building snowy terrain · almost ready");
        game.init();
        hideLoader();
    } catch (error) {
        console.error("Snow Ansher failed to start:", error);
        booted = false;
        setLoaderStatus("World setup hit an error. Reload to try again.", true);
    }
}

// DOMContentLoaded does not wait for fonts, audio, or slow third-party assets.
document.addEventListener("DOMContentLoaded", bootGame);
window.addEventListener("load", bootGame);
setTimeout(bootGame, 1800);
window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
