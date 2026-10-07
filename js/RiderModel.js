/**
 * ============================================================================
 * SNOW ANSHER 3D - 3D PROCEDURAL RIDER CHARACTER & STUNT TRICK ANIMATOR
 * Full procedural character rig with dynamic scarf cloth simulation,
 * look-at head tracking, steering IK lean, and 8 extreme aerial stunt tricks:
 * Backflip, 360 Spin, Superman, Method Air, Tail Grab, Rodeo 720, T-Pose & Iron Lotus.
 * ============================================================================
 */

class RiderCharacter {
    constructor(scene, customColors = {}) {
        this.scene = scene;
        this.rootGroup = new THREE.Group();

        // Customization palette
        this.colors = {
            jacket: customColors.jacket || 0x1e272e,
            pants: customColors.pants || 0x2f3640,
            beanie: customColors.beanie || 0xd63031,
            goggles: customColors.goggles || 0xf1c40f,
            skin: customColors.skin || 0xffdbac,
            gloves: customColors.gloves || 0x353b48,
            boots: customColors.boots || 0x111111,
            scarf: customColors.scarf || 0xffffff
        };

        // Trick state tracking
        this.currentTrick = null;
        this.trickProgress = 0.0;
        this.trickDuration = 1.0;
        this.baseRot = new THREE.Euler(0, 0, 0);

        // Scarf physics segments
        this.scarfSegments = [];
        this.NUM_SCARF_SEGMENTS = 7;

        this.buildRiderGeometry();
    }

    buildRiderGeometry() {
        // Materials
        const jacketMat = new THREE.MeshStandardMaterial({
            color: this.colors.jacket,
            roughness: 0.75,
            metalness: 0.1
        });
        const pantsMat = new THREE.MeshStandardMaterial({
            color: this.colors.pants,
            roughness: 0.8
        });
        const beanieMat = new THREE.MeshStandardMaterial({
            color: this.colors.beanie,
            roughness: 0.85
        });
        const goggleMat = new THREE.MeshStandardMaterial({
            color: this.colors.goggles,
            roughness: 0.1,
            metalness: 0.95
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: this.colors.skin,
            roughness: 0.65
        });
        const gloveMat = new THREE.MeshStandardMaterial({
            color: this.colors.gloves,
            roughness: 0.7
        });
        const bootMat = new THREE.MeshStandardMaterial({
            color: this.colors.boots,
            roughness: 0.85
        });
        const scarfMat = new THREE.MeshStandardMaterial({
            color: this.colors.scarf,
            roughness: 0.7,
            side: THREE.DoubleSide
        });

        // 1. Pelvis / Hips (Seated base)
        this.pelvis = new THREE.Group();
        this.pelvis.position.set(0, 0.45, 0.2);
        this.rootGroup.add(this.pelvis);

        const hipGeo = new THREE.BoxGeometry(0.55, 0.35, 0.5);
        const hipMesh = new THREE.Mesh(hipGeo, pantsMat);
        this.pelvis.add(hipMesh);

        // 2. Spine / Torso (Leaning forward into the wind)
        this.torso = new THREE.Group();
        this.torso.position.set(0, 0.2, 0.0);
        this.pelvis.add(this.torso);

        const chestGeo = new THREE.BoxGeometry(0.65, 0.75, 0.48);
        const chestMesh = new THREE.Mesh(chestGeo, jacketMat);
        chestMesh.position.set(0, 0.35, -0.08);
        chestMesh.rotation.x = 0.38; // aggressive downhill aerodynamic tuck
        chestMesh.castShadow = true;
        this.torso.add(chestMesh);

        // Parka zipper line & chest badge
        const zipperGeo = new THREE.BoxGeometry(0.04, 0.72, 0.04);
        const zipperMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        const zipper = new THREE.Mesh(zipperGeo, zipperMat);
        zipper.position.set(0, 0.35, -0.33);
        zipper.rotation.x = 0.38;
        this.torso.add(zipper);

        // 3. Neck & Head
        this.neck = new THREE.Group();
        this.neck.position.set(0, 0.75, -0.22);
        this.torso.add(this.neck);

        // Head Base
        const headGeo = new THREE.SphereGeometry(0.24, 14, 14);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        this.neck.add(headMesh);

        // Beanie / Winter Hat
        const beanieGeo = new THREE.SphereGeometry(0.26, 14, 14);
        const beanieMesh = new THREE.Mesh(beanieGeo, beanieMat);
        beanieMesh.position.set(0, 0.06, 0.0);
        this.neck.add(beanieMesh);

        // Beanie Bobble / Pom-Pom
        const pomGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const pomMesh = new THREE.Mesh(pomGeo, scarfMat);
        pomMesh.position.set(0, 0.32, -0.05);
        this.neck.add(pomMesh);

        // Extreme Ski Goggles (Wide spherical wrap visor)
        const goggleFrameGeo = new THREE.BoxGeometry(0.34, 0.12, 0.14);
        const goggleFrame = new THREE.Mesh(goggleFrameGeo, gloveMat);
        goggleFrame.position.set(0, 0.04, -0.19);

        const visorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.04);
        const visorMesh = new THREE.Mesh(visorGeo, goggleMat);
        visorMesh.position.set(0, 0, -0.07);
        goggleFrame.add(visorMesh);

