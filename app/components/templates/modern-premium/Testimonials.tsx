import { MagicSectionWrapper } from '~/components/editor';
import { Star, Quote } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function ModernPremiumTestimonials({
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
      <section className={`py-24 bg-gray-950`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
              ELITE <br /><span className="text-gray-500">VOICES</span>
            </h2>
            <div className="h-px flex-1 bg-white/10 hidden md:block mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 relative group hover:border-white/20 transition-colors"
              >
                <Quote className="absolute top-10 right-10 text-white/10" size={48} />
                
                <div className="flex gap-1 mb-8 text-white">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-white text-2xl font-bold leading-[1.4] mb-12 tracking-tight italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg tracking-tight uppercase">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Verified Elite Member</p>
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
