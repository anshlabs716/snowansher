// ============================================================
//  SNOW RIDER 3D – Full Game Logic
//  Controls: A/D or ←/→ to steer | SPACE to jump
// ============================================================

// ─── DOM refs ──────────────────────────────────────────────────
const hudGifts = document.getElementById('gifts');
const hudDistance = document.getElementById('distance');
const hudBest = document.getElementById('best');
const hudSpeed = document.getElementById('speed');
const menu = document.getElementById('menu');
const gameover = document.getElementById('gameover');
const finalDist = document.getElementById('final-dist');
const finalGifts = document.getElementById('final-gifts');
const finalSpeed = document.getElementById('final-speed');
const retryBtn = document.getElementById('retry');

// ─── State ────────────────────────────────────────────────────
let best = parseInt(localStorage.getItem('snowrider_best')) || 0;
hudBest.textContent = best;

const state = {
    playing: false,
    gameOver: false,
    score: 0,
    gifts: 0,
    distance: 0,
    speed: 0,
    difficulty: 'medium',
    health: 100,
    maxHealth: 100
};

// ─── Keys ────────────────────────────────────────────────────
const keys = { left: false, right: false, jump: false };

// ─── Difficulty ──────────────────────────────────────────────
const DIFFICULTY = {
    easy: { speed: 4, maxSpeed: 10, obstacleRate: 50, gravity: -0.5, jumpPower: 8 },
    medium: { speed: 6, maxSpeed: 14, obstacleRate: 35, gravity: -0.6, jumpPower: 9 },
    hard: { speed: 8, maxSpeed: 18, obstacleRate: 25, gravity: -0.7, jumpPower: 10 }
};

// ─── Three.js Setup ──────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2a4a);
scene.fog = new THREE.Fog(0x1a2a4a, 80, 200);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.prepend(renderer.domElement);

// ─── Lights ──────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x6688cc, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 1.4);
sunLight.position.set(50, 80, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 150;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x445566, 0.4);
scene.add(hemiLight);

// ─── Sky ──────────────────────────────────────────────────────
const skyGeo = new THREE.SphereGeometry(200, 20, 20);
const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
        uTop: { value: new THREE.Color(0x1a3a6a) },
        uBottom: { value: new THREE.Color(0x7ac4e8) }
    },
    vertexShader: `
        varying vec3 vPos;
        void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uBottom;
        varying vec3 vPos;
        void main() {
            float h = normalize(vPos).y;
            vec3 col = mix(uBottom, uTop, max(0.0, h * 0.7 + 0.3));
            gl_FragColor = vec4(col, 1.0);
        }
    `
});
const skyMesh = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyMesh);

// ─── Ground ──────────────────────────────────────────────────
const groundWidth = 80;
const groundLength = 200;
const groundGeo = new THREE.PlaneGeometry(groundWidth, groundLength, 80, 160);
const groundMat = new THREE.MeshLambertMaterial({
    color: 0x4a8a9a,
    roughness: 0.9,
    metalness: 0.0
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -30;
ground.receiveShadow = true;
scene.add(ground);

// ─── Snow particles ──────────────────────────────────────────
const snowCount = 3000;
const snowGeo = new THREE.BufferGeometry();
const snowPos = new Float32Array(snowCount * 3);
for (let i = 0; i < snowCount * 3; i++) {
    snowPos[i] = (Math.random() - 0.5) * 200;
    if (i % 3 === 1) snowPos[i] = Math.random() * 60 + 10;
    if (i % 3 === 2) snowPos[i] = (Math.random() - 0.5) * 200;
}
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const snowMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const snowParticles = new THREE.Points(snowGeo, snowMat);
scene.add(snowParticles);

// ─── Trees ──────────────────────────────────────────────────
const treeGroup = new THREE.Group();
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3d2b });
const leafMat = new THREE.MeshLambertMaterial({ color: 0x2a6a3a });
const leafMat2 = new THREE.MeshLambertMaterial({ color: 0x3a7a4a });

