/**
 * LuxeBoutiqueProductPage - Elegant Luxury Product Page
 *
 * Design Language:
 * - Serif typography (Playfair Display)
 * - Gold accents (#c9a961)
 * - Generous whitespace
 * - Asymmetric layout
 * - Refined, minimal UI
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Check,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { LUXE_BOUTIQUE_THEME } from '../theme';
import type { Product } from '@db/schema';
import { formatPrice } from '~/lib/formatting';

interface ProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  isPreview?: boolean;
  onNavigate?: (path: string) => void;
  onNavigateProduct?: (productId: number) => void;
}

interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export function LuxeBoutiqueProductPage({
  product,
  currency,
  relatedProducts = [],
  isPreview = false,
  onNavigate,
  onNavigateProduct,
}: ProductPageProps) {
  const params = useParams();
  const templateId = params.templateId;
  const theme = LUXE_BOUTIQUE_THEME;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

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

  // Parse images
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images as string);
      if (Array.isArray(parsed)) images.push(...parsed);
    } catch {
      /* ignore */
    }
  }

  const discount =
    product.compareAtPrice && product.compareAtPrice > (product.price ?? 0)
      ? Math.round((1 - (product.price ?? 0) / product.compareAtPrice) * 100)
      : 0;

  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/'))
        return `/store-template-preview/${templateId}/products/${path.split('/')[2]}`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    // Update local storage (works for both Live and Preview modes)
    try {
      const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: CartItem) => item.productId === product.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: product.price ?? 0,
          imageUrl: product.imageUrl,
          quantity,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to update cart', e);
    }

    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Elegant Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav
          className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase"
          style={{ color: theme.muted }}
        >
          {onNavigate ? (
            <button
              onClick={(e) => handleNav('/', e)}
              className="hover:opacity-60 transition-opacity"
            >
              Home
            </button>
          ) : (
            <Link to={getLink('/')} className="hover:opacity-60 transition-opacity">
              Home
            </Link>
          )}
          <span className="opacity-40">/</span>
          {onNavigate ? (
            <button
              onClick={(e) => handleNav('/products', e)}
              className="hover:opacity-60 transition-opacity"
            >
              Collection
            </button>
          ) : (
            <Link to={getLink('/products')} className="hover:opacity-60 transition-opacity">
              Collection
            </Link>
          )}
          {product.category && (
            <>
              <span className="opacity-40">/</span>
              <span>{product.category}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Product - Asymmetric Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Image Gallery - 7 columns */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="relative aspect-[4/5] overflow-hidden group"
              style={{ backgroundColor: theme.cardBg }}
            >
              {images[selectedImage] ? (
                <>
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <div
                      className="absolute top-6 left-6 text-xs tracking-[0.15em] uppercase px-4 py-2"
                      style={{ backgroundColor: theme.accent, color: theme.primary }}
                    >
                      {discount}% Off
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: theme.cardBg }}
                      >
                        <ChevronLeft className="w-5 h-5" style={{ color: theme.text }} />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: theme.cardBg }}
                      >
                        <ChevronRight className="w-5 h-5" style={{ color: theme.text }} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: theme.muted }}
                >
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="w-20 h-24 overflow-hidden transition-opacity"
                    style={{
                      opacity: index === selectedImage ? 1 : 0.5,
                      border: index === selectedImage ? `1px solid ${theme.accent}` : 'none',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - 5 columns, sticky */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-8">
            {/* Category */}
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: theme.accent }}>
              {product.category || 'Exclusive'}
            </span>

            {/* Title - Serif */}
            <h1
              className="text-3xl md:text-4xl leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span
                className="text-2xl"
                style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > (product.price ?? 0) && (
                <span className="text-lg line-through" style={{ color: theme.muted }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px" style={{ backgroundColor: theme.muted + '30' }} />

            {/* Description */}
            {product.description && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.muted }}
                dangerouslySetInnerHTML={{
                  __html:
                    product.description.slice(0, 200) +
                    (product.description.length > 200 ? '...' : ''),
                }}
              />
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-xs tracking-[0.15em] uppercase" style={{ color: theme.text }}>
                Quantity
              </span>
              <div
                className="inline-flex items-center border"
                style={{ borderColor: theme.muted + '40' }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:opacity-60 transition-opacity"
                >
                  <Minus className="w-4 h-4" style={{ color: theme.text }} />
                </button>
                <span className="w-12 text-center" style={{ color: theme.text }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:opacity-60 transition-opacity"
                >
                  <Plus className="w-4 h-4" style={{ color: theme.text }} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-[0.1em] uppercase transition-all"
                style={{
                  backgroundColor: addedToCart ? '#22c55e' : theme.text,
                  color: theme.background,
                }}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 py-4 text-sm tracking-[0.1em] uppercase border transition-all hover:opacity-70"
                style={{ borderColor: theme.text, color: theme.text }}
              >
                <Heart className="w-4 h-4" /> Add to Wishlist
              </button>
            </div>

            {/* Secure Payment Trust Badge */}
            <div className="pt-6" style={{ borderTop: `1px solid ${theme.muted}30` }}>
              <div className="flex items-center gap-3 text-xs" style={{ color: theme.muted }}>
                <Shield className="w-4 h-4" />
                <span>Secure Payment & Authenticity Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16" style={{ borderTop: `1px solid ${theme.muted}20` }}>
            <div className="flex items-center justify-between mb-10">
              <h2
                className="text-2xl"
                style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}
              >
                You May Also Like
              </h2>
              <Link
                to={getLink('/products')}
                className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase hover:opacity-60 transition-opacity"
                style={{ color: theme.text }}
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => {
                const linkProps = onNavigateProduct
                  ? { onClick: (e: React.MouseEvent) => handleProductNav(p.id, e), to: '#' }
                  : { to: getLink(`/products/${p.id}`) };

                return (
                  <Link key={p.id} {...linkProps} className="group">
                    <div
                      className="aspect-[3/4] overflow-hidden mb-4"
                      style={{ backgroundColor: theme.cardBg }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ color: theme.muted }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                    <h3
                      className="text-sm mb-1 group-hover:opacity-60 transition-opacity"
                      style={{ color: theme.text }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {formatPrice(p.price)}
                    </p>
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

export default LuxeBoutiqueProductPage;
