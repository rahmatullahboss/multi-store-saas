import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Tag } from 'lucide-react';

export function FlashSalePricing({
  config,
  isEditMode,
  onUpdate,
  theme,
  formatPrice,
  product,
}: SectionProps) {
  if (!config.pricingData?.features) return null;

  // Calculate discount percentage
  const discount = product && product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <MagicSectionWrapper
      sectionId="pricing"
      sectionLabel="প্রাইসিং"
      data={{ pricingData: config.pricingData }}
      onUpdate={(data) => onUpdate?.('pricingData', data.pricingData)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 ${theme.bgPrimary}`}>
        <div className="max-w-md mx-auto px-4">
          <div className={`${theme.cardBg} rounded-3xl p-1 border-2 border-yellow-500 relative overflow-hidden`}>
            {/* Absolute Badge */}
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-4 py-1 rounded-bl-xl z-10">
              FLASH DEAL
            </div>

            <div className="bg-black/80 rounded-[22px] p-8 text-center relative">
              <h3 className={`text-xl font-bold ${theme.textSecondary} mb-4 uppercase tracking-widest`}>
                Regular Price
              </h3>
              
              <div className="flex flex-col items-center gap-2 mb-8">
                {product.compareAtPrice && (
                  <span className="text-2xl text-red-500 line-through font-bold decoration-2">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-5xl md:text-6xl font-black text-yellow-500">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse mt-2">
                    SAVE {discount}% TODAY
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-8 text-left">
                {config.pricingData.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#order-form"
                className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-xl uppercase tracking-wider transform hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                {config.ctaText || 'অর্ডার করুন'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
