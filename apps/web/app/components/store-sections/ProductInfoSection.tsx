
import React, { useState } from 'react';
import { Link } from '@remix-run/react';
import { SectionSettings } from './registry';
import { Star } from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import { sanitizeHtml } from '~/utils/sanitize';

interface ProductInfoSectionProps {
  settings: SectionSettings;
  product?: {
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    description?: string | null;
    inventory?: number | null;
    sku?: string | null;
    category?: string | null;
  };
  currency?: string;
  avgRating?: number;
  reviewCount?: number;
  showReviews?: boolean;
  theme?: {
    primaryColor?: string;
    textColor?: string;
    mutedColor?: string;
    isDarkTheme?: boolean;
    borderColor?: string;
  };
}

function StarRating({ rating, size = 'md', isDark = false }: { rating: number; size?: 'sm' | 'md' | 'lg'; isDark?: boolean }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating 
              ? 'text-amber-400 fill-amber-400' 
              : star - 0.5 <= rating 
                ? 'text-amber-400 fill-amber-200' 
                : isDark ? 'text-gray-600' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function ProductInfoSection({ settings, product, currency = 'BDT', avgRating = 0, reviewCount = 0, showReviews = false, theme }: ProductInfoSectionProps) {
  if (!product) return null;

  const primaryColor = theme?.primaryColor || '#000000';
  const textPrimary = theme?.textColor || 'text-gray-900';
  const textMuted = theme?.mutedColor || 'text-gray-500';
  const borderColor = theme?.borderColor || 'border-gray-200';
  const isDarkTheme = theme?.isDarkTheme || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        {product.category && (
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            {product.category}
          </span>
        )}
        <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>
          {product.title}
        </h1>
      </div>
      
      {/* Rating Summary */}
      {showReviews && reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={avgRating} isDark={isDarkTheme} />
          <span className={textMuted}>
            {avgRating}/5 ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <span className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className={`text-xl ${textMuted} line-through`}>
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
          </span>
        )}
      </div>
      
      {product.description && (
        <div className={`prose ${isDarkTheme ? 'prose-invert' : 'prose-gray'} max-w-none`}>
          <div 
            className={textMuted}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || '') }}
          />
        </div>
      )}
      
      {/* Stock status */}
      <div>
        {product.inventory && product.inventory > 0 ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ In Stock ({product.inventory} available)
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Out of Stock
          </span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton 
          productId={product.id} 
          disabled={!product.inventory || product.inventory <= 0}
          size="large"
          className="flex-1 py-3 md:py-4 text-base md:text-lg rounded-lg md:rounded-xl"
          style={{ backgroundColor: primaryColor }}
          productName={product.title}
          productPrice={product.price}
          currency={currency}
        >
          {settings.addToCartText || 'Add to Cart'}
        </AddToCartButton>
        <Link
          to="/cart"
          className="flex-1 inline-flex items-center justify-center py-3 md:py-4 text-base md:text-lg font-bold text-white rounded-lg md:rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#1f2937' }}
        >
          {settings.buyNowText || 'Buy Now'}
        </Link>
      </div>
      
      {/* Trust badges */}
      <div className={`grid grid-cols-3 gap-4 pt-6 border-t ${borderColor}`}>
        <div className="text-center">
          <span className="text-2xl">🚚</span>
          <p className={`text-xs ${textMuted} mt-1`}>Fast Delivery</p>
        </div>
        <div className="text-center">
          <span className="text-2xl">🔒</span>
          <p className={`text-xs ${textMuted} mt-1`}>Secure Payment</p>
        </div>
        <div className="text-center">
          <span className="text-2xl">↩️</span>
          <p className={`text-xs ${textMuted} mt-1`}>Easy Returns</p>
        </div>
      </div>
      
      {/* Product details */}
      {product.sku && (
        <div className={`pt-6 border-t ${borderColor}`}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className={textMuted}>SKU</dt>
              <dd className={`${textPrimary} font-medium`}>{product.sku}</dd>
            </div>
            {product.category && (
              <div>
                <dt className={textMuted}>Category</dt>
                <dd className={`${textPrimary} font-medium`}>{product.category}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
