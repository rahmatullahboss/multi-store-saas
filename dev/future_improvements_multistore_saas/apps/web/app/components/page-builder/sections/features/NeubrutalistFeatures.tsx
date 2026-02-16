/**
 * Neubrutalist Features - Bold borders, offset shadows, raw aesthetic
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function NeubrutalistFeatures({ title, features, theme: _theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  // Neubrutalist color palette
  const colors = [
    { bg: '#FFE500', shadow: '#000000' },
    { bg: '#FF6B6B', shadow: '#000000' },
    { bg: '#4ECDC4', shadow: '#000000' },
    { bg: '#A8E6CF', shadow: '#000000' },
    { bg: '#FF8B94', shadow: '#000000' },
    { bg: '#98D8C8', shadow: '#000000' },
  ];

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
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 
            className="text-3xl md:text-5xl font-black text-center mb-16 uppercase tracking-tight"
            style={{ 
              color: headingColor || '#000000',
              textShadow: '4px 4px 0 #FFE500',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colorScheme = colors[index % colors.length];
            
            return (
              <div 
                key={index} 
                className="relative p-8 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer"
                style={{ 
                  backgroundColor: colorScheme.bg,
                  border: '4px solid #000000',
                  boxShadow: '8px 8px 0 #000000',
                }}
              >
                {/* Decorative corner */}
                <div 
                  className="absolute top-0 right-0 w-12 h-12"
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, #000000 50%)',
                  }}
                />
                
                {/* Icon */}
                <div 
                  className="w-16 h-16 mb-6 flex items-center justify-center text-4xl"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #000000',
                    boxShadow: '4px 4px 0 #000000',
                  }}
                >
                  {feature.icon}
                </div>
                
                <h3 
                  className="text-xl font-black mb-3 uppercase tracking-wide"
                  style={{ color: '#000000' }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="text-sm leading-relaxed font-medium"
                  style={{ color: '#000000', opacity: 0.8 }}
                >
                  {feature.description}
                </p>
                
                {/* Arrow indicator */}
                <div 
                  className="mt-6 inline-flex items-center gap-2 font-bold uppercase text-sm"
                  style={{ color: '#000000' }}
                >
                  Learn More
                  <span className="text-xl">→</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {features.length === 0 && (
          <div 
            className="text-center py-8 px-6"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '3px solid #000000',
              boxShadow: '6px 6px 0 #000000',
            }}
          >
            <p className="font-bold text-black">No features added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
