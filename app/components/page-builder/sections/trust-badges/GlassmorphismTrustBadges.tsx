/**
 * Glassmorphism Trust Badges - Frosted glass style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { TrustBadgesVariantProps } from './types';

export function GlassmorphismTrustBadges({ title, badges, theme, styleProps }: TrustBadgesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-10 px-6 relative overflow-hidden"
      style={{
        background: sectionStyle.background || 'linear-gradient(135deg, #1a1a3e 0%, #0F0F23 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {title && (
          <h3 
            className="text-lg font-semibold text-center mb-8"
            style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
          >
            {title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 px-5 py-3 rounded-full transition-all hover:scale-105"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-medium text-white/90">{badge.text}</span>
            </div>
          ))}
        </div>
        
        {badges.length === 0 && (
          <p className="text-center py-4 text-white/50">
            No trust badges added yet
          </p>
        )}
      </div>
    </section>
  );
}
