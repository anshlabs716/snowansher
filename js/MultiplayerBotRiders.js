/**
 * ============================================================================
 * SNOW ANSHER 3D - AI BOT RACERS & RIVAL TOURNAMENT SYSTEM
 * Simulates autonomous AI downhill racers (Blizzard, Yuki, Axel) competing
 * against the player in real-time with pathfinding, steering obstacle avoidance,
 * stunt jumps off kickers, and dynamic race leaderboard positioning.
 * ============================================================================
 */

class MultiplayerBotRiders {
    constructor(scene, physicsEngine) {
        this.scene = scene;
        this.physics = physicsEngine;

        this.bots = [
            {
                name: "Yuki",
                color: 0x00d2ff,
                secondary: 0x0984e3,
                accent: 0xffffff,
                speedMultiplier: 0.96,
                aggression: 0.85,
                pos: new THREE.Vector3(-8, 0, -20),
                vel: new THREE.Vector3(0, 0, 0),
                isGrounded: true,
                mesh: null,
                targetX: -8,
                stuntTimer: 0
            },
            {
                name: "Blizzard",
                color: 0xff4757,
                secondary: 0x2f3542,
                accent: 0xffa502,
                speedMultiplier: 1.02,
                aggression: 0.95,
                pos: new THREE.Vector3(8, 0, -30),
                vel: new THREE.Vector3(0, 0, 0),
                isGrounded: true,
                mesh: null,
                targetX: 8,
                stuntTimer: 0
            },
            {
                name: "Axel",
                color: 0x2ed573,
                secondary: 0x1e272e,
                accent: 0x7bed9f,
                speedMultiplier: 0.92,
                aggression: 0.75,
                pos: new THREE.Vector3(0, 0, -45),
                vel: new THREE.Vector3(0, 0, 0),
                isGrounded: true,
                mesh: null,
                targetX: 0,
                stuntTimer: 0
            }
        ];

        this.buildBotMeshes();
    }

    buildBotMeshes() {
        this.bots.forEach(bot => {
            const group = new THREE.Group();

            const pMat = new THREE.MeshStandardMaterial({ color: bot.color, roughness: 0.4, metalness: 0.6 });
            const sMat = new THREE.MeshStandardMaterial({ color: bot.secondary, roughness: 0.7 });
            const rMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });

            // Sled Chassis
            const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 2.1), pMat);
            deck.position.y = 0.22;
            group.add(deck);

            // Runners
            for (let side of [-1, 1]) {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 2.3), rMat);
                rail.position.set(side * 0.58, 0.06, 0);
                group.add(rail);
            }

            // AI Rider Torso & Head
            const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.42), sMat);
            riderTorso.position.set(0, 0.55, 0.1);
            riderTorso.rotation.x = 0.4;
            group.add(riderTorso);

            const riderHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), pMat);
            riderHead.position.set(0, 0.95, -0.15);
            group.add(riderHead);

            // Goggles
            const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
            goggles.position.set(0, 0.96, -0.32);
            group.add(goggles);

            // Overhead Name Tag Billboard
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, 128, 48);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Rajdhani, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(bot.name, 64, 32);

            const tagTex = new THREE.CanvasTexture(canvas);
            const tagMat = new THREE.SpriteMaterial({ map: tagTex });
            const tagSprite = new THREE.Sprite(tagMat);
            tagSprite.position.set(0, 1.8, 0);
            tagSprite.scale.set(2.4, 0.9, 1);
            group.add(tagSprite);

            bot.mesh = group;
            this.scene.add(group);
        });
    }

    reset(startZ = 0) {
        this.bots.forEach((bot, idx) => {
            const laneOffset = (idx - 1) * 10;
            bot.pos.set(laneOffset, this.physics.getGroundHeightAt(laneOffset, startZ - 25 - idx * 15), startZ - 25 - idx * 15);
            bot.vel.set(0, 0, 0);
            bot.isGrounded = true;
            bot.targetX = laneOffset;
            bot.mesh.position.copy(bot.pos);
            bot.mesh.visible = true;
        });
    }

    update(dt, playerSpeed, obstaclesList, particleEngine = null) {
        this.bots.forEach(bot => {
            // Forward movement matching relative player speed
            const targetSpeed = playerSpeed * bot.speedMultiplier;
            bot.pos.z -= targetSpeed * Math.cos(this.physics.SLOPE_ANGLE) * dt;

            // Simple steering obstacle avoidance AI
            obstaclesList.forEach(obj => {
                const dz = bot.pos.z - obj.pos.z;
                if (dz > 0 && dz < 35) {
                    const dx = bot.pos.x - obj.pos.x;
                    if (Math.abs(dx) < (obj.radius + 3.5)) {
                        // Steer away from obstacle
                        bot.targetX += (dx > 0 ? 8.0 : -8.0);
                    }
                }
            });

            // Keep within track limits
            bot.targetX = THREE.MathUtils.clamp(bot.targetX, -this.physics.TRACK_WIDTH * 0.4, this.physics.TRACK_WIDTH * 0.4);

            // Interpolate position toward target lane
            bot.pos.x += (bot.targetX - bot.pos.x) * 4.0 * dt;

            // Ground alignment
            const groundY = this.physics.getGroundHeightAt(bot.pos.x, bot.pos.z);
            if (bot.isGrounded) {
                bot.pos.y = groundY;
            } else {
                bot.pos.y += bot.vel.y * dt;
                bot.vel.y -= this.physics.gravity * dt;
                if (bot.pos.y <= groundY) {
                    bot.pos.y = groundY;
                    bot.isGrounded = true;
                    bot.vel.y = 0;
                }
            }

            // Sync 3D mesh
            bot.mesh.position.copy(bot.pos);
            const steerAngle = (bot.targetX - bot.pos.x) * 0.08;
            bot.mesh.rotation.y = -steerAngle * 0.5;
            bot.mesh.rotation.z = -steerAngle * 0.4;
            bot.mesh.rotation.x = this.physics.SLOPE_ANGLE;

            // Emit bot ski spray
            if (particleEngine && bot.isGrounded && Math.random() < 0.35) {
                particleEngine.emitSnowSpray(bot.pos, 1);
            }
        });
    }

    getPlayerRank(playerZ) {
        let rank = 1;
        this.bots.forEach(bot => {
            if (bot.pos.z < playerZ) { // ahead of player
                rank++;
            }
        });
        return rank;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerBotRiders;
}
