/**
 * Bento Features - Apple-style modular grid layout
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function BentoFeatures({ title, features, theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  const defaultBgColor = isDark ? (theme?.bgColor || '#0A0A0A') : '#FAFAFA';
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : (theme?.mutedTextColor || '#6B7280');
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalBgColor = backgroundColor || defaultBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;

  // Bento grid colors
  const bentoColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

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
            className="text-3xl md:text-5xl font-bold text-center mb-16"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
          {features.map((feature, index) => {
            // Create bento pattern: first and fourth items span 2 cols
            const isLarge = index === 0 || index === 3;
            const isTall = index === 1;
            
            return (
              <div 
                key={index} 
                className={`
                  rounded-3xl p-6 flex flex-col justify-end relative overflow-hidden
                  transition-all duration-300 hover:scale-[1.02] cursor-pointer
                  ${isLarge ? 'md:col-span-2' : ''}
                  ${isTall ? 'md:row-span-2' : ''}
                `}
                style={{ 
                  background: bentoColors[index % bentoColors.length],
                }}
              >
                {/* Subtle pattern overlay */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-3 drop-shadow-lg">
                    {feature.icon}
                  </div>
                  
                  <h3 
                    className={`font-bold mb-1 text-white drop-shadow-md ${isLarge ? 'text-2xl' : 'text-lg'}`}
                  >
                    {feature.title}
                  </h3>
                  
                  {(isLarge || isTall) && (
                    <p className="text-white/80 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
