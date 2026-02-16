/**
 * Color Picker Field Component
 * 
 * Beautiful color picker with:
 * - Preset colors (popular choices)
 * - Gradient presets
 * - Custom hex input
 * - Transparent option
 */

import { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';

// Preset colors for quick selection
const PRESET_COLORS = [
  // Neutrals
  { value: '#FFFFFF', name: 'White' },
  { value: '#F9FAFB', name: 'Light Gray' },
  { value: '#E5E7EB', name: 'Gray 200' },
  { value: '#6B7280', name: 'Gray 500' },
  { value: '#374151', name: 'Gray 700' },
  { value: '#1F2937', name: 'Gray 800' },
  { value: '#111827', name: 'Gray 900' },
  { value: '#000000', name: 'Black' },
  
  // Brand Colors
  { value: '#EF4444', name: 'Red' },
  { value: '#F97316', name: 'Orange' },
  { value: '#FBBF24', name: 'Amber' },
  { value: '#22C55E', name: 'Green' },
  { value: '#10B981', name: 'Emerald' },
  { value: '#14B8A6', name: 'Teal' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#6366F1', name: 'Indigo' },
  { value: '#8B5CF6', name: 'Violet' },
  { value: '#EC4899', name: 'Pink' },
  
  // Dark theme colors
  { value: '#0B0F19', name: 'Dark Navy' },
  { value: '#18181B', name: 'Zinc 900' },
  { value: '#1A1A2E', name: 'Dark Purple' },
  { value: '#7F1D1D', name: 'Red 900' },
];

// Gradient presets
const GRADIENT_PRESETS = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Cyan' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Sunset' },
  { value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', name: 'Dark' },
  { value: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)', name: 'Red Dark' },
];

interface ColorPickerFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  showGradients?: boolean;
  showTransparent?: boolean;
}

export function ColorPickerField({
  label,
  value = '',
  onChange,
  showGradients = false,
  showTransparent = true,
}: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || '');

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomChange = (hex: string) => {
    setCustomColor(hex);
    // Only update if valid hex or empty
    if (hex === '' || /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleClear = () => {
    onChange('');
    setCustomColor('');
  };

  return (
    <div className="mb-3 relative">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      
      {/* Color preview button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div 
          className="w-6 h-6 rounded-md border border-gray-300 flex-shrink-0"
          style={{ 
            background: value || 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 12px 12px',
          }}
        />
        <span className="text-sm text-gray-600 flex-1 text-left truncate">
          {value || 'Select color...'}
        </span>
        <Palette size={14} className="text-gray-400" />
      </button>

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 bg-white rounded-xl shadow-xl border border-gray-200 w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">রং নির্বাচন</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={14} />
            </button>
          </div>

          {/* Transparent option */}
          {showTransparent && (
            <button
              onClick={handleClear}
              className={`w-full mb-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                !value 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              ✨ Transparent / Default
            </button>
          )}

          {/* Preset colors grid */}
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handlePresetClick(color.value)}
                className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
                  value === color.value ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-white'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {value === color.value && (
                  <Check size={12} className="mx-auto text-white drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>

          {/* Gradients */}
          {showGradients && (
            <>
              <span className="text-[10px] font-semibold text-gray-400 uppercase">গ্রেডিয়েন্ট</span>
              <div className="grid grid-cols-4 gap-1.5 mt-1.5 mb-3">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.value}
                    onClick={() => handlePresetClick(grad.value)}
                    className={`h-6 rounded-md border-2 ${
                      value === grad.value ? 'border-indigo-500' : 'border-transparent'
                    }`}
                    style={{ background: grad.value }}
                    title={grad.name}
                  />
                ))}
              </div>
            </>
          )}

          {/* Custom hex input */}
          <div className="flex gap-2">
            <input
              type="color"
              value={value?.startsWith('#') ? value : '#6366F1'}
              onChange={(e) => handlePresetClick(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="#6366F1"
              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPickerField;
