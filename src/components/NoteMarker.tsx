import React, { useState } from 'react';
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
  const [isActive, setIsActive] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setTimeout(() => setIsActive(false), 200);
    if (onClick) onClick();
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold cursor-pointer transition-all duration-150 ease-in-out border-2",
        {
          // Active state
          'scale-125 z-50 shadow-[0_0_15px_rgba(255,255,255,0.8)]': isActive,

          // Highlighted States
          'shadow-lg': isRoot && isHighlighted && !isActive,
          'shadow-md': !isRoot && isHighlighted && !isActive,
          
          // Root Note
          'border-red-500 text-red-600 bg-red-100/80 dark:border-red-400 dark:text-red-400 dark:bg-red-900/70 dark:shadow-red-500/30': isRoot && isHighlighted,
          
          // Other Scale Notes
          'border-sky-500 text-sky-600 bg-sky-100/80 dark:border-sky-400 dark:text-sky-400 dark:bg-sky-900/70 dark:shadow-sky-500/30': !isRoot && isHighlighted,
          
          // Non-Scale Notes (when showAllNotes is true)
          'border-stone-400 text-stone-600 bg-stone-50/80 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800/70': !isHighlighted,
        }
      )}
      onClick={handleClick}
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