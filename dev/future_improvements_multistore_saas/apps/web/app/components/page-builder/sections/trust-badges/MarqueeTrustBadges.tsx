/**
 * Marquee Trust Badges - Animated scrolling badges
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { TrustBadgesVariantProps } from './types';

export function MarqueeTrustBadges({ title, badges, theme, styleProps }: TrustBadgesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const defaultBgColor = isDark ? 'rgba(0,0,0,0.3)' : (theme?.cardBg || '#F9FAFB');
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#374151');
  const iconBg = theme?.primaryColor || '#6366F1';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;

  return (
    <section 
      className="py-8 px-6 overflow-hidden relative"
      style={{
        backgroundColor: sectionStyle.backgroundColor || defaultBgColor,
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop || '1.5rem',
        paddingBottom: sectionStyle.paddingBottom || '1.5rem',
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div className="w-full">
        {title && (
          <h3 
            className="text-lg font-semibold text-center mb-6"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h3>
        )}
        
        <div className="relative w-full flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
            {[...badges, ...badges, ...badges].map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 mx-4"
                style={{ color: finalTextColor }}
              >
                <span 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm"
                  style={{ backgroundColor: iconBg }}
                >
                  {badge.icon}
                </span>
                <span className="text-base font-medium whitespace-nowrap">{badge.text}</span>
              </div>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              animation: marquee 20s linear infinite;
            }
          `}} />
        </div>
        
        {badges.length === 0 && (
          <p className="text-center py-4" style={{ color: theme?.mutedTextColor || '#9CA3AF' }}>
            No trust badges added yet
          </p>
        )}
      </div>
    </section>
  );
}
