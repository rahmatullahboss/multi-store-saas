/**
 * Chat Bubbles Testimonials
 * WhatsApp/Messenger style chat bubbles
 */

import type { Testimonial } from './types';

interface ChatBubblesTestimonialsProps {
  title: string;
  testimonials: Testimonial[];
}

export function ChatBubblesTestimonials({ title, testimonials }: ChatBubblesTestimonialsProps) {
  return (
    <section className="py-16 px-6" style={{ background: '#F0F2F5' }}>
      <div className="max-w-2xl mx-auto">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
            {title}
          </h2>
        )}
        
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${i % 2 === 0 ? 'order-2' : 'order-1'}`}>
                <div 
                  className={`rounded-2xl px-4 py-3 ${
                    i % 2 === 0 
                      ? 'bg-white rounded-tl-sm' 
                      : 'bg-[#0084FF] text-white rounded-tr-sm'
                  }`}
                  style={i % 2 === 0 ? { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } : {}}
                >
                  <p className="text-sm">{t.text}</p>
                  {t.rating && (
                    <p className={`text-xs mt-1 ${i % 2 === 0 ? 'text-yellow-500' : 'text-yellow-200'}`}>
                      {'⭐'.repeat(t.rating)}
                    </p>
                  )}
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${i % 2 === 0 ? 'text-left' : 'text-right'}`}>
                  {t.name} {t.location && `• ${t.location}`}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm mx-2 flex-shrink-0 ${i % 2 === 0 ? 'order-1' : 'order-2'}`}>
                {t.avatar || '👤'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
