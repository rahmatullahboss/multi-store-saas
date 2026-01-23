import { MagicSectionWrapper } from '~/components/editor';
import { Star } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function VideoFocusTestimonials({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="রিভিউ"
      data={{ testimonials: config.testimonials }}
      onUpdate={(data) => onUpdate?.('testimonials', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-black`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white italic">WATCHER REVIEWS</h2>
            <div className="h-px flex-1 bg-red-600/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-[#0A0A0A] p-10 rounded-[2rem] border border-white/5 relative group"
              >
                <div className="flex gap-1 mb-6 text-red-600">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-white text-lg font-bold leading-relaxed mb-10">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-xl">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-black">{testimonial.name}</h4>
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Verified Reviewer</p>
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
