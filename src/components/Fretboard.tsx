import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, ALL_NOTES, GUITAR_TUNINGS, SCALES } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from 'next-themes';

const NUM_FRETS = 24;
const STRING_HEIGHT_PX = 40;
const FRET_NUMBER_HEIGHT_PX = 30;
const STRING_LABEL_WIDTH_PX = 40;

const FRET_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_DOT_FRETS_DOUBLE = [12, 24];

const Fretboard: React.FC = () => {
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");
  const [selectedTuningName, setSelectedTuningName] = useState<string>("Standard");
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);
  const [fretWidth, setFretWidth] = useState(50);
  const fretboardContainerRef = useRef<HTMLDivElement>(null);
  
  const synth = useRef<Tone.PluckSynth | null>(null);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Initialize the synth on component mount
    synth.current = new Tone.PluckSynth().toDestination();
    
    // Clean up the synth on component unmount
    return () => {
      synth.current?.dispose();
    };
  }, []);

  const currentTuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS];

  useLayoutEffect(() => {
    const container = fretboardContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const containerWidth = entries[0].contentRect.width;
        setFretWidth(containerWidth / NUM_FRETS);
      }
    });

    resizeObserver.observe(container);
    const containerWidth = container.getBoundingClientRect().width;
    if (containerWidth > 0) {
        setFretWidth(containerWidth / NUM_FRETS);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const scaleNotes = useMemo(() => {
    const intervals = SCALES[selectedScaleName];
    return getScaleNotes(selectedRoot, intervals);
  }, [selectedRoot, selectedScaleName]);

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

    currentTuning.forEach((openStringNote, stringIndex) => {
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const noteWithOctave = getNoteAtFret(openStringNote, fret);
        const noteName = noteWithOctave.match(/[A-G]#?/)?.[0] || '';
        
        const sequenceIndex = scaleNotes.indexOf(noteName);
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
  }, [currentTuning, scaleNotes, selectedRoot]);

  const handleNoteClick = async (noteWithOctave: string) => {
    // Browsers require a user gesture to start the audio context.
    // We check the context state and start it if it's not running.
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    // Trigger the synth to play the note.
    synth.current?.triggerAttackRelease(noteWithOctave, "8n");
  };

  const markerSize = Math.min(fretWidth * 0.8, STRING_HEIGHT_PX * 0.7);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Fret Maestro</h2>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 justify-center items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="root-select" className="text-gray-700 dark:text-gray-300">Root Note:</Label>
          <Select value={selectedRoot} onValueChange={setSelectedRoot}>
            <SelectTrigger id="root-select" className="w-[120px]">
              <SelectValue placeholder="Select Root" />
            </SelectTrigger>
            <SelectContent>
              {ALL_NOTES.map((note) => (
                <SelectItem key={note} value={note}>{note}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="scale-select" className="text-gray-700 dark:text-gray-300">Scale/Mode:</Label>
          <Select
            value={selectedScaleName}
            onValueChange={(value) => setSelectedScaleName(value as keyof typeof SCALES)}
          >
            <SelectTrigger id="scale-select" className="w-[180px]">
              <SelectValue placeholder="Select Scale/Mode" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SCALES).map((scale) => (
                <SelectItem key={scale} value={scale}>{scale}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {Object.keys(GUITAR_TUNINGS).map((tuning) => (
                <SelectItem key={tuning} value={tuning}>{tuning}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
        <div className="flex items-center space-x-2">
          <Switch id="show-all-notes" checked={showAllNotes} onCheckedChange={setShowAllNotes} />
          <Label htmlFor="show-all-notes" className="text-gray-700 dark:text-gray-300">Show All Notes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-note-names" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
          <Label htmlFor="show-note-names" className="text-gray-700 dark:text-gray-300">Show Note Names</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          <Label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">Dark Mode</Label>
        </div>
      </div>

      <div className="flex flex-col items-start w-full">
        <div className="flex w-full" style={{ paddingLeft: STRING_LABEL_WIDTH_PX }}>
          {Array.from({ length: NUM_FRETS }).map((_, i) => {
            const fretNumber = i + 1;
            return (
              <div
                key={`fret-num-${fretNumber}`}
                className="flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                style={{ width: `${fretWidth}px`, height: `${FRET_NUMBER_HEIGHT_PX}px` }}
              >
                {fretNumber}
              </div>
            );
          })}
        </div>

        <div className="flex w-full">
          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {currentTuning.map((note, i) => (
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
            className="relative border-l-8 border-stone-700 dark:border-stone-300 flex-grow bg-amber-200 dark:bg-stone-900 rounded-r-md transition-colors duration-300"
            style={{ height: `${currentTuning.length * STRING_HEIGHT_PX}px` }}
          >
            {Array.from({ length: NUM_FRETS }).map((_, i) => (
              <div
                key={`fret-line-${i + 1}`}
                className="absolute top-0 h-full w-[1.5px] bg-stone-400 dark:bg-stone-600"
                style={{ left: `${(i + 1) * fretWidth}px` }}
              />
            ))}

            {FRET_DOT_FRETS_SINGLE.map((fret) => (
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
            {FRET_DOT_FRETS_DOUBLE.map((fret) => (
              <React.Fragment key={`dot-double-${fret}`}>
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretWidth - fretWidth / 2}px`,
                    top: `calc(50% - ${STRING_HEIGHT_PX * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <div
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * fretWidth - fretWidth / 2}px`,
                    top: `calc(50% + ${STRING_HEIGHT_PX * 1.5}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </React.Fragment>
            ))}

            {fretboardNotes.map((note, index) => {
              const shouldRender = showAllNotes || note.isScaleNote;
              if (!shouldRender || note.fretNumber === 0) {
                return null;
              }

              const leftPos = note.fretNumber * fretWidth - fretWidth / 2;
              const topPos = note.stringIndex * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2;
              const markerContent = showNoteNames ? note.noteName : (note.isScaleNote ? note.sequenceNumber! : note.noteName);

              return (
                <div
                  key={`note-${index}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPos}px`, top: `${topPos}px`, zIndex: 10 }}
                >
                  <NoteMarker
                    content={markerContent}
                    isRoot={note.isRoot}
                    isHighlighted={note.isScaleNote}
                    size={markerSize}
                    onClick={() => handleNoteClick(note.noteWithOctave)}
                  />
                </div>
              );
            })}

            {currentTuning.map((_, i) => (
              <div
                key={`string-line-${i}`}
                className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-gray-600 to-gray-400 dark:from-slate-500 dark:to-slate-300"
                style={{ top: `${i * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2}px`, transform: 'translateY(-50%)' }}
              />
            ))}
          </div>
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

export default Fretboard;