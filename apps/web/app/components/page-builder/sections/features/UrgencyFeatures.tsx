/**
 * Urgency Features - Dark FOMO style with emphasis
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function UrgencyFeatures({ title, features, theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative overflow-hidden" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#0F0F0F',
        background: sectionStyle.background || 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Warning stripes at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 20px, #000000 20px, #000000 40px)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Urgency badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider animate-pulse"
            style={{ 
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
            }}
          >
            🔥 সীমিত সময়ের অফার
          </span>
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-black text-center mb-4 uppercase"
            style={{ 
              color: headingColor || '#FFFFFF',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          এই ফিচারগুলো শুধুমাত্র <span className="text-red-500 font-bold">আজকের অফারে</span> পাচ্ছেন
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative p-6 rounded-lg transition-all duration-300 hover:scale-105 group"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {/* Glow on hover */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
                }}
              />
              
              {/* Number badge */}
              <div 
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ 
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                }}
              >
                {index + 1}
              </div>
              
              {/* Icon */}
              <div 
                className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center text-2xl"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {feature.icon}
              </div>
              
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: '#FFFFFF' }}
              >
                {feature.title}
              </h3>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {feature.description}
              </p>
              
              {/* Value indicator */}
              <div 
                className="mt-4 inline-block px-3 py-1 rounded text-xs font-bold"
                style={{ 
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#22C55E',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                ৳{(index + 1) * 500} মূল্যের
              </div>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
