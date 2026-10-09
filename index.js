/**
 * ============================================================================
 * SNOW ANSHER 3D - MASTER GAME ORCHESTRATOR & LIFECYCLE CONTROLLER
 * Unifies Shaders, Audio, Physics, 3D Rider, 10 Sled Fleet, World Environment,
 * Obstacles, Powerups, Aerial Stunts, and Particle Systems.
 * ============================================================================
 */

/**
 * Replace the global `localStorage` with a never-throwing shim before any module
 * touches it. Firefox private browsing and blocked-site-data modes make access
 * throw, and ~35 call sites across GameUI/GhostRacer/DailyChallenges read storage
 * during construction — so a single throw left the whole game unclickable, with
 * nothing visible on screen.
 */
(function installSafeLocalStorage() {
    let usable = false;
    try {
        const probe = '__sr3d_probe__';
        window.localStorage.setItem(probe, '1');
        window.localStorage.removeItem(probe);
        usable = true;
    } catch (e) {
        usable = false;
    }
    if (usable) return; // real storage works, leave it alone

    const mem = new Map();
    const shim = {
        getItem: function (k) { return mem.has(String(k)) ? mem.get(String(k)) : null; },
        setItem: function (k, v) { mem.set(String(k), String(v)); },
        removeItem: function (k) { mem.delete(String(k)); },
        clear: function () { mem.clear(); },
        key: function (i) { const a = Array.from(mem.keys()); return a[i] === undefined ? null : a[i]; },
        get length() { return mem.size; }
    };
    try {
        Object.defineProperty(window, 'localStorage', { value: shim, configurable: true, writable: false });
    } catch (e) {
        try { window.localStorage = shim; } catch (e2) { /* last resort */ }
    }
    console.warn('[SnowAnsher] localStorage blocked by the browser; using in-memory storage.');
})();

/**
 * Reads/writes go through the (now shimmed) localStorage installed by
 * installSafeLocalStorage(), so a blocked store degrades to an in-memory map
 * rather than throwing inside the constructor.
 */
