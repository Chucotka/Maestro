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
          
          // Root Note (Orange/Brown in the reference image)
          'border-[#b06a3b] text-[#b06a3b] bg-[#1a1a1a] shadow-[0_0_8px_rgba(176,106,59,0.5)] border-4': isRoot && isHighlighted,
          
          // Other Scale Notes (Cream/Light in the reference image)
          'border-[#e5d5c0] text-[#e5d5c0] bg-[#1a1a1a]': !isRoot && isHighlighted,
          
          // Non-Scale Notes (when showAllNotes is true)
          'border-stone-600 text-stone-500 bg-transparent': !isHighlighted,
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