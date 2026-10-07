/**
 * ============================================================================
 * SNOW ANSHER 3D - EXTREME STUNT COMBO & ROTATION TRACKER ENGINE
 * Tracks high-precision rotational degrees (360, 720, 1080), flip inversions,
 * grab variations, apex jump altitudes, style rank tiers, and combo streak chains.
 * ============================================================================
 */

class StuntComboEngine {
    constructor() {
        this.currentRunTricks = [];
        this.totalStuntPoints = 0;
        this.bestComboMultiplier = 1.0;
        this.currentStreak = 0;

        // Active jump tracker
        this.inAir = false;
        this.accumulatedYaw = 0.0;
        this.accumulatedPitch = 0.0;
        this.accumulatedRoll = 0.0;
        this.peakAltitude = 0.0;
        this.jumpAirtime = 0.0;
        this.grabsHeld = [];

        this.styleRanks = [
            { minScore: 0, title: "CLEAN", color: "#ffffff" },
            { minScore: 250, title: "SICK!", color: "#00d2ff" },
            { minScore: 600, title: "EPIC!", color: "#f1c40f" },
            { minScore: 1200, title: "INSANE!", color: "#ff4757" },
            { minScore: 2500, title: "LEGENDARY!", color: "#a55eea" }
        ];
    }

    startAirtime(altitude) {
        this.inAir = true;
        this.accumulatedYaw = 0.0;
        this.accumulatedPitch = 0.0;
        this.accumulatedRoll = 0.0;
        this.peakAltitude = altitude;
        this.jumpAirtime = 0.0;
        this.grabsHeld = [];
    }

    updateInFlight(dt, rotDelta, currentAlt) {
        if (!this.inAir) return;

        this.jumpAirtime += dt;
        this.accumulatedYaw += Math.abs(rotDelta.y);
        this.accumulatedPitch += Math.abs(rotDelta.x);
        this.accumulatedRoll += Math.abs(rotDelta.z);

        if (currentAlt > this.peakAltitude) {
            this.peakAltitude = currentAlt;
        }
    }

    addGrab(grabName) {
        if (!this.grabsHeld.includes(grabName)) {
            this.grabsHeld.push(grabName);
        }
    }

    evaluateLanding(isCrash = false) {
        this.inAir = false;

        if (isCrash) {
            this.currentStreak = 0;
            return { success: false, score: 0, title: "WIPEOUT" };
        }

        // Calculate completed full 360 spins and flips
        const fullSpins = Math.floor(this.accumulatedYaw / (Math.PI * 2));
        const fullFlips = Math.floor(this.accumulatedPitch / (Math.PI * 2));

        let basePoints = 0;
        const trickNames = [];

        if (fullSpins >= 3) {
            trickNames.push("1080 CORKSCREW");
            basePoints += 1200;
        } else if (fullSpins === 2) {
            trickNames.push("720 SPIN");
            basePoints += 600;
        } else if (fullSpins === 1) {
            trickNames.push("360 SPIN");
            basePoints += 200;
        }

        if (fullFlips >= 2) {
            trickNames.push("DOUBLE BACKFLIP");
            basePoints += 1000;
        } else if (fullFlips === 1) {
            trickNames.push("BACKFLIP");
            basePoints += 350;
        }

        // Add grab points
        this.grabsHeld.forEach(grab => {
            trickNames.push(grab.toUpperCase());
            basePoints += 150;
        });

        // Airtime altitude bonus
        const altitudeBonus = Math.floor(this.peakAltitude * 15);
        basePoints += altitudeBonus;

        if (basePoints > 0) {
            this.currentStreak++;
            const multi = 1.0 + (this.currentStreak - 1) * 0.4;
            const finalScore = Math.floor(basePoints * multi);

            this.totalStuntPoints += finalScore;
            if (multi > this.bestComboMultiplier) {
                this.bestComboMultiplier = multi;
            }

            const style = this.getStyleRank(finalScore);

            return {
                success: true,
                score: finalScore,
                tricks: trickNames,
                altitude: Math.floor(this.peakAltitude),
                streak: this.currentStreak,
                multiplier: multi,
                style: style
            };
        }

        return { success: true, score: 0, tricks: [], streak: this.currentStreak };
    }

    getStyleRank(score) {
        let bestRank = this.styleRanks[0];
        for (let i = 0; i < this.styleRanks.length; i++) {
            if (score >= this.styleRanks[i].minScore) {
                bestRank = this.styleRanks[i];
            }
        }
        return bestRank;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StuntComboEngine;
}
