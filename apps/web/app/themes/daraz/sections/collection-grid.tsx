/**
 * Daraz Collection Grid Section
 *
 * Shopify OS 2.0 Compatible Section
 * Product grid for collection pages with Daraz-style design:
 * - Sort and filter options
 * - Responsive grid layout
 * - Product cards with ratings and discounts
 */

import { useState } from 'react';
import { Link } from '@remix-run/react';
import { Star, Heart, Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
} from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'collection-grid',
  name: 'Collection Grid (Daraz)',
  tag: 'section',
  class: 'daraz-collection-grid',

  enabled_on: {
    templates: ['collection'],
  },

  settings: [
    {
      type: 'select',
      id: 'default_columns',
      label: 'Default columns',
      options: [
        { value: '4', label: '4 columns' },
        { value: '5', label: '5 columns' },
        { value: '6', label: '6 columns' },
      ],
      default: '5',
    },
    {
      type: 'select',
      id: 'mobile_columns',
      label: 'Mobile columns',
      options: [
        { value: '1', label: '1 column' },
        { value: '2', label: '2 columns' },
      ],
      default: '2',
    },
    {
      type: 'range',
      id: 'products_per_page',
      min: 12,
      max: 48,
      step: 12,
      default: 24,
      label: 'Products per page',
    },
    {
      type: 'checkbox',
      id: 'show_sort',
      label: 'Show sort dropdown',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_view_toggle',
      label: 'Show view toggle',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_product_count',
      label: 'Show product count',
      default: true,
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
      label: 'Show wishlist button',
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

  presets: [
    {
      name: 'Daraz Collection Grid',
      category: 'Collection',
      settings: {
        default_columns: '5',
        show_rating: true,
        primary_color: '#F85606',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface DarazCollectionGridSettings {
  default_columns: '4' | '5' | '6';
  mobile_columns: '1' | '2';
  products_per_page: number;
  show_sort: boolean;
  show_view_toggle: boolean;
  show_product_count: boolean;
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
    rating: 3.5 + (seed % 20) / 10,
    count: 10 + ((seed * 7) % 500),
  };
}

export default function DarazCollectionGrid({ section, context, settings }: SectionComponentProps) {
  const {
    default_columns = '5',
    mobile_columns = '2',
    products_per_page = 24,
    show_sort = true,
    show_view_toggle = true,
    show_product_count = true,
    show_rating = true,
    show_discount_badge = true,
    show_wishlist = true,
    primary_color = '#F85606',
    price_color = '#F36D00',
  } = settings as unknown as DarazCollectionGridSettings;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  // Get products from context
  const products = (context.products || []).slice(0, products_per_page);

  if (products.length === 0) {
    return (
      <section
        className="bg-white rounded-lg shadow-sm p-8 text-center"
        data-section-id={section.id}
        data-section-type="daraz-collection-grid"
      >
        <p className="text-gray-500">No products found in this collection.</p>
      </section>
    );
  }

  const gridColsMap = {
    '4': 'sm:grid-cols-3 md:grid-cols-4',
    '5': 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    '6': 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  const mobileColsMap = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
  };

  return (
    <section
      className="bg-white rounded-lg shadow-sm p-4 md:p-6"
      data-section-id={section.id}
      data-section-type="daraz-collection-grid"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {show_product_count && (
            <span className="text-sm text-gray-600">{products.length} products</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          {show_sort && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          )}

          {/* View Toggle */}
          {show_view_toggle && (
            <div className="hidden md:flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-label="Grid view"
              >
                <Grid
                  size={16}
                  className={viewMode === 'grid' ? 'text-gray-800' : 'text-gray-400'}
                />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-label="List view"
              >
                <List
                  size={16}
                  className={viewMode === 'list' ? 'text-gray-800' : 'text-gray-400'}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div
        className={`grid ${mobileColsMap[mobile_columns]} ${gridColsMap[default_columns]} gap-3 md:gap-4`}
      >
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

                {/* Wishlist Button */}
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
                    ৳{(product.price / 100).toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] md:text-xs line-through text-gray-400">
                      ৳{(product.compareAtPrice! / 100).toLocaleString()}
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
