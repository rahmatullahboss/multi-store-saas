/**
 * AddSectionButton
 * 
 * A small, centered '+' button that appears between sections in the canvas preview.
 * When clicked, it sends a postMessage to the parent window to add a custom section at that position.
 */

import { Plus } from 'lucide-react';
import { useState } from 'react';

interface AddSectionButtonProps {
  position: string; // e.g., 'after-hero', 'before-features'
  label?: string;   // Optional label for tooltip
}

export function AddSectionButton({ position, label }: AddSectionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    // Send message to parent window (landing-live-editor)
    window.parent.postMessage({
      type: 'ADD_CUSTOM_SECTION',
      position,
    }, '*');
  };

  return (
    <div
      className="relative h-8 flex items-center justify-center group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Line extending across */}
      <div 
        className={`absolute inset-x-4 h-0.5 transition-all duration-200 ${
          isHovered ? 'bg-violet-400' : 'bg-transparent'
        }`}
      />
      
      {/* Plus button */}
      <button
        type="button"
        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border-2 ${
          isHovered 
            ? 'bg-violet-600 border-violet-600 text-white scale-110' 
            : 'bg-white border-gray-300 text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
        title={label || `Add section ${position}`}
      >
        <Plus className="w-4 h-4" />
      </button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-20">
          {label || 'কাস্টম সেকশন যোগ করুন'}
        </div>
      )}
    </div>
  );
}
