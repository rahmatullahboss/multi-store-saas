import { motion } from 'framer-motion';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function LuxeHero({
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
      <header className="relative bg-[#050505] min-h-screen flex items-center justify-center overflow-hidden py-24 px-4 font-serif-display">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(180,140,80,0.15),transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-12 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 border border-amber-500/30 px-6 py-2 rounded-full bg-amber-950/20 backdrop-blur-sm"
              >
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-xs uppercase tracking-[0.3em] text-amber-200 font-sans">{config.heroBadgeText || 'Premiere Collection'}</span>
                <Star size={14} className="text-amber-500 fill-amber-500" />
              </motion.div>

              <div className="space-y-8">
                <h1 className="text-5xl lg:text-8xl leading-[1.05] text-white font-serif-display">
                  {config.headline.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 === 1 ? 'block italic text-amber-200 lg:ml-20 font-light' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                
                <p className="font-sans text-zinc-400 text-lg lg:text-xl max-w-xl leading-relaxed font-light">
                  {config.subheadline}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10 pt-4 font-sans">
                <a
                  href="#order-form"
                  className="group relative w-full sm:w-auto px-12 py-5 bg-amber-500 text-black font-black uppercase tracking-widest text-sm transition-all hover:bg-amber-400 active:scale-95 flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(180,140,80,0.3)]"
                >
                  {config.ctaText || 'Order Now'}
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </a>
                
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-amber-200/40 text-xs uppercase tracking-widest mb-1">{config.heroPriceLabel || 'Price'}</span>
                  <span className="text-3xl font-light text-white tracking-wider">{formatPrice(product.price)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-white/5 font-sans">
                {config.heroFeatures && config.heroFeatures.length > 0 ? (
                  config.heroFeatures.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest">
                      <Star size={16} className="text-amber-500/50" />
                      {feature.text}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest">
                      <ShieldCheck size={16} className="text-amber-500/50" />
                      Authenticity Guaranteed
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest">
                      <Star size={16} className="text-amber-500/50" />
                      Premium Packaging
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Imaginary Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -inset-10 bg-amber-500/5 blur-3xl rounded-full" />
              <div className="relative aspect-[4/5] border border-white/10 p-4 bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-10" />
                {product.imageUrl && (
                  <OptimizedImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" />
                )}
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
                    <p className="text-white text-sm font-light leading-relaxed font-sans">{product.title}</p>
                    <div className="mt-4 flex justify-between items-end">
                      <span className="text-amber-200 text-xs font-sans tracking-widest uppercase">Limited Edition</span>
                      <span className="text-xl text-white font-light">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
