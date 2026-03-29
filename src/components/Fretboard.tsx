import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, getChordNotes, getCAGEDNotes, getVoicingNotes, getSortedVoicingNames, getIntervalName, ALL_NOTES, GUITAR_TUNINGS, SCALES, CHORDS, CAGED_SHAPES, CHORD_VOICINGS } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from '@/lib/i18n';
import { DetectedNote } from '@/hooks/useAudioInput';

const DEFAULT_NUM_FRETS = 24;
const UKULELE_NUM_FRETS = 15;

const DEFAULT_STRING_HEIGHT_PX = 45;
const LANDSCAPE_STRING_HEIGHT_PX = 32;
const FRET_NUMBER_HEIGHT_PX = 40;
const STRING_LABEL_WIDTH_PX = 30;

const GUITAR_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const GUITAR_DOT_FRETS_DOUBLE = [12, 24];

const UKULELE_DOT_FRETS_SINGLE = [5, 7, 10, 15];
const UKULELE_DOT_FRETS_DOUBLE = [12];

interface FretboardProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  selectedChordName?: keyof typeof CHORDS;
  currentVoicingIndex?: number;
  selectedCagedShape?: keyof typeof CAGED_SHAPES;
  selectedTuningName: string;
  onTuningChange: (tuning: string) => void;
  mode: string;
  sampler: Tone.Sampler | null;
  instrumentType: 'guitar' | 'clean' | 'distortion' | 'bass' | 'ukulele';
  onModeChange?: (mode: string) => void;
  onNoteClick?: (noteName: string, noteWithOctave: string) => void;
  detectedNote?: DetectedNote | null;
  activeArpeggioNote?: { string?: number, fret?: number, noteName?: string } | null;
}

