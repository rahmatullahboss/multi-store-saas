/**
 * Glassmorphism Features - Frosted glass cards with blur effects
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function GlassmorphismFeatures({ title, features, theme: _theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-20 px-6 relative overflow-hidden" 
      style={{ 
        background: sectionStyle.background || 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #0F0F23 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, #6366F1, transparent)',
            top: '10%',
            left: '10%',
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, #8B5CF6, transparent)',
            bottom: '10%',
            right: '10%',
            animationDelay: '1s',
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, #EC4899, transparent)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: '2s',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {title && (
          <h2 
            className="text-3xl md:text-5xl font-bold text-center mb-4"
            style={{ 
              color: headingColor || '#FFFFFF',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        
        <p className="text-center text-white/60 mb-16 max-w-2xl mx-auto">
          সেরা ফিচার যা আপনার জীবনকে সহজ করবে
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Shine effect on hover */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }}
              />
              
              {/* Icon with gradient background */}
              <div 
                className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center text-3xl relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="relative z-10 drop-shadow-lg">{feature.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white">
                {feature.title}
              </h3>
              
              <p className="text-sm leading-relaxed text-white/60">
                {feature.description}
              </p>
              
              {/* Bottom accent line */}
              <div 
                className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)',
                }}
              />
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center py-8 text-white/50">
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
