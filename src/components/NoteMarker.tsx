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
        "flex items-center justify-center rounded-full font-semibold cursor-pointer transition-all duration-150 ease-in-out border-2",
        "bg-white/90 dark:bg-gray-200/90 backdrop-blur-sm",
        isHighlighted
          ? isRoot
            ? "border-red-600 text-red-600 shadow-lg"
            : "border-blue-600 text-blue-600 shadow-md"
          : "border-gray-500 text-gray-700",
      )}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.55}px`, // Adjust font size relative to marker size
        pointerEvents: 'auto',
      }}
    >
      {content}
    </div>
  );
};

export default NoteMarker;