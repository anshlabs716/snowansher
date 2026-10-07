/**
 * ============================================================================
 * SNOW ANSHER 3D - 10 ULTRA-DETAILED 3D SLED FLEET & GARAGE SHOWROOM
 * Handcrafted high-performance sled models with procedural mechanical parts,
 * afterburner rocket nodes, underglow neon runners, aerodynamic fins, and stats.
 * ============================================================================
 */

const SledCollection = {
    sleds: [
        {
            id: 0,
            name: "Alpine Cruiser",
            category: "Classic",
            cost: 0,
            desc: "Traditional handcrafted racing toboggan. Lightweight, reliable, and perfectly balanced.",
            stats: { speed: 85, accel: 80, handling: 85, jump: 85, boost: 80 },
            colors: { primary: 0xd63031, secondary: 0x2d3436, accent: 0xffffff, glow: 0xff4757 }
        },
        {
            id: 1,
            name: "Neon Phantom",
            category: "Cyber",
            cost: 30,
            desc: "Experimental cyberpunk runner with ion rail accelerators and active aerodynamic spoilers.",
            stats: { speed: 95, accel: 90, handling: 92, jump: 88, boost: 95 },
            colors: { primary: 0x00d2ff, secondary: 0x0984e3, accent: 0x00ffff, glow: 0x00d2ff }
        },
        {
            id: 2,
            name: "Santa's Rocket",
            category: "Holiday",
            cost: 60,
            desc: "Festive turbo-charged royal sleigh with twin supercharged rocket afterburners.",
            stats: { speed: 92, accel: 98, handling: 82, jump: 96, boost: 98 },
            colors: { primary: 0xb71540, secondary: 0xf6b93b, accent: 0xffd32a, glow: 0xffb142 }
        },
        {
            id: 3,
            name: "Frostbite Apex",
            category: "Glacial",
            cost: 100,
            desc: "Chiseled from diamond-hard glacial permafrost. Slices through powder with zero friction.",
            stats: { speed: 100, accel: 88, handling: 98, jump: 92, boost: 90 },
            colors: { primary: 0x70a1ff, secondary: 0xffffff, accent: 0x5352ed, glow: 0x70a1ff }
        },
        {
            id: 4,
            name: "Hellfire Demon",
            category: "Infernal",
            cost: 150,
            desc: "Forged in volcanic depths. Matte obsidian chassis with searing plasma exhaust horns.",
            stats: { speed: 110, accel: 100, handling: 86, jump: 100, boost: 105 },
            colors: { primary: 0xff4757, secondary: 0x1e272e, accent: 0xffa502, glow: 0xff6348 }
        },
        {
            id: 5,
            name: "Quantum Levitator",
            category: "Anti-Gravity",
            cost: 220,
            desc: "Zero-contact magnetic levitation sled featuring a continuous spinning tachyon gyro core.",
            stats: { speed: 115, accel: 105, handling: 105, jump: 110, boost: 115 },
            colors: { primary: 0x9b59b6, secondary: 0x2c3e50, accent: 0x8e44ad, glow: 0xa55eea }
        },
        {
            id: 6,
            name: "Golden Emperor",
            category: "Royal",
            cost: 300,
            desc: "Solid 24-karat gold royal chariot with emerald-studded ski runners and velvet seating.",
            stats: { speed: 108, accel: 95, handling: 90, jump: 105, boost: 100 },
            colors: { primary: 0xf1c40f, secondary: 0x27ae60, accent: 0xffffff, glow: 0xf39c12 }
        },
        {
            id: 7,
            name: "Cyber Hoverblade",
            category: "Stealth",
            cost: 400,
            desc: "Razor-thin titanium hyper-glider inspired by stealth supersonic fighter jets.",
            stats: { speed: 125, accel: 110, handling: 110, jump: 115, boost: 120 },
            colors: { primary: 0x2f3542, secondary: 0x70a1ff, accent: 0x2ed573, glow: 0x2ed573 }
        },
        {
            id: 8,
            name: "Steampunk Express",
            category: "Vintage",
            cost: 500,
            desc: "High-pressure brass boiler with rotating steam cogs, copper piping, and pressure exhaust.",
            stats: { speed: 105, accel: 115, handling: 88, jump: 110, boost: 125 },
            colors: { primary: 0xd35400, secondary: 0x7f8c8d, accent: 0xe67e22, glow: 0xd35400 }
        },
        {
            id: 9,
            name: "Aurora Chaser",
            category: "Cosmic",
            cost: 650,
            desc: "Infused with spectral polar radiation. Leaves a dancing emerald and violet ribbon trail.",
            stats: { speed: 130, accel: 120, handling: 120, jump: 125, boost: 130 },
            colors: { primary: 0x1dd1a1, secondary: 0x5f27cd, accent: 0x48dbfb, glow: 0x10ac84 }
        }
    ],

    /**
     * Build procedural 3D model for specified sled ID
     */
    createSledMesh(id) {
        const data = this.sleds.find(s => s.id === id) || this.sleds[0];
        const group = new THREE.Group();
        group.name = `Sled_${data.name}`;

        const pMat = new THREE.MeshStandardMaterial({
            color: data.colors.primary,
            roughness: 0.35,
            metalness: 0.65
        });

        const sMat = new THREE.MeshStandardMaterial({
            color: data.colors.secondary,
            roughness: 0.5,
            metalness: 0.8
        });

        const aMat = new THREE.MeshStandardMaterial({
            color: data.colors.accent,
            roughness: 0.2,
            metalness: 0.95
        });

        const glowMat = new THREE.MeshBasicMaterial({ color: data.colors.glow });

        // Base Twin Ski Runners
        this.addRunners(group, aMat, glowMat);

        // Model-specific custom geometry
        switch (id) {
            case 0: // Alpine Cruiser
                this.buildAlpineBody(group, pMat, sMat);
                break;
            case 1: // Neon Phantom
                this.buildNeonPhantomBody(group, pMat, sMat, glowMat);
                break;
            case 2: // Santa's Rocket
                this.buildSantaSleighBody(group, pMat, sMat, aMat);
                break;
            case 3: // Frostbite Apex
                this.buildFrostbiteBody(group, pMat, sMat, glowMat);
                break;
            case 4: // Hellfire Demon
                this.buildHellfireBody(group, pMat, sMat, glowMat);
                break;
            case 5: // Quantum Levitator
                this.buildQuantumBody(group, pMat, sMat, glowMat);
                break;
            case 6: // Golden Emperor
                this.buildGoldenEmperorBody(group, pMat, sMat, aMat);
                break;
            case 7: // Cyber Hoverblade
                this.buildHoverbladeBody(group, pMat, sMat, glowMat);
                break;
            case 8: // Steampunk Express
                this.buildSteampunkBody(group, pMat, sMat, aMat);
                break;
            case 9: // Aurora Chaser
                this.buildAuroraChaserBody(group, pMat, sMat, glowMat);
                break;
            default:
                this.buildAlpineBody(group, pMat, sMat);
                break;
        }

        // Handlebars for rider grip
        this.addHandlebars(group, sMat);

        return { mesh: group, data };
    },

    addRunners(group, railMat, glowMat) {
        for (let side of [-1, 1]) {
            const runner = new THREE.Group();
            runner.position.set(side * 0.62, 0.08, 0);

            // Main rail
            const railGeo = new THREE.BoxGeometry(0.1, 0.06, 2.4);
            const railMesh = new THREE.Mesh(railGeo, railMat);
            runner.add(railMesh);

            // Upturned curved nose
            const noseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8);
            const noseMesh = new THREE.Mesh(noseGeo, railMat);
            noseMesh.rotation.x = Math.PI / 3.8;
            noseMesh.position.set(0, 0.14, -1.3);
            runner.add(noseMesh);

            // Underglow neon strip
            const glowGeo = new THREE.BoxGeometry(0.05, 0.02, 2.1);
            const glowMesh = new THREE.Mesh(glowGeo, glowMat);
            glowMesh.position.set(0, -0.02, 0);
            runner.add(glowMesh);

            group.add(runner);
        }

        // Cross struts
        for (let z of [-0.65, 0.65]) {
            const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.25, 8);
            const strut = new THREE.Mesh(strutGeo, railMat);
            strut.rotation.z = Math.PI / 2;
            strut.position.set(0, 0.18, z);
            group.add(strut);
        }
    },

    addHandlebars(group, mat) {
        const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8);
        const barMesh = new THREE.Mesh(barGeo, mat);
        barMesh.rotation.z = Math.PI / 2;
        barMesh.position.set(0, 0.68, -0.65);

        const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
        const stemMesh = new THREE.Mesh(stemGeo, mat);
        stemMesh.position.set(0, 0.45, -0.65);
        stemMesh.rotation.x = 0.2;

        group.add(barMesh);
        group.add(stemMesh);
    },

    buildAlpineBody(group, pMat, sMat) {
        const deckGeo = new THREE.BoxGeometry(1.05, 0.15, 2.1);
        const deck = new THREE.Mesh(deckGeo, pMat);
        deck.position.set(0, 0.25, 0);
        deck.castShadow = true;
        group.add(deck);

        const noseGeo = new THREE.ConeGeometry(0.55, 0.8, 4);
        const nose = new THREE.Mesh(noseGeo, pMat);
        nose.rotation.x = -Math.PI / 2;
        nose.rotation.y = Math.PI / 4;
        nose.position.set(0, 0.25, -1.25);
        nose.scale.set(1, 1, 0.35);
        group.add(nose);
    },

    buildNeonPhantomBody(group, pMat, sMat, glowMat) {
        const deckGeo = new THREE.BoxGeometry(1.15, 0.16, 2.3);
        const deck = new THREE.Mesh(deckGeo, pMat);
        deck.position.set(0, 0.25, 0);
        group.add(deck);

        // Twin aerodynamic rear spoilers
        for (let side of [-1, 1]) {
            const wingGeo = new THREE.BoxGeometry(0.12, 0.4, 0.6);
            const wing = new THREE.Mesh(wingGeo, sMat);
            wing.position.set(side * 0.55, 0.5, 0.85);
            wing.rotation.x = 0.3;
            group.add(wing);

            // Plasma thruster exhausts
            const thrusterGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.35, 10);
            const thruster = new THREE.Mesh(thrusterGeo, sMat);
            thruster.rotation.x = Math.PI / 2;
            thruster.position.set(side * 0.35, 0.28, 1.15);
            group.add(thruster);

            const plasmaGeo = new THREE.SphereGeometry(0.09, 8, 8);
            const plasma = new THREE.Mesh(plasmaGeo, glowMat);
            plasma.position.set(side * 0.35, 0.28, 1.32);
            group.add(plasma);
        }
    },

    buildSantaSleighBody(group, pMat, sMat, aMat) {
        // High curved crimson sidewalls with gold filigree
        const wallGeo = new THREE.BoxGeometry(0.1, 0.55, 2.0);
        for (let side of [-1, 1]) {
            const wall = new THREE.Mesh(wallGeo, pMat);
            wall.position.set(side * 0.55, 0.45, 0.1);
            group.add(wall);

            // Gold trim
            const trimGeo = new THREE.BoxGeometry(0.12, 0.08, 2.02);
            const trim = new THREE.Mesh(trimGeo, aMat);
            trim.position.set(side * 0.55, 0.72, 0.1);
            group.add(trim);
        }

        // Curved high backrest
        const backGeo = new THREE.BoxGeometry(1.1, 0.7, 0.12);
        const back = new THREE.Mesh(backGeo, pMat);
        back.position.set(0, 0.55, 1.05);
        group.add(back);

        // Giant Rocket Thruster
        const rocketGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.8, 12);
        const rocket = new THREE.Mesh(rocketGeo, aMat);
        rocket.rotation.x = Math.PI / 2;
        rocket.position.set(0, 0.4, 1.35);
        group.add(rocket);
    },

    buildFrostbiteBody(group, pMat, sMat, glowMat) {
        // Faceted crystalline diamond body
        const geo = new THREE.DodecahedronGeometry(0.85, 1);
        const mesh = new THREE.Mesh(geo, pMat);
        mesh.scale.set(0.7, 0.3, 1.6);
        mesh.position.set(0, 0.3, 0);
        group.add(mesh);

        // Floating crystalline ice spikes
        for (let i = 0; i < 4; i++) {
            const spikeGeo = new THREE.ConeGeometry(0.08, 0.5, 5);
            const spike = new THREE.Mesh(spikeGeo, glowMat);
            spike.position.set((i % 2 === 0 ? 1 : -1) * 0.5, 0.45, -0.4 + i * 0.35);
            spike.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.3;
            group.add(spike);
        }
    },

    buildHellfireBody(group, pMat, sMat, glowMat) {
        // Angular aggressive obsidian hull
        const deckGeo = new THREE.BoxGeometry(1.2, 0.2, 2.2);
        const deck = new THREE.Mesh(deckGeo, sMat);
        deck.position.set(0, 0.25, 0);
        group.add(deck);

        // Demon Ram Horns on front nose
        for (let side of [-1, 1]) {
            const hornGeo = new THREE.TorusGeometry(0.35, 0.08, 6, 12, Math.PI * 0.7);
            const horn = new THREE.Mesh(hornGeo, pMat);
            horn.position.set(side * 0.45, 0.45, -1.15);
            horn.rotation.y = -side * 0.4;
            horn.rotation.z = side * 0.5;
            group.add(horn);
        }

        // Lava glow exhaust vents
        const ventGeo = new THREE.BoxGeometry(0.8, 0.08, 0.4);
        const vent = new THREE.Mesh(ventGeo, glowMat);
        vent.position.set(0, 0.36, 0.85);
        group.add(vent);
    },

    buildQuantumBody(group, pMat, sMat, glowMat) {
        // Floating ring hull
        const ringGeo = new THREE.TorusGeometry(0.65, 0.12, 8, 20);
        const ring = new THREE.Mesh(ringGeo, sMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.32, 0);
        group.add(ring);

        // Tachyon energy core
        const coreGeo = new THREE.IcosahedronGeometry(0.28, 1);
        const core = new THREE.Mesh(coreGeo, glowMat);
        core.position.set(0, 0.35, 0);
        group.add(core);
    },

    buildGoldenEmperorBody(group, pMat, sMat, aMat) {
        const deckGeo = new THREE.BoxGeometry(1.15, 0.2, 2.2);
        const deck = new THREE.Mesh(deckGeo, pMat);
        deck.position.set(0, 0.25, 0);
        group.add(deck);

        // Emerald gemstone crest
        const gemGeo = new THREE.OctahedronGeometry(0.18, 0);
        const gem = new THREE.Mesh(gemGeo, sMat);
        gem.position.set(0, 0.48, -1.05);
        group.add(gem);
    },

    buildHoverbladeBody(group, pMat, sMat, glowMat) {
        // Stealth triangular jet wing
        const wingGeo = new THREE.ConeGeometry(1.3, 2.4, 3);
        const wing = new THREE.Mesh(wingGeo, pMat);
        wing.rotation.x = -Math.PI / 2;
        wing.rotation.z = Math.PI;
        wing.position.set(0, 0.24, 0);
        wing.scale.set(0.9, 0.12, 1.0);
        group.add(wing);

        // Wingtip lasers
        for (let side of [-1, 1]) {
            const tipGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
            const tip = new THREE.Mesh(tipGeo, glowMat);
            tip.rotation.x = Math.PI / 2;
            tip.position.set(side * 0.95, 0.25, 0.4);
            group.add(tip);
        }
    },

    buildSteampunkBody(group, pMat, sMat, aMat) {
        // Brass steam boiler
        const boilerGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 12);
        const boiler = new THREE.Mesh(boilerGeo, pMat);
        boiler.rotation.x = Math.PI / 2;
        boiler.position.set(0, 0.4, 0.2);
        group.add(boiler);

        // Chimney exhaust stack
        const stackGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.65, 8);
        const stack = new THREE.Mesh(stackGeo, sMat);
        stack.position.set(0, 0.85, -0.35);
        group.add(stack);
    },

    buildAuroraChaserBody(group, pMat, sMat, glowMat) {
        // Translucent aerodynamic wave body
        const deckGeo = new THREE.BoxGeometry(1.15, 0.15, 2.2);
        const deck = new THREE.Mesh(deckGeo, pMat);
        deck.position.set(0, 0.25, 0);
        group.add(deck);

        // Prismatic fin
        const finGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
        const fin = new THREE.Mesh(finGeo, glowMat);
        fin.position.set(0, 0.65, 0.65);
        fin.scale.set(0.2, 1.0, 1.2);
        group.add(fin);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SledCollection;
}
