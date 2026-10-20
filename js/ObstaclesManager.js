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

        // Shared ramp materials. Stripes/trim are "decals" laid a hair above the deck,
        // so they get a polygon offset to avoid z-fighting with the snow surface.
        const decal = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide };
        this.matRampWood = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });
        this.matRampSnow = new THREE.MeshStandardMaterial({ color: 0xf4f9ff, roughness: 0.55, metalness: 0.0, side: THREE.DoubleSide });
        this.matRampTrim = new THREE.MeshStandardMaterial(Object.assign({ color: 0x5a3b30, roughness: 0.9, metalness: 0.0 }, decal));
        this.matStripeYellow = new THREE.MeshBasicMaterial(Object.assign({ color: 0xf1c40f }, decal));
        this.matStripeOrange = new THREE.MeshBasicMaterial(Object.assign({ color: 0xe67e22 }, decal));
        this.matStripeRed = new THREE.MeshBasicMaterial(Object.assign({ color: 0xff4757 }, decal));

        // Materials that must survive object disposal (shared between many meshes)
        this._sharedMaterials = new Set([
            this.matPineFoliage, this.matPineSnow, this.matPineTrunk, this.matBark,
            this.matRockDark, this.matRock, this.matRampWood, this.matRampSnow,
            this.matRampTrim, this.matStripeYellow, this.matStripeOrange, this.matStripeRed
        ]);
    }

    /**
     * Free the GPU geometry of a removed object. Without this every tree, ramp and
     * snowman that scrolled out of range leaked its vertex buffers for the whole
     * session, and long runs slowly lost frame rate.
     */
    _disposeObject(obj) {
        if (!obj || !obj.traverse) return;
        obj.traverse((child) => {
            if (child.geometry && child.geometry.dispose) child.geometry.dispose();
        });
    }

    _removeItem(item) {
        if (!item || !item.mesh) return;
        this.scene.remove(item.mesh);
        this._disposeObject(item.mesh);
    }

    clearAll() {
        const removeGroup = (list) => {
            list.forEach(item => this._removeItem(item));
            list.length = 0;
        };

        removeGroup(this.obstacles);
        removeGroup(this.ramps);
        removeGroup(this.grindRails);
        removeGroup(this.boostPads);
        removeGroup(this.gifts);
        removeGroup(this.powerups);
        this.cliffRamps = [];
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
     * 3-Tier Snowman with Top Hat, Carrot, and Flapping Scarf.
     * The face points UP the slope (+Z) so the rider sees it head-on. It used to
     * face away, so you only ever saw the back of every snowman's head.
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

        // Coal eyes (on the +Z, rider-facing side of the head)
        for (let side of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), coalMat);
            eye.position.set(side * 0.2, 3.78, 0.53);
            group.add(eye);
        }

        // Coal smile
        for (let i = -2; i <= 2; i++) {
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 5, 5), coalMat);
            const sx = i * 0.11;
            const sy = 3.47 + Math.abs(i) * 0.035;            // ends curl up into a smile
            const sz = Math.sqrt(Math.max(0.01, 0.36 - sx * sx - (sy - 3.65) * (sy - 3.65)));
            dot.position.set(sx, sy, sz);
            group.add(dot);
        }

        // Carrot nose: rotation.x = +90deg turns the cone tip toward +Z (outward)
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), carrotMat);
        carrot.rotation.x = Math.PI / 2;
        carrot.position.set(0, 3.65, 0.8);
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

    // ─── RAMPS ───────────────────────────────────────────────────────────────
    //
    // A ramp is described ONCE by a "spec" (entry/lip positions, heights and the
    // deck curve). The mesh builder and the collision code (sampleRampDeck) both
    // read that same spec, so the surface you see is exactly the surface you ride.
    //
    // Layout, in world space (the sled travels toward -Z):
    //
    //   entryZ (uphill end, flush with the snow)  ───►  lipZ (launch edge)
    //
    // The deck starts a hair under the snow at its lowest lane and curves up with
    // an ease-in profile, so it grows out of the slope instead of starting with a
    // step. The body is a solid wedge down to below the lowest terrain it touches.

    _makeRampSpec(x, entryZ, lipZ, width, height, groundFn, exponent = 1.35) {
        const g = (typeof groundFn === 'function')
            ? groundFn
            : (this.getGroundHeightAt || ((gx, gz) => -gz * Math.tan(this.SLOPE_ANGLE)));

        const hw = width * 0.5;
        const L = entryZ - lipZ;
        const lanes = [-1, -0.5, 0, 0.5, 1].map(k => x + k * hw);

        let entryGround = Infinity;  // LOWEST terrain across the entry edge
        let lipGround = -Infinity;   // HIGHEST terrain across the lip edge
        let floor = Infinity;        // lowest terrain under / just past the footprint
        for (const px of lanes) {
            entryGround = Math.min(entryGround, g(px, entryZ));
            // Also sample 6 m uphill of the lip: at a cliff the terrain AT the lip has already
            // started dropping into the wall, which would make the ramp far too low.
            lipGround = Math.max(lipGround, g(px, lipZ), g(px, lipZ + 6));
            for (let s = 0; s <= 8; s++) {
                floor = Math.min(floor, g(px, entryZ - (L + 4) * (s / 8)));
            }
        }

        const yEntry = entryGround - 0.05;
        const rise = Math.max(1.0, lipGround + height - yEntry);
        const clamp01 = (v) => Math.min(1, Math.max(0, v));

        return {
            x: x,
            hw: hw,
            entryZ: entryZ,
            lipZ: lipZ,
            L: L,
            yEntry: yEntry,
            rise: rise,
            exp: exponent,
            bottomY: floor - 1.5,
            // Deck height at world Z
            deckY: (z) => yEntry + rise * Math.pow(clamp01((entryZ - z) / L), exponent),
            // Nose-up pitch (radians) of the deck at world Z
            pitchAt: (z) => {
                const t = Math.max(0.02, clamp01((entryZ - z) / L));
                return Math.atan(rise * exponent * Math.pow(t, exponent - 1) / L);
            }
        };
    }

    _buildRampMesh(spec, opts) {
        const { x, hw, entryZ, lipZ, L, bottomY } = spec;
        const slices = opts.slices || 12;
        const xl = x - hw;
        const xr = x + hw;
        const castShadow = !!(this.config && this.config.graphics === 'ultra');

        const woodPos = [], woodCol = [];
        const snowPos = [], trimPos = [], chevPos = [], lipPos = [];

        const tri = (arr, a, b, c) => { arr.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
        const quad = (arr, a, b, c, d) => { tri(arr, a, b, c); tri(arr, b, d, c); };
        const shade = (s) => { for (let i = 0; i < 6; i++) woodCol.push(0.43 * s, 0.30 * s, 0.25 * s); };

        const zs = [];
        const ys = [];
        for (let i = 0; i <= slices; i++) {
            const z = entryZ - L * (i / slices);
            zs.push(z);
            ys.push(spec.deckY(z));
        }

        for (let i = 0; i < slices; i++) {
            const z0 = zs[i], z1 = zs[i + 1], y0 = ys[i], y1 = ys[i + 1];

            // Packed-snow deck
            quad(snowPos, [xl, y0, z0], [xr, y0, z0], [xl, y1, z1], [xr, y1, z1]);

            // Timber side walls, banded so they read as planking rather than a slab
            const band = (i % 2 === 0) ? 1.0 : 0.84;
            quad(woodPos, [xl, y0, z0], [xl, y1, z1], [xl, bottomY, z0], [xl, bottomY, z1]); shade(band);
            quad(woodPos, [xr, y0, z0], [xr, y1, z1], [xr, bottomY, z0], [xr, bottomY, z1]); shade(band);

            // Raised edge beams along both sides of the deck
            const bw = 0.7;
            const lift = 0.04;
            quad(trimPos, [xl, y0 + lift, z0], [xl + bw, y0 + lift, z0], [xl, y1 + lift, z1], [xl + bw, y1 + lift, z1]);
            quad(trimPos, [xr - bw, y0 + lift, z0], [xr, y0 + lift, z0], [xr - bw, y1 + lift, z1], [xr, y1 + lift, z1]);
        }

        // Front (lip) face and rear (entry) face of the wedge
        const yLip = ys[slices];
        const yEnt = ys[0];
        quad(woodPos, [xl, yLip, lipZ], [xr, yLip, lipZ], [xl, bottomY, lipZ], [xr, bottomY, lipZ]); shade(0.78);
        quad(woodPos, [xl, yEnt, entryZ], [xr, yEnt, entryZ], [xl, bottomY, entryZ], [xr, bottomY, entryZ]); shade(0.78);

        // Bright launch-edge bar across the last 0.9 m of the deck
        const barZ = lipZ + 0.9;
        quad(lipPos,
            [xl, spec.deckY(barZ) + 0.04, barZ], [xr, spec.deckY(barZ) + 0.04, barZ],
            [xl, spec.deckY(lipZ) + 0.04, lipZ], [xr, spec.deckY(lipZ) + 0.04, lipZ]);

        // Downhill-pointing chevrons laid on the deck surface
        const cw = hw * 0.7;
        const th = 1.5;
        const tipDz = cw * 0.4;
        const P = (px, pz) => [px, spec.deckY(pz) + 0.05, pz];
        for (let k = 0; k < opts.chevrons; k++) {
            const tc = opts.chevrons === 1
                ? opts.chevStart
                : opts.chevStart + (opts.chevEnd - opts.chevStart) * (k / (opts.chevrons - 1));
            const zf = entryZ - L * tc;
            const R0 = P(x - cw, zf), R1 = P(x, zf - tipDz), R2 = P(x + cw, zf);
            const F0 = P(x - cw, zf - th), F1 = P(x, zf - tipDz - th), F2 = P(x + cw, zf - th);
            quad(chevPos, R0, R1, F0, F1);
            quad(chevPos, R1, R2, F1, F2);
        }

        const makeMesh = (positions, material, colors) => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            if (colors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geo.computeVertexNormals();
            const mesh = new THREE.Mesh(geo, material);
            mesh.castShadow = castShadow;
            return mesh;
        };

        const group = new THREE.Group();
        group.add(makeMesh(woodPos, this.matRampWood, woodCol));
        group.add(makeMesh(snowPos, this.matRampSnow));
        group.add(makeMesh(trimPos, this.matRampTrim));
        group.add(makeMesh(chevPos, opts.chevMat));
        group.add(makeMesh(lipPos, opts.lipMat));
        return group;
    }

    /**
     * Highest ramp deck under world (x, z), or null when the point is off every ramp.
     * Returns { y, pitch, ramp }. Used by the game loop to ride and launch off ramps.
     */
    sampleRampDeck(x, z, margin = 0.4) {
        let best = null;
        for (let i = 0; i < this.ramps.length; i++) {
            const ramp = this.ramps[i];
            const s = ramp.spec;
            if (z > s.entryZ || z < s.lipZ) continue;
            if (Math.abs(x - s.x) > s.hw + margin) continue;
            const y = s.deckY(z);
            if (!best || y > best.y) best = { y: y, pitch: s.pitchAt(z), ramp: ramp };
        }
        return best;
    }

    /**
     * Normal ski-jump kicker. `z` is the ramp's centre; the deck runs flush with the
     * snow at the uphill end and curves up to a launch lip at the downhill end.
     */
    createMegaRamp(x, y, z, isMega = false, groundFn = null) {
        const width = isMega ? 14.0 : 9.5;
        const length = isMega ? 16.0 : 12.0;
        const height = isMega ? 4.2 : 2.8;

        const spec = this._makeRampSpec(x, z + length * 0.5, z - length * 0.5, width, height, groundFn, 1.35);
        const mesh = this._buildRampMesh(spec, {
            slices: 10,
            chevrons: 2, chevStart: 0.4, chevEnd: 0.68,
            chevMat: isMega ? this.matStripeRed : this.matStripeYellow,
            lipMat: this.matStripeOrange
        });
        this.scene.add(mesh);

        this.ramps.push({
            mesh: mesh,
            spec: spec,
            width: width,
            length: length,
            boostPower: isMega ? 46 : 34, // Big obvious kicker launch (≈25m / ≈14m apex)
            isCliffJumper: false,
            pos: new THREE.Vector3(x, spec.yEntry, z)
        });
    }

    /**
     * Cliff-clearing ramp: a very long kicker whose lip is high enough to carry the
     * sled across a chasm it could never clear on the flat. Built as a solid wedge
     * (no floating slab, no legs poking through the deck) and wide enough to cover
     * most of the run so an off-centre line still catches it.
     */
    createCliffJumpRamp(x, y, z, groundFn = null, scale = 1.0) {
        const width = 35.0 * scale;
        const length = 48.0 * scale;
        const height = 9.0 * scale;

        const spec = this._makeRampSpec(x, z + length * 0.5, z - length * 0.5, width, height, groundFn, 1.35);
        const mesh = this._buildRampMesh(spec, {
            slices: 18,
            chevrons: 4, chevStart: 0.2, chevEnd: 0.82,
            chevMat: this.matStripeRed,
            lipMat: this.matStripeYellow
        });
        this.scene.add(mesh);

        // Big ramp, big launch: enough range to clear the 44 m trench even at the
        // slowest starting speed.
        const boost = Math.round(26 * scale);

        this.ramps.push({
            mesh: mesh,
            spec: spec,
            width: width,
            length: length,
            boostPower: boost,
            isCliffJumper: true,
            pos: new THREE.Vector3(x, spec.yEntry, z)
        });
        this.cliffRamps = this.cliffRamps || [];
        this.cliffRamps.push(mesh);
    }

    /**
     * Rainbow Ice Grind Rail.
     * The pipe is a straight line between its two ends and every support post is
     * sized to reach the terrain under it. It used to be tilted the wrong way for
     * this slope, so the far half of every rail was buried in the snow.
     */
    createGrindRail(x, y, z, length = 45) {
        const RAIL_H = 1.8; // pipe centre height above the snow
        const g = this.getGroundHeightAt
            ? this.getGroundHeightAt
            : ((gx, gz) => y + (z - gz) * Math.tan(this.SLOPE_ANGLE));

        const zEnd = z - length;
        const yStart = g(x, z) + RAIL_H;
        const yEnd = g(x, zEnd) + RAIL_H;
        const railY = (zw) => {
            const t = Math.min(1, Math.max(0, (z - zw) / length));
            return yStart + (yEnd - yStart) * t;
        };

        const group = new THREE.Group();

        // Straight rainbow pipe from the start point to the end point
        const dir = new THREE.Vector3(0, yEnd - yStart, zEnd - z);
        const pipeLen = dir.length();
        dir.normalize();

        const railGeo = new THREE.CylinderGeometry(0.18, 0.18, pipeLen, 12);
        const railMat = new THREE.ShaderMaterial({
            vertexShader: SnowShaders.RainbowRailShader.vertexShader,
            fragmentShader: SnowShaders.RainbowRailShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(SnowShaders.RainbowRailShader.uniforms)
        });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        rail.position.set(x, (yStart + yEnd) * 0.5, (z + zEnd) * 0.5);
        group.add(rail);

        // Support posts: each one runs from just under the snow up to the pipe
        const postMat = new THREE.MeshStandardMaterial({ color: 0x34495e, metalness: 0.3, roughness: 0.5 });
        for (let dz = 0; dz <= length; dz += 10) {
            const pz = z - dz;
            const groundY = g(x, pz);
            const h = Math.max(0.6, railY(pz) - groundY) + 0.3;
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 8), postMat);
            post.position.set(x, groundY - 0.3 + h * 0.5, pz);
            group.add(post);
        }

        this.scene.add(group);

        this.grindRails.push({
            mesh: group,
            railMesh: rail,
            width: 2.2,
            length: length,
            railY: railY,
            counted: false,
            pos: new THREE.Vector3(x, g(x, z), z)
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
        // Lie flat on the slope instead of cutting into it at one end
        group.rotation.x = this.SLOPE_ANGLE;
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
     * Collectible Holiday Gift Box.
     * Metalness is kept low: there is no environment map in the scene, so highly
     * metallic surfaces render near-black instead of shiny.
     */
    createGiftBox(x, y, z) {
        const group = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0xff4757,
            emissive: 0x3a0610,
            metalness: 0.1,
            roughness: 0.45
        });
        const box = new THREE.Mesh(boxGeo, boxMat);

        const ribMat = new THREE.MeshStandardMaterial({
            color: 0xffd166,
            emissive: 0x5c4200,
            metalness: 0.15,
            roughness: 0.4
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
        const bound = this.TRACK_WIDTH * 0.44;
        this.obstacles.forEach(obj => {
            if (obj.rolling) {
                obj.pos.x += obj.driftX * dt;
                // Steer back inward based on which side we're past. Flipping the sign
                // on every frame beyond the bound made boulders jitter at the edge.
                if (obj.pos.x > bound) obj.driftX = -Math.abs(obj.driftX);
                else if (obj.pos.x < -bound) obj.driftX = Math.abs(obj.driftX);

                // Roll about the axis that matches the direction of travel (sideways
                // drift => spin about Z), plus a slow tumble for character.
                obj.mesh.rotation.z -= (obj.driftX / obj.radius) * dt;
                obj.mesh.rotation.x += obj.rollSpeed * 0.25 * dt;
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
                    this._removeItem(list[i]);
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
