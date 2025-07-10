import React, { useState, useMemo } from 'react';
import { getNoteAtFret, getScaleNotes, ALL_NOTES, GUITAR_TUNINGS, SCALES } from '@/lib/fretboardUtils';
import NoteMarker from './NoteMarker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const NUM_FRETS = 24; // 24 frets as per requirement
const STRING_HEIGHT_PX = 30; // Visual spacing for strings
const FRET_WIDTH_PX = 80; // Visual spacing for frets (approximate)

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
    <div className="p-4 md:p-8 lg:p-12 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl">
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

      <div className="relative overflow-x-auto pb-4">
        <div
          className="relative border-t-2 border-l-2 border-gray-700 dark:border-gray-300"
          style={{
            width: `${NUM_FRETS * FRET_WIDTH_PX}px`,
            height: `${currentTuning.length * STRING_HEIGHT_PX}px`,
          }}
        >
          {/* Fret lines */}
          {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
            <div
              key={`fret-line-${i}`}
              className={`absolute top-0 h-full bg-gray-700 dark:bg-gray-300 ${i === 0 ? 'w-2' : 'w-0.5'}`}
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