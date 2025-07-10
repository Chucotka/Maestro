import React from 'react';
import { cn } from '@/lib/utils';

interface NoteMarkerProps {
  noteName: string;
  sequenceNumber: number;
  isRoot: boolean;
  isHighlighted: boolean;
  onClick?: () => void;
}

const NoteMarker: React.FC<NoteMarkerProps> = ({
  noteName,
  sequenceNumber,
  isRoot,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full text-xs font-bold cursor-pointer transition-all duration-100 ease-in-out",
        "w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10", // Responsive sizing
        isHighlighted
          ? isRoot
            ? "bg-red-500 text-white shadow-lg scale-110"
            : "bg-blue-500 text-white shadow-lg scale-110"
          : "bg-gray-300 text-gray-800 opacity-70 hover:opacity-100 hover:scale-105",
      )}
      onClick={onClick}
      style={{
        // These styles will be overridden by parent positioning for actual placement
        // This is just for visual representation of the marker itself
        pointerEvents: 'auto', // Ensure clickability
      }}
    >
      {sequenceNumber}
    </div>
  );
};

export default NoteMarker;