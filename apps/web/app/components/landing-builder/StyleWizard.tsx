/**
 * Style Wizard Component for Quick Builder v2
 * 
 * Allows users to customize landing page style:
 * - Brand color (primary color)
 * - Button style (rounded, sharp, pill)
 * - Font family (system, serif, sans-serif)
 * - Dark mode toggle
 */

import { useState } from 'react';
import { Check, Moon, Sun, Type, Palette, Square } from 'lucide-react';
import { cn } from '~/utils/cn';
import type { StyleWizardSettings } from '@db/types';

// Preset brand colors
const PRESET_COLORS = [
  { id: 'emerald', value: '#10b981', name: 'এমারেল্ড' },
  { id: 'blue', value: '#3b82f6', name: 'নীল' },
  { id: 'purple', value: '#8b5cf6', name: 'বেগুনি' },
  { id: 'rose', value: '#f43f5e', name: 'গোলাপি' },
  { id: 'orange', value: '#f97316', name: 'কমলা' },
  { id: 'amber', value: '#f59e0b', name: 'সোনালি' },
];

// Button style options
const BUTTON_STYLES = [
  { id: 'rounded', name: 'রাউন্ডেড', description: 'গোলাকার কোণা', icon: '◐' },
  { id: 'sharp', name: 'শার্প', description: 'তীক্ষ্ণ কোণা', icon: '▢' },
  { id: 'pill', name: 'পিল', description: 'ক্যাপসুল আকৃতি', icon: '◯' },
] as const;

// Font family options
const FONT_FAMILIES = [
  { id: 'system', name: 'সিস্টেম', description: 'ডিফল্ট ফন্ট', preview: 'Aa' },
  { id: 'serif', name: 'সেরিফ', description: 'ক্লাসিক লুক', preview: 'Aa' },
  { id: 'sans-serif', name: 'স্যান্স-সেরিফ', description: 'মডার্ন লুক', preview: 'Aa' },
] as const;

interface StyleWizardProps {
  value: StyleWizardSettings;
  onChange: (settings: StyleWizardSettings) => void;
  compact?: boolean;
}

// Color picker with presets
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const isPreset = PRESET_COLORS.some((c) => c.value === value);

  return (
    <div className="space-y-3">
      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'w-10 h-10 rounded-lg transition-all relative',
              'hover:scale-110 hover:shadow-lg',
              value === color.value && 'ring-2 ring-offset-2 ring-gray-900'
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
            )}
          </button>
        ))}
        
        {/* Custom color button */}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={cn(
            'w-10 h-10 rounded-lg border-2 border-dashed transition-all',
            'hover:border-gray-400 flex items-center justify-center',
            !isPreset ? 'border-gray-900' : 'border-gray-300'
          )}
          style={!isPreset ? { backgroundColor: value } : undefined}
          title="কাস্টম কালার"
        >
          {isPreset ? (
            <Palette className="w-4 h-4 text-gray-400" />
          ) : (
            <Check className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Custom color input */}
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          />
        </div>
      )}
    </div>
  );
}

// Button style selector
function ButtonStyleSelector({
  value,
  onChange,
  brandColor,
}: {
  value: StyleWizardSettings['buttonStyle'];
  onChange: (style: StyleWizardSettings['buttonStyle']) => void;
  brandColor: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {BUTTON_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={cn(
            'p-3 rounded-xl border-2 transition-all text-center',
            value === style.id
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          {/* Preview button */}
          <div
            className={cn(
              'w-full py-2 mb-2 text-white text-sm font-medium',
              style.id === 'rounded' && 'rounded-lg',
              style.id === 'sharp' && 'rounded-none',
              style.id === 'pill' && 'rounded-full'
            )}
            style={{ backgroundColor: brandColor }}
          >
            অর্ডার করুন
          </div>
          <span className="text-sm font-medium text-gray-700">{style.name}</span>
          {value === style.id && (
            <Check className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
          )}
        </button>
      ))}
    </div>
  );
}

