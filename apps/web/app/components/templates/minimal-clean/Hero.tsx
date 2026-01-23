/**
 * Minimal Clean Hero - Apple-like Simplicity
 * 
 * UNIQUE STRUCTURE:
 * - Massive centered headline
 * - Single product image, no clutter
 * - Minimal text
 * - One focused CTA
 * - Lots of whitespace
 */

import { ArrowRight } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function MinimalCleanHero({
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
      <section className="bg-white min-h-screen flex flex-col justify-center py-20">
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Minimal badge */}
          {config.heroBadgeText && (
            <p className="text-center text-gray-400 text-sm tracking-[0.3em] uppercase mb-8">
              {config.heroBadgeText}
            </p>
          )}

          {/* MASSIVE Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center text-black leading-[1.1] tracking-tight mb-8">
            {config.headline}
          </h1>

          {/* Minimal subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 text-center max-w-2xl mx-auto mb-16 font-light">
            {config.subheadline}
          </p>

          {/* Clean Product Image */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-w-md w-full aspect-square object-contain"
                />
              ) : (
                <div className="w-80 h-80 bg-gray-100 rounded-3xl" />
              )}
              
              {/* Minimal discount badge */}
              {discount > 0 && (
                <div className="absolute -top-4 -right-4 bg-black text-white w-20 h-20 rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{discount}%</span>
                  <span className="text-[10px] uppercase tracking-wider">off</span>
                </div>
              )}
            </div>
          </div>

          {/* Price - Clean and simple */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6">
              <span className="text-5xl md:text-6xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-2xl text-gray-300 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {config.heroPriceLabel && (
              <p className="text-gray-400 mt-2">{config.heroPriceLabel}</p>
            )}
          </div>

          {/* Single focused CTA */}
          <div className="flex justify-center">
            <a
              href="#order-form"
              className="group inline-flex items-center gap-4 bg-black hover:bg-gray-900 text-white px-12 py-5 rounded-full font-medium text-xl transition-all hover:shadow-2xl active:scale-[0.98]"
            >
              {config.heroCtaText || 'অর্ডার করুন'}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Minimal trust line */}
          <p className="text-center text-gray-300 text-sm mt-8 tracking-wide">
            ফ্রি শিপিং • ক্যাশ অন ডেলিভারি • ৭ দিন রিটার্ন
          </p>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
