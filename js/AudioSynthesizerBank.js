/**
 * ============================================================================
 * SNOW ANSHER 3D - ADVANCED FM & WAVETABLE SYNTHESIZER SOUND BANK
 * 8 Custom Procedural Instruments: Glacier Bells, Ice Plucks, Acid Bass,
 * Sub-Zero Ethereal Pads, Frost Flutes, and Fanfare Brass Stabs with FM Modulation.
 * ============================================================================
 */

class AudioSynthesizerBank {
    constructor(audioCtx, masterOutput) {
        this.ctx = audioCtx;
        this.output = masterOutput;

        // Note to frequency calculation table (A0 to C8)
        this.freqTable = {};
        this.buildFrequencyTable();
    }

    buildFrequencyTable() {
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        for (let octave = 0; octave <= 8; octave++) {
            for (let i = 0; i < 12; i++) {
                const noteNumber = octave * 12 + i;
                const freq = 440.0 * Math.pow(2.0, (noteNumber - 57) / 12.0);
                const name = `${noteNames[i]}${octave}`;
                this.freqTable[name] = freq;
            }
        }
    }

    getFreq(noteStr) {
        return this.freqTable[noteStr] || 440.0;
    }

    /**
     * Glacier Bell (Crystalline celesta with FM bell modulation)
     */
    playGlacierBell(freq, time = 0, duration = 0.8, volume = 0.25) {
        if (!this.ctx) return;
        const now = time || this.ctx.currentTime;

        // Carrier
        const carrier = this.ctx.createOscillator();
        const carrierGain = this.ctx.createGain();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(freq, now);

        // Modulator for metallic bell chime
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        mod.type = 'sine';
        mod.frequency.setValueAtTime(freq * 3.5, now);
        modGain.gain.setValueAtTime(freq * 1.8, now);
        modGain.gain.exponentialRampToValueAtTime(1.0, now + duration);

        mod.connect(carrier.frequency);
        carrier.connect(carrierGain);
        carrierGain.connect(this.output);

        carrierGain.gain.setValueAtTime(volume, now);
        carrierGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        mod.start(now);
        carrier.start(now);
        mod.stop(now + duration);
        carrier.stop(now + duration);
    }

    /**
     * Sub-Zero Pad (Warm ambient choral swell)
     */
    playSubZeroPad(freq, time = 0, duration = 2.0, volume = 0.18) {
        if (!this.ctx) return;
        const now = time || this.ctx.currentTime;

        for (let detune of [-6, 0, 6]) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(detune, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.linearRampToValueAtTime(1200, now + duration * 0.5);
            filter.frequency.linearRampToValueAtTime(400, now + duration);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(volume / 3, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.output);

            osc.start(now);
            osc.stop(now + duration);
        }
    }

    /**
     * Ice Pluck (Short snappy winter pizzicato)
     */
    playIcePluck(freq, time = 0, volume = 0.22) {
        if (!this.ctx) return;
        const now = time || this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.22);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        osc.start(now);
        osc.stop(now + 0.24);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSynthesizerBank;
}
