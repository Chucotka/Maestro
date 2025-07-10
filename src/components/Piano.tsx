import React, { useMemo } from 'react';
import * as Tone from 'tone';
import { getScaleNotes, SCALES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';

interface PianoProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  synth: React.MutableRefObject<Tone.Synth | null>;
}

interface PianoKey {
  note: string;
  octave: number;
  noteWithOctave: string;
  isBlack: boolean;
}

const ALL_PIANO_KEYS: PianoKey[] = (() => {
  const keys: PianoKey[] = [];
  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const BLACK_KEYS_IN_OCTAVE = ["C#", "D#", "F#", "G#", "A#"];

  // Start with A0, A#0, B0
  keys.push({ note: 'A', octave: 0, noteWithOctave: 'A0', isBlack: false });
  keys.push({ note: 'A#', octave: 0, noteWithOctave: 'A#0', isBlack: true });
  keys.push({ note: 'B', octave: 0, noteWithOctave: 'B0', isBlack: false });

  // Full octaves 1-7
  for (let octave = 1; octave <= 7; octave++) {
    NOTES.forEach(note => {
      keys.push({
        note,
        octave,
        noteWithOctave: `${note}${octave}`,
        isBlack: BLACK_KEYS_IN_OCTAVE.includes(note),
      });
    });
  }

  // End with C8
  keys.push({ note: 'C', octave: 8, noteWithOctave: 'C8', isBlack: false });
  
  return keys;
})();


const Piano: React.FC<PianoProps> = ({ selectedRoot, selectedScaleName, synth }) => {
  const scaleNotes = useMemo(() => {
    const intervals = SCALES[selectedScaleName];
    return getScaleNotes(selectedRoot, intervals);
  }, [selectedRoot, selectedScaleName]);

  const handleNoteClick = (noteWithOctave: string) => {
    if (synth.current && Tone.context.state === 'running') {
      synth.current.triggerAttackRelease(noteWithOctave, "8n");
    }
  };

  const renderKeys = () => {
    return ALL_PIANO_KEYS.map(key => {
      const noteName = key.note;
      const isHighlighted = scaleNotes.includes(noteName);
      const isRoot = isHighlighted && noteName === selectedRoot;

      return (
        <button
          key={key.noteWithOctave}
          onClick={() => handleNoteClick(key.noteWithOctave)}
          className={cn(
            'relative flex items-end justify-center p-1 border-slate-400 rounded-b-md transition-all duration-100 text-xs',
            key.isBlack
              ? 'w-[1.5rem] h-32 bg-slate-800 hover:bg-slate-700 z-10 border-2 -mx-[0.75rem]'
              : 'w-[2.5rem] h-48 bg-white hover:bg-slate-100 border',
            isHighlighted && {
              'border-4': true,
              'border-red-500 dark:border-red-400': isRoot,
              'border-sky-500 dark:border-sky-400': !isRoot,
              'bg-red-100 dark:bg-red-900/50': isRoot && !key.isBlack,
              'bg-sky-100 dark:bg-sky-900/50': !isRoot && !key.isBlack,
              'bg-red-800': isRoot && key.isBlack,
              'bg-sky-800': !isRoot && key.isBlack,
            }
          )}
        >
          <span className={cn(
            'font-bold select-none',
            key.isBlack ? 'text-white' : 'text-black',
            isHighlighted && {
              'text-red-600 dark:text-red-400': isRoot,
              'text-sky-600 dark:text-sky-400': !isRoot,
            }
          )}>
            {key.note === 'C' ? `${key.note}${key.octave}` : ''}
          </span>
        </button>
      );
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300">
      <div className="flex justify-start overflow-x-auto py-4 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-slate-200 dark:bg-slate-900">
        <div className="flex h-48 px-2">
          {renderKeys()}
        </div>
      </div>
       <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Current Scale Notes:</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {scaleNotes.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default Piano;