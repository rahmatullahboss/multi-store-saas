/**
 * Glassmorphism FAQ - Frosted glass style
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FAQVariantProps } from './types';

export function GlassmorphismFAQ({ title, subtitle, items, theme, styleProps }: FAQVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative overflow-hidden" 
      style={{ 
        background: sectionStyle.background || 'linear-gradient(135deg, #1a1a3e 0%, #0F0F23 50%, #1a1a3e 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Background orb */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'radial-gradient(circle, #6366F1, transparent)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {title && (
          <h2 
            className="text-3xl font-bold text-center mb-4"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center mb-12 text-white/60">{subtitle}</p>
        )}
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: openIndex === index ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: openIndex === index ? '0 8px 32px rgba(99, 102, 241, 0.1)' : 'none',
              }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-white">{item.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: '#6366F1' }}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-white/70 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <p className="text-center py-8 text-white/50">
            No FAQ items added yet
          </p>
        )}
      </div>
    </section>
  );
}
