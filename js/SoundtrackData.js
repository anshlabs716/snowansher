/**
 * ============================================================================
 * SNOW ANSHER 3D - MULTI-SONG PROCEDURAL SYNTHWAVE SOUNDTRACK DATA
 * 3 Full-Length Chiptune & Winter Synthwave Tracks with complete note sequences,
 * basslines, arpeggios, drum patterns, chord progressions, and synthesizer patches:
 * Track 1: "Alpine Rush" (High-Energy Cyber Arcade)
 * Track 2: "Aurora Borealis" (Atmospheric Chill Euphoria)
 * Track 3: "Blizzard Velocity" (Fast-Paced Drum & Bass / Electro)
 * ============================================================================
 */

const SoundtrackData = {
    tracks: [
        {
            id: 0,
            title: "Alpine Rush",
            bpm: 132,
            key: "D Minor",
            style: "Cyber Synthwave",
            chords: [
                // Section A: Main Theme
                { root: 146.83, name: "Dm", notes: [293.66, 349.23, 440.00, 523.25], bass: 73.42 },
                { root: 116.54, name: "Bb", notes: [233.08, 293.66, 349.23, 466.16], bass: 58.27 },
                { root: 130.81, name: "C",  notes: [261.63, 329.63, 392.00, 523.25], bass: 65.41 },
                { root: 110.00, name: "Am", notes: [220.00, 261.63, 329.63, 440.00], bass: 55.00 },
                // Section B: Climactic Lift
                { root: 146.83, name: "Dm9", notes: [293.66, 349.23, 440.00, 587.33, 659.25], bass: 73.42 },
                { root: 164.81, name: "Em7b5", notes: [329.63, 392.00, 466.16, 587.33], bass: 82.41 },
                { root: 174.61, name: "Fmaj7", notes: [349.23, 440.00, 523.25, 659.25], bass: 87.31 },
                { root: 196.00, name: "G",   notes: [392.00, 493.88, 587.33, 783.99], bass: 98.00 }
            ],
            leadMelody: [
                // 32-step melodic phrase
                { step: 0,  note: 587.33, len: 0.25 }, // D5
                { step: 2,  note: 523.25, len: 0.25 }, // C5
                { step: 4,  note: 440.00, len: 0.50 }, // A4
                { step: 7,  note: 466.16, len: 0.25 }, // Bb4
                { step: 8,  note: 523.25, len: 0.50 }, // C5
                { step: 11, note: 587.33, len: 0.25 }, // D5
                { step: 12, note: 659.25, len: 0.50 }, // E5
                { step: 15, note: 698.46, len: 0.25 }, // F5
                { step: 16, note: 783.99, len: 0.75 }, // G5
                { step: 20, note: 698.46, len: 0.25 }, // F5
                { step: 22, note: 659.25, len: 0.50 }, // E5
                { step: 24, note: 587.33, len: 0.50 }, // D5
                { step: 27, note: 523.25, len: 0.25 }, // C5
                { step: 28, note: 440.00, len: 0.75 }, // A4
                { step: 31, note: 587.33, len: 0.25 }  // D5
            ],
            arpeggioPattern: [0, 2, 1, 3, 2, 4, 3, 1, 0, 3, 2, 4, 1, 2, 3, 4],
            drumBeat: {
                kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,1, 1,0,1,0],
                snare: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
                hat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
            }
        },
        {
            id: 1,
            title: "Aurora Borealis",
            bpm: 118,
            key: "F# Minor",
            style: "Dreamy Winter Ambient",
            chords: [
                { root: 185.00, name: "F#m", notes: [370.00, 440.00, 554.37, 740.00], bass: 92.50 },
                { root: 146.83, name: "D",   notes: [293.66, 370.00, 440.00, 587.33], bass: 73.42 },
                { root: 110.00, name: "A",   notes: [220.00, 277.18, 330.00, 440.00], bass: 55.00 },
                { root: 164.81, name: "E",   notes: [330.00, 415.30, 493.88, 659.25], bass: 82.41 },
                { root: 123.47, name: "Bm",  notes: [246.94, 293.66, 370.00, 493.88], bass: 61.74 },
                { root: 185.00, name: "F#m9",notes: [370.00, 440.00, 554.37, 830.61], bass: 92.50 }
            ],
            leadMelody: [
                { step: 0,  note: 740.00, len: 0.50 }, // F#5
                { step: 3,  note: 659.25, len: 0.25 }, // E5
                { step: 4,  note: 554.37, len: 0.75 }, // C#5
                { step: 8,  note: 587.33, len: 0.50 }, // D5
                { step: 12, note: 440.00, len: 0.75 }, // A4
                { step: 16, note: 880.00, len: 0.75 }, // A5
                { step: 20, note: 740.00, len: 0.25 }, // F#5
                { step: 22, note: 659.25, len: 0.50 }, // E5
                { step: 26, note: 554.37, len: 0.50 }, // C#5
                { step: 28, note: 493.88, len: 0.75 }  // B4
            ],
            arpeggioPattern: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 2],
            drumBeat: {
                kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
                snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                hat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
            }
        },
        {
            id: 2,
            title: "Blizzard Velocity",
            bpm: 155,
            key: "A Minor",
            style: "Fast High-Altitude D&B",
            chords: [
                { root: 220.00, name: "Am", notes: [440.00, 523.25, 659.25, 880.00], bass: 110.00 },
                { root: 174.61, name: "F",  notes: [349.23, 440.00, 523.25, 698.46], bass: 87.31 },
                { root: 130.81, name: "C",  notes: [261.63, 329.63, 392.00, 523.25], bass: 65.41 },
                { root: 196.00, name: "G",  notes: [392.00, 493.88, 587.33, 783.99], bass: 98.00 },
                { root: 246.94, name: "Bdim", notes: [493.88, 587.33, 698.46, 987.77], bass: 123.47 },
                { root: 164.81, name: "E7", notes: [329.63, 415.30, 493.88, 659.25], bass: 82.41 }
            ],
            leadMelody: [
                { step: 0,  note: 880.00, len: 0.20 }, // A5
                { step: 2,  note: 783.99, len: 0.20 }, // G5
                { step: 4,  note: 659.25, len: 0.35 }, // E5
                { step: 6,  note: 698.46, len: 0.20 }, // F5
                { step: 8,  note: 783.99, len: 0.35 }, // G5
                { step: 10, note: 880.00, len: 0.20 }, // A5
                { step: 12, note: 1046.5, len: 0.45 }, // C6
                { step: 15, note: 987.77, len: 0.20 }, // B5
                { step: 16, note: 880.00, len: 0.50 }  // A5
            ],
            arpeggioPattern: [0, 3, 1, 2, 0, 3, 2, 1, 3, 2, 1, 0, 2, 1, 3, 0],
            drumBeat: {
                kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
                snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
                hat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
            }
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundtrackData;
}
