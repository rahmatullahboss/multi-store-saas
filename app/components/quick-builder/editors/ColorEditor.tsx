/**
 * ColorEditor Component
 * 
 * Color picker with presets for Quick Builder.
 */

import { useState, memo } from 'react';

interface ColorEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelBn?: string;
  language?: 'en' | 'bn';
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#006A4E', // Bangladesh Green
  '#8B5CF6', // Purple
  '#F9A825', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F97316', // Orange
  '#EC4899', // Pink
  '#18181b', // Dark
  '#FFFFFF', // White
];

function ColorEditorBase({
  value,
  onChange,
  label,
  labelBn,
  language = 'en',
  presets = DEFAULT_PRESETS,
}: ColorEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayLabel = language === 'bn' ? (labelBn || label) : label;

  return (
    <div className="space-y-1">
      {displayLabel && (
        <label className="block text-xs font-medium text-gray-700">
          {displayLabel}
        </label>
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Color Preview */}
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:border-gray-300 transition"
            style={{ backgroundColor: value || '#000000' }}
            title="Click to pick color"
          />
          
          {/* Hex Input */}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Color Picker Dropdown */}
        {showPicker && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color);
                    setShowPicker(false);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform ${
                    value === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            {/* Native Color Picker */}
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 cursor-pointer rounded border border-gray-200"
            />
            
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const ColorEditor = memo(ColorEditorBase);
