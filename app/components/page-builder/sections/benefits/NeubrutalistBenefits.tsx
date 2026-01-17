/**
 * Neubrutalist Benefits - Bold, raw aesthetic
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function NeubrutalistBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  const colors = ['#FFE500', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#FF8B94', '#98D8C8'];

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
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 
            className="text-3xl md:text-5xl font-black text-center mb-4 uppercase tracking-tight"
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
          <p 
            className="text-center mb-12 font-medium text-lg"
            style={{ color: '#000000', opacity: 0.7 }}
          >
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="relative p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1"
              style={{ 
                backgroundColor: colors[i % colors.length],
                border: '4px solid #000000',
                boxShadow: '8px 8px 0 #000000',
              }}
            >
              <div 
                className="w-14 h-14 mb-4 flex items-center justify-center text-3xl"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0 #000000',
                }}
              >
                {benefit.icon || '✓'}
              </div>
              
              <h3 
                className="text-xl font-black mb-2 uppercase"
                style={{ color: '#000000' }}
              >
                {benefit.title}
              </h3>
              
              {benefit.description && (
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#000000', opacity: 0.8 }}
                >
                  {benefit.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
