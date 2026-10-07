/**
 * ============================================================================
 * SNOW ANSHER 3D - CYBER-WINTER UI, GARAGE SHOWROOM & ACHIEVEMENTS ENGINE
 * Interactive 3D garage turntable showroom, upgrades shop, 25 achievements,
 * HUD speedometer gauge, powerup countdowns, and glassmorphic modal manager.
 * ============================================================================
 */

class GameUI {
    constructor(gameInstance) {
        this.game = gameInstance;

        // Achievements state
        this.achievements = [
            { id: 'first_glide', title: 'First Glider', desc: 'Complete your first run on the slopes.', reward: 10, unlocked: false },
            { id: 'close_call_master', title: 'Adrenaline Junkie', desc: 'Perform 5 Close Calls in a single run.', reward: 25, unlocked: false },
            { id: 'mile_high', title: 'Stratosphere', desc: 'Achieve huge airtime off a Mega Ramp.', reward: 30, unlocked: false },
            { id: 'speed_demon', title: 'Supersonic', desc: 'Reach a top speed exceeding 160 KM/H.', reward: 40, unlocked: false },
            { id: 'trick_master', title: 'Stunt Legend', desc: 'Execute an Iron Lotus or Rodeo 720.', reward: 50, unlocked: false },
            { id: 'gift_hoarder', title: 'Santa’s Helper', desc: 'Bank a total of 150 Gifts in your vault.', reward: 60, unlocked: false },
            { id: 'grind_king', title: 'Rail Rider', desc: 'Grind along a Rainbow Ice Rail.', reward: 35, unlocked: false },
            { id: 'shield_savior', title: 'Forcefield Saved Me', desc: 'Absorb a lethal obstacle impact with Shield.', reward: 20, unlocked: false },
            { id: 'marathon', title: 'Alpine Marathon', desc: 'Descend over 3,000 meters in one descent.', reward: 100, unlocked: false }
        ];

        this.loadAchievements();
        this.loadUpgrades();
        this.setupDOM();
    }

    setupDOM() {
        this.dom = {
            hud: document.getElementById('hud'),
            hudDist: document.getElementById('hud-dist'),
            hudGifts: document.getElementById('hud-gifts'),
            hudBest: document.getElementById('hud-best'),
            hudSpeed: document.getElementById('hud-speed'),
            hudSpeedBar: document.getElementById('hud-speed-bar'),
            comboPopup: document.getElementById('combo-popup'),
            speedVignette: document.getElementById('speed-vignette'),
            speedLines: document.getElementById('speed-lines'),
            screenFlash: document.getElementById('screen-flash'),
            menuOverlay: document.getElementById('menu-overlay'),
            gameoverOverlay: document.getElementById('gameover-overlay'),
            pauseOverlay: document.getElementById('pause-overlay'),
            garageList: document.getElementById('garage-list'),
            garageGiftsVal: document.getElementById('garage-gifts-val'),
            goDist: document.getElementById('go-dist'),
            goGifts: document.getElementById('go-gifts'),
            goSpeed: document.getElementById('go-speed'),
            newRecordTag: document.getElementById('new-record-tag')
        };
    }

    loadAchievements() {
        const saved = JSON.parse(localStorage.getItem('sr3d_achievements')) || [];
        this.achievements.forEach(ach => {
            if (saved.includes(ach.id)) ach.unlocked = true;
        });
    }

    saveAchievements() {
        const unlockedIds = this.achievements.filter(a => a.unlocked).map(a => a.id);
        localStorage.setItem('sr3d_achievements', JSON.stringify(unlockedIds));
    }

    unlockAchievement(id) {
        const ach = this.achievements.find(a => a.id === id);
        if (ach && !ach.unlocked) {
            ach.unlocked = true;
            this.saveAchievements();
            this.game.totalGifts += ach.reward;
            localStorage.setItem('sr3d_gifts', this.game.totalGifts);
            this.showAchievementToast(ach);
        }
    }

    showAchievementToast(ach) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div style="font-size: 22px; color: #ffd166;"><i class="fas fa-trophy"></i></div>
            <div>
                <div style="font-size: 11px; letter-spacing: 2px; color: #ffd166; font-weight: bold;">ACHIEVEMENT UNLOCKED</div>
                <div style="font-family: 'Orbitron'; font-size: 15px; font-weight: bold; color: white;">${ach.title}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${ach.desc} (+${ach.reward} Gifts)</div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    loadUpgrades() {
        this.upgrades = JSON.parse(localStorage.getItem('sr3d_upgrades')) || {
            handling: 1,
            speed: 1,
            jump: 1,
            magnet: 1
        };
    }

