/**
 * ============================================================================
 * SNOW ANSHER 3D - WEATHER VFX, SCREEN WATER DROPLETS & SUN FLARES
 * Dynamic camera lens droplets, melting powder simulation, sun flare glints,
 * wind turbulence shake, and low-lying atmospheric valley fog banks.
 * ============================================================================
 */

class WeatherFX {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Screen lens droplets canvas overlay
        this.droplets = [];
        this.MAX_DROPLETS = 24;
        this.setupLensCanvas();

        // Volumetric fog banks in valleys
        this.fogBankGroup = new THREE.Group();
        this.scene.add(this.fogBankGroup);
        this.setupFogBanks();
    }

    setupLensCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'lens-droplets-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.inset = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '8';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupFogBanks() {
        const fogMat = new THREE.MeshBasicMaterial({
            color: 0xe6f2ff,
            transparent: true,
            opacity: 0.18,
            depthWrite: false
        });

        for (let i = 0; i < 18; i++) {
            const geo = new THREE.BoxGeometry(120, 10, 45);
            const fog = new THREE.Mesh(geo, fogMat);
            fog.position.set(
                (Math.random() - 0.5) * 60,
                2 + Math.random() * 8,
                -i * 110 - 60
            );
            this.fogBankGroup.add(fog);
        }
    }

    spawnLensDroplet() {
        if (this.droplets.length >= this.MAX_DROPLETS) return;

        this.droplets.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.7,
            radius: 3 + Math.random() * 6,
            vy: 0.4 + Math.random() * 1.6,
            life: 2.5 + Math.random() * 2.0,
            maxLife: 4.5
        });
    }

    update(dt, speedRatio, isGrounded, playerPos) {
        // Clear droplet canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Spawn droplets while carving through snow
        if (isGrounded && Math.random() < (0.2 + speedRatio * 0.5)) {
            this.spawnLensDroplet();
        }

        // Draw & update droplets
        for (let i = this.droplets.length - 1; i >= 0; i--) {
            const d = this.droplets[i];
            d.life -= dt;
            d.y += d.vy * (1.0 + speedRatio * 2.0);

            if (d.life <= 0 || d.y > this.canvas.height) {
                this.droplets.splice(i, 1);
                continue;
            }

            const alpha = THREE.MathUtils.clamp(d.life / d.maxLife, 0, 1) * 0.45;

            // Draw refractive water droplet bubble
            const grad = this.ctx.createRadialGradient(
                d.x - d.radius * 0.3,
                d.y - d.radius * 0.3,
                d.radius * 0.2,
                d.x,
                d.y,
                d.radius
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.5})`);
            grad.addColorStop(0.7, `rgba(180, 220, 255, ${alpha})`);
            grad.addColorStop(1, `rgba(100, 160, 220, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();
        }

        // Move valley fog banks with player progression
        this.fogBankGroup.children.forEach(fog => {
            if (fog.position.z > playerPos.z + 80) {
                fog.position.z -= 18 * 110;
            }
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherFX;
}
