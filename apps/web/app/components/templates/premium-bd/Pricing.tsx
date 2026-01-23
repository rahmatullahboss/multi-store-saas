import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Tag } from 'lucide-react';

export function PremiumBDPricing({
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
      sectionLabel="অফার মূল্য"
      data={{ pricingData: config.pricingData }}
      onUpdate={(data) => onUpdate?.('pricingData', data.pricingData)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-100 overflow-hidden relative">
             
             {/* Badge */}
             <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-md">
               Hot Deal 🔥
             </div>

            <div className="p-8 text-center bg-gradient-to-b from-orange-50 to-white">
              <h3 className="text-lg font-bold text-gray-600 mb-4 uppercase tracking-wider">
                Special Offer Price
              </h3>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-black text-orange-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="flex flex-col items-start">
                    <span className="text-xl text-gray-400 line-through font-medium Decoration-2 decoration-red-400">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      SAVE MONEY
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-0">
              <div className="space-y-3 mb-8 bg-gray-50 p-6 rounded-2xl">
                {config.pricingData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#order-form"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-4 rounded-xl text-center shadow-lg shadow-orange-200 transition-all hover:-translate-y-1"
              >
                এখনই অর্ডার করুন
              </a>
              <p className="text-center text-gray-400 text-xs mt-4">
                স্টক সীমিত! দ্রুত অর্ডার করুন।
              </p>
            </div>

          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
