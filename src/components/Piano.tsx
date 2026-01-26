import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getScaleNotes, getChordNotes, SCALES, CHORDS } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from '@/lib/i18n';

interface PianoProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  selectedChordName?: keyof typeof CHORDS;
  mode: 'scale' | 'chord';
  sampler: Tone.Sampler | null;
  onModeChange?: (mode: 'scale' | 'chord') => void;
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

const Piano: React.FC<PianoProps> = ({
  selectedRoot,
  selectedScaleName,
  selectedChordName,
  mode,
  sampler,
  onModeChange
}) => {
  const { t } = useI18n();
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [keyDimensions, setKeyDimensions] = useState({ whiteKeyWidth: 20, blackKeyWidth: 12 });
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  const activeNotesList = useMemo(() => {
    if (mode === 'chord' && selectedChordName) {
      return getChordNotes(selectedRoot, CHORDS[selectedChordName]);
    }
    return getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
  }, [selectedRoot, selectedScaleName, selectedChordName, mode]);

  useLayoutEffect(() => {
    const container = pianoContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const containerWidth = container.offsetWidth;
      if (containerWidth > 0) {
        const whiteKeyWidth = containerWidth / whiteKeys.length;
        setKeyDimensions({ whiteKeyWidth, blackKeyWidth: whiteKeyWidth * 0.6 });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleNoteClick = (noteWithOctave: string) => {
    if (sampler && Tone.context.state === 'running') {
      setActiveNotes(prev => new Set(prev).add(noteWithOctave));
      setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(noteWithOctave);
          return next;
        });
      }, 200);
      sampler.triggerAttackRelease(noteWithOctave, "2n");
    }
  };

  return (
    <div className="p-1 md:p-2 bg-[#1a1a1a] w-full transition-colors duration-300">
      <ScrollArea className="w-full whitespace-nowrap border-none">
        <div className="min-w-[800px] h-48 md:h-64 landscape:h-40 p-2 bg-[#121212]">
        <div ref={pianoContainerRef} className="relative w-full h-full">
          {keyDimensions.whiteKeyWidth > 0 && (
            <div className="relative w-full h-full">
              <div className="flex w-full h-full absolute top-0 left-0">
                {whiteKeys.map(key => {
                  const isHighlighted = activeNotesList.includes(key.note);
                  const isRoot = isHighlighted && key.note === selectedRoot;
                  return (
                    <button
                      key={key.noteWithOctave}
                      onClick={() => handleNoteClick(key.noteWithOctave)}
                      className={cn(
                        'flex-shrink-0 flex items-end justify-center p-1 pb-2 border-slate-400 border-l border-b rounded-b-sm transition-all duration-100 bg-white hover:bg-slate-100',
                        activeNotes.has(key.noteWithOctave) && 'bg-[#b06a3b]/50 scale-y-[0.98] z-20',
                        isHighlighted && !activeNotes.has(key.noteWithOctave) && { 'border-2': true, 'border-[#b06a3b]': isRoot, 'border-[#e5d5c0]': !isRoot, 'bg-[#b06a3b]/20': isRoot, 'bg-[#e5d5c0]/20': !isRoot }
                      )}
                      style={{ width: `${keyDimensions.whiteKeyWidth}px`, backgroundColor: '#e5d5c0' }}
                    >
                      <span className={cn('font-bold select-none text-black', { 'text-xs': keyDimensions.whiteKeyWidth < 28 }, isHighlighted && { 'text-[#b06a3b]': isRoot, 'text-stone-800': !isRoot })}>
                        {showNoteNames ? key.note : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {blackKeys.map(key => {
                const isHighlighted = activeNotesList.includes(key.note);
                const isRoot = isHighlighted && key.note === selectedRoot;

                const precedingWhiteNote = key.note === 'C#' ? 'C' :
                                           key.note === 'D#' ? 'D' :
                                           key.note === 'F#' ? 'F' :
                                           key.note === 'G#' ? 'G' :
                                           key.note === 'A#' ? 'A' : '';

                const precedingWhiteKeyIndex = whiteKeys.findIndex(wk => wk.note === precedingWhiteNote && wk.octave === key.octave);

                return (
                  <button
                    key={key.noteWithOctave}
                    onClick={() => handleNoteClick(key.noteWithOctave)}
                    className={cn(
                      'absolute flex items-start justify-center pt-1 border-stone-800 rounded-b-sm transition-all duration-100 z-10 bg-stone-900 hover:bg-stone-800 border pointer-events-auto',
                      activeNotes.has(key.noteWithOctave) && 'bg-[#b06a3b] scale-y-[0.95] z-30',
                      isHighlighted && !activeNotes.has(key.noteWithOctave) && { 'border-2': true, 'border-[#b06a3b]': isRoot, 'border-[#e5d5c0]': !isRoot, 'bg-[#4a2e1c]': isRoot, 'bg-[#2a2a2a]': !isRoot }
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
              </div>
            </div>
          )}
        </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

    </div>
  );
};

export default Piano;