for (let i = 0; i < 120; i++) {
    const x = (Math.random() - 0.5) * 70;
    const z = (Math.random() - 0.5) * 180 - 10;
    if (Math.abs(x) < 6) continue;

    const size = 0.5 + Math.random() * 1.2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * size, 0.12 * size, 0.8 * size, 5), trunkMat);
    trunk.position.set(x, 0.4 * size, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.5 * size, 0.8 * size, 6), leafMat);
    leaf1.position.set(x, 0.8 * size + 0.4 * size, z);
    leaf1.castShadow = true;
    leaf1.receiveShadow = true;
    treeGroup.add(leaf1);

    const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.4 * size, 0.6 * size, 6), leafMat2);
    leaf2.position.set(x, 0.8 * size + 0.8 * size, z);
    leaf2.castShadow = true;
    leaf2.receiveShadow = true;
    treeGroup.add(leaf2);
}
scene.add(treeGroup);

// ─── Sled ──────────────────────────────────────────────────
const sledGroup = new THREE.Group();

// Body
const bodyMat = new THREE.MeshLambertMaterial({ color: 0x55d7ff, roughness: 0.3, metalness: 0.6 });
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 2.0), bodyMat);
body.position.y = 0.2;
body.castShadow = true;
body.receiveShadow = true;
sledGroup.add(body);

// Seat
const seatMat = new THREE.MeshLambertMaterial({ color: 0x222244, roughness: 0.7 });
const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.6), seatMat);
seat.position.set(0, 0.4, -0.3);
seat.castShadow = true;
seat.receiveShadow = true;
sledGroup.add(seat);

// Back
const backMat = new THREE.MeshLambertMaterial({ color: 0x333355, roughness: 0.7 });
const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.1), backMat);
back.position.set(0, 0.5, -0.8);
back.castShadow = true;
back.receiveShadow = true;
sledGroup.add(back);

// Skis
const skiMat = new THREE.MeshLambertMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.2 });
for (let side = -1; side <= 1; side += 2) {
    const ski = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 1.8), skiMat);
    ski.position.set(side * 0.6, 0.02, 0);
    ski.castShadow = true;
    ski.receiveShadow = true;
    sledGroup.add(ski);
}

// Headlight
const hlMat = new THREE.MeshLambertMaterial({ color: 0xffffaa, emissive: 0xffdd44, emissiveIntensity: 0.3 });
const hl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hlMat);
hl.position.set(0, 0.2, 1.1);
sledGroup.add(hl);

// Glow
const glowMat = new THREE.MeshLambertMaterial({
    color: 0x55d7ff,
    emissive: 0x55d7ff,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.15
});
const glow = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 1.6), glowMat);
glow.position.y = 0.1;
sledGroup.add(glow);

sledGroup.position.set(0, 0.6, 0);
sledGroup.userData.vy = 0;
scene.add(sledGroup);

// ─── Obstacles ──────────────────────────────────────────────
const obstacles = [];

// ─── Gifts ──────────────────────────────────────────────────
const gifts = [];

// ─── Particles ──────────────────────────────────────────────
const particles = [];

// ─── Game functions ──────────────────────────────────────────

let gameTime = 0;
let spawnTimer = 0;

function getDiff() {
    return DIFFICULTY[state.difficulty] || DIFFICULTY.medium;
}

function resetGame() {
    state.playing = true;
    state.gameOver = false;
    state.score = 0;
    state.gifts = 0;
    state.distance = 0;
    state.speed = 0;
    state.health = 100;

    sledGroup.position.set(0, 0.6, 0);
    sledGroup.rotation.set(0, 0, 0);
    sledGroup.userData.vy = 0;

    // Clear obstacles
    obstacles.forEach(o => scene.remove(o.mesh));
    obstacles.length = 0;

    // Clear gifts
    gifts.forEach(g => scene.remove(g.mesh));
    gifts.length = 0;

    // Clear particles
    particles.forEach(p => scene.remove(p));
    particles.length = 0;

    gameTime = 0;
    spawnTimer = 0;

    hudGifts.textContent = '0';
    hudDistance.textContent = '0';
    hudSpeed.textContent = '0';
    gameover.classList.remove('show');
}

