/**
 * ============================================================================
 * SNOW ANSHER 3D - HIGH-PERFORMANCE 3D PARTICLE ENGINE & VFX POOLING
 * Snow spray, landing impact shockwaves, rail grinding sparks, afterburner flames,
 * gift pickup confetti, volumetric falling snow flurries, and physics debris.
 * ============================================================================
 */

class ParticleEngine {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;

        this.particles = [];
        this.debris = [];
        this.MAX_ACTIVE_PARTICLES = (config.graphics === 'ultra') ? 350 : 150;

        this.setupVolumetricSnow();
    }

    setupVolumetricSnow() {
        const count = (this.config.graphics === 'performance') ? 1400 : 4000;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 180;
            positions[i * 3 + 1] = Math.random() * 55;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            velocities[i * 3] = (Math.random() - 0.5) * 0.8;
            velocities[i * 3 + 1] = -1.4 - Math.random() * 1.8;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.snowVelocities = velocities;

        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.snowPoints = new THREE.Points(geo, mat);
        this.scene.add(this.snowPoints);
    }

    /**
     * Dual ski spray behind runners while carving
     */
    emitSnowSpray(pos, count = 3, steerVal = 0) {
        if (this.particles.length > this.MAX_ACTIVE_PARTICLES) return;

        for (let i = 0; i < count; i++) {
            const size = 0.12 + Math.random() * 0.14;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xf5fbff,
                transparent: true,
                opacity: 0.7
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            p.position.x += (Math.random() - 0.5) * 0.6;
            p.position.y += Math.random() * 0.2;

            p.userData = {
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 4.0 - steerVal * 3.5,
                    2.2 + Math.random() * 3.5,
                    4.0 + Math.random() * 5.0
                ),
                life: 0.45,
                maxLife: 0.45
            };

            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Rail grinding hot sparks
     */
    emitGrindSparks(pos) {
        for (let i = 0; i < 4; i++) {
            const geo = new THREE.BoxGeometry(0.08, 0.08, 0.25);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffa502 });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);

            p.userData = {
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 12.0,
                    4.0 + Math.random() * 8.0,
                    (Math.random() - 0.5) * 10.0
                ),
                life: 0.25,
                maxLife: 0.25
            };

            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Landing Impact Snow Shockwave Puff
     */
    emitLandingShockwave(pos, strength = 1.0) {
        const ringPuffs = 18;
        for (let i = 0; i < ringPuffs; i++) {
            const angle = (i / ringPuffs) * Math.PI * 2;
            const speed = (6.0 + Math.random() * 8.0) * strength;

            const geo = new THREE.SphereGeometry(0.25 * strength, 5, 5);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);

            p.userData = {
                vel: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    2.0 + Math.random() * 3.0,
                    Math.sin(angle) * speed
                ),
                life: 0.6,
                maxLife: 0.6
            };

            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Gift pickup celebration burst
     */
    emitGiftExplosion(pos) {
        const colors = [0xffd166, 0xff4757, 0x00d2ff, 0x2ed573, 0xffffff];
        for (let i = 0; i < 32; i++) {
            const geo = new THREE.SphereGeometry(0.16, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 0.95
            });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);

            const speed = 8 + Math.random() * 16;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            p.userData = {
                vel: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed + 6,
                    Math.sin(phi) * Math.sin(theta) * speed
                ),
                life: 0.75,
                maxLife: 0.75
            };

            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Catastrophic Wipeout Debris Explosion
     */
    spawnCrashDebris(playerPos, currentSkin, forwardSpeed) {
        for (let i = 0; i < 40; i++) {
            const size = 0.22 + Math.random() * 0.5;
            const geo = new THREE.BoxGeometry(size, size, size * 1.6);
            const mat = new THREE.MeshStandardMaterial({
                color: [currentSkin.colors.primary, currentSkin.colors.secondary, 0xcccccc, 0x1e272e][Math.floor(Math.random() * 4)],
                metalness: 0.65
            });
            const piece = new THREE.Mesh(geo, mat);
            piece.position.copy(playerPos);
            piece.position.y += 0.5;

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 38,
                14 + Math.random() * 28,
                -forwardSpeed * 0.45 + (Math.random() - 0.5) * 26
            );

            const rotSpeed = new THREE.Vector3(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 16
            );

            this.scene.add(piece);
            this.debris.push({ mesh: piece, vel, rotSpeed, life: 3.5 });
        }
    }

    update(dt, playerPos, slopeAngle = 0.075) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= dt;

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            p.position.addScaledVector(p.userData.vel, dt);
            p.userData.vel.y -= 12.0 * dt; // gravity
            const alpha = p.userData.life / p.userData.maxLife;
            p.material.opacity = alpha * 0.8;
            p.scale.setScalar(alpha);
        }

        // Update debris pieces
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            d.life -= dt;

            if (d.life <= 0) {
                this.scene.remove(d.mesh);
                d.mesh.geometry.dispose();
                d.mesh.material.dispose();
                this.debris.splice(i, 1);
                continue;
            }

            d.mesh.position.addScaledVector(d.vel, dt);
            d.vel.y -= 28.0 * dt;
            d.mesh.rotation.x += d.rotSpeed.x * dt;
            d.mesh.rotation.y += d.rotSpeed.y * dt;
            d.mesh.rotation.z += d.rotSpeed.z * dt;

            // Bounce on snow slope
            const groundY = -d.mesh.position.z * Math.tan(slopeAngle);
            if (d.mesh.position.y <= groundY) {
                d.mesh.position.y = groundY;
                d.vel.y = -d.vel.y * 0.45;
                d.vel.x *= 0.7;
                d.vel.z *= 0.7;
            }
        }

        // Wrap snowflakes around camera & player volume
        if (this.snowPoints) {
            const pos = this.snowPoints.geometry.attributes.position.array;
            const vel = this.snowVelocities;
            const centerZ = playerPos.z - 35;
            const centerY = playerPos.y + 18;
            const centerX = playerPos.x;

            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3 + 1] += vel[i * 3 + 1] * dt * 9;
                pos[i * 3] += vel[i * 3] * dt * 4;
                pos[i * 3 + 2] += vel[i * 3 + 2] * dt * 4;

                if (pos[i * 3 + 1] < centerY - 28) pos[i * 3 + 1] = centerY + 28;
                if (pos[i * 3 + 2] > centerZ + 100) pos[i * 3 + 2] = centerZ - 100;
                if (pos[i * 3 + 2] < centerZ - 100) pos[i * 3 + 2] = centerZ + 100;
                if (pos[i * 3] > centerX + 90) pos[i * 3] = centerX - 90;
                if (pos[i * 3] < centerX - 90) pos[i * 3] = centerX + 90;
            }
            this.snowPoints.geometry.attributes.position.needsUpdate = true;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleEngine;
}
