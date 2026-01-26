import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ALL_NOTES } from '@/lib/fretboardUtils';
import { cn } from '@/lib/utils';

interface CircleOfFifthsProps {
  selectedRoot: string;
  onNoteSelect: (note: string) => void;
}

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ selectedRoot, onNoteSelect }) => {
  const { t } = useI18n();
  // Major circle (C G D A E B F# Db Ab Eb Bb F)
  const circle = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];

  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-xl backdrop-blur-sm w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4 dark:text-gray-100">{t('circleOfFifths')}</h3>
      <div className="relative w-64 h-64 mx-auto">
        {circle.map((note, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 50 + 40 * Math.cos(angle);
          const y = 50 + 40 * Math.sin(angle);

          return (
            <button
              key={note}
              onClick={() => onNoteSelect(note)}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                selectedRoot === note
                  ? "bg-sky-500 text-white scale-110 shadow-lg z-10"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-600"
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {note}
            </button>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Click to select Root</div>
        </div>
      </div>
    </div>
  );
};

export default CircleOfFifths;
