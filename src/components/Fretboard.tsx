import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, getChordNotes, getCAGEDNotes, GUITAR_TUNINGS, SCALES, CHORDS, CAGED_SHAPES } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from '@/lib/i18n';

const NUM_FRETS = 24;
const STRING_HEIGHT_PX = 45;
const FRET_NUMBER_HEIGHT_PX = 40;
const STRING_LABEL_WIDTH_PX = 30;

const FRET_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_DOT_FRETS_DOUBLE = [12, 24];

interface FretboardProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  selectedChordName?: keyof typeof CHORDS;
  selectedCagedShape?: keyof typeof CAGED_SHAPES;
  selectedTuningName: string;
  onTuningChange: (tuning: string) => void;
  mode: 'scale' | 'chord' | 'caged';
  sampler: Tone.Sampler | null;
  instrumentType: 'guitar' | 'clean' | 'distortion' | 'bass';
  onModeChange?: (mode: 'scale' | 'chord' | 'caged') => void;
}

const Fretboard: React.FC<FretboardProps> = ({
  selectedRoot,
  selectedScaleName,
  selectedChordName,
  selectedCagedShape,
  selectedTuningName,
  onTuningChange,
  mode,
  sampler,
  instrumentType,
  onModeChange
}) => {
  const { t } = useI18n();
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [fretDimensions, setFretDimensions] = useState({ fretWidth: 60, markerSize: 28 });
  const fretboardContainerRef = useRef<HTMLDivElement>(null);

  const currentTuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS];
  const displayTuning = useMemo(() => [...currentTuning].reverse(), [currentTuning]);

  const activeNotesList = useMemo(() => {
    if (mode === 'caged') {
      return getChordNotes(selectedRoot, CHORDS['Major']);
    }
    if (mode === 'chord' && selectedChordName) {
      return getChordNotes(selectedRoot, CHORDS[selectedChordName]);
    }
    return getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
  }, [selectedRoot, selectedScaleName, selectedChordName, mode]);

  const cagedFretNotes = useMemo(() => {
    if (mode !== 'caged' || !selectedCagedShape) return [];
    return getCAGEDNotes(selectedRoot, selectedCagedShape, currentTuning);
  }, [mode, selectedRoot, selectedCagedShape, currentTuning]);

  useLayoutEffect(() => {
    onTuningChange(instrumentType === 'bass' ? "Bass (Standard)" : "Standard");
  }, [instrumentType, onTuningChange]);

  useLayoutEffect(() => {
    const container = fretboardContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const width = container.offsetWidth;
      if (width > 0) {
        const newFretWidth = width / NUM_FRETS;
        const newMarkerSize = Math.min(newFretWidth * 0.8, STRING_HEIGHT_PX * 0.7);
        setFretDimensions({
          fretWidth: newFretWidth,
          markerSize: newMarkerSize,
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const fretboardNotes = useMemo(() => {
    const notes: {
      stringIndex: number;
      fretNumber: number;
      noteName: string;
      noteWithOctave: string;
      isScaleNote: boolean;
      sequenceNumber: number | null;
      isRoot: boolean;
    }[] = [];

    displayTuning.forEach((openStringNote, stringIndex) => {
      const stringNum = displayTuning.length - stringIndex;

      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const noteWithOctave = getNoteAtFret(openStringNote, fret);
        const noteName = noteWithOctave.match(/[A-G]#?/)?.[0] || '';
        
        let isScaleNote = false;
        let sequenceNumber: number | string | null = null;

        if (mode === 'caged') {
          const cagedNote = cagedFretNotes.find(cn => cn.string === stringNum && cn.fret === fret);
          if (cagedNote) {
            isScaleNote = true;
            sequenceNumber = cagedNote.interval;
          }
        } else {
          const sequenceIndex = activeNotesList.indexOf(noteName);
          isScaleNote = sequenceIndex !== -1;
          sequenceNumber = isScaleNote ? (sequenceIndex + 1) : null;
        }

        const isRoot = isScaleNote && noteName === selectedRoot;

        notes.push({
          stringIndex,
          fretNumber: fret,
          noteName,
          noteWithOctave,
          isScaleNote,
          sequenceNumber: sequenceNumber as any,
          isRoot,
        });
      }
    });
    return notes;
  }, [displayTuning, activeNotesList, selectedRoot, mode, cagedFretNotes]);

  const handleNoteClick = (noteWithOctave: string) => {
    if (sampler && Tone.context.state === 'running') {
      sampler.triggerAttackRelease(noteWithOctave, "2n");
    }
  };

  return (
    <div className="p-1 md:p-2 bg-[#1a1a1a] w-full transition-colors duration-300 overflow-hidden">
      <ScrollArea className="w-full whitespace-nowrap border-none">
        <div className="min-w-[1000px] p-4">
        <div className="flex w-full" style={{ paddingLeft: STRING_LABEL_WIDTH_PX * 2 }}>
          {[0, ...Array.from({ length: NUM_FRETS })].map((_, i) => {
            const fretNumber = i;
            return (
              <div
                key={`fret-num-${fretNumber}`}
                className="flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-400"
                style={{ width: `${fretDimensions.fretWidth}px`, height: `${FRET_NUMBER_HEIGHT_PX}px` }}
              >
                {fretNumber}
              </div>
            );
          })}
        </div>

        <div className="flex w-full">
          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => (
              <div
                key={`string-label-outer-left-${i}`}
                className="flex items-center justify-center text-xs font-bold text-gray-500"
                style={{ height: `${STRING_HEIGHT_PX}px` }}
              >
                {note.match(/[A-G]#?/)?.[0] || ''}
              </div>
            ))}
          </div>

          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => (
              <div
                key={`string-label-left-${i}`}
                className="flex items-center justify-center text-xs font-bold text-gray-400"
                style={{ height: `${STRING_HEIGHT_PX}px` }}
              >
                {note.match(/[A-G]#?/)?.[0] || ''}
              </div>
            ))}
          </div>

          <div
            ref={fretboardContainerRef}
            className="relative bg-[#3d1c13] transition-colors duration-300 border-y border-stone-900 overflow-hidden"
            style={{ 
              flex: 1,
              height: `${displayTuning.length * STRING_HEIGHT_PX}px`,
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '100% 1px, 40px 100%'
            }}
          >
            {/* Wood Grain simulation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 20% 50%, #5c2a1c 0px, #3d1c13 100px)' }}></div>
            {/* Nut */}
            <div className="absolute left-0 top-0 h-full w-2 bg-stone-900 z-20" />

            {Array.from({ length: NUM_FRETS }).map((_, i) => (
              <div
                key={`fret-line-${i + 1}`}
                className="absolute top-0 h-full w-[2px] bg-stone-900/80"
                style={{ left: `${(i + 1) * fretDimensions.fretWidth}px` }}
              />
            ))}

            {FRET_DOT_FRETS_SINGLE.map((fret) => (
              <div
                key={`dot-single-${fret}`}
                className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                style={{
                  left: `${fret * fretDimensions.fretWidth - fretDimensions.fretWidth / 2}px`,
                  top: `50%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
            {FRET_DOT_FRETS_DOUBLE.map((fret) => (
              <React.Fragment key={`dot-double-${fret}`}>
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretDimensions.fretWidth - fretDimensions.fretWidth / 2}px`,
                    top: `calc(50% - ${STRING_HEIGHT_PX * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretDimensions.fretWidth - fretDimensions.fretWidth / 2}px`,
                    top: `calc(50% + ${STRING_HEIGHT_PX * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </React.Fragment>
            ))}

            {fretboardNotes
              .filter((note) => note.fretNumber === 0)
              .map((note, index) => {
                const shouldRender = showAllNotes || note.isScaleNote;
                if (!shouldRender) return null;

                const topPos = note.stringIndex * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2;
                const markerContent = showNoteNames ? note.noteName : (note.isScaleNote ? note.sequenceNumber! : note.noteName);

                return (
                  <div
                    key={`note-open-${index}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `-4px`, top: `${topPos}px`, zIndex: 10 }}
                  >
                    <NoteMarker
                      content={markerContent}
                      isRoot={note.isRoot}
                      isHighlighted={note.isScaleNote}
                      size={fretDimensions.markerSize * 0.85}
                      onClick={() => handleNoteClick(note.noteWithOctave)}
                    />
                  </div>
                );
              })}

            {fretboardNotes
              .filter((note) => note.fretNumber > 0)
              .map((note, index) => {
                const shouldRender = showAllNotes || note.isScaleNote;
                if (!shouldRender) return null;

                const leftPos = note.fretNumber * fretDimensions.fretWidth - fretDimensions.fretWidth / 2;
                const topPos = note.stringIndex * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2;
                const markerContent = showNoteNames ? note.noteName : (note.isScaleNote ? note.sequenceNumber! : note.noteName);

                return (
                  <div
                    key={`note-fretted-${index}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${leftPos}px`, top: `${topPos}px`, zIndex: 10 }}
                  >
                    <NoteMarker
                      content={markerContent}
                      isRoot={note.isRoot}
                      isHighlighted={note.isScaleNote}
                      size={fretDimensions.markerSize}
                      onClick={() => handleNoteClick(note.noteWithOctave)}
                    />
                  </div>
                );
              })}

            {displayTuning.map((_, i) => (
              <div
                key={`string-line-${i}`}
                className="absolute left-0 w-full h-[1.5px] bg-black/60 shadow-sm"
                style={{ top: `${i * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2}px`, transform: 'translateY(-50%)' }}
              />
            ))}
          </div>

          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => (
              <div
                key={`string-label-right-${i}`}
                className="flex items-center justify-center text-xs font-bold text-gray-400"
                style={{ height: `${STRING_HEIGHT_PX}px` }}
              >
                {note.match(/[A-G]#?/)?.[0] || ''}
              </div>
            ))}
          </div>
        </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

    </div>
  );
};

export default Fretboard;