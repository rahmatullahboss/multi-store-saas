/**
 * Tech Modern - Featured Products Section
 *
 * Modern product grid with:
 * - Rounded cards with hover effects
 * - Blue accent badges
 * - Star ratings
 * - Add to cart buttons
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';
import { Heart, ShoppingCart, Star } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Featured Products',
  tag: 'section',
  class: 'tech-featured-products',

  enabled_on: {
    templates: ['index', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Latest Arrivals',
    },
    {
      type: 'text',
      id: 'heading_bn',
      label: 'Heading (Bangla)',
      default: 'সর্বশেষ পণ্য',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Explore our newest collection of premium gadgets.',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
    },
    {
      type: 'range',
      id: 'products_to_show',
      label: 'Products to show',
      min: 4,
      max: 16,
      step: 4,
      default: 8,
    },
    {
      type: 'select',
      id: 'columns',
      label: 'Columns',
      options: [
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
      ],
      default: '4',
    },
    {
      type: 'checkbox',
      id: 'show_view_all',
      label: 'Show View All button',
      default: true,
    },
  ],

  presets: [
    {
      name: 'Featured Products',
      category: 'Products',
      settings: {
        heading: 'Latest Arrivals',
        subheading: 'Explore our newest collection of premium gadgets.',
        products_to_show: 8,
        columns: '4',
        show_view_all: true,
      },
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface FeaturedProductsSettings {
  heading: string;
  heading_bn?: string;
  subheading?: string;
  collection?: string;
  products_to_show: number;
  columns: '3' | '4';
  show_view_all: boolean;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  background: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  cardBg: '#ffffff',
  cardHover: '#3b82f6',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechFeaturedProducts({
  section,
  context,
  settings,
}: SectionComponentProps) {
  const config = settings as unknown as FeaturedProductsSettings;
  const { products = [], getLink, store } = context;

  const displayProducts = products.slice(0, config.products_to_show);
  const currency = store.currency || 'BDT';

  const gridCols = config.columns === '3' ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <section
      data-section-id={section.id}
      className="py-16 md:py-24"
      style={{ backgroundColor: THEME.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {config.heading && (
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: THEME.primary }}
            >
              {config.heading}
            </h2>
          )}
          {config.subheading && (
            <p className="text-lg" style={{ color: THEME.muted }}>
              {config.subheading}
            </p>
          )}
        </div>

        {/* Product Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-6`}>
          {displayProducts.map((product) => {
            const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
            const discount = isSale
              ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={getLink?.(`/products/${product.id}`) || '#'}
                className="group bg-white rounded-2xl border-2 border-transparent overflow-hidden transition-all hover:shadow-xl"
                style={
                  {
                    '--hover-border': THEME.cardHover,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = THEME.cardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📱
                    </div>
                  )}

                  {/* Sale Badge */}
                  {isSale && (
                    <span
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded"
                      style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    >
                      -{discount}%
                    </span>
                  )}

                  {/* Wishlist */}
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  {product.category && (
                    <span
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: THEME.accent }}
                    >
                      {product.category}
                    </span>
                  )}

                  <h3
                    className="font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
                    style={{ color: THEME.text }}
                  >
                    {product.title}
                  </h3>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm ml-1" style={{ color: THEME.muted }}>
                      (24)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                        {formatPrice(product.price)}
                      </span>
                      {isSale && (
                        <span className="text-sm line-through ml-2" style={{ color: THEME.muted }}>
                          {formatPrice(product.compareAtPrice!)}
                        </span>
                      )}
                    </div>

                    <button
                      className="p-3 rounded-xl transition-all hover:scale-110"
                      style={{ backgroundColor: THEME.accent, color: 'white' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        {config.show_view_all && (
          <div className="text-center mt-12">
            <a
              href={getLink?.('/collections/all') || '/collections/all'}
              className="inline-block px-8 py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900"
              style={{ borderColor: THEME.primary, color: THEME.primary }}
            >
              View All Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
