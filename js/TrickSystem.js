/**
 * ============================================================================
 * SNOW ANSHER 3D - AERIAL STUNT & TRICK COMBO ENGINE
 * Real-time rotational stunt detection, airtime multipliers, combo strings,
 * clean landing bonuses, trick score calculation, and UI callout alerts.
 * ============================================================================
 */

class TrickSystem {
    constructor() {
        this.currentStunt = null;
        this.airTime = 0.0;
        this.comboCount = 0;
        this.comboMultiplier = 1.0;
        this.trickScore = 0;
        this.stuntQueue = [];

        // Stunt database
        this.stuntList = {
            spin360: { name: "360 SPIN", score: 150, minAirTime: 0.35 },
            backflip: { name: "BACKFLIP", score: 300, minAirTime: 0.5 },
            superman: { name: "SUPERMAN", score: 400, minAirTime: 0.6 },
            method: { name: "METHOD AIR", score: 250, minAirTime: 0.4 },
            tailgrab: { name: "TAIL GRAB", score: 200, minAirTime: 0.35 },
            rodeo720: { name: "RODEO 720", score: 650, minAirTime: 0.75 },
            ironlotus: { name: "IRON LOTUS", score: 850, minAirTime: 0.9 }
        };
    }

    startJump() {
        this.airTime = 0.0;
        this.comboCount = 0;
        this.comboMultiplier = 1.0;
        this.trickScore = 0;
        this.currentStunt = null;
        this.stuntQueue = [];
    }

    update(dt, input, isGrounded, riderRig = null, audioEngine = null) {
        if (!isGrounded) {
            this.airTime += dt;

            // Detect trick inputs during flight
            let trickTriggered = null;

            if (input.keyE || input.keyQ) {
                trickTriggered = this.airTime > 0.7 ? 'ironlotus' : 'method';
            } else if (input.down) {
                trickTriggered = this.airTime > 0.6 ? 'rodeo720' : 'backflip';
            } else if (input.up) {
                trickTriggered = 'superman';
            } else if (input.left || input.right) {
                trickTriggered = 'spin360';
            }

            if (trickTriggered && (!this.currentStunt || this.currentStunt !== trickTriggered)) {
                const stuntData = this.stuntList[trickTriggered];
                if (stuntData && this.airTime >= stuntData.minAirTime) {
                    this.currentStunt = trickTriggered;
                    if (!this.stuntQueue.includes(trickTriggered)) {
                        this.stuntQueue.push(trickTriggered);
                        this.comboCount++;
                        this.comboMultiplier = 1.0 + (this.comboCount - 1) * 0.5;
                        this.trickScore += Math.floor(stuntData.score * this.comboMultiplier);

                        if (audioEngine) {
                            audioEngine.playTrickSuccess(stuntData.score);
                        }

                        // Dispatch UI notification
                        this.dispatchTrickNotification(stuntData.name, this.comboMultiplier);
                    }
                }
            }

            // Animate trick on rider model
            if (riderRig && this.currentStunt) {
                riderRig.applyTrickPose(this.currentStunt, this.airTime);
            }
        }
    }

    /**
     * Called upon touchdown
     */
    resolveLanding() {
        const result = {
            totalBonus: this.trickScore,
            comboCount: this.comboCount,
            stunts: [...this.stuntQueue],
            cleanLanding: (this.stuntQueue.length > 0)
        };

        this.currentStunt = null;
        this.stuntQueue = [];
        this.trickScore = 0;
        this.comboCount = 0;

        return result;
    }

    dispatchTrickNotification(name, multi) {
        const popup = document.getElementById('combo-popup');
        if (popup) {
            const multiText = multi > 1.0 ? ` (x${multi.toFixed(1)})` : '';
            popup.innerHTML = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:middle"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${name} +${Math.floor(this.trickScore)}m${multiText} <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:middle"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 800);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrickSystem;
}