const Fretboard: React.FC<FretboardProps> = ({
  selectedRoot,
  selectedScaleName,
  selectedChordName,
  currentVoicingIndex = 0,
  selectedCagedShape,
  selectedTuningName,
  onTuningChange,
  mode,
  sampler,
  instrumentType,
  onModeChange,
  detectedNote,
  activeArpeggioNote
}) => {
  const { t } = useI18n();
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const fretboardContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateOrientation = () => {
      // Consider landscape if width > height and it's a mobile-ish screen size
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1100);
    };
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  const numFrets = instrumentType === 'ukulele' ? UKULELE_NUM_FRETS : DEFAULT_NUM_FRETS;
  const dotsSingle = instrumentType === 'ukulele' ? UKULELE_DOT_FRETS_SINGLE : GUITAR_DOT_FRETS_SINGLE;
  const dotsDouble = instrumentType === 'ukulele' ? UKULELE_DOT_FRETS_DOUBLE : GUITAR_DOT_FRETS_DOUBLE;

  // Responsive fixed widths to prevent feedback loops and ensure visibility
  const fretWidth = isLandscape ? 65 : 52;
  const stringHeight = isLandscape ? LANDSCAPE_STRING_HEIGHT_PX : DEFAULT_STRING_HEIGHT_PX;
  const markerSize = Math.min(fretWidth * 0.8, stringHeight * 0.85);

  const currentTuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS];
  const displayTuning = useMemo(() => [...currentTuning].reverse(), [currentTuning]);

  const activeNotesList = useMemo(() => {
    if (mode === 'virtual' || mode === 'quiz') return [];
    if (mode === 'caged') {
      return getChordNotes(selectedRoot, CHORDS['Major']);
    }
    if ((mode === 'chord' || mode === 'triads') && selectedChordName) {
      return getChordNotes(selectedRoot, CHORDS[selectedChordName]);
    }
    return getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
  }, [selectedRoot, selectedScaleName, selectedChordName, mode]);

  const voicingNotes = useMemo(() => {
    if ((mode !== 'chord' && mode !== 'triads') || !selectedChordName) return [];

    const chordMap = CHORD_VOICINGS[selectedChordName];
    if (!chordMap) return [];

    const voicingNames = getSortedVoicingNames(selectedRoot, selectedChordName, currentTuning, mode);

    if (voicingNames.length === 0) return [];

    const voicingName = voicingNames[currentVoicingIndex % voicingNames.length];
    return getVoicingNotes(selectedRoot, selectedChordName, voicingName, currentTuning);
  }, [mode, selectedRoot, selectedChordName, currentVoicingIndex, currentTuning]);

  const cagedFretNotes = useMemo(() => {
    if (mode !== 'caged' || !selectedCagedShape) return [];
    return getCAGEDNotes(selectedRoot, selectedCagedShape, currentTuning);
  }, [mode, selectedRoot, selectedCagedShape, currentTuning]);

  useLayoutEffect(() => {
    const isCurrentlyBassTuning = selectedTuningName.startsWith("Bass");
    const isCurrentlyUkuleleTuning = selectedTuningName.startsWith("Ukulele");

    if (instrumentType === 'bass' && !isCurrentlyBassTuning) {
      onTuningChange("Bass (Standard)");
    } else if (instrumentType === 'ukulele' && !isCurrentlyUkuleleTuning) {
      onTuningChange("Ukulele (Std)");
    } else if (instrumentType !== 'bass' && instrumentType !== 'ukulele' && (isCurrentlyBassTuning || isCurrentlyUkuleleTuning)) {
      onTuningChange("Standard");
    }
  }, [instrumentType, selectedTuningName, onTuningChange]);


  const fretboardNotes = useMemo(() => {
    const notes: {
      stringIndex: number;
      fretNumber: number;
      noteName: string;
      noteWithOctave: string;
      isScaleNote: boolean;
      sequenceNumber: number | null;
      isRoot: boolean;
      isHeard: boolean;
    }[] = [];

    displayTuning.forEach((openStringNote, stringIndex) => {
      const stringNum = displayTuning.length - stringIndex;

      for (let fret = 0; fret <= numFrets; fret++) {
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
        } else if ((mode === 'chord' || mode === 'triads') && !showAllNotes && voicingNotes.length > 0) {
          const vNote = voicingNotes.find(vn => vn.string === stringNum && vn.fret === fret);
          if (vNote) {
            isScaleNote = true;
            sequenceNumber = vNote.interval;
          }
        } else {
          isScaleNote = activeNotesList.includes(noteName);
          if (isScaleNote) {
            const intervals = (mode === 'chord' || mode === 'triads') && selectedChordName ? CHORDS[selectedChordName] : SCALES[selectedScaleName];
            const rootIndex = ALL_NOTES.indexOf(selectedRoot);

            // Try to find the original interval to preserve extensions like 9, 11, 13
            const matchingInterval = intervals.find(i => {
              const nIdx = (rootIndex + i) % 12;
              return ALL_NOTES[nIdx] === noteName;
            });

            const semitones = matchingInterval !== undefined
              ? matchingInterval
              : (ALL_NOTES.indexOf(noteName) - rootIndex + 12) % 12;

            sequenceNumber = getIntervalName(semitones);
          }
        }

        const isRoot = isScaleNote && noteName === selectedRoot;
        const isHeard = detectedNote ? detectedNote.name === noteName : false;

        // Arpeggio highlight logic
        let isArpeggioActive = false;
        if (activeArpeggioNote) {
          if (activeArpeggioNote.string !== undefined && activeArpeggioNote.fret !== undefined) {
            isArpeggioActive = activeArpeggioNote.string === stringNum && activeArpeggioNote.fret === fret;
          } else if (activeArpeggioNote.noteName) {
            isArpeggioActive = activeArpeggioNote.noteName === noteName && isScaleNote;
          }
        }

        notes.push({
          stringIndex,
          fretNumber: fret,
          noteName,
          noteWithOctave,
          isScaleNote,
          sequenceNumber: sequenceNumber as number | string | null,
          isRoot,
          isHeard,
      isArpeggioActive
        });
      }
    });
    return notes;
  }, [displayTuning, activeNotesList, selectedRoot, mode, cagedFretNotes, voicingNotes, selectedChordName, selectedScaleName, numFrets, detectedNote, showAllNotes, showNoteNames]);

  const handleNoteClick = (noteName: string, noteWithOctave: string) => {
    if (sampler && Tone.context.state === 'running') {
      sampler.triggerAttackRelease(noteWithOctave, "2n");
    }
    if (onNoteClick) {
      onNoteClick(noteName, noteWithOctave);
    }
  };

  return (
    <div className="p-1 md:p-2 bg-[#1a1a1a] w-full transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-4 mb-2 px-2">
        {(mode === 'chord' || mode === 'triads' || mode === 'caged') && (
          <div className="text-xs font-bold text-[#b06a3b] bg-[#b06a3b]/10 px-2 py-1 rounded">
            {(() => {
              const voicingNames = getSortedVoicingNames(selectedRoot, selectedChordName!, currentTuning, mode);
              return voicingNames[currentVoicingIndex % voicingNames.length] || "N/A";
            })()}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch id="show-notes" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
          <Label htmlFor="show-notes" className="text-xs text-gray-300 uppercase font-bold">{t('notes')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-all" checked={showAllNotes} onCheckedChange={setShowAllNotes} />
          <Label htmlFor="show-all" className="text-xs text-gray-300 uppercase font-bold">{t('allNotes')}</Label>
        </div>
        <div className="text-[10px] text-[#b06a3b] font-mono ml-auto">
          {mode.toUpperCase()} MODE
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap border-none">
        <div className="p-4" style={{ width: `${numFrets * fretWidth + 3 * STRING_LABEL_WIDTH_PX + 40}px` }}>
        <div className="flex">
          {/* Spacer for first label column */}
          <div className="flex-shrink-0" style={{ width: `${STRING_LABEL_WIDTH_PX}px`, height: isLandscape ? '24px' : `${FRET_NUMBER_HEIGHT_PX}px` }} />
          {/* Fret 0 (Open) number */}
          <div
            className="flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-400"
            style={{ width: `${STRING_LABEL_WIDTH_PX}px`, height: isLandscape ? '24px' : `${FRET_NUMBER_HEIGHT_PX}px` }}
          >
            0
          </div>
          {/* Fret numbers 1-N */}
          {Array.from({ length: numFrets }).map((_, i) => {
            const fretNumber = i + 1;
            return (
              <div
                key={`fret-num-${fretNumber}`}
                className="flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-400"
                style={{ width: `${fretWidth}px`, height: isLandscape ? '24px' : `${FRET_NUMBER_HEIGHT_PX}px` }}
              >
                {fretNumber}
              </div>
            );
          })}
        </div>

        <div className="flex w-full">
          {/* String labels column 1 (Fixed names) */}
          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => (
              <div
                key={`string-label-outer-left-${i}`}
                className="flex items-center justify-center text-xs font-bold text-gray-500"
                style={{ height: `${stringHeight}px` }}
              >
                {note.match(/[A-G]#?/)?.[0] || ''}
              </div>
            ))}
          </div>

          {/* String labels column 2 / Open Notes area */}
          <div className="relative flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => {
              const openNote = fretboardNotes.find(fn => fn.stringIndex === i && fn.fretNumber === 0);
              const shouldRender = openNote && (showAllNotes || openNote.isScaleNote);
              const markerContent = openNote ? (showNoteNames ? openNote.noteName : (openNote.isScaleNote ? openNote.sequenceNumber! : openNote.noteName)) : '';

              return (
                <div
                  key={`string-label-left-${i}`}
                  className="relative flex items-center justify-center text-xs font-bold text-gray-400"
                  style={{ height: `${stringHeight}px` }}
                >
              {(shouldRender || openNote?.isHeard || openNote?.isArpeggioActive) && (
                <div className={cn(
                  "z-30 transition-all duration-200",
                  (openNote?.isHeard || openNote?.isArpeggioActive) && !shouldRender && "scale-110"
                )}>
                      <NoteMarker
                        content={markerContent}
                        isRoot={openNote!.isRoot}
                    isHighlighted={openNote!.isScaleNote || openNote!.isHeard || openNote!.isArpeggioActive}
                        size={markerSize * 0.85}
                    className={cn(
                      openNote!.isHeard && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_15px_rgba(250,204,21,0.6)]",
                      openNote!.isArpeggioActive && "ring-4 ring-orange-500 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-125 z-40"
                    )}
                        onClick={() => handleNoteClick(openNote!.noteName, openNote!.noteWithOctave)}
                      />
                    </div>
                  )}
                  {!shouldRender && !openNote?.isHeard && (
                    <span className="opacity-30">{note.match(/[A-G]#?/)?.[0] || ''}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            ref={fretboardContainerRef}
            className="relative bg-[#3d1c13] transition-colors duration-300 border-y border-stone-900 overflow-hidden"
            style={{ 
              width: `${numFrets * fretWidth}px`,
              height: `${displayTuning.length * stringHeight}px`,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: `100% ${stringHeight}px, ${fretWidth}px 100%`
            }}
          >
            {/* Wood Grain simulation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 20% 50%, #5c2a1c 0px, #3d1c13 100px)' }}></div>
            {/* Nut */}
            <div className="absolute left-0 top-0 h-full w-2 bg-stone-900 z-20" />

            {Array.from({ length: numFrets }).map((_, i) => (
              <div
                key={`fret-line-${i + 1}`}
                className="absolute top-0 h-full w-[2px] bg-stone-900/80"
                style={{ left: `${(i + 1) * fretWidth}px` }}
              />
            ))}

            {dotsSingle.map((fret) => (
              <div
                key={`dot-single-${fret}`}
                className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                style={{
                  left: `${fret * fretWidth - fretWidth / 2}px`,
                  top: `50%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
            {dotsDouble.map((fret) => (
              <React.Fragment key={`dot-double-${fret}`}>
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretWidth - fretWidth / 2}px`,
                    top: `calc(50% - ${stringHeight * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretWidth - fretWidth / 2}px`,
                    top: `calc(50% + ${stringHeight * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </React.Fragment>
            ))}

            {/* Open notes are now rendered in the label column 2 */}

            {fretboardNotes
              .filter((note) => note.fretNumber > 0)
              .map((note, index) => {
                const shouldRender = showAllNotes || note.isScaleNote || note.isHeard || note.isArpeggioActive;
                if (!shouldRender) return null;

                const leftPos = note.fretNumber * fretWidth - fretWidth / 2;
                const topPos = note.stringIndex * stringHeight + stringHeight / 2;
                const markerContent = showNoteNames ? note.noteName : (note.isScaleNote ? note.sequenceNumber! : note.noteName);

                return (
                  <div
                    key={`note-fretted-${index}`}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200",
                      (note.isHeard || note.isArpeggioActive) && !note.isScaleNote && "scale-110 z-20"
                    )}
                    style={{ left: `${leftPos}px`, top: `${topPos}px` }}
                  >
                    <NoteMarker
                      content={markerContent}
                      isRoot={note.isRoot}
                      isHighlighted={note.isScaleNote || note.isHeard || note.isArpeggioActive}
                      size={markerSize}
                      className={cn(
                        note.isHeard && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_15px_rgba(250,204,21,0.6)]",
                        note.isArpeggioActive && "ring-4 ring-orange-500 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-125 z-40"
                      )}
                      onClick={() => handleNoteClick(note.noteName, note.noteWithOctave)}
                    />
                  </div>
                );
              })}

            {displayTuning.map((_, i) => {
              const isThick = (instrumentType === 'guitar' || instrumentType === 'clean' || instrumentType === 'distortion') && i >= 3;
              return (
                <div
                  key={`string-line-${i}`}
                  className={cn(
                    "absolute left-0 w-full bg-black/60 shadow-sm",
                    isThick ? "h-[2.5px]" : "h-[1.5px]"
                  )}
                  style={{ top: `${i * stringHeight + stringHeight / 2}px`, transform: 'translateY(-50%)' }}
                />
              );
            })}
          </div>

          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {displayTuning.map((note, i) => (
              <div
                key={`string-label-right-${i}`}
                className="flex items-center justify-center text-xs font-bold text-gray-400"
                style={{ height: `${stringHeight}px` }}
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