// Font family selector
function FontFamilySelector({
  value,
  onChange,
}: {
  value: StyleWizardSettings['fontFamily'];
  onChange: (font: StyleWizardSettings['fontFamily']) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {FONT_FAMILIES.map((font) => (
        <button
          key={font.id}
          type="button"
          onClick={() => onChange(font.id)}
          className={cn(
            'p-3 rounded-xl border-2 transition-all text-center',
            value === font.id
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <span
            className={cn(
              'text-2xl font-bold text-gray-900 block mb-1',
              font.id === 'serif' && 'font-serif',
              font.id === 'sans-serif' && 'font-sans'
            )}
          >
            {font.preview}
          </span>
          <span className="text-sm font-medium text-gray-700">{font.name}</span>
          <span className="text-xs text-gray-500 block">{font.description}</span>
          {value === font.id && (
            <Check className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
          )}
        </button>
      ))}
    </div>
  );
}

// Dark mode toggle
function DarkModeToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        {value ? (
          <Moon className="w-5 h-5 text-indigo-600" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
        <div>
          <span className="font-medium text-gray-900">
            {value ? 'ডার্ক মোড' : 'লাইট মোড'}
          </span>
          <p className="text-sm text-gray-500">
            {value ? 'গাঢ় ব্যাকগ্রাউন্ড' : 'হালকা ব্যাকগ্রাউন্ড'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-14 h-8 rounded-full transition-colors',
          value ? 'bg-indigo-600' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow',
            value ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

// Main Style Wizard Component
export function StyleWizard({ value, onChange, compact = false }: StyleWizardProps) {
  const handleChange = (key: keyof StyleWizardSettings, val: StyleWizardSettings[typeof key]) => {
    onChange({ ...value, [key]: val });
  };

  if (compact) {
    // Compact version for inline editing
    return (
      <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ব্র্যান্ড কালার
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.slice(0, 4).map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleChange('brandColor', color.value)}
                className={cn(
                  'w-8 h-8 rounded-lg transition-all',
                  value.brandColor === color.value && 'ring-2 ring-offset-1 ring-gray-900'
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              বাটন স্টাইল
            </label>
            <select
              value={value.buttonStyle || 'rounded'}
              onChange={(e) => handleChange('buttonStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {BUTTON_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ফন্ট
            </label>
            <select
              value={value.fontFamily || 'system'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="space-y-6">
      {/* Brand Color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">ব্র্যান্ড কালার</h3>
        </div>
        <ColorPicker
          value={value.brandColor || '#10b981'}
          onChange={(color) => handleChange('brandColor', color)}
        />
      </div>

      {/* Button Style */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Square className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">বাটন স্টাইল</h3>
        </div>
        <ButtonStyleSelector
          value={value.buttonStyle || 'rounded'}
          onChange={(style) => handleChange('buttonStyle', style)}
          brandColor={value.brandColor || '#10b981'}
        />
      </div>

      {/* Font Family */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">ফন্ট স্টাইল</h3>
        </div>
        <FontFamilySelector
          value={value.fontFamily || 'system'}
          onChange={(font) => handleChange('fontFamily', font)}
        />
      </div>

      {/* Dark Mode */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">থিম</h3>
        <DarkModeToggle
          value={value.darkMode || false}
          onChange={(enabled) => handleChange('darkMode', enabled)}
        />
      </div>

      {/* Preview Box */}
      <div
        className={cn(
          'p-6 rounded-xl transition-colors',
          value.darkMode ? 'bg-gray-900' : 'bg-gray-100'
        )}
      >
        <h4
          className={cn(
            'text-lg font-bold mb-2',
            value.darkMode ? 'text-white' : 'text-gray-900',
            value.fontFamily === 'serif' && 'font-serif',
            value.fontFamily === 'sans-serif' && 'font-sans'
          )}
        >
          প্রিভিউ
        </h4>
        <p
          className={cn(
            'text-sm mb-4',
            value.darkMode ? 'text-gray-300' : 'text-gray-600'
          )}
        >
          এভাবে আপনার ল্যান্ডিং পেইজ দেখাবে
        </p>
        <button
          className={cn(
            'px-6 py-2.5 text-white font-medium transition-colors',
            value.buttonStyle === 'rounded' && 'rounded-lg',
            value.buttonStyle === 'sharp' && 'rounded-none',
            value.buttonStyle === 'pill' && 'rounded-full'
          )}
          style={{ backgroundColor: value.brandColor || '#10b981' }}
        >
          এখনই অর্ডার করুন
        </button>
      </div>
    </div>
  );
}

// Export individual components for flexible use
export { ColorPicker, ButtonStyleSelector, FontFamilySelector, DarkModeToggle };
export default StyleWizard;
