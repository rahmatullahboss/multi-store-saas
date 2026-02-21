/**
 * Nova Lux Ultra Product Page
 *
 * Ultra-premium product page featuring:
 * - 3D Image gallery with zoom and pan
 * - Premium product details with animations
 * - Related products carousel
 * - Sticky add to cart
 * - Product tabs with smooth transitions
 * - Customer reviews section
 * - Size/variant selectors with premium styling
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
  Check,
  ZoomIn,
} from 'lucide-react';

import { NOVALUX_ULTRA_THEME } from '../theme';
import { formatPrice } from '~/lib/formatting';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useWishlist } from '~/hooks/useWishlist';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface ProductPageProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number | null;
    images?: string[];
    imageUrl?: string;
    category?: string;
    stock: number;
    variants?: Array<{
      id: number;
      name: string;
      values: string[];
    }>;
    specifications?: Record<string, string>;
    features?: string[];
  };
  currency: string;
  relatedProducts: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string;
    category?: string;
  }>;
  theme: StoreTemplateTheme;
  isPreview?: boolean;
  templateId: string;
  onNavigate?: (path: string) => void;
}

// 3D Image Gallery Component
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div
        ref={imageRef}
        className="relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in bg-gray-100"
        style={{
          boxShadow: NOVALUX_ULTRA_THEME.cardShadow,
        }}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${productName} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: 1,
              scale: isZoomed ? 1.5 : 1,
              x: isZoomed ? `${(0.5 - mousePosition.x) * 50}%` : 0,
              y: isZoomed ? `${(0.5 - mousePosition.y) * 50}%` : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Zoom Indicator */}
        <motion.div
          className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isZoomed ? 0 : 1 }}
          style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadow }}
        >
          <ZoomIn className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.text }} />
        </motion.div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
              style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadow }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.text }} />
            </motion.button>
            <motion.button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
              style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadow }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.text }} />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <motion.button
              key={index}
              className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden"
              style={{
                border: `2px solid ${
                  index === currentIndex ? NOVALUX_ULTRA_THEME.accent : 'transparent'
                }`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// Related Product Card
function RelatedProductCard({
  product,
  currency,
  onNavigate,
  index,
}: {
  product: ProductPageProps['relatedProducts'][0];
  currency: string;
  onNavigate?: (path: string) => void;
  index: number;
}) {
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <PreviewSafeLink
        to={`/products/${product.id}`}
        className="block"
        isPreview={!onNavigate}
        onClick={() => onNavigate?.(`/products/${product.id}`)}
      >
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4"
          style={{
            boxShadow: NOVALUX_ULTRA_THEME.cardShadow,
          }}
        >
          <motion.img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
          {isSale && (
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: NOVALUX_ULTRA_THEME.accentGradient,
                color: NOVALUX_ULTRA_THEME.primary,
              }}
            >
              SALE
            </div>
          )}
        </div>
        <h4
          className="font-medium text-sm mb-2 line-clamp-1 group-hover:opacity-70 transition-opacity"
          style={{ color: NOVALUX_ULTRA_THEME.text }}
        >
          {product.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: NOVALUX_ULTRA_THEME.primary }}>
            {formatPrice(product.price, currency)}
          </span>
          {isSale && (
            <span className="text-xs line-through" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </PreviewSafeLink>
    </motion.div>
  );
}

// Trust Badge Component
function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
      </div>
      <span className="text-sm font-medium" style={{ color: NOVALUX_ULTRA_THEME.text }}>
        {text}
      </span>
    </div>
  );
}

