import React, { useState, useMemo } from 'react';
import { getNoteAtFret, getScaleNotes, ALL_NOTES, GUITAR_TUNINGS, SCALES } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

const NUM_FRETS = 24; // 24 frets as per requirement
const STRING_HEIGHT_PX = 30; // Visual spacing for strings
const FRET_WIDTH_PX = 80; // Visual spacing for frets (approximate)
const FRET_NUMBER_HEIGHT_PX = 30; // Space for fret numbers above the board
const STRING_LABEL_WIDTH_PX = 40; // Space for string labels to the left

const FRET_DOT_FRETS_SINGLE = [3, 5, 7, 9, 15, 17, 19, 21];
const FRET_DOT_FRETS_DOUBLE = [12, 24];

const Fretboard: React.FC = () => {
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedScaleName, setSelectedScaleName] = useState<keyof typeof SCALES>("MAJOR");

  const currentTuning = GUITAR_TUNINGS.STANDARD; // Using standard tuning for now

  const scaleNotes = useMemo(() => {
    const intervals = SCALES[selectedScaleName];
    return getScaleNotes(selectedRoot, intervals);
  }, [selectedRoot, selectedScaleName]);

  const fretboardNotes = useMemo(() => {
    const notes: {
      stringIndex: number;
      fretNumber: number;
      noteName: string;
      isScaleNote: boolean;
      sequenceNumber: number | null;
      isRoot: boolean;
    }[] = [];

    currentTuning.forEach((openStringNote, stringIndex) => {
      for (let fret = 0; fret <= NUM_FRETS; fret++) {
        const noteName = getNoteAtFret(openStringNote, fret);
        const sequenceIndex = scaleNotes.indexOf(noteName);
        const isScaleNote = sequenceIndex !== -1;
        const isRoot = isScaleNote && noteName === selectedRoot;

        notes.push({
          stringIndex,
          fretNumber: fret,
          noteName,
          isScaleNote,
          sequenceNumber: isScaleNote ? (sequenceIndex + 1) : null,
          isRoot,
        });
      }
    });
    return notes;
  }, [currentTuning, scaleNotes, selectedRoot]);

  const handleNoteClick = (note: string, sequence: number | null) => {
    // Optional: Implement interactive features like playing sound or showing detailed info
    console.log(`Clicked note: ${note}, Sequence: ${sequence}`);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Fret Maestro</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="root-select" className="text-gray-700 dark:text-gray-300">Root Note:</Label>
          <Select value={selectedRoot} onValueChange={setSelectedRoot}>
            <SelectTrigger id="root-select" className="w-[120px] md:w-[150px]">
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
            <SelectTrigger id="scale-select" className="w-[180px] md:w-[200px]">
              <SelectValue placeholder="Select Scale/Mode" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SCALES).map((scale) => (
                <SelectItem key={scale} value={scale}>{scale}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col items-start">
        {/* Fret Numbers Row */}
        <div className="flex w-full" style={{ paddingLeft: STRING_LABEL_WIDTH_PX }}>
          {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
            <div
              key={`fret-num-${i}`}
              className="flex-shrink-0 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400"
              style={{ width: `${FRET_WIDTH_PX}px`, height: `${FRET_NUMBER_HEIGHT_PX}px` }}
            >
              {i > 0 && i} {/* Don't show 0 for the nut */}
            </div>
          ))}
        </div>

        {/* Main Fretboard Area (Strings + Frets + Markers) */}
        <div className="flex w-full overflow-x-auto pb-4">
          {/* String Labels Column */}
          <div className="flex flex-col flex-shrink-0" style={{ width: STRING_LABEL_WIDTH_PX }}>
            {currentTuning.map((note, i) => (
              <div
                key={`string-label-${i}`}
                className="flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                style={{ height: `${STRING_HEIGHT_PX}px` }}
              >
                {note}
              </div>
            ))}
          </div>

          {/* Actual Fretboard Grid */}
          <div
            className="relative border-t-2 border-l-2 border-gray-700 dark:border-gray-300 flex-grow"
            style={{
              minWidth: `${NUM_FRETS * FRET_WIDTH_PX}px`, // Ensure it doesn't shrink below this
              height: `${currentTuning.length * STRING_HEIGHT_PX}px`,
            }}
          >
            {/* Fret lines */}
            {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
              <div
                key={`fret-line-${i}`}
                className={cn(
                  "absolute top-0 h-full bg-gray-700 dark:bg-gray-300",
                  i === 0 ? 'w-2' : 'w-0.5' // Thicker line for the nut
                )}
                style={{ left: `${i * FRET_WIDTH_PX}px` }}
              />
            ))}

            {/* String lines */}
            {currentTuning.map((_, i) => (
              <div
                key={`string-line-${i}`}
                className="absolute left-0 w-full bg-gray-500 dark:bg-gray-400 h-0.5"
                style={{ top: `${i * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2}px` }}
              />
            ))}

            {/* Fret Dot Markers (Single) */}
            {FRET_DOT_FRETS_SINGLE.map((fret) => (
              <div
                key={`dot-single-${fret}`}
                className="absolute rounded-full bg-gray-600 dark:bg-gray-400 w-3 h-3 md:w-4 md:h-4"
                style={{
                  left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`, // Center in the fret
                  top: `50%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Fret Dot Markers (Double) */}
            {FRET_DOT_FRETS_DOUBLE.map((fret) => (
              <React.Fragment key={`dot-double-${fret}`}>
                <div
                  className="absolute rounded-full bg-gray-600 dark:bg-gray-400 w-3 h-3 md:w-4 md:h-4"
                  style={{
                    left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`,
                    top: `calc(50% - ${STRING_HEIGHT_PX / 2}px)`, // Above center
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <div
                  className="absolute rounded-full bg-gray-600 dark:bg-gray-400 w-3 h-3 md:w-4 md:h-4"
                  style={{
                    left: `${fret * FRET_WIDTH_PX - FRET_WIDTH_PX / 2}px`,
                    top: `calc(50% + ${STRING_HEIGHT_PX / 2}px)`, // Below center
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </React.Fragment>
            ))}

            {/* Note Markers */}
            {fretboardNotes.map((note, index) => {
              if (note.isScaleNote) {
                // Calculate position for the note marker
                // Position it in the middle of the fret space
                const leftPos = note.fretNumber * FRET_WIDTH_PX + FRET_WIDTH_PX / 2;
                const topPos = note.stringIndex * STRING_HEIGHT_PX + STRING_HEIGHT_PX / 2;

                return (
                  <div
                    key={`note-${index}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${leftPos}px`, top: `${topPos}px` }}
                  >
                    <NoteMarker
                      noteName={note.noteName}
                      sequenceNumber={note.sequenceNumber!}
                      isRoot={note.isRoot}
                      isHighlighted={true} // Always highlighted if it's a scale note
                      onClick={() => handleNoteClick(note.noteName, note.sequenceNumber)}
                    />
                  </div>
                );
              }
              return null;
            })}
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