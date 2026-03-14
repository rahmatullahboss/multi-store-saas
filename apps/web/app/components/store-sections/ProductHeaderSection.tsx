
import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { SectionSettings } from './registry';

interface ProductHeaderSectionProps {
  settings: SectionSettings;
  product?: {
    title: string;
    category?: string | null;
  };
  theme?: {
    textColor?: string;
    mutedColor?: string;
    borderColor?: string;
    backgroundColor?: string;
  };
}

export function ProductHeaderSection({ settings, product, theme }: ProductHeaderSectionProps) {
  if (!product) return null;

  const textMuted = theme?.mutedColor || 'text-gray-500';
  const textPrimary = theme?.textColor || 'text-gray-900';
  const borderColor = theme?.borderColor || 'border-gray-200';
  const bgClass = theme?.backgroundColor || 'bg-white';

  return (
    <nav className={`border-b ${borderColor} ${bgClass}`} style={{ ...settings.style }}>
      <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm overflow-x-auto">
          <Link to="/" className={`${textMuted} hover:text-orange-500 transition shrink-0`}>Home</Link>
          <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 ${textMuted} shrink-0`} />
          <Link to="/" className={`${textMuted} hover:text-orange-500 transition shrink-0`}>Products</Link>
          <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 ${textMuted} shrink-0`} />
          <span className={`${textPrimary} truncate`}>{product.title}</span>
        </div>
      </div>
    </nav>
  );
}
