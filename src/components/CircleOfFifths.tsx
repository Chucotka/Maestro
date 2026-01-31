import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ALL_NOTES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

interface CircleOfFifthsProps {
  selectedRoot: string;
  onNoteSelect: (note: string) => void;
}

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ selectedRoot, onNoteSelect }) => {
  const { t } = useI18n();

  // Major circle (C G D A E B F# Db Ab Eb Bb F)
  const majorCircle = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];
  // Minor circle starts at Am which is relative to C
  const minorCircle = ["A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F", "C", "G", "D"];

  const getRelativeMinor = (major: string) => {
    const idx = majorCircle.indexOf(major);
    return minorCircle[idx];
  };

  const currentMinor = getRelativeMinor(selectedRoot);

  return (
    <div className="p-4 bg-[#1a1a1a] border border-stone-800 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h3 className="text-lg font-bold mb-4 text-[#b06a3b]">{t('circleOfFifths')}</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative w-56 h-56 md:w-72 md:h-72 flex-shrink-0">
          {/* Major Circle (Outer) */}
          {majorCircle.map((note, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 50 + 42 * Math.cos(angle);
            const y = 50 + 42 * Math.sin(angle);

            return (
              <button
                key={`maj-${note}`}
                onClick={() => onNoteSelect(note)}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-11 md:h-11 rounded-full flex flex-col items-center justify-center font-bold transition-all text-xs md:text-sm",
                  selectedRoot === note
                    ? "bg-[#b06a3b] text-white scale-110 shadow-lg z-20 border-2 border-white"
                    : "bg-[#2a2a2a] text-gray-300 border border-stone-700 hover:bg-stone-800"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {note}
                <span className="text-[8px] opacity-60 font-normal">Maj</span>
              </button>
            );
          })}

          {/* Minor Circle (Inner) */}
          {minorCircle.map((note, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 50 + 26 * Math.cos(angle);
            const y = 50 + 26 * Math.sin(angle);

            return (
              <button
                key={`min-${note}`}
                onClick={() => {
                  // Find relative major for this minor
                  const majIdx = minorCircle.indexOf(note);
                  onNoteSelect(majorCircle[majIdx]);
                  toast.info(`Relative major of ${note}m is ${majorCircle[majIdx]}`);
                }}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-9 md:h-9 rounded-full flex flex-col items-center justify-center font-bold transition-all text-[10px] md:text-xs",
                  currentMinor === note
                    ? "bg-stone-600 text-white scale-110 shadow-lg z-10"
                    : "bg-[#1a1a1a] text-stone-500 border border-stone-800 hover:bg-stone-800"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {note}
                <span className="text-[7px] opacity-60 font-normal">min</span>
              </button>
            );
          })}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
            <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{selectedRoot} Major</div>
            <div className="text-xl font-bold text-[#b06a3b]">{currentMinor}m</div>
          </div>
        </div>

        <div className="flex-grow w-full">
          <div className="bg-black/20 p-4 rounded-lg border border-stone-800">
            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-tighter">{selectedRoot} Major Chords</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { roman: 'I', type: 'Maj', color: 'text-white' },
                { roman: 'ii', type: 'min', color: 'text-stone-400' },
                { roman: 'iii', type: 'min', color: 'text-stone-400' },
                { roman: 'IV', type: 'Maj', color: 'text-white' },
                { roman: 'V', type: 'Maj', color: 'text-white' },
                { roman: 'vi', type: 'min', color: 'text-stone-400' },
              ].map((c, i) => {
                // Simple chord derivation for display
                const majorIdx = majorCircle.indexOf(selectedRoot);
                const steps = [0, 2, 4, 5, 7, 9]; // Major scale degrees
                const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
                const rootIdx = scale.indexOf(selectedRoot);
                const chordRoot = scale[(rootIdx + steps[i]) % 12];

                return (
                  <div key={i} className="flex flex-col items-center p-2 bg-stone-800/50 rounded border border-stone-700/50">
                    <span className="text-[10px] text-stone-500 font-mono">{c.roman}</span>
                    <span className={cn("font-bold text-sm", c.color)}>{chordRoot}{c.type === 'min' ? 'm' : ''}</span>
                  </div>
                );
              })}
              <div className="flex flex-col items-center p-2 bg-stone-800/50 rounded border border-stone-700/50">
                <span className="text-[10px] text-stone-500 font-mono">vii°</span>
                <span className="font-bold text-sm text-stone-500">dim</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleOfFifths;
