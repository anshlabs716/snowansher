/**
 * ============================================================================
 * SNOW ANSHER 3D - MULTI-TRACK PROCEDURAL AUDIO ENGINE & SOUND SYNTHESIZER
 * Built completely on Web Audio API - Zero external MP3 files or network lag.
 * Features 20+ dynamic sound effects, adaptive wind & carving physics audio,
 * and a 4-channel procedural synthwave soundtrack with tempo & intensity scaling.
 * ============================================================================
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.initialized = false;
        this.volume = 0.8;
        this.musicVolume = 0.5;

        // Adaptive continuous sound generators
        this.windSource = null;
        this.windGain = null;
        this.windFilter = null;

        this.slideSource = null;
        this.slideGain = null;
        this.slideFilter = null;

        this.railSource = null;
        this.railGain = null;
        this.railFilter = null;

        this.thrusterSource = null;
        this.thrusterGain = null;
        this.thrusterFilter = null;

        // Music Tracker State
        this.musicRunning = false;
        this.bpm = 128;
        this.currentStep = 0;
        this.nextNoteTime = 0.0;
        this.chordIndex = 0;
        this.intensityLevel = 1.0; // scales with speed and tricks

        // Winter Synth Musical Scales (Key: D Dorian / Winter Euphoria)
        this.chordProgression = [
            // Dm9
            { root: 146.83, notes: [293.66, 349.23, 440.00, 523.25, 659.25] },
            // Bbmaj7
            { root: 116.54, notes: [233.08, 293.66, 349.23, 440.00, 587.33] },
            // Fadd9
            { root: 87.31,  notes: [174.61, 220.00, 261.63, 329.63, 392.00] },
            // C6/9
            { root: 130.81, notes: [261.63, 329.63, 392.00, 440.00, 587.33] }
        ];

        this.drumPatterns = [
            { kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], snare: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], hat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
            { kick: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0], snare: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1], hat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] }
        ];
    }

    /**
     * Initialize AudioContext upon user gesture
     */
    init() {
        if (this.initialized) {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            // Main Gain bus
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            // Sub-mix gains
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            // Master compressor to ensure crystal clear mix without clipping
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
            this.compressor.connect(this.masterGain);

            this.setupContinuousWind();
            this.setupContinuousCarve();
            this.setupContinuousGrind();
            this.setupContinuousThruster();

            this.initialized = true;
            console.log('❄️ AudioEngine initialized with Web Audio API');
        } catch (e) {
            console.warn('Web Audio initialization error:', e);
        }
    }

    setMasterVolume(val) {
        this.volume = THREE.MathUtils.clamp(val, 0, 1);
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
    }

    setMusicVolume(val) {
        this.musicVolume = THREE.MathUtils.clamp(val, 0, 1);
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
        }
    }

    // ─── CONTINUOUS PROCEDURAL LOOP GENERATORS ───

    setupContinuousWind() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = buffer;
        this.windSource.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        this.windSource.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.sfxGain);
        this.windSource.start();
    }

    setupContinuousCarve() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.slideSource = this.ctx.createBufferSource();
        this.slideSource.buffer = buffer;
        this.slideSource.loop = true;

        this.slideFilter = this.ctx.createBiquadFilter();
        this.slideFilter.type = 'bandpass';
        this.slideFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        this.slideFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        this.slideGain = this.ctx.createGain();
        this.slideGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.slideSource.connect(this.slideFilter);
        this.slideFilter.connect(this.slideGain);
        this.slideGain.connect(this.sfxGain);
        this.slideSource.start();
    }

    setupContinuousGrind() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.8;
        }

        this.railSource = this.ctx.createBufferSource();
        this.railSource.buffer = buffer;
        this.railSource.loop = true;

        this.railFilter = this.ctx.createBiquadFilter();
        this.railFilter.type = 'highpass';
        this.railFilter.frequency.setValueAtTime(2800, this.ctx.currentTime);

        this.railGain = this.ctx.createGain();
        this.railGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.railSource.connect(this.railFilter);
        this.railFilter.connect(this.railGain);
        this.railGain.connect(this.sfxGain);
        this.railSource.start();
    }

    setupContinuousThruster() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.thrusterSource = this.ctx.createBufferSource();
        this.thrusterSource.buffer = buffer;
        this.thrusterSource.loop = true;

        this.thrusterFilter = this.ctx.createBiquadFilter();
        this.thrusterFilter.type = 'bandpass';
        this.thrusterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
        this.thrusterFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        this.thrusterGain = this.ctx.createGain();
        this.thrusterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.thrusterSource.connect(this.thrusterFilter);
        this.thrusterFilter.connect(this.thrusterGain);
        this.thrusterGain.connect(this.sfxGain);
        this.thrusterSource.start();
    }

    /**
     * Update continuous audio levels based on player state each frame
     */
    updatePhysicsAudio(params) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const { speedRatio, isGrounded, isSteering, isGrinding, isBoosting, airTime } = params;

        // Wind roar scales with velocity and airtime
        if (this.windGain && this.windFilter) {
            const targetWindVol = 0.05 + speedRatio * 0.35 + (airTime > 0.3 ? 0.25 : 0.0);
            const targetFreq = 220 + speedRatio * 1800 + (airTime > 0.5 ? 600 : 0);
            this.windGain.gain.setTargetAtTime(targetWindVol, now, 0.06);
            this.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.06);
        }

        // Snow carving crunch
        if (this.slideGain && this.slideFilter) {
            const targetSlideVol = (isGrounded && !isGrinding) ? (0.04 + speedRatio * 0.18 + (isSteering ? 0.16 : 0.0)) : 0.0;
            const targetFreq = 950 + (isSteering ? 850 : 0) + speedRatio * 600;
            this.slideGain.gain.setTargetAtTime(targetSlideVol, now, 0.04);
            this.slideFilter.frequency.setTargetAtTime(targetFreq, now, 0.04);
        }

        // Ice rail metallic grinding
        if (this.railGain && this.railFilter) {
            const targetRailVol = isGrinding ? 0.28 : 0.0;
            this.railGain.gain.setTargetAtTime(targetRailVol, now, 0.03);
        }

        // Rocket booster thrust
        if (this.thrusterGain && this.thrusterFilter) {
            const targetThrustVol = isBoosting ? 0.32 : 0.0;
            this.thrusterGain.gain.setTargetAtTime(targetThrustVol, now, 0.04);
        }
    }

    // ─── DYNAMIC PROCEDURAL SOUND EFFECTS ───

    /**
     * Massive High-Speed Jump Launch Whoosh
     */
    playJumpLaunch(power = 1.0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Upward frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(140 * power, now);
        osc.frequency.exponentialRampToValueAtTime(680 * power, now + 0.3);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.35);

        // Sub-bass lift thump
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(90, now);
        subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.2);
        subGain.gain.setValueAtTime(0.3, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        subOsc.connect(subGain);
        subGain.connect(this.sfxGain);
        subOsc.start(now);
        subOsc.stop(now + 0.22);
    }

    /**
     * Solid Snow Impact Landing Thump & Puff
     */
    playLanding(impactStrength = 1.0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        osc.frequency.setValueAtTime(110 * impactStrength, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

        gain.gain.setValueAtTime(0.55 * Math.min(1.5, impactStrength), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    /**
     * Trick Completed Fanfare & Stunt Success
     */
    playTrickSuccess(points = 100) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';

            const start = now + idx * 0.055;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.24, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.28);
        });

        // Crowd celebration gasp/cheer burst
        this.playCrowdCheer();
    }

    playCrowdCheer() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    /**
     * Boost Pad Jet Ignition
     */
    playBoostIgnite() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.42);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    /**
     * Holiday Gift Sparkling Chime
     */
    playGiftCollect() {
        if (!this.ctx) return;
        const pitches = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
        pitches.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';

            const start = this.ctx.currentTime + idx * 0.05;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.28, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.35);
        });
    }

    /**
     * Close-Call Obstacle Brush Sound
     */
    playNearMiss() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(1975.53, now); // B6
        osc.frequency.exponentialRampToValueAtTime(2637.02, now + 0.14); // E7

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    /**
     * Power-Up Collected (Shield, Magnet, Multiplier, etc.)
     */
    playPowerupPickup(type) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const freqs = {
            shield: [392, 587, 880],
            magnet: [440, 659, 987],
            rocket: [220, 440, 880, 1760],
            slowmo: [880, 659, 440, 220],
            multiplier: [523, 783, 1046, 1567]
        }[type] || [440, 660, 880];

        freqs.forEach((f, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'sine';
            const t = now + i * 0.06;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0.25, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(t);
            o.stop(t + 0.3);
        });
    }

    /**
     * Catastrophic Crash Explosion & Debris Shatter
     */
    playCrashImpact() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Sub bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(140, now);
        sub.frequency.exponentialRampToValueAtTime(18, now + 0.55);
        subGain.gain.setValueAtTime(0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.6);

        // Heavy crunchy noise shatter
        const bufferSize = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    // ─── 4-CHANNEL PROCEDURAL SYNTHWAVE SOUNDTRACK ───

    startMusic() {
        this.musicRunning = true;
        this.nextNoteTime = this.ctx ? this.ctx.currentTime + 0.1 : 0;
        this.currentStep = 0;
        this.chordIndex = 0;
    }

    stopMusic() {
        this.musicRunning = false;
    }

    updateMusicSequencer() {
        if (!this.musicRunning || !this.ctx || this.ctx.state !== 'running') return;

        const stepDuration = 60.0 / (this.bpm * 4); // 16th notes
        while (this.nextNoteTime < this.ctx.currentTime + 0.25) {
            this.scheduleStep(this.currentStep, this.nextNoteTime);
            this.nextNoteTime += stepDuration;
            this.currentStep = (this.currentStep + 1) % 16;
            if (this.currentStep === 0) {
                this.chordIndex = (this.chordIndex + 1) % this.chordProgression.length;
            }
        }
    }

    scheduleStep(step, time) {
        const chord = this.chordProgression[this.chordIndex];

        // 1. Kick Drum (Steps 0, 4, 8, 12)
        if (step % 4 === 0) {
            this.playKick(time);
        }

        // 2. Snare Drum (Steps 4, 12)
        if (step === 4 || step === 12) {
            this.playSnare(time);
        }

        // 3. Hi-Hat (Every 8th note or 16th note depending on speed)
        if (step % 2 === 0 || this.intensityLevel > 1.3) {
            this.playHat(time);
        }

        // 4. Bassline (Punchy rolling 16th bass)
        if (step % 2 === 0 || (step % 4 === 3 && this.intensityLevel > 1.1)) {
            this.playBassNote(chord.root, time);
        }

        // 5. Arpeggio Synth Lead
        const arpNotes = chord.notes;
        const noteIdx = (step * 2 + this.chordIndex) % arpNotes.length;
        this.playLeadNote(arpNotes[noteIdx], time);
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(130, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    playSnare(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);

        // Snare snap noise
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1500, time);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.25, time);
        nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.musicGain);
        noise.start(time);
    }

    playHat(time) {
        const bufferSize = this.ctx.sampleRate * 0.04;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6500, time);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
    }

    playBassNote(freq, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);
        filter.frequency.exponentialRampToValueAtTime(150, time + 0.15);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.18);
    }

    playLeadNote(freq, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.22);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
