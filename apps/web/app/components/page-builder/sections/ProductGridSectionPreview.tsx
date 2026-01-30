/**
 * Product Grid Section Preview
 *
 * Displays multiple products in a grid layout.
 * Used for multi-product landing pages.
 */

import { ShoppingCart, Tag } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

interface ProductItem {
  id?: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  badge?: string;
}

interface ProductGridProps {
  // Header
  title?: string;
  subtitle?: string;

  // Products
  products?: ProductItem[];
  productIds?: number[];

  // Layout
  columns?: '2' | '3' | '4';
  variant?: 'grid' | 'carousel' | 'featured';

  // Card Style
  showPrice?: boolean;
  showComparePrice?: boolean;
  showBadge?: boolean;
  showAddToCart?: boolean;

  // CTA
  buttonText?: string;
  buttonStyle?: 'solid' | 'outline';

  // Styling
  bgColor?: string;
  cardBgColor?: string;
  textColor?: string;
  priceColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;

  // Image
  imageAspectRatio?: 'square' | 'portrait' | 'landscape';
  imageRounded?: boolean;
}

export function ProductGridSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'আমাদের প্রোডাক্ট',
    subtitle = 'সেরা মানের পণ্য সমূহ',
    products = [],
    productIds = [],
    columns = '3',
    variant = 'grid',
    showPrice = true,
    showComparePrice = true,
    showBadge = true,
    showAddToCart = true,
    buttonText = 'অর্ডার করুন',
    buttonStyle = 'solid',
    bgColor = '#FFFFFF',
    cardBgColor = '#F9FAFB',
    textColor = '#111827',
    priceColor = '#10B981',
    buttonBgColor = '#6366F1',
    buttonTextColor = '#FFFFFF',
    imageAspectRatio = 'square',
    imageRounded = true,
  } = props as ProductGridProps;

  // Use products array if provided, otherwise show placeholder
  const displayProducts: ProductItem[] =
    products.length > 0
      ? products
      : productIds.length > 0
        ? productIds.map((id, idx) => ({
            id,
            name: `প্রোডাক্ট ${idx + 1}`,
            price: 1490 + idx * 200,
            compareAtPrice: 1990 + idx * 200,
            badge: idx === 0 ? 'বেস্ট সেলার' : undefined,
          }))
        : [
            { name: 'প্রোডাক্ট ১', price: 1490, compareAtPrice: 1990, badge: 'বেস্ট সেলার' },
            { name: 'প্রোডাক্ট ২', price: 1690, compareAtPrice: 2190 },
            { name: 'প্রোডাক্ট ৩', price: 1890, compareAtPrice: 2490, badge: 'নতুন' },
          ];

  const gridCols = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <section className="py-12 px-4" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
        )}

        {/* Product Grid */}
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {displayProducts.map((product, index) => (
            <div
              key={product.id || index}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
              style={{
                backgroundColor: cardBgColor,
                borderRadius: imageRounded ? '0.75rem' : '0',
              }}
            >
              {/* Badge */}
              {showBadge && product.badge && (
                <div
                  className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-semibold rounded-full"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  {product.badge}
                </div>
              )}

              {/* Product Image */}
              <div
                className={`${aspectRatioClass[imageAspectRatio]} bg-gray-200 flex items-center justify-center overflow-hidden`}
                style={{ borderRadius: imageRounded ? '0.75rem 0.75rem 0 0' : '0' }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">📦</div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

                {/* Price */}
                {showPrice && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold" style={{ color: priceColor }}>
                      ৳{product.price.toLocaleString()}
                    </span>
                    {showComparePrice &&
                      product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ৳{product.compareAtPrice.toLocaleString()}
                          </span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: priceColor }}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {showComparePrice && product.compareAtPrice && product.compareAtPrice > product.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                        </>
                      )}
                  </div>
                )}

                {/* Add to Cart Button */}
                {showAddToCart && (
                  <button
                    className={`w-full py-2.5 px-4 font-medium flex items-center justify-center gap-2 transition-all ${
                      buttonStyle === 'outline'
                        ? 'border-2 bg-transparent hover:bg-opacity-10'
                        : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: buttonStyle === 'outline' ? 'transparent' : buttonBgColor,
                      color: buttonStyle === 'outline' ? buttonBgColor : buttonTextColor,
                      borderColor: buttonBgColor,
                      borderRadius: '0.5rem',
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>কোনো প্রোডাক্ট নেই</p>
          </div>
        )}
      </div>
    </section>
  );
}
