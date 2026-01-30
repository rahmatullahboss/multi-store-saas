/**
 * Luxe Boutique - Featured Collection Section
 *
 * Product grid with:
 * - Elegant serif headings
 * - Portrait aspect ratio cards
 * - Gold sale badges
 * - Hover zoom effect
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';
import { Heart } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Featured Collection',
  tag: 'section',
  class: 'luxe-featured-collection',

  enabled_on: {
    templates: ['index', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Featured Collection',
    },
    {
      type: 'text',
      id: 'heading_bn',
      label: 'Heading (Bangla)',
      default: 'বিশেষ সংগ্রহ',
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
    {
      type: 'text',
      id: 'view_all_text',
      label: 'View All text',
      default: 'View All',
    },
    {
      type: 'text',
      id: 'view_all_text_bn',
      label: 'View All text (Bangla)',
      default: 'সব দেখুন',
    },
  ],

  presets: [
    {
      name: 'Featured Collection',
      category: 'Products',
      settings: {
        heading: 'Featured Collection',
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

interface FeaturedCollectionSettings {
  heading: string;
  heading_bn?: string;
  collection?: string;
  products_to_show: number;
  columns: '3' | '4';
  show_view_all: boolean;
  view_all_text: string;
  view_all_text_bn?: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  background: '#faf9f7',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  cardBg: '#ffffff',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeFeaturedCollection({
  section,
  context,
  settings,
}: SectionComponentProps) {
  const config = settings as unknown as FeaturedCollectionSettings;
  const { products = [], getLink, store } = context;

  const displayProducts = products.slice(0, config.products_to_show);
  const currency = store.currency || 'BDT';

  const formatPrice = (price: number) => {
    if (currency === 'BDT') return `৳${(price / 100).toLocaleString('bn-BD')}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  const gridCols = config.columns === '3' ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <section
      data-section-id={section.id}
      className="py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: THEME.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        {config.heading && (
          <div className="text-center mb-10 lg:mb-14">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: THEME.primary,
              }}
            >
              {config.heading}
            </h2>
            <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: THEME.accent }} />
          </div>
        )}

        {/* Product Grid */}
        <div className={`grid grid-cols-2 ${gridCols} gap-4 sm:gap-6 lg:gap-8`}>
          {displayProducts.map((product) => {
            const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
            const discount = isSale
              ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={getLink?.(`/products/${product.id}`) || '#'}
                className="group"
              >
                {/* Image */}
                <div
                  className="aspect-[3/4] overflow-hidden mb-4 relative"
                  style={{ backgroundColor: THEME.cardBg }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ color: THEME.muted }}
                    >
                      No Image
                    </div>
                  )}

                  {/* Sale Badge */}
                  {isSale && (
                    <div
                      className="absolute top-3 left-3 px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: THEME.accent,
                        color: THEME.primary,
                      }}
                    >
                      -{discount}%
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="w-4 h-4" style={{ color: THEME.primary }} />
                  </button>
                </div>

                {/* Info */}
                <div className="text-center">
                  {product.category && (
                    <p
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ color: THEME.muted }}
                    >
                      {product.category}
                    </p>
                  )}
                  <h3
                    className="text-sm font-medium mb-2 line-clamp-1"
                    style={{ color: THEME.text }}
                  >
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-semibold" style={{ color: THEME.primary }}>
                      {formatPrice(product.price)}
                    </span>
                    {isSale && (
                      <span className="text-sm line-through" style={{ color: THEME.muted }}>
                        {formatPrice(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        {config.show_view_all && (
          <div className="text-center mt-10 lg:mt-14">
            <a
              href={getLink?.('/collections/all') || '/collections/all'}
              className="inline-block px-8 py-3 text-sm font-medium tracking-wider uppercase border transition-all duration-300 hover:bg-black hover:text-white"
              style={{
                borderColor: THEME.primary,
                color: THEME.primary,
              }}
            >
              {config.view_all_text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
