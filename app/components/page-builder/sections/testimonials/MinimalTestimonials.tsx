/**
 * Minimal Testimonials
 * Clean, simple list style
 */

import type { Testimonial } from './types';

interface MinimalTestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export function MinimalTestimonials({ title, testimonials }: MinimalTestimonialsProps) {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            {title}
          </h2>
        )}
        
        <div className="space-y-8">
          {testimonials.map((t, i) => (
            <div key={i} className="text-center">
              {/* Quote */}
              <p className="text-xl md:text-2xl text-gray-700 mb-4 italic leading-relaxed">
                "{t.text}"
              </p>
              
              {/* Rating */}
              {t.rating && (
                <p className="text-yellow-400 mb-3">{'⭐'.repeat(t.rating)}</p>
              )}
              
              {/* Author */}
              <p className="font-semibold text-gray-900">
                — {t.name}{t.location && `, ${t.location}`}
              </p>
              
              {/* Divider */}
              {i < testimonials.length - 1 && (
                <div className="w-16 h-px bg-gray-200 mx-auto mt-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
