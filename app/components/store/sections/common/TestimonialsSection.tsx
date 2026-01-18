/**
 * Testimonials Section
 * 
 * Customer reviews and testimonials.
 */

import { Star, Quote } from 'lucide-react';
import type { RenderContext } from '~/lib/template-resolver.server';

interface TestimonialsSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    subheading?: string;
    testimonials?: Array<{
      name: string;
      text: string;
      rating?: number;
      image?: string;
      role?: string;
    }>;
    layout?: 'grid' | 'slider';
  };
  context: RenderContext;
}

export default function TestimonialsSection({ sectionId, props, context }: TestimonialsSectionProps) {
  const {
    heading = 'What Our Customers Say',
    subheading,
    testimonials = [
      { name: 'John Doe', text: 'Great product! Highly recommended.', rating: 5 },
    ],
    layout = 'grid',
  } = props;

  const themeColors = context.theme;

  if (testimonials.length === 0) return null;

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 
            className="text-2xl md:text-3xl font-bold"
            style={{ 
              color: themeColors.textColor,
              fontFamily: themeColors.headingFont,
            }}
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-2 text-gray-600">{subheading}</p>
          )}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <Quote className="w-8 h-8 text-gray-200 mb-4" />
              
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              
              {testimonial.rating && (
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= testimonial.rating! 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: themeColors.accentColor }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p 
                    className="font-medium"
                    style={{ color: themeColors.textColor }}
                  >
                    {testimonial.name}
                  </p>
                  {testimonial.role && (
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
