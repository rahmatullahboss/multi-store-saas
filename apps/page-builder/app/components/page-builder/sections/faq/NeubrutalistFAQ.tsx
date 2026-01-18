/**
 * Neubrutalist FAQ - Bold, raw aesthetic
 */

import { useState } from 'react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FAQVariantProps } from './types';

export function NeubrutalistFAQ({ title, subtitle, items, theme, styleProps }: FAQVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#FFFBEB',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '"Space Grotesk", sans-serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 
            className="text-3xl font-black text-center mb-4 uppercase"
            style={{ 
              color: headingColor || '#000000', 
              textShadow: '4px 4px 0 #FFE500',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center mb-12 font-medium" style={{ color: '#000000', opacity: 0.7 }}>
            {subtitle}
          </p>
        )}
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index}
              className="transition-all duration-200"
              style={{ 
                backgroundColor: openIndex === index ? '#FFE500' : '#FFFFFF',
                border: '4px solid #000000',
                boxShadow: openIndex === index ? '8px 8px 0 #000000' : '4px 4px 0 #000000',
                transform: openIndex === index ? 'translate(-2px, -2px)' : 'none',
              }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-black text-black uppercase">{item.question}</span>
                <span 
                  className="text-2xl font-black transition-transform"
                  style={{ transform: openIndex === index ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 font-medium text-black/80 border-t-4 border-black pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div 
            className="text-center py-8 px-6"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '4px solid #000000',
              boxShadow: '6px 6px 0 #000000',
            }}
          >
            <p className="font-bold text-black">No FAQ items added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
