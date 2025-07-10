export const ALL_NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const GUITAR_TUNINGS = {
  STANDARD: ["E", "A", "D", "G", "B", "E"], // Low E to High E
};

export const SCALES = {
  MAJOR: [0, 2, 4, 5, 7, 9, 11], // Intervals in semitones
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  MIXOLYDIAN: [0, 2, 4, 5, 7, 9, 10],
  PHRYGIAN: [0, 1, 3, 5, 7, 8, 10],
  "MAJOR PENTATONIC": [0, 2, 4, 7, 9],
  "MINOR PENTATONIC": [0, 3, 5, 7, 10],
};

/**
 * Calculates the note name at a specific fret on a given string.
 * @param openStringNote The note of the open string (e.g., "E").
 * @param fretNumber The fret number (0 for open string).
 * @returns The note name (e.g., "G#").
 */
export const getNoteAtFret = (openStringNote: string, fretNumber: number): string => {
  const startIndex = ALL_NOTES.indexOf(openStringNote.toUpperCase());
  if (startIndex === -1) {
    throw new Error(`Invalid open string note: ${openStringNote}`);
  }
  const noteIndex = (startIndex + fretNumber) % ALL_NOTES.length;
  return ALL_NOTES[noteIndex];
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