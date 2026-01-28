/**
 * Daraz Product Grid Section
 *
 * Shopify OS 2.0 Compatible Section
 * 6-column responsive product grid for "Just For You" section
 *
 * Features:
 * - Responsive grid layout
 * - Product cards with discount badges
 * - Star ratings
 * - Hover effects
 */

import { Link } from '@remix-run/react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Product Grid (Daraz)',
  tag: 'section',
  class: 'daraz-product-grid',
  limit: 3,

  enabled_on: {
    templates: ['index', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Section title',
      default: 'Just For You',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
      info: 'Select a collection to display products from',
    },
    {
      type: 'range',
      id: 'products_count',
      min: 6,
      max: 48,
      step: 6,
      default: 24,
      label: 'Number of products',
    },
    {
      type: 'select',
      id: 'columns',
      label: 'Columns',
      options: [
        { value: '4', label: '4 columns' },
        { value: '5', label: '5 columns' },
        { value: '6', label: '6 columns (Daraz default)' },
      ],
      default: '6',
    },
    {
      type: 'checkbox',
      id: 'show_rating',
      label: 'Show product rating',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_discount_badge',
      label: 'Show discount badge',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_wishlist',
      label: 'Show wishlist button on hover',
      default: true,
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
    {
      type: 'color',
      id: 'price_color',
      label: 'Price color',
      default: '#F36D00',
    },
  ],

  blocks: [],

  presets: [
    {
      name: 'Daraz Product Grid',
      category: 'Products',
      settings: {
        title: 'Just For You',
        products_count: 24,
        columns: '6',
        show_rating: true,
        show_discount_badge: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface ProductGridSettings {
  title: string;
  collection?: number;
  products_count: number;
  columns: '4' | '5' | '6';
  show_rating: boolean;
  show_discount_badge: boolean;
  show_wishlist: boolean;
  primary_color: string;
  price_color: string;
}

// Generate pseudo-random rating based on product id
function getProductRating(productId: number): { rating: number; count: number } {
  const seed = productId % 100;
  return {
    rating: 3.5 + (seed % 20) / 10, // 3.5 - 5.0
    count: 10 + ((seed * 7) % 500), // 10 - 500 reviews
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazProductGrid({ section, context, settings }: SectionComponentProps) {
  const config = settings as unknown as ProductGridSettings;

  const {
    title = 'Just For You',
    products_count = 24,
    columns = '6',
    show_rating = true,
    show_discount_badge = true,
    show_wishlist = true,
    primary_color = '#F85606',
    price_color = '#F36D00',
  } = config;

  // Get products from context
  const products = (context.products || []).slice(0, products_count);

  if (products.length === 0) return null;

  const gridCols = {
    '4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    '5': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    '6': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  return (
    <section
      className="bg-white rounded-lg shadow-sm mb-6 p-4"
      data-section-id={section.id}
      data-section-type="daraz-product-grid"
    >
      {title && <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>}

      <div className={`grid ${gridCols[columns]} gap-3 md:gap-4`}>
        {products.map((product) => {
          const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
          const discountPercent = hasDiscount
            ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
            : 0;

          const { rating, count: reviewCount } = getProductRating(product.id);
          const fullStars = Math.floor(rating);
          const hasHalfStar = rating % 1 >= 0.5;

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group block bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={product.imageUrl || '/placeholder-product.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Discount Badge */}
                {show_discount_badge && hasDiscount && (
                  <span
                    className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
                    style={{ backgroundColor: primary_color }}
                  >
                    -{discountPercent}%
                  </span>
                )}

                {/* Wishlist Button (on hover) */}
                {show_wishlist && (
                  <button
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Add to wishlist
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                {/* Title */}
                <h3 className="text-xs md:text-sm line-clamp-2 mb-2 min-h-[2.5em] transition-colors text-gray-800 group-hover:text-orange-500">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-sm md:text-base font-bold" style={{ color: price_color }}>
                    ৳{product.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] md:text-xs line-through text-gray-400">
                      ৳{product.compareAtPrice!.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {show_rating && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < fullStars
                              ? 'fill-yellow-400 text-yellow-400'
                              : i === fullStars && hasHalfStar
                                ? 'fill-yellow-400/50 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">({reviewCount})</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
