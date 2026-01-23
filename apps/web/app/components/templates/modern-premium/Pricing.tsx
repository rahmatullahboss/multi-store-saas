import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Tag } from 'lucide-react';

export function ModernPremiumPricing({
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
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
           
           <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
              
              {/* Left Content */}
              <div className="lg:w-1/2">
                <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5 backdrop-blur-sm">
                  Limited Time Offer
                </span>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 leading-none">
                  GET IT BEFORE IT'S GONE.
                </h2>
                <div className="flex flex-wrap gap-4">
                  {config.pricingData.features.map((feature, i) => (
                    <span key={i} className="px-4 py-2 bg-zinc-900 rounded-lg text-sm font-bold border border-white/10">
                      /{feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Card */}
              <div className="lg:w-1/2 w-full">
                 <div className="bg-white text-black p-10 rounded-[3rem] relative shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <div className="absolute top-8 right-8 bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide -rotate-2">
                       Best Value
                    </div>

                    <div className="mb-8">
                       <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Total Price</p>
                       <div className="flex items-baseline gap-4">
                          <span className="text-6xl font-black tracking-tighter">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                             <span className="text-xl text-gray-400 line-through font-medium decoration-2">
                               {formatPrice(product.compareAtPrice)}
                             </span>
                          )}
                       </div>
                    </div>

                    <a 
                      href="#order-form"
                      className="block w-full bg-black hover:bg-zinc-800 text-white font-black text-xl py-6 rounded-2xl text-center uppercase tracking-wider transition-colors"
                    >
                      Order Now
                    </a>
                    
                    <p className="text-center mt-4 text-xs font-medium text-gray-500">
                      Free shipping included. No hidden fees.
                    </p>
                 </div>
              </div>

           </div>

        </div>
      </section>
    </MagicSectionWrapper>
  );
}
