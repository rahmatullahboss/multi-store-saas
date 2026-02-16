/**
 * Cards FAQ - Grid card layout (no accordion)
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FAQVariantProps } from './types';

export function CardsFAQ({ title, subtitle, items, theme, styleProps }: FAQVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const defaultBgColor = isDark ? (theme?.bgColor || '#18181B') : '#FFFFFF';
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
  const primaryColor = theme?.primaryColor || '#6366F1';
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;

  return (
    <section 
      className="py-16 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || defaultBgColor,
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 
            className="text-3xl font-bold text-center mb-4"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center mb-12" style={{ color: mutedColor }}>{subtitle}</p>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ 
                backgroundColor: cardBg,
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
              }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  Q
                </div>
                <div>
                  <h3 
                    className="font-semibold mb-3"
                    style={{ color: finalTextColor }}
                  >
                    {item.question}
                  </h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: mutedColor }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
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
