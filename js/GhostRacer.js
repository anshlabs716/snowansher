/**
 * ============================================================================
 * SNOW ANSHER 3D - GHOST RACER TELEMETRY & REPLAY SYSTEM
 * Records the player's best run trajectory frame-by-frame (position, rotation,
 * jump state, tricks) and renders a luminous holographic ghost sled racing
 * down the slopes alongside the player, enabling direct personal best racing.
 * ============================================================================
 */

class GhostRacerSystem {
    constructor(scene) {
        this.scene = scene;
        this.isRecording = false;
        this.isPlaying = false;

        // Current run recorded samples: array of { t, x, y, z, rx, ry, rz, isAir, trick }
        this.currentRunTelemetry = [];
        this.bestRunTelemetry = [];

        // Ghost 3D Mesh
        this.ghostGroup = new THREE.Group();
        this.ghostGroup.visible = false;
        this.scene.add(this.ghostGroup);

        this.playbackTime = 0.0;
        this.playbackIndex = 0;

        this.buildGhostMesh();
        this.loadSavedBestTelemetry();
    }

    buildGhostMesh() {
        // Holographic translucent cyan materials
        const ghostMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.38,
            wireframe: false
        });

        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });

        // Ghost Sled Body
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.22, 2.2);
        const body = new THREE.Mesh(bodyGeo, ghostMat);
        const wire = new THREE.Mesh(bodyGeo, wireMat);
        this.ghostGroup.add(body, wire);

        // Ghost Runners
        for (let side of [-1, 1]) {
            const runnerGeo = new THREE.BoxGeometry(0.1, 0.08, 2.4);
            const runner = new THREE.Mesh(runnerGeo, ghostMat);
            runner.position.set(side * 0.62, -0.06, 0);
            this.ghostGroup.add(runner);
        }

        // Ghost Rider Silhouette
        const riderTorsoGeo = new THREE.BoxGeometry(0.6, 0.7, 0.45);
        const riderTorso = new THREE.Mesh(riderTorsoGeo, ghostMat);
        riderTorso.position.set(0, 0.55, 0.1);
        riderTorso.rotation.x = 0.4;
        this.ghostGroup.add(riderTorso);

        const riderHeadGeo = new THREE.SphereGeometry(0.24, 10, 10);
        const riderHead = new THREE.Mesh(riderHeadGeo, ghostMat);
        riderHead.position.set(0, 1.05, -0.15);
        this.ghostGroup.add(riderHead);

        // Hologram Light Beacon
        const beacon = new THREE.PointLight(0x00ffff, 1.2, 12);
        beacon.position.set(0, 1.0, 0);
        this.ghostGroup.add(beacon);
    }

    startRecording() {
        this.currentRunTelemetry = [];
        this.isRecording = true;
        this.playbackTime = 0.0;
        this.playbackIndex = 0;

        if (this.bestRunTelemetry.length > 5) {
            this.isPlaying = true;
            this.ghostGroup.visible = true;
        } else {
            this.isPlaying = false;
            this.ghostGroup.visible = false;
        }
    }

    recordSample(time, pos, rot, isGrounded, activeTrick = null) {
        if (!this.isRecording) return;

        // Sample at ~20Hz to preserve memory while remaining buttery smooth
        const lastSample = this.currentRunTelemetry[this.currentRunTelemetry.length - 1];
        if (lastSample && (time - lastSample.t < 0.045)) return;

        this.currentRunTelemetry.push({
            t: time,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            rx: rot.x,
            ry: rot.y,
            rz: rot.z,
            air: !isGrounded,
            trick: activeTrick
        });
    }

    stopAndSaveIfBest(distance, bestDistance) {
        this.isRecording = false;
        this.isPlaying = false;
        this.ghostGroup.visible = false;

        if (distance >= bestDistance && this.currentRunTelemetry.length > 10) {
            this.bestRunTelemetry = [...this.currentRunTelemetry];
            try {
                // Compress & store in localStorage
                const json = JSON.stringify(this.bestRunTelemetry);
                localStorage.setItem('sr3d_ghost_telemetry', json);
                console.log('❄️ Ghost telemetry updated with new personal best!');
            } catch (e) {
                console.warn('Ghost telemetry storage quota exceeded:', e);
            }
        }
    }

    loadSavedBestTelemetry() {
        try {
            const saved = localStorage.getItem('sr3d_ghost_telemetry');
            if (saved) {
                this.bestRunTelemetry = JSON.parse(saved);
                console.log(`❄️ Loaded ghost replay with ${this.bestRunTelemetry.length} telemetry frames`);
            }
        } catch (e) {
            console.warn('Error loading ghost telemetry:', e);
        }
    }

    updatePlayback(dt, currentTime) {
        if (!this.isPlaying || this.bestRunTelemetry.length < 2) return;

        this.playbackTime += dt;

        // Find telemetry frame corresponding to playback time
        while (
            this.playbackIndex < this.bestRunTelemetry.length - 2 &&
            this.bestRunTelemetry[this.playbackIndex + 1].t < this.playbackTime
        ) {
            this.playbackIndex++;
        }

        const p1 = this.bestRunTelemetry[this.playbackIndex];
        const p2 = this.bestRunTelemetry[this.playbackIndex + 1];

        if (p1 && p2) {
            const span = p2.t - p1.t;
            const alpha = span > 0 ? (this.playbackTime - p1.t) / span : 0;
            const clampedAlpha = THREE.MathUtils.clamp(alpha, 0, 1);

            // Smooth linear interpolation between telemetry keys
            this.ghostGroup.position.set(
                THREE.MathUtils.lerp(p1.x, p2.x, clampedAlpha),
                THREE.MathUtils.lerp(p1.y, p2.y, clampedAlpha),
                THREE.MathUtils.lerp(p1.z, p2.z, clampedAlpha)
            );

            this.ghostGroup.rotation.set(
                THREE.MathUtils.lerp(p1.rx, p2.rx, clampedAlpha),
                THREE.MathUtils.lerp(p1.ry, p2.ry, clampedAlpha),
                THREE.MathUtils.lerp(p1.rz, p2.rz, clampedAlpha)
            );
        } else if (p1) {
            this.ghostGroup.position.set(p1.x, p1.y, p1.z);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GhostRacerSystem;
}
