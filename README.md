# 🏂 SnowAnsher

<div align="center">

### ❄️ A Fast-Paced 3D Snowboarding Game in Your Browser

**Dodge obstacles • Hit ramps • Collect gifts • Unlock sleds • Chase high scores**

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Cannon.js](https://img.shields.io/badge/Cannon.js-Physics-00A86B?style=for-the-badge)](https://schteppe.github.io/cannon.js/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=for-the-badge&logo=apache&logoColor=white)](https://www.apache.org/licenses/LICENSE-2.0)
[![Platform](https://img.shields.io/badge/Platform-Web-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/anshlabs716/snowansher)

</div>

---

## How to play

**Run the command block below:**

```bash
git clone https://github.com/anshlabs716/snowansher.git
cd snowansher
python3 -m http.server -d .
```
Then open the link which python is serving this on, for example, here my link was `http://0.0.0.0:8000/`
```
~/GitHub/snowansher $> python3 -m http.server -d .
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

---

## 📑 Table of Contents

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
  - [Cannon.js](#cannonjs)
  - [Browser Compatibility](#browser-compatibility)
  - [Project Structure](#project-structure)
  - [Architecture](#architecture)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Bug Reports](#bug-reports)
  - [Credits](#credits)
  - [License](#license)
  - [Support](#support)
  - [SnowAnsher](#snowansher)

## About the game

**SnowAnsher** is a browser-based 3D snowboarding game inspired by classic snow-riding games.

Built with **Three.js** for 3D rendering and **Cannon.js** for physics, the game puts you on procedurally generated snowy slopes filled with obstacles, ramps, boosts, gifts, and hazards.

Your goal is simple:

> 🏂 Stay on the slopes, dodge everything in your path, and survive as long as possible.

---

## Features

### Gameplay

- 🌨️ 3D snowboarding gameplay
- 🌲 Dodge trees and rocks
- 🛷 Launch from ramps
- ⚡ Hit neon speed-boost pads
- ❄️ Avoid giant rolling snowballs
- 🎁 Collect gifts
- 🏆 Track your score
- 📈 Chase local high scores

### Physics

Powered by **Cannon.js**:

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

The built-in settings menu lets you customize your experience.

### Graphics

Choose between:

- 🟢 Low
- 🟡 Medium
- 🟠 High
- 🔴 Ultra

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

| Key | Action |
|---|---|
| `A` | Steer left |
| `← Left Arrow` | Steer left |
| `D` | Steer right |
| `→ Right Arrow` | Steer right |
| `Space` | Jump |
| `W` | Jump |
| `↑ Up Arrow` | Jump |

---

## Built With

### HTML5 & CSS3

Used for the game's structure and interface.

Custom typography includes:

- Orbitron
- Rajdhani

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

### Cannon.js

Used for:

- Physics
- Gravity
- Collisions
- Jumping
- Object interactions

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
│   ├── Shaders.js                 # Custom visual shaders
│   ├── AudioEngine.js             # Sound effects and audio
│   ├── AudioSynthesizerBank.js    # Procedural sound synthesis
│   ├── SoundtrackData.js          # Music composition data
│   ├── RiderModel.js              # 3D rider model and animation
│   ├── StuntAnimationLibrary.js   # Stunt animation definitions
│   ├── SledCollection.js          # Sled definitions and models
│   ├── CosmeticsCatalog.js        # Cosmetic item definitions
│   ├── WorldEnvironment.js        # Main game environment
│   ├── ProceduralDecorations.js   # Procedural scenery
│   ├── SlopeTrackPatterns.js      # Track and obstacle patterns
│   ├── ObstaclesManager.js        # Obstacles and pickups
│   ├── PowerupSystem.js           # Power-up effects and timers
│   ├── TrickSystem.js             # Tricks and trick scoring
│   ├── ParticleEngine.js          # Particle effects
│   ├── GamePhysics.js             # Player movement and physics
│   ├── MultiplayerBotRiders.js    # AI-controlled rival riders
│   ├── AchievementsCatalog.js     # Achievement definitions
│   ├── GameUI.js                  # Game interface and menus
│   ├── GhostRacer.js              # Previous-run ghost system
│   ├── BiomesManager.js           # Biome and environment changes
│   ├── WeatherFX.js               # Weather and atmospheric effects
│   ├── Customizer.js              # Rider and sled customisation
│   ├── TelemetryAndLeaderboard.js # Run statistics and leaderboard
│   ├── TerrainBiomesMesher.js     # Special terrain geometry
│   ├── StuntComboEngine.js        # Stunt combo tracking
│   ├── DailyChallenges.js         # Daily challenge system
│   └── VisualPostProcessor.js     # Final rendering effects
│
├── .gitignore                   
├── LICENSE                        # Apache License 2.0
├── README.md                      # Project documentation
├── SECURITY.md                    # Security reporting policy 
├── favicon.svg                    # Browser tab icon
├── index.html                     # Game interface
├── index.js                       # Game controller
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
│         index.js            │
│       Game Logic            │
├──────────────┬──────────────┤
│   Three.js   │   Cannon.js  │
│   Rendering  │   Physics    │
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

**Built with JavaScript • Three.js • Cannon.js**

</div>
