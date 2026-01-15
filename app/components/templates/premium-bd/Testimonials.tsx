import { MagicSectionWrapper } from '~/components/editor';
import { Star } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function PremiumBDTestimonials({
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
      <section className={`py-16 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-950 mb-2">সন্তুষ্ট গ্রাহকদের মতামত</h2>
            <div className="h-1.5 w-20 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative group"
              >
                <div className="flex gap-1 mb-4 text-orange-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-700 text-lg font-bold leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-gray-950 font-black">{testimonial.name}</h4>
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Verified Purchase</p>
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
