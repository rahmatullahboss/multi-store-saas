/**
 * Neubrutalist Trust Badges - Bold, raw aesthetic
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { TrustBadgesVariantProps } from './types';

export function NeubrutalistTrustBadges({ title, badges, theme: _theme, styleProps }: TrustBadgesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  const colors = ['#FFE500', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#FF8B94'];

  return (
    <section 
      className="py-10 px-6"
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#FFFBEB',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '"Space Grotesk", sans-serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
        borderTop: '4px solid #000000',
        borderBottom: '4px solid #000000',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {title && (
          <h3 
            className="text-xl font-black text-center mb-8 uppercase"
            style={{ 
              color: headingColor || '#000000', 
              textShadow: '3px 3px 0 #FFE500',
              ...headingStyle,
            }}
          >
            {title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 transition-all hover:-translate-y-1"
              style={{ 
                backgroundColor: colors[index % colors.length],
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
              }}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-bold text-black uppercase">{badge.text}</span>
            </div>
          ))}
        </div>
        
        {badges.length === 0 && (
          <div 
            className="text-center py-4 px-6"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0 #000000',
            }}
          >
            <p className="font-bold text-black">No trust badges added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
