import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxeTestimonials({
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
      <section className={`py-24 bg-[#050505] relative overflow-hidden`}>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-amber-500 text-xs uppercase tracking-[0.4em] mb-4 block">Patron Reviews</span>
            <h2 className="text-4xl md:text-5xl font-serif-display text-white tracking-wider uppercase">
              What They Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-zinc-900/40 backdrop-blur-md p-10 rounded-2xl border border-white/5 relative group hover:border-amber-500/30 transition-all duration-700"
              >
                <div className="absolute -top-4 -left-4 text-amber-500/10 text-8xl font-serif italic pointer-events-none">
                  “
                </div>
                
                <p className="text-zinc-400 text-lg font-light italic leading-relaxed mb-8 relative z-10">
                  {testimonial.text}
                </p>

                <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-serif-display text-xl">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-serif-display tracking-widest uppercase text-sm">{testimonial.name}</h4>
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
