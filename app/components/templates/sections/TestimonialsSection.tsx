import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function TestimonialsSection({
  config,
  isEditMode,
  onUpdate,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        testimonials: '⭐ সন্তুষ্ট গ্রাহকদের রিভিউ',
      },
      en: {
        testimonials: '⭐ Customer Testimonials',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.testimonials || config.testimonials.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="Customer Testimonials"
      data={config.testimonials}
      onUpdate={(newData) => onUpdate?.('testimonials', newData)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-gray-50 px-4">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-10">
          {t('testimonials')}
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide md:justify-center">
          {config.testimonials.map((testimonial, idx) => (
            <div key={idx} className="flex-shrink-0 w-64 md:w-80 snap-center">
              {(testimonial.imageUrl || testimonial.avatar) && (
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:scale-[1.02] transition-transform">
                  <img 
                    src={testimonial.imageUrl || testimonial.avatar} 
                    alt={`Review ${idx + 1}`} 
                    className="w-full aspect-[2/3] object-cover"
                  />
                  {testimonial.text && (
                    <div className="p-4 border-t border-gray-50">
                      <p className="text-gray-600 text-sm italic">"{testimonial.text}"</p>
                      <p className="text-gray-900 font-bold mt-2">- {testimonial.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
