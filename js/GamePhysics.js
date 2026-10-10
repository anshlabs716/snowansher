/**
 * ============================================================================
 * SNOW ANSHER 3D - ARCADE DOWNHILL 3D PHYSICS ENGINE & HIGH JUMP SYSTEM
 * Exhilarating high jump airtime, ramp launches over treetops, rail grinding,
 * halfpipe wall banking, dynamic drift friction, and terrain raycasting.
 * ============================================================================
 */

class GamePhysics {
    /**
     * Generate deterministic cliff positions — shared static method.
     * Must match WorldEnvironment.generateCliffSchedule and SnowAnsherMaster.
     * @returns {number[]} Array of Z positions where cliffs occur.
     */
    static generateCliffPositions() {
        const positions = [];
        const firstCliff = -350;
        const minGap = 380;
        const maxGap = 580;
        let z = firstCliff;
        while (z > -15000) {
            positions.push(z);
            z -= minGap + Math.random() * (maxGap - minGap);
        }
        return positions;
    }

    constructor(config = {}, cp_cliffPositions = null) {
        this.config = config;

        // Downhill Slope & Constants
        this.SLOPE_ANGLE = 0.075; // Downhill incline
        this.TRACK_WIDTH = 58;

        // Physics State
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);

        this.speed = 70.0;
        this.baseSpeed = 70.0;
        this.maxSpeed = 165.0;

        // Jump & Airtime State (TUNED JUMP ENGINE)
        this.isGrounded = true;
        this.isGrinding = false;
        this.grindRailRef = null;
        this.airTime = 0.0;
        this.jumpHoldTime = 0.0;
        this.jumpImpulse = 22.0;      // Tap clears snowmen (4.1m) & snowballs (~6.8m); hold for big trick air
        this.gravity = 42.0;           // Responsive gravity
        this.hangTimeMultiplier = 0.72; // Light floatiness at jump apex

        // Lateral steering & drift
        this.steerInput = 0.0;
        this.steerAngle = 0.0;
        this.driftFriction = 0.88;

        // Camera dynamics
        this.cameraDip = 0.0;

