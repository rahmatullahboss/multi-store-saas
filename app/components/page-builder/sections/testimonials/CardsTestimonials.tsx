/**
 * Cards Testimonials
 * Clean card grid with shadows
 */

import type { Testimonial } from './types';

interface CardsTestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export function CardsTestimonials({ title, testimonials }: CardsTestimonialsProps) {
  return (
    <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
            {title}
          </h2>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow"
            >
              {/* Rating */}
              {t.rating && (
                <p className="text-yellow-400 mb-4">{'⭐'.repeat(t.rating)}</p>
              )}
              
              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
              
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  {t.avatar || t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  {t.location && (
                    <p className="text-sm text-gray-500">📍 {t.location}</p>
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
