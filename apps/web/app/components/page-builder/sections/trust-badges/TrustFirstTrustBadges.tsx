/**
 * Trust First Trust Badges - Clean green trust style
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { TrustBadgesVariantProps } from './types';

export function TrustFirstTrustBadges({ title, badges, theme, styleProps }: TrustBadgesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-10 px-6"
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#DCFCE7',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-5xl mx-auto">
        {title && (
          <div className="flex justify-center mb-6">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: '#BBF7D0', color: '#166534' }}
            >
              ✓ {title}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:-translate-y-1"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #BBF7D0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <span className="text-lg">{badge.icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{badge.text}</span>
              <span className="text-green-500 text-xs">✓</span>
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
