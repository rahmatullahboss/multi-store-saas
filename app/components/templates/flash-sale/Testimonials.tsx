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
                className={`${theme.cardBg} p-6 rounded-2xl border ${theme.cardBorder} relative group`}
              >
                {/* Verified Badge */}
                <div className="absolute -top-3 right-4 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold">
                  ✓ Verified
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className={`${theme.textPrimary} mb-6 text-lg italic`}>
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl font-bold text-yellow-400">
                    {testimonial.author?.[0] || 'U'}
                  </div>
                  <div>
                    <p className={`font-bold ${theme.textPrimary}`}>
                      {testimonial.author}
                    </p>
                    {testimonial.location && (
                      <p className={`text-sm ${theme.textSecondary}`}>
                        📍 {testimonial.location}
                      </p>
                    )}
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
