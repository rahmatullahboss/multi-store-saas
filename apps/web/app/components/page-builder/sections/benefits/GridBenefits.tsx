/**
 * Grid Benefits - Default card grid layout
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function GridBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const getBgStyle = (): React.CSSProperties => {
    if (backgroundColor || backgroundGradient) {
      return {
        backgroundColor: sectionStyle.backgroundColor,
        background: sectionStyle.background,
      };
    }
    if (isDark) {
      return { backgroundColor: theme?.bgColor || '#18181B' };
    }
    return { background: 'linear-gradient(to bottom, #F0FDF4, #FFFFFF)' };
  };
  
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#D1FAE5');
  const iconBg = theme?.primaryColor || '#10B981';
  
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;

  return (
    <section 
      className="py-12 px-4" 
      style={{
        ...getBgStyle(),
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-2"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p 
            className="text-center mb-10"
            style={{ color: mutedColor }}
          >
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center text-center p-6 rounded-2xl transition-transform hover:-translate-y-1"
              style={{ 
                backgroundColor: cardBg, 
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: iconBg }}
              >
                <span className="text-2xl text-white">{benefit.icon || '✓'}</span>
              </div>
              <h3 
                className="font-semibold text-lg mb-2"
                style={{ color: finalTextColor }}
              >
                {benefit.title}
              </h3>
              {benefit.description && (
                <p style={{ color: mutedColor }}>{benefit.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
