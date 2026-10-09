/**
 * ============================================================================
 * SNOW ANSHER 3D - DYNAMIC MULTI-BIOME ALPINE GENERATOR
 * Shifts downhill slopes through 4 unique procedural biomes:
 * 1. Alpine Glade (0-1200m): Sunny powder, evergreen pines & log chalets.
 * 2. Glacial Crevasse (1200-2800m): Deep blue ice sheets & rainbow grind rails.
 * 3. Blizzard Ridge (2800-4800m): High-speed avalanches, frozen waterfalls.
 * 4. Aurora Polar Chasm (4800m+): Dancing auroras, neon pads & mega kickers.
 * ============================================================================
 */

class BiomesManager {
    constructor(scene, worldEnv) {
        this.scene = scene;
        this.world = worldEnv;

        this.biomes = [
            {
                name: "Alpine Glade",
                startDist: 0,
                endDist: 1200,
                fogColor: 0xb4cde4,
                fogDensity: 0.0026,
                skyTimeOfDay: 0.25,
                boulderRate: 0.15,
                rampRate: 0.18,
                treeDensity: 1.0,
                snowColor: 0xf4f9ff
            },
            {
                name: "Glacial Crevasse",
                startDist: 1200,
                endDist: 2800,
                fogColor: 0x9ec6ee,
                fogDensity: 0.0035,
                skyTimeOfDay: 0.32, // stay in clear daylight — floor must never darken out of view
                boulderRate: 0.22,
                rampRate: 0.26,
                treeDensity: 0.6,
                snowColor: 0xdff9fb
            },
            {
                name: "Blizzard Ridge",
                startDist: 2800,
                endDist: 4800,
                fogColor: 0xc8d6e5,
                fogDensity: 0.0048,
                skyTimeOfDay: 0.40, // was 0.72 (night) — floor went black and "disappeared"
                boulderRate: 0.35,
                rampRate: 0.32,
                treeDensity: 1.3,
                snowColor: 0xf1f2f6
            },
            {
                name: "Aurora Polar Chasm",
                startDist: 4800,
                endDist: Infinity,
                fogColor: 0x2c467f,
                fogDensity: 0.0026,
                skyTimeOfDay: 0.62, // dusk (aurora still shows) instead of pitch night
                boulderRate: 0.28,
                rampRate: 0.40,
                treeDensity: 0.8,
                snowColor: 0x81ecec
            }
        ];

        this.currentBiome = this.biomes[0];
        this.targetFogColor = new THREE.Color(this.currentBiome.fogColor);
        this.currentFogColor = new THREE.Color(this.currentBiome.fogColor);
    }

    getBiomeAtDistance(dist) {
        for (let i = 0; i < this.biomes.length; i++) {
            const b = this.biomes[i];
            if (dist >= b.startDist && dist < b.endDist) {
                return b;
            }
        }
        return this.biomes[this.biomes.length - 1];
    }

    update(dt, distance) {
        const nextBiome = this.getBiomeAtDistance(distance);

        if (nextBiome !== this.currentBiome) {
            this.currentBiome = nextBiome;
            this.targetFogColor.setHex(this.currentBiome.fogColor);
            this.dispatchBiomeAlert(this.currentBiome.name);
        }

        // Smooth transition of fog & atmospheric lighting
        this.currentFogColor.lerp(this.targetFogColor, dt * 1.5);
        if (this.scene.fog) {
            this.scene.fog.color.copy(this.currentFogColor);
            this.scene.fog.density = THREE.MathUtils.lerp(
                this.scene.fog.density,
                this.currentBiome.fogDensity,
                dt * 1.2
            );
        }

        // Smooth transition of sky time-of-day
        if (this.world) {
            this.world.timeOfDay = THREE.MathUtils.lerp(
                this.world.timeOfDay,
                this.currentBiome.skyTimeOfDay,
                dt * 0.8
            );
        }
    }

    dispatchBiomeAlert(biomeName) {
        const popup = document.getElementById('combo-popup');
        if (popup) {
            popup.innerText = `🏔️ ENTERING: ${biomeName.toUpperCase()} 🏔️`;
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 1200);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomesManager;
}
