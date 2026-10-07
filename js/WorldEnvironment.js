/**
 * ============================================================================
 * SNOW ANSHER 3D - WORLD ENVIRONMENT & PROCEDURAL ALPINE SLOPES
 * Infinite procedural snow terrain with moguls, halfpipe banks, ice tunnels,
 * mountain backdrops, alpine chalets, ski lifts, and dynamic time-of-day/aurora.
 * ============================================================================
 */

class WorldEnvironment {
    constructor(scene, renderer, config = {}) {
        this.scene = scene;
        this.renderer = renderer;
        this.config = config;

        this.TRACK_WIDTH = 58;
        this.SLOPE_ANGLE = 0.075; // ~4.3 degrees downhill gradient
        this.CHUNK_LENGTH = 180;
        this.NUM_CHUNKS = 6;

        // Dynamic Time of Day
        this.timeOfDay = 0.25; // 0.0 - 1.0 cycle
        this.timeSpeed = 0.008; // smooth slow cycle
        this.weatherState = 'clear'; // clear, sunset, aurora_night, blizzard

        // Object containers
        this.terrainChunks = [];
        this.mountains = [];
        this.chalets = [];
        this.skiLifts = [];
        this.ambientParticles = [];

        this.initEnvironment();
    }

    initEnvironment() {
        this.setupLighting();
        this.setupSkyDome();
        this.setupMountains();
        this.setupTerrainSystem();
        this.setupSkiLiftPylons();
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xd4e9ff, 0.75);
        this.scene.add(this.ambientLight);

        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x6495ed, 0.45);
        this.scene.add(this.hemiLight);

        this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
        this.sunLight.position.set(60, 100, -40);

        if (this.config.graphics === 'ultra') {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 10;
            this.sunLight.shadow.camera.far = 280;
            this.sunLight.shadow.camera.left = -50;
            this.sunLight.shadow.camera.right = 50;
            this.sunLight.shadow.camera.top = 50;
            this.sunLight.shadow.camera.bottom = -50;
            this.sunLight.shadow.bias = -0.0004;
        }

        this.scene.add(this.sunLight);
    }

    setupSkyDome() {
        const skyGeo = new THREE.SphereGeometry(600, 32, 24);
        this.skyMaterial = new THREE.ShaderMaterial({
            vertexShader: SnowShaders.AuroraSkyShader.vertexShader,
            fragmentShader: SnowShaders.AuroraSkyShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(SnowShaders.AuroraSkyShader.uniforms),
            side: THREE.BackSide,
            depthWrite: false
        });

        this.skyDome = new THREE.Mesh(skyGeo, this.skyMaterial);
        this.scene.add(this.skyDome);
    }

    setupMountains() {
        this.mountainGroup = new THREE.Group();
        const mountainMat = new THREE.MeshStandardMaterial({
            color: 0xeaf2f8,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: true
        });

        // Left & Right jagged alpine ranges
        for (let i = 0; i < 48; i++) {
            const side = (i % 2 === 0 ? 1 : -1);
            const dist = 160 + Math.random() * 220;
            const height = 110 + Math.random() * 140;
            const rad = 50 + Math.random() * 70;
            const sides = 5 + Math.floor(Math.random() * 3);

            const geo = new THREE.ConeGeometry(rad, height, sides);
            const peak = new THREE.Mesh(geo, mountainMat);
            peak.position.set(side * dist, height * 0.45 - 30, -i * 110);
            peak.rotation.y = Math.random() * Math.PI;

            // Mountain snow top cap
            const capGeo = new THREE.ConeGeometry(rad * 0.45, height * 0.35, sides);
            const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = height * 0.35;
            peak.add(cap);

            this.mountainGroup.add(peak);
            this.mountains.push(peak);
        }

        this.scene.add(this.mountainGroup);
    }

    setupTerrainSystem() {
        // High quality procedural snow terrain material
        this.terrainMat = new THREE.ShaderMaterial({
            vertexShader: SnowShaders.SnowTerrainShader.vertexShader,
            fragmentShader: SnowShaders.SnowTerrainShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(SnowShaders.SnowTerrainShader.uniforms)
        });

        for (let i = 0; i < this.NUM_CHUNKS; i++) {
            this.createTerrainChunk(i);
        }
    }

    createTerrainChunk(index) {
        const width = 160;
        const length = this.CHUNK_LENGTH;
        const segX = 36;
        const segZ = 42;
        const geo = new THREE.PlaneGeometry(width, length, segX, segZ);

        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getY(i); // Local Y before slope rotation

            // Banked halfpipe outer rims
            const absX = Math.abs(x);
            let yDisplacement = 0;
            if (absX > this.TRACK_WIDTH * 0.45) {
                const rim = (absX - this.TRACK_WIDTH * 0.45);
                yDisplacement = Math.pow(rim * 0.22, 1.85);
            }

            // Natural terrain moguls and ripples
            yDisplacement += Math.sin(x * 0.1) * Math.cos(z * 0.07) * 0.75;
            pos.setZ(i, yDisplacement);
        }

        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, this.terrainMat);
        mesh.rotation.x = -Math.PI / 2 + this.SLOPE_ANGLE;
        mesh.receiveShadow = (this.config.graphics === 'ultra');

        const zPos = -index * (length * Math.cos(this.SLOPE_ANGLE));
        const yPos = -index * (length * Math.sin(this.SLOPE_ANGLE));
        mesh.position.set(0, yPos, zPos);

        this.scene.add(mesh);
        this.terrainChunks.push({ mesh, index });
    }

    setupSkiLiftPylons() {
        this.liftGroup = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x57606f, metalness: 0.8, roughness: 0.3 });
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });

        for (let i = 0; i < 14; i++) {
            const pylon = new THREE.Group();
            const z = -i * 140 - 80;
            const y = -z * Math.tan(this.SLOPE_ANGLE);
            const x = this.TRACK_WIDTH * 0.55 + 14;

            // Main support pole
            const poleGeo = new THREE.CylinderGeometry(0.5, 0.7, 18, 8);
            const pole = new THREE.Mesh(poleGeo, metalMat);
            pole.position.y = 9;
            pylon.add(pole);

            // Cross arm beam
            const armGeo = new THREE.BoxGeometry(6, 0.4, 0.4);
            const arm = new THREE.Mesh(armGeo, yellowMat);
            arm.position.y = 17.5;
            pylon.add(arm);

            // Cable pulley wheels
            for (let side of [-2.5, 2.5]) {
                const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 12);
                const wheel = new THREE.Mesh(wheelGeo, metalMat);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(side, 17.3, 0);
                pylon.add(wheel);
            }

            pylon.position.set(x, y, z);
            this.liftGroup.add(pylon);
        }

        this.scene.add(this.liftGroup);
    }

    /**
     * Spawn an Alpine Log Cabin with chimney smoke on the slope border
     */
    createAlpineChalet(x, y, z) {
        const chalet = new THREE.Group();

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x53382c, roughness: 0.9 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x718093, roughness: 0.95 });
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // Warm cozy interior light

        // Log Cabin Base Walls
        const bodyGeo = new THREE.BoxGeometry(10, 6, 12);
        const body = new THREE.Mesh(bodyGeo, woodMat);
        body.position.y = 3;
        chalet.add(body);

        // Snow-Heavy Gabled Roof
        const roofGeo = new THREE.ConeGeometry(9, 5, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 8;
        roof.scale.set(1.1, 1.0, 1.4);
        chalet.add(roof);

        // Glowing Windows
        for (let side of [-1, 1]) {
            const winGeo = new THREE.PlaneGeometry(1.6, 1.6);
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(side * 5.05, 3.5, 0);
            win.rotation.y = side * Math.PI / 2;
            chalet.add(win);
        }

        // Stone Chimney with smoke
        const chimGeo = new THREE.BoxGeometry(1.4, 7, 1.4);
        const chim = new THREE.Mesh(chimGeo, stoneMat);
        chim.position.set(2.8, 7.5, 2.5);
        chalet.add(chim);

        chalet.position.set(x, y, z);
        this.scene.add(chalet);
        this.chalets.push(chalet);
    }

    /**
     * Recycle terrain chunks and stream mountains down the endless mountain run
     */
    update(dt, playerPos) {
        // Progress Time of Day
        this.timeOfDay = (this.timeOfDay + this.timeSpeed * dt) % 1.0;
        this.skyMaterial.uniforms.uTimeOfDay.value = this.timeOfDay;
        this.skyMaterial.uniforms.uTime.value += dt;
        this.terrainMat.uniforms.uTime.value += dt;

        // Dynamic Sun & Sky Lighting based on time
        if (this.timeOfDay > 0.7) {
            // Polar Aurora Night
            this.ambientLight.color.setHex(0x1e3799);
            this.ambientLight.intensity = 0.45;
            this.sunLight.intensity = 0.2;
            this.sunLight.color.setHex(0x38ada9);
        } else if (this.timeOfDay > 0.5) {
            // Golden Sunset
            this.ambientLight.color.setHex(0xf39c12);
            this.ambientLight.intensity = 0.65;
            this.sunLight.intensity = 1.1;
            this.sunLight.color.setHex(0xe17055);
        } else {
            // Bright Alpine Daylight
            this.ambientLight.color.setHex(0xd4e9ff);
            this.ambientLight.intensity = 0.75;
            this.sunLight.intensity = 1.35;
            this.sunLight.color.setHex(0xfff5e6);
        }

        // Sky dome follows player
        this.skyDome.position.copy(playerPos);

        // Recycle terrain chunks seamlessly
        const chunkCos = this.CHUNK_LENGTH * Math.cos(this.SLOPE_ANGLE);
        const chunkSin = this.CHUNK_LENGTH * Math.sin(this.SLOPE_ANGLE);

        this.terrainChunks.forEach(chunk => {
            if (chunk.mesh.position.z > playerPos.z + chunkCos) {
                let minZ = Infinity;
                let minY = Infinity;
                this.terrainChunks.forEach(c => {
                    if (c.mesh.position.z < minZ) {
                        minZ = c.mesh.position.z;
                        minY = c.mesh.position.y;
                    }
                });
                chunk.mesh.position.z = minZ - chunkCos;
                chunk.mesh.position.y = minY - chunkSin;
            }
        });

        // Parallax mountain ranges
        this.mountainGroup.position.z = playerPos.z * 0.65;
        this.mountainGroup.position.y = playerPos.y * 0.65;

        // Sunlight follows player
        this.sunLight.position.set(
            playerPos.x + 60,
            playerPos.y + 100,
            playerPos.z - 40
        );
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldEnvironment;
}
