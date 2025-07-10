import React from 'react';
import { cn } from '@/lib/utils';

interface NoteMarkerProps {
  content: string | number;
  isRoot: boolean;
  isHighlighted: boolean;
  size: number;
  onClick?: () => void;
}

const NoteMarker: React.FC<NoteMarkerProps> = ({
  content,
  isRoot,
  isHighlighted,
  size,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold cursor-pointer transition-all duration-150 ease-in-out border-2 backdrop-blur-sm",
        "bg-slate-100/80 dark:bg-slate-900/70", // Base background
        isHighlighted
          ? isRoot
            ? "border-red-500 text-red-600 dark:border-red-400 dark:text-red-400 shadow-lg shadow-red-500/30"
            : "border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400 shadow-md shadow-sky-500/30"
          : "border-slate-400 text-slate-600 dark:border-slate-600 dark:text-slate-300",
      )}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.55}px`,
        pointerEvents: 'auto',
      }}
    >
      {content}
    </div>
  );
};

export default NoteMarker;