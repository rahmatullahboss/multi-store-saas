/**
 * Story Driven Features - Warm, emotional narrative style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function StoryDrivenFeatures({ title, features, theme: _theme, styleProps }: FeaturesVariantProps) {
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
        {/* Decorative element */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-16 h-1 rounded-full"
            style={{ backgroundColor: '#D97706' }}
          />
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-6 italic"
            style={{ 
              color: headingColor || '#92400E',
              ...headingStyle,
            }}
          >
            "{title}"
          </h2>
        )}
        
        <p 
          className="text-center text-lg mb-16 max-w-2xl mx-auto leading-relaxed"
          style={{ 
            color: '#78350F',
            fontStyle: 'italic',
          }}
        >
          প্রতিটি ফিচার আপনার গল্পের একটি অংশ হয়ে উঠবে...
        </p>
        
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              {/* Icon side */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  border: '3px solid #D97706',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.15)',
                }}
              >
                {feature.icon}
              </div>
              
              {/* Content side */}
              <div 
                className="flex-1 p-8 rounded-2xl relative"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                {/* Quote mark */}
                <div 
                  className="absolute -top-4 -left-2 text-6xl opacity-20"
                  style={{ color: '#D97706' }}
                >
                  "
                </div>
                
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ 
                    color: '#92400E',
                    fontFamily: '"Playfair Display", Georgia, serif',
                  }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="leading-relaxed"
                  style={{ 
                    color: '#78350F',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {feature.description}
                </p>
                
                {/* Decorative line */}
                <div 
                  className="mt-4 w-12 h-0.5 rounded-full"
                  style={{ backgroundColor: '#D97706', opacity: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p 
            className="text-center py-8 italic"
            style={{ color: '#92400E' }}
          >
            No features added yet
          </p>
        )}
        
        {/* Bottom decorative element */}
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
