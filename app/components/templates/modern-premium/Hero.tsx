import { motion } from 'framer-motion';
import { Box, Zap, Shield, Sparkles } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function ModernPremiumHero({
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
      <header className="relative bg-[#080808] py-20 lg:py-32 px-4 overflow-hidden">
        {/* Neon Glow Dots */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_10px_#3b82f6]" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-500 rounded-full blur-[2px] shadow-[0_0_10px_#a855f7]" />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-emerald-500 rounded-full blur-[2px] shadow-[0_0_10px_#10b981]" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Headline and Bento Cards */}
            <div className="flex-1 space-y-12">
              <div className="space-y-6 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-widest"
                >
                  <Sparkles size={14} className="text-blue-500" />
                  Premium Edition
                </motion.div>
                <h1 className="text-5xl lg:text-8xl font-black text-white leading-[1.05] tracking-tighter">
                  {config.headline}
                </h1>
                <p className="text-zinc-500 text-lg lg:text-xl max-w-xl leading-relaxed">
                  {config.subheadline}
                </p>
              </div>

              {/* Mini Bento Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-blue-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Zap size={20} />
                  </div>
                  <p className="text-white font-bold text-sm">Ultra Fast</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-3 hover:border-emerald-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Shield size={20} />
                  </div>
                  <p className="text-white font-bold text-sm">Secure</p>
                </div>
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-violet-600 to-purple-700 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-purple-500/20">
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Special Price</p>
                  <p className="text-white font-black text-2xl mt-4">{formatPrice(product.price)}</p>
                </div>
              </div>
            </div>

            {/* Right: Floating Display */}
            <motion.div
              initial={{ rotateY: 20, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex-1 relative group perspective-1000"
            >
              <div className="relative z-10 bg-zinc-900 border border-white/5 p-4 rounded-[4rem] shadow-2xl transition-all duration-700 group-hover:shadow-[0_0_100px_rgba(59,130,246,0.1)]">
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  {product.imageUrl && (
                    <OptimizedImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  )}
                  {/* Floating Elements on Image */}
                  <div className="absolute top-8 right-8 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-white text-xs font-bold uppercase tracking-widest">In Stock</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual Glass Sidebar Effect */}
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-16 h-40 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center justify-around py-4 hidden lg:flex">
                  <Box size={24} className="text-zinc-500" />
                  <div className="w-8 h-px bg-white/10" />
                  <Sparkles size={24} className="text-blue-500" />
                </div>
              </div>
              
              <div className="mt-12 text-center lg:text-left">
                <a
                  href="#order-form"
                  className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black text-xl rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
                >
                  Confirm Order
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Zap size={16} fill="currentColor" />
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
