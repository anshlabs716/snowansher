/**
 * ============================================================================
 * SNOW ANSHER 3D - INTERACTIVE 3D GARAGE SHOWROOM & TURNTABLE STAGE
 * 360-degree turntable pedestal, dynamic studio spotlights, metallic reflection
 * highlights, camera inspection orbit, and radar stat comparison charts.
 * ============================================================================
 */

class InteractiveShowroom {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.stageGroup = new THREE.Group();
        this.stageGroup.visible = false;
        this.scene.add(this.stageGroup);

        this.turntableAngle = 0.0;
        this.isInspecting = false;
        this.zoomDistance = 8.5;
        this.activeSledMesh = null;

        this.buildStage();
    }

    buildStage() {
        // Pedestal base disc
        const baseGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.4, 32);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x1e272e,
            roughness: 0.25,
            metalness: 0.85
        });
        this.pedestal = new THREE.Mesh(baseGeo, baseMat);
        this.pedestal.position.set(0, -0.2, 0);
        this.stageGroup.add(this.pedestal);

        // Glowing neon rim on pedestal
        const rimGeo = new THREE.TorusGeometry(4.5, 0.06, 8, 48);
        const rimMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.02;
        this.stageGroup.add(rim);

        // Studio Spotlights
        this.spotlights = [];
        const spotColors = [0xffffff, 0x00d2ff, 0xffd166];
        for (let i = 0; i < 3; i++) {
            const spot = new THREE.SpotLight(spotColors[i], 2.8, 25, Math.PI / 4, 0.3);
            const angle = (i / 3) * Math.PI * 2;
            spot.position.set(Math.cos(angle) * 7.5, 8.5, Math.sin(angle) * 7.5);
            this.stageGroup.add(spot);
            this.spotlights.push(spot);
        }
    }

    enterShowroom(sledMesh) {
        this.isInspecting = true;
        this.stageGroup.visible = true;
        this.activeSledMesh = sledMesh;
        this.stageGroup.add(this.activeSledMesh);
        this.activeSledMesh.position.set(0, 0.25, 0);
    }

    exitShowroom() {
        this.isInspecting = false;
        this.stageGroup.visible = false;
    }

    update(dt) {
        if (!this.isInspecting || !this.activeSledMesh) return;

        // Smooth turntable rotation
        this.turntableAngle += 0.65 * dt;
        this.activeSledMesh.rotation.y = this.turntableAngle;

        // Spotlights target sled
        this.spotlights.forEach(spot => {
            spot.target = this.activeSledMesh;
        });

        // Orbit camera in showroom
        this.camera.position.x = Math.sin(this.turntableAngle * 0.4) * this.zoomDistance;
        this.camera.position.z = Math.cos(this.turntableAngle * 0.4) * this.zoomDistance;
        this.camera.position.y = 3.2;
        this.camera.lookAt(0, 0.8, 0);
    }

    drawStatRadar(canvas, stats) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw web rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 0.25; r <= 1.0; r += 0.25) {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * radius * r;
                const y = cy + Math.sin(angle) * radius * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Stat keys
        const statValues = [
            stats.speed / 130,
            stats.accel / 130,
            stats.handling / 130,
            stats.jump / 130,
            (stats.boost || 80) / 130
        ];

        // Fill stat polygon
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const r = Math.min(1.0, statValues[i]) * radius;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 210, 255, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#00d2ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveShowroom;
}
