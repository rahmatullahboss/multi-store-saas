/**
 * Testimonials Section Preview - Theme-enabled with Per-Section Styling
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface TestimonialsProps extends SectionStyleProps {
  title?: string;
  testimonials?: Array<{ name: string; text?: string; location?: string; imageUrl?: string; rating?: number }>;
}

interface TestimonialsSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function TestimonialsSectionPreview({ props, theme }: TestimonialsSectionPreviewProps) {
  const {
    title = 'কাস্টমারদের মতামত',
    testimonials = [],
    // Per-section styling
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as TestimonialsProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const defaultBgColor = isDark ? (theme?.bgColor || '#18181B') : '#FFFFFF';
  const defaultTextColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : (theme?.cardBg || '#F9FAFB');
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const primaryColor = theme?.primaryColor || '#6366F1';
  const accentColor = theme?.accentColor || '#8B5CF6';
  
  // Get per-section styling
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalTextColor = textColor || defaultTextColor;
  const finalHeadingColor = headingColor || textColor || defaultTextColor;
  
  return (
    <section 
      className="py-12 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || defaultBgColor,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: cardBg, 
                border: `1px solid ${cardBorder}`,
              }}
            >
              {/* Rating stars */}
              {testimonial.rating && (
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className="text-lg"
                      style={{ color: i < testimonial.rating! ? '#FBBF24' : mutedColor }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              
              {testimonial.text && (
                <p 
                  className="text-sm italic mb-4"
                  style={{ color: mutedColor }}
                >
                  "{testimonial.text}"
                </p>
              )}
              
              <div className="flex items-center gap-3">
                {testimonial.imageUrl ? (
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-medium" style={{ color: finalTextColor }}>
                    {testimonial.name}
                  </div>
                  {testimonial.location && (
                    <div className="text-xs" style={{ color: mutedColor }}>
                      {testimonial.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {testimonials.length === 0 && (
          <p className="text-center py-8" style={{ color: mutedColor }}>
            No testimonials added yet
          </p>
        )}
      </div>
    </section>
  );
}
