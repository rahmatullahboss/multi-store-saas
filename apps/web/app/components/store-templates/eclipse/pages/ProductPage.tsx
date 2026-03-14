import { sanitizeHtml } from '~/utils/sanitize';
/**
 * EclipseProductPage - Futuristic Dark Mode Product Page
 *
 * Design Language:
 * - Space Grotesk typography
 * - Electric Violet accent (#8B5CF6)
 * - Dark backgrounds with neon glows
 * - Bento-style rounded corners
 * - Glassmorphism effects
 */

import { useState } from 'react';
import { Link, useParams } from '@remix-run/react';
import {
  Heart,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  ShoppingCart,
  Share2,
} from 'lucide-react';
import { ECLIPSE_THEME } from '../theme';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { SerializedProduct } from '~/templates/store-registry';
import { formatPrice } from '~/lib/formatting';

interface ProductPageProps {
  product: SerializedProduct;
  currency: string;
  relatedProducts?: SerializedProduct[];
  isPreview?: boolean;
  onNavigate?: (path: string) => void;
  onNavigateProduct?: (productId: number) => void;
}

export function EclipseProductPage({
  product,
  currency,
  relatedProducts = [],
  isPreview = false,
  onNavigate,
  onNavigateProduct,
}: ProductPageProps) {
  const params = useParams();
  const templateId = params.templateId;
  const theme = ECLIPSE_THEME;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Parse images
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if ((product as any).images) {
    try {
      // Handle both string and already parsed array
      const productImages = (product as any).images;
      const parsed = typeof productImages === 'string' ? JSON.parse(productImages) : productImages;
      if (Array.isArray(parsed)) images.push(...parsed);
    } catch {
      /* ignore */
    }
  }
  // Dedup images
  const uniqueImages = Array.from(new Set(images));

  const discount =
    product.compareAtPrice && product.compareAtPrice > (product.price ?? 0)
      ? Math.round((1 - (product.price ?? 0) / product.compareAtPrice) * 100)
      : 0;

  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/'))
        return `/store-template-preview/${templateId}/products/${path.split('/')[2]}`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  // Helper for navigation
  const handleNav = (path: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const handleProductNav = (id: number, e: React.MouseEvent) => {
    if (onNavigateProduct) {
      e.preventDefault();
      onNavigateProduct(id);
    }
  };

  return (
    <div
      className="min-h-screen selection:bg-violet-500 selection:text-white"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-3 text-sm" style={{ color: theme.textMuted }}>
          {onNavigate ? (
            <button
              onClick={(e) => handleNav('/', e)}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
          ) : (
            <Link to={getLink('/')} className="hover:text-white transition-colors">
              Home
            </Link>
          )}
          <span className="opacity-40">/</span>
          {onNavigate ? (
            <button
              onClick={(e) => handleNav('/products', e)}
              className="hover:text-white transition-colors"
            >
              Products
            </button>
          ) : (
            <Link to={getLink('/products')} className="hover:text-white transition-colors">
              Products
            </Link>
          )}
          {product.category && (
            <>
              <span className="opacity-40">/</span>
              <span style={{ color: theme.accent }}>{product.category}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery - Bento Style */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-3xl overflow-hidden group"
              style={{
                backgroundColor: theme.cardBg,
                boxShadow: theme.cardShadow,
              }}
            >
              {uniqueImages[selectedImage] ? (
                <>
                  <img
                    src={uniqueImages[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Neon Discount Badge */}
                  {discount > 0 && (
                    <div
                      className="absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                      style={{
                        backgroundColor: theme.accent,
                        color: '#fff',
                        boxShadow: theme.glow,
                      }}
                    >
                      <Zap className="w-4 h-4" />-{discount}%
                    </div>
                  )}
                  {/* Navigation */}
                  {uniqueImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage(
                            (prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev + 1) % uniqueImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 opacity-20" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {uniqueImages.length > 1 && (
              <div className="flex gap-3">
                {uniqueImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="w-20 h-20 rounded-xl overflow-hidden transition-all"
                    style={{
                      opacity: index === selectedImage ? 1 : 0.5,
                      border:
                        index === selectedImage
                          ? `2px solid ${theme.accent}`
                          : `1px solid ${theme.border}`,
                      boxShadow: index === selectedImage ? theme.cardShadowHover : 'none',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Glass Card */}
          <div
            className="p-8 rounded-3xl space-y-6"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.cardShadow,
            }}
          >
            {/* Category Badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
            >
              {product.category || 'Featured'}
            </span>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight"
              style={{ fontFamily: theme.fontHeading }}
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5"
                    style={{
                      color: star <= 4 ? '#fbbf24' : theme.textMuted,
                      fill: star <= 4 ? '#fbbf24' : 'transparent',
                    }}
                  />
                ))}
              </div>
              <span style={{ color: theme.textMuted }}>4.8 (128 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span
                className="text-4xl font-bold"
                style={{
                  background: theme.accentGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                <span className="text-xl line-through" style={{ color: theme.textMuted }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="text-base leading-relaxed prose prose-invert max-w-none"
                style={{ color: theme.textMuted }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    product.description.slice(0, 300) +
                    (product.description.length > 300 ? '...' : '')
                  ),
                }}
              />
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Quantity</span>
              <div
                className="inline-flex items-center rounded-xl overflow-hidden"
                style={{
                  backgroundColor: theme.backgroundAlt,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <AddToCartButton
                productId={product.id}
                productName={product.title}
                productPrice={product.price}
                quantity={quantity}
                storeId={product.storeId}
                isPreview={isPreview}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all text-white hover:scale-[1.02]"
                style={{
                  background: theme.accentGradient,
                  boxShadow: theme.glow,
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </AddToCartButton>

              <button
                className="p-4 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.backgroundAlt,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div
              className="grid grid-cols-2 gap-4 pt-6"
              style={{ borderTop: `1px solid ${theme.border}` }}
            >
              <div className="flex items-center gap-3 text-sm" style={{ color: theme.textMuted }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.backgroundAlt }}
                >
                  <Truck className="w-5 h-5" style={{ color: theme.accent }} />
                </div>
                <span>Free Express Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: theme.textMuted }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.backgroundAlt }}
                >
                  <Shield className="w-5 h-5" style={{ color: theme.accentSecondary }} />
                </div>
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Bento Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2
              className="text-2xl font-bold mb-8 flex items-center gap-3"
              style={{ fontFamily: theme.fontHeading }}
            >
              <Zap className="w-6 h-6" style={{ color: theme.accent }} />
              More Like This
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p) => {
                const linkProps = onNavigateProduct
                  ? { onClick: (e: React.MouseEvent) => handleProductNav(p.id, e), to: '#' }
                  : { to: getLink(`/products/${p.id}`) };

                return (
                  <Link
                    key={p.id}
                    {...linkProps}
                    className="group rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: theme.backgroundAlt }}
                        >
                          <Package className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">{p.title}</h3>
                      <p className="font-bold" style={{ color: theme.accent }}>
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EclipseProductPage;