function spawnObstacle() {
    const diff = getDiff();
    const x = (Math.random() - 0.5) * 8;
    const z = -30 - Math.random() * 30;
    const type = Math.random() > 0.5 ? 'tree' : 'rock';

    const group = new THREE.Group();
    let size = 0.6 + Math.random() * 0.6;

    if (type === 'tree') {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08 * size, 0.12 * size, 0.8 * size, 5),
            new THREE.MeshLambertMaterial({ color: 0x5a3d2b })
        );
        trunk.position.y = 0.4 * size;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        const leaf1 = new THREE.Mesh(
            new THREE.ConeGeometry(0.5 * size, 0.7 * size, 6),
            new THREE.MeshLambertMaterial({ color: 0x2a6a3a })
        );
        leaf1.position.y = 0.8 * size + 0.35 * size;
        leaf1.castShadow = true;
        leaf1.receiveShadow = true;
        group.add(leaf1);

        const leaf2 = new THREE.Mesh(
            new THREE.ConeGeometry(0.4 * size, 0.5 * size, 6),
            new THREE.MeshLambertMaterial({ color: 0x3a7a4a })
        );
        leaf2.position.y = 0.8 * size + 0.7 * size;
        leaf2.castShadow = true;
        leaf2.receiveShadow = true;
        group.add(leaf2);
    } else {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.4 * size + 0.2, 0),
            new THREE.MeshLambertMaterial({ color: 0x6a7a8a, roughness: 0.9 })
        );
        rock.position.y = 0.3 * size;
        rock.rotation.set(Math.random() * 6, Math.random() * 6, 0);
        rock.castShadow = true;
        rock.receiveShadow = true;
        group.add(rock);
    }

    group.position.set(x, 0, z);
    scene.add(group);

    obstacles.push({
        mesh: group,
        x: x,
        z: z,
        radius: type === 'tree' ? 0.6 * size : 0.5 * size + 0.2,
        type: type,
        active: true
    });
}

function spawnGift() {
    const x = (Math.random() - 0.5) * 6;
    const z = -25 - Math.random() * 35;

    const group = new THREE.Group();

    // Box
    const boxMat = new THREE.MeshLambertMaterial({
        color: 0xffd166,
        emissive: 0xff8800,
        emissiveIntensity: 0.05
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), boxMat);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Ribbon
    const ribbonMat = new THREE.MeshLambertMaterial({
        color: 0xff4466,
        emissive: 0xff2244,
        emissiveIntensity: 0.05
    });
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.05), ribbonMat);
    ribbon1.position.y = 0.2;
    group.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.55), ribbonMat);
    ribbon2.position.y = 0.2;
    group.add(ribbon2);

    // Glow
    const glowGift = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.06 })
    );
    group.add(glowGift);

    group.position.set(x, 0.5, z);
    group.userData = { bobSpeed: 0.8 + Math.random() * 0.4, bobOffset: Math.random() * 6 };
    scene.add(group);

    gifts.push({
        mesh: group,
        x: x,
        z: z,
        collected: false
    });
}

function addParticles(x, y, z, color, count) {
    const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
    });
    for (let i = 0; i < count; i++) {
        const size = 0.05 + Math.random() * 0.1;
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 4, 4), mat.clone());
        mesh.position.set(
            x + (Math.random() - 0.5) * 0.5,
            y + (Math.random() - 0.5) * 0.5,
            z + (Math.random() - 0.5) * 0.5
        );
        mesh.userData = {
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 + 2,
            vz: (Math.random() - 0.5) * 4,
            life: 30 + Math.random() * 30,
            maxLife: 60
        };
        scene.add(mesh);
        particles.push(mesh);
    }
}

