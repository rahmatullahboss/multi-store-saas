/**
 * Testimonials Section Preview - Theme-enabled
 */

import type { SectionTheme } from '~/lib/page-builder/types';

interface TestimonialsProps {
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
  } = props as TestimonialsProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const bgColor = isDark ? (theme?.bgColor || '#18181B') : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : (theme?.cardBg || '#F9FAFB');
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const primaryColor = theme?.primaryColor || '#6366F1';
  const accentColor = theme?.accentColor || '#8B5CF6';
  
  return (
    <section className="py-12 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: textColor }}
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
                  <div className="font-medium" style={{ color: textColor }}>
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
