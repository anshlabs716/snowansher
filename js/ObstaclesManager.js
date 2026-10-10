/**
 * ============================================================================
 * SNOW ANSHER 3D - PROCEDURAL OBSTACLES, RAMPS & INTERACTIVE HAZARDS
 * High-speed hazard streaming, collision physics bounding volumes,
 * rolling avalanche boulders, mega ramps, rainbow grind rails, and powerups.
 * ============================================================================
 */

class ObstaclesManager {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;

        this.obstacles = [];
        this.ramps = [];
        this.grindRails = [];
        this.boostPads = [];
        this.gifts = [];
        this.powerups = [];

        this.TRACK_WIDTH = 58;
        this.SLOPE_ANGLE = 0.075;

        // Terrain sampler so obstacles can sit on the real ground surface instead of
        // a guessed spawn height. Assigned by the game so it stays in sync with
        // GamePhysics.getGroundHeightAt (single source of truth for terrain height).
        this.getGroundHeightAt = null;

        // Shared flat-shaded low-poly forest materials (Snow Rider palette)
        this.matPineFoliage = new THREE.MeshStandardMaterial({ color: 0xc98a66, roughness: 0.9, metalness: 0.0, flatShading: true });
        this.matPineSnow = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65, metalness: 0.0, flatShading: true });
        this.matPineTrunk = new THREE.MeshStandardMaterial({ color: 0x8b5e46, roughness: 0.95, metalness: 0.0, flatShading: true });
        this.matBark = new THREE.MeshStandardMaterial({ color: 0x9c6b52, roughness: 0.95, metalness: 0.0, flatShading: true });

        // Dark grey rock palette (real rock tones — darker than snow, reads as lethal)
        this.matRockDark = new THREE.MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.95, metalness: 0.0, flatShading: true });
        this.matRock = new THREE.MeshStandardMaterial({ color: 0x61666c, roughness: 0.95, metalness: 0.0, flatShading: true });
    }

    clearAll() {
        const removeGroup = (list) => {
            list.forEach(item => {
                if (item.mesh) this.scene.remove(item.mesh);
            });
            list.length = 0;
        };

        removeGroup(this.obstacles);
        removeGroup(this.ramps);
        removeGroup(this.grindRails);
        removeGroup(this.boostPads);
        removeGroup(this.gifts);
        removeGroup(this.powerups);
    }

    // ─── PROCEDURAL HAZARD BUILDERS ───

    /**
     * Low-poly flat-shaded salmon-brown snow pine (Snow Rider style)
     */
    createPineTree(x, y, z) {
        const group = new THREE.Group();
        const scale = 1.2 + Math.random() * 1.1;

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.26 * scale, 0.42 * scale, 2.6 * scale, 6);
        const trunk = new THREE.Mesh(trunkGeo, this.matPineTrunk);
        trunk.position.y = 1.3 * scale;
        trunk.castShadow = this.config.graphics === 'ultra';
        group.add(trunk);

        // 3 flat-shaded foliage tiers, each capped with a thick white snow blanket
        for (let tier = 0; tier < 3; tier++) {
            const rad = (2.9 - tier * 0.6) * scale;
            const height = 1.6 * scale;

            const coneGeo = new THREE.ConeGeometry(rad, height, 6);
            const cone = new THREE.Mesh(coneGeo, this.matPineFoliage);
            cone.position.y = (2.4 + tier * 1.15) * scale;
            cone.castShadow = this.config.graphics === 'ultra';
            group.add(cone);

            const snowGeo = new THREE.ConeGeometry(rad * 0.9, height * 0.5, 6);
            const snowCap = new THREE.Mesh(snowGeo, this.matPineSnow);
            snowCap.position.y = (2.82 + tier * 1.15) * scale;
            group.add(snowCap);
        }

        group.position.set(x, y, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        group.rotation.z = (Math.random() - 0.5) * 0.06;

        this.scene.add(group);
        this.obstacles.push({
            mesh: group,
            type: 'tree',
            radius: 1.3 * scale,
            height: 5.7 * scale,
            pos: group.position,
            passed: false
        });
    }

    /**
     * Bare deciduous tree with angular upward-branching limbs (low-poly winter look)
     */
    createBareTree(x, y, z) {
        const group = new THREE.Group();
        const scale = 1.1 + Math.random() * 0.9;

        // Main trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.55 * scale, 6.5 * scale, 6);
        const trunk = new THREE.Mesh(trunkGeo, this.matBark);
        trunk.position.y = 3.25 * scale;
        trunk.castShadow = this.config.graphics === 'ultra';
        group.add(trunk);

        // Angular branches splayed outward from the upper trunk
        const branchCount = 5;
        for (let b = 0; b < branchCount; b++) {
            const pivot = new THREE.Group();
            pivot.position.y = (3.6 + b * 0.6) * scale;
            pivot.rotation.y = b * 2.4 + Math.random() * 0.9;

            const len = (3.4 - b * 0.4) * scale;
            const tilt = 0.85 + Math.random() * 0.35;

            const branchGeo = new THREE.CylinderGeometry(0.05 * scale, 0.16 * scale, len, 5);
            const branch = new THREE.Mesh(branchGeo, this.matBark);
            branch.rotation.z = tilt;
            // Seat the branch base exactly on the trunk (pivot point)
            branch.position.set(-Math.sin(tilt) * len * 0.5, Math.cos(tilt) * len * 0.5, 0);
            pivot.add(branch);
            group.add(pivot);
        }

        // Central crown twig
        const crownGeo = new THREE.CylinderGeometry(0.03 * scale, 0.12 * scale, 2.4 * scale, 5);
        const crown = new THREE.Mesh(crownGeo, this.matBark);
        crown.position.y = 7.2 * scale;
        group.add(crown);

        group.position.set(x, y, z);
        group.rotation.y = Math.random() * Math.PI * 2;

        this.scene.add(group);
        this.obstacles.push({
            mesh: group,
            type: 'tree',
            radius: 1.0 * scale,
            height: 8.2 * scale,
            pos: group.position,
            passed: false
        });
    }

    /**
     * Giant Tumbling Rolling Snow Boulder
     */
    createRollingBoulder(x, y, z) {
        const size = 1.9 + Math.random() * 1.1;
        const geo = new THREE.DodecahedronGeometry(size, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xedf2f7,
            roughness: 0.85,
            flatShading: true
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + size, z);
        mesh.castShadow = this.config.graphics === 'ultra';
        this.scene.add(mesh);

        this.obstacles.push({
            mesh: mesh,
            type: 'boulder',
            radius: size * 0.95,
            height: size * 1.5, // collision top ≈ visible top, so jumps that LOOK clear DO clear
            pos: mesh.position,
            rolling: true,
            rollSpeed: 4.0 + Math.random() * 3.5,
            driftX: (Math.random() - 0.5) * 7.5,
            passed: false
        });
    }

    /**
     * 3-Tier Snowman with Top Hat, Carrot, and Flapping Scarf
     */
    createSnowman(x, y, z) {
        const group = new THREE.Group();
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xf7f9fc, roughness: 0.7 });
        const coalMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.95 });
        const carrotMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5 });
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
        const scarfMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.65 });

        // Base, Torso, Head
        const b1 = new THREE.Mesh(new THREE.SphereGeometry(1.25, 12, 12), snowMat);
        b1.position.y = 1.15;
        const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), snowMat);
        b2.position.y = 2.55;
        const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), snowMat);
        b3.position.y = 3.65;

        // Coal eyes & smile
        for (let side of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), coalMat);
            eye.position.set(side * 0.18, 3.75, -0.55);
            group.add(eye);
        }

        // Carrot nose
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), carrotMat);
        carrot.rotation.x = Math.PI / 2;
        carrot.position.set(0, 3.65, -0.65);
        group.add(carrot);

        // Top Hat
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 12), hatMat);
        brim.position.y = 4.1;
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.65, 12), hatMat);
        crown.position.y = 4.45;
        group.add(brim, crown);

        // Winter Scarf
        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 6, 14), scarfMat);
        scarf.rotation.x = Math.PI / 2;
        scarf.position.set(0, 3.2, 0);
        group.add(scarf);

        group.add(b1, b2, b3);
        group.position.set(x, y, z);
        this.scene.add(group);

        this.obstacles.push({
            mesh: group,
            type: 'snowman',
            radius: 1.3,
            height: 4.8,
            pos: group.position,
            passed: false
        });
    }

    /**
     * Dark grey rock cluster — rare but lethal hazard (jump or dodge)
     */
    createRock(x, y, z) {
        const group = new THREE.Group();
        const chunkCount = 1 + Math.floor(Math.random() * 2);
        let top = 0;
        let spread = 0;

        for (let c = 0; c < chunkCount; c++) {
            const size = 0.9 + Math.random() * 1.1;
            const geo = new THREE.DodecahedronGeometry(size, 0);
            const rock = new THREE.Mesh(geo, Math.random() < 0.5 ? this.matRockDark : this.matRock);
            const ox = (Math.random() - 0.5) * 2.6;
            const oz = (Math.random() - 0.5) * 2.6;
            rock.position.set(ox, size * 0.55, oz);
            rock.scale.set(1.0, 0.72, 0.9 + Math.random() * 0.25); // squat, weathered boulder
            rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
            rock.castShadow = this.config.graphics === 'ultra';
            group.add(rock);

            top = Math.max(top, size * 0.55 + size * 0.72);
            spread = Math.max(spread, Math.abs(ox) + size);
        }

        group.position.set(x, y, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(group);

        this.obstacles.push({
            mesh: group,
            type: 'rock',
            radius: Math.min(spread, 2.6),
            height: top,
            pos: group.position,
            passed: false
        });
    }

    /**
     * Mega Ski Jump Ramps with high launch power for massive airtime
     */
    createMegaRamp(x, y, z, isMega = false, groundFn = null) {
        const group = new THREE.Group();
        const rampWidth = isMega ? 14.0 : 9.5;
        const rampLength = isMega ? 12.0 : 8.5;
        const rampHeight = isMega ? 4.2 : 2.8;

        // Ramps used to be placed at a flat spawn height, which left them hovering
        // above (or sunk into) the slope, and they never looked like they rested on
        // anything. Sit them on the actual terrain height at their footprint instead,
        // then raise them by their own height so the base is flush with the ground.
        const sampleZ = z + (isMega ? -rampLength * 0.35 : -rampLength * 0.35);
        let baseY = y;
        if (typeof groundFn === 'function') {
            const zBack = z + rampLength * 0.5;
            const zFront = z - rampLength * 0.5;
            baseY = Math.max(groundFn(x, zBack), groundFn(x, zFront));
        }

        // Timber wood frame
        const frameGeo = new THREE.BoxGeometry(rampWidth, 0.4, rampLength);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.85 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.rotation.x = isMega ? 0.38 : 0.32;
        frame.position.set(0, rampHeight * 0.5, 0);

        // Snow packed kicker lip
        const snowGeo = new THREE.BoxGeometry(rampWidth - 0.2, 0.35, rampLength);
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const snowTop = new THREE.Mesh(snowGeo, snowMat);
        snowTop.position.set(0, 0.25, 0);
        frame.add(snowTop);

        // Glowing launch chevrons
        const chevronGeo = new THREE.BoxGeometry(rampWidth, 0.06, 0.6);
        const chevronMat = new THREE.MeshBasicMaterial({ color: isMega ? 0xff4757 : 0xf1c40f });
        const chevron = new THREE.Mesh(chevronGeo, chevronMat);
        chevron.position.set(0, 0.45, rampLength * 0.45);
        frame.add(chevron);

        group.add(frame);
        group.position.set(x, baseY, z);
        this.scene.add(group);

        this.ramps.push({
            mesh: group,
            width: rampWidth,
            length: rampLength,
            boostPower: isMega ? 46 : 34, // Big obvious kicker launch (≈25m / ≈14m apex) — clearly above a normal jump
            pos: group.position
        });
    }

    /**
     * Cliff-clearing ramp: a very long, steep kicker whose lip is high enough to
     * carry the sled across a chasm it could never clear on the flat.
     *
     * Unlike createMegaRamp this one does NOT need to touch the ground — a cliff gap
     * means the takeoff point is genuinely elevated — but its base is still pinned to
     * the terrain at its own footing so it never looks like it is hovering.
     */
    createCliffJumpRamp(x, y, z, groundFn = null, scale = 1.0) {
        const group = new THREE.Group();
        const rampWidth = 22.0 * scale;
        const rampLength = 48.0 * scale;
        const rampHeight = 13.0 * scale; // Oversized kicker built to clear the deep chasm

        // Support legs so the ramp reads as built structure, not a floating slab.
        const legMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        [-0.34, 0.02, 0.34].forEach(t => {
            const legH = Math.max(1.2, rampHeight * (0.9 - t));
            const legGeo = new THREE.BoxGeometry(rampWidth * 0.14, legH, rampWidth * 0.14);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(rampWidth * 0.32, legH * 0.5 - rampHeight * 0.1, rampLength * t);
            leg.castShadow = this.config && this.config.graphics === 'ultra';
            group.add(leg);
        });

        // Timber deck - less steep launch angle (0.35 vs 0.46)
        const frameGeo = new THREE.BoxGeometry(rampWidth, 0.55, rampLength);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.85 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.rotation.x = 0.35; // Reduced from 0.46 for less height
        frame.position.set(0, rampHeight * 0.5, 0);
        frame.castShadow = this.config && this.config.graphics === 'ultra';
        group.add(frame);

        // Snow-packed launch surface
        const snowGeo = new THREE.BoxGeometry(rampWidth - 0.3, 0.4, rampLength - 0.3);
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const snowTop = new THREE.Mesh(snowGeo, snowMat);
        snowTop.position.set(0, 0.3, 0);
        frame.add(snowTop);

        // Warning chevrons up the face
        const chevMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
        for (let i = 0; i < 4; i++) {
            const chevGeo = new THREE.BoxGeometry(rampWidth * 0.9, 0.07, 0.7);
            const chev = new THREE.Mesh(chevGeo, chevMat);
            chev.position.set(0, 0.52, rampLength * (0.18 + i * 0.16));
            frame.add(chev);
        }

        // Pin the uphill footing to the actual snow surface and keep the deck
        // from floating above it.
        let baseY = y;
        if (typeof groundFn === 'function') {
            baseY = groundFn(x, z + rampLength * 0.5) - rampHeight * 0.5;
        }

        group.position.set(x, baseY, z);
        this.scene.add(group);

        // Strong launch for the 60 m-deep, 70 m-long cliff crossing.
        const boost = Math.round(58 * scale);
        this.ramps.push({
            mesh: group,
            width: rampWidth,
            length: rampLength,
            boostPower: boost,
            isCliffJumper: true,
            pos: group.position
        });
        this.cliffRamps = this.cliffRamps || [];
        this.cliffRamps.push(group);
    }

    /**
     * Rainbow Ice Grind Rail
     */
    createGrindRail(x, y, z, length = 45) {
        const group = new THREE.Group();

        // Curved steel/rainbow rail pipe
        const railGeo = new THREE.CylinderGeometry(0.18, 0.18, length, 12);
        const railMat = new THREE.ShaderMaterial({
            vertexShader: SnowShaders.RainbowRailShader.vertexShader,
            fragmentShader: SnowShaders.RainbowRailShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(SnowShaders.RainbowRailShader.uniforms)
        });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.rotation.x = Math.PI / 2 - this.SLOPE_ANGLE;
        rail.position.set(0, 1.8, -length * 0.5);
        group.add(rail);

        // Support vertical posts
        const postMat = new THREE.MeshStandardMaterial({ color: 0x34495e, metalness: 0.8, roughness: 0.3 });
        for (let dz = 0; dz < length; dz += 10) {
            const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 8);
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(0, 0.9, -dz);
            group.add(post);
        }

        group.position.set(x, y, z);
        this.scene.add(group);

        this.grindRails.push({
            mesh: group,
            railMesh: rail,
            width: 2.2,
            length: length,
            pos: group.position
        });
    }

    /**
     * Glowing Speed Booster Chevron Pad
     */
    createBoostPad(x, y, z) {
        const group = new THREE.Group();
        const padGeo = new THREE.BoxGeometry(8.0, 0.16, 6.5);
        const padMat = new THREE.MeshStandardMaterial({
            color: 0x00d2ff,
            emissive: 0x00d2ff,
            emissiveIntensity: 0.65,
            roughness: 0.2
        });
        const pad = new THREE.Mesh(padGeo, padMat);

        // 3 Glowing Arrow Chevrons
        for (let i = -1; i <= 1; i++) {
            const arrowGeo = new THREE.ConeGeometry(0.9, 1.8, 3);
            const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.rotation.x = -Math.PI / 2;
            arrow.position.set(0, 0.14, i * 1.8);
            pad.add(arrow);
        }

        group.add(pad);
        group.position.set(x, y + 0.1, z);
        this.scene.add(group);

        this.boostPads.push({
            mesh: group,
            width: 8.0,
            length: 6.5,
            boostSpeed: 48,
            pos: group.position
        });
    }

    /**
     * Collectible Holiday Gift Box
     */
    createGiftBox(x, y, z) {
        const group = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0xff4757,
            metalness: 0.5,
            roughness: 0.3
        });
        const box = new THREE.Mesh(boxGeo, boxMat);

        const ribMat = new THREE.MeshStandardMaterial({
            color: 0xffd166,
            metalness: 0.85,
            roughness: 0.2
        });
        const rib1 = new THREE.Mesh(new THREE.BoxGeometry(2.18, 2.18, 0.42), ribMat);
        const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.18, 2.18), ribMat);
        box.add(rib1, rib2);

        // Bow knot
        const bow = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), ribMat);
        bow.position.y = 1.25;
        box.add(bow);

        group.add(box);
        group.position.set(x, y + 1.8, z);
        this.scene.add(group);

        this.gifts.push({
            mesh: group,
            pos: group.position,
            collected: false
        });
    }

    /**
     * Power-Up Capsule Orb (Shield, Magnet, Rocket, Multiplier)
     */
    createPowerupOrb(x, y, z, type = 'shield') {
        const group = new THREE.Group();

        const colorMap = {
            shield: 0x38ada9,
            magnet: 0x9b59b6,
            rocket: 0xe74c3c,
            multiplier: 0xf1c40f
        };

        const orbColor = colorMap[type] || 0x00d2ff;

        // Glowing outer shield sphere
        const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: orbColor,
            transparent: true,
            opacity: 0.65
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphere);

        // Rotating inner geometric core
        const coreGeo = new THREE.OctahedronGeometry(0.6, 0);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: orbColor,
            emissiveIntensity: 0.8
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        group.position.set(x, y + 2.0, z);
        this.scene.add(group);

        this.powerups.push({
            mesh: group,
            core: core,
            type: type,
            pos: group.position,
            collected: false
        });
    }

    /**
     * Update obstacles, handle rolling boulders and cleanup old objects
     */
    update(dt, playerPos) {
        // Update rolling boulders
        this.obstacles.forEach(obj => {
            if (obj.rolling) {
                obj.mesh.rotation.x += obj.rollSpeed * dt;
                obj.pos.x += obj.driftX * dt;
                if (Math.abs(obj.pos.x) > this.TRACK_WIDTH * 0.44) {
                    obj.driftX = -obj.driftX;
                }
            }
        });

        // Rotate gifts and powerups in place.
        // They used to bob on a sine wave, which moved the collision mesh while the
        // pickup test sampled pos.y — so the visual and the hitbox drifted apart and
        // near-misses felt unfair. Spin only; y stays exactly where it was spawned.
        this.gifts.forEach(g => {
            g.mesh.rotation.y += 2.2 * dt;
            g.mesh.position.y = g.pos.y;
        });

        this.powerups.forEach(p => {
            p.mesh.rotation.y += 3.0 * dt;
            p.core.rotation.x += 4.0 * dt;
            p.mesh.position.y = p.pos.y;
        });

        // Update grind rails rainbow shader
        this.grindRails.forEach(r => {
            if (r.railMesh.material.uniforms) {
                r.railMesh.material.uniforms.uTime.value += dt;
            }
        });

        // Cleanup objects far behind the player (> 90m)
        const cleanup = (list) => {
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i].pos.z > playerPos.z + 90) {
                    this.scene.remove(list[i].mesh);
                    list.splice(i, 1);
                }
            }
        };

        cleanup(this.obstacles);
        cleanup(this.ramps);
        cleanup(this.grindRails);
        cleanup(this.boostPads);
        cleanup(this.gifts);
        cleanup(this.powerups);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObstaclesManager;
}
