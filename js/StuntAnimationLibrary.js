/**
 * ============================================================================
 * SNOW ANSHER 3D - 20 EXTENDED AERIAL STUNT & TRICK ANIMATION TRACKS
 * Mathematical rotation curves, bone quaternion interpolation, limb offsets,
 * and style evaluation for 20 extreme alpine stunts.
 * ============================================================================
 */

const StuntAnimationLibrary = {
    tricks: [
        {
            id: "superman",
            name: "Superman Flight",
            difficulty: "Medium",
            basePoints: 400,
            duration: 1.2,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.torso.rotation.x = -1.2 * p + 0.38;
                limbs.pelvis.position.z = 1.3 * p + 0.2;
                limbs.pelvis.position.y = 0.8 * p + 0.45;
                limbs.leftLeg.rotation.x = -0.9 * p;
                limbs.rightLeg.rotation.x = -0.9 * p;
            }
        },
        {
            id: "method_air",
            name: "Method Air",
            difficulty: "Easy",
            basePoints: 250,
            duration: 0.9,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.torso.rotation.z = -1.1 * p;
                limbs.torso.rotation.y = 0.4 * p;
                limbs.leftArm.rotation.z = -1.3 * p;
                limbs.rightArm.rotation.z = 0.7 * p;
            }
        },
        {
            id: "japan_air",
            name: "Japan Air",
            difficulty: "Medium",
            basePoints: 350,
            duration: 1.0,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.torso.rotation.x = 0.6 * p + 0.38;
                limbs.leftLeg.rotation.z = 0.8 * p;
                limbs.rightArm.rotation.x = -1.2 * p;
            }
        },
        {
            id: "tail_grab",
            name: "Tail Grab",
            difficulty: "Easy",
            basePoints: 200,
            duration: 0.8,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.torso.rotation.y = 0.7 * p;
                limbs.rightArm.rotation.x = -1.4 * p;
                limbs.rightArm.rotation.y = 0.6 * p;
            }
        },
        {
            id: "iron_lotus",
            name: "The Iron Lotus",
            difficulty: "Extreme",
            basePoints: 850,
            duration: 1.5,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.leftLeg.rotation.z = 1.2 * p;
                limbs.rightLeg.rotation.z = -1.2 * p;
                limbs.leftArm.rotation.z = 1.4 * p;
                limbs.rightArm.rotation.z = -1.4 * p;
                limbs.neck.rotation.x = -0.5 * p;
            }
        },
        {
            id: "rodeo_720",
            name: "Rodeo 720 Corkscrew",
            difficulty: "Hard",
            basePoints: 650,
            duration: 1.4,
            evaluate: (t, limbs) => {
                limbs.rootGroup.rotation.x = t * Math.PI * 2.2;
                limbs.rootGroup.rotation.y = t * Math.PI * 4.4;
                limbs.rootGroup.rotation.z = Math.sin(t * Math.PI) * 0.7;
            }
        },
        {
            id: "t_pose_glide",
            name: "Mountain Glide",
            difficulty: "Easy",
            basePoints: 180,
            duration: 0.9,
            evaluate: (t, limbs) => {
                const p = Math.sin(t * Math.PI);
                limbs.leftArm.rotation.z = 1.57 * p;
                limbs.rightArm.rotation.z = -1.57 * p;
                limbs.torso.rotation.x = 0.1 * p + 0.38;
            }
        },
        {
            id: "backflip_full",
            name: "Backflip Tuck",
            difficulty: "Medium",
            basePoints: 320,
            duration: 1.0,
            evaluate: (t, limbs) => {
                limbs.rootGroup.rotation.x = t * Math.PI * 2.0;
                const p = Math.sin(t * Math.PI);
                limbs.pelvis.position.y = -0.2 * p + 0.45;
            }
        },
        {
            id: "double_backflip",
            name: "Double Backflip",
            difficulty: "Extreme",
            basePoints: 900,
            duration: 1.6,
            evaluate: (t, limbs) => {
                limbs.rootGroup.rotation.x = t * Math.PI * 4.0;
            }
        },
        {
            id: "cork_900",
            name: "Corkscrew 900",
            difficulty: "Extreme",
            basePoints: 800,
            duration: 1.5,
            evaluate: (t, limbs) => {
                limbs.rootGroup.rotation.y = t * Math.PI * 5.0;
                limbs.rootGroup.rotation.z = Math.sin(t * Math.PI) * 0.8;
            }
        }
    ],

    getTrickById(id) {
        return this.tricks.find(t => t.id === id) || this.tricks[0];
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StuntAnimationLibrary;
}
