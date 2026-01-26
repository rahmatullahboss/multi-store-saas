/**
 * Shared Product Page Component (Theme-Aware)
 *
 * A universal product page that dynamically adapts to any template's theme.
 * Used as fallback for templates that don't have their own ProductPage.
 *
 * Features:
 * - Image gallery with thumbnails
 * - Product info (title, price, variants)
 * - Add to cart with quantity selector
 * - Buy now button
 * - Product description tabs
 * - Reviews section
 * - Related products
 * - FULLY THEME-AWARE - adapts colors from StoreTemplateTheme
 */

import React, { useState } from 'react';
import { Link, useFetcher, useParams } from '@remix-run/react';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
} from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
    compareAtPrice?: number;
    sku?: string;
    stock?: number;
  }>;
  reviews?: {
    average: number;
    count: number;
    items?: Array<{
      id: number;
      customerName: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  };
}

interface SharedProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

export default function SharedProductPage({
  product,
  currency,
  relatedProducts = [],
  theme,
  isPreview = false,
}: SharedProductPageProps) {
  const params = useParams();
  const templateId = params.templateId;

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const fetcher = useFetcher();

  // Combine main image with additional images
  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  const currentPrice = selectedVariant?.price || product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/')) {
        const id = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${id}`;
      }
      if (path.startsWith('/category/')) {
        const cat = path.replace('/category/', '');
        return `/store-template-preview/${templateId}/collections/${cat}`;
      }
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const handleAddToCart = () => {
    if (isPreview) {
      // In preview mode, just show visual feedback
      setIsAdding(true);
      setTimeout(() => {
        setIsAdding(false);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }, 500);
      return;
    }

    setIsAdding(true);
    fetcher.submit(
      {
        productId: String(product.id),
        variantId: selectedVariant?.id ? String(selectedVariant.id) : '',
        quantity: String(quantity),
      },
      { method: 'POST', action: '/api/cart' }
    );

    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!isPreview) {
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 600);
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  // Check if theme is dark (for text contrast)
  const isDark =
    colors.background.startsWith('#0') ||
    colors.background.startsWith('#1') ||
    colors.background.startsWith('#2') ||
    colors.background === 'rgba(3, 7, 18, 0.7)';

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Breadcrumb */}
      <div
        className="border-b"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav
            className="flex items-center text-sm"
            aria-label="Breadcrumb"
            style={{ color: colors.muted }}
          >
            <Link
              to={getLink('/')}
              className="hover:opacity-70 flex items-center transition-opacity"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
            <Link to={getLink('/products')} className="hover:opacity-70 transition-opacity">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                <Link
                  to={getLink(`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="hover:opacity-70 transition-opacity"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
            <span className="font-medium truncate max-w-[200px]" style={{ color: colors.text }}>
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm group"
              style={{ backgroundColor: colors.cardBg }}
            >
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div
                      className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: colors.muted }}
                >
                  <Package className="w-20 h-20 opacity-30" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: index === currentImageIndex ? colors.accent : 'transparent',
                      backgroundColor: colors.cardBg,
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                {product.title}
              </h1>

              {/* Reviews Summary */}
              {product.reviews && product.reviews.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.reviews!.average)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    ({product.reviews.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold" style={{ color: colors.accent }}>
                {currencySymbol}
                {currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl line-through" style={{ color: colors.muted }}>
                    {currencySymbol}
                    {comparePrice!.toLocaleString()}
                  </span>
                  <span
                    className="text-sm font-semibold px-2 py-1 rounded"
                    style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                  >
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className="px-4 py-2 border rounded-lg transition-all"
                      style={{
                        borderColor:
                          selectedVariant?.id === variant.id ? colors.accent : colors.muted + '40',
                        backgroundColor:
                          selectedVariant?.id === variant.id ? colors.accent + '10' : 'transparent',
                        color: selectedVariant?.id === variant.id ? colors.accent : colors.text,
                      }}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Quantity
              </label>
              <div
                className="inline-flex items-center border rounded-lg"
                style={{ borderColor: colors.muted + '40' }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:opacity-70 transition-opacity rounded-l-lg"
                  style={{ color: colors.text }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium" style={{ color: colors.text }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-3 hover:opacity-70 transition-opacity rounded-r-lg"
                  style={{ color: colors.text }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all text-white"
                style={{
                  backgroundColor: addedToCart ? '#22c55e' : colors.accent,
                  opacity: isAdding ? 0.7 : 1,
                }}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-[140px] py-3 px-6 border-2 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  backgroundColor: 'transparent',
                }}
              >
                Buy Now
              </button>
              <button
                className="p-3 border rounded-lg hover:opacity-70 transition-opacity"
                style={{ borderColor: colors.muted + '40', color: colors.muted }}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                className="p-3 border rounded-lg hover:opacity-70 transition-opacity"
                style={{ borderColor: colors.muted + '40', color: colors.muted }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="border-t pt-6 space-y-3" style={{ borderColor: colors.muted + '20' }}>
              <div className="flex items-center gap-3 text-sm" style={{ color: colors.muted }}>
                <Truck className="w-5 h-5 text-green-500" />
                <span>Free shipping on orders over {currencySymbol}1,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: colors.muted }}>
                <Shield className="w-5 h-5" style={{ color: colors.accent }} />
                <span>Secure checkout - 100% payment protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-12">
          <div className="border-b" style={{ borderColor: colors.muted + '20' }}>
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className="py-4 border-b-2 font-medium transition-colors"
                style={{
                  borderColor: activeTab === 'description' ? colors.accent : 'transparent',
                  color: activeTab === 'description' ? colors.accent : colors.muted,
                }}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className="py-4 border-b-2 font-medium transition-colors"
                style={{
                  borderColor: activeTab === 'reviews' ? colors.accent : 'transparent',
                  color: activeTab === 'reviews' ? colors.accent : colors.muted,
                }}
              >
                Reviews ({product.reviews?.count || 0})
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' ? (
              <div className="prose max-w-none" style={{ color: colors.text }}>
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p style={{ color: colors.muted }}>No description available.</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews?.items && product.reviews.items.length > 0 ? (
                  product.reviews.items.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg p-6 shadow-sm"
                      style={{ backgroundColor: colors.cardBg }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium" style={{ color: colors.text }}>
                          {review.customerName}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: colors.muted }}>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: colors.muted }}>No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <Link
                  key={relProduct.id}
                  to={getLink(`/products/${relProduct.id}`)}
                  className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <div className="aspect-square overflow-hidden">
                    {relProduct.imageUrl ? (
                      <img
                        src={relProduct.imageUrl}
                        alt={relProduct.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.background, color: colors.muted }}
                      >
                        <Package className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3
                      className="font-medium text-sm line-clamp-2 group-hover:opacity-70 transition-opacity"
                      style={{ color: colors.text }}
                    >
                      {relProduct.title}
                    </h3>
                    <p className="mt-1 font-semibold" style={{ color: colors.accent }}>
                      {currencySymbol}
                      {relProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
