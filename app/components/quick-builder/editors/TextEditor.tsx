/**
 * TextEditor Component
 * 
 * Reusable text input/textarea for Quick Builder.
 * Supports single-line and multi-line modes.
 */

import { memo } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelBn?: string;
  language?: 'en' | 'bn';
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  className?: string;
}

function TextEditorBase({
  value,
  onChange,
  label,
  labelBn,
  language = 'en',
  placeholder,
  multiline = false,
  rows = 3,
  maxLength,
  required = false,
  className = '',
}: TextEditorProps) {
  const displayLabel = language === 'bn' ? (labelBn || label) : label;
  
  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {displayLabel && (
        <label className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">
            {displayLabel}
          </span>
          {required && (
            <span className="text-red-400 text-xs">*</span>
          )}
        </label>
      )}
      
      {multiline ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={`${baseClasses} resize-none`}
          />
          {maxLength && (
            <span className="absolute bottom-2 right-2 text-gray-400 text-xs">
              {value?.length || 0}/{maxLength}
            </span>
          )}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={baseClasses}
        />
      )}
    </div>
  );
}

export const TextEditor = memo(TextEditorBase);
