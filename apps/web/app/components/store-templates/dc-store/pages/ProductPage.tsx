/**
 * DC Store Product Detail Page
 *
 * Redesigned to match the original DC Store project with:
 * - Breadcrumb with category badge
 * - Large product image with discount/featured badges
 * - Sticky info card with ratings, price, save badge, quantity, dual CTAs
 * - Feature highlight cards (delivery, payment, returns)
 * - Product description section
 * - Shipping info section
 */

import { useState } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  ArrowLeft,
  Star,
  StarHalf,
  Package,
} from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { sanitizeHtml } from '~/utils/sanitize';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { resolveDCStoreTheme } from '../theme';
import { buildProxyImageUrl } from '~/utils/imageOptimization';

interface DCProductPageProps {
  product: SerializedProduct;
  storeId: number;
  isPreview?: boolean;
  config?: any;
  theme?: any;
  shippingConfig?: {
    enabled: boolean;
    insideDhaka: number;
    outsideDhaka: number;
    freeShippingAbove: number;
    freeDeliveryAbove: number | null;
    deliveryCharge: number;
  };
}

export function DCProductPage({
  product,
  storeId,
  isPreview = false,
  config,
  theme: themeProp,
  shippingConfig,
}: DCProductPageProps) {
  const theme = resolveDCStoreTheme(config, themeProp);
  const [quantity, setQuantity] = useState(1);

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const saveAmount = product.compareAtPrice ? product.compareAtPrice - product.price : 0;

  const imageUrl = product.imageUrl || '/placeholder-product.svg';

  // Format Price
  const formatPrice = (price: number) => {
    return `৳ ${price.toLocaleString()}`;
  };

  // Use actual review data from product (passed from route)
  const averageRating = product.reviews?.average ?? 0;
  const reviewCount = product.reviews?.count ?? 0;

  const highlightCards = [
    {
      icon: Truck,
      title: 'দ্রুত ডেলিভারি',
      subtitle: 'সারা বাংলাদেশে নির্ভরযোগ্য শিপিং',
    },
    {
      icon: ShieldCheck,
      title: 'নিরাপদ পেমেন্ট',
      subtitle: '১০০% নিরাপদ লেনদেন',
    },
    {
      icon: RotateCcw,
      title: 'সহজ রিটার্ন',
      subtitle: '৭ দিনের মধ্যে রিটার্ন নীতি',
    },
  ];

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <main className="relative z-10 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-3 py-6 sm:px-6 lg:py-12 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
            <PreviewSafeLink
              to="/"
              isPreview={isPreview}
              className="inline-flex items-center gap-1 rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-amber-200 transition hover:ring-amber-300 font-medium"
              style={{ color: theme.text }}
            >
              <ArrowLeft className="h-4 w-4" />
              দোকানে ফিরে যান
            </PreviewSafeLink>
            {product.category && (
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700"
                style={{ backgroundImage: 'linear-gradient(to right, #fef3c7, #ffe4e6)' }}
              >
                {product.category}
              </span>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left: Product Image */}
            <div className="space-y-6">
              {/* Main Image */}
              <div
                className="group relative overflow-hidden rounded-2xl sm:rounded-[2.75rem] border border-white/60 bg-white shadow-xl"
                style={{ boxShadow: `0 20px 50px -12px ${theme.primary}30` }}
              >
                <div className="relative aspect-square">
                  <img
                    src={buildProxyImageUrl(imageUrl, { width: 1000, height: 1000, quality: 85 })}
                    alt={product.title}
                    className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="px-3 py-1.5 text-sm font-bold rounded-full text-white shadow-lg"
                        style={{ backgroundImage: 'linear-gradient(to right, #ef4444, #f43f5e)' }}
                      >
                        -{discount}% OFF
                      </span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className="px-3 py-1.5 text-sm font-bold rounded-full text-white shadow-md"
                        style={{ backgroundImage: theme.brandGradient }}
                      >
                        ⭐ Featured
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights Section */}
              {product.description && (
                <div className="grid gap-3 rounded-xl sm:rounded-[2rem] border border-white/60 bg-white/70 p-4 sm:p-6 backdrop-blur">
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    বিশেষ বিবরণ
                  </p>
                  <div
                    className="text-base leading-relaxed text-gray-600 line-clamp-4 [&_p]:mb-2 [&_strong]:font-semibold [&_br]:hidden"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
                  />
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {averageRating > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                        <span className="flex">
                          {Array.from({ length: Math.floor(averageRating) }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          {averageRating % 1 >= 0.5 && (
                            <StarHalf className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          )}
                        </span>
                        {averageRating.toFixed(1)}/৫
                      </span>
                    )}
                    {reviewCount > 0 && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                        {reviewCount}টি রিভিউ
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <aside className="space-y-6">
              <div className="sticky top-28 space-y-6">
                {/* Main Info Card */}
                <div
                  className="rounded-xl sm:rounded-[2.75rem] border border-white/60 bg-white/80 p-4 sm:p-8 shadow-2xl backdrop-blur"
                  style={{ boxShadow: `0 25px 50px -12px ${theme.primary}20` }}
                >
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <h1
                      className="text-xl sm:text-3xl font-bold tracking-tight lg:text-4xl"
                      style={{ color: theme.text }}
                    >
                      {product.title}
                    </h1>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{
                        backgroundColor: theme.primary + '15',
                        color: theme.primary,
                      }}
                    >
                      স্টকে আছে
                    </span>
                  </div>

                  {/* Rating & Category */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: Math.floor(averageRating) }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                          {averageRating % 1 >= 0.5 && (
                            <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <span>({reviewCount} রিভিউ)</span>
                      </div>
                    )}
                    {product.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-700">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="text-xs uppercase tracking-[0.3em]"
                        style={{ color: theme.primary }}
                      >
                        {discount > 0 ? 'বিশেষ অফার' : 'মূল্য'}
                      </p>
                      <p
                        className="text-3xl sm:text-4xl font-bold lg:text-5xl"
                        style={{ color: theme.text }}
                      >
                        {formatPrice(product.price)}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-lg text-gray-400 line-through mt-1">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </div>
                    {discount > 0 && saveAmount > 0 && (
                      <span
                        className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg"
                        style={{ backgroundImage: theme.brandGradient }}
                      >
                        সেভ {formatPrice(saveAmount)}
                      </span>
                    )}
                  </div>

                  {/* Quantity + Actions */}
                  <div className="mt-6 sm:mt-8 space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">পরিমাণ:</span>
                      <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-0.5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-lg font-bold text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-base">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-lg font-bold text-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid gap-3 grid-cols-2">
                      <AddToCartButton
                        productId={product.id}
                        storeId={storeId}
                        productName={product.title}
                        productPrice={product.price}
                        quantity={quantity}
                        currency="BDT"
                        isPreview={isPreview}
                        className="gap-2 py-3.5 rounded-full font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg flex items-center justify-center active:scale-95"
                        style={{ backgroundColor: theme.secondary }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        কার্টে যোগ করুন
                      </AddToCartButton>

                      <AddToCartButton
                        productId={product.id}
                        storeId={storeId}
                        productName={product.title}
                        productPrice={product.price}
                        quantity={quantity}
                        currency="BDT"
                        isPreview={isPreview}
                        mode="buy_now"
                        className="gap-2 py-3.5 rounded-full font-bold transition-all flex items-center justify-center border-2 hover:bg-amber-50 active:scale-95 bg-white"
                        style={{
                          borderColor: theme.secondary,
                          color: theme.secondary,
                        }}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        এখনই কিনুন
                      </AddToCartButton>
                    </div>
                  </div>

                  {/* Feature Cards */}
                  <div className="mt-6 grid gap-3">
                    {highlightCards.map(({ icon: Icon, title, subtitle }) => (
                      <div
                        key={title}
                        className="flex items-start gap-4 rounded-2xl border border-amber-100/60 bg-amber-50/40 p-4 text-sm text-gray-500 shadow-sm"
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-inner shrink-0"
                          style={{ color: theme.secondary }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold" style={{ color: theme.text }}>
                            {title}
                          </p>
                          <p className="text-xs text-gray-500">{subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Section */}
                <div className="rounded-xl sm:rounded-[2rem] border border-white/60 bg-white/70 p-6 text-sm text-gray-500 backdrop-blur">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.24em]"
                    style={{ color: theme.primary }}
                  >
                    সাহায্য প্রয়োজন?
                  </p>
                  <p className="mt-2 leading-relaxed">
                    এই পণ্য সম্পর্কে যেকোনো প্রশ্নে আমাদের সাপোর্ট টিম আপনাকে সাহায্য করতে প্রস্তুত।
                    যেকোনো সময় যোগাযোগ করুন।
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* Description Section */}
          {product.description && (
            <section className="mt-8 sm:mt-16 rounded-xl sm:rounded-[2.75rem] border border-white/60 bg-white/80 p-4 sm:p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
                পণ্যের বিবরণ
              </h2>
              <div
                className="text-base leading-relaxed text-gray-600 [&_p]:mb-3 [&_strong]:font-semibold [&_br]:block"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
            </section>
          )}

          {/* Shipping Info Section */}
          <section className="mt-8 rounded-xl sm:rounded-[2.75rem] border border-white/60 bg-white/80 p-4 sm:p-8 shadow-xl backdrop-blur">
            <div className="space-y-6 text-gray-500">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                <h4
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: theme.text }}
                >
                  <Package className="h-5 w-5" style={{ color: theme.primary }} />
                  ডেলিভারি তথ্য
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• ঢাকার মধ্যে: ৳ {shippingConfig?.insideDhaka ?? 60} (১-২ কর্মদিবস)</li>
                  <li>• ঢাকার বাইরে: ৳ {shippingConfig?.outsideDhaka ?? 120} (৩-৫ কর্মদিবস)</li>
                  {(shippingConfig?.freeShippingAbove ?? 0) > 0 && (
                    <li>
                      • ৳ {shippingConfig!.freeShippingAbove.toLocaleString()} টাকার উপরে অর্ডারে
                      ফ্রি শিপিং
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h4
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: theme.text }}
                >
                  <RotateCcw className="h-5 w-5" style={{ color: theme.primary }} />
                  রিটার্ন নীতি
                </h4>
                <p className="text-sm">
                  আমরা ৭ দিনের সহজ রিটার্ন নীতি প্রদান করি। আপনি যদি ক্রয়ে সন্তুষ্ট না হন, তাহলে
                  পণ্যটি মূল অবস্থায় ফেরত দিন এবং পূর্ণ রিফান্ড বা বদলি পান।
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