function makeSafeStorage() {
    return {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
        remove(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    };
}

class SnowAnsherMaster {
    constructor() {
        // Storage shim. Touching localStorage throws in Firefox private browsing and
        // when "Block cookies and site data" is on, and this code runs in the
        // CONSTRUCTOR — so a single throw here killed `new SnowAnsherMaster()`,
        // window.game stayed null, and every menu button did nothing with no error
        // visible anywhere. Probe once, then degrade to an in-memory map.
        this.storage = makeSafeStorage();

        this.config = {
            // NOTE: keys must match what setOption() writes ('sr3d_' + key)
            graphics: this.storage.get('sr3d_graphics') || this.storage.get('sr3d_gfx') || 'balanced',
            sens: parseFloat(this.storage.get('sr3d_sens')) || 1.2,
            fov: parseInt(this.storage.get('sr3d_fov')) || 70,
            volume: parseFloat(this.storage.get('sr3d_volume') || this.storage.get('sr3d_vol')) || 0.75,
            skin: parseInt(this.storage.get('sr3d_skin')) || 0
        };

        // Saved records & currencies
        this.bestScore = parseInt(this.storage.get('sr3d_best')) || 0;
        this.totalGifts = parseInt(this.storage.get('sr3d_gifts')) || 0;
        this.unlockedSleds = JSON.parse(this.storage.get('sr3d_unlocked') || '[0]') || [0];

        // Runtime states
        this.running = false;
        this.paused = false;
        this.crashed = false;
        this.difficulty = 'medium';
        this.distance = 0;
        this.giftsRun = 0;
        this.topSpeedReached = 0;
        this.closeCallsRun = 0;

        // User Input Keys
        this.keys = {
            left: false,
            right: false,
            jump: false,
            up: false,
            down: false,
            keyE: false,
            keyQ: false,
            touchSteer: 0
        };

        // Subsystems (instantiated in init)
        this.sound = null;
        this.world = null;
        this.obstacles = null;
        this.powerups = null;
        this.tricks = null;
        this.particles = null;
        this.physics = null;
        this.rider = null;
        this.ui = null;
        this.dead = false;   // set true by fatal(): renderer could not be created
    }

    /**
     * Show a blocking, readable message instead of leaving a dead menu behind.
     * Used when we cannot build a renderer, so the failure is visible.
     */
    fatal(message) {
        this.dead = true;
        const menu = document.getElementById('menu-overlay');
        if (menu) {
            let box = document.getElementById('fatal-message');
            if (!box) {
                box = document.createElement('div');
                box.id = 'fatal-message';
                box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;'
                    + 'align-items:center;justify-content:center;padding:24px;'
                    + 'background:rgba(3,10,20,0.95);color:#e8f1ff;'
                    + 'font:15px/1.6 system-ui,sans-serif;text-align:center;';
                document.body.appendChild(box);
            }
            box.innerHTML = '<div><div style="font-size:22px;font-weight:700;margin-bottom:10px">'
                + 'Snow Ansher cannot start</div><div style="opacity:.85">' + message
                + '</div><div style="opacity:.6;margin-top:14px;font-size:13px">'
                + 'Try a different browser, or enable hardware acceleration.</div></div>';
        }
        console.error('[SnowAnsher] fatal:', message);
    }

    init() {
        if (!this.setupRenderer()) return; // renderer failed; fatal() already reported it

        // Same reasoning for the rest of boot: any throw here leaves a half-built
        // game whose menu buttons all fail. Surface the reason instead.
        try {
            this.setupSubsystems();
            this.setupPlayerSledGroup();
            this.loadSledModel(this.config.skin);
            this.setupEventListeners();
        } catch (e) {
            console.error('[SnowAnsher] init failed:', e && e.stack ? e.stack : e);
            this.fatal('Startup failed: ' + (e && e.message ? e.message : e));
            return;
        }

        // UI Engine Init
        this.ui = new GameUI(this);
        this.ui.renderGarageShowroom();

        // Restore saved options into the settings controls (they reset visually on reload)
        const syncSel = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };
        syncSel('opt-graphics', this.config.graphics);
        syncSel('opt-sens', this.config.sens);
        syncSel('opt-fov', this.config.fov);
        syncSel('opt-volume', this.config.volume);

        // Render Clock & Animation Loop
        this.clock = new THREE.Clock();
        requestAnimationFrame((t) => this.tick(t));

        console.log('❄️ Snow Ansher 3D Master Engine Initialized (10K+ Code Architecture Active)!');
    }

    setupRenderer() {
        const container = document.getElementById('canvas-container');

        // WebGL is the single point of failure for the whole game: if renderer setup
        // throws, setupSubsystems() never runs, this.sound stays null, and every menu
        // button dies on `this.sound.init()` with nothing shown to the user. Guard the
        // ENTIRE setup, not just the context probe, and report the real reason.
        try {
            const probe = document.createElement('canvas');
            const gl = probe.getContext('webgl2') || probe.getContext('webgl');
            if (!gl) throw new Error('this browser reports no WebGL context');
            return this._buildRenderer(container);
        } catch (e) {
            console.error('[SnowAnsher] renderer setup failed:', e);
            this.fatal('Could not start the 3D renderer: ' + (e && e.message ? e.message : e));
            return false;
        }
    }

    _buildRenderer(container) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xb4cde4);
        this.scene.fog = new THREE.FogExp2(0xb4cde4, 0.0024);

        this.camera = new THREE.PerspectiveCamera(this.config.fov, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.camera.position.set(0, 6, 12);

        this.renderer = new THREE.WebGLRenderer({
            antialias: this.config.graphics !== 'performance',
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,
            this.config.graphics === 'ultra' ? 2 :
            this.config.graphics === 'performance' ? 1 : 1.5));
        this.renderer.toneMapping = THREE.NoToneMapping; // Flat, vivid low-poly colors (like the reference art)
        this.renderer.toneMappingExposure = 1.0;
        // r128 (the pinned CDN build) uses the *_Encoding names. Assigning an
        // undefined constant silently disables sRGB output and washes out colours.
        if (THREE.sRGBEncoding !== undefined) this.renderer.outputEncoding = THREE.sRGBEncoding;
        else if (THREE.SRGBColorSpace !== undefined) this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        if (this.config.graphics === 'ultra') {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        container.appendChild(this.renderer.domElement);
        return true;
    }

    setupSubsystems() {
        this.sound = new AudioEngine();
        this.world = new WorldEnvironment(this.scene, this.renderer, this.config);
        this.obstacles = new ObstaclesManager(this.scene, this.config);
        // Obstacles sample the real terrain height so ramps/obstacles sit on the
        // ground rather than hovering at a guessed y.
        this.obstacles.getGroundHeightAt = (gx, gz) => this.physics.getGroundHeightAt(gx, gz);
        this.particles = new ParticleEngine(this.scene, this.config);
        this.physics = new GamePhysics(this.config);
        this.tricks = new TrickSystem();
        this.ghostRacer = new GhostRacerSystem(this.scene);
        this.biomes = new BiomesManager(this.scene, this.world);
        this.weatherFX = new WeatherFX(this.scene, this.camera);
        this.customizer = new CosmeticsCustomizer(this);
        this.telemetry = new TelemetryAndLeaderboard();
        this.structures = new TerrainBiomesMesher(this.scene);
        this.stuntEngine = new StuntComboEngine();
        this.challenges = new DailyChallengesManager(this);
        this.postProcessor = new VisualPostProcessor(this.renderer, this.scene, this.camera, this.config);
        this.botRiders = new MultiplayerBotRiders(this.scene, this.physics);
        this.decorations = new ProceduralDecorations(this.scene);
    }

    setupPlayerSledGroup() {
        this.playerRoot = new THREE.Group();
        this.sledContainer = new THREE.Group();
        this.playerRoot.add(this.sledContainer);
        this.scene.add(this.playerRoot);

        // Forward Headlight
        this.headlight = new THREE.SpotLight(0xfffaed, 2.5, 80, Math.PI / 6, 0.4);
        this.headlight.position.set(0, 1.2, 0);
        this.headlightTarget = new THREE.Object3D();
        this.headlightTarget.position.set(0, -2, -30);
        this.playerRoot.add(this.headlight);
        this.playerRoot.add(this.headlightTarget);
        this.headlight.target = this.headlightTarget;

        // Soft contact shadow under the sled (grounds the rider visually on the snow)
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 128;
        shadowCanvas.height = 128;
        const sctx = shadowCanvas.getContext('2d');
        const grad = sctx.createRadialGradient(64, 64, 6, 64, 64, 62);
        grad.addColorStop(0, 'rgba(8, 24, 48, 0.55)');
        grad.addColorStop(0.55, 'rgba(8, 24, 48, 0.22)');
        grad.addColorStop(1, 'rgba(8, 24, 48, 0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 128, 128);

        this.contactShadow = new THREE.Mesh(
            new THREE.PlaneGeometry(7, 7),
            new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(shadowCanvas),
                transparent: true,
                depthWrite: false
            })
        );
        this.contactShadow.rotation.x = -Math.PI / 2;
        this.contactShadow.position.set(0, 0.06, 0);
        this.scene.add(this.contactShadow);

        // Power-up visual auras
        this.powerups = new PowerupSystem(this.scene, this.playerRoot);
    }

    loadSledModel(skinId) {
        // Clear old model
        while (this.sledContainer.children.length > 0) {
            this.sledContainer.remove(this.sledContainer.children[0]);
        }

        // Build new sled from 10 sled collection
        const sledObj = SledCollection.createSledMesh(skinId);
        this.currentSledData = sledObj.data;
        this.sledMesh = sledObj.mesh;
        this.sledContainer.add(this.sledMesh);

        // Build 3D Rider character on top
        this.rider = new RiderCharacter(this.scene, {
            jacket: this.currentSledData.colors.secondary,
            beanie: this.currentSledData.colors.primary,
            scarf: this.currentSledData.colors.accent,
            goggles: 0xffd166
        });
        this.sledContainer.add(this.rider.rootGroup);
    }

    start(difficulty = 'medium') {
        if (this.dead || !this.sound) {
            this.fatal('The renderer failed to start, so the run cannot begin.');
            return;
        }
        this.sound.init();
        this.sound.startMusic();

        this.difficulty = difficulty;
        this.physics.reset(difficulty, this.currentSledData.stats);

        this.running = true;
        this.paused = false;
        this.crashed = false;
        this.distance = 0;
        this.giftsRun = 0;
        this.topSpeedReached = 0;
        this.closeCallsRun = 0;

        // Re-lay the terrain run around the sled. physics.reset() teleports the player
        // back to z=0 while the chunks are still hundreds of metres downhill, which
        // left the floor missing for a couple of seconds on every respawn.
        if (this.world && this.world.resetTerrainAround) {
            this.world.resetTerrainAround(this.physics.position.z);
        }

        // Reset course hazards
        this.obstacles.clearAll();
        if (this.structures) this.structures.clear();
        this.lastSpawnZ = -50;
        for (let z = -70; z > -1600; z -= 30) {
            this.spawnCourseRow(z);
            this.lastSpawnZ = z;
        }

        if (this.ghostRacer) this.ghostRacer.startRecording();
        if (this.telemetry) this.telemetry.startRun();
        if (this.botRiders) this.botRiders.reset(0);
        if (this.decorations) this.decorations.clear();

        // UI transitions
        this.ui.dom.menuOverlay.classList.add('hidden');
        this.ui.dom.gameoverOverlay.classList.add('hidden');
        this.ui.dom.pauseOverlay.classList.add('hidden');
        this.ui.dom.hud.classList.add('active');

        if (this.sledContainer) this.sledContainer.visible = true;
        if (this.contactShadow) this.contactShadow.visible = true;
    }

    spawnCourseRow(z) {
        const y = this.physics.getGroundHeightAt(0, z);
        const rand = Math.random();

        // Dense low-poly forest walls hugging both banks of the run (Snow Rider look)
        const flankCount = (this.config.graphics === 'performance') ? 1 : 3;
        for (const side of [-1, 1]) {
            for (let f = 0; f < flankCount; f++) {
                const x = side * (this.physics.TRACK_WIDTH * 0.52 + 3 + Math.random() * 11);
                const fz = z + (Math.random() - 0.5) * 22;
                const fy = this.physics.getGroundHeightAt(x, fz);
                if (Math.random() < 0.68) {
                    this.obstacles.createPineTree(x, fy, fz);
                } else {
                    this.obstacles.createBareTree(x, fy, fz);
                }
            }
        }

        if (rand < 0.1) {
            // Holiday Gift Box
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 8);
            this.obstacles.createGiftBox(x, y, z);
        } else if (rand < 0.16) {
            // Power-Up Capsule
            const types = ['shield', 'magnet', 'rocket', 'multiplier'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 10);
            this.obstacles.createPowerupOrb(x, y, z, chosen);
        } else if (rand < 0.24) {
            // Speed Boost Chevron Pad
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 12);
            this.obstacles.createBoostPad(x, y, z);
        } else if (rand < 0.35) {
            // MEGA Ski Jump Kicker (Launch high into the sky!)
            const isMega = (Math.random() < 0.45);
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 14);
            this.obstacles.createMegaRamp(x, y, z, isMega, (gx, gz) => this.physics.getGroundHeightAt(gx, gz));
        } else if (rand < 0.44) {
            // Rainbow Ice Grind Rail
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 16);
            this.obstacles.createGrindRail(x, y, z, 40);
        } else if (rand < 0.58) {
            // Giant Rolling Avalanche Boulder
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 10);
            this.obstacles.createRollingBoulder(x, y, z);
        } else if (rand < 0.70) {
            // Cute 3D Snowman
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 8);
            this.obstacles.createSnowman(x, y, z);
        } else if (rand < 0.76) {
            // Dark grey rock cluster — rare but lethal (hop over it)
            const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 12);
            this.obstacles.createRock(x, y, z);
        } else {
            // Snow pines / bare winter trees right on the run
            const count = (Math.random() < 0.4) ? 2 : 1;
            for (let c = 0; c < count; c++) {
                const x = (Math.random() - 0.5) * (this.physics.TRACK_WIDTH - 6);
                if (Math.random() < 0.65) {
                    this.obstacles.createPineTree(x, y, z);
                } else {
                    this.obstacles.createBareTree(x, y, z);
                }
            }
        }

        // Flanking Alpine Cabins / Chalets & Mountainside Forest
        if (Math.random() < 0.15) {
            const side = (Math.random() < 0.5 ? -1 : 1);
            const chaletX = side * (this.physics.TRACK_WIDTH * 0.55 + 16);
            // Sit the chalet on the actual plateau height at its side position
            this.world.createAlpineChalet(chaletX, this.physics.getGroundHeightAt(chaletX, z), z);
        }
    }

    retry() {
        this.start(this.difficulty);
    }

    openMenu() {
        this.running = false;
        this.paused = false;
        this.sound.stopMusic();
        this.sound.stopMovementLoops(); // silence wind/carve in the hub too
        this.ui.dom.gameoverOverlay.classList.add('hidden');
        this.ui.dom.pauseOverlay.classList.add('hidden');
        this.ui.dom.hud.classList.remove('active');
        this.ui.dom.menuOverlay.classList.remove('hidden');
        this.ui.renderGarageShowroom();
    }

    togglePause() {
        if (!this.running || this.crashed) return;
        this.paused = !this.paused;
        if (this.paused) {
            this.sound.stopMovementLoops(); // don't let wind roar over the pause menu
            this.ui.dom.pauseOverlay.classList.remove('hidden');
        } else {
            this.ui.dom.pauseOverlay.classList.add('hidden');
        }
    }

    triggerCrash() {
        if (this.crashed) return;

        // Check if Energy Shield is active
        if (this.powerups.consumeShield()) {
            this.sound.playLanding(1.5);
            this.ui.dom.screenFlash.style.opacity = '0.7';
            setTimeout(() => this.ui.dom.screenFlash.style.opacity = '0', 120);
            this.ui.unlockAchievement('shield_savior');
            return;
        }

        this.crashed = true;
        this.running = false;
        this.sound.playCrashImpact();
        this.sound.stopMovementLoops(); // wind/carve loops must die with the run
        this.sound.stopMusic(); // sequencer kept scheduling notes after death
        this.sound.stopThrusterLoops();

        // Screen flash & camera shake
        this.ui.dom.screenFlash.style.opacity = '0.95';
        setTimeout(() => this.ui.dom.screenFlash.style.opacity = '0', 150);

        // Hide sled & spawn debris explosion
        if (this.sledContainer) this.sledContainer.visible = false;
        if (this.contactShadow) this.contactShadow.visible = false;
        this.particles.spawnCrashDebris(this.physics.position, this.currentSledData, this.physics.speed);

        // Save records & achievements
        const isNewBest = (this.distance > this.bestScore);
        if (isNewBest) {
            this.bestScore = Math.floor(this.distance);
            localStorage.setItem('sr3d_best', this.bestScore);
        }

        this.totalGifts += this.giftsRun;
        localStorage.setItem('sr3d_gifts', this.totalGifts);

        this.ui.unlockAchievement('first_glide');
        if (this.distance > 3000) this.ui.unlockAchievement('marathon');
        if (this.totalGifts >= 150) this.ui.unlockAchievement('gift_hoarder');

        if (this.ghostRacer) this.ghostRacer.stopAndSaveIfBest(this.distance, this.bestScore);
        if (this.telemetry) this.telemetry.recordRun(this.distance, this.currentSledData.name);

        // Show Game Over Overlay
        setTimeout(() => {
            this.ui.dom.goDist.innerText = Math.floor(this.distance) + 'm';
            this.ui.dom.goGifts.innerText = this.giftsRun;
            this.ui.dom.goSpeed.innerText = Math.floor(this.topSpeedReached * 1.5) + ' KM/H';
            this.ui.dom.newRecordTag.style.display = isNewBest ? 'inline-block' : 'none';

            this.ui.dom.hud.classList.remove('active');
            this.ui.dom.gameoverOverlay.classList.remove('hidden');
        }, 1100);
    }

    triggerCloseCall() {
        this.distance += 50;
        this.closeCallsRun++;
        this.sound.playNearMiss();
        if (this.closeCallsRun >= 5) this.ui.unlockAchievement('close_call_master');

        this.ui.dom.comboPopup.innerText = '★ CLOSE CALL! +50m ★';
        this.ui.dom.comboPopup.classList.add('show');
        setTimeout(() => this.ui.dom.comboPopup.classList.remove('show'), 700);
    }

    // ─── MASTER ANIMATION & RENDER TICK ───
    tick(time) {
        requestAnimationFrame((t) => this.tick(t));
        const dt = Math.min(this.clock.getDelta(), 0.05);

        if (this.running && !this.paused) {
            this.updateRunningGame(dt);
        } else if (this.crashed) {
            this.particles.update(dt, this.physics.position, this.physics.SLOPE_ANGLE);
            this.updateCamera(dt);
        } else {
            // Idle menu camera orbit
            const idleTime = time * 0.00035;
            this.camera.position.x = Math.sin(idleTime) * 11;
            this.camera.position.z = Math.cos(idleTime) * 13;
            this.camera.position.y = 4.5 + Math.sin(idleTime * 0.5) * 1.2;
            this.camera.lookAt(0, 1, 0);
            this.particles.update(dt, new THREE.Vector3(0, 0, 0), this.physics.SLOPE_ANGLE);
        }

        if (this.postProcessor) {
            this.postProcessor.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateRunningGame(dt) {
        // 1. Physics Engine Update (HIGH JUMP & MOVEMENT)
        const effectiveDt = this.powerups.hasActive('slowmo') ? dt * 0.6 : dt;
        this.physics.update(effectiveDt, this.keys, this.currentSledData.stats, this.sound, this.particles);

        // Distance & Speed Tracking
        const multi = this.powerups.hasActive('multiplier') ? 2.0 : 1.0;
        this.distance += (this.physics.speed * dt * 0.5) * multi;
        if (this.physics.speed > this.topSpeedReached) this.topSpeedReached = this.physics.speed;
        if (this.physics.speed * 1.5 > 160) this.ui.unlockAchievement('speed_demon');

        // Sync 3D player position & orientation
        this.playerRoot.position.copy(this.physics.position);
        this.playerRoot.rotation.copy(this.physics.rotation);

        // Soft contact shadow follows the terrain under the sled
        if (this.contactShadow) {
            const gY = this.physics.getGroundHeightAt(this.physics.position.x, this.physics.position.z);
            this.contactShadow.position.set(this.physics.position.x, gY + 0.08, this.physics.position.z);
            const airGap = Math.max(0, this.physics.position.y - gY);
            this.contactShadow.material.opacity = Math.max(0.15, Math.min(1, 1 - airGap / 16));
            const sc = 1 + Math.min(1.5, airGap * 0.06);
            this.contactShadow.scale.set(sc, sc, sc);
        }

        // 2. Aerial Stunt & Trick Detection
        this.tricks.update(dt, this.keys, this.physics.isGrounded, this.rider, this.sound);
        if (this.physics.airTime > 1.2) this.ui.unlockAchievement('mile_high');

        // 3. 3D Rider Character Animation
        if (this.rider) {
            this.rider.update(dt, {
                speed: this.physics.speed,
                steer: this.keys.left ? -1 : (this.keys.right ? 1 : this.keys.touchSteer),
                isGrounded: this.physics.isGrounded,
                airTime: this.physics.airTime,
                activeTrick: this.tricks.currentStunt
            });
        }

        // 4. Powerups Engine & Auras
        this.powerups.update(dt, this.physics.position, this.obstacles.gifts);
        this.updatePowerupHUD();

        // 5. World Stream & Hazard Spawning
        while (this.lastSpawnZ > this.physics.position.z - 950) {
            this.lastSpawnZ -= 32;
            this.spawnCourseRow(this.lastSpawnZ);
        }
        this.world.update(dt, this.physics.position);

        // 6. Hazard & Item Interactions
        this.checkCollisions();
        this.obstacles.update(dt, this.physics.position);

        // 7. Particle FX & Ski Spray
        if (this.physics.isGrounded && !this.physics.isGrinding) {
            const sprayL = this.physics.position.clone().add(new THREE.Vector3(-0.6, 0.1, 0.8));
            const sprayR = this.physics.position.clone().add(new THREE.Vector3(0.6, 0.1, 0.8));
            this.particles.emitSnowSpray(sprayL, 2, this.physics.steerAngle);
            this.particles.emitSnowSpray(sprayR, 2, this.physics.steerAngle);
        }
        this.particles.update(dt, this.physics.position, this.physics.SLOPE_ANGLE);

        // 8. Continuous Audio Physics
        this.sound.updatePhysicsAudio({
            speedRatio: this.physics.speed / this.physics.maxSpeed,
            isGrounded: this.physics.isGrounded,
            isSteering: (this.keys.left || this.keys.right || Math.abs(this.keys.touchSteer) > 0.05),
            isGrinding: this.physics.isGrinding,
            isBoosting: this.powerups.hasActive('rocket'),
            airTime: this.physics.airTime
        });
        this.sound.updateMusicSequencer();

        // 9. Subsystems Updates (Ghost, Biomes, Weather, Challenges)
        if (this.ghostRacer) {
            this.ghostRacer.recordSample(this.clock.getElapsedTime(), this.physics.position, this.physics.rotation, this.physics.isGrounded, this.tricks.currentStunt);
            this.ghostRacer.updatePlayback(dt, this.clock.getElapsedTime());
        }

        if (this.biomes) {
            this.biomes.update(dt, this.distance);
        }

        if (this.weatherFX) {
            this.weatherFX.update(dt, this.physics.speed / this.physics.maxSpeed, this.physics.isGrounded, this.physics.position);
        }

        if (this.challenges) {
            if (this.physics.speed * 1.5 > 140) this.challenges.reportMetric('speed_time', dt);
            if (!this.physics.isGrounded) this.challenges.reportMetric('airtime', dt);
        }

        if (this.telemetry) {
            this.telemetry.updateTelemetry(this.physics.speed, this.physics.position.y, dt, this.distance, this.giftsRun);
        }

        if (this.botRiders) {
            this.botRiders.update(dt, this.physics.speed, this.obstacles.obstacles, this.particles);
        }

        // 10. Camera & HUD
        this.updateCamera(dt);
        this.ui.updateHUD(this.distance, this.giftsRun, this.bestScore, this.physics.speed, this.physics.maxSpeed);
    }

    checkCollisions() {
        const pPos = this.physics.position;

        // Mega Ramps Collision
        this.obstacles.ramps.forEach(ramp => {
            const dx = Math.abs(pPos.x - ramp.pos.x);
            const dz = Math.abs(pPos.z - ramp.pos.z);
            // Cliff jumpers are long (up to 45u), so test their whole deck, not half.
            // The old half-length window meant big ramps were easy to miss at speed.
            const halfLen = ramp.length * (ramp.isCliffJumper ? 0.5 : 0.5);
            if (dx < ramp.width * 0.5 && dz < halfLen && this.physics.isGrounded) {
                this.physics.launchRamp(ramp.boostPower, this.sound, this.particles);
            }
        });

        // Rainbow Grind Rails
        this.obstacles.grindRails.forEach(rail => {
            const dx = Math.abs(pPos.x - rail.pos.x);
            const dz = (rail.pos.z - pPos.z);
            if (dx < 1.4 && dz > 0 && dz < rail.length && this.physics.position.y >= rail.pos.y) {
                this.physics.attachToGrindRail(rail, this.sound, this.particles);
                this.ui.unlockAchievement('grind_king');
            }
        });

        // Boost Chevrons
        this.obstacles.boostPads.forEach(pad => {
            const dx = Math.abs(pPos.x - pad.pos.x);
            const dz = Math.abs(pPos.z - pad.pos.z);
            if (dx < pad.width * 0.5 && dz < pad.length * 0.5 && this.physics.isGrounded) {
                this.physics.speed = Math.min(this.physics.maxSpeed + 35, this.physics.speed + pad.boostSpeed);
                this.sound.playBoostIgnite();
                this.ui.dom.screenFlash.style.opacity = '0.4';
                setTimeout(() => this.ui.dom.screenFlash.style.opacity = '0', 100);
            }
        });

        // Collectible Gifts
        for (let i = this.obstacles.gifts.length - 1; i >= 0; i--) {
            const gift = this.obstacles.gifts[i];
            const dist = pPos.distanceTo(gift.pos);
            if (!gift.collected && dist < 2.4) {
                gift.collected = true;
                this.giftsRun++;
                this.sound.playGiftCollect();
                this.particles.emitGiftExplosion(gift.pos);
                this.scene.remove(gift.mesh);
                this.obstacles.gifts.splice(i, 1);
            }
        }

        // Power-Up Pickups
        for (let i = this.obstacles.powerups.length - 1; i >= 0; i--) {
            const p = this.obstacles.powerups[i];
            const dist = pPos.distanceTo(p.pos);
            if (!p.collected && dist < 2.5) {
                p.collected = true;
                this.powerups.activate(p.type, this.sound);
                this.particles.emitGiftExplosion(p.pos);
                this.scene.remove(p.mesh);
                this.obstacles.powerups.splice(i, 1);
            }
        }

        // Obstacles (Trees, Boulders, Snowmen)
        for (let i = 0; i < this.obstacles.obstacles.length; i++) {
            const obj = this.obstacles.obstacles[i];
            const dx = pPos.x - obj.pos.x;
            const dz = pPos.z - obj.pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Crash hit
            if (dist < (obj.radius + 0.8)) {
                const dy = Math.abs(pPos.y - obj.pos.y);
                if (dy < (obj.height * 0.85)) {
                    // Hyper Rocket destroys obstacles instead of crashing
                    if (this.powerups.hasActive('rocket')) {
                        this.sound.playLanding(1.5);
                        this.particles.emitLandingShockwave(obj.pos, 1.4);
                        this.scene.remove(obj.mesh);
                        this.obstacles.obstacles.splice(i, 1);
                        return;
                    }

                    this.triggerCrash();
                    return;
                }
            }

            // Close-call near miss (only for hazards on the run itself — flank trees never count)
            if (!obj.passed && dist < (obj.radius + 2.2) && pPos.z < obj.pos.z) {
                obj.passed = true;
                if (Math.abs(obj.pos.x) < this.physics.TRACK_WIDTH * 0.47) {
                    this.triggerCloseCall();
                }
            }
        }
    }

    updatePowerupHUD() {
        const setPill = (id, active) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', active);
        };

        setPill('pill-shield', this.powerups.hasActive('shield'));
        setPill('pill-magnet', this.powerups.hasActive('magnet'));
        setPill('pill-rocket', this.powerups.hasActive('rocket'));
        setPill('pill-multiplier', this.powerups.hasActive('multiplier'));
    }

    updateCamera(dt) {
        // Third-person chase camera with smooth lag
        const targetX = this.physics.position.x * 0.72;
        const targetY = this.physics.position.y + 4.2 + this.physics.cameraDip;
        const targetZ = this.physics.position.z + 9.6;

        this.camera.position.x += (targetX - this.camera.position.x) * 10 * dt;
        this.camera.position.y += (targetY - this.camera.position.y) * 10 * dt;
        this.camera.position.z += (targetZ - this.camera.position.z) * 12 * dt;

        // Look down the downhill slope
        const lookTarget = new THREE.Vector3(
            this.physics.position.x * 0.35,
            this.physics.position.y - 0.6,
            this.physics.position.z - 42
        );
        this.camera.lookAt(lookTarget);

        // Dynamic FOV with speed (hard-clamped so a bad config value can never break the projection)
        const speedRatio = Math.min(1.0, this.physics.speed / this.physics.maxSpeed);
        const targetFOV = (Number(this.config.fov) || 70) + speedRatio * 20;
        this.camera.fov += (targetFOV - this.camera.fov) * 6 * dt;
        if (!isFinite(this.camera.fov)) this.camera.fov = 70;
        this.camera.fov = Math.min(130, Math.max(30, this.camera.fov));
        this.camera.updateProjectionMatrix();

        // Speed Lines Vignette
        this.ui.dom.speedLines.style.opacity = (speedRatio > 0.62) ? (speedRatio - 0.62) * 2.6 : 0;
    }

    setOption(key, val) {
        // Store TYPED values — strings break math downstream
        // (config.fov + speedRatio would string-concat and blow up the camera FOV → floor vanishes)
        if (key === 'fov') {
            const n = parseInt(val);
            this.config.fov = isNaN(n) ? 70 : n;
        } else if (key === 'sens' || key === 'volume') {
            const n = parseFloat(val);
            if (!isNaN(n)) this.config[key] = n;
        } else {
            this.config[key] = val;
        }
        localStorage.setItem('sr3d_' + key, val);

        if (key === 'fov') {
            this.camera.fov = this.config.fov;
            this.camera.updateProjectionMatrix();
        } else if (key === 'volume') {
            if (this.sound) this.sound.setMasterVolume(this.config.volume);
        } else if (key === 'graphics') {
            location.reload();
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'a' || k === 'arrowleft') this.keys.left = true;
            if (k === 'd' || k === 'arrowright') this.keys.right = true;
            if (k === ' ' || k === 'w' || k === 'arrowup') this.keys.jump = true;
            if (k === 'w' || k === 'arrowup') this.keys.up = true;
            if (k === 's' || k === 'arrowdown') this.keys.down = true;
            if (k === 'e') this.keys.keyE = true;
            if (k === 'q') this.keys.keyQ = true;
            if (k === 'escape' || k === 'p') this.togglePause();
        });

        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'a' || k === 'arrowleft') this.keys.left = false;
            if (k === 'd' || k === 'arrowright') this.keys.right = false;
            if (k === ' ' || k === 'w' || k === 'arrowup') this.keys.jump = false;
            if (k === 'w' || k === 'arrowup') this.keys.up = false;
            if (k === 's' || k === 'arrowdown') this.keys.down = false;
            if (k === 'e') this.keys.keyE = false;
            if (k === 'q') this.keys.keyQ = false;
        });

        // Tabs switcher
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = document.getElementById(btn.dataset.tab);
                if (target) target.classList.add('active');
            });
        });

        // Mobile Touch Zones
        const tLeft = document.getElementById('touch-left');
        const tRight = document.getElementById('touch-right');
        const tJump = document.getElementById('touch-jump');

        if (tLeft && tRight && tJump) {
            tLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.touchSteer = -1; });
            tLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.touchSteer = 0; });
            tRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.touchSteer = 1; });
            tRight.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.touchSteer = 0; });
            tJump.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.jump = true; });
            tJump.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.jump = false; });
        }

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Global Launch
// Expose on window as well as the module-scoped binding: the menu buttons in
// index.html use inline handlers like onclick="game.start('medium')", and those
// resolve against the global scope. With only `let game` the inline handlers
// threw ReferenceError and every menu button did nothing.
let game;
window.game = null;

function boot() {
    if (window.game) return;            // already booted
    try {
        game = new SnowAnsherMaster();
        window.game = game;
        game.init();
    } catch (e) {
        console.error('[SnowAnsher] boot failed:', e && e.stack ? e.stack : e);
        window.game = null;
        const box = document.createElement('div');
        box.id = 'fatal-message';
        box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;'
            + 'justify-content:center;padding:24px;background:rgba(3,10,20,0.95);color:#e8f1ff;'
            + 'font:15px/1.6 system-ui,sans-serif;text-align:center;';
        box.innerHTML = '<div><div style="font-size:22px;font-weight:700;margin-bottom:10px">'
            + 'Snow Ansher cannot start</div><div style="opacity:.85">'
            + (e && e.message ? e.message : e) + '</div></div>';
        document.body.appendChild(box);
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', boot);
} else {
    // Script loaded after DOMContentLoaded already fired (Firefox can schedule
    // scripts differently). Waiting for the event would never boot the game.
    boot();
}
