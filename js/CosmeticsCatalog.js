/**
 * ============================================================================
 * SNOW ANSHER 3D - 50+ COSMETICS, SKINS & PARTICLE TRAIL CATALOG
 * 6 Customization Categories: Helmets, Goggles, Parka Suits, Sled Skins,
 * Ski Particle Trails, and Horn SFX with Rarity Tiers and Lore.
 * ============================================================================
 */

const CosmeticsCatalog = {
    rarityColors: {
        common: '#ffffff',
        rare: '#00d2ff',
        epic: '#9b59b6',
        legendary: '#ffd166'
    },

    categories: [
        // ─── 1. HEADWEAR & HELMETS (10 Items) ───
        {
            category: "helmets",
            name: "Headwear",
            items: [
                { id: "h_beanie_red", name: "Alpine Red Beanie", rarity: "common", cost: 0, desc: "A cozy knit wool beanie designed for chill mountain descents." },
                { id: "h_beanie_cyan", name: "Glacier Blue Toque", rarity: "common", cost: 10, desc: "Thermal knit cap woven with windproof polar fibers." },
                { id: "h_pom_yellow", name: "Chalet Bobble Cap", rarity: "common", cost: 20, desc: "Classic winter pom-pom beanie popular in the Swiss Alps." },
                { id: "h_earmuffs", name: "Furry Snow Muffs", rarity: "rare", cost: 35, desc: "Fluffy ear warmers with built-in sub-zero thermal padding." },
                { id: "h_pro_carbon", name: "Apex Carbon Helmet", rarity: "rare", cost: 50, desc: "Lightweight carbon-fiber downhill racing helmet." },
                { id: "h_viking", name: "Frostguard Viking Helm", rarity: "epic", cost: 85, desc: "Carved from ancient alpine oak with ivory horns." },
                { id: "h_pilot", name: "Aviator Shearling Cap", rarity: "rare", cost: 45, desc: "Vintage leather bomber hat with fold-down ear flaps." },
                { id: "h_cyber_visor", name: "Neon Cyber Shroud", rarity: "epic", cost: 120, desc: "Heads-up display helmet projecting real-time velocity." },
                { id: "h_santa_hat", name: "Santa’s Trimmed Cap", rarity: "rare", cost: 40, desc: "Festive velvet hat with a fluffy white snowflake trim." },
                { id: "h_crown_ice", name: "Crown of the Mountain", rarity: "legendary", cost: 250, desc: "Forged from everlasting glacial permafrost diamonds." }
            ]
        },

        // ─── 2. GOGGLES & VISORS (10 Items) ───
        {
            category: "goggles",
            name: "Goggles",
            items: [
                { id: "g_gold_mirror", name: "Solstice Gold Mirror", rarity: "common", cost: 0, color: 0xffd166, desc: "Reflective amber lens offering anti-glare protection." },
                { id: "g_inferno_ruby", name: "Inferno Ruby Lens", rarity: "rare", cost: 25, color: 0xff4757, desc: "Crimson polarized glass highlighting terrain moguls." },
                { id: "g_cyan_ion", name: "Ion Glacier Cyan", rarity: "rare", cost: 30, color: 0x00d2ff, desc: "Electrified neon blue visor with UV polar filtering." },
                { id: "g_polar_emerald", name: "Polar Emerald Glass", rarity: "epic", cost: 55, color: 0x2ed573, desc: "Luminous emerald lens tuned for low-visibility blizzards." },
                { id: "g_cosmic_violet", name: "Cosmic Nebula Violet", rarity: "epic", cost: 65, color: 0x9b59b6, desc: "Iridescent purple sheen reflecting deep alpine skies." },
                { id: "g_silver_chrome", name: "Liquid Chrome Shield", rarity: "rare", cost: 45, color: 0xe0e0e0, desc: "Mirror finish reflecting the snowy mountain peaks." },
                { id: "g_cyber_hud", name: "Cyber Matrix Display", rarity: "legendary", cost: 180, color: 0x00ffff, desc: "Digital augmented visor tracking hazard trajectory lines." },
                { id: "g_blackout", name: "Stealth Obsidian Tint", rarity: "rare", cost: 40, color: 0x222222, desc: "Ultra-dark high-contrast tint for bright sunny snowfields." },
                { id: "g_aurora_shimmer", name: "Spectral Aurora Prism", rarity: "legendary", cost: 200, color: 0x1dd1a1, desc: "Prismatic crystal shifts color as camera angle rotates." },
                { id: "g_snowblind", name: "Frostbite Crystal", rarity: "epic", cost: 75, color: 0xffffff, desc: "Crystalline faceted ice frame that glints in sunlight." }
            ]
        },

        // ─── 3. PARKA SUITS & JACKETS (10 Items) ───
        {
            category: "jackets",
            name: "Parka Jackets",
            items: [
                { id: "j_classic_black", name: "Obsidian Winter Parka", rarity: "common", cost: 0, color: 0x1e272e, desc: "Heavyweight goose-down insulated expedition jacket." },
                { id: "j_racing_red", name: "Alpine Speed Red", rarity: "common", cost: 20, color: 0xd63031, desc: "Aero-shell jacket optimized for minimum wind drag." },
                { id: "j_glacier_camo", name: "Snowdrift Arctic Camo", rarity: "rare", cost: 40, color: 0x74b9ff, desc: "Geometric white and light blue mountain camo print." },
                { id: "j_forest_green", name: "Evergreen Ranger Coat", rarity: "rare", cost: 45, color: 0x27ae60, desc: "Waterproof insulated canvas built for back-country slopes." },
                { id: "j_neon_cyber", name: "Cyber Neon Windbreaker", rarity: "epic", cost: 95, color: 0x00d2ff, desc: "Bioluminescent fiber-optic seams that pulse with speed." },
                { id: "j_santa_suit", name: "St. Nick Velvet Coat", rarity: "rare", cost: 50, color: 0xb71540, desc: "Festive trimmed coat with gold buttons and belt loop." },
                { id: "j_aurora_silk", name: "Aurora Shifting Parka", rarity: "legendary", cost: 220, color: 0x5f27cd, desc: "Woven with spectral polar silk that dances in the wind." },
                { id: "j_gold_foil", name: "Monarch 24K Foil Shell", rarity: "legendary", cost: 280, color: 0xf1c40f, desc: "Thermal reflective gold foil shimmering in the sunlight." },
                { id: "j_blizzard_white", name: "Whiteout Ghost Parka", rarity: "epic", cost: 70, color: 0xfafafa, desc: "Blends seamlessly into dense swirling blizzard squalls." },
                { id: "j_magma_core", name: "Volcanic Heat Shell", rarity: "epic", cost: 110, color: 0xe17055, desc: "Internal heated coils keeping rider warm at -40°C." }
            ]
        },

        // ─── 4. SKI TRAIL PARTICLE FX (10 Items) ───
        {
            category: "trails",
            name: "Ski Spray Trails",
            items: [
                { id: "t_classic_snow", name: "Crisp Powder White", rarity: "common", cost: 0, color: 0xf5fbff, desc: "Traditional sparkling snow spray cloud." },
                { id: "t_ice_blue", name: "Glacial Cyan Frost", rarity: "common", cost: 15, color: 0x70a1ff, desc: "Cold cyan mist kicked up from the runners." },
                { id: "t_gold_sparks", name: "Midas Gold Dust", rarity: "rare", cost: 45, color: 0xffd166, desc: "Golden glitter particles trailing behind turns." },
                { id: "t_plasma_pink", name: "Neon Plasma Magenta", rarity: "epic", cost: 80, color: 0xff6b81, desc: "Hot electric pink ion plume from rocket runners." },
                { id: "t_toxic_green", name: "Bioluminescent Lime", rarity: "rare", cost: 50, color: 0x2ed573, desc: "Radioactive glowing lime dust carved into slopes." },
                { id: "t_rainbow_drift", name: "Rainbow Prismatic Spray", rarity: "legendary", cost: 220, color: 0x00ffff, desc: "Seven-color spectrum ribbon erupting during drifts." },
                { id: "t_fire_embers", name: "Inferno Ash & Embers", rarity: "epic", cost: 90, color: 0xff4757, desc: "Glowing red embers and smoke trailing behind." },
                { id: "t_starfall", name: "Cosmic Stardust Halo", rarity: "legendary", cost: 260, color: 0xa55eea, desc: "Tiny twinkling star particles falling behind the sled." },
                { id: "t_dark_matter", name: "Void Shadow Smoke", rarity: "epic", cost: 100, color: 0x2f3542, desc: "Eerie black smoke trails with purple rim lighting." },
                { id: "t_holiday_confetti", name: "Festive Holiday Confetti", rarity: "rare", cost: 60, color: 0xffd32a, desc: "Celebratory paper stars and holiday sparkles." }
            ]
        },

        // ─── 5. HORN & STUNT SFX (10 Items) ───
        {
            category: "horns",
            name: "Horns & SFX",
            items: [
                { id: "h_classic_beep", name: "Alpine Bell Ding", rarity: "common", cost: 0, desc: "Clear brass bell chime echoing across the valley." },
                { id: "h_fog_horn", name: "Deep Mountain Horn", rarity: "rare", cost: 25, desc: "Resonant alpine horn blast heard from miles away." },
                { id: "h_cyber_klaxon", name: "Cyber Synth Klaxon", rarity: "epic", cost: 60, desc: "Futuristic dual-tone electronic warning pulse." },
                { id: "h_sleigh_bells", name: "Holiday Sleigh Jingles", rarity: "rare", cost: 35, desc: "Cheerful silver jingle bells ringing with movement." },
                { id: "h_laser_beam", name: "Sci-Fi Ion Blast", rarity: "epic", cost: 80, desc: "Retro arcade laser shot effect upon high jump." },
                { id: "h_crowd_cheer", name: "Stadium Stunt Applause", rarity: "legendary", cost: 160, desc: "Crowd goes wild whenever landing massive airtime." },
                { id: "h_yodel", name: "Alps Master Yodel", rarity: "rare", cost: 50, desc: "Traditional alpine yodel echo through mountain peaks." },
                { id: "h_thunder_strike", name: "Blizzard Thunder Crack", rarity: "epic", cost: 95, desc: "Distant sonic boom accompanying maximum boost speed." },
                { id: "h_8bit_victory", name: "8-Bit Arcade Fanfare", rarity: "rare", cost: 40, desc: "Nostalgic retro chiptune arpeggio on trick completion." },
                { id: "h_eagle_cry", name: "Golden Eagle Screech", rarity: "legendary", cost: 190, desc: "Majestic alpine bird of prey cry soaring overhead." }
            ]
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmeticsCatalog;
}
