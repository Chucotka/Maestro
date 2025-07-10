import React, { useState, useMemo } from 'react';
import * as Tone from 'tone';
import { getNoteAtFret, getScaleNotes, GUITAR_TUNINGS, SCALES } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const NUM_FRETS = 24;
const STRING_HEIGHT_PX = 40;
const FRET_NUMBER_HEIGHT_PX = 30;
const STRING_LABEL_WIDTH_PX = 40;
const FRET_WIDTH_PX = 60;

const FRET_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_DOT_FRETS_DOUBLE = [12, 24];

interface FretboardProps {
  selectedRoot: string;
  selectedScaleName: keyof typeof SCALES;
  synth: React.MutableRefObject<Tone.Synth | null>;
}

const Fretboard: React.FC<FretboardProps> = ({ selectedRoot, selectedScaleName, synth }) => {
  const [selectedTuningName, setSelectedTuningName] = useState<string>("Standard");
  const [showAllNotes, setShowAllNotes] = useState<boolean>(false);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(false);

  const currentTuning = GUITAR_TUNINGS[selectedTuningName as keyof typeof GUITAR_TUNINGS];
  const displayTuning = useMemo(() => [...currentTuning].reverse(), [currentTuning]);

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

    displayTuning.forEach((openStringNote, stringIndex) => {
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
  }, [displayTuning, scaleNotes, selectedRoot]);

  const handleNoteClick = (noteWithOctave: string) => {
    if (synth.current && Tone.context.state === 'running') {
      synth.current.triggerAttackRelease(noteWithOctave, "8n");
    }
  };

  const markerSize = Math.min(FRET_WIDTH_PX * 0.8, STRING_HEIGHT_PX * 0.7);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full transition-colors duration-300">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 justify-center items-center">
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
        <div className="flex items-center space-x-2">
          <Switch id="show-all-notes" checked={showAllNotes} onCheckedChange={setShowAllNotes} />
          <Label htmlFor="show-all-notes" className="text-gray-700 dark:text-gray-300">Show All Notes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-note-names" checked={showNoteNames} onCheckedChange={setShowNoteNames} />
          <Label htmlFor="show-note-names" className="text-gray-700 dark:text-gray-300">Show Note Names</Label>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex w-full" style={{ paddingLeft: STRING_LABEL_WIDTH_PX }}>
            {Array.from({ length: NUM_FRETS }).map((_, i) => {
              const fretNumber = i + 1;
              return (
                <div
                  key={`fret-num-${fretNumber}`}
                  className="flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                  style={{ width: `${FRET_WIDTH_PX}px`, height: `${FRET_NUMBER_HEIGHT_PX}px` }}
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
              className="relative border-l-8 border-stone-700 dark:border-stone-300 bg-amber-200 dark:bg-stone-900 rounded-r-md transition-colors duration-300"
              style={{ 
                width: `${NUM_FRETS * FRET_WIDTH_PX}px`,
                height: `${displayTuning.length * STRING_HEIGHT_PX}px` 
              }}
            >
              {Array.from({ length: NUM_FRETS }).map((_, i) => (
                <div
                  key={`fret-line-${i + 1}`}
                  className="absolute top-0 h-full w-[1.5px] bg-stone-400 dark:bg-stone-600"
                  style={{ left: `${(i + 1) * FRET_WIDTH_PX}px` }}
                />
              ))}

              {FRET_DOT_FRETS_SINGLE.map((fret) => (
                <div
                  key={`dot-single-${fret}`}
                  className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                  style={{
                    left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`,
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
                      left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`,
                      top: `calc(50% - ${STRING_HEIGHT_PX * 1.5}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-stone-400/50 dark:bg-stone-500/50 w-2 h-2 md:w-3 md:h-3"
                    style={{
                      left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`,
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
                        size={markerSize * 0.85}
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

                  const leftPos = note.fretNumber * FRET_WIDTH_PX - FRET_WIDTH_PX / 2;
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
                        size={markerSize}
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