function gameOverHandler() {
    state.playing = false;
    state.gameOver = true;

    finalDist.textContent = Math.floor(state.distance);
    finalGifts.textContent = state.gifts;
    finalSpeed.textContent = Math.floor(state.speed * 3.6);

    if (state.distance > best) {
        best = state.distance;
        localStorage.setItem('snowrider_best', String(best));
        hudBest.textContent = best;
    }

    addParticles(sledGroup.position.x, 0.5, sledGroup.position.z, 0xff6b6b, 40);
    gameover.classList.add('show');
}

// ─── Update ──────────────────────────────────────────────────

function update(delta) {
    if (!state.playing || state.gameOver) return;

    gameTime += delta;
    const diff = getDiff();

    // Speed
    state.speed += (diff.speed - state.speed) * 0.02;
    state.speed = Math.min(state.speed, diff.maxSpeed);

    // Distance
    state.distance += state.speed * delta * 2;

    // Steering
    const steerSpeed = 4;
    if (keys.left) sledGroup.position.x -= steerSpeed * delta * 5;
    if (keys.right) sledGroup.position.x += steerSpeed * delta * 5;

    // Boundaries
    const limit = 15;
    sledGroup.position.x = Math.max(-limit, Math.min(limit, sledGroup.position.x));

    // Sled tilt
    const targetRot = -sledGroup.position.x * 0.03;
    sledGroup.rotation.z += (targetRot - sledGroup.rotation.z) * delta * 5;

    // Jump
    if (keys.jump && sledGroup.position.y < 0.7) {
        sledGroup.position.y = 0.6;
        sledGroup.userData.vy = diff.jumpPower;
        addParticles(sledGroup.position.x, 0.1, sledGroup.position.z, 0x55d7ff, 10);
    }

    // Gravity
    if (sledGroup.position.y > 0.6) {
        sledGroup.userData.vy += diff.gravity * delta * 8;
        sledGroup.position.y += sledGroup.userData.vy * delta;
    } else {
        sledGroup.position.y = 0.6;
        sledGroup.userData.vy = 0;
    }

    // Move forward
    sledGroup.position.z -= state.speed * delta * 1.5;

    // Camera follow
    const camDist = 10 + state.speed * 0.03;
    const camHeight = 6 + state.speed * 0.02;
    const targetCam = new THREE.Vector3(
        sledGroup.position.x * 0.3,
        sledGroup.position.y + camHeight,
        sledGroup.position.z + camDist
    );
    camera.position.lerp(targetCam, delta * 2);
    camera.lookAt(sledGroup.position.x * 0.2, sledGroup.position.y + 0.5, sledGroup.position.z - 5);

    // ─── Spawn obstacles ──────────────────────────────────
    spawnTimer += delta;
    if (spawnTimer > 1.5 / (1 + state.speed * 0.02)) {
        spawnTimer = 0;
        if (Math.random() < 0.6) spawnObstacle();
        if (Math.random() < 0.4) spawnGift();
    }

    // ─── Update obstacles ─────────────────────────────────
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        if (!ob.active) continue;

        // Move with world
        ob.z -= state.speed * delta * 1.5;

        // Collision
        const dx = sledGroup.position.x - ob.x;
        const dz = sledGroup.position.z - ob.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < ob.radius + 0.5 && sledGroup.position.y < 1.2) {
            addParticles(sledGroup.position.x, 0.5, sledGroup.position.z, 0xff6b6b, 30);
            gameOverHandler();
            return;
        }

        // Remove if behind
        if (ob.z > 15) {
            scene.remove(ob.mesh);
            obstacles.splice(i, 1);
        }
    }

    // ─── Update gifts ─────────────────────────────────────
    for (let i = gifts.length - 1; i >= 0; i--) {
        const g = gifts[i];
        if (g.collected) continue;

        g.z -= state.speed * delta * 1.5;

        // Bob
        const bob = Math.sin(gameTime * g.mesh.userData.bobSpeed + g.mesh.userData.bobOffset) * 0.05;
        g.mesh.position.y = 0.5 + bob;

        // Collision
        const dx = sledGroup.position.x - g.x;
        const dz = sledGroup.position.z - g.z;
        if (Math.abs(dx) < 0.6 && Math.abs(dz) < 0.6) {
            g.collected = true;
            state.gifts++;
            hudGifts.textContent = state.gifts;
            addParticles(g.x, 0.5, g.z, 0xffd166, 20);
            scene.remove(g.mesh);
            gifts.splice(i, 1);
        }

        // Remove if behind
        if (g.z > 15) {
            scene.remove(g.mesh);
            gifts.splice(i, 1);
        }
    }

    // ─── Update particles ─────────────────────────────────
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.x += p.userData.vx * delta;
        p.position.y += p.userData.vy * delta;
        p.position.z += p.userData.vz * delta;
        p.userData.vy -= 2 * delta;
        p.userData.life--;
        const alpha = p.userData.life / p.userData.maxLife;
        p.material.opacity = alpha * 0.6;
        p.scale.setScalar(alpha);
        if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }

    // ─── Update snow ──────────────────────────────────────
    const snowPositions = snowParticles.geometry.attributes.position.array;
    for (let i = 0; i < snowPositions.length / 3; i++) {
        snowPositions[i * 3 + 1] -= delta * 0.3;
        snowPositions[i * 3] += Math.sin(gameTime + i) * delta * 0.02;
        if (snowPositions[i * 3 + 1] < -2) {
            snowPositions[i * 3 + 1] = 30 + Math.random() * 20;
            snowPositions[i * 3] = (Math.random() - 0.5) * 200;
            snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
    }
    snowParticles.geometry.attributes.position.needsUpdate = true;

    // ─── HUD ──────────────────────────────────────────────
    hudDistance.textContent = Math.floor(state.distance);
    hudSpeed.textContent = Math.floor(state.speed * 3.6);

    // ─── Ground follow ────────────────────────────────────
    ground.position.z = Math.round(sledGroup.position.z / 10) * 10 - 10;
}

