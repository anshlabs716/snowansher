/**
 * ============================================================================
 * SNOW ANSHER 3D - 50 EXTENDED TROPHIES & ACHIEVEMENTS CATALOG
 * Complete Hall of Fame milestone system spanning Distance, Velocity, Stunts,
 * Powerups, Economy, and Extreme Challenges with Bronze, Silver, Gold & Platinum tiers.
 * ============================================================================
 */

const AchievementsCatalog = {
    trophies: [
        // ─── CATEGORY 1: DISTANCE & SURVIVAL (10 Trophies) ───
        { id: "dist_100", title: "Baby Slopes", desc: "Descend your first 100 meters downhill.", tier: "bronze", reward: 10 },
        { id: "dist_500", title: "Powder Carver", desc: "Glide past 500 meters without wiping out.", tier: "bronze", reward: 15 },
        { id: "dist_1000", title: "Kilometer Club", desc: "Reach 1,000 meters in a single continuous descent.", tier: "silver", reward: 30 },
        { id: "dist_2000", title: "Alpine Voyager", desc: "Navigate deep into the Glacial Crevasse (2,000m).", tier: "silver", reward: 50 },
        { id: "dist_3500", title: "Blizzard Survivor", desc: "Endure the fierce winds of Blizzard Ridge (3,500m).", tier: "gold", reward: 80 },
        { id: "dist_5000", title: "Aurora Gatekeeper", desc: "Break through the polar barrier into the Aurora Chasm (5,000m).", tier: "gold", reward: 120 },
        { id: "dist_7500", title: "Everest Descent", desc: "Travel an astonishing 7,500 meters downhill.", tier: "gold", reward: 180 },
        { id: "dist_10000", title: "Infinite Rider", desc: "Conquer 10,000 meters of uninterrupted slopes.", tier: "platinum", reward: 300 },
        { id: "survive_3min", title: "Iron Endurance", desc: "Stay on your sled for over 3 minutes continuously.", tier: "silver", reward: 45 },
        { id: "survive_5min", title: "Frostbite Legend", desc: "Survive downhill hazards for over 5 straight minutes.", tier: "platinum", reward: 250 },

        // ─── CATEGORY 2: VELOCITY & HYPERSPEED (10 Trophies) ───
        { id: "speed_100", title: "Picking Up Speed", desc: "Accelerate past 100 KM/H on the slopes.", tier: "bronze", reward: 10 },
        { id: "speed_130", title: "Downhill Express", desc: "Surpass 130 KM/H during a steep descent.", tier: "silver", reward: 25 },
        { id: "speed_160", title: "Supersonic Glider", desc: "Exceed 160 KM/H velocity.", tier: "silver", reward: 50 },
        { id: "speed_190", title: "Mach 1 Sled", desc: "Hit an adrenaline-pumping 190 KM/H speed.", tier: "gold", reward: 90 },
        { id: "speed_220", title: "Tachyon Velocity", desc: "Reach 220 KM/H using consecutive speed pads and rocket boosters.", tier: "platinum", reward: 200 },
        { id: "boost_chain_3", title: "Nitro Chain", desc: "Hit 3 Speed Boost Chevron pads within 10 seconds.", tier: "silver", reward: 35 },
        { id: "boost_chain_6", title: "Overdrive Rush", desc: "Hit 6 Speed Boost Chevron pads in a single run.", tier: "gold", reward: 75 },
        { id: "speed_sustained", title: "Speed Demon", desc: "Maintain over 150 KM/H for 12 continuous seconds.", tier: "gold", reward: 100 },
        { id: "rocket_rampage", title: "Afterburner Rage", desc: "Smash through 3 obstacles while in Hyper Rocket invincibility.", tier: "silver", reward: 40 },
        { id: "terminal_velocity", title: "Breaking Physics", desc: "Max out the speedometer gauge at full redline.", tier: "platinum", reward: 220 },

        // ─── CATEGORY 3: HIGH AIRTIME & AERIAL STUNTS (10 Trophies) ───
        { id: "first_jump", title: "Airborne", desc: "Execute your first manual high jump with Spacebar.", tier: "bronze", reward: 10 },
        { id: "airtime_1s", title: "Floatation", desc: "Stay airborne for more than 1 full second.", tier: "bronze", reward: 20 },
        { id: "airtime_2s", title: "Stratosphere", desc: "Launch off a Mega Ramp for over 2 seconds of hang-time.", tier: "silver", reward: 50 },
        { id: "airtime_3s", title: "Low Orbit", desc: "Achieve over 3.0 seconds of floating airtime off a cliff launch.", tier: "gold", reward: 110 },
        { id: "stunt_backflip", title: "Inverted World", desc: "Perform a clean Backflip and stick the landing.", tier: "silver", reward: 35 },
        { id: "stunt_spin360", title: "Whirlwind", desc: "Execute a 360 Spin in mid-air.", tier: "silver", reward: 30 },
        { id: "stunt_superman", title: "Man of Steel", desc: "Extend into a horizontal Superman pose during high airtime.", tier: "gold", reward: 60 },
        { id: "stunt_rodeo720", title: "Rodeo Champion", desc: "Land a Rodeo 720 corkscrew spin.", tier: "gold", reward: 85 },
        { id: "stunt_iron_lotus", title: "The Iron Lotus", desc: "Pull off the legendary mid-air split stunt.", tier: "platinum", reward: 200 },
        { id: "stunt_combo_3", title: "Trifecta Air", desc: "String 3 distinct stunt tricks together in one single flight.", tier: "platinum", reward: 250 },

        // ─── CATEGORY 4: CLOSE CALLS & AGILITY (10 Trophies) ───
        { id: "cc_1", title: "Close Shave", desc: "Skim within inches of a pine tree or rock.", tier: "bronze", reward: 10 },
        { id: "cc_5", title: "Living on the Edge", desc: "Collect 5 Close Call bonuses in one descent.", tier: "silver", reward: 30 },
        { id: "cc_10", title: "Danger Specialist", desc: "Perform 10 Close Calls in a single run.", tier: "gold", reward: 70 },
        { id: "cc_boulder", title: "Boulder Dodger", desc: "Near-miss dodge a tumbling giant avalanche snowball.", tier: "silver", reward: 35 },
        { id: "cc_snowman", title: "Frosty Kiss", desc: "Close-call brush right past a snowman's carrot nose.", tier: "silver", reward: 25 },
        { id: "grind_first", title: "First Rail", desc: "Land smoothly onto a Rainbow Ice Grind Rail.", tier: "bronze", reward: 20 },
        { id: "grind_full", title: "Rail Master", desc: "Grind the complete length of an extended 45m ice rail.", tier: "silver", reward: 45 },
        { id: "grind_3_rails", title: "Skate the Alps", desc: "Grind 3 different rails in one run.", tier: "gold", reward: 80 },
        { id: "thread_the_needle", title: "Needle Threader", desc: "Weave between two closely packed pine trees at >120 KM/H.", tier: "gold", reward: 90 },
        { id: "untouchable", title: "Ghost in the Snow", desc: "Reach 2,000 meters with zero shield damage taken.", tier: "platinum", reward: 200 },

        // ─── CATEGORY 5: ECONOMY, FLEET & UPGRADES (10 Trophies) ───
        { id: "gifts_10", title: "Holiday Spirit", desc: "Collect 10 Holiday Gifts on the slopes.", tier: "bronze", reward: 15 },
        { id: "gifts_50", title: "Gift Collector", desc: "Bank 50 Gifts in your vault.", tier: "silver", reward: 35 },
        { id: "gifts_150", title: "Santa’s Vault", desc: "Bank 150 Gifts in your vault.", tier: "silver", reward: 65 },
        { id: "gifts_300", title: "Gift Tycoon", desc: "Bank 300 Gifts in your vault.", tier: "gold", reward: 120 },
        { id: "gifts_500", title: "Midas Sledder", desc: "Accumulate 500 Gifts across all downhill runs.", tier: "platinum", reward: 250 },
        { id: "unlock_3_sleds", title: "Garage Collector", desc: "Unlock 3 distinct 3D sled models.", tier: "silver", reward: 40 },
        { id: "unlock_6_sleds", title: "Fleet Commander", desc: "Unlock 6 distinct 3D sled models.", tier: "gold", reward: 90 },
        { id: "unlock_all_sleds", title: "Grand Master of Sleds", desc: "Unlock all 10 sleds in the Garage showroom.", tier: "platinum", reward: 300 },
        { id: "max_upgrade", title: "Tuned to Perfection", desc: "Max out any stat upgrade in the tuning workshop.", tier: "silver", reward: 50 },
        { id: "full_perfection", title: "Alpine Deity", desc: "Unlock all trophies and complete the Master Sledder badge.", tier: "platinum", reward: 500 }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementsCatalog;
}
