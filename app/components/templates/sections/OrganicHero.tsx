import { motion } from 'framer-motion';
import { Leaf, Check, ShoppingBag } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function OrganicHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps & { formatPrice: (price: number) => string }) {
  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      <header className="relative bg-[#fdfcf8] py-16 lg:py-32 px-4 overflow-hidden">
        {/* Organic Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        {/* Falling Leaves Decoration (Slightly randomized icons) */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Leaf className="absolute top-10 left-[10%] rotate-45 text-green-800" size={40} />
          <Leaf className="absolute bottom-20 right-[15%] -rotate-12 text-green-800" size={60} />
          <Leaf className="absolute top-40 right-[10%] rotate-180 text-green-800" size={30} />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Store Badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-green-800 text-green-50 px-5 py-2 rounded-full mb-10 text-sm font-medium tracking-wide shadow-sm"
            >
              <Leaf size={14} fill="currentColor" />
              100% ন্যাচারাল এবং অর্গানিক
            </motion.div>

            <h1 className="text-4xl lg:text-7xl font-bold text-green-950 mb-8 leading-[1.2] max-w-4xl tracking-tight">
              {config.headline}
            </h1>

            <p className="text-green-800/70 text-lg lg:text-xl max-w-2xl mb-12 leading-relaxed">
              {config.subheadline}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Product Card Styled Image */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative group lg:order-1 order-2"
              >
                <div className="absolute inset-0 bg-green-800/5 rounded-[4rem] rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                <div className="relative bg-white p-4 rounded-[4rem] shadow-2xl shadow-green-900/10 border border-green-50 overflow-hidden">
                  <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden">
                    {product.imageUrl && (
                      <OptimizedImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Action Column */}
              <div className="text-left space-y-8 lg:order-2 order-1">
                <div className="space-y-4">
                  {['প্রাকৃতিক উপাদানে তৈরি', 'কোনো পার্শ্বপ্রতিক্রিয়া নেই', 'দ্রুত হোম ডেলিভারি'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-green-900 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-green-100 shadow-xl shadow-green-900/5">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl lg:text-5xl font-black text-green-900 leading-none">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <div className="flex flex-col">
                        <span className="text-lg text-red-500 line-through font-bold leading-none">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                        <span className="text-xs text-green-600 font-bold uppercase mt-1">Special Deal</span>
                      </div>
                    )}
                  </div>

                  <a
                    href="#order-form"
                    className="flex items-center justify-center gap-3 w-full py-5 bg-green-800 text-white font-bold text-xl rounded-2xl transition-all hover:bg-green-700 hover:shadow-2xl hover:shadow-green-900/20 active:scale-95 shadow-xl shadow-green-900/10"
                  >
                    <ShoppingBag size={22} />
                    অর্ডার করতে ক্লিক করুন
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
