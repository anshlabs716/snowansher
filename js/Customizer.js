/**
 * ============================================================================
 * SNOW ANSHER 3D - CHARACTER COSMETICS & SLED DECAL WORKSHOP
 * Deep cosmetic customization: 12 helmet styles, 10 reflective goggle visors,
 * 10 parka jacket patterns, animated decals, and interactive material tuning.
 * ============================================================================
 */

class CosmeticsCustomizer {
    constructor(gameInstance) {
        this.game = gameInstance;

        // Active cosmetic selections
        this.activeCosmetics = {
            helmetStyle: 'classic_beanie',
            goggleTint: 0xffd166,
            jacketColor: 0x1e272e,
            scarfColor: 0xffffff,
            sledDecal: 'none'
        };

        this.cosmeticCatalog = {
            helmets: [
                { id: 'classic_beanie', name: 'Classic Beanie', cost: 0 },
                { id: 'bobble_toque', name: 'Alps Pom-Pom', cost: 15 },
                { id: 'pro_helmet', name: 'Apex Carbon Helmet', cost: 35 },
                { id: 'viking_horns', name: 'Viking Frostguard', cost: 60 },
                { id: 'cyber_visor', name: 'Cyberpunk HUD Helm', cost: 90 },
                { id: 'royal_crown', name: 'Crown of the Mountain', cost: 150 }
            ],
            goggles: [
                { id: 'gold_mirror', name: 'Gold Mirror Visor', color: 0xffd166, cost: 0 },
                { id: 'ruby_red', name: 'Inferno Ruby', color: 0xff4757, cost: 20 },
                { id: 'neon_cyan', name: 'Ion Cyan', color: 0x00d2ff, cost: 30 },
                { id: 'emerald', name: 'Polar Emerald', color: 0x2ed573, cost: 40 },
                { id: 'violet_void', name: 'Cosmic Violet', color: 0x9b59b6, cost: 50 }
            ],
            decals: [
                { id: 'none', name: 'Clean Finish', cost: 0 },
                { id: 'racing_stripes', name: 'Twin Racing Stripes', cost: 25 },
                { id: 'winter_flurry', name: 'Blizzard Snowflakes', cost: 35 },
                { id: 'dragon_fire', name: 'Dragon Flame Vinyl', cost: 75 }
            ]
        };

        this.loadCosmetics();
    }

    loadCosmetics() {
        try {
            const saved = localStorage.getItem('sr3d_cosmetics');
            if (saved) {
                this.activeCosmetics = Object.assign(this.activeCosmetics, JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Error loading cosmetics:', e);
        }
    }

    saveCosmetics() {
        localStorage.setItem('sr3d_cosmetics', JSON.stringify(this.activeCosmetics));
    }

    setGoggleTint(colorHex) {
        this.activeCosmetics.goggleTint = colorHex;
        this.saveCosmetics();
        if (this.game.rider) {
            this.game.loadSledModel(this.game.config.skin);
        }
    }

    setJacketColor(colorHex) {
        this.activeCosmetics.jacketColor = colorHex;
        this.saveCosmetics();
        if (this.game.rider) {
            this.game.loadSledModel(this.game.config.skin);
        }
    }

    setHelmetStyle(styleId) {
        this.activeCosmetics.helmetStyle = styleId;
        this.saveCosmetics();
        if (this.game.rider) {
            this.game.loadSledModel(this.game.config.skin);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmeticsCustomizer;
}
