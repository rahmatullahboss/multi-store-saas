import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function TestimonialsSection({
  config,
  isEditMode,
  onUpdate,
  theme,
  lang = 'bn',
  templateId,
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

  const renderLayout = () => {
    switch (templateId) {
      case 'modern-dark':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className={`${theme.cardBg} rounded-3xl p-8 border ${theme.cardBorder} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="text-6xl font-serif">"</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-orange-500 p-1 mb-4 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    <img 
                      src={testimonial.imageUrl || testimonial.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} 
                      className="w-full h-full rounded-full object-cover"
                      alt={testimonial.name}
                    />
                  </div>
                  <p className={`${theme.textPrimary} text-lg font-medium leading-relaxed mb-4 italic`}>
                    "{testimonial.text}"
                  </p>
                  <h4 className={`${theme.textPrimary} font-bold uppercase tracking-widest text-sm`}>
                    {testimonial.name}
                  </h4>
                  <div className="flex gap-1 mt-2 text-orange-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'showcase':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="flex flex-col items-start border-l-2 border-rose-500 pl-8 transition-all hover:border-l-8 hover:bg-rose-500/5 py-4">
                <p className={`${theme.textPrimary} text-2xl md:text-3xl font-light italic leading-snug mb-8`}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center text-rose-500 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`${theme.textPrimary} font-bold text-lg leading-none`}>{testimonial.name}</h4>
                    <p className={`${theme.textSecondary} text-xs uppercase tracking-widest mt-1`}>Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'flash-sale':
        return (
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="flex-shrink-0 w-80 snap-center bg-white rounded-2xl p-6 shadow-xl border-b-4 border-yellow-500">
                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-800 font-bold text-base leading-tight mb-4 lowercase first-letter:uppercase">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-900 font-black text-sm uppercase">{testimonial.name}</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    ✓ VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'organic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 p-1 border-2 border-emerald-200">
                   <img 
                    src={testimonial.imageUrl || testimonial.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} 
                    className="w-full h-full rounded-full object-cover"
                    alt={testimonial.name}
                  />
                </div>
                <p className="text-emerald-950 font-medium italic mb-6">"{testimonial.text}"</p>
                <h4 className="text-emerald-900 font-black uppercase tracking-widest text-sm">{testimonial.name}</h4>
              </div>
            ))}
          </div>
        );

      case 'luxury':
        return (
          <div className="max-w-4xl mx-auto space-y-20">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="text-center space-y-8">
                <div className="text-amber-500 text-4xl font-serif-display opacity-40">“</div>
                <p className="text-2xl md:text-4xl font-serif-display text-zinc-100 italic leading-snug">
                  {testimonial.text}
                </p>
                <div className="space-y-2">
                  <h4 className="text-amber-200 font-sans tracking-[0.3em] uppercase text-xs">{testimonial.name}</h4>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Verified Collector</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'premium-bd':
      case 'mobile-first':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex gap-4 items-start">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-blue-50">
                  <img 
                    src={testimonial.imageUrl || testimonial.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} 
                    className="w-full h-full object-cover"
                    alt={testimonial.name}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-slate-800 font-bold text-sm leading-snug">"{testimonial.text}"</p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-black text-xs">{testimonial.name}</span>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">✓ ভেরিফাইড রিভিউ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'modern-premium':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl -translate-y-12 translate-x-12 group-hover:bg-blue-500/20 transition-all" />
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 p-0.5">
                       <img 
                        src={testimonial.imageUrl || testimonial.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} 
                        className="w-full h-full rounded-2xl object-cover"
                        alt={testimonial.name}
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm tracking-tight">{testimonial.name}</h4>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Verified Partner</p>
                    </div>
                  </div>
                  <p className="text-white font-medium text-lg leading-relaxed relative">
                    <span className="text-blue-500 text-4xl absolute -top-4 -left-2 opacity-20">"</span>
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide md:justify-center">
            {config.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="flex-shrink-0 w-64 md:w-80 snap-center">
                <div className={`${theme.cardBg} rounded-3xl overflow-hidden shadow-xl border ${theme.cardBorder} hover:scale-[1.02] transition-transform`}>
                  {(testimonial.imageUrl || testimonial.avatar) ? (
                    <img 
                      src={testimonial.imageUrl || testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-full aspect-[4/5] object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/5] bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div className="p-5">
                    <p className={`${theme.textSecondary} text-sm italic`}>"{testimonial.text}"</p>
                    <p className={`${theme.textPrimary} font-bold mt-3`}>- {testimonial.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <MagicSectionWrapper
      sectionId="testimonials"
      sectionLabel="Customer Testimonials"
      data={config.testimonials}
      onUpdate={(newData) => onUpdate?.('testimonials', newData)}
      isEditable={isEditMode}
    >
      <section className={`py-20 md:py-32 ${theme.bgPrimary} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className={`mb-16 ${templateId === 'showcase' ? 'text-left' : 'text-center'}`}>
            <h3 className={`text-3xl md:text-5xl font-black ${theme.textPrimary}`}>
              {t('testimonials')}
            </h3>
          </div>
          {renderLayout()}
        </div>
      </section>
    </MagicSectionWrapper>
  );
}

