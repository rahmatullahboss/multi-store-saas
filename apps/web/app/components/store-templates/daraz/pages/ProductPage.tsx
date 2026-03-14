/**
 * DarazProductPage - Product Detail Page for Daraz Template
 *
 * Matches Daraz Bangladesh's product page design:
 * - Orange (#F85606) accents
 * - Clean product gallery with thumbnails
 * - Price display with discount badge
 * - Add to Cart / Buy Now buttons
 * - Related products section
 */

import { useState } from 'react';
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { DARAZ_THEME } from '../theme';
import type { Product } from '@db/schema';
import { formatPrice } from '~/lib/formatting';
import { AddToCartButton } from '~/components/AddToCartButton';
import { sanitizeHtml } from '~/utils/sanitize';

interface ProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  /** Callback for internal navigation in preview mode */
  onNavigateProduct?: (productId: number) => void;
}

export function DarazProductPage({
  product,
  currency,
  relatedProducts = [],
  onAddToCart,
  onBuyNow,
  onNavigateProduct,
}: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Parse images
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images as string);
      if (Array.isArray(parsed)) images.push(...parsed);
    } catch {
      // ignore parse errors
    }
  }

  const discount =
    product.compareAtPrice && product.compareAtPrice > (product.price ?? 0)
      ? Math.round((1 - (product.price ?? 0) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      // Default cart behavior
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: { productId: number }) => item.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (onBuyNow) {
      onBuyNow(product, quantity);
    } else {
      window.location.href = '/checkout';
    }
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: DARAZ_THEME.background }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4" style={{ color: DARAZ_THEME.textSecondary }}>
          <a href="/" className="hover:underline">
            Home
          </a>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <a href={`/?category=${product.category}`} className="hover:underline">
                {product.category}
              </a>
              <span className="mx-2">/</span>
            </>
          )}
          <span style={{ color: DARAZ_THEME.text }}>{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg p-4">
            {/* Main Image */}
            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50">
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
              {discount > 0 && (
                <span
                  className="absolute top-3 left-3 px-2 py-1 text-white text-xs font-bold rounded"
                  style={{ backgroundColor: DARAZ_THEME.primary }}
                >
                  -{discount}%
                </span>
              )}
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden ${
                      selectedImage === i ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            <h1
              className="text-xl font-medium mb-3 leading-relaxed"
              style={{ color: DARAZ_THEME.text }}
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm" style={{ color: DARAZ_THEME.textSecondary }}>
                (0 Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6" style={{ borderBottom: `1px solid ${DARAZ_THEME.border}` }}>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold" style={{ color: DARAZ_THEME.priceOrange }}>
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                  <span className="text-lg line-through" style={{ color: DARAZ_THEME.muted }}>
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span style={{ color: DARAZ_THEME.text }}>Quantity:</span>
              <div
                className="flex items-center border rounded"
                style={{ borderColor: DARAZ_THEME.border }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <span className="text-sm" style={{ color: DARAZ_THEME.muted }}>
                {product.inventory ?? 'Many'} available
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 rounded-sm font-medium text-white text-center transition hover:opacity-90"
                style={{ backgroundColor: DARAZ_THEME.buyNowBlue }}
              >
                Buy Now
              </button>
              <AddToCartButton
                productId={product.id}
                productName={product.title}
                productPrice={product.price}
                quantity={quantity}
                className="flex-1 py-3 rounded-sm font-medium text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ backgroundColor: DARAZ_THEME.primary }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </AddToCartButton>
            </div>

            {/* Actions Row */}
            <div
              className="flex items-center gap-6 mb-6 pb-6"
              style={{ borderBottom: `1px solid ${DARAZ_THEME.border}` }}
            >
              <button
                className="flex items-center gap-2 text-sm"
                style={{ color: DARAZ_THEME.textSecondary }}
              >
                <Heart size={18} /> Wishlist
              </button>
              <button
                className="flex items-center gap-2 text-sm"
                style={{ color: DARAZ_THEME.textSecondary }}
              >
                <Share2 size={18} /> Share
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Truck size={24} className="mx-auto mb-2" style={{ color: DARAZ_THEME.primary }} />
                <span className="text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
                  Fast Delivery
                </span>
              </div>
              <div className="text-center">
                <Shield size={24} className="mx-auto mb-2" style={{ color: DARAZ_THEME.primary }} />
                <span className="text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
                  Secure Payment
                </span>
              </div>
              <div className="text-center">
                <RotateCcw
                  size={24}
                  className="mx-auto mb-2"
                  style={{ color: DARAZ_THEME.primary }}
                />
                <span className="text-xs" style={{ color: DARAZ_THEME.textSecondary }}>
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 bg-white rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: DARAZ_THEME.text }}>
              Product Description
            </h2>
            <div
              className="prose prose-sm max-w-none"
              style={{ color: DARAZ_THEME.textSecondary }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ color: DARAZ_THEME.text }}
            >
              <span className="w-1 h-6 rounded" style={{ backgroundColor: DARAZ_THEME.primary }} />
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {relatedProducts.slice(0, 6).map((p) => {
                const handleClick = (e: React.MouseEvent) => {
                  if (onNavigateProduct) {
                    e.preventDefault();
                    onNavigateProduct(p.id);
                  }
                };
                return (
                  <a
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={handleClick}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                  >
                    <div className="aspect-square bg-gray-50">
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm line-clamp-2 mb-2" style={{ color: DARAZ_THEME.text }}>
                        {p.title}
                      </h3>
                      <p className="font-bold text-sm" style={{ color: DARAZ_THEME.priceOrange }}>
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
