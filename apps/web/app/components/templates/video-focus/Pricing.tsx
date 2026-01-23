import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Play } from 'lucide-react';

export function VideoFocusPricing({
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
          <div className="max-w-md mx-auto relative">
             <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full opacity-20" />

            <div className="relative bg-black rounded-2xl p-8 border border-white/10 overflow-hidden">
               {/* Accent Bar */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600" />

              <div className="text-center mb-8 pt-4">
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Best Value</span>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="text-5xl font-bold text-white tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {config.pricingData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-red-500">
                      <Play size={12} fill="currentColor" />
                    </span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#order-form"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-center transition-all uppercase tracking-wider text-sm"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
