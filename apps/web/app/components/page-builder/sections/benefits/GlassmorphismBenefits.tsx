/**
 * Glassmorphism Benefits - Frosted glass style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function GlassmorphismBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-20 px-6 relative overflow-hidden" 
      style={{ 
        background: sectionStyle.background || 'linear-gradient(135deg, #1a1a3e 0%, #0F0F23 50%, #1a1a3e 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #10B981, transparent)', top: '20%', left: '5%' }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)', bottom: '10%', right: '10%', animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(99, 102, 241, 0.3))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {benefit.icon || '✓'}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white">
                {benefit.title}
              </h3>
              
              {benefit.description && (
                <p className="text-sm leading-relaxed text-white/60">
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