        // Goggle Elastic Strap around beanie
        const strapGeo = new THREE.TorusGeometry(0.25, 0.03, 6, 16);
        const strapMesh = new THREE.Mesh(strapGeo, gloveMat);
        strapMesh.rotation.x = Math.PI / 2;
        this.neck.add(strapMesh);
        this.neck.add(goggleFrame);

        // 4. Arms & Hands (Gripping handlebars)
        this.leftArm = this.buildArm(1, jacketMat, gloveMat);
        this.rightArm = this.buildArm(-1, jacketMat, gloveMat);
        this.torso.add(this.leftArm);
        this.torso.add(this.rightArm);

        // 5. Legs & Boots (Tucked into sled footrests)
        this.leftLeg = this.buildLeg(1, pantsMat, bootMat);
        this.rightLeg = this.buildLeg(-1, pantsMat, bootMat);
        this.pelvis.add(this.leftLeg);
        this.pelvis.add(this.rightLeg);

        // 6. Dynamic Scarf Cloth Simulation (7 linked segments)
        this.buildScarfRibbon(scarfMat);
    }

    buildArm(side, jacketMat, gloveMat) {
        const armGroup = new THREE.Group();
        armGroup.position.set(side * 0.42, 0.65, -0.12);

        // Shoulder
        const shoulderGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const shoulder = new THREE.Mesh(shoulderGeo, jacketMat);
        armGroup.add(shoulder);

        // Upper Arm
        const upperArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8);
        const upperArm = new THREE.Mesh(upperArmGeo, jacketMat);
        upperArm.position.set(0, -0.18, -0.08);
        upperArm.rotation.x = 0.85;
        upperArm.rotation.z = -side * 0.25;
        armGroup.add(upperArm);

        // Forearm / Glove Group
        const forearm = new THREE.Group();
        forearm.position.set(0, -0.32, -0.22);

        const lowerArmGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.4, 8);
        const lowerArm = new THREE.Mesh(lowerArmGeo, jacketMat);
        lowerArm.position.set(0, -0.12, -0.1);
        lowerArm.rotation.x = 0.7;
        forearm.add(lowerArm);

        // Mittens / Gloves
        const handGeo = new THREE.BoxGeometry(0.12, 0.12, 0.14);
        const handMesh = new THREE.Mesh(handGeo, gloveMat);
        handMesh.position.set(0, -0.25, -0.22);
        forearm.add(handMesh);

        armGroup.add(forearm);
        armGroup.userData = { forearm, handMesh, upperArm };
        return armGroup;
    }

    buildLeg(side, pantsMat, bootMat) {
        const legGroup = new THREE.Group();
        legGroup.position.set(side * 0.24, 0.0, 0.05);

        // Thigh
        const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.45, 8);
        const thigh = new THREE.Mesh(thighGeo, pantsMat);
        thigh.position.set(0, -0.15, -0.18);
        thigh.rotation.x = 1.35; // seated forward
        legGroup.add(thigh);

        // Shin & Boot
        const shinGroup = new THREE.Group();
        shinGroup.position.set(0, -0.18, -0.38);

        const shinGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.42, 8);
        const shin = new THREE.Mesh(shinGeo, pantsMat);
        shin.position.set(0, -0.15, 0.05);
        shin.rotation.x = -0.4;
        shinGroup.add(shin);

        // Boot
        const bootGeo = new THREE.BoxGeometry(0.14, 0.16, 0.32);
        const boot = new THREE.Mesh(bootGeo, bootMat);
        boot.position.set(0, -0.32, 0.12);
        shinGroup.add(boot);

        legGroup.add(shinGroup);
        legGroup.userData = { shinGroup, boot };
        return legGroup;
    }

    buildScarfRibbon(scarfMat) {
        this.scarfGroup = new THREE.Group();
        this.scarfGroup.position.set(0, 0.65, 0.05);
        this.torso.add(this.scarfGroup);

        // Scarf neck ring
        const collarGeo = new THREE.TorusGeometry(0.24, 0.08, 6, 12);
        const collar = new THREE.Mesh(collarGeo, scarfMat);
        collar.rotation.x = Math.PI / 2;
        this.scarfGroup.add(collar);

        // Linked tail segments
        let parent = this.scarfGroup;
        for (let i = 0; i < this.NUM_SCARF_SEGMENTS; i++) {
            const seg = new THREE.Group();
            seg.position.set(0, -0.04, 0.12);

            const segGeo = new THREE.BoxGeometry(0.22 - i * 0.015, 0.04, 0.16);
            const segMesh = new THREE.Mesh(segGeo, scarfMat);
            segMesh.position.set(0, 0, 0.08);
            seg.add(segMesh);

            parent.add(seg);
            this.scarfSegments.push(seg);
            parent = seg;
        }
    }

    /**
     * Animate Rider Rig per frame based on speed, steering input, and active stunt
     */
    update(dt, params) {
        const { speed, steer, isGrounded, airTime, activeTrick } = params;

        // 1. Dynamic steering lean & spine bank
        const targetTorsoZ = -steer * 0.35;
        this.torso.rotation.z += (targetTorsoZ - this.torso.rotation.z) * 12 * dt;
        this.torso.rotation.y = -steer * 0.18;

        // Head look-ahead into turn
        this.neck.rotation.y += (-steer * 0.45 - this.neck.rotation.y) * 14 * dt;
        this.neck.rotation.x = -0.15 + (speed / 150) * 0.2; // look up slightly as speed increases

        // 2. Scarf cloth wind physics
        const windWave = Math.sin(Date.now() * 0.018) * 0.35 + (speed / 80) * 0.25;
        for (let i = 0; i < this.scarfSegments.length; i++) {
            const seg = this.scarfSegments[i];
            const waveOffset = Math.sin(Date.now() * 0.015 - i * 0.6) * 0.25;
            seg.rotation.x = 0.15 + (speed / 100) * 0.4 + waveOffset * 0.5;
            seg.rotation.y = steer * 0.2 + Math.cos(Date.now() * 0.012 - i * 0.5) * 0.18;
        }

        // 3. Aerial Stunt Animation System
        if (!isGrounded && activeTrick) {
            this.applyTrickPose(activeTrick, airTime);
        } else {
            // Restore seated stance
            this.resetPosedLimbs(dt);
        }
    }

    applyTrickPose(trickName, airTime) {
        const t = Math.min(1.0, airTime * 1.8);

        switch (trickName) {
            case 'superman':
                // Rider extends fully flat behind sled holding handles
                this.torso.rotation.x = THREE.MathUtils.lerp(0.38, -1.2, t);
                this.pelvis.position.z = THREE.MathUtils.lerp(0.2, 1.4, t);
                this.pelvis.position.y = THREE.MathUtils.lerp(0.45, 0.8, t);
                this.leftLeg.rotation.x = -0.8;
                this.rightLeg.rotation.x = -0.8;
                break;

            case 'method':
                // Sled tweaked 90 degrees, rider grabs runner
                this.torso.rotation.z = -1.1;
                this.leftArm.rotation.z = -1.2;
                this.rightArm.rotation.z = 0.8;
                break;

            case 'backflip':
                // Pitch spin
                this.rootGroup.rotation.x = airTime * Math.PI * 2.8;
                break;

            case 'spin360':
                // Yaw spin
                this.rootGroup.rotation.y = airTime * Math.PI * 3.0;
                break;

            case 'rodeo720':
                // Inverted roll & spin
                this.rootGroup.rotation.x = airTime * Math.PI * 2.2;
                this.rootGroup.rotation.y = airTime * Math.PI * 4.4;
                this.rootGroup.rotation.z = Math.sin(airTime * 6.0) * 0.6;
                break;

            case 'tailgrab':
                // Reach back to grab rear runner
                this.torso.rotation.y = 0.8;
                this.rightArm.rotation.x = -1.3;
                this.rightArm.rotation.y = 0.7;
                break;

            case 'ironlotus':
                // Stunt splits in mid-air
                this.leftLeg.rotation.z = 1.1;
                this.rightLeg.rotation.z = -1.1;
                this.leftArm.rotation.z = 1.3;
                this.rightArm.rotation.z = -1.3;
                break;

            default:
                break;
        }
    }

    resetPosedLimbs(dt) {
        this.rootGroup.rotation.set(0, 0, 0);
        this.pelvis.position.set(0, 0.45, 0.2);
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiderCharacter;
}
