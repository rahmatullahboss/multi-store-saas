/**
 * Urgency Benefits - Dark FOMO style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function UrgencyBenefits({ title, subtitle, benefits, theme: _theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#0F0F0F',
        background: sectionStyle.background || 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ background: 'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 20px, #000000 20px, #000000 40px)' }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold uppercase animate-pulse"
            style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
          >
            🎁 বোনাস বেনিফিটস
          </span>
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-black text-center mb-4 uppercase"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center text-gray-400 mb-12">
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="relative p-6 rounded-lg group hover:scale-105 transition-all"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <div 
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
              >
                {i + 1}
              </div>
              
              <div 
                className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center text-2xl"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {benefit.icon || '✓'}
              </div>
              
              <h3 className="text-lg font-bold mb-2 text-white">
                {benefit.title}
              </h3>
              
              {benefit.description && (
                <p className="text-sm text-white/60">
                  {benefit.description}
                </p>
              )}
              
              <div 
                className="mt-4 inline-block px-3 py-1 rounded text-xs font-bold"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }}
              >
                ফ্রি বোনাস
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
