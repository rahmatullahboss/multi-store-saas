/**
 * Story Driven Benefits - Warm, emotional narrative
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function StoryDrivenBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-20 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#FFFBEB',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '"Playfair Display", Georgia, serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-1 rounded-full" style={{ backgroundColor: '#D97706' }} />
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4 italic"
            style={{ color: headingColor || '#92400E', ...headingStyle }}
          >
            "{title}"
          </h2>
        )}
        {subtitle && (
          <p 
            className="text-center text-lg mb-16 max-w-2xl mx-auto italic"
            style={{ color: '#78350F' }}
          >
            {subtitle}
          </p>
        )}
        
        <div className="space-y-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-8 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  border: '3px solid #D97706',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.15)',
                }}
              >
                {benefit.icon || '✓'}
              </div>
              
              <div 
                className="flex-1 p-6 rounded-2xl relative"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <div 
                  className="absolute -top-3 -left-2 text-5xl opacity-20"
                  style={{ color: '#D97706' }}
                >
                  "
                </div>
                
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: '#92400E', fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {benefit.title}
                </h3>
                
                {benefit.description && (
                  <p 
                    className="leading-relaxed"
                    style={{ color: '#78350F', fontFamily: 'Georgia, serif' }}
                  >
                    {benefit.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-amber-600/30" />
            <span className="text-amber-700 text-2xl">✦</span>
            <div className="w-8 h-px bg-amber-600/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
