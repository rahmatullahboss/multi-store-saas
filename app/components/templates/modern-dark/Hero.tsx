import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Star } from 'lucide-react';
import { getButtonStyles } from '../_core/types';

export function ModernDarkHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
  theme,
}: SectionProps & { formatPrice: (price: number) => string }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <section className="container-store py-8 lg:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <MagicSectionWrapper
          sectionId="hero"
          sectionLabel="Headline & Subheadline"
          data={{ headline: config.headline, subheadline: config.subheadline }}
          onUpdate={(data) => onUpdate?.('hero', data)}
          isEditable={isEditMode}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {config.headline}
            </span>
          </h1>
          
          {config.subheadline && (
            <p className="text-lg md:text-xl text-gray-300 text-center mb-8 max-w-2xl mx-auto">
              {config.subheadline}
            </p>
          )}
        </MagicSectionWrapper>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Image */}
          <div className="relative">
            {discount > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                {discount}% {config.heroBadgeText || 'OFF!'}
              </div>
            )}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-700 shadow-2xl ring-4 ring-yellow-500/20">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-8xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">{product.title}</h2>
            
            {product.description && (
              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price Display */}
            <div className="flex items-center gap-4 py-4 border-y border-gray-700">
              <span className="text-4xl md:text-5xl font-extrabold text-emerald-400">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-2xl text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Social Proof */}
            {config.socialProof && (
              <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
                <span className="text-yellow-400">★★★★★</span>
                <span className="text-gray-300">
                  <strong className="text-white">{config.socialProof.count}+</strong> {config.socialProof.text}
                </span>
              </div>
            )}

            {/* Features */}
            {config.features && config.features.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {config.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-gray-300">{feature.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Order Button Button */}
            <div className="hidden lg:block">
              <button
                onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-4 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98]"
                style={getButtonStyles(theme.primary)}
              >
                🛒 {config.ctaText || 'অর্ডার করুন'} - {formatPrice(product.price)}
              </button>
              {config.ctaSubtext && (
                <p className="text-center text-gray-400 text-sm mt-2">
                  ✓ {config.ctaSubtext}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
