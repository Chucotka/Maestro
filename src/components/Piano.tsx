import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getScaleNotes, getChordNotes, getIntervalName, ALL_NOTES, SCALES, CHORDS } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from '@/lib/i18n';
import { DetectedNote } from '@/hooks/useAudioInput';

interface PianoProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  selectedChordName?: keyof typeof CHORDS;
  mode: 'scale' | 'chord';
  sampler: Tone.Sampler | null;
  onModeChange?: (mode: 'scale' | 'chord') => void;
  detectedNote?: DetectedNote | null;
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
  onModeChange,
  detectedNote
}) => {
  const { t } = useI18n();
  const [showNoteNames, setShowNoteNames] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [keyDimensions, setKeyDimensions] = useState({ whiteKeyWidth: 20, blackKeyWidth: 12 });
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  const activeNotesList = useMemo(() => {
    if (mode === 'virtual') return [];
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
                  const isHeard = detectedNote ? (detectedNote.name === key.note && detectedNote.octave === key.octave) : false;

                  let degreeLabel = '';
                  let noteLabel = '';
                  if (isHighlighted) {
                    noteLabel = key.note;
                    const intervals = mode === 'chord' && selectedChordName ? CHORDS[selectedChordName] : SCALES[selectedScaleName];
                    const rootIndex = ALL_NOTES.indexOf(selectedRoot);
                    const matchingInterval = intervals.find(i => (rootIndex + i) % 12 === ALL_NOTES.indexOf(key.note));
                    const semitones = matchingInterval !== undefined ? matchingInterval : (ALL_NOTES.indexOf(key.note) - rootIndex + 12) % 12;
                    degreeLabel = getIntervalName(semitones);
                  }

                  return (
                    <button
                      key={key.noteWithOctave}
                      onClick={() => handleNoteClick(key.noteWithOctave)}
                      className={cn(
                        'flex-shrink-0 flex flex-col items-center justify-end gap-0.5 p-0.5 pb-1.5 border-slate-400 border-l border-b rounded-b-sm transition-all duration-100',
                        activeNotes.has(key.noteWithOctave) && 'scale-y-[0.98] z-20',
                        isHeard && !activeNotes.has(key.noteWithOctave) && 'ring-2 ring-yellow-400 z-10 shadow-[0_0_10px_rgba(250,204,21,0.5)]',
                      )}
                      style={{
                        width: `${keyDimensions.whiteKeyWidth}px`,
                        backgroundColor: activeNotes.has(key.noteWithOctave)
                          ? '#b06a3b'
                          : isHighlighted
                            ? (isRoot ? '#c8845a' : '#d4b896')
                            : '#e5d5c0'
                      }}
                    >
                      {isHighlighted && (
                        <>
                          <span className={cn(
                            'font-black select-none leading-none',
                            isRoot ? 'text-white' : 'text-stone-700',
                            keyDimensions.whiteKeyWidth < 22 ? 'text-[9px]' : 'text-xs'
                          )}>
                            {showDegrees ? degreeLabel : ''}
                          </span>
                          <span className={cn(
                            'font-bold select-none leading-none',
                            isRoot ? 'text-white/90' : 'text-stone-600',
                            keyDimensions.whiteKeyWidth < 22 ? 'text-[8px]' : 'text-[10px]'
                          )}>
                            {noteLabel}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {blackKeys.map(key => {
                const isHighlighted = activeNotesList.includes(key.note);
                const isRoot = isHighlighted && key.note === selectedRoot;
                const isHeard = detectedNote ? (detectedNote.name === key.note && detectedNote.octave === key.octave) : false;

                const precedingWhiteNote = key.note === 'C#' ? 'C' :
                                           key.note === 'D#' ? 'D' :
                                           key.note === 'F#' ? 'F' :
                                           key.note === 'G#' ? 'G' :
                                           key.note === 'A#' ? 'A' : '';

                const precedingWhiteKeyIndex = whiteKeys.findIndex(wk => wk.note === precedingWhiteNote && wk.octave === key.octave);

                let degreeLabel = '';
                let noteLabel = '';
                if (isHighlighted) {
                  noteLabel = key.note;
                  const intervals = mode === 'chord' && selectedChordName ? CHORDS[selectedChordName] : SCALES[selectedScaleName];
                  const rootIndex = ALL_NOTES.indexOf(selectedRoot);
                  const matchingInterval = intervals.find(i => (rootIndex + i) % 12 === ALL_NOTES.indexOf(key.note));
                  const semitones = matchingInterval !== undefined ? matchingInterval : (ALL_NOTES.indexOf(key.note) - rootIndex + 12) % 12;
                  degreeLabel = getIntervalName(semitones);
                }

                return (
                  <button
                    key={key.noteWithOctave}
                    onClick={() => handleNoteClick(key.noteWithOctave)}
                    className={cn(
                      'absolute flex flex-col items-center justify-end gap-0.5 pb-1 border-stone-800 rounded-b-sm transition-all duration-100 z-10 border pointer-events-auto',
                      activeNotes.has(key.noteWithOctave) && 'scale-y-[0.95] z-30',
                      isHeard && !activeNotes.has(key.noteWithOctave) && 'ring-2 ring-yellow-400 z-20 shadow-[0_0_10px_rgba(250,204,21,0.5)]',
                    )}
                    style={{
                      width: `${keyDimensions.blackKeyWidth}px`,
                      height: '60%',
                      left: `${(precedingWhiteKeyIndex + 1) * keyDimensions.whiteKeyWidth - (keyDimensions.blackKeyWidth / 2)}px`,
                      top: 0,
                      backgroundColor: activeNotes.has(key.noteWithOctave)
                        ? '#b06a3b'
                        : isHighlighted
                          ? (isRoot ? '#8b4513' : '#3d3d3d')
                          : '#1c1917'
                    }}
                  >
                    {isHighlighted && (
                      <>
                        <span className={cn(
                          'font-black select-none leading-none',
                          isRoot ? 'text-orange-300' : 'text-gray-300',
                          keyDimensions.blackKeyWidth < 16 ? 'text-[8px]' : 'text-[10px]'
                        )}>
                          {showDegrees ? degreeLabel : ''}
                        </span>
                        <span className={cn(
                          'font-bold select-none leading-none',
                          isRoot ? 'text-orange-200/80' : 'text-gray-400',
                          keyDimensions.blackKeyWidth < 16 ? 'text-[7px]' : 'text-[9px]'
                        )}>
                          {noteLabel}
                        </span>
                      </>
                    )}
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