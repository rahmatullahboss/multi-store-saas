/**
 * FAQ Section Preview - Theme-enabled
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionTheme } from '~/lib/page-builder/types';

interface FAQProps {
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
}

interface FAQSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function FAQSectionPreview({ props, theme }: FAQSectionPreviewProps) {
  const {
    title = 'সাধারণ জিজ্ঞাসা',
    subtitle = '',
    items = [],
  } = props as FAQProps;
  
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const bgColor = isDark ? (theme?.bgColor || '#18181B') : (theme?.cardBg || '#F9FAFB');
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const primaryColor = theme?.primaryColor || '#6366F1';
  
  return (
    <section className="py-12 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center mb-8" style={{ color: mutedColor }}>{subtitle}</p>
        )}
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: cardBg, 
                border: `1px solid ${cardBorder}`,
              }}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left transition-colors"
                style={{ backgroundColor: openIndex === index ? (isDark ? 'rgba(255,255,255,0.05)' : theme?.cardBg || '#F9FAFB') : 'transparent' }}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium" style={{ color: textColor }}>{item.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: primaryColor }}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4" style={{ color: mutedColor }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <p className="text-center py-8" style={{ color: mutedColor }}>
            No FAQ items added yet
          </p>
        )}
      </div>
    </section>
  );
}
