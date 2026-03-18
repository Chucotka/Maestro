export const ALL_NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const GUITAR_TUNINGS = {
  "Standard": ["E2", "A2", "D3", "G3", "B3", "E4"],
  "D Standard": ["D2", "G2", "C3", "F3", "A3", "D4"],
  "C Standard": ["C2", "F2", "A#2", "D#3", "G3", "C4"],
  "B Standard": ["B1", "E2", "A2", "D3", "F#3", "B3"],
  "Drop D": ["D2", "A2", "D3", "G3", "B3", "E4"],
  "Drop C#": ["C#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
  "Drop C": ["C2", "G2", "C3", "F3", "A3", "D4"],
  "Drop B": ["B1", "F#2", "B2", "E3", "G#3", "C#4"],
  "Drop A": ["A1", "E2", "A2", "D3", "F#3", "B3"],
  "Open G": ["D2", "G2", "D3", "G3", "B3", "D4"],
  "Open D": ["D2", "A2", "D3", "F#3", "A3", "D4"],
  "Open C": ["C2", "G2", "C3", "G3", "C4", "E4"],
  "Open E": ["E2", "B2", "E3", "G#3", "B3", "E4"],
  "Open A": ["E2", "A2", "E3", "A3", "C#4", "E4"],
  "Open B": ["B1", "F#2", "B2", "F#3", "B3", "D#4"],
  "DADGAD": ["D2", "A2", "D3", "G3", "A3", "D4"],
  "Lute": ["E2", "A2", "D3", "F#3", "B3", "E4"],
  "New Standard": ["C2", "G2", "D3", "A3", "E4", "G4"],
  "Half Step Down": ["D#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
  "Full Step Down": ["D2", "G2", "C3", "F3", "A3", "D4"],
  "7-String Std": ["B1", "E2", "A2", "D3", "G3", "B3", "E4"],
  "8-String Std": ["F#1", "B1", "E2", "A2", "D3", "G3", "B3", "E4"],
  "Bass (Standard)": ["E1", "A1", "D2", "G2"],
  "Bass (5-String)": ["B0", "E1", "A1", "D2", "G2"],
  "Bass (Drop D)": ["D1", "A1", "D2", "G2"],
  "Ukulele (Std)": ["G4", "C4", "E4", "A4"],
  "Ukulele (Low G)": ["G3", "C4", "E4", "A4"],
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
  "BLUES MAJOR": [0, 2, 3, 4, 7, 9],
  "BLUES MINOR": [0, 3, 5, 6, 7, 10],
  // --- Modes ---
  DORIAN: [0, 2, 3, 5, 7, 9, 10],
  PHRYGIAN: [0, 1, 3, 5, 7, 8, 10],
  LYDIAN: [0, 2, 4, 6, 7, 9, 11],
  MIXOLYDIAN: [0, 2, 4, 5, 7, 9, 10],
  LOCRIAN: [0, 1, 3, 5, 6, 8, 10],
  // --- Exotic / Genre Specific ---
  "JAZZ MINOR": [0, 2, 3, 5, 7, 9, 11],
  "SPANISH GYPSY": [0, 1, 4, 5, 7, 8, 10],
  "FLAMENCO": [0, 1, 4, 5, 7, 8, 11],
  "WHOLE TONE": [0, 2, 4, 6, 8, 10],
  "DIMINISHED (H-W)": [0, 1, 3, 4, 6, 7, 9, 10],
  "DIMINISHED (W-H)": [0, 2, 3, 5, 6, 8, 9, 11],
  "ALTERED": [0, 1, 3, 4, 6, 8, 10],
  "LYDIAN DOMINANT": [0, 2, 4, 6, 7, 9, 10],
  "PHRYGIAN DOMINANT": [0, 1, 4, 5, 7, 8, 10],
  "ENIGMATIC": [0, 1, 4, 6, 8, 10, 11],
  "HUNGARIAN MINOR": [0, 2, 3, 6, 7, 8, 11],
  "HUNGARIAN MAJOR": [0, 3, 4, 6, 7, 9, 10],
  "ORIENTAL": [0, 1, 4, 5, 6, 9, 10],
  "BEBOP DOMINANT": [0, 2, 4, 5, 7, 9, 10, 11],
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

export const findScalesByNotes = (inputNotes: string[]) => {
  const normalizedInput = inputNotes.map(n => n.toUpperCase().trim());
  const results: { root: string, type: string, notes: string[] }[] = [];

  if (normalizedInput.length === 0) return [];

  ALL_NOTES.forEach(root => {
    // Check Scales
    Object.entries(SCALES).forEach(([scaleType, intervals]) => {
      const scaleNotes = getScaleNotes(root, intervals);
      if (normalizedInput.every(n => scaleNotes.includes(n))) {
        results.push({ root, type: scaleType, notes: scaleNotes });
      }
    });

    // Check Chords
    Object.entries(CHORDS).forEach(([chordType, intervals]) => {
      const chordNotes = getChordNotes(root, intervals);
      if (normalizedInput.every(n => chordNotes.includes(n))) {
        results.push({ root, type: chordType, notes: chordNotes });
      }
    });
  });

  return results.slice(0, 10); // Limit to 10 results
};

export interface VoicingNote {
  string: number;
  relativeFret: number;
  interval: string;
}

export const CHORD_VOICINGS: Record<string, Record<string, VoicingNote[]>> = {
  "Major": {
    "Shape E (Barre)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 2, interval: '1' },
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 0, interval: '5' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape A (Barre)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 2, interval: '3' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Shape D": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 2, interval: '5' },
      { string: 2, relativeFret: 3, interval: '1' },
      { string: 1, relativeFret: 2, interval: '3' },
    ],
    "Shape C": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 2, interval: '3' },
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: 0, interval: '3' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: 0, interval: '3' },
    ],
    "Triad (D-G-B)": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 0, interval: '5' },
    ],
    "Triad (A-D-G)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: -1, interval: '3' },
      { string: 3, relativeFret: -3, interval: '5' },
    ],
    "Shape G": [
      { string: 6, relativeFret: 3, interval: '1' },
      { string: 5, relativeFret: 2, interval: '3' },
      { string: 4, relativeFret: 0, interval: '5' },
      { string: 3, relativeFret: 0, interval: '1' },
      { string: 2, relativeFret: 0, interval: '3' },
      { string: 1, relativeFret: 3, interval: '1' },
    ],
  },
  "Minor": {
    "Shape Em (Barre)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 2, interval: '1' },
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: 0, interval: '5' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape Am (Barre)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 1, interval: 'b3' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Shape Dm": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 2, interval: '5' },
      { string: 2, relativeFret: 3, interval: '1' },
      { string: 1, relativeFret: 1, interval: 'b3' },
    ],
    "Shape Gm": [
      { string: 6, relativeFret: 3, interval: '1' },
      { string: 5, relativeFret: 1, interval: 'b3' },
      { string: 4, relativeFret: 0, interval: '5' },
      { string: 3, relativeFret: 0, interval: '1' },
      { string: 2, relativeFret: 3, interval: '5' },
      { string: 1, relativeFret: 3, interval: '1' },
    ],
    "Shape Cm": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 1, interval: 'b3' },
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: 3, interval: '5' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: -1, interval: 'b3' },
    ],
    "Triad (D-G-B)": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: -1, interval: '5' },
    ],
    "Triad (A-D-G)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: -2, interval: 'b3' },
      { string: 3, relativeFret: -3, interval: '5' },
    ],
    "Triad (E-A-D)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: -3, interval: '5' },
      { string: 4, relativeFret: -2, interval: 'b3' },
    ],
  },
  "Dominant 7th": {
    "Shape E7 (Barre)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 0, interval: 'b7' },
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 3, interval: 'b7' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape A7 (Barre)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 0, interval: 'b7' },
      { string: 2, relativeFret: 2, interval: '3' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Shape C7": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 2, interval: '3' },
      { string: 3, relativeFret: 3, interval: 'b7' },
      { string: 2, relativeFret: 1, interval: '1' },
    ],
    "Shape D7": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 2, interval: 'b7' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: 2, interval: '3' },
    ],
    "Shape G7": [
      { string: 6, relativeFret: 3, interval: '1' },
      { string: 5, relativeFret: 2, interval: '3' },
      { string: 4, relativeFret: 3, interval: 'b7' },
      { string: 3, relativeFret: 0, interval: '1' },
      { string: 2, relativeFret: 0, interval: '3' },
      { string: 1, relativeFret: 1, interval: 'b7' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 3, interval: 'b7' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
  },
  "Major 7th": {
    "Shape Emaj7 (Barre)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 1, interval: '7' },
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 0, interval: '5' },
    ],
    "Shape Amaj7 (Barre)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 1, interval: '7' },
      { string: 2, relativeFret: 2, interval: '3' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Shape Cmaj7": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 2, interval: '3' },
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 0, interval: '7' },
    ],
    "Shape Dmaj7": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 2, interval: '5' },
      { string: 2, relativeFret: 2, interval: '7' },
      { string: 1, relativeFret: 2, interval: '3' },
    ],
    "Shape Gmaj7": [
      { string: 6, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 4, interval: '7' },
      { string: 3, relativeFret: 4, interval: '3' },
      { string: 2, relativeFret: 3, interval: '5' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 0, interval: '5' },
      { string: 1, relativeFret: 4, interval: '7' },
    ],
  },
  "Minor 7th": {
    "Shape Em7 (Barre)": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 0, interval: 'b7' },
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: 3, interval: 'b7' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape Am7 (Barre)": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 0, interval: 'b7' },
      { string: 2, relativeFret: 1, interval: 'b3' },
      { string: 1, relativeFret: 3, interval: 'b7' },
    ],
    "Shape Dm7": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 2, interval: '5' },
      { string: 2, relativeFret: 1, interval: 'b3' },
      { string: 1, relativeFret: 1, interval: 'b7' },
    ],
    "Shape Gm7": [
      { string: 6, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 3, interval: 'b7' },
      { string: 3, relativeFret: 3, interval: 'b3' },
      { string: 2, relativeFret: 3, interval: '5' },
    ],
    "Shape Cm7": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 1, interval: 'b3' },
      { string: 3, relativeFret: 3, interval: 'b7' },
      { string: 2, relativeFret: 1, interval: '1' },
      { string: 1, relativeFret: 3, interval: '5' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: 0, interval: '5' },
      { string: 1, relativeFret: 3, interval: 'b7' },
    ],
    "Triad (D-G-B)": [
      { string: 4, relativeFret: 0, interval: '1' },
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: 3, interval: 'b7' },
    ],
  },
  "Suspended 4": {
    "Shape Esus4": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 2, interval: '1' },
      { string: 3, relativeFret: 2, interval: '4' },
      { string: 2, relativeFret: 0, interval: '5' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape Asus4": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 3, interval: '4' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 2, interval: '4' },
      { string: 2, relativeFret: 3, interval: '1' },
      { string: 1, relativeFret: 0, interval: '5' },
    ]
  },
  "Suspended 2": {
    "Shape Esus2": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 4, interval: '2' },
      { string: 3, relativeFret: 4, interval: '5' },
      { string: 2, relativeFret: 0, interval: '1' },
    ],
    "Shape Asus2": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 0, interval: '2' },
      { string: 1, relativeFret: 0, interval: '5' },
    ],
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 0, interval: '2' },
      { string: 1, relativeFret: 0, interval: '5' },
    ]
  },
  "5 (Power)": {
    "Standard": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 2, interval: '1' },
    ],
    "A-string based": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
    ]
  },
  "Diminished": {
    "Triad (Strings 1-3)": [
      { string: 3, relativeFret: 0, interval: 'b3' },
      { string: 2, relativeFret: 0, interval: 'b5' },
      { string: 1, relativeFret: 2, interval: '1' },
    ],
  },
  "Augmented": {
    "Triad (G-B-E)": [
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 1, interval: '#5' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
  },
  "6th": {
    "Shape E6": [
      { string: 6, relativeFret: 0, interval: '1' },
      { string: 5, relativeFret: 2, interval: '5' },
      { string: 4, relativeFret: 2, interval: '1' },
      { string: 3, relativeFret: 1, interval: '3' },
      { string: 2, relativeFret: 2, interval: '6' },
      { string: 1, relativeFret: 0, interval: '1' },
    ],
    "Shape A6": [
      { string: 5, relativeFret: 0, interval: '1' },
      { string: 4, relativeFret: 2, interval: '5' },
      { string: 3, relativeFret: 2, interval: '1' },
      { string: 2, relativeFret: 2, interval: '3' },
      { string: 1, relativeFret: 2, interval: '6' },
    ]
  },
  "Add 9": {
    "Shape Cadd9": [
      { string: 5, relativeFret: 3, interval: '1' },
      { string: 4, relativeFret: 2, interval: '3' },
      { string: 3, relativeFret: 0, interval: '5' },
      { string: 2, relativeFret: 3, interval: '9' },
      { string: 1, relativeFret: 0, interval: '3' },
    ]
  }
};