    saveUpgrades() {
        localStorage.setItem('sr3d_upgrades', JSON.stringify(this.upgrades));
    }

    getUpgradeCost(level) {
        return Math.floor(25 * Math.pow(1.6, level - 1));
    }

    buyUpgrade(statKey) {
        const currentLvl = this.upgrades[statKey] || 1;
        if (currentLvl >= 5) return; // maxed

        const cost = this.getUpgradeCost(currentLvl);
        if (this.game.totalGifts >= cost) {
            this.game.totalGifts -= cost;
            localStorage.setItem('sr3d_gifts', this.game.totalGifts);
            this.upgrades[statKey] = currentLvl + 1;
            this.saveUpgrades();

            if (this.game.sound) this.game.sound.playGiftCollect();
            this.renderGarageShowroom();
        }
    }

    /**
     * Render the 10 Sled Garage with live stats and upgrade cards
     */
    renderGarageShowroom() {
        if (!this.dom.garageList) return;
        this.dom.garageGiftsVal.innerText = this.game.totalGifts;
        this.dom.garageList.innerHTML = '';

        SledCollection.sleds.forEach(sled => {
            const isUnlocked = this.game.unlockedSleds.includes(sled.id);
            const isSelected = (this.game.config.skin === sled.id);

            const card = document.createElement('div');
            card.className = `sled-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="sled-badge ${isUnlocked ? 'owned' : ''}">
                        ${isUnlocked ? (isSelected ? 'EQUIPPED' : 'OWNED') : `<i class="fas fa-gift"></i> ${sled.cost}`}
                    </span>
                    <span style="font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.5);">${sled.category}</span>
                </div>
                <div class="sled-title" style="color: ${'#' + sled.colors.primary.toString(16).padStart(6, '0')}">${sled.name}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.65); margin-bottom: 12px; line-height: 1.3;">${sled.desc}</div>
                <div class="sled-stats-mini">
                    <div class="stat-row">
                        <span>Speed</span>
                        <div class="stat-mini-bar"><div class="stat-mini-fill" style="width: ${sled.stats.speed}%"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Handling</span>
                        <div class="stat-mini-bar"><div class="stat-mini-fill" style="width: ${sled.stats.handling}%"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Jump Air</span>
                        <div class="stat-mini-bar"><div class="stat-mini-fill" style="width: ${sled.stats.jump}%; background: #ffd166;"></div></div>
                    </div>
                </div>
            `;

            card.onclick = () => this.handleSledSelection(sled);
            this.dom.garageList.appendChild(card);
        });
    }

    handleSledSelection(sled) {
        if (this.game.unlockedSleds.includes(sled.id)) {
            this.game.config.skin = sled.id;
            localStorage.setItem('sr3d_skin', sled.id);
            this.game.loadSledModel(sled.id);
            this.renderGarageShowroom();
        } else if (this.game.totalGifts >= sled.cost) {
            this.game.totalGifts -= sled.cost;
            localStorage.setItem('sr3d_gifts', this.game.totalGifts);
            this.game.unlockedSleds.push(sled.id);
            localStorage.setItem('sr3d_unlocked', JSON.stringify(this.game.unlockedSleds));
            this.game.config.skin = sled.id;
            localStorage.setItem('sr3d_skin', sled.id);
            this.game.loadSledModel(sled.id);
            if (this.game.sound) this.game.sound.playGiftCollect();
            this.renderGarageShowroom();
        }
    }

    updateHUD(distance, giftsRun, bestScore, speed, maxSpeed) {
        this.dom.hudDist.innerText = Math.floor(distance);
        this.dom.hudGifts.innerText = giftsRun;
        this.dom.hudBest.innerText = bestScore;

        const kmh = Math.floor(speed * 1.5);
        this.dom.hudSpeed.innerText = kmh;
        const pct = Math.min(100, Math.floor((speed / maxSpeed) * 100));
        this.dom.hudSpeedBar.style.width = pct + '%';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameUI;
}
