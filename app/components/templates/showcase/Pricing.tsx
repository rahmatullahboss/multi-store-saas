import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Star } from 'lucide-react';

export function ShowcasePricing({
  config,
  isEditMode,
  onUpdate,
  theme,
  formatPrice,
  product,
}: SectionProps) {
  if (!config.pricingData?.features) return null;

  return (
    <MagicSectionWrapper
      sectionId="pricing"
      sectionLabel="Pricing"
      data={{ pricingData: config.pricingData }}
      onUpdate={(data) => onUpdate?.('pricingData', data.pricingData)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden group">
             
             {/* Radial Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-rose-500/20">
                <Star size={12} fill="currentColor" />
                Limited Offer
              </div>

              <div className="mb-10">
                <div className="flex items-center justify-center gap-4">
                   {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-2xl text-zinc-600 line-through font-medium">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                  <span className="text-6xl font-bold text-white tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mt-4 font-medium">One-time payment, lifetime access</p>
              </div>

              <div className="space-y-4 mb-10 text-left bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                {config.pricingData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    <span className="text-gray-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#order-form"
                className="block w-full bg-white hover:bg-gray-200 text-black font-bold py-5 rounded-xl text-center transition-all transform hover:scale-[1.02]"
              >
                Get Yours Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
