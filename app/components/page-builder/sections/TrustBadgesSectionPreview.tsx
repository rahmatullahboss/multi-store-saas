/**
 * Trust Badges Section Preview - Per-Section Styling Enabled
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface TrustBadgesProps extends SectionStyleProps {
  title?: string;
  badges?: Array<{ icon: string; text: string }>;
}

interface TrustBadgesSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function TrustBadgesSectionPreview({ props, theme }: TrustBadgesSectionPreviewProps) {
  const {
    title = '',
    badges = [],
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as TrustBadgesProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const defaultBgColor = isDark ? 'rgba(0,0,0,0.3)' : (theme?.cardBg || '#F9FAFB');
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#374151');
  const iconBg = theme?.primaryColor || '#6366F1';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  
  // Get per-section styling
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;
  
  return (
    <section 
      className="py-6 px-6"
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
      <div className="max-w-4xl mx-auto">
        {title && (
          <h3 
            className="text-lg font-semibold text-center mb-4"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2"
              style={{ color: finalTextColor }}
            >
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: iconBg }}
              >
                {badge.icon}
              </span>
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
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
