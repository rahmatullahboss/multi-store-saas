/**
 * ButtonEditor Component
 * 
 * Edit button text and link for Quick Builder.
 */

import { memo } from 'react';
import { Link } from 'lucide-react';

interface ButtonEditorProps {
  text: string;
  href?: string;
  onTextChange: (value: string) => void;
  onHrefChange?: (value: string) => void;
  label?: string;
  labelBn?: string;
  language?: 'en' | 'bn';
  showLink?: boolean;
}

function ButtonEditorBase({
  text,
  href,
  onTextChange,
  onHrefChange,
  label,
  labelBn,
  language = 'en',
  showLink = true,
}: ButtonEditorProps) {
  const displayLabel = language === 'bn' ? (labelBn || label) : label;

  return (
    <div className="space-y-3">
      {displayLabel && (
        <label className="block text-xs font-medium text-gray-700">
          {displayLabel}
        </label>
      )}
      
      <div className="space-y-2">
        {/* Button Text */}
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">
            {language === 'bn' ? 'বাটন টেক্সট' : 'Button Text'}
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        
        {/* Button Link */}
        {showLink && onHrefChange && (
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 flex items-center gap-1">
              <Link className="w-3 h-3" />
              {language === 'bn' ? 'লিংক (ঐচ্ছিক)' : 'Link (optional)'}
            </label>
            <input
              type="url"
              value={href || ''}
              onChange={(e) => onHrefChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const ButtonEditor = memo(ButtonEditorBase);
