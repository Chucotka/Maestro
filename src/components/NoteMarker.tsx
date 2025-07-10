import React from 'react';
import { cn } from '@/lib/utils';

interface NoteMarkerProps {
  content: string | number; // Can be note name or sequence number
  isRoot: boolean;
  isHighlighted: boolean; // True for scale notes, false for non-scale notes (if showing all)
  onClick?: () => void;
}

const NoteMarker: React.FC<NoteMarkerProps> = ({
  content,
  isRoot,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full text-xs font-bold cursor-pointer transition-all duration-100 ease-in-out",
        "w-6 h-6 md:w-7 md:h-7", // Responsive sizing
        isHighlighted
          ? isRoot
            ? "bg-red-500 text-white shadow-lg scale-110"
            : "bg-blue-500 text-white shadow-lg scale-110"
          : "bg-gray-300 text-gray-800 opacity-70 hover:opacity-100 hover:scale-105",
      )}
      onClick={onClick}
      style={{
        pointerEvents: 'auto', // Ensure clickability
      }}
    >
      {content}
    </div>
  );
};

export default NoteMarker;