# 🏂 SnowAnsher

<div align="center">

### ❄️ A Fast-Paced 3D Snowboarding Game in Your Browser

**Dodge obstacles • Hit ramps • Collect gifts • Unlock sleds • Chase high scores**

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Physics](https://img.shields.io/badge/Physics-Custom%20Engine-00A86B?style=for-the-badge)](https://github.com/anshlabs716/snowansher)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=for-the-badge&logo=apache&logoColor=white)](https://www.apache.org/licenses/LICENSE-2.0)
[![Platform](https://img.shields.io/badge/Platform-Web-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/anshlabs716/snowansher)

**🎮 Play now → [http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

</div>

---

## How to play

There are two ways to run SnowAnsher. Pick whichever you prefer.

### Option A — No server needed (easiest)

Double-click **`index-nuclear.html`** (or run `xdg-open index-nuclear.html`).
It is a single self-contained file — CSS, JavaScript and Three.js are inlined,
so it works straight from `file://` with **no server and no internet access**.

```bash
xdg-open index-nuclear.html      # Linux
open index-nuclear.html          # macOS
start index-nuclear.html         # Windows
```

### Option B — Local web server

If you prefer the modular version (`index.html` + separate `js/` files), serve
the folder with any static file server:

```bash
git clone https://github.com/anshlabs716/snowansher.git
cd snowansher
python3 -m http.server -d .
```
Then open the link which python is serving this on, for example, here my link was **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**
```
~/GitHub/snowansher $> python3 -m http.server -d .
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
**(Do not copy & paste this block, I am just giving an example of how it looked for me)**

> 💡 **Port already in use?** An older server is still running. Kill it with
> `fuser -k 8000/tcp` (or `lsof -ti:8000 | xargs kill`) and try again.
>
---

## Uninstall

SnowAnsher is a plain folder of static files — no installer, nothing is added to
your system. To remove it:

1. **Close the browser tab** running the game.
2. **Stop the local server** (only if you started one) — press `Ctrl+C` in the
   terminal running `python3 -m http.server`, or kill it with:
   ```bash
   fuser -k 8000/tcp
   ```
3. **Delete the game folder:**
   ```bash
   rm -rf snowansher
   ```
4. **Clear saved game data** (high scores, unlocked sleds, achievements and
   theme choice are stored in your browser's localStorage — they are the only
   trace the game leaves):
   - Open the game's site in your browser
   - Open DevTools (`F12` or `Ctrl+Shift+I`) → **Application** (Chrome/Edge) or
     **Storage** (Firefox) → **Local Storage** → select the site
   - Delete all `sr3d_*` entries, or right-click → **Clear**

That's it — SnowAnsher is completely gone.

## 📑 Table of Contents

  - [How to play](#how-to-play)
  - [Uninstall](#uninstall)
  - [About The Game](#about-the-game)
  - [Features](#features)
  - [Gameplay](#gameplay)
  - [Physics](#physics)
  - [Unlockable Sleds](#unlockable-sleds)
  - [Performance Settings](#performance-settings)
  - [Graphics](#graphics)
  - [Controls](#controls)
  - [Audio](#audio)
  - [Cyber HUD](#cyber-hud)
  - [HUD includes:](#hud-includes)
  - [Controls](#controls)
  - [Built With](#built-with)
  - [HTML5 & CSS3](#html5-css3)
  - [Vanilla JavaScript](#vanilla-javascript)
  - [Three.js](#threejs)
  - [Custom Physics Engine](#custom-physics-engine)
  - [Browser Compatibility](#browser-compatibility)
  - [Project Structure](#project-structure)
  - [Architecture](#architecture)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Bug Reports](#bug-reports)
  - [Credits](#credits)
  - [License](#license)
  - [Support](#support)

## About the game

**SnowAnsher** is a browser-based 3D snowboarding game inspired by classic snow-riding games.

Built with **Three.js** for 3D rendering and a custom in-house physics engine, the game puts you on procedurally generated snowy slopes filled with obstacles, ramps, boosts, gifts, and hazards.

Your goal is simple:

> 🏂 Stay on the slopes, dodge everything in your path, and survive as long as possible.

---

## Features

### Gameplay

- 🌨️ 3D snowboarding gameplay
- 🌲 Dodge trees and rocks
- ⛄ Dodge snowmen
- ❄️ Avoid giant rolling snowballs
- 🛷 Launch from ramps and cliff-jump ramps over deep chasms
- ⚡ Hit neon speed-boost pads
- 🎁 Collect gifts
- 🤸 Aerial stunt system — Superman, Backflip, Method and more
- 🏆 Track your score
- 📈 Chase local high scores
- 👻 Ghost replays of your best run and AI rival riders
- 🏅 Achievements, daily challenges and unlockable sleds

### Physics

Powered by the in-house **arcade physics engine** (`js/GamePhysics.js`):

- 🌍 Gravity simulation
- 💥 Collision detection
- 🏂 Jump physics
- 🤸 High-impact crash effects
- 📦 Physics-based collision boxes

### Unlockable Sleds

Visit the garage and switch between different sled styles:

- 🔴 Racing Red
- 🔵 Nitro Blue
- 🟢 Toxic Green

---

## Performance Settings

The built-in settings menu (**OPTIONS** tab) lets you customize your experience.

### Graphics

Choose between:

- ⚪ BALANCED — smooth 60 FPS (default)
- 🟣 ULTRA — GLSL shaders and high visual effects
- 🟢 PERFORMANCE — fast rendering for low-spec machines

### Theme

The **dark theme is on by default**. Also available:

- 🌙 DARK (default)
- 🌌 MIDNIGHT BLUE
- ☀️ LIGHT

Your choice is saved in the browser.

### Controls

Customize:

- 🖱️ Mouse/steering sensitivity
- 👀 Field of View (FOV)
- 🔊 Volume

---

## Audio

SnowAnsher includes adaptive sound effects and winter atmosphere.

Features include:

- 🌨️ Winter background ambience
- 🏂 Sliding sounds
- ⚡ Boost audio cues
- 💥 Crash sounds
- 🔊 Responsive gameplay audio

---

## Cyber HUD

The game uses a minimal neon-style HUD to display important gameplay information.

### HUD includes:

- ⚡ Current speed in KM/H
- 🏆 Current score
- 🎁 Gifts collected
- 📊 Local high scores

---

## Controls

### Keyboard

| Key | Action |
|---|---|
| `A` / `D` or `←` / `→` | Steer left / right |
| `Space` / `W` / `↑` | High jump — hold for extra floaty height |
| `W` (in air) | Superman stunt |
| `S` / `↓` (in air) | Backflip (Rodeo 720 at long airtime) |
| `E` or `Q` (in air) | Method stunt (Iron Lotus at long airtime) |
| `Esc` / `P` | Pause |

Tricks are only triggered by their own stunt keys mid-air — jump alone never triggers a stunt.

### Touch devices

On-screen touch controls appear automatically on touch-capable devices:
left/right steer zones and a jump button.

---

## Built With

### HTML5 & CSS3

Used for the game's structure and interface. No external font or icon CDNs —
typography uses system fonts and all icons are inline SVG, so the game has
**zero external network dependencies**.

### Vanilla JavaScript

The game logic is written using modern **JavaScript ES6+** without a frontend framework.

### Three.js

Used for:

- 3D rendering
- WebGL
- Cameras
- Lighting
- 3D objects
- Game environment

It is bundled locally as `three.r128.min.js`, so no CDN is required.

### Custom Physics Engine

Physics is handled by the in-house `js/GamePhysics.js` arcade physics engine:

- Gravity and terminal velocity
- Slope, halfpipe banking and bank rebounds
- High-jump airtime engine with variable jump height
- Ramp launches, cliff-jump ramps and rail grinding
- Collision detection against obstacles, gifts and power-ups

---


## Browser Compatibility

SnowAnsher is designed for modern browsers with WebGL support.

Recommended browsers include:

- Firefox/Firefox Forks
- Chromium
- Microslop Edging
- Safari
- Brave

Performance will depend on your hardware, browser, and selected graphics settings.

---

## Project Structure

~~~~text
snowansher/
|
├── js/
│   ├── AchievementsCatalog.js     # Achievement definitions
│   ├── AudioEngine.js             # Sound effects and audio
│   ├── AudioSynthesizerBank.js    # Procedural sound synthesis
│   ├── BiomesManager.js           # Biome and environment changes
│   ├── CosmeticsCatalog.js        # Cosmetic item definitions
│   ├── Customizer.js              # Rider and sled customisation
│   ├── DailyChallenges.js         # Daily challenge system
│   ├── GamePhysics.js             # Custom arcade physics engine
│   ├── GameUI.js                  # Game interface and menus
│   ├── GhostRacer.js              # Previous-run ghost system
│   ├── InteractiveShowroom.js     # Showroom viewer
│   ├── MultiplayerBotRiders.js    # AI-controlled rival riders
│   ├── ObstaclesManager.js        # Obstacles and pickups
│   ├── ParticleEngine.js          # Particle effects
│   ├── PhysicsRaycasterEngine.js  # Terrain raycasting helpers
│   ├── PowerupSystem.js           # Power-up effects and timers
│   ├── ProceduralDecorations.js   # Procedural scenery
│   ├── ReplayTheater.js           # Run replay playback
│   ├── RiderModel.js              # 3D rider model and animation
│   ├── Shaders.js                 # Custom visual shaders
│   ├── SledCollection.js          # Sled definitions and models
│   ├── SlopeTrackPatterns.js      # Track and obstacle patterns
│   ├── SoundtrackData.js          # Music composition data
│   ├── StuntAnimationLibrary.js   # Stunt animation definitions
│   ├── StuntComboEngine.js        # Stunt combo tracking
│   ├── TelemetryAndLeaderboard.js # Run statistics and leaderboard
│   ├── TerrainBiomesMesher.js     # Special terrain geometry
│   ├── TrickSystem.js             # Tricks and trick scoring
│   ├── VisualPostProcessor.js     # Final rendering effects
│   └── WeatherFX.js               # Weather and atmospheric effects
│
├── build-nuclear.py               # Builds the single-file version
├── .gitignore
├── LICENSE                        # Apache License 2.0
├── README.md                      # Project documentation
├── SECURITY.md                    # Security reporting policy
├── favicon.svg                    # Browser tab icon
├── index.html                     # Game entry point (modular version)
├── index-nuclear.html             # Single-file build (no server needed)
├── script.js                      # Game controller / orchestrator
├── style.css                      # All game styling (incl. dark theme)
└── three.r128.min.js              # Locally bundled Three.js library
~~~~

---

## Architecture

SnowAnsher keeps the project lightweight by using browser-native technologies and JavaScript libraries.

~~~~text
┌─────────────────────────────┐
│          Browser            │
├─────────────────────────────┤
│        index.html           │
│      Game Interface         │
├─────────────────────────────┤
│         script.js           │
│       Game Logic            │
├──────────────┬──────────────┤
│   Three.js   │  GamePhysics │
│   Rendering  │  Physics     │
├──────────────┴──────────────┤
│           WebGL             │
└─────────────────────────────┘
~~~~

---

## Roadmap

Potential future improvements:

- [ ] More sleds
- [ ] More snow environments
- [ ] More obstacles
- [ ] Additional power-ups
- [ ] More ramps and terrain
- [ ] Improved crash physics
- [ ] More sound effects
- [ ] Improved mobile controls
- [ ] Better performance optimization
- [ ] More game modes
- [ ] Online leaderboards

---

## Contributing

Contributions, ideas, and improvements are welcome.

To contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test the game
5. Commit your changes
6. Push your branch
7. Open a Pull Request

---

## Bug Reports

Found a problem?

When opening an issue, include:

- Browser
- Operating system
- Hardware/GPU if relevant
- What you were doing
- What happened
- Console errors if available

This makes bugs much easier to reproduce.

---

## Credits

### Director

**Ansh Bhatia**

#### Things done:

- Created this repo
- Made all the files and things

### Development Assistance

**shozanthebozan**

#### Things done:
- Edit a lot of what Ansh has done
- Verify things are going correctly

## License

SnowAnsher is licensed under the **Apache License 2.0**.

See [`LICENSE`](LICENSE) for the complete license.

---

## Support

If you enjoy SnowAnsher:

- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Contribute improvements
- 🏂 Keep riding

---

<div align="center">

## SnowAnsher

### 🏂 Ride the slopes. Dodge the chaos. Chase the high score.

**Built with JavaScript • Three.js • Custom Physics**

</div>
