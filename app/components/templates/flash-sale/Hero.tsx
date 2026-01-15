import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      <header className="relative bg-red-600 py-12 lg:py-24 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="text-center lg:text-left text-white space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-black uppercase italic tracking-tighter"
              >
                <Zap size={18} fill="currentColor" />
                Flash Sale ends in 02:45:10
              </motion.div>

              <h1 className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                {config.headline}
              </h1>

              <p className="text-white/90 text-lg lg:text-2xl font-medium max-w-xl">
                {config.subheadline}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl lg:text-6xl font-black text-yellow-400">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xl lg:text-2xl text-white/50 line-through mb-2 font-bold">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-black uppercase mt-2 inline-block">
                      মহা ছাড়: {discount}% OFF
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="#order-form"
                  className="group relative inline-flex items-center gap-4 bg-white text-red-600 px-8 py-5 rounded-2xl font-black text-2xl uppercase italic tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.2)] lg:w-auto w-full justify-center"
                >
                  <ShoppingCart className="fill-current" />
                  এখনই অর্ডার করুন
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full animate-bounce">
                    LIMITED
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Image */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-2xl skew-y-3">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                )}
              </div>
              {/* Badge Decorations */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-yellow-400 text-black p-6 rounded-3xl shadow-2xl -rotate-12 border-4 border-white font-black text-2xl tracking-tighter uppercase italic leading-none text-center">
                গরম<br/>অফার
              </div>
            </motion.div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
