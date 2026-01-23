import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { getButtonStyles, type SectionProps } from '../_core/types';

export function ShowcaseHero({
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
      <header className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0%,transparent_50%)] z-0" />
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-20 blur-sm scale-105"
            />
          )}
        </div>

        <div className="relative z-20 container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 border border-rose-500/30 rounded-full px-4 py-1 mb-8 bg-rose-950/30 backdrop-blur-md">
              <Star size={12} className="text-rose-400 fill-rose-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-rose-200">{config.heroBadgeText || 'New Arrival'}</span>
              <Star size={12} className="text-rose-400 fill-rose-400" />
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-rose-50 to-rose-200 drop-shadow-2xl">
              {config.headline}
            </h1>
            
            <p className="font-body text-zinc-400 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              {config.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <a 
                href="#order-form"
                className="w-full sm:w-auto px-8 py-4 text-white font-bold tracking-widest uppercase text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3 hover:opacity-90"
                style={getButtonStyles(config.primaryColor || '#e11d48')}
              >
                <span>{config.heroCtaText || 'Order Now'}</span>
                <ArrowRight size={16} />
              </a>
              <span className="text-lg font-heading text-rose-400">
                {formatPrice(product.price)}
              </span>
            </div>
          </motion.div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
