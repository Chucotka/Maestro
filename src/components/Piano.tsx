import React, { useMemo } from 'react';
import * as Tone from 'tone';
import { getScaleNotes, SCALES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';

interface PianoProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  synth: React.MutableRefObject<Tone.Synth | null>;
}

const PIANO_NOTES = [
  { note: 'C', isBlack: false }, { note: 'C#', isBlack: true },
  { note: 'D', isBlack: false }, { note: 'D#', isBlack: true },
  { note: 'E', isBlack: false },
  { note: 'F', isBlack: false }, { note: 'F#', isBlack: true },
  { note: 'G', isBlack: false }, { note: 'G#', isBlack: true },
  { note: 'A', isBlack: false }, { note: 'A#', isBlack: true },
  { note: 'B', isBlack: false },
];

const START_OCTAVE = 3;
const NUM_OCTAVES = 2;

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
    const keys = [];
    for (let octave = START_OCTAVE; octave < START_OCTAVE + NUM_OCTAVES; octave++) {
      for (const key of PIANO_NOTES) {
        const noteWithOctave = `${key.note}${octave}`;
        const noteName = key.note;
        const isHighlighted = scaleNotes.includes(noteName);
        const isRoot = isHighlighted && noteName === selectedRoot;

        keys.push(
          <button
            key={noteWithOctave}
            onClick={() => handleNoteClick(noteWithOctave)}
            className={cn(
              'relative flex items-end justify-center p-1 border-slate-400 rounded-b-md transition-all duration-100 text-xs sm:text-sm',
              key.isBlack
                ? 'w-[58%] h-32 bg-slate-800 hover:bg-slate-700 z-10 border-2 -mx-[29%]'
                : 'w-full h-48 bg-white hover:bg-slate-100 border',
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
              'font-bold',
              key.isBlack ? 'text-white' : 'text-black',
              isHighlighted && {
                'text-red-600 dark:text-red-400': isRoot,
                'text-sky-600 dark:text-sky-400': !isRoot,
              }
            )}>
              {noteName}
            </span>
          </button>
        );
      }
    }
    return keys;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300">
      <div className="flex justify-center overflow-x-auto py-4">
        <div className="flex h-48">
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