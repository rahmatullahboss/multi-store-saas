import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MinimalLightPricing({
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                Regular Offer
              </span>
              
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through decoration-gray-300">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {config.pricingData.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-gray-900 mt-1">•</span>
                  <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <a 
              href="#order-form"
              className="block w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl text-center transition-all transform hover:-translate-y-0.5"
            >
              Order Now
            </a>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
