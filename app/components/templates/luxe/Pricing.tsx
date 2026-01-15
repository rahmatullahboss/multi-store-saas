import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxePricing({
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
      <section className="py-24 bg-zinc-900 border-t border-amber-500/20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-black border border-amber-500/30 p-12 text-center relative group">
             {/* Hover Glow */}
             <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <span className="inline-block text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-8 border border-amber-500/30 px-4 py-2">
              Exclusive Offer
            </span>

            <div className="flex flex-col items-center mb-10">
               {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-zinc-600 line-through font-serif mb-2">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="text-5xl font-serif-display text-white tracking-wide">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="space-y-4 mb-12">
              {config.pricingData.features.map((feature, i) => (
                <div key={i} className="flex flex-col items-center">
                   <span className="w-1 h-1 bg-amber-500 rounded-full mb-2" />
                   <span className="text-zinc-400 font-light tracking-wide text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <a 
              href="#order-form"
              className="block w-full bg-amber-600 hover:bg-amber-500 text-black font-serif-display uppercase tracking-widest py-4 transition-colors duration-300"
            >
              Purchase Now
            </a>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
