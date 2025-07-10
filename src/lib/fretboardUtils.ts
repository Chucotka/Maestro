export const ALL_NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const GUITAR_TUNINGS = {
  "Standard":       ["E2", "A2", "D3", "G3", "B3", "E4"],
  "Drop D":         ["D2", "A2", "D3", "G3", "B3", "E4"],
  "Drop C#":        ["C#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
  "Drop C":         ["C2", "G2", "C3", "F3", "A3", "D4"],
  "Open G":         ["D2", "G2", "D3", "G3", "B3", "D4"],
  "Open D":         ["D2", "A2", "D3", "F#3", "A3", "D4"],
  "Open C":         ["C2", "G2", "C3", "G3", "C4", "E4"],
  "Open E":         ["E2", "B2", "E3", "G#3", "B3", "E4"],
  "DADGAD":         ["D2", "A2", "D3", "G3", "A3", "D4"],
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