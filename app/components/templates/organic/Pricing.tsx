import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function OrganicPricing({
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
      <section className="py-20 bg-green-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto relative group">
             {/* Natural Shape Background */}
             <div className="absolute -inset-4 bg-gradient-to-tr from-green-200 to-lime-100 rounded-[3rem] opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white rounded-[2.5rem] p-10 shadow-xl shadow-green-900/5">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-16 h-16 bg-red-500 text-white rounded-full flex flex-col items-center justify-center -rotate-12 shadow-lg shadow-red-200">
                    <span className="text-[10px] font-bold uppercase">Save</span>
                    <span className="text-lg font-black leading-none py-0.5">20%</span>
                 </div>
              </div>

              <div className="mb-8">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Special Price</span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through font-medium">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-100 py-8 mb-4 space-y-4">
                {config.pricingData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                       <span className="text-green-600 text-[10px] font-bold">✓</span>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#order-form"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-1"
              >
                Order Natural
              </a>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
