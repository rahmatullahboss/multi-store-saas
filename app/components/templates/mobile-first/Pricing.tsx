import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { ShoppingCart } from 'lucide-react';

export function MobileFirstPricing({
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
      <section className="py-12 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg shadow-indigo-100 border border-indigo-100 overflow-hidden sticky bottom-4 z-10 md:static">
             <div className="bg-indigo-600 text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
               Today Only
             </div>
             
             <div className="p-6 text-center">
                <div className="mb-4">
                   <span className="block text-gray-400 text-xs font-medium mb-1 line-through">
                      Regular Price: {product.compareAtPrice ? formatPrice(product.compareAtPrice) : ''}
                   </span>
                   <span className="block text-4xl font-extrabold text-indigo-600">
                      {formatPrice(product.price)}
                   </span>
                </div>

                <div className="space-y-2 mb-6">
                   {config.pricingData.features.slice(0, 3).map((feature, i) => (
                     <p key={i} className="text-gray-500 text-xs font-medium bg-gray-50 py-1 rounded-sm">
                       ✓ {feature}
                     </p>
                   ))}
                </div>

                <a 
                  href="#order-form"
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  <ShoppingCart size={18} />
                  অর্ডার করুন
                </a>
             </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
