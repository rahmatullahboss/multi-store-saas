/**
 * Features Section Preview - Theme-enabled with Per-Section Styling
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface FeaturesProps extends SectionStyleProps {
  title?: string;
  features?: Array<{ icon: string; title: string; description: string }>;
}

interface FeaturesSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function FeaturesSectionPreview({ props, theme }: FeaturesSectionPreviewProps) {
  const {
    title = 'প্রধান বৈশিষ্ট্যসমূহ',
    features = [],
    // Per-section styling
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as FeaturesProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  // Defaults from theme (can be overridden by per-section props)
  const defaultBgColor = isDark ? (theme?.bgColor || '#18181B') : '#FFFFFF';
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : (theme?.cardBg || '#F9FAFB');
  const primaryColor = theme?.primaryColor || '#6366F1';
  
  // Get per-section styling
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  // Final colors (per-section overrides theme)
  const finalBgColor = backgroundColor || defaultBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;
  
  return (
    <section 
      className="py-12 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || finalBgColor,
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: cardBg }}
            >
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                {feature.icon}
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: finalTextColor }}
              >
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center py-8" style={{ color: mutedColor }}>
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