// Legacy support for CAGED mode
export const CAGED_SHAPES = CHORD_VOICINGS["Major"];

const intervalToSemitones = (interval: string): number => {
  const map: Record<string, number> = {
    '1': 0, 'R': 0,
    'b2': 1, '2': 2, 'b3': 3, '3': 4,
    '4': 5, 'b5': 6, '#4': 6, '5': 7,
    '#5': 8, 'b6': 8, '6': 9, 'b7': 10, '7': 11,
  };
  return map[interval] ?? 0;
};

export const getVoicingNotes = (
  root: string,
  chordType: string,
  voicingName: string,
  tuning: string[]
): { string: number, fret: number, noteName: string, noteWithOctave: string, interval: string }[] => {
  const chordMap = CHORD_VOICINGS[chordType] || CHORD_VOICINGS["Major"];
  const shape = chordMap[voicingName] || Object.values(chordMap)[0];

  if (!shape) return [];

  const tuningStrings = [...tuning].reverse(); // from [E2...E4] to [E4...E2] (Index 0 is High E)
  const rootString = shape.find(n => n.interval === '1' || n.interval === 'R')?.string || 6;

  const effectiveRootString = Math.min(rootString, tuningStrings.length);
  const openStringNote = tuningStrings[effectiveRootString - 1] || tuningStrings[tuningStrings.length - 1];

  const openNoteName = openStringNote.match(/[A-G]#?/)?.[0] || '';
  const openNoteIndex = ALL_NOTES.indexOf(openNoteName);
  const rootNoteIndex = ALL_NOTES.indexOf(root);

  const rootFret = (rootNoteIndex - openNoteIndex + 12) % 12;

  const shapeRootRelativeFret = shape.find(n => n.interval === '1' || n.interval === 'R')?.relativeFret || 0;
  let baseFret = rootFret - shapeRootRelativeFret;

  // We want to keep it in a reasonable range, e.g. 0-12
  while (baseFret < 0) baseFret += 12;

  const filtered = shape.filter(n => n.string <= tuningStrings.length);

  // First pass: calculate fret closest to baseFret for each note
  const fretData = filtered.map(n => {
    const sIdx = n.string - 1;
    const sOpenNote = tuningStrings[sIdx];
    const sOpenNoteName = sOpenNote.match(/[A-G]#?/)?.[0] || '';
    const sOpenNoteIdx = ALL_NOTES.indexOf(sOpenNoteName);
    const semitones = intervalToSemitones(n.interval);
    const targetNoteIndex = (rootNoteIndex + semitones) % 12;

    // Base fret for this note (0-11)
    const baseFretForNote = (targetNoteIndex - sOpenNoteIdx + 12) % 12;

    // Find octave closest to baseFret
    let bestFret = baseFretForNote;
    let bestDist = Math.abs(baseFretForNote - baseFret);
    for (let candidate = baseFretForNote % 12; candidate <= 24; candidate += 12) {
      const dist = Math.abs(candidate - baseFret);
      if (dist < bestDist) {
        bestDist = dist;
        bestFret = candidate;
      }
    }

    return { ...n, fret: bestFret, sOpenNote, baseFretForNote };
  });

  // Second pass: if spread is too wide (>5 frets), try to fix outliers
  const frets = fretData.map(d => d.fret);
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  if (maxFret - minFret > 5) {
    // Calculate median fret as reference
    const sortedFrets = [...frets].sort((a, b) => a - b);
    const medianFret = sortedFrets[Math.floor(sortedFrets.length / 2)];

    for (const d of fretData) {
      // Try shifting outliers by octave to be closer to median
      const candidates = [];
      for (let c = d.baseFretForNote % 12; c <= 24; c += 12) {
        candidates.push(c);
      }
      let bestCandidate = d.fret;
      let bestDist = Math.abs(d.fret - medianFret);
      for (const c of candidates) {
        const dist = Math.abs(c - medianFret);
        if (dist < bestDist) {
          bestDist = dist;
          bestCandidate = c;
        }
      }
      d.fret = bestCandidate;
    }
  }

  return fretData.map(d => {
    const safeFret = Math.max(0, d.fret);
    const noteWithOctave = getNoteAtFret(d.sOpenNote, safeFret);
    const noteName = noteWithOctave.match(/[A-G]#?/)?.[0] || '';

    return {
      string: d.string,
      fret: safeFret,
      noteName,
      noteWithOctave,
      interval: d.interval
    };
  });
};

export const getCAGEDNotes = (root: string, shapeName: string, tuning: string[]) =>
  getVoicingNotes(root, "Major", shapeName, tuning);

export const GENRES = {
  "Blues / Funk": {
    formula: "1 - b3 - 4 - b5 - 5 - b7",
    progressions: [
      ["I7", "IV7", "I7", "I7", "IV7", "IV7", "I7", "I7", "V7", "IV7", "I7", "V7"],
      ["I7", "IV7", "V7"],
      ["i7", "iv7", "v7"],
    ],
    scales: ["BLUES MINOR", "MIXOLYDIAN", "DORIAN"]
  },
  "Jazz / Fusion": {
    formula: "1 - 2 - b3 - 4 - 5 - 6 - b7 (Dorian)",
    progressions: [
      ["ii7", "V7", "Imaj7"],
      ["Imaj7", "vi7", "ii7", "V7"],
      ["iii7", "vi7", "ii7", "V7"],
      ["ii7b5", "V7alt", "imaj7"],
    ],
    scales: ["DORIAN", "MIXOLYDIAN", "ALTERED", "LYDIAN DOMINANT"]
  },
  "Rock / Metal": {
    formula: "1 - 2 - b3 - 4 - 5 - b6 - b7 (Aeolian)",
    progressions: [
      ["i", "VI", "VII", "i"],
      ["i", "v", "VI", "iv"],
      ["I", "bVII", "IV", "I"],
      ["i", "bII", "i"],
    ],
    scales: ["MINOR", "PHRYGIAN", "HARMONIC MINOR", "LOCRIAN"]
  },
  "Pop / Ballad": {
    formula: "1 - 2 - 3 - 4 - 5 - 6 - 7 (Major)",
    progressions: [
      ["I", "V", "vi", "IV"],
      ["I", "IV", "V", "IV"],
      ["vi", "IV", "I", "V"],
    ],
    scales: ["MAJOR", "MAJOR PENTATONIC", "LYDIAN"]
  },
  "Spanish / Flamenco": {
    formula: "1 - b2 - 3 - 4 - 5 - b6 - b7 (Phrygian Dominant)",
    progressions: [
      ["i", "bII", "III", "iv", "v", "bVI", "bVII"],
      ["i", "bII", "i"],
      ["iv", "III", "bII", "i"],
    ],
    scales: ["SPANISH GYPSY", "FLAMENCO", "PHRYGIAN DOMINANT"]
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
    "I7": { degree: 0, type: "Dominant 7th" },
    "IV7": { degree: 3, type: "Dominant 7th" },
    "i7": { degree: 0, type: "Minor 7th" },
    "iv7": { degree: 3, type: "Minor 7th" },
    "v7": { degree: 4, type: "Minor 7th" },
    "ii7b5": { degree: 1, type: "Half-Diminished 7" },
    "V7alt": { degree: 4, type: "Augmented 7th" },
    "imaj7": { degree: 0, type: "Minor Major 7th" },
    "bVII": { degree: 6, type: "Major" },
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

/**
 * Returns a musical interval name for a given semitone offset from root.
 */
export const getIntervalName = (semitones: number): string => {
  const norm = semitones % 12;
  const names: Record<number, string> = {
    0: '1',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: 'b6',
    9: '6',
    10: 'b7',
    11: '7'
  };

  // Special handling for extensions if needed (e.g., 9, 11, 13)
  if (semitones === 14) return '9';
  if (semitones === 17) return '11';
  if (semitones === 21) return '13';

  return names[norm] || '1';
};

export const getScaleFormula = (intervals: number[]): string => {
  return intervals.map(i => getIntervalName(i)).join(' - ');
};

/**
 * Returns a list of voicing names sorted by average fret position (lowest first).
 * This ensures that open chords (frets 0-3) appear before barre chords (fret 3+).
 */
export const getSortedVoicings = (
  root: string,
  chordName: keyof typeof CHORDS,
  tuning: string[] = GUITAR_TUNINGS["Standard"],
  mode: 'chord' | 'triads' | 'caged' = 'chord'
): string[] => {
  const chordMap = CHORD_VOICINGS[chordName];
  if (!chordMap) return [];

  const voicingNames = Object.keys(chordMap).filter(k => {
    if (mode === 'triads') return k.toLowerCase().includes('triad');
    if (mode === 'caged') return k.toLowerCase().includes('shape');
    return true;
  });

  return voicingNames.sort((a, b) => {
    // If in standard chord mode, push triads to the end
    if (mode === 'chord') {
      const isTriadA = a.toLowerCase().includes('triad');
      const isTriadB = b.toLowerCase().includes('triad');
      if (isTriadA && !isTriadB) return 1;
      if (!isTriadA && isTriadB) return -1;
    }

    // We need to calculate what the actual frets would be for this root
    // But getVoicingNotes does exactly that!
    const notesA = getVoicingNotes(root, chordName, a, tuning);
    const notesB = getVoicingNotes(root, chordName, b, tuning);

    if (notesA.length === 0) return 1;
    if (notesB.length === 0) return -1;

    // Use minimum fret to determine position
    const minFretA = Math.min(...notesA.map(n => n.fret));
    const minFretB = Math.min(...notesB.map(n => n.fret));

    if (minFretA !== minFretB) {
      return minFretA - minFretB;
    }

    // Tie-breaker: Average fret (lower average prefers "easier" or more compact shapes)
    const avgA = notesA.reduce((sum, n) => sum + n.fret, 0) / notesA.length;
    const avgB = notesB.reduce((sum, n) => sum + n.fret, 0) / notesB.length;

    return avgA - avgB;
  });
};