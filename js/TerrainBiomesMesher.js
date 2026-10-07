/**
 * ============================================================================
 * SNOW ANSHER 3D - PROCEDURAL ALPINE ARCHITECTURE & GLACIAL TUNNELS
 * Generates 3D glacial ice tunnels, frozen chasm bridges with glowing icicles,
 * snow cornices, natural halfpipe ramps, and alpine cliff rockfaces.
 * ============================================================================
 */

class TerrainBiomesMesher {
    constructor(scene) {
        this.scene = scene;
        this.activeStructures = [];
    }

    /**
     * Create an Ice Cave / Glacier Tunnel that players can slide through
     */
    createGlacierTunnel(x, y, z, length = 60, radius = 9) {
        const group = new THREE.Group();

        // Curved archway tunnel
        const archGeo = new THREE.CylinderGeometry(radius, radius, length, 16, 1, true, 0, Math.PI);
        const archMat = new THREE.MeshStandardMaterial({
            color: 0x74b9ff,
            roughness: 0.25,
            metalness: 0.15,
            side: THREE.DoubleSide
        });

        const arch = new THREE.Mesh(archGeo, archMat);
        arch.rotation.x = Math.PI / 2;
        arch.position.set(0, radius * 0.4, -length * 0.5);
        group.add(arch);

        // Hanging Icicles inside tunnel
        const icicleMat = new THREE.MeshBasicMaterial({ color: 0xdff9fb, transparent: true, opacity: 0.85 });
        for (let iz = -5; iz > -length + 5; iz -= 6) {
            for (let side of [-radius * 0.7, 0, radius * 0.7]) {
                const icicleGeo = new THREE.ConeGeometry(0.2, 1.8, 5);
                const icicle = new THREE.Mesh(icicleGeo, icicleMat);
                icicle.position.set(side, radius * 0.85, iz);
                group.add(icicle);
            }
        }

        // Interior Glacial Glow Light
        const glow = new THREE.PointLight(0x00d2ff, 1.5, 35);
        glow.position.set(0, 4, -length * 0.5);
        group.add(glow);

        group.position.set(x, y, z);
        this.scene.add(group);
        this.activeStructures.push(group);
        return group;
    }

    /**
     * Create a High Frozen Mountain Bridge over a deep chasm
     */
    createChasmBridge(x, y, z, span = 35) {
        const group = new THREE.Group();

        // Wooden Plank Deck
        const deckGeo = new THREE.BoxGeometry(10, 0.4, span);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.set(0, 0.2, -span * 0.5);
        group.add(deck);

        // Suspension Rope Cables
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
        for (let side of [-4.8, 4.8]) {
            const ropeGeo = new THREE.CylinderGeometry(0.08, 0.08, span, 6);
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            rope.rotation.x = Math.PI / 2;
            rope.position.set(side, 1.5, -span * 0.5);
            group.add(rope);

            // Vertical Cable Struts
            for (let dz = 0; dz < span; dz += 5) {
                const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 4);
                const strut = new THREE.Mesh(strutGeo, ropeMat);
                strut.position.set(side, 0.85, -dz);
                group.add(strut);
            }
        }

        group.position.set(x, y, z);
        this.scene.add(group);
        this.activeStructures.push(group);
        return group;
    }

    clear() {
        this.activeStructures.forEach(s => this.scene.remove(s));
        this.activeStructures.length = 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerrainBiomesMesher;
}
