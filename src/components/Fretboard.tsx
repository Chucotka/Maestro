import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, getChordNotes, getCAGEDNotes, getVoicingNotes, getIntervalName, ALL_NOTES, GUITAR_TUNINGS, SCALES, CHORDS, CAGED_SHAPES, CHORD_VOICINGS, getSortedVoicings } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useI18n } from '@/lib/i18n';
import { DetectedNote, NoteHistoryEntry } from '@/hooks/useAudioInput';

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
  onCagedShapeChange?: (shape: any) => void;
  selectedTuningName: string;
  onTuningChange: (tuning: string) => void;
  mode: 'scale' | 'chord' | 'caged' | 'quiz' | 'finder' | 'notes' | 'triads' | 'arpeggios' | 'virtual' | 'tuner';
  sampler: Tone.Sampler | null;
  instrumentType: 'guitar' | 'clean' | 'distortion' | 'bass' | 'ukulele';
  onModeChange?: (mode: 'scale' | 'chord' | 'caged' | 'quiz' | 'finder' | 'notes' | 'triads' | 'arpeggios' | 'virtual' | 'tuner') => void;
  onNoteClick?: (noteName: string, noteWithOctave: string) => void;
  detectedNotes?: DetectedNote[];
  noteHistory?: NoteHistoryEntry[];
  isListening?: boolean;
  activeArpeggioNote?: { string?: number, fret?: number, noteName?: string } | null;
}

