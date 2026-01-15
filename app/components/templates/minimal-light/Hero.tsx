import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function MinimalLightHero({
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
      <header className="relative bg-[#FAFAFA] min-h-[90vh] flex items-center pt-24 pb-16 px-4">
        {/* Subtle Background Text */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-[30vw] font-black tracking-tighter uppercase whitespace-nowrap">
            {product.title}
          </span>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Product Image with Minimal Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-square flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-50" />
              <div className="relative z-10 w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100">
                {product.imageUrl && (
                  <OptimizedImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                )}
              </div>
              
              {/* Minimal Price Tag */}
              <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 flex flex-col items-center">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{config.heroPriceLabel || 'Price'}</span>
                <span className="text-2xl font-bold text-zinc-900">{formatPrice(product.price)}</span>
              </div>
            </motion.div>

            {/* Right: Clean Typography */}
            <div className="space-y-10 group">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 text-zinc-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase">{config.heroBadgeText || 'Verified Quality'}</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-medium text-zinc-900 leading-[1.1] tracking-tight">
                  {config.headline}
                </h1>
                <p className="text-zinc-500 text-lg lg:text-xl font-light leading-relaxed max-w-xl">
                  {config.subheadline}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                <a
                  href="#order-form"
                  className="w-full sm:w-auto px-10 py-5 bg-zinc-900 text-white font-medium rounded-full text-lg transition-all hover:bg-zinc-800 active:scale-95 flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} />
                  {config.heroCtaText || 'Shop Now'}
                </a>
                <div className="flex items-center gap-3 py-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-zinc-400 text-sm font-medium">1.2k+ {config.socialProofTitle || 'Satisfied customers'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
