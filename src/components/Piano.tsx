import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getScaleNotes, SCALES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

  for (let octave = 2; octave <= 6; octave++) {
    NOTES.forEach(note => {
      keys.push({ note, octave, noteWithOctave: `${note}${octave}`, isBlack: BLACK_KEYS_IN_OCTAVE.includes(note) });
    });
  }
  keys.push({ note: 'C', octave: 7, noteWithOctave: 'C7', isBlack: false });
  return keys;
})();

const whiteKeys = ALL_PIANO_KEYS.filter(k => !k.isBlack);
const blackKeys = ALL_PIANO_KEYS.filter(k => k.isBlack);

const Piano: React.FC<PianoProps> = ({ selectedRoot, selectedScaleName, synth }) => {
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [keyDimensions, setKeyDimensions] = useState({ whiteKeyWidth: 20, blackKeyWidth: 12 });
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  const scaleNotes = useMemo(() => getScaleNotes(selectedRoot, SCALES[selectedScaleName]), [selectedRoot, selectedScaleName]);

  useLayoutEffect(() => {
    const container = pianoContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const containerWidth = entries[0].contentRect.width;
        if (containerWidth > 0) {
          const whiteKeyWidth = containerWidth / whiteKeys.length;
          setKeyDimensions({ whiteKeyWidth, blackKeyWidth: whiteKeyWidth * 0.6 });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleNoteClick = (noteWithOctave: string) => {
    if (synth.current && Tone.context.state === 'running') {
      synth.current.triggerAttackRelease(noteWithOctave, "8n");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 justify-center items-center">
        <div className="flex items-center space-x-2">
          <Switch id="show-note-names-piano" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
          <Label htmlFor="show-note-names-piano" className="text-gray-700 dark:text-gray-300">Show Note Names</Label>
        </div>
      </div>

      <div className="w-full h-40 md:h-56 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-slate-200 dark:bg-slate-900 p-1">
        <div ref={pianoContainerRef} className="relative w-full h-full">
          {keyDimensions.whiteKeyWidth > 0 && (
            <>
              <div className="flex w-full h-full">
                {whiteKeys.map(key => {
                  const isHighlighted = scaleNotes.includes(key.note);
                  const isRoot = isHighlighted && key.note === selectedRoot;
                  return (
                    <button
                      key={key.noteWithOctave}
                      onClick={() => handleNoteClick(key.noteWithOctave)}
                      className={cn(
                        'flex-shrink-0 flex items-end justify-center p-1 pb-2 border-slate-400 border-l border-b rounded-b-sm transition-all duration-100 bg-white hover:bg-slate-100',
                        isHighlighted && { 'border-2': true, 'border-red-500 dark:border-red-400': isRoot, 'border-sky-500 dark:border-sky-400': !isRoot, 'bg-red-100 dark:bg-red-900/50': isRoot, 'bg-sky-100 dark:bg-sky-900/50': !isRoot }
                      )}
                      style={{ width: `${keyDimensions.whiteKeyWidth}px` }}
                    >
                      <span className={cn('font-bold select-none text-black', { 'text-xs': keyDimensions.whiteKeyWidth < 28 }, isHighlighted && { 'text-red-600 dark:text-red-400': isRoot, 'text-sky-600 dark:text-sky-400': !isRoot })}>
                        {showNoteNames ? key.note : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              {blackKeys.map(key => {
                const isHighlighted = scaleNotes.includes(key.note);
                const isRoot = isHighlighted && key.note === selectedRoot;
                const precedingWhiteKeyIndex = whiteKeys.findIndex(wk => wk.octave > key.octave || (wk.octave === key.octave && wk.note > key.note)) -1;

                return (
                  <button
                    key={key.noteWithOctave}
                    onClick={() => handleNoteClick(key.noteWithOctave)}
                    className={cn(
                      'absolute flex items-start justify-center pt-1 border-slate-400 rounded-b-sm transition-all duration-100 z-10 bg-slate-800 hover:bg-slate-700 border-2',
                      isHighlighted && { 'border-4': true, 'border-red-500 dark:border-red-400': isRoot, 'border-sky-500 dark:border-sky-400': !isRoot, 'bg-red-800': isRoot, 'bg-sky-800': !isRoot }
                    )}
                    style={{
                      width: `${keyDimensions.blackKeyWidth}px`,
                      height: '60%',
                      left: `${(precedingWhiteKeyIndex + 1) * keyDimensions.whiteKeyWidth - (keyDimensions.blackKeyWidth / 2)}px`,
                      top: 0,
                    }}
                  >
                    <span className={cn('font-bold select-none text-white', { 'text-xs': keyDimensions.blackKeyWidth < 20 }, isHighlighted && { 'text-red-400': isRoot, 'text-sky-400': !isRoot })}>
                      {showNoteNames ? key.note : ''}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Current Scale Notes:</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300">{scaleNotes.join(", ")}</p>
      </div>
    </div>
  );
};

export default Piano;