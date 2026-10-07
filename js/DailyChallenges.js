/**
 * ============================================================================
 * SNOW ANSHER 3D - DAILY ALPINE MISSIONS & REWARD PROGRESSION
 * Generates 3 rotating daily downhill objectives (Mega Airtime, Speed Streaks,
 * Gift Hunts, Stunt Combinations) with automated daily reset and gift payouts.
 * ============================================================================
 */

class DailyChallengesManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.activeMissions = [];
        this.lastRefreshDate = "";

        this.missionPool = [
            { id: 'airtime_master', title: 'Hang-Time King', desc: 'Accumulate 12s of total airtime in one run', target: 12, current: 0, reward: 50, metric: 'airtime' },
            { id: 'speed_streak', title: 'Mach 1 Descent', desc: 'Sustain >140 KM/H speed for 8 seconds', target: 8, current: 0, reward: 40, metric: 'speed_time' },
            { id: 'gift_hunter', title: 'Gift Bonanza', desc: 'Collect 20 holiday gifts in a single run', target: 20, current: 0, reward: 45, metric: 'gifts' },
            { id: 'close_call_streak', title: 'Danger Zone', desc: 'Perform 6 Close Calls in one run', target: 6, current: 0, reward: 55, metric: 'close_calls' },
            { id: 'mega_kicker', title: 'Space Program', desc: 'Launch off 4 Mega Ramps in one run', target: 4, current: 0, reward: 60, metric: 'ramps' },
            { id: 'rail_slider', title: 'Rainbow Grinder', desc: 'Grind along 3 Rainbow Ice Rails', target: 3, current: 0, reward: 50, metric: 'rails' }
        ];

        this.initMissions();
    }

    initMissions() {
        const today = new Date().toISOString().split('T')[0];
        const savedDate = localStorage.getItem('sr3d_mission_date');

        if (savedDate === today) {
            const saved = localStorage.getItem('sr3d_active_missions');
            if (saved) {
                this.activeMissions = JSON.parse(saved);
                return;
            }
        }

        // Generate 3 fresh random missions for today
        this.refreshMissions(today);
    }

    refreshMissions(today) {
        const shuffled = [...this.missionPool].sort(() => 0.5 - Math.random());
        this.activeMissions = shuffled.slice(0, 3).map(m => ({
            ...m,
            current: 0,
            completed: false
        }));

        this.lastRefreshDate = today;
        localStorage.setItem('sr3d_mission_date', today);
        localStorage.setItem('sr3d_active_missions', JSON.stringify(this.activeMissions));
    }

    save() {
        localStorage.setItem('sr3d_active_missions', JSON.stringify(this.activeMissions));
    }

    reportMetric(metric, amount = 1) {
        let anyCompleted = false;

        this.activeMissions.forEach(m => {
            if (!m.completed && m.metric === metric) {
                m.current += amount;
                if (m.current >= m.target) {
                    m.completed = true;
                    m.current = m.target;
                    anyCompleted = true;
                    this.claimReward(m);
                }
            }
        });

        if (anyCompleted) this.save();
    }

    claimReward(mission) {
        this.game.totalGifts += mission.reward;
        localStorage.setItem('sr3d_gifts', this.game.totalGifts);

        const toast = document.createElement('div');
        toast.className = 'achievement-toast show';
        toast.innerHTML = `
            <div style="font-size: 22px; color: #ffd166;"><i class="fas fa-gift"></i></div>
            <div>
                <div style="font-size: 11px; letter-spacing: 2px; color: #ffd166; font-weight: bold;">MISSION COMPLETE!</div>
                <div style="font-family: 'Orbitron'; font-size: 15px; font-weight: bold; color: white;">${mission.title}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">+${mission.reward} Holiday Gifts Awarded!</div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyChallengesManager;
}
