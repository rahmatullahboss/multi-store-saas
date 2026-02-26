/**
 * ProductGridSection — Product showcase grid for BD e-commerce
 * Client component for category filter tabs
 */

'use client';

import { useState } from 'react';
import { ProductGridPropsSchema, type ProductGridProps } from '~/lib/page-builder/schemas';

interface ProductGridSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'প্রিমিয়াম স্কিনকেয়ার ক্রিম', price: 890, compareAtPrice: 1290, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80', badge: 'বেস্ট সেলার' },
  { id: 2, name: 'হার্বাল ফেস ওয়াশ', price: 490, compareAtPrice: 690, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', badge: 'নতুন' },
  { id: 3, name: 'ভিটামিন সি সিরাম', price: 1190, compareAtPrice: 1690, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', badge: 'হট ডিল' },
  { id: 4, name: 'ময়েশ্চারাইজার লোশন', price: 650, compareAtPrice: 950, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80', badge: '' },
];

const DEFAULT_CATEGORIES = ['সব', 'স্কিনকেয়ার', 'হেয়ারকেয়ার', 'ব্যক্তিগত যত্ন'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductGridSection({ props, isPreview = false }: ProductGridSectionProps) {
  const p: ProductGridProps = ProductGridPropsSchema.parse(props);
  const [activeCategory, setActiveCategory] = useState(0);

  const products = p.products.length > 0 ? p.products : DEFAULT_PRODUCTS;

  const colsClass =
    p.columns === '2'
      ? 'grid-cols-2'
      : p.columns === '4'
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3';

  const aspectClass =
    p.imageAspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : p.imageAspectRatio === 'landscape'
        ? 'aspect-video'
        : 'aspect-square';

  const discountPct = (orig: number, sale: number) =>
    orig > sale ? Math.round(((orig - sale) / orig) * 100) : 0;

  return (
    <section
      data-section-type="product-grid"
      className="w-full py-14 sm:py-20"
      style={{ backgroundColor: p.bgColor }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
            🛍️ আমাদের পণ্য
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: p.textColor }}>
              {p.title}
            </h2>
          )}
          {p.subtitle && (
            <p className="mt-2 text-gray-500">{p.subtitle}</p>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {DEFAULT_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveCategory(i)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeCategory === i
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeCategory === i ? { backgroundColor: p.buttonBgColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className={`grid gap-4 sm:gap-6 ${colsClass}`}>
          {products.map((product, i) => {
            const pct = p.showComparePrice && product.compareAtPrice
              ? discountPct(product.compareAtPrice, product.price)
              : 0;

            return (
              <div
                key={product.id ?? i}
                className={`group flex flex-col overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${p.imageRounded ? 'rounded-2xl' : 'rounded-none'}`}
                style={{ backgroundColor: p.cardBgColor }}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${aspectClass} bg-gray-100`}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl text-gray-300">🛍️</div>
                  )}

                  {/* Discount badge */}
                  {p.showBadge && pct > 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-extrabold text-white shadow">
                      -{pct}%
                    </span>
                  )}

                  {/* Product badge (e.g. "বেস্ট সেলার") */}
                  {p.showBadge && product.badge && (
                    <span className="absolute right-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900 shadow">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  {/* Rating */}
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <StarRating rating={4.8} />
                    <span className="text-xs text-gray-400">(৪.৮)</span>
                  </div>

                  {/* Name */}
                  <h3
                    className="mb-2 line-clamp-2 text-sm font-bold leading-snug sm:text-base"
                    style={{ color: p.textColor }}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  {p.showPrice && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-extrabold" style={{ color: p.priceColor }}>
                        ৳{product.price.toLocaleString('bn-BD')}
                      </span>
                      {p.showComparePrice && product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ৳{product.compareAtPrice.toLocaleString('bn-BD')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Order button */}
                  {p.showAddToCart && (
                    <button
                      type="button"
                      className={`mt-auto w-full rounded-xl py-2.5 text-sm font-extrabold transition hover:opacity-90 ${
                        p.buttonStyle === 'outline'
                          ? 'border-2 bg-transparent'
                          : ''
                      }`}
                      style={{
                        backgroundColor: p.buttonStyle === 'outline' ? 'transparent' : p.buttonBgColor,
                        color: p.buttonStyle === 'outline' ? p.buttonBgColor : p.buttonTextColor,
                        borderColor: p.buttonBgColor,
                      }}
                    >
                      {p.buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View all button */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-block rounded-2xl border-2 px-8 py-3 text-base font-bold transition hover:opacity-80"
            style={{ borderColor: p.buttonBgColor, color: p.buttonBgColor }}
          >
            সবগুলো দেখুন →
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-2xl bg-gray-50 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: '#E2136E' }}>💳</span>
            <div>
              <p className="text-xs font-extrabold" style={{ color: '#E2136E' }}>bKash</p>
              <p className="text-xs text-gray-500">বিকাশে পেমেন্ট</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: '#F26522' }}>💰</span>
            <div>
              <p className="text-xs font-extrabold" style={{ color: '#F26522' }}>Nagad</p>
              <p className="text-xs text-gray-500">নগদে পেমেন্ট</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-green-600">💵</span>
            <div>
              <p className="text-xs font-extrabold text-green-700">COD</p>
              <p className="text-xs text-gray-500">ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-xs font-extrabold text-gray-700">সারাদেশে</p>
              <p className="text-xs text-gray-500">হোম ডেলিভারি</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
