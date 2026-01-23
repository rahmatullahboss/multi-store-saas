import { MagicSectionWrapper } from '~/components/editor';
import { Quote } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function ShowcaseTestimonials({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="Customer Reviews"
      data={{ testimonials: config.testimonials }}
      onUpdate={(data) => onUpdate?.('testimonials', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-black relative`}>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-white text-center mb-16 tracking-tighter">
            User <span className="text-rose-500">Insights</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-zinc-900/30 backdrop-blur-xl p-10 rounded-[2rem] border border-white/5 relative group hover:bg-zinc-900/50 transition-all duration-500"
              >
                <Quote size={40} className="text-rose-500/10 absolute top-8 right-8" />
                
                <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-10 italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-xl">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-1">Verified Member</p>
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
