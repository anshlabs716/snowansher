/**
 * ============================================================================
 * SNOW ANSHER 3D - PROCEDURAL ALPINE DECORATIONS & SCENERY ENGINE
 * Frozen cascading waterfalls, wooden snow fence barriers, trail signposts,
 * glowing festive string fairy lights, snowman families, and crystal stalagmites.
 * ============================================================================
 */

class ProceduralDecorations {
    constructor(scene) {
        this.scene = scene;
        this.decorations = [];
    }

    /**
     * Wooden Mountain Trail Signpost
     */
    createSignpost(x, y, z, text = "ALPINE RUN") {
        const group = new THREE.Group();

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.2, 6);
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.y = 1.6;
        group.add(post);

        // Signboard
        const boardGeo = new THREE.BoxGeometry(2.4, 0.8, 0.12);
        const board = new THREE.Mesh(boardGeo, woodMat);
        board.position.set(0, 2.6, 0);
        group.add(board);

        // Signpost Text Canvas Texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(0, 0, 256, 80);
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 26px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 50);

        const tex = new THREE.CanvasTexture(canvas);
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 0.7),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        textMesh.position.set(0, 2.6, 0.08);
        group.add(textMesh);

        group.position.set(x, y, z);
        this.scene.add(group);
        this.decorations.push(group);
    }

    /**
     * Alpine Wooden Snow Fence Barrier
     */
    createSnowFence(x, y, z, length = 20) {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.95 });

        // Horizontal rails
        for (let r = 0; r < 2; r++) {
            const railGeo = new THREE.BoxGeometry(0.1, 0.18, length);
            const rail = new THREE.Mesh(railGeo, woodMat);
            rail.position.set(0, 0.6 + r * 0.7, -length * 0.5);
            group.add(rail);
        }

        // Vertical posts
        for (let pz = 0; pz <= length; pz += 4) {
            const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 6);
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(0, 0.9, -pz);
            group.add(post);
        }

        group.position.set(x, y, z);
        this.scene.add(group);
        this.decorations.push(group);
    }

    /**
     * Glowing Festive Fairy String Lights
     */
    createStringLights(x1, y1, z1, x2, y2, z2, count = 12) {
        const group = new THREE.Group();
        const colors = [0xff4757, 0x2ed573, 0xffd166, 0x00d2ff, 0xff6b81];

        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const x = THREE.MathUtils.lerp(x1, x2, t);
            const y = THREE.MathUtils.lerp(y1, y2, t) - Math.sin(t * Math.PI) * 1.5; // catenary sag
            const z = THREE.MathUtils.lerp(z1, z2, t);

            const bulbMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), bulbMat);
            bulb.position.set(x, y, z);
            group.add(bulb);
        }

        this.scene.add(group);
        this.decorations.push(group);
    }

    clear() {
        this.decorations.forEach(d => this.scene.remove(d));
        this.decorations.length = 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProceduralDecorations;
}
