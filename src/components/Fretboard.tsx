import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, getChordNotes, GUITAR_TUNINGS, SCALES, CHORDS } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NUM_FRETS = 24;
const STRING_HEIGHT_PX = 40;
const FRET_NUMBER_HEIGHT_PX = 30;
const STRING_LABEL_WIDTH_PX = 40;

const FRET_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_DOT_FRETS_DOUBLE = [12, 24];

interface FretboardProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  selectedChordName?: keyof typeof CHORDS;
  mode: 'scale' | 'chord';
  sampler: Tone.Sampler | null;
  instrumentType: 'guitar' | 'clean' | 'distortion' | 'bass';
  onModeChange?: (mode: 'scale' | 'chord') => void;
}

const Fretboard: React.FC<FretboardProps> = ({
  selectedRoot,
  selectedScaleName,
  selectedChordName,
  mode,
  sampler,
  instrumentType,
  onModeChange
}) => {
  const [selectedTuningName, setSelectedTuningName] = useState<string>(
    instrumentType === 'bass' ? "Bass (Standard)" : "Standard"
  );
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [fretDimensions, setFretDimensions] = useState({ fretWidth: 60, markerSize: 28 });
  const fretboardContainerRef = useRef<HTMLDivElement>(null);

  const currentTuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS];
  const displayTuning = useMemo(() => [...currentTuning].reverse(), [currentTuning]);

  const activeNotesList = useMemo(() => {
    if (mode === 'chord' && selectedChordName) {
      return getChordNotes(selectedRoot, CHORDS[selectedChordName]);
    }
    return getScaleNotes(selectedRoot, SCALES[selectedScaleName]);
  }, [selectedRoot, selectedScaleName, selectedChordName, mode]);

  useLayoutEffect(() => {
    setSelectedTuningName(instrumentType === 'bass' ? "Bass (Standard)" : "Standard");
  }, [instrumentType]);

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
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const noteWithOctave = getNoteAtFret(openStringNote, fret);
        const noteName = noteWithOctave.match(/[A-G]#?/)?.[0] || '';
        
        const sequenceIndex = activeNotesList.indexOf(noteName);
        const isScaleNote = sequenceIndex !== -1;
        const isRoot = isScaleNote && noteName === selectedRoot;

        notes.push({
          stringIndex,
          fretNumber: fret,
          noteName,
          noteWithOctave,
          isScaleNote,
          sequenceNumber: isScaleNote ? (sequenceIndex + 1) : null,
          isRoot,
        });
      }
    });
    return notes;
  }, [displayTuning, activeNotesList, selectedRoot]);

  const handleNoteClick = (noteWithOctave: string) => {
    if (sampler && Tone.context.state === 'running') {
      sampler.triggerAttackRelease(noteWithOctave, "2n");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300 overflow-hidden">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6 justify-center items-center">
        <Tabs value={mode} onValueChange={(v) => onModeChange?.(v as 'scale' | 'chord')} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scale">Scales</TabsTrigger>
            <TabsTrigger value="chord">Chords</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Label htmlFor="tuning-select" className="text-gray-700 dark:text-gray-300">Tuning:</Label>
          <Select
            value={selectedTuningName}
            onValueChange={(value) => setSelectedTuningName(value)}
          >
            <SelectTrigger id="tuning-select" className="w-[180px]">
              <SelectValue placeholder="Select Tuning" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(GUITAR_TUNINGS)
                .filter(t => instrumentType === 'bass' ? t.includes("Bass") : !t.includes("Bass"))
                .map((tuning) => (
                <SelectItem key={tuning} value={tuning}>{tuning}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-all-notes" checked={showAllNotes} onCheckedChange={setShowAllNotes} />
          <Label htmlFor="show-all-notes" className="text-gray-700 dark:text-gray-300">Show All Notes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-note-names" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
          <Label htmlFor="show-note-names" className="text-gray-700 dark:text-gray-300">Show Note Names</Label>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="min-w-[1000px] p-4">
        <div className="flex w-full" style={{ paddingLeft: STRING_LABEL_WIDTH_PX }}>
          {Array.from({ length: NUM_FRETS }).map((_, i) => {
            const fretNumber = i + 1;
            return (
              <div
                key={`fret-num-${fretNumber}`}
                className="flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
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
                key={`string-label-${i}`}
                className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                style={{ height: `${STRING_HEIGHT_PX}px` }}
              >
                {note.match(/[A-G]#?/)?.[0] || ''}
              </div>
            ))}
          </div>

          <div
            ref={fretboardContainerRef}
            className="relative border-l-8 border-stone-700 dark:border-stone-300 bg-amber-200 dark:bg-stone-900 rounded-r-md transition-colors duration-300"
            style={{ 
              flex: 1,
              height: `${displayTuning.length * STRING_HEIGHT_PX}px` 
            }}
          >
            {Array.from({ length: NUM_FRETS }).map((_, i) => (
              <div
                key={`fret-line-${i + 1}`}
                className="absolute top-0 h-full w-[1.5px] bg-stone-400 dark:bg-stone-600"
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
                className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-gray-600 to-gray-400 dark:from-slate-500 dark:to-slate-300"
                style={{ top: `${i * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2}px`, transform: 'translateY(-50%)' }}
              />
            ))}
          </div>
        </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Current {mode === 'scale' ? 'Scale' : 'Chord'} Notes:
        </h3>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {activeNotesList.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default Fretboard;