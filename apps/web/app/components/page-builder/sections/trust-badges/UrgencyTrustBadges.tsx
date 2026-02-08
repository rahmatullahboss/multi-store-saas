/**
 * Urgency Trust Badges - Dark FOMO style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { TrustBadgesVariantProps } from './types';

export function UrgencyTrustBadges({ title, badges, theme, styleProps }: TrustBadgesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-8 px-6 relative"
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#0F0F0F',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
        borderTop: '2px solid #EF4444',
        borderBottom: '2px solid #EF4444',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {title && (
          <div className="flex justify-center mb-6">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-bold uppercase animate-pulse"
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              🔒 {title}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium text-white">{badge.text}</span>
            </div>
          ))}
        </div>
        
        {badges.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            No trust badges added yet
          </p>
        )}
      </div>
    </section>
  );
}
