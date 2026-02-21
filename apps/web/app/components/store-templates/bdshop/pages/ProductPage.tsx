/**
 * BDShopProductPage - Product Detail Page for BDShop Template
 *
 * Matches BDShop.com design:
 * - Navy Blue (#0a2742) for Buy Now button
 * - Blue (#3B82F6) for Add to Order button
 * - Blue price display
 * - Clean product layout with thumbnails
 * - Stock indicator with green badge
 * - Shipping options section
 */

import { useState } from 'react';
import {
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
} from 'lucide-react';
import type { Product } from '@db/schema';
import { formatPrice } from '~/lib/formatting';

// BDShop Theme Colors
const BDSHOP_THEME = {
  navyBlue: '#0a2742',
  blue: '#3B82F6',
  lightBlue: '#EBF5FF',
  green: '#22C55E',
  red: '#EF4444',
  background: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

interface ProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  /** Callback for internal navigation in preview mode */
  onNavigateProduct?: (productId: number) => void;
}

export function BDShopProductPage({
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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
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

  const inStock = product.inventory === null || product.inventory > 0;

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: BDSHOP_THEME.background }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav
          className="text-sm mb-6 flex items-center gap-2"
          style={{ color: BDSHOP_THEME.textSecondary }}
        >
          <a href="/" className="hover:text-blue-600">
            🏠
          </a>
          <span>›</span>
          {product.category && (
            <>
              <a href={`/?category=${product.category}`} className="hover:text-blue-600">
                {product.category}
              </a>
              <span>›</span>
            </>
          )}
          <span className="font-medium" style={{ color: BDSHOP_THEME.blue }}>
            {product.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 border-t" style={{ borderColor: BDSHOP_THEME.border }}>
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden ${
                      selectedImage === i ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.category && (
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: BDSHOP_THEME.lightBlue, color: BDSHOP_THEME.blue }}
                >
                  {product.category}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: BDSHOP_THEME.blue }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                <span
                  className="ml-3 text-lg line-through"
                  style={{ color: BDSHOP_THEME.textSecondary }}
                >
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold leading-relaxed" style={{ color: BDSHOP_THEME.text }}>
              {product.title}
            </h1>

            {/* Product ID */}
            <div
              className="flex items-center gap-4 text-sm"
              style={{ color: BDSHOP_THEME.textSecondary }}
            >
              <span>
                Product ID: <strong>{product.sku || product.id}</strong>
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <CheckCircle size={18} style={{ color: BDSHOP_THEME.green }} />
                  <span style={{ color: BDSHOP_THEME.green }}>
                    In stock {product.inventory ? `(${product.inventory} available)` : ''}
                  </span>
                </>
              ) : (
                <span style={{ color: BDSHOP_THEME.red }}>Out of stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span style={{ color: BDSHOP_THEME.text }}>Quantity</span>
              <div
                className="flex items-center border rounded"
                style={{ borderColor: BDSHOP_THEME.border }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
                  style={{ color: BDSHOP_THEME.textSecondary }}
                >
                  −
                </button>
                <span className="w-12 text-center font-medium" style={{ color: BDSHOP_THEME.text }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-lg font-medium"
                  style={{ color: BDSHOP_THEME.textSecondary }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BDSHOP_THEME.blue }}
              >
                <ShoppingCart size={18} />
                Add to Order
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BDSHOP_THEME.navyBlue }}
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>

            {/* Secondary Actions */}
            <div
              className="flex items-center gap-6 pt-4"
              style={{ borderTop: `1px solid ${BDSHOP_THEME.border}` }}
            >
              <button
                className="flex items-center gap-2 text-sm"
                style={{ color: BDSHOP_THEME.textSecondary }}
              >
                <Heart size={18} /> Add to Wishlist
              </button>
              <button
                className="flex items-center gap-2 text-sm"
                style={{ color: BDSHOP_THEME.textSecondary }}
              >
                <Share2 size={18} /> Share
              </button>
            </div>

            {/* Shipping Options */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: BDSHOP_THEME.lightBlue }}>
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} style={{ color: BDSHOP_THEME.blue }} />
                <span className="font-medium" style={{ color: BDSHOP_THEME.text }}>
                  Shipping Options
                </span>
              </div>
              <p className="text-sm" style={{ color: BDSHOP_THEME.textSecondary }}>
                Standard delivery available. Shipping calculated at checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: BDSHOP_THEME.text }}>
              Product Description
            </h2>
            <div
              className="prose prose-sm max-w-none"
              style={{ color: BDSHOP_THEME.textSecondary }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: BDSHOP_THEME.text }}>
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((p) => {
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
                      <h3
                        className="text-sm line-clamp-2 mb-2"
                        style={{ color: BDSHOP_THEME.text }}
                      >
                        {p.title}
                      </h3>
                      <p className="font-bold" style={{ color: BDSHOP_THEME.blue }}>
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