export function ProductPage({
  product,
  currency,
  relatedProducts,
  theme: _theme,
  isPreview,
  templateId: _templateId,
  onNavigate,
}: ProductPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description'
  );
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});

  const isLiked = isInWishlist(product.id);
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount =
    isSale && product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  const pageRef = useRef(null);
  const isInView = useInView(pageRef, { once: true, margin: '-100px' });

  // Generate mock images if not provided
  const images = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl, product.imageUrl, product.imageUrl]
      : [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        ];

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity((q) => q + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  return (
    <div ref={pageRef} style={{ backgroundColor: NOVALUX_ULTRA_THEME.background }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav
          className="flex items-center gap-2 text-sm"
          style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
        >
          <PreviewSafeLink
            to="/"
            isPreview={isPreview}
            className="hover:opacity-70 transition-opacity"
          >
            Home
          </PreviewSafeLink>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <PreviewSafeLink
                to={`/?category=${encodeURIComponent(product.category)}`}
                isPreview={isPreview}
                className="hover:opacity-70 transition-opacity"
              >
                {product.category}
              </PreviewSafeLink>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span style={{ color: NOVALUX_ULTRA_THEME.text }}>{product.title}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <ImageGallery images={images} productName={product.title} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category & Title */}
            <div>
              {product.category && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold uppercase tracking-widest mb-3 block"
                  style={{ color: NOVALUX_ULTRA_THEME.accent }}
                >
                  {product.category}
                </motion.span>
              )}
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight"
                style={{
                  fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                  color: NOVALUX_ULTRA_THEME.text,
                }}
              >
                {product.title}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    style={{
                      color: NOVALUX_ULTRA_THEME.accent,
                      fill: i < 4.5 ? NOVALUX_ULTRA_THEME.accent : 'none',
                    }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                4.8 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span
                className="text-4xl md:text-5xl font-bold"
                style={{ color: NOVALUX_ULTRA_THEME.primary }}
              >
                {formatPrice(product.price, currency)}
              </span>
              {isSale && (
                <>
                  <span
                    className="text-xl line-through"
                    style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
                  >
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: NOVALUX_ULTRA_THEME.accentGradient,
                      color: NOVALUX_ULTRA_THEME.primary,
                    }}
                  >
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-lg leading-relaxed" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
              {product.description.slice(0, 150)}...
            </p>

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.id}>
                <label
                  className="text-sm font-semibold uppercase tracking-wider mb-3 block"
                  style={{ color: NOVALUX_ULTRA_THEME.text }}
                >
                  {variant.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.values.map((value) => (
                    <motion.button
                      key={value}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          selectedVariant[variant.name] === value
                            ? NOVALUX_ULTRA_THEME.accent
                            : NOVALUX_ULTRA_THEME.backgroundAlt,
                        color:
                          selectedVariant[variant.name] === value
                            ? NOVALUX_ULTRA_THEME.primary
                            : NOVALUX_ULTRA_THEME.text,
                        border: `2px solid ${
                          selectedVariant[variant.name] === value
                            ? NOVALUX_ULTRA_THEME.accent
                            : 'transparent'
                        }`,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setSelectedVariant((prev) => ({
                          ...prev,
                          [variant.name]: value,
                        }))
                      }
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <label
                className="text-sm font-semibold uppercase tracking-wider mb-3 block"
                style={{ color: NOVALUX_ULTRA_THEME.text }}
              >
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-3 px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt,
                  }}
                >
                  <motion.button
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'white' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span
                    className="w-12 text-center font-semibold text-lg"
                    style={{ color: NOVALUX_ULTRA_THEME.text }}
                  >
                    {quantity}
                  </span>
                  <motion.button
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'white' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <span className="text-sm" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <AddToCartButton
                productId={product.id}
                storeId={1}
                productPrice={product.price}
                productName={product.title}
                quantity={quantity}
                className="flex-1 py-4 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
                style={{
                  background: NOVALUX_ULTRA_THEME.accentGradient,
                  color: NOVALUX_ULTRA_THEME.primary,
                  boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
                }}
                isPreview={isPreview}
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </AddToCartButton>

              <motion.button
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: isLiked
                    ? `${NOVALUX_ULTRA_THEME.accent}20`
                    : NOVALUX_ULTRA_THEME.backgroundAlt,
                  border: `2px solid ${isLiked ? NOVALUX_ULTRA_THEME.accent : 'transparent'}`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className="w-6 h-6"
                  style={{
                    color: isLiked ? '#ef4444' : NOVALUX_ULTRA_THEME.text,
                    fill: isLiked ? '#ef4444' : 'none',
                  }}
                />
              </motion.button>

              <motion.button
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.text }} />
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div
              className="grid grid-cols-3 gap-4 pt-6 border-t"
              style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
            >
              <TrustBadge icon={Truck} text="ফ্রি শিপিং" />
              <TrustBadge icon={Shield} text="নিরাপদ পেমেন্ট" />
              <TrustBadge icon={RotateCcw} text="সহজ ফেরত" />
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20">
          {/* Tab Navigation */}
          <div
            className="flex gap-8 border-b mb-8"
            style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
          >
            {(['description', 'specifications', 'reviews'] as const).map((tab) => (
              <motion.button
                key={tab}
                className="pb-4 text-sm font-semibold uppercase tracking-wider relative"
                style={{
                  color:
                    selectedTab === tab
                      ? NOVALUX_ULTRA_THEME.accent
                      : NOVALUX_ULTRA_THEME.textMuted,
                }}
                onClick={() => setSelectedTab(tab)}
                whileHover={{ color: NOVALUX_ULTRA_THEME.accent }}
              >
                {tab}
                {selectedTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="prose prose-lg max-w-none"
              style={{ color: NOVALUX_ULTRA_THEME.text }}
            >
              {selectedTab === 'description' && (
                <div className="space-y-4">
                  <p style={{ color: NOVALUX_ULTRA_THEME.textMuted, lineHeight: '1.8' }}>
                    {product.description}
                  </p>
                  {product.features && (
                    <ul className="grid md:grid-cols-2 gap-3 mt-6">
                      {product.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}20` }}
                          >
                            <Check
                              className="w-4 h-4"
                              style={{ color: NOVALUX_ULTRA_THEME.accent }}
                            />
                          </div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {selectedTab === 'specifications' && product.specifications && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between py-3 border-b"
                      style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
                    >
                      <span style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>{key}</span>
                      <span className="font-medium">{value}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className="space-y-6">
                  {[1, 2, 3].map((review, i) => (
                    <motion.div
                      key={review}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-2xl"
                      style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                          style={{ backgroundColor: NOVALUX_ULTRA_THEME.accent, color: 'white' }}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div>
                          <p className="font-semibold">Customer {review}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className="w-4 h-4"
                                style={{
                                  color: NOVALUX_ULTRA_THEME.accent,
                                  fill: j < 5 - i ? NOVALUX_ULTRA_THEME.accent : 'none',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                        Amazing product! The quality exceeded my expectations. Would definitely
                        recommend to anyone looking for premium items.
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2
                className="text-3xl font-semibold"
                style={{
                  fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                  color: NOVALUX_ULTRA_THEME.text,
                }}
              >
                You May Also Like
              </h2>
              <div className="flex gap-2">
                <motion.button
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                <RelatedProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  currency={currency}
                  onNavigate={onNavigate}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add to Cart */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:hidden z-50"
        style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
              Total Price
            </p>
            <p className="text-xl font-bold" style={{ color: NOVALUX_ULTRA_THEME.primary }}>
              {formatPrice(product.price * quantity, currency)}
            </p>
          </div>
          <AddToCartButton
            productId={product.id}
            storeId={1}
            productPrice={product.price}
            productName={product.title}
            quantity={quantity}
            className="flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{
              background: NOVALUX_ULTRA_THEME.accentGradient,
              color: NOVALUX_ULTRA_THEME.primary,
            }}
            isPreview={isPreview}
          >
            <ShoppingBag className="w-5 h-5" />
            Add to Cart
          </AddToCartButton>
        </div>
      </motion.div>
    </div>
  );
}

export default ProductPage;
