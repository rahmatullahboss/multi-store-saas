/**
 * AddSectionButton
 * 
 * A small, centered '+' button that appears between sections in the canvas preview.
 * Uses absolute positioning so it takes NO SPACE in the layout.
 * Only visible on hover.
 */

import { Plus } from 'lucide-react';
import { useState } from 'react';

interface AddSectionButtonProps {
  position: string; // e.g., 'after-hero', 'before-features'
  label?: string;   // Optional label for tooltip
}

export function AddSectionButton({ position, label }: AddSectionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Send message to parent window (landing-live-editor)
    window.parent.postMessage({
      type: 'ADD_CUSTOM_SECTION',
      position,
    }, '*');
  };

  return (
    <div
      className="relative h-0 w-full z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible hover zone */}
      <div className="absolute -top-3 -bottom-3 inset-x-0 flex items-center justify-center">
        {/* Line extending across (only on hover) */}
        <div 
          className={`absolute inset-x-8 h-0.5 transition-opacity duration-200 ${
            isHovered ? 'opacity-100 bg-violet-400' : 'opacity-0'
          }`}
        />
        
        {/* Plus button */}
        <button
          type="button"
          onClick={handleClick}
          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            isHovered 
              ? 'bg-violet-600 text-white scale-110 shadow-lg opacity-100' 
              : 'bg-white/80 text-gray-400 border border-gray-300 opacity-0 hover:opacity-100'
          }`}
          title={label || `Add section ${position}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

