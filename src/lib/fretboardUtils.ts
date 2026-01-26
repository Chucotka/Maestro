export const ALL_NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const GUITAR_TUNINGS = {
  "Standard":       ["E2", "A2", "D3", "G3", "B3", "E4"],
  "D Standard":     ["D2", "G2", "C3", "F3", "A3", "D4"],
  "C Standard":     ["C2", "F2", "A#2", "D#3", "G3", "C4"],
  "B Standard":     ["B1", "E2", "A2", "D3", "F#3", "B3"],
  "Drop D":         ["D2", "A2", "D3", "G3", "B3", "E4"],
  "Drop C#":        ["C#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
  "Drop C":         ["C2", "G2", "C3", "F3", "A3", "D4"],
  "Drop B":         ["B1", "F#2", "B2", "E3", "G#3", "C#4"],
  "Drop A":         ["A1", "E2", "A2", "D3", "F#3", "B3"],
  "Open G":         ["D2", "G2", "D3", "G3", "B3", "D4"],
  "Open D":         ["D2", "A2", "D3", "F#3", "A3", "D4"],
  "Open C":         ["C2", "G2", "C3", "G3", "C4", "E4"],
  "Open E":         ["E2", "B2", "E3", "G#3", "B3", "E4"],
  "Open A":         ["E2", "A2", "E3", "A3", "C#4", "E4"],
  "Open B":         ["B1", "F#2", "B2", "F#3", "B3", "D#4"],
  "DADGAD":         ["D2", "A2", "D3", "G3", "A3", "D4"],
  "Lute":           ["E2", "A2", "D3", "F#3", "B3", "E4"],
  "New Standard":   ["C2", "G2", "D3", "A3", "E4", "G4"],
  "Half Step Down": ["D#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
  "Full Step Down": ["D2", "G2", "C3", "F3", "A3", "D4"],
  "7-String Std":   ["B1", "E2", "A2", "D3", "G3", "B3", "E4"],
  "8-String Std":   ["F#1", "B1", "E2", "A2", "D3", "G3", "B3", "E4"],
  "Bass (Standard)": ["E1", "A1", "D2", "G2"],
  "Bass (5-String)": ["B0", "E1", "A1", "D2", "G2"],
  "Bass (Drop D)":  ["D1", "A1", "D2", "G2"],
};

export const CHORDS = {
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "5 (Power)": [0, 7],
  "Dominant 7th": [0, 4, 7, 10],
  "Major 7th": [0, 4, 7, 11],
  "Minor 7th": [0, 3, 7, 10],
  "Minor Major 7th": [0, 3, 7, 11],
  "Suspended 4": [0, 5, 7],
  "Suspended 2": [0, 2, 7],
  "Add 9": [0, 4, 7, 14],
  "Major 9": [0, 4, 7, 11, 14],
  "Minor 9": [0, 3, 7, 10, 14],
  "Dominant 9": [0, 4, 7, 10, 14],
  "6th": [0, 4, 7, 9],
  "Minor 6th": [0, 3, 7, 9],
  "Diminished": [0, 3, 6],
  "Diminished 7th": [0, 3, 6, 9],
  "Half-Diminished 7": [0, 3, 6, 10],
  "Augmented": [0, 4, 8],
  "Augmented 7th": [0, 4, 8, 10],
  "7sus4": [0, 5, 7, 10],
  "11th": [0, 4, 7, 10, 14, 17],
  "13th": [0, 4, 7, 10, 14, 17, 21],
};

export const SCALES = {
  // --- Major / Minor ---
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  "HARMONIC MINOR": [0, 2, 3, 5, 7, 8, 11],
  "MELODIC MINOR": [0, 2, 3, 5, 7, 9, 11],
  // --- Pentatonics / Blues ---
  "MAJOR PENTATONIC": [0, 2, 4, 7, 9],
  "MINOR PENTATONIC": [0, 3, 5, 7, 10],
  BLUES: [0, 3, 5, 6, 7, 10],
  // --- Modes ---
  DORIAN: [0, 2, 3, 5, 7, 9, 10],
  PHRYGIAN: [0, 1, 3, 5, 7, 8, 10],
  LYDIAN: [0, 2, 4, 6, 7, 9, 11],
  MIXOLYDIAN: [0, 2, 4, 5, 7, 9, 10],
  LOCRIAN: [0, 1, 3, 5, 6, 8, 10],
  // --- Exotic ---
  "WHOLE TONE": [0, 2, 4, 6, 8, 10],
  "DIMINISHED (H-W)": [0, 1, 3, 4, 6, 7, 9, 10],
  "DIMINISHED (W-H)": [0, 2, 3, 5, 6, 8, 9, 11],
  "ALTERED": [0, 1, 3, 4, 6, 8, 10],
  "LYDIAN DOMINANT": [0, 2, 4, 6, 7, 9, 10],
  "PHRYGIAN DOMINANT": [0, 1, 4, 5, 7, 8, 10],
  "ENIGMATIC": [0, 1, 4, 6, 8, 10, 11],
  "HUNGARIAN MINOR": [0, 2, 3, 6, 7, 8, 11],
  "HUNGARIAN MAJOR": [0, 3, 4, 6, 7, 9, 10],
};

/**
 * Calculates the note with octave at a specific fret on a given string.
 * @param openStringNoteWithOctave The note of the open string with octave (e.g., "E2").
 * @param fretNumber The fret number (0 for open string).
 * @returns The note name with octave (e.g., "G#4").
 */
export const getNoteAtFret = (openStringNoteWithOctave: string, fretNumber: number): string => {
  const match = openStringNoteWithOctave.match(/([A-G]#?)([0-9])/);
  if (!match) {
    throw new Error(`Invalid open string note format: ${openStringNoteWithOctave}`);
  }
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  const startIndex = ALL_NOTES.indexOf(noteName);
  if (startIndex === -1) {
    throw new Error(`Invalid open string note: ${noteName}`);
  }

  const totalSemitones = startIndex + fretNumber;
  const noteIndex = totalSemitones % ALL_NOTES.length;
  const octaveOffset = Math.floor(totalSemitones / ALL_NOTES.length);
  
  const finalNote = ALL_NOTES[noteIndex];
  const finalOctave = octave + octaveOffset;

  return `${finalNote}${finalOctave}`;
};

/**
 * Calculates the notes for a given scale and root note.
 * @param rootNote The root note of the scale (e.g., "C").
 * @param scaleIntervals An array of semitone intervals for the scale.
 * @returns An array of note names in the scale.
 */
export const getScaleNotes = (rootNote: string, scaleIntervals: number[]): string[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote.toUpperCase());
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  return scaleIntervals.map(interval => {
    const noteIndex = (rootIndex + interval) % ALL_NOTES.length;
    return ALL_NOTES[noteIndex];
  });
};

/**
 * Calculates the notes for a given chord and root note.
 * @param rootNote The root note of the chord (e.g., "C").
 * @param chordIntervals An array of semitone intervals for the chord.
 * @returns An array of note names in the chord.
 */
export const getChordNotes = (rootNote: string, chordIntervals: number[]): string[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote.toUpperCase());
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  // Use a Set to ensure unique note names (e.g., for chords spanning multiple octaves)
  const notes = new Set<string>();
  chordIntervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % ALL_NOTES.length;
    notes.add(ALL_NOTES[noteIndex]);
  });
  return Array.from(notes);
};