// ─── Start game ──────────────────────────────────────────────

function startGame(difficulty) {
    state.difficulty = difficulty || 'medium';
    menu.classList.add('hidden');
    resetGame();
}

// ─── Menu buttons ─────────────────────────────────────────────

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        startGame(this.dataset.diff);
    });
});

retryBtn.addEventListener('click', function() {
    startGame(state.difficulty);
});

// ─── Keyboard ────────────────────────────────────────────────

document.addEventListener('keydown', function(e) {
    const key = e.key;
    if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
        e.preventDefault();
        keys.left = true;
    }
    if (key === 'd' || key === 'D' || key === 'ArrowRight') {
        e.preventDefault();
        keys.right = true;
    }
    if (key === ' ' || key === 'Space' || key === 'ArrowUp') {
        e.preventDefault();
        keys.jump = true;
    }
});

document.addEventListener('keyup', function(e) {
    const key = e.key;
    if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
        e.preventDefault();
        keys.left = false;
    }
    if (key === 'd' || key === 'D' || key === 'ArrowRight') {
        e.preventDefault();
        keys.right = false;
    }
    if (key === ' ' || key === 'Space' || key === 'ArrowUp') {
        e.preventDefault();
        keys.jump = false;
    }
});

// ─── Resize ──────────────────────────────────────────────────

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Game Loop ──────────────────────────────────────────────

let lastTime = 0;

function gameLoop(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}

// ─── Init ────────────────────────────────────────────────────

// Reset game, show menu
resetGame();
state.playing = false;
menu.classList.remove('hidden');

// Start loop
requestAnimationFrame(gameLoop);

console.log('❄️ Snow Rider 3D loaded! Controls: A/D to steer, SPACE to jump');
