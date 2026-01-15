import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernDarkPricing({
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
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative bg-zinc-900 rounded-[2rem] p-10 border border-zinc-800">
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-orange-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Limited Offer
                  </span>
                </div>

                <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-[0.2em] mb-8">
                  Premium Package
                </h3>

                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-2xl text-zinc-600 line-through font-medium">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-10">
                  {config.pricingData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <span className="text-orange-500 text-xs">✓</span>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href="#order-form"
                  className="block w-full bg-white hover:bg-zinc-200 text-black font-black py-5 rounded-xl text-center uppercase tracking-widest transition-colors"
                >
                  {config.ctaText || 'Get It Now'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
