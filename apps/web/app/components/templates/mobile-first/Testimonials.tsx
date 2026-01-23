import { MagicSectionWrapper } from '~/components/editor';
import { Star } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function MobileFirstTestimonials({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="কাস্টমার রিভিউ"
      data={{ testimonials: config.testimonials }}
      onUpdate={(data) => onUpdate?.('testimonials', data)}
      isEditable={isEditMode}
    >
      <section className={`py-12 bg-gray-50`}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-950 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-indigo-600 rounded-full" />
            সন্তুষ্ট গ্রাহকদের কথা
          </h2>

          <div className="space-y-4">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm"
              >
                <div className="flex gap-1 mb-3 text-indigo-600">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-800 text-base font-bold leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-gray-950 font-bold text-sm">{testimonial.name}</h4>
                    <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest">Verified User</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
