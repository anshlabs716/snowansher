/**
 * ============================================================================
 * SNOW ANSHER 3D - TELEMETRY RECORDER & LOCAL LEADERBOARD SYSTEM
 * Live physics telemetry (G-force, altitude, drift angle, trick stats),
 * top 10 local hall of fame leaderboards, and run history tracker.
 * ============================================================================
 */

class TelemetryAndLeaderboard {
    constructor() {
        this.leaderboard = [];
        this.currentRunTelemetry = {
            maxAltitude: 0,
            maxSpeed: 0,
            totalAirtime: 0,
            stuntsPerformed: 0,
            distance: 0,
            gifts: 0,
            startTime: 0
        };

        this.loadLeaderboard();
    }

    loadLeaderboard() {
        try {
            const saved = localStorage.getItem('sr3d_leaderboard');
            if (saved) {
                this.leaderboard = JSON.parse(saved);
            } else {
                // Default high scores to beat
                this.leaderboard = [
                    { rank: 1, name: "Yuki (Pro)", distance: 4250, sled: "Hellfire Demon", date: "2026-09-12" },
                    { rank: 2, name: "Frostbite", distance: 3820, sled: "Frostbite Apex", date: "2026-09-15" },
                    { rank: 3, name: "BlizzardKing", distance: 3100, sled: "Santa's Rocket", date: "2026-09-18" },
                    { rank: 4, name: "AlpineGhost", distance: 2450, sled: "Neon Phantom", date: "2026-09-20" },
                    { rank: 5, name: "Rookie", distance: 1520, sled: "Alpine Cruiser", date: "2026-09-22" }
                ];
                this.saveLeaderboard();
            }
        } catch (e) {
            console.warn('Leaderboard load error:', e);
        }
    }

    saveLeaderboard() {
        try {
            localStorage.setItem('sr3d_leaderboard', JSON.stringify(this.leaderboard));
        } catch (e) {
            console.warn('Leaderboard save error:', e);
        }
    }

    startRun() {
        this.currentRunTelemetry = {
            maxAltitude: 0,
            maxSpeed: 0,
            totalAirtime: 0,
            stuntsPerformed: 0,
            distance: 0,
            gifts: 0,
            startTime: Date.now()
        };
    }

    updateTelemetry(speed, altitude, airtime, distance, gifts) {
        if (speed > this.currentRunTelemetry.maxSpeed) {
            this.currentRunTelemetry.maxSpeed = speed;
        }
        if (altitude > this.currentRunTelemetry.maxAltitude) {
            this.currentRunTelemetry.maxAltitude = altitude;
        }
        this.currentRunTelemetry.totalAirtime += airtime;
        this.currentRunTelemetry.distance = distance;
        this.currentRunTelemetry.gifts = gifts;
    }

    recordRun(distance, sledName, playerName = "You") {
        const newEntry = {
            rank: 0,
            name: playerName,
            distance: Math.floor(distance),
            sled: sledName,
            date: new Date().toISOString().split('T')[0]
        };

        this.leaderboard.push(newEntry);
        this.leaderboard.sort((a, b) => b.distance - a.distance);
        this.leaderboard = this.leaderboard.slice(0, 10);

        // Re-assign ranks
        this.leaderboard.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });

        this.saveLeaderboard();
        return this.leaderboard;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelemetryAndLeaderboard;
}