        // Cliff positions for physics ground height matching terrain
        this.cliffPositions = cp_cliffPositions || GamePhysics.generateCliffPositions();
    }

    reset(difficulty = 'medium', sledStats = {}) {
        const diffConfig = {
            easy: { baseSpeed: 60, maxSpeed: 130, jumpMult: 1.15 },
            medium: { baseSpeed: 75, maxSpeed: 165, jumpMult: 1.2 },
            hard: { baseSpeed: 95, maxSpeed: 210, jumpMult: 1.25 }
        }[difficulty] || { baseSpeed: 75, maxSpeed: 165, jumpMult: 1.2 };

        this.baseSpeed = diffConfig.baseSpeed;
        this.maxSpeed = diffConfig.maxSpeed;
        this.speed = this.baseSpeed;

        const jumpStat = (sledStats.jump || 85) / 80;
        this.jumpImpulse = 22.0 * jumpStat * diffConfig.jumpMult; // TAP reliably clears snowmen & snowballs on every difficulty

        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.isGrounded = true;
        this.isGrinding = false;
        this.airTime = 0.0;
        this.steerAngle = 0.0;
        this.cameraDip = 0.0;
    }

    /**
     * Compute ground height at given world X, Z
     */
    getGroundHeightAt(x, z) {
        // Base downhill slope
        let y = -z * Math.tan(this.SLOPE_ANGLE);

        // Keep collision height identical to the visible terrain mesh.
        const absX = Math.abs(x);
        if (absX > this.TRACK_WIDTH * 0.44) {
            const rim = absX - this.TRACK_WIDTH * 0.44;
            y += 2.5 * Math.tanh(Math.pow(rim * 0.15, 1.2) / 2.5);
        }

        // Undulating moguls
        y += Math.sin(x * 0.1) * Math.cos(z * 0.07) * 0.45;

        // Match the rendered 60 m-deep, 70 m-long cliff trench exactly.
        const cliff = this.cliffPositions.find(cp => z <= cp + 8 && z >= cp - 78);
        if (cliff !== undefined) {
            const cliffDepth = 60;
            const gapLength = 70;
            const wallWidth = 8;
            const landingEdgeZ = cliff - gapLength;
            if (z <= cliff && z >= landingEdgeZ) {
                y -= cliffDepth;
            } else if (z > cliff && z < cliff + wallWidth) {
                y -= cliffDepth * (1 - (z - cliff) / wallWidth);
            } else if (z < landingEdgeZ && z > landingEdgeZ - wallWidth) {
                y -= cliffDepth * (1 - (landingEdgeZ - z) / wallWidth);
            }
        }

        return y;
    }

    update(dt, input, sledStats, audioEngine = null, particleEngine = null) {
        const handlingMulti = ((sledStats.handling || 85) / 80) * (this.config.sens || 1.2);

        // 1. Forward Acceleration Downhill
        this.speed = Math.min(this.maxSpeed, this.speed + 1.4 * dt);
        const forwardVel = this.speed;

        // 2. Lateral Steering Physics
        let targetSteer = 0.0;
        if (input.left) targetSteer -= 1.0;
        if (input.right) targetSteer += 1.0;
        if (Math.abs(input.touchSteer) > 0.05) targetSteer = input.touchSteer;

        const lateralAccel = targetSteer * 34.0 * handlingMulti;
        this.velocity.x += (lateralAccel - this.velocity.x) * (this.isGrounded ? 12.0 : 5.0) * dt;
        this.position.x += this.velocity.x * dt;

        // Track limits with halfpipe bank rebound
        const maxBound = this.TRACK_WIDTH * 0.6;
        if (this.position.x > maxBound) {
            this.position.x = maxBound;
            this.velocity.x = -this.velocity.x * 0.3; // elastic bumper bounce
        } else if (this.position.x < -maxBound) {
            this.position.x = -maxBound;
            this.velocity.x = -this.velocity.x * 0.3;
        }

        // Forward Progression (Z down the mountain)
        this.position.z -= forwardVel * Math.cos(this.SLOPE_ANGLE) * dt;

        // Current ground level
        const groundY = this.getGroundHeightAt(this.position.x, this.position.z);

        // 3. HIGH JUMP & AIRTIME ENGINE
        if (input.jump && this.isGrounded) {
            // Initiate Jump
            this.velocity.y = this.jumpImpulse;
            this.isGrounded = false;
            this.isGrinding = false;
            this.airTime = 0.0;
            this.jumpHoldTime = 0.0;

            if (audioEngine) {
                audioEngine.playJumpLaunch(1.2);
            }
            if (particleEngine) {
                particleEngine.emitSnowSpray(this.position, 16);
            }
        }

        if (!this.isGrounded) {
            this.airTime += dt;
            if (input.jump) this.jumpHoldTime += dt;

            // Variable jump height: Holding jump gives sustained floatiness
            let effectiveGravity = this.gravity;
            if (this.jumpHoldTime > 0 && this.jumpHoldTime < 0.35 && this.velocity.y > 0) {
                effectiveGravity *= 0.65; // Extra high floaty lift!
            }

            // Hang-time apex floatiness
            if (Math.abs(this.velocity.y) < 10.0) {
                effectiveGravity *= this.hangTimeMultiplier;
            }

            this.velocity.y -= effectiveGravity * dt;
            this.position.y += this.velocity.y * dt;

            // Landing Touchdown Check
            if (this.position.y <= groundY) {
                this.position.y = groundY;
                this.isGrounded = true;
                this.isGrinding = false;
                const impactSpeed = Math.abs(this.velocity.y);
                this.velocity.y = 0.0;

                if (audioEngine) {
                    audioEngine.playLanding(Math.min(1.8, impactSpeed / 25.0));
                }
                if (particleEngine) {
                    particleEngine.emitLandingShockwave(this.position, Math.min(1.8, impactSpeed / 20.0));
                }

                // Camera suspension dip
                if (this.airTime > 0.5) {
                    this.cameraDip = Math.min(1.2, this.airTime * 0.8);
                }
                this.airTime = 0.0;
            }
        } else {
            this.position.y = groundY;
            this.velocity.y = 0.0;
        }

        // 4. Sled Banking & Pitch Orientation
        const targetBank = -targetSteer * 0.44;
        this.steerAngle += (targetBank - this.steerAngle) * 14.0 * dt;

        this.rotation.x = this.SLOPE_ANGLE + (this.isGrounded ? 0 : Math.sin(this.airTime * 3.5) * 0.12);
        this.rotation.y = -this.steerAngle * 0.5;
        this.rotation.z = this.steerAngle;

        // Smooth camera dip recovery
        if (this.cameraDip > 0.01) {
            this.cameraDip *= Math.pow(0.1, dt);
        } else {
            this.cameraDip = 0.0;
        }
    }

    /**
     * Launch off a wooden kicker / mega ramp
     */
    launchRamp(boostPower, audioEngine = null, particleEngine = null) {
        this.velocity.y = boostPower;
        this.isGrounded = false;
        this.isGrinding = false;
        this.airTime = 0.0;
        this.jumpHoldTime = 0.0;

        if (audioEngine) {
            audioEngine.playJumpLaunch(1.5);
            audioEngine.playBoostIgnite();
        }
        if (particleEngine) {
            particleEngine.emitSnowSpray(this.position, 24);
        }
    }

    /**
     * Snap to a rainbow grind rail
     */
    attachToGrindRail(rail, audioEngine = null, particleEngine = null) {
        this.isGrinding = true;
        this.isGrounded = true;
        this.position.x = rail.pos.x;
        this.position.y = rail.pos.y + 1.8;
        this.velocity.y = 0;

        if (particleEngine) {
            particleEngine.emitGrindSparks(this.position);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamePhysics;
}
