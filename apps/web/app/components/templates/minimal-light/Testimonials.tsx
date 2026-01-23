import { MagicSectionWrapper } from '~/components/editor';
import { Star } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function MinimalLightTestimonials({
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
      <section className={`py-24 bg-gray-50/50`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {config.testimonials.map((testimonial, i) => (
              <div key={i} className="relative">
                <div className="flex gap-1 mb-6 text-gray-900">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-900 text-xl font-medium leading-relaxed mb-8 tracking-tight">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="text-gray-400 font-bold text-sm tracking-widest uppercase italic">
                    — {testimonial.name}
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
