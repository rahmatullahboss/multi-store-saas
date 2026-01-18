/**
 * Social Proof Testimonials
 * Facebook comment style with reactions
 */

import type { Testimonial } from './types';

interface SocialProofTestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export function SocialProofTestimonials({ title, testimonials }: SocialProofTestimonialsProps) {
  return (
    <section className="py-12 px-6" style={{ background: '#F0F2F5' }}>
      <div className="max-w-2xl mx-auto">
        {title && (
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            💬 {title}
          </h2>
        )}
        
        {/* Comments list */}
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {t.avatar || t.name.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                      {t.name}
                      {t.location && <span className="text-gray-500 font-normal">• {t.location}</span>}
                    </p>
                    <p className="text-gray-700 text-sm mt-1">{t.text}</p>
                  </div>
                  
                  {/* Reactions */}
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <button className="text-xs text-gray-500 hover:text-blue-500 font-semibold">Like</button>
                    <button className="text-xs text-gray-500 hover:text-blue-500 font-semibold">Reply</button>
                    {t.rating && (
                      <span className="text-xs text-yellow-500">{'⭐'.repeat(t.rating)}</span>
                    )}
                  </div>
                  
                  {/* Like count */}
                  <div className="flex items-center gap-1 mt-2 px-2">
                    <div className="flex -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">👍</span>
                      <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">❤️</span>
                    </div>
                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View more */}
        <button className="w-full mt-4 py-3 text-blue-600 font-semibold text-sm hover:bg-white rounded-lg transition-colors">
          আরো দেখুন...
        </button>
      </div>
    </section>
  );
}
