import { Star } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleTestimonials({
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
      <section className={`py-16 md:py-24 ${theme.bgPrimary}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} text-center mb-4 uppercase italic tracking-tighter`}>
            ⭐ কাস্টমার রিভিউ
          </h2>
          <p className={`${theme.textSecondary} text-center mb-12`}>
            হাজারো সন্তুষ্ট গ্রাহকদের মতামত
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={`${theme.cardBg} p-6 rounded-2xl border ${theme.cardBorder} relative group shadow-sm`}
              >
                {/* Verified Badge */}
                <div className="absolute -top-3 right-4 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold">
                  ✓ Verified
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className={`${theme.textPrimary} text-lg leading-relaxed mb-6 italic`}>
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl uppercase">
                    {testimonial.name?.[0]}
                  </div>
                  <div>
                    <h4 className={`font-bold ${theme.textPrimary}`}>{testimonial.name}</h4>
                    <p className={`${theme.textSecondary} text-xs font-bold`}>Verified Buyer</p>
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
