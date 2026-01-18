/**
 * Suggestion Chips Component
 * 
 * Quick action buttons for common AI commands.
 */

import { memo } from 'react';
import { 
  Maximize2, 
  Palette, 
  Bold, 
  AlignCenter,
  Sparkles,
  Zap
} from 'lucide-react';
import type { ComponentType } from '~/lib/grapesjs/types';

interface SuggestionChipsProps {
  componentType: ComponentType | null;
  onSelect: (command: string) => void;
  disabled?: boolean;
}

interface Suggestion {
  label: string;
  command: string;
  icon: typeof Sparkles;
}

// Suggestions based on component type
const SUGGESTIONS: Record<string, Suggestion[]> = {
  button: [
    { label: 'বড় করো', command: 'এই বাটনটা আরো বড় করো', icon: Maximize2 },
    { label: 'সবুজ করো', command: 'এই বাটনের রং সবুজ করো', icon: Palette },
    { label: 'গোলাকার', command: 'বাটনটা গোলাকার করো (border-radius)', icon: Zap },
  ],
  text: [
    { label: 'বড় করো', command: 'ফন্ট সাইজ বড় করো', icon: Maximize2 },
    { label: 'Bold করো', command: 'টেক্সটটা Bold করো', icon: Bold },
    { label: 'Center করো', command: 'টেক্সট center align করো', icon: AlignCenter },
  ],
  heading: [
    { label: 'বড় করো', command: 'শিরোনাম আরো বড় করো', icon: Maximize2 },
    { label: 'রং বদলাও', command: 'শিরোনামের রং পরিবর্তন করো', icon: Palette },
    { label: 'Bold করো', command: 'শিরোনাম Bold করো', icon: Bold },
  ],
  image: [
    { label: 'বড় করো', command: 'ছবিটা আরো বড় করো', icon: Maximize2 },
    { label: 'গোলাকার', command: 'ছবিতে rounded corners দাও', icon: Zap },
    { label: 'Shadow', command: 'ছবিতে shadow effect দাও', icon: Sparkles },
  ],
  section: [
    { label: 'Padding বাড়াও', command: 'সেকশনের padding বাড়াও', icon: Maximize2 },
    { label: 'Background', command: 'সেকশনে gradient background দাও', icon: Palette },
  ],
  default: [
    { label: 'বড় করো', command: 'এটা আরো বড় করো', icon: Maximize2 },
    { label: 'রং বদলাও', command: 'এই element এর রং পরিবর্তন করো', icon: Palette },
    { label: 'সুন্দর করো', command: 'এটাকে আরো সুন্দর করো', icon: Sparkles },
  ],
};

function SuggestionChipsComponent({ componentType, onSelect, disabled }: SuggestionChipsProps) {
  const suggestions = componentType 
    ? SUGGESTIONS[componentType] || SUGGESTIONS.default
    : SUGGESTIONS.default;

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          onClick={() => onSelect(suggestion.command)}
          disabled={disabled}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            transition-all duration-150
            ${disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-violet-50 text-violet-700 hover:bg-violet-100 active:scale-95'
            }
          `}
        >
          <suggestion.icon className="w-3 h-3" />
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

export const SuggestionChips = memo(SuggestionChipsComponent);
