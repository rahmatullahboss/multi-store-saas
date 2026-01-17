/**
 * Masonry Grid Testimonials
 * Pinterest-style staggered grid layout
 */

import type { Testimonial } from './types';

interface MasonryTestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export function MasonryTestimonials({ title, testimonials }: MasonryTestimonialsProps) {
  return (
    <section className="py-16 px-6" style={{ background: '#000' }}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h2>
        )}
        
        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t, i) => (
            <div 
              key={i}
              className="break-inside-avoid rounded-2xl p-6 backdrop-blur-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Rating */}
              {t.rating && (
                <p className="text-yellow-400 text-sm mb-3">{'⭐'.repeat(t.rating)}</p>
              )}
              
              {/* Quote */}
              <p className="text-gray-300 mb-4 leading-relaxed">"{t.text}"</p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  {t.location && (
                    <p className="text-gray-500 text-xs">{t.location}</p>
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
