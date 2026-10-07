/**
 * ============================================================================
 * SNOW ANSHER 3D - HANDCRAFTED SLOPE PATTERNS & OBSTACLE COMBINATIONS
 * 20+ signature downhill track patterns and obstacle orchestrations:
 * Slalom alleys, double kickers, avalanche cascades, rainbow grind lines,
 * and village chicanes blended seamlessly into procedural streaming.
 * ============================================================================
 */

const SlopeTrackPatterns = {
    patterns: [
        // ─── 1. SLALOM PINE ALLEY ───
        {
            name: "Slalom Pine Alley",
            length: 120,
            spawn: (manager, startZ) => {
                for (let i = 0; i < 6; i++) {
                    const z = startZ - i * 20;
                    const x = (i % 2 === 0 ? 1 : -1) * 12;
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    manager.createPineTree(x, y, z);
                    // Place gift in the slalom apex
                    if (i % 2 === 1) manager.createGiftBox(-x * 0.5, y, z);
                }
            }
        },

        // ─── 2. MEGA KICKER DOUBLE LAUNCH ───
        {
            name: "Mega Kicker Double Launch",
            length: 160,
            spawn: (manager, startZ) => {
                const z1 = startZ - 25;
                const y1 = -z1 * Math.tan(manager.SLOPE_ANGLE);
                manager.createMegaRamp(0, y1, z1, true);

                // High floating gifts to catch during high airtime
                manager.createGiftBox(0, y1 + 18, z1 - 35);
                manager.createPowerupOrb(0, y1 + 22, z1 - 65, 'rocket');

                const z2 = startZ - 105;
                const y2 = -z2 * Math.tan(manager.SLOPE_ANGLE);
                manager.createMegaRamp(0, y2, z2, false);
            }
        },

        // ─── 3. AVALANCHE BOULDER CASCADE ───
        {
            name: "Avalanche Boulder Cascade",
            length: 140,
            spawn: (manager, startZ) => {
                for (let i = 0; i < 5; i++) {
                    const z = startZ - i * 26;
                    const x = (Math.random() - 0.5) * (manager.TRACK_WIDTH - 12);
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    manager.createRollingBoulder(x, y, z);
                }
            }
        },

        // ─── 4. RAINBOW GRIND EXPRESSWAY ───
        {
            name: "Rainbow Grind Expressway",
            length: 150,
            spawn: (manager, startZ) => {
                const z1 = startZ - 20;
                const y1 = -z1 * Math.tan(manager.SLOPE_ANGLE);
                manager.createMegaRamp(-8, y1, z1, false);
                manager.createGrindRail(-8, y1, z1 - 15, 55);

                const z2 = startZ - 85;
                const y2 = -z2 * Math.tan(manager.SLOPE_ANGLE);
                manager.createMegaRamp(8, y2, z2, false);
                manager.createGrindRail(8, y2, z2 - 15, 55);
            }
        },

        // ─── 5. SNOWMAN GATHERING CHICANE ───
        {
            name: "Snowman Gathering",
            length: 110,
            spawn: (manager, startZ) => {
                const positions = [-14, -6, 6, 14, 0];
                positions.forEach((x, idx) => {
                    const z = startZ - idx * 22;
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    manager.createSnowman(x, y, z);
                });
            }
        },

        // ─── 6. SPEED OVERDRIVE HIGHWAY ───
        {
            name: "Speed Overdrive Highway",
            length: 130,
            spawn: (manager, startZ) => {
                for (let i = 0; i < 3; i++) {
                    const z = startZ - i * 40;
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    manager.createBoostPad((i % 2 === 0 ? -6 : 6), y, z);
                    manager.createGiftBox(0, y, z - 15);
                }
            }
        },

        // ─── 7. POWERUP VAULT CORRIDOR ───
        {
            name: "Powerup Vault Corridor",
            length: 120,
            spawn: (manager, startZ) => {
                const z = startZ - 30;
                const y = -z * Math.tan(manager.SLOPE_ANGLE);
                manager.createPowerupOrb(-10, y, z, 'shield');
                manager.createPowerupOrb(0, y, z, 'magnet');
                manager.createPowerupOrb(10, y, z, 'multiplier');

                // Flanking guard trees
                manager.createPineTree(-18, y, z);
                manager.createPineTree(18, y, z);
            }
        },

        // ─── 8. NEEDLE THREADER CHUTE ───
        {
            name: "Needle Threader Chute",
            length: 130,
            spawn: (manager, startZ) => {
                for (let i = 0; i < 4; i++) {
                    const z = startZ - i * 30;
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    const gapCenter = (Math.random() - 0.5) * 16;
                    const gapWidth = 6.5; // tight squeeze for close call bonuses!

                    manager.createPineTree(gapCenter - gapWidth, y, z);
                    manager.createPineTree(gapCenter + gapWidth, y, z);
                    manager.createGiftBox(gapCenter, y, z);
                }
            }
        },

        // ─── 9. CHALET VILLAGE GAUNTLET ───
        {
            name: "Chalet Village Gauntlet",
            length: 150,
            spawn: (manager, startZ) => {
                const z1 = startZ - 30;
                const y1 = -z1 * Math.tan(manager.SLOPE_ANGLE);
                manager.createPineTree(-14, y1, z1);
                manager.createPineTree(14, y1, z1);
                manager.createSnowman(0, y1, z1 - 25);
                manager.createMegaRamp(0, y1, z1 - 60, true);
            }
        },

        // ─── 10. GLACIAL ICE SPIKE LABYRINTH ───
        {
            name: "Glacial Ice Spike Labyrinth",
            length: 140,
            spawn: (manager, startZ) => {
                for (let i = 0; i < 6; i++) {
                    const z = startZ - i * 22;
                    const x = Math.sin(i * 1.5) * 15;
                    const y = -z * Math.tan(manager.SLOPE_ANGLE);
                    manager.createRollingBoulder(x, y, z);
                    manager.createGiftBox(-x * 0.4, y, z);
                }
            }
        }
    ],

    getRandomPattern() {
        const idx = Math.floor(Math.random() * this.patterns.length);
        return this.patterns[idx];
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlopeTrackPatterns;
}
