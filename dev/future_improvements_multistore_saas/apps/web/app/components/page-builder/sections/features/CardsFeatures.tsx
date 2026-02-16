/**
 * Cards Features - Elevated cards with glow effects
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function CardsFeatures({ title, features, theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  const defaultBgColor = isDark ? (theme?.bgColor || '#0F0F23') : '#FFFFFF';
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const primaryColor = theme?.primaryColor || '#6366F1';
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalBgColor = backgroundColor || defaultBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;

  return (
    <section 
      className="py-16 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || finalBgColor,
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 
            className="text-2xl md:text-4xl font-bold text-center mb-12"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                boxShadow: isDark 
                  ? '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                  : '0 4px 24px rgba(0,0,0,0.08)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {/* Top glow line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
                }}
              />
              
              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ 
                  boxShadow: `0 0 60px ${primaryColor}20, 0 0 100px ${primaryColor}10`,
                }}
              />
              
              <div className="relative z-10">
                <div 
                  className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                    boxShadow: `0 8px 24px ${primaryColor}40`,
                  }}
                >
                  <span className="drop-shadow-lg">{feature.icon}</span>
                </div>
                
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: finalTextColor }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="text-sm leading-relaxed" 
                  style={{ color: mutedColor }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center py-8" style={{ color: mutedColor }}>
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
