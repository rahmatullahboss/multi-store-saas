import { MagicSectionWrapper } from '~/components/editor';
import { Star } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function ModernDarkTestimonials({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="Testimonials"
      data={{ testimonials: config.testimonials }}
      onUpdate={(data) => onUpdate?.('testimonials', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-zinc-900`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase">User Stories</h2>
            <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 hover:border-orange-500/30 transition-all group"
              >
                <div className="flex gap-1 mb-6 text-orange-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-zinc-300 text-lg font-medium leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-orange-500/60 text-xs font-bold uppercase tracking-widest">Verified Customer</p>
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
