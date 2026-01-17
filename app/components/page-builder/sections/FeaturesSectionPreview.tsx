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
  
  const { variant = 'grid' } = props as FeaturesProps & { variant?: 'grid' | 'bento' | 'cards' };

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
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 
            className="text-2xl md:text-4xl font-bold text-center mb-12"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className={`grid gap-6 ${
            variant === 'bento' ? 'grid-cols-1 md:grid-cols-3 auto-rows-[200px]' : 
            variant === 'cards' ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-1 md:grid-cols-3'
        }`}>
          {features.map((feature, index) => {
            const isBentoLarge = variant === 'bento' && (index === 0 || index === 3);
            
            return (
                <div 
                  key={index} 
                  className={`
                    rounded-2xl transition-all hover:-translate-y-1 relative overflow-hidden group
                    ${variant === 'bento' ? (isBentoLarge ? 'md:col-span-2 md:row-span-2 p-8 flex flex-col justify-end' : 'p-6 flex flex-col justify-center') : 'p-8 text-center'}
                    ${variant === 'cards' ? 'shadow-lg hover:shadow-2xl border border-transparent hover:border-indigo-500/30' : ''}
                  `}
                  style={{ 
                    backgroundColor: cardBg,
                    // For bento, we might want slightly different vibes per card
                  }}
                >
                    {/* Glow effect for cards variant */}
                    {variant === 'cards' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}

                  <div 
                    className={`
                        mb-4 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110
                        ${isBentoLarge ? 'w-16 h-16 text-3xl mb-6' : 'w-14 h-14 mx-auto'}
                    `}
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    {feature.icon}
                  </div>
                  
                  <h3 
                    className={`font-bold mb-2 ${isBentoLarge ? 'text-3xl' : 'text-xl'}`}
                    style={{ color: finalTextColor }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p 
                    className={`text-sm leading-relaxed ${isBentoLarge ? 'text-lg opacity-90' : 'opacity-80'}`} 
                    style={{ color: mutedColor }}
                  >
                    {feature.description}
                  </p>
                </div>
            );
          })}
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
