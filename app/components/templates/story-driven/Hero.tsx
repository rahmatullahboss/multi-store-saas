/**
 * Story-Driven Hero - Emotional Problem→Solution Narrative
 * 
 * UNIQUE STRUCTURE:
 * - Full-width emotional headline
 * - Personal story intro
 * - "Before I found this..." narrative
 * - Handwritten-style accents
 * - Warm, inviting feel
 */

import { Heart, ArrowDown, Sparkles } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function StoryDrivenHero({
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
      {/* Warm cream background */}
      <section className="bg-gradient-to-b from-amber-50 via-orange-50 to-white min-h-screen relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-amber-200 opacity-50">
          <Sparkles size={80} />
        </div>
        <div className="absolute bottom-40 left-10 text-orange-200 opacity-50">
          <Heart size={60} />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          
          {/* Emotional opener - Personal story style */}
          <div className="text-center mb-12">
            <p className="text-amber-600 font-medium mb-4 tracking-wide uppercase text-sm">
              {config.heroBadgeText || 'আমার গল্প'}
            </p>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-amber-900 leading-tight mb-8">
              {config.headline}
            </h1>

            {/* Handwritten style underline */}
            <div className="flex justify-center mb-8">
              <svg width="200" height="20" viewBox="0 0 200 20" className="text-amber-400">
                <path
                  d="M2 10 Q50 2 100 10 T198 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-xl md:text-2xl text-amber-800/80 leading-relaxed max-w-3xl mx-auto font-medium">
              {config.subheadline}
            </p>
          </div>

          {/* Story intro box */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12 border-2 border-amber-100 relative">
            
            {/* Quote mark */}
            <div className="absolute -top-6 left-8 bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl font-serif">
              "
            </div>

            <div className="grid md:grid-cols-5 gap-8 items-center">
              {/* Story text */}
              <div className="md:col-span-3 space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  <span className="text-2xl font-bold text-amber-600">আপনি কি জানেন</span> আমি কতদিন এই সমস্যায় ভুগেছি? 
                  প্রতিদিন একই হতাশা, একই কষ্ট। মনে হতো কোনো সমাধান নেই...
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  কিন্তু তারপর আমি এই প্রোডাক্ট খুঁজে পেলাম। আর সত্যি বলতে, 
                  <span className="font-bold text-amber-700"> এটা আমার জীবন বদলে দিয়েছে।</span>
                </p>
                <p className="text-gray-500 italic">
                  — একজন সন্তুষ্ট গ্রাহকের অভিজ্ঞতা
                </p>
              </div>

              {/* Product preview */}
              <div className="md:col-span-2">
                <div className="relative">
                  {discount > 0 && (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                      {discount}%<br/>ছাড়
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6">
                    {product.imageUrl ? (
                      <OptimizedImage
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full aspect-square object-contain"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-amber-200 rounded-xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price & CTA - Warm style */}
          <div className="text-center">
            <div className="inline-block bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
              <p className="text-amber-600 font-medium mb-2">
                {config.heroPriceLabel || 'বিশেষ অফার মূল্য'}
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-5xl font-black text-amber-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              
              <a
                href="#order-form"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-4 rounded-full font-bold text-xl transition-all hover:shadow-xl hover:shadow-amber-200 active:scale-[0.98]"
              >
                <Heart className="fill-white" />
                {config.heroCtaText || 'আমিও চেষ্টা করতে চাই'}
              </a>

              <p className="text-gray-500 text-sm mt-4">
                ১০০% সন্তুষ্টি গ্যারান্টি • ক্যাশ অন ডেলিভারি
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="text-center mt-12 animate-bounce">
            <p className="text-amber-600 text-sm mb-2">আমার সম্পূর্ণ গল্প পড়ুন</p>
            <ArrowDown className="mx-auto text-amber-400" />
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
