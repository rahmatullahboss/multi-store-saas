/**
 * Trust-First Hero - Testimonial Focused Design
 * 
 * UNIQUE STRUCTURE:
 * - Top: Customer count + Rating bar
 * - Center: Product with floating review cards
 * - Side: Scrolling testimonial ticker
 * - Bottom: Before/After comparison teaser
 */

import { Star, Users, CheckCircle, Quote, ThumbsUp } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function TrustFirstHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Sample testimonials for floating cards
  const floatingReviews = [
    { name: 'রহিম আহমেদ', text: 'অসাধারণ পণ্য!', rating: 5 },
    { name: 'ফাতেমা বেগম', text: 'খুবই সন্তুষ্ট', rating: 5 },
    { name: 'করিম উদ্দিন', text: 'দ্রুত ডেলিভারি', rating: 5 },
  ];

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      {/* Trust Stats Bar */}
      <div className="bg-emerald-600 py-3">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 md:gap-12 text-white text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="font-bold">১৫,০০০+</span>
              <span className="hidden md:inline">সন্তুষ্ট গ্রাহক</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-bold">৪.৯/৫</span>
              <span className="hidden md:inline">রেটিং</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp size={18} />
              <span className="font-bold">৯৮%</span>
              <span className="hidden md:inline">পজিটিভ রিভিউ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 md:py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Badge */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle size={16} />
              {config.heroBadgeText || '১০০% অরিজিনাল প্রোডাক্ট'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-4 leading-tight">
            {config.headline}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mx-auto mb-10">
            {config.subheadline}
          </p>

          {/* Product + Floating Reviews Layout */}
          <div className="relative max-w-4xl mx-auto">
            
            {/* Floating Review Cards - Left */}
            <div className="hidden lg:block absolute -left-8 top-1/4 z-20 animate-float">
              <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[200px] border-l-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    র
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{floatingReviews[0].name}</div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">"{floatingReviews[0].text}"</p>
              </div>
            </div>

            {/* Floating Review Cards - Right */}
            <div className="hidden lg:block absolute -right-8 top-1/2 z-20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="bg-white rounded-2xl shadow-xl p-4 max-w-[200px] border-l-4 border-emerald-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    ফ
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{floatingReviews[1].name}</div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">"{floatingReviews[1].text}"</p>
              </div>
            </div>

            {/* Main Product Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative bg-gradient-to-br from-emerald-50 to-white p-8 flex items-center justify-center">
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discount}% ছাড়
                    </div>
                  )}
                  {product.imageUrl ? (
                    <OptimizedImage
                      src={product.imageUrl}
                      alt={product.title}
                      className="max-w-full max-h-80 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 rounded-2xl" />
                  )}
                </div>

                {/* Info */}
                <div className="p-8 flex flex-col justify-center">
                  {/* Mini testimonial quote */}
                  <div className="bg-emerald-50 rounded-xl p-4 mb-6 relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-emerald-300" />
                    <p className="text-gray-700 italic text-sm">
                      "এই প্রোডাক্ট আমার জীবন বদলে দিয়েছে। ১০০% রেকমেন্ড করি!"
                    </p>
                    <p className="text-emerald-600 font-semibold text-sm mt-2">— সাবরিনা আক্তার, ঢাকা</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-emerald-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xl text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    {config.heroPriceLabel && (
                      <p className="text-emerald-600 font-medium mt-1">{config.heroPriceLabel}</p>
                    )}
                  </div>

                  {/* Trust badges inline */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['✓ ফ্রি ডেলিভারি', '✓ ক্যাশ অন ডেলিভারি', '✓ ৭ দিন রিটার্ন'].map((badge, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href="#order-form"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg text-center transition-all hover:shadow-xl hover:shadow-emerald-200 active:scale-[0.98]"
                  >
                    {config.heroCtaText || 'এখনই অর্ডার করুন'}
                  </a>

                  {/* Micro-testimonial count */}
                  <p className="text-center text-gray-500 text-sm mt-4">
                    <span className="font-bold text-emerald-600">২,৩৪৭</span> জন গত মাসে অর্ডার করেছেন
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </MagicSectionWrapper>
  );
}
