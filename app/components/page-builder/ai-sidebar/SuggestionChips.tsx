/**
 * Suggestion Chips Component
 * 
 * Quick action buttons based on selected element type.
 * Shows context-aware suggestions in Bengali and English.
 */

import type { ComponentType } from '~/lib/grapesjs/types';

interface SuggestionChipsProps {
  componentType: ComponentType;
  onClick: (suggestion: string) => void;
  className?: string;
}

const SUGGESTIONS: Record<ComponentType, { bn: string[]; en: string[] }> = {
  button: {
    bn: ['Button বড় করো', 'সবুজ রং করো', 'Shadow দাও', 'গোল করো'],
    en: ['Make bigger', 'Add shadow', 'Round corners'],
  },
  text: {
    bn: ['Bold করো', 'Font বড় করো', 'Center করো', 'রং বদলাও'],
    en: ['Make bold', 'Increase size', 'Center align'],
  },
  heading: {
    bn: ['বড় করো', 'Gradient দাও', 'Center করো', 'Bold করো'],
    en: ['Make larger', 'Add gradient', 'Center'],
  },
  image: {
    bn: ['গোল corner দাও', 'Shadow দাও', 'Border দাও'],
    en: ['Round corners', 'Add shadow', 'Add border'],
  },
  video: {
    bn: ['Corner গোল করো', 'Shadow দাও'],
    en: ['Round corners', 'Add shadow'],
  },
  link: {
    bn: ['Underline সরাও', 'Color বদলাও', 'Bold করো'],
    en: ['Remove underline', 'Change color'],
  },
  section: {
    bn: ['Padding দাও', 'Background বদলাও', 'Shadow দাও'],
    en: ['Add padding', 'Change background'],
  },
  container: {
    bn: ['Center করো', 'Gap দাও', 'Padding দাও'],
    en: ['Center content', 'Add gap'],
  },
  row: {
    bn: ['Center করো', 'Space দাও', 'Gap বাড়াও'],
    en: ['Center items', 'Add space'],
  },
  column: {
    bn: ['Center করো', 'Padding দাও'],
    en: ['Center', 'Add padding'],
  },
  form: {
    bn: ['Spacing দাও', 'Style দাও'],
    en: ['Add spacing', 'Style inputs'],
  },
  input: {
    bn: ['Border দাও', 'Corner গোল করো'],
    en: ['Add border', 'Round corners'],
  },
  wrapper: {
    bn: ['Padding দাও', 'Background দাও'],
    en: ['Add padding', 'Add background'],
  },
  custom: {
    bn: ['Style দাও', 'Padding দাও'],
    en: ['Add styles', 'Add padding'],
  },
};

export default function SuggestionChips({ componentType, onClick, className = '' }: SuggestionChipsProps) {
  const suggestions = SUGGESTIONS[componentType] || SUGGESTIONS.custom;
  
  // Mix Bengali and English suggestions
  const combined = [...suggestions.bn.slice(0, 3), ...suggestions.en.slice(0, 2)];

  return (
    <div className={className}>
      <div className="text-[10px] text-gray-400 mb-2 font-medium">💡 Quick suggestions:</div>
      <div className="flex flex-wrap gap-1.5">
        {combined.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onClick(suggestion)}
            className="
              px-2.5 py-1.5 rounded-full text-[11px] font-medium
              bg-gray-100 text-gray-600
              hover:bg-indigo-100 hover:text-indigo-700
              border border-gray-200 hover:border-indigo-200
              transition-all duration-200
            "
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
