import { useState } from 'react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { AddToCartButton } from '~/components/AddToCartButton';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { resolveStarterStoreTheme, starterStoreTheme } from '../theme';
import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { useTranslation } from 'react-i18next';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';

export interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  inStock?: boolean;
  currency?: string;
  primaryColor?: string;
  accentColor?: string;
  onAddToCart?: (id: string | number) => void;
}

/**
 * Format price with comma separator for thousands
 */
function formatPrice(price: number, currency: string = 'BDT'): string {
  const formatted = price.toLocaleString('en-IN');
  const symbol = currency === 'BDT' ? '৳' : currency;
  return `${symbol}${formatted}`;
}

/**
 * Calculate discount percentage
 */
function calculateDiscount(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Render star rating component
 */
function StarRating({ 
  rating = 0, 
  reviewCount = 0,
  accentColor 
}: { 
  rating?: number; 
  reviewCount?: number;
  accentColor: string;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            fill={i < fullStars || (i === fullStars && hasHalfStar) ? accentColor : 'transparent'}
            stroke={i < fullStars || (i === fullStars && hasHalfStar) ? accentColor : '#D1D5DB'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="text-xs" style={{ color: starterStoreTheme.colors.text.muted }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

/**
 * Modern, conversion-optimized Product Card component
 */
export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount = 0,
  category,
  inStock = true,
  currency = 'BDT',
  primaryColor = starterStoreTheme.colors.primary,
  accentColor = starterStoreTheme.colors.accent,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = calculateDiscount(price, originalPrice);
  const imageUrl = image || '/placeholder-product.svg';
  const isRemoteImage = Boolean(image);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view functionality can be implemented here
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id);
  };

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={isRemoteImage ? buildProxyImageUrl(imageUrl, { width: 640, quality: 75 }) : imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          srcSet={isRemoteImage ? generateProxySrcset(imageUrl, [320, 480, 640], 75) : undefined}
          sizes={isRemoteImage ? '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw' : undefined}
          decoding="async"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: accentColor }}
          >
            {discount}% OFF
          </span>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlistClick}
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
            aria-label="Add to wishlist"
          >
            <Heart
              className="w-4.5 h-4.5"
              fill={isWishlisted ? '#EF4444' : 'transparent'}
              stroke={isWishlisted ? '#EF4444' : '#6B7280'}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={handleQuickViewClick}
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
            aria-label="Quick view"
          >
            <Eye className="w-4.5 h-4.5 text-gray-500" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: starterStoreTheme.colors.text.muted }}>
            {category}
          </p>
        )}

        {/* Product Name */}
        <h3
          className="font-semibold line-clamp-2 mb-2 min-h-[2.5rem]"
          style={{ color: starterStoreTheme.colors.text.primary }}
        >
          {name}
        </h3>

        {/* Star Rating */}
        {(rating > 0 || reviewCount > 0) && (
          <div className="mb-2">
            <StarRating rating={rating} reviewCount={reviewCount} accentColor={accentColor} />
          </div>
        )}

        {/* Price Row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold" style={{ color: primaryColor }}>
            {formatPrice(price, currency)}
          </span>
          {originalPrice && originalPrice > price && (
            <>
              <span
                className="text-sm line-through"
                style={{ color: starterStoreTheme.colors.text.muted }}
              >
                {formatPrice(originalPrice, currency)}
              </span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${accentColor}20`,
                  color: accentColor 
                }}
              >
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {inStock ? (
            <span
              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${starterStoreTheme.colors.success}15`,
                color: starterStoreTheme.colors.success 
              }}
            >
              In Stock
            </span>
          ) : (
            <span
              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${starterStoreTheme.colors.error}15`,
                color: starterStoreTheme.colors.error 
              }}
            >
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: inStock ? primaryColor : starterStoreTheme.colors.text.muted,
          }}
          onMouseEnter={(e) => {
            if (inStock) {
              e.currentTarget.style.backgroundColor = starterStoreTheme.colors.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (inStock) {
              e.currentTarget.style.backgroundColor = primaryColor;
            }
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/**
 * StarterProductCard - Wrapper for backward compatibility with existing store templates
 * Maps SerializedProduct to ProductCardProps
 */
export function StarterProductCard({
  product,
  currency = 'BDT',
  storeId = 0,
  theme,
  isPreview = false,
}: {
  product: SerializedProduct;
  currency?: string;
  storeId?: number;
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}) {
  const resolvedTheme = resolveStarterStoreTheme(undefined, theme);
  const { t } = useTranslation();
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  const imageUrl = product.imageUrl || '/placeholder-product.svg';
  const isRemoteImage = Boolean(product.imageUrl);

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <PreviewSafeLink
        to={`/products/${product.id}`}
        isPreview={isPreview}
        className="block"
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={isRemoteImage ? buildProxyImageUrl(imageUrl, { width: 640, quality: 75 }) : imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            srcSet={isRemoteImage ? generateProxySrcset(imageUrl, [320, 480, 640], 75) : undefined}
            sizes={isRemoteImage ? '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw' : undefined}
            decoding="async"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <span
              className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: resolvedTheme.accent }}
            >
              {discount}% OFF
            </span>
          )}

          {/* Quick Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Product Name */}
          <h3
            className="font-semibold line-clamp-2 mb-2 min-h-[2.5rem] group-hover:underline"
            style={{ color: resolvedTheme.text }}
          >
            {product.title}
          </h3>

          {/* Price Row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold" style={{ color: resolvedTheme.primary }}>
              {formatPrice(product.price, currency)}
            </span>
            {product.compareAtPrice && (
              <>
                <span
                  className="text-sm line-through"
                  style={{ color: resolvedTheme.muted }}
                >
                  {formatPrice(product.compareAtPrice, currency)}
                </span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${resolvedTheme.accent}20`,
                    color: resolvedTheme.accent,
                  }}
                >
                  -{discount}%
                </span>
              </>
            )}
          </div>
        </div>
      </PreviewSafeLink>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <AddToCartButton
          productId={product.id}
          storeId={storeId}
          productName={product.title}
          productPrice={product.price}
          currency={currency}
          isPreview={isPreview}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 flex items-center justify-center gap-2"
          style={{ backgroundColor: resolvedTheme.primary }}
        >
          <ShoppingCart className="w-4 h-4" />
          {t('store.addToCart', 'Add to Cart')}
        </AddToCartButton>
      </div>
    </div>
  );
}
