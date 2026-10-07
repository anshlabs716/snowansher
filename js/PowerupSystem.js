/**
 * ============================================================================
 * SNOW ANSHER 3D - POWER-UP INVENTORY & 3D ENERGY AURA ENGINE
 * Shields, Gift Magnet, Hyper Rocket Boost, Slow-Motion Frost, and 2x Multiplier.
 * Includes interactive 3D energy shield mesh, magnetic attraction physics, and HUD gauges.
 * ============================================================================
 */

class PowerupSystem {
    constructor(scene, playerRoot) {
        this.scene = scene;
        this.playerRoot = playerRoot;

        // Active powerup timers
        this.active = {
            shield: false,
            magnet: 0,      // remaining seconds
            rocket: 0,
            slowmo: 0,
            multiplier: 0
        };

        this.durations = {
            magnet: 12.0,
            rocket: 6.0,
            slowmo: 8.0,
            multiplier: 15.0
        };

        this.setupVisualAuras();
    }

    setupVisualAuras() {
        // 1. Hexagonal Energy Shield Bubble
        const shieldGeo = new THREE.SphereGeometry(2.4, 20, 20);
        this.shieldMat = new THREE.MeshBasicMaterial({
            color: 0x38ada9,
            transparent: true,
            opacity: 0.0,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
        this.shieldMesh.visible = false;
        this.playerRoot.add(this.shieldMesh);

        // 2. Magnetic Attraction Field Rings
        this.magnetGroup = new THREE.Group();
        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(1.6 + i * 0.4, 0.04, 6, 24);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.6 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            this.magnetGroup.add(ring);
        }
        this.magnetGroup.visible = false;
        this.playerRoot.add(this.magnetGroup);

        // 3. Hyper Rocket Booster Flames
        this.rocketFlames = new THREE.Group();
        for (let side of [-0.65, 0.65]) {
            const coneGeo = new THREE.ConeGeometry(0.28, 1.4, 8);
            const coneMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.rotation.x = -Math.PI / 2;
            cone.position.set(side, 0.35, 1.6);
            this.rocketFlames.add(cone);
        }
        this.rocketFlames.visible = false;
        this.playerRoot.add(this.rocketFlames);
    }

    activate(type, audioEngine = null) {
        if (type === 'shield') {
            this.active.shield = true;
            this.shieldMesh.visible = true;
            this.shieldMat.opacity = 0.65;
        } else {
            this.active[type] = this.durations[type] || 10.0;
            if (type === 'magnet') this.magnetGroup.visible = true;
            if (type === 'rocket') this.rocketFlames.visible = true;
        }

        if (audioEngine) {
            audioEngine.playPowerupPickup(type);
        }
    }

    /**
     * Consume shield upon crash impact
     */
    consumeShield() {
        if (!this.active.shield) return false;
        this.active.shield = false;
        this.shieldMesh.visible = false;
        this.shieldMat.opacity = 0;
        return true;
    }

    hasActive(type) {
        if (type === 'shield') return this.active.shield;
        return (this.active[type] > 0);
    }

    update(dt, playerPos, giftsList) {
        // Animate Shield Bubble
        if (this.active.shield) {
            this.shieldMesh.rotation.y += 1.5 * dt;
            this.shieldMesh.rotation.x += 0.8 * dt;
            this.shieldMat.opacity = 0.5 + Math.sin(Date.now() * 0.008) * 0.2;
        }

        // Magnet attraction physics (pull gifts within 35m)
        if (this.active.magnet > 0) {
            this.active.magnet -= dt;
            this.magnetGroup.rotation.y += 3.0 * dt;

            giftsList.forEach(gift => {
                if (!gift.collected) {
                    const dx = playerPos.x - gift.pos.x;
                    const dy = playerPos.y - gift.pos.y;
                    const dz = playerPos.z - gift.pos.z;
                    const distSq = dx * dx + dz * dz;

                    if (distSq < 35 * 35) {
                        const dist = Math.sqrt(distSq) + 0.1;
                        const pullSpeed = 48.0;
                        gift.pos.x += (dx / dist) * pullSpeed * dt;
                        gift.pos.y += (dy / dist) * pullSpeed * dt;
                        gift.pos.z += (dz / dist) * pullSpeed * dt;
                        gift.mesh.position.copy(gift.pos);
                    }
                }
            });

            if (this.active.magnet <= 0) this.magnetGroup.visible = false;
        }

        // Rocket Boost Flames
        if (this.active.rocket > 0) {
            this.active.rocket -= dt;
            this.rocketFlames.children.forEach(flame => {
                flame.scale.z = 1.0 + Math.random() * 0.8;
                flame.scale.x = 0.8 + Math.random() * 0.4;
            });
            if (this.active.rocket <= 0) this.rocketFlames.visible = false;
        }

        // Slow-Mo timer
        if (this.active.slowmo > 0) {
            this.active.slowmo -= dt;
        }

        // Multiplier timer
        if (this.active.multiplier > 0) {
            this.active.multiplier -= dt;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PowerupSystem;
}