const Fretboard: React.FC<FretboardProps> = ({
  selectedRoot,
  selectedScaleName,
  selectedChordName,
  currentVoicingIndex = 0,
  selectedCagedShape,
  onCagedShapeChange,
  selectedTuningName,
  onTuningChange,
  mode,
  sampler,
  instrumentType,
  onModeChange,
  onNoteClick,
  detectedNotes = [],
  noteHistory = [],
  isListening = false,
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
    if ((mode === 'chord' || mode === 'triads' || mode === 'arpeggios') && selectedChordName) {
      return getChordNotes(selectedRoot, CHORDS[selectedChordName]);
    }
    return getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
  }, [selectedRoot, selectedScaleName, selectedChordName, mode]);

  const voicingNotes = useMemo(() => {
    if ((mode !== 'chord' && mode !== 'triads' && mode !== 'arpeggios') || !selectedChordName) return [];

    const chordMap = CHORD_VOICINGS[selectedChordName];
    if (!chordMap) return [];

    const voicingNames = getSortedVoicings(selectedRoot, selectedChordName, currentTuning, mode === 'triads' ? 'triads' : 'chord');

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
    // --- Pre-compute MIDI numbers for open strings ---
    const openMidis = displayTuning.map(noteStr => {
      const nm = noteStr.match(/[A-G]#?/)?.[0] || 'C';
      const oc = parseInt(noteStr.match(/\d+$/)?.[0] || '0', 10);
      return (oc + 1) * 12 + ALL_NOTES.indexOf(nm);
    });

    // --- Map each detected note to ONE specific (string, fret) position ---
    // Strategy:
    // 1. If the note matches an open string exactly (fret 0), use that string
    // 2. Otherwise, prefer the string with the lowest fret number
    // This correctly shows open strings and places fretted notes naturally.
    const findBestString = (midiNote: number, usedStrings: Set<number>): { si: number; fret: number } | null => {
      // First pass: check for open string match (fret 0) — highest priority
      for (let si = openMidis.length - 1; si >= 0; si--) {
        if (usedStrings.has(si)) continue;
        if (midiNote === openMidis[si]) {
          return { si, fret: 0 };
        }
      }

      // Second pass: find the string with the lowest fret (most natural position)
      let bestSi = -1;
      let bestFret = Infinity;
      for (let si = 0; si < openMidis.length; si++) {
        if (usedStrings.has(si)) continue;
        const f = midiNote - openMidis[si];
        if (f <= 0 || f > numFrets) continue; // f=0 handled above
        if (f < bestFret) {
          bestFret = f;
          bestSi = si;
        }
      }

      return bestSi >= 0 ? { si: bestSi, fret: bestFret } : null;
    };

    const heardPositions = new Set<string>();
    if (isListening && detectedNotes.length > 0) {
      const usedStrings = new Set<number>();
      // Sort low to high — assign lowest notes first (they have fewer string options)
      const sorted = [...detectedNotes].sort((a, b) => a.note - b.note);
      for (const dn of sorted) {
        const best = findBestString(dn.note, usedStrings);
        if (best) {
          heardPositions.add(`${best.si}:${best.fret}`);
          usedStrings.add(best.si);
          console.log(`[Note Map] ${dn.name}${dn.octave} (MIDI ${dn.note}) → string ${displayTuning.length - best.si} fret ${best.fret} (openMidi ${openMidis[best.si]})`);
        }
      }
    }

    // --- Map each history note to ONE position ---
    const historyPositionAges = new Map<string, number>();
    if (isListening && noteHistory.length > 0) {
      for (const h of noteHistory) {
        const best = findBestString(h.note, new Set());
        if (best) {
          const key = `${best.si}:${best.fret}`;
          if (!heardPositions.has(key) && (!historyPositionAges.has(key) || h.age < historyPositionAges.get(key)!)) {
            historyPositionAges.set(key, h.age);
          }
        }
      }
    }

    const notes: {
      stringIndex: number;
      fretNumber: number;
      noteName: string;
      noteWithOctave: string;
      isScaleNote: boolean;
      sequenceNumber: number | string | null;
      isRoot: boolean;
      isHeard: boolean;
      isHistoryNote: boolean;
      historyAge: number;
      isArpeggioActive: boolean;
    }[] = [];

    displayTuning.forEach((openStringNote, stringIndex) => {
      const stringNum = stringIndex + 1;

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
        } else if ((mode === 'chord' || mode === 'triads' || mode === 'arpeggios') && !showAllNotes && voicingNotes.length > 0) {
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

        // Position-specific matching: each detected note -> exactly one (string, fret)
        const posKey = `${stringIndex}:${fret}`;
        const isHeard = heardPositions.has(posKey);

        let isHistoryNote = false;
        let historyAge = 1;
        if (historyPositionAges.has(posKey)) {
          isHistoryNote = true;
          historyAge = historyPositionAges.get(posKey)!;
        }

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
          isHistoryNote,
          historyAge,
          isArpeggioActive
        });
      }
    });
    return notes;
  }, [displayTuning, activeNotesList, selectedRoot, mode, cagedFretNotes, voicingNotes, selectedChordName, selectedScaleName, numFrets, detectedNotes, noteHistory, isListening, showAllNotes, showNoteNames, activeArpeggioNote]);

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
        {(mode === 'chord' || mode === 'triads') && (
          <div className="text-xs font-bold text-[#b06a3b] bg-[#b06a3b]/10 px-2 py-1 rounded">
            {(() => {
              const voicingNames = getSortedVoicings(selectedRoot, selectedChordName!, currentTuning, mode === 'triads' ? 'triads' : 'chord');
              return voicingNames[currentVoicingIndex % voicingNames.length] || voicingNames[0];
            })()}
          </div>
        )}
        {mode === 'caged' && (
          <div className="flex gap-1">
            {["Shape C", "Shape A (Barre)", "Shape G", "Shape E (Barre)", "Shape D"].map(shape => (
              <Button
                key={shape}
                variant={selectedCagedShape === shape ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-[10px] h-6 px-2",
                  selectedCagedShape === shape ? "bg-[#b06a3b] text-white" : "text-gray-400 border-stone-800"
                )}
                onClick={() => {
                  if (onCagedShapeChange) {
                    onCagedShapeChange(shape);
                  }
                }}
              >
                {shape.replace("Shape ", "").replace(" (Barre)", "")}
              </Button>
            ))}
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
                // In tuner-only mode: show only heard/history notes
                // In other modes with listening: show both scale/chord notes AND heard overlay
                const isTunerOnly = isListening && mode === 'tuner';
                const shouldRenderScale = openNote && !isTunerOnly && (showAllNotes || openNote.isScaleNote);
                const shouldRenderListening = openNote && isListening && (openNote.isHeard || openNote.isHistoryNote);
                const shouldRender = shouldRenderScale || shouldRenderListening;
                const markerContent = openNote ? (showNoteNames ? openNote.noteName : (openNote.isScaleNote && !isTunerOnly ? openNote.sequenceNumber! : openNote.noteName)) : '';

                return (
                  <div
                    key={`string-label-left-${i}`}
                    className="relative flex items-center justify-center text-xs font-bold text-gray-400"
                    style={{ height: `${stringHeight}px` }}
                  >
                    {(shouldRender || openNote?.isArpeggioActive) && (
                      <div
                        className={cn(
                          "z-30 transition-all duration-200",
                          openNote?.isHeard && "scale-110",
                          openNote?.isHistoryNote && "transition-opacity"
                        )}
                        style={openNote?.isHistoryNote ? { opacity: Math.max(0.15, 1 - openNote.historyAge) } : undefined}
                      >
                        <NoteMarker
                          content={markerContent}
                          isRoot={openNote!.isRoot && !isTunerOnly}
                          isHighlighted={isTunerOnly ? (openNote!.isHeard || openNote!.isHistoryNote) : (openNote!.isScaleNote || openNote!.isHeard)}
                          size={markerSize * 0.85}
                          className={cn(
                            openNote!.isHeard && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(250,204,21,0.7)] scale-110",
                            openNote!.isHistoryNote && !openNote!.isHeard && "border-cyan-400/60 text-cyan-300/80 bg-cyan-900/30",
                            openNote!.isArpeggioActive && "ring-4 ring-orange-500 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-125 z-40"
                          )}
                          onClick={() => handleNoteClick(openNote!.noteName, openNote!.noteWithOctave)}
                        />
                      </div>
                    )}
                    {!shouldRender && !openNote?.isArpeggioActive && (
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
                  // In tuner-only mode: only show heard + history notes
                  // In other modes (even with listening): show scale/chord notes + heard overlay
                  const isTunerOnly = isListening && mode === 'tuner';
                  const shouldRenderNormal = !isTunerOnly && (showAllNotes || note.isScaleNote || note.isHeard || note.isArpeggioActive);
                  const shouldRenderListening = isListening && (note.isHeard || note.isHistoryNote);
                  if (!shouldRenderNormal && !shouldRenderListening) return null;

                  const leftPos = note.fretNumber * fretWidth - fretWidth / 2;
                  const topPos = note.stringIndex * stringHeight + stringHeight / 2;
                  const markerContent = isTunerOnly
                    ? note.noteName
                    : (showNoteNames ? note.noteName : (note.isScaleNote ? note.sequenceNumber! : note.noteName));

                  return (
                    <div
                      key={`note-fretted-${index}`}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all",
                        note.isHeard && "z-30 duration-100",
                        note.isHistoryNote && !note.isHeard && "duration-500",
                        !note.isHeard && !note.isHistoryNote && "duration-200",
                        (note.isHeard || note.isArpeggioActive) && "scale-110 z-20"
                      )}
                      style={{
                        left: `${leftPos}px`,
                        top: `${topPos}px`,
                        ...(note.isHistoryNote && !note.isHeard ? { opacity: Math.max(0.15, 1 - note.historyAge) } : {}),
                      }}
                    >
                      <NoteMarker
                        content={markerContent}
                        isRoot={note.isRoot && !isTunerOnly}
                        isHighlighted={isTunerOnly
                          ? (note.isHeard || note.isHistoryNote)
                          : (note.isScaleNote || note.isHeard || note.isArpeggioActive)}
                        size={note.isHeard ? markerSize * 1.15 : markerSize}
                        className={cn(
                          note.isHeard && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#3d1c13] shadow-[0_0_25px_rgba(250,204,21,0.8)]",
                          note.isHistoryNote && !note.isHeard && "border-cyan-400/60 text-cyan-300/80 bg-cyan-900/30 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
                          !isListening && note.isArpeggioActive && "ring-4 ring-orange-500 ring-offset-2 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-125 z-40"
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