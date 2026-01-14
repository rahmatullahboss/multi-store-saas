import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ChevronUp, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function MobileFirstHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps & { formatPrice: (price: number) => string }) {
  const [isDescOpen, setIsDescOpen] = useState(true);
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="md:max-w-6xl md:mx-auto md:px-6 md:py-8">
      <div className="md:flex md:gap-8 md:items-start">
        {/* Product Image - Full width mobile, half width desktop */}
        <section className="relative w-full md:w-1/2 aspect-square bg-gray-50 overflow-hidden md:rounded-2xl md:shadow-lg md:sticky md:top-8">
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              -{discount}% OFF
            </div>
          )}
          
          <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            <div className="w-full h-full flex-shrink-0 snap-center">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-300">
                  <ShoppingCart size={64} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Product Details - Desktop Right Column */}
        <div className="md:w-1/2 px-5 pt-6 md:px-0 md:pt-0">
          {/* HEADLINE & PRICE */}
          <MagicSectionWrapper
            sectionId="hero"
            sectionLabel="Headline & Price"
            data={{ headline: config.headline, subheadline: config.subheadline }}
            onUpdate={(data) => onUpdate?.('hero', data)}
            isEditable={isEditMode}
          >
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {config.headline}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl md:text-4xl font-extrabold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span>4.9/5 রেটিং</span>
                <span className="text-gray-300">|</span>
                <span className="text-green-600">ইন স্টক</span>
              </div>
            </div>
          </MagicSectionWrapper>

          {/* PRODUCT DESCRIPTION ACCORDION */}
          <section className="mb-8 border-t border-b border-gray-100 py-4">
            <button 
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="w-full flex items-center justify-between text-lg font-bold text-gray-900 mb-2"
            >
              <span>পণ্যের বিবরণ</span>
              {isDescOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            <AnimatePresence>
              {isDescOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="text-base text-gray-600 leading-relaxed space-y-3 pb-2">
                    {config.subheadline && <p>{config.subheadline}</p>}
                    <p>{product.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* TRUST BADGES (Compact) */}
          <section className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Truck className="text-emerald-600 shrink-0" size={20} />
              <div className="text-xs">
                <p className="font-bold text-gray-800">দ্রুত ডেলিভারি</p>
                <p className="text-gray-500">২-৩ দিন</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
              <div className="text-xs">
                <p className="font-bold text-gray-800">গ্যারান্টিযুক্ত</p>
                <p className="text-gray-500">১০০% আসল</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