export interface CAGEDNote {
  string: number;
  relativeFret: number;
  interval: string;
}

export const CAGED_SHAPES: Record<string, CAGEDNote[]> = {
  'C': [
    { string: 5, relativeFret: 3, interval: 'R' },
    { string: 4, relativeFret: 2, interval: '3' },
    { string: 3, relativeFret: 0, interval: '5' },
    { string: 2, relativeFret: 1, interval: 'R' },
    { string: 1, relativeFret: 0, interval: '3' },
  ],
  'A': [
    { string: 5, relativeFret: 0, interval: 'R' },
    { string: 4, relativeFret: 2, interval: '5' },
    { string: 3, relativeFret: 2, interval: 'R' },
    { string: 2, relativeFret: 2, interval: '3' },
    { string: 1, relativeFret: 0, interval: '5' },
  ],
  'G': [
    { string: 6, relativeFret: 3, interval: 'R' },
    { string: 5, relativeFret: 2, interval: '3' },
    { string: 4, relativeFret: 0, interval: '5' },
    { string: 3, relativeFret: 0, interval: 'R' },
    { string: 2, relativeFret: 0, interval: '3' },
    { string: 1, relativeFret: 3, interval: 'R' },
  ],
  'E': [
    { string: 6, relativeFret: 0, interval: 'R' },
    { string: 5, relativeFret: 2, interval: '5' },
    { string: 4, relativeFret: 2, interval: 'R' },
    { string: 3, relativeFret: 1, interval: '3' },
    { string: 2, relativeFret: 0, interval: '5' },
    { string: 1, relativeFret: 0, interval: 'R' },
  ],
  'D': [
    { string: 4, relativeFret: 0, interval: 'R' },
    { string: 3, relativeFret: 2, interval: '5' },
    { string: 2, relativeFret: 3, interval: 'R' },
    { string: 1, relativeFret: 2, interval: '3' },
  ],
};

