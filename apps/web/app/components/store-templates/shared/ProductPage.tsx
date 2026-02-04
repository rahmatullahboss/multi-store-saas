/**
 * Shared Product Page Component (Theme-Aware) - Shopify Standard
 *
 * A world-class product page that dynamically adapts to any template's theme.
 * Built to Shopify standards with all premium e-commerce features.
 *
 * Features:
 * - Optimized image gallery with 3:4 aspect ratio
 * - Image zoom on hover
 * - Visual color/size swatches
 * - Stock status indicator
 * - Delivery estimation
 * - Product tabs (Description, Specifications, Shipping & Returns, Reviews)
 * - Recently viewed products
 * - Related products ("You might also like")
 * - Complementary products ("Pairs well with")
 * - SKU display
 * - Trust badges & payment icons
 * - Social sharing functionality
 * - FULLY THEME-AWARE - adapts colors from StoreTemplateTheme
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useFetcher, useParams } from '@remix-run/react';
import { formatPrice } from '~/lib/theme-engine';
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
  Copy,
  RotateCcw,
  Clock,
  MapPin,
  Award,
  CreditCard,
  Smartphone,
  Eye,
  ZoomIn,
  X,
  Facebook,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  color?: string;
  size?: string;
  colorHex?: string;
}

interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  sku?: string | null;
  stock?: number | null;
  specifications?: Record<string, string>;
  shippingInfo?: string | null;
  returnPolicy?: string | null;
  variants?: ProductVariant[];
  reviews?: {
    average: number;
    count: number;
    items?: Array<{
      id: number;
      customerName: string;
      rating: number;
      comment: string;
      createdAt: string;
      verified?: boolean;
    }>;
  };
}

interface SharedProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  complementaryProducts?: Product[];
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  templateId?: string; // Optional: Pass template ID for preview mode navigation
  onNavigate?: (path: string) => void; // Optional: Callback for internal navigation (e.g., state-based)
}

// Recently Viewed Products Hook
function useRecentlyViewed(productId: number, maxItems: number = 8) {
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewedProducts');
      let items: number[] = stored ? JSON.parse(stored) : [];

      // Remove current product if exists
      items = items.filter((id) => id !== productId);

      // Add current product to the beginning
      items.unshift(productId);

      // Keep only maxItems
      items = items.slice(0, maxItems);

      localStorage.setItem('recentlyViewedProducts', JSON.stringify(items));

      // Set recently viewed (excluding current product)
      setRecentlyViewed(items.filter((id) => id !== productId).slice(0, 4));
    } catch (e) {
      console.error('Failed to update recently viewed', e);
    }
  }, [productId, maxItems]);

  return recentlyViewed;
}

// Image Zoom Component
function ZoomableImage({
  src,
  alt,
  colors,
}: {
  src: string;
  alt: string;
  colors: StoreTemplateTheme;
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div
      ref={imageRef}
      className="relative w-full h-full overflow-hidden cursor-zoom-in group"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isZoomed && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '200%',
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        />
      )}
      <div
        className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: colors.cardBg, color: colors.muted }}
      >
        <ZoomIn className="w-3 h-3" />
        Hover to zoom
      </div>
    </div>
  );
}

// Full Screen Image Modal
function ImageModal({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
        className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      <img src={images[currentIndex]} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" />

      <button
        onClick={() => onNavigate((currentIndex + 1) % images.length)}
        className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Share Modal Component
function ShareModal({
  product,
  onClose,
  colors,
}: {
  product: Product;
  onClose: () => void;
  colors: StoreTemplateTheme;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: '#1877f2',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.title)}`,
      color: '#1da1f2',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(product.title + ' ' + shareUrl)}`,
      color: '#25d366',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full shadow-2xl"
        style={{ backgroundColor: colors.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            Share this product
          </h3>
          <button onClick={onClose} className="p-1" style={{ color: colors.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{ backgroundColor: link.color }}
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        <div
          className="flex items-center gap-2 p-3 rounded-lg border"
          style={{ borderColor: colors.muted + '30' }}
        >
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: colors.text }}
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
            style={{
              backgroundColor: copied ? '#22c55e' : colors.accent,
              color: 'white',
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Card Component for Related/Recently Viewed
function ProductCard({
  product,
  currency,
  colors,
  getLink,
  onNavigate,
}: {
  product: Product;
  currency: string;
  colors: StoreTemplateTheme;
  getLink: (path: string) => string;
  onNavigate?: (path: string) => void;
}) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(`/products/${product.id}`);
    }
  };

  return (
    <Link
      to={getLink(`/products/${product.id}`)}
      onClick={handleClick}
      className="group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: colors.background, color: colors.muted }}
          >
            <Package className="w-12 h-12 opacity-30" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div
            className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            style={{ backgroundColor: colors.cardBg, color: colors.text }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-medium text-sm line-clamp-2 group-hover:opacity-70 transition-opacity mb-2"
          style={{ color: colors.text }}
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: colors.accent }}>
            {formatPrice(product.price, currency)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: colors.muted }}>
              {formatPrice(product.compareAtPrice!, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SharedProductPage({
  product,
  currency,
  relatedProducts = [],
  complementaryProducts = [],
  theme,
  isPreview = false,
  templateId: propTemplateId,
  onNavigate,
}: SharedProductPageProps) {
  const params = useParams();
  // Use prop templateId first, fallback to URL params
  const templateId = propTemplateId || params.templateId;

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
  const [activeTab, setActiveTab] = useState<
    'description' | 'specifications' | 'shipping' | 'reviews'
  >('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetcher = useFetcher();
  const recentlyViewedIds = useRecentlyViewed(product.id);

  // Combine main image with additional images
  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  const currentPrice = selectedVariant?.price || product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  // Stock calculation
  const currentStock = selectedVariant?.stock ?? product.stock ?? 100;
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const isOutOfStock = currentStock === 0;

  // Delivery estimation (example: 3-5 business days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;
    const minDate = new Date(today);
    const maxDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  // Get unique colors and sizes from variants
  const uniqueColors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean))
  ) as string[];
  const uniqueSizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean))
  ) as string[];

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

  // Navigation handler - uses callback if provided, otherwise URL navigation
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const updateLocalCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: { productId: number }) => item.productId === product.id);

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({ productId: product.id, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to update local cart', e);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (isPreview) {
      setIsAdding(true);
      updateLocalCart();

      setTimeout(() => {
        setIsAdding(false);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }, 500);
      return;
    }

    setIsAdding(true);
    // Keep storefront cart UX consistent (cart page reads localStorage)
    updateLocalCart();
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

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, save to localStorage or API
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

  // Default specifications if not provided
  const defaultSpecs = {
    Material: 'Premium Quality',
    Weight: '500g',
    Dimensions: '30 x 20 x 10 cm',
    Origin: 'Bangladesh',
    Warranty: '1 Year',
  };

  const specifications = product.specifications || defaultSpecs;

  // Tab content
  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'specifications' as const, label: 'Specifications' },
    { id: 'shipping' as const, label: 'Shipping & Returns' },
    { id: 'reviews' as const, label: `Reviews (${product.reviews?.count || 0})` },
  ];

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
              onClick={(e) => handleNavigation(e, '/')}
              className="hover:opacity-70 flex items-center transition-opacity"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
            <Link
              to={getLink('/products')}
              onClick={(e) => handleNavigation(e, '/products')}
              className="hover:opacity-70 transition-opacity"
            >
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
                <Link
                  to={getLink(`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`)}
                  onClick={(e) =>
                    handleNavigation(
                      e,
                      `/category/${product.category!.toLowerCase().replace(/\s+/g, '-')}`
                    )
                  }
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
            {/* Main Image - Optimized 3:4 aspect ratio */}
            <div
              className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm group cursor-pointer"
              style={{ backgroundColor: colors.cardBg }}
              onClick={() => allImages.length > 0 && setShowImageModal(true)}
            >
              {allImages.length > 0 ? (
                <>
                  <ZoomableImage
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    colors={colors}
                  />
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                      -{discountPercent}% OFF
                    </div>
                  )}
                  {/* Low Stock Badge */}
                  {isLowStock && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Only {currentStock} left!
                    </div>
                  )}
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-800" />
                      </button>
                    </>
                  )}
                  {/* Image Count */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
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
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:opacity-80"
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
            {/* Title & SKU */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                {product.title}
              </h1>

              {/* SKU */}
              {(selectedVariant?.sku || product.sku) && (
                <p className="text-sm mb-2" style={{ color: colors.muted }}>
                  SKU: {selectedVariant?.sku || product.sku}
                </p>
              )}

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
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {product.reviews.average.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    ({product.reviews.count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold" style={{ color: colors.accent }}>
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl line-through" style={{ color: colors.muted }}>
                    {formatPrice(comparePrice!)}
                  </span>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                  >
                    Save {formatPrice(comparePrice! - currentPrice)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-500">
                  <X className="w-4 h-4" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-orange-500">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Only {currentStock} left - Order soon!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Color Swatches */}
            {uniqueColors.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
                  Color: <span style={{ color: colors.muted }}>{selectedVariant?.color}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const variant = product.variants?.find((v) => v.color === color);
                    const isSelected = selectedVariant?.color === color;
                    const colorHex =
                      variant?.colorHex ||
                      (color.toLowerCase() === 'black'
                        ? '#000000'
                        : color.toLowerCase() === 'white'
                          ? '#ffffff'
                          : color.toLowerCase() === 'red'
                            ? '#ef4444'
                            : color.toLowerCase() === 'blue'
                              ? '#3b82f6'
                              : color.toLowerCase() === 'green'
                                ? '#22c55e'
                                : '#9ca3af');

                    return (
                      <button
                        key={color}
                        onClick={() => variant && setSelectedVariant(variant)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-offset-2 ring-current' : ''
                        }`}
                        style={{
                          backgroundColor: colorHex,
                          borderColor: isSelected ? colors.accent : 'transparent',
                          color: isSelected ? colors.accent : 'transparent',
                        }}
                        title={color}
                      >
                        {isSelected && (
                          <Check
                            className={`w-5 h-5 ${colorHex === '#ffffff' || colorHex === '#ffff00' ? 'text-gray-800' : 'text-white'}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Swatches */}
            {uniqueSizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
                  Size: <span style={{ color: colors.muted }}>{selectedVariant?.size}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const variant = product.variants?.find(
                      (v) =>
                        v.size === size &&
                        (!selectedVariant?.color || v.color === selectedVariant.color)
                    );
                    const isSelected = selectedVariant?.size === size;
                    const isAvailable = variant && (variant.stock ?? 1) > 0;

                    return (
                      <button
                        key={size}
                        onClick={() => variant && isAvailable && setSelectedVariant(variant)}
                        disabled={!isAvailable}
                        className={`min-w-[48px] h-10 px-4 rounded-lg border-2 font-medium transition-all ${
                          !isAvailable
                            ? 'opacity-40 cursor-not-allowed line-through'
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          borderColor: isSelected ? colors.accent : colors.muted + '40',
                          backgroundColor: isSelected ? colors.accent + '15' : 'transparent',
                          color: isSelected ? colors.accent : colors.text,
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Variants (if no color/size) */}
            {product.variants &&
              product.variants.length > 0 &&
              uniqueColors.length === 0 &&
              uniqueSizes.length === 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
                    Select Option
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className="px-4 py-2.5 border-2 rounded-lg transition-all font-medium"
                        style={{
                          borderColor:
                            selectedVariant?.id === variant.id
                              ? colors.accent
                              : colors.muted + '40',
                          backgroundColor:
                            selectedVariant?.id === variant.id
                              ? colors.accent + '15'
                              : 'transparent',
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
              <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
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
                <span className="w-14 text-center font-medium" style={{ color: colors.text }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))}
                  className="p-3 hover:opacity-70 transition-opacity rounded-r-lg"
                  style={{ color: colors.text }}
                  disabled={quantity >= currentStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: addedToCart
                    ? '#22c55e'
                    : isOutOfStock
                      ? '#9ca3af'
                      : colors.accent,
                }}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 min-w-[160px] py-4 px-6 border-2 rounded-xl font-semibold transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  backgroundColor: 'transparent',
                }}
              >
                Buy Now
              </button>
              <button
                onClick={toggleWishlist}
                className="p-4 border rounded-xl hover:opacity-70 transition-all"
                style={{
                  borderColor: isWishlisted ? '#ef4444' : colors.muted + '40',
                  color: isWishlisted ? '#ef4444' : colors.muted,
                  backgroundColor: isWishlisted ? '#fef2f2' : 'transparent',
                }}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-4 border rounded-xl hover:opacity-70 transition-opacity"
                style={{ borderColor: colors.muted + '40', color: colors.muted }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Estimation */}
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: colors.muted + '20', backgroundColor: colors.cardBg }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '15' }}>
                  <Truck className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: colors.text }}>
                    Estimated Delivery
                  </p>
                  <p className="text-sm" style={{ color: colors.muted }}>
                    {getDeliveryDate()}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges Grid */}
            <div
              className="grid grid-cols-2 gap-3 pt-4 border-t"
              style={{ borderColor: colors.muted + '20' }}
            >
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                <Truck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Free shipping over {currencySymbol}1,000</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                <RotateCcw className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>7-day easy returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                <Shield className="w-5 h-5 flex-shrink-0" style={{ color: colors.accent }} />
                <span>100% secure payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span>Genuine products</span>
              </div>
            </div>

            {/* Payment Icons */}
            <div className="pt-4 border-t" style={{ borderColor: colors.muted + '20' }}>
              <p className="text-xs mb-3" style={{ color: colors.muted }}>
                We Accept
              </p>
              <div className="flex flex-wrap gap-2">
                {/* bKash */}
                <div
                  className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#e2136e', color: 'white' }}
                >
                  bKash
                </div>
                {/* Nagad */}
                <div
                  className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#f26922', color: 'white' }}
                >
                  Nagad
                </div>
                {/* VISA */}
                <div
                  className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold border"
                  style={{ backgroundColor: '#1a1f71', color: 'white' }}
                >
                  VISA
                </div>
                {/* MasterCard */}
                <div
                  className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#eb001b', color: 'white' }}
                >
                  MC
                </div>
                {/* COD */}
                <div
                  className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-bold border"
                  style={{ borderColor: colors.muted + '40', color: colors.text }}
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  COD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Products - "Pairs well with" */}
        {complementaryProducts.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-xl font-bold mb-6 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <span className="text-2xl">+</span>
              Pairs well with
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {complementaryProducts.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  currency={currency}
                  colors={colors}
                  getLink={getLink}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs: Description, Specifications, Shipping & Returns, Reviews */}
        <div className="mt-16">
          <div className="border-b" style={{ borderColor: colors.muted + '20' }}>
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="py-4 px-6 border-b-2 font-medium transition-colors whitespace-nowrap"
                  style={{
                    borderColor: activeTab === tab.id ? colors.accent : 'transparent',
                    color: activeTab === tab.id ? colors.accent : colors.muted,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose max-w-none" style={{ color: colors.text }}>
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p style={{ color: colors.muted }}>
                    This is a premium quality product that meets the highest standards. Perfect for
                    everyday use with exceptional durability and style.
                  </p>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-4 rounded-lg"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    <span className="font-medium" style={{ color: colors.text }}>
                      {key}
                    </span>
                    <span style={{ color: colors.muted }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Shipping & Returns Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-full"
                      style={{ backgroundColor: colors.accent + '15' }}
                    >
                      <Truck className="w-6 h-6" style={{ color: colors.accent }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Shipping Information
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                        {product.shippingInfo ||
                          'We offer nationwide delivery across Bangladesh. Orders are typically processed within 1-2 business days. Standard delivery takes 3-5 business days, while express delivery is available for select areas with 1-2 day delivery. Free shipping on orders over ৳1,000.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#dbeafe' }}>
                      <RotateCcw className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Return Policy
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                        {product.returnPolicy ||
                          'We offer a 7-day return policy for all products. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item. For defective products, we offer free returns and full refund or replacement.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews Summary */}
                {product.reviews && product.reviews.count > 0 && (
                  <div
                    className="p-6 rounded-xl flex flex-col md:flex-row items-center gap-6"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2" style={{ color: colors.text }}>
                        {product.reviews.average.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(product.reviews!.average)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm" style={{ color: colors.muted }}>
                        Based on {product.reviews.count} reviews
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 w-full max-w-md">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count =
                          product.reviews?.items?.filter((r) => r.rating === rating).length || 0;
                        const percentage = product.reviews?.count
                          ? (count / product.reviews.count) * 100
                          : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-8" style={{ color: colors.muted }}>
                              {rating}★
                            </span>
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.muted + '20' }}
                            >
                              <div
                                className="h-full bg-yellow-400 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm w-8" style={{ color: colors.muted }}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Individual Reviews */}
                {product.reviews?.items && product.reviews.items.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.items.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-xl p-6 shadow-sm"
                        style={{ backgroundColor: colors.cardBg }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium" style={{ color: colors.text }}>
                                {review.customerName}
                              </span>
                              {review.verified && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-1" style={{ color: colors.muted }}>
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
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
                        <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-12 rounded-xl"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium mb-2" style={{ color: colors.text }}>
                      No reviews yet
                    </p>
                    <p style={{ color: colors.muted }}>Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products - "You might also like" */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                You might also like
              </h2>
              <Link
                to={getLink('/products')}
                onClick={(e) => handleNavigation(e, '/products')}
                className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                style={{ color: colors.accent }}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  currency={currency}
                  colors={colors}
                  getLink={getLink}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewedIds.length > 0 && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <Clock className="w-6 h-6" style={{ color: colors.muted }} />
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewedIds
                .map((id) => relatedProducts.find((p) => p.id === id))
                .filter(Boolean)
                .slice(0, 4)
                .map((recentProduct) => (
                  <ProductCard
                    key={recentProduct!.id}
                    product={recentProduct!}
                    currency={currency}
                    colors={colors}
                    getLink={getLink}
                    onNavigate={onNavigate}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          images={allImages}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageModal(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal product={product} onClose={() => setShowShareModal(false)} colors={colors} />
      )}
    </div>
  );
}