export const getCAGEDNotes = (root: string, shapeName: string, tuning: string[]): { string: number, fret: number, noteName: string, interval: string }[] => {
  const shape = CAGED_SHAPES[shapeName];
  if (!shape) return [];

  const rootString = shape.find(n => n.interval === 'R')?.string || 6;
  const tuningStrings = [...tuning].reverse(); // from [E2...E4] to [E4...E2]
  const openStringNote = tuningStrings[rootString - 1];

  const openNoteName = openStringNote.match(/[A-G]#?/)?.[0] || '';
  const openNoteIndex = ALL_NOTES.indexOf(openNoteName);
  const rootNoteIndex = ALL_NOTES.indexOf(root);

  let rootFret = (rootNoteIndex - openNoteIndex + 12) % 12;

  const shapeRootRelativeFret = shape.find(n => n.interval === 'R')?.relativeFret || 0;
  let baseFret = rootFret - shapeRootRelativeFret;
  // We want to keep it in a reasonable range, e.g. 0-12
  while (baseFret < 0) baseFret += 12;

  return shape.map(n => {
    const sIdx = tuningStrings.length - n.string;
    const sOpenNote = tuning[sIdx].match(/[A-G]#?/)?.[0] || '';
    const absFret = baseFret + n.relativeFret;
    const noteName = ALL_NOTES[(ALL_NOTES.indexOf(sOpenNote) + absFret) % 12];

    return {
      string: n.string,
      fret: absFret,
      noteName,
      interval: n.interval
    };
  });
};

export const EMOTIONS = {
  "Happy / Joyful": {
    progressions: [
      ["I", "IV", "V", "IV"],
      ["I", "V", "vi", "IV"],
      ["I", "ii", "V", "I"],
    ],
    scales: ["MAJOR", "LYDIAN", "MAJOR PENTATONIC"]
  },
  "Sad / Melancholy": {
    progressions: [
      ["i", "VI", "III", "VII"],
      ["i", "iv", "v", "i"],
      ["i", "v", "VI", "iv"],
    ],
    scales: ["MINOR", "PHRYGIAN", "MINOR PENTATONIC"]
  },
  "Epic / Heroic": {
    progressions: [
      ["i", "VI", "VII", "i"],
      ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
      ["i", "iv", "VII", "III"],
    ],
    scales: ["MINOR", "DORIAN", "HARMONIC MINOR"]
  },
  "Dark / Mysterious": {
    progressions: [
      ["i", "bII", "i", "bII"],
      ["i", "v", "#iv", "i"],
      ["i", "vi", "v", "i"],
    ],
    scales: ["LOCRIAN", "PHRYGIAN DOMINANT", "ALTERED"]
  },
  "Jazz / Sophisticated": {
    progressions: [
      ["ii7", "V7", "Imaj7"],
      ["Imaj7", "vi7", "ii7", "V7"],
      ["iii7", "vi7", "ii7", "V7"],
    ],
    scales: ["DORIAN", "MIXOLYDIAN", "MELODIC MINOR"]
  }
};

/**
 * Converts Roman numeral notation to actual chord names based on a key and scale.
 * Simple implementation for basic Major/Minor keys.
 */
export const romanToChord = (roman: string, rootNote: string, isMajorKey: boolean): { root: string, type: keyof typeof CHORDS } => {
  const scale = isMajorKey ? SCALES.MAJOR : SCALES.MINOR;
  const rootIndex = ALL_NOTES.indexOf(rootNote);

  const map: Record<string, { degree: number, type: keyof typeof CHORDS }> = {
    "I": { degree: 0, type: "Major" },
    "ii": { degree: 1, type: "Minor" },
    "iii": { degree: 2, type: "Minor" },
    "IV": { degree: 3, type: "Major" },
    "V": { degree: 4, type: "Major" },
    "vi": { degree: 5, type: "Minor" },
    "vii°": { degree: 6, type: "Diminished" },
    "i": { degree: 0, type: "Minor" },
    "ii°": { degree: 1, type: "Diminished" },
    "III": { degree: 2, type: "Major" },
    "iv": { degree: 3, type: "Minor" },
    "v": { degree: 4, type: "Minor" },
    "VI": { degree: 5, type: "Major" },
    "VII": { degree: 6, type: "Major" },
    "Imaj7": { degree: 0, type: "Major 7th" },
    "ii7": { degree: 1, type: "Minor 7th" },
    "iii7": { degree: 2, type: "Minor 7th" },
    "IVmaj7": { degree: 3, type: "Major 7th" },
    "V7": { degree: 4, type: "Dominant 7th" },
    "vi7": { degree: 5, type: "Minor 7th" },
    "bII": { degree: 1, type: "Major" }, // Neapolitan
    "#iv": { degree: 6, type: "Minor" }, // For mysterious
  };

  const info = map[roman] || { degree: 0, type: "Major" };
  const chordRootIndex = (rootIndex + scale[info.degree % scale.length]) % ALL_NOTES.length;

  return {
    root: ALL_NOTES[chordRootIndex],
    type: info.type
  };
};