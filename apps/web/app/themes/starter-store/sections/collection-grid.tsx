/**
 * Collection Grid Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays products in a filterable, sortable grid for collection pages.
 */

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from '@remix-run/react';
import { ShoppingCart, Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
  ThemeConfig,
} from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'collection-grid',
  name: 'Collection Grid',
  tag: 'section',
  class: 'collection-grid',

  enabled_on: {
    templates: ['collection', 'search'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_layout',
      label: 'Layout',
    },
    {
      type: 'select',
      id: 'default_columns',
      options: [
        { value: '2', label: '2 columns' },
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
      ],
      default: '4',
      label: 'Default columns (desktop)',
    },
    {
      type: 'select',
      id: 'mobile_columns',
      options: [
        { value: '1', label: '1 column' },
        { value: '2', label: '2 columns' },
      ],
      default: '2',
      label: 'Mobile columns',
    },
    {
      type: 'range',
      id: 'products_per_page',
      min: 8,
      max: 48,
      step: 4,
      default: 16,
      label: 'Products per page',
    },
    {
      type: 'header',
      id: 'header_features',
      label: 'Features',
    },
    {
      type: 'checkbox',
      id: 'show_sort',
      label: 'Show sort dropdown',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_filter',
      label: 'Show filter button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_view_toggle',
      label: 'Show grid/list toggle',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_product_count',
      label: 'Show product count',
      default: true,
    },
    {
      type: 'header',
      id: 'header_product_card',
      label: 'Product Card',
    },
    {
      type: 'checkbox',
      id: 'show_quick_add',
      label: 'Show quick add button',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_sale_badge',
      label: 'Show sale badge',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_compare_price',
      label: 'Show compare at price',
      default: true,
    },
    {
      type: 'header',
      id: 'header_style',
      label: 'Style',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#ffffff',
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 0,
      max: 100,
      step: 4,
      default: 32,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  presets: [
    {
      name: 'Collection Grid',
      category: 'Collection',
      settings: {
        default_columns: '4',
        show_sort: true,
        show_filter: true,
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CollectionGridSettings {
  default_columns: '2' | '3' | '4';
  mobile_columns: '1' | '2';
  products_per_page: number;
  show_sort: boolean;
  show_filter: boolean;
  show_view_toggle: boolean;
  show_product_count: boolean;
  show_quick_add: boolean;
  show_sale_badge: boolean;
  show_compare_price: boolean;
  background_color: string;
  padding_top: number;
  padding_bottom: number;
}

// Demo products for preview
const DEMO_PRODUCTS: SerializedProduct[] = [
  {
    id: 1,
    title: 'ওয়্যারলেস ব্লুটুথ হেডফোন',
    price: 2499,
    compareAtPrice: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    tags: ['featured', 'new'],
  },
  {
    id: 2,
    title: 'স্মার্টওয়াচ ফিটনেস ট্র্যাকার',
    price: 3999,
    compareAtPrice: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    tags: ['featured', 'bestseller'],
  },
  {
    id: 3,
    title: 'প্রিমিয়াম লেদার ব্যাগ',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    tags: ['featured'],
  },
  {
    id: 4,
    title: 'পোর্টেবল ব্লুটুথ স্পিকার',
    price: 1899,
    compareAtPrice: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    tags: ['featured', 'new'],
  },
  {
    id: 5,
    title: 'মেকানিক্যাল কীবোর্ড',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
    tags: ['new'],
  },
  {
    id: 6,
    title: 'গেমিং মাউস',
    price: 2499,
    compareAtPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    tags: ['bestseller'],
  },
];

const sortOptions = [
  { value: 'featured', label: 'ফিচার্ড' },
  { value: 'newest', label: 'নতুন আগে' },
  { value: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { value: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { value: 'title-asc', label: 'নাম: A-Z' },
  { value: 'title-desc', label: 'নাম: Z-A' },
];

// Product Card Component
function ProductCard({
  product,
  theme,
  showQuickAdd,
  showSaleBadge,
  showComparePrice,
}: {
  product: SerializedProduct;
  theme?: ThemeConfig;
  showQuickAdd: boolean;
  showSaleBadge: boolean;
  showComparePrice: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryColor = theme?.colors?.primary || '#6366f1';
  const accentColor = theme?.colors?.accent || '#f59e0b';
  const textColor = theme?.colors?.text || '#111827';
  const mutedColor = theme?.colors?.textMuted || '#6b7280';
  const surfaceColor = theme?.colors?.surface || '#ffffff';

  const discount =
    product.compareAtPrice && product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div
          className="relative aspect-square rounded-xl overflow-hidden mb-3"
          style={{ backgroundColor: surfaceColor }}
        >
          <img
            src={product.imageUrl || '/placeholder-product.svg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showSaleBadge && discount > 0 && (
              <span
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: accentColor }}
              >
                -{discount}%
              </span>
            )}
            {product.tags?.includes('new') && (
              <span
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: primaryColor }}
              >
                নতুন
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && (
            <button
              className={`absolute bottom-2 right-2 p-2 rounded-full text-white shadow-lg transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ backgroundColor: primaryColor }}
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <h3
            className="font-medium line-clamp-2 group-hover:underline"
            style={{ color: textColor }}
          >
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: primaryColor }}>
              {formatPrice(product.price)}
            </span>
            {showComparePrice && product.compareAtPrice && (
              <span className="text-sm line-through" style={{ color: mutedColor }}>
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function CollectionGrid({ section, context, settings }: SectionComponentProps) {
  const {
    default_columns = '4',
    mobile_columns = '2',
    products_per_page = 16,
    show_sort = true,
    show_filter = true,
    show_view_toggle = true,
    show_product_count = true,
    show_quick_add = true,
    show_sale_badge = true,
    show_compare_price = true,
    background_color = '#ffffff',
    padding_top = 32,
    padding_bottom = 48,
  } = settings as unknown as CollectionGridSettings;

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Get current sort from URL
  const currentSort = searchParams.get('sort') || 'featured';

  // Use context products or demo products
  const products = context.products || DEMO_PRODUCTS;
  const totalProducts = products.length;

  // Theme colors
  const primaryColor = context.theme?.colors?.primary || '#6366f1';
  const textColor = context.theme?.colors?.text || '#111827';
  const mutedColor = context.theme?.colors?.textMuted || '#6b7280';
  const borderColor = context.theme?.colors?.border || '#e5e7eb';

  // Grid classes
  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  const mobileGridCols = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
  };

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="collection-grid"
    >
      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b"
          style={{ borderColor: borderColor }}
        >
          {/* Left: Product count & filters */}
          <div className="flex items-center gap-4">
            {show_product_count && (
              <span style={{ color: mutedColor }}>{totalProducts} টি পণ্য</span>
            )}
            {show_filter && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: borderColor, color: textColor }}
              >
                <SlidersHorizontal size={16} />
                ফিল্টার
              </button>
            )}
          </div>

          {/* Right: Sort & View toggle */}
          <div className="flex items-center gap-4">
            {show_sort && (
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm cursor-pointer"
                  style={{ borderColor: borderColor, color: textColor }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: mutedColor }}
                />
              </div>
            )}

            {show_view_toggle && (
              <div
                className="flex items-center rounded-lg border"
                style={{ borderColor: borderColor }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  style={{ color: viewMode === 'grid' ? primaryColor : mutedColor }}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  style={{ color: viewMode === 'list' ? primaryColor : mutedColor }}
                >
                  <List size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div
            className={`grid ${mobileGridCols[mobile_columns]} ${gridCols[default_columns]} gap-4 md:gap-6`}
          >
            {products.slice(0, products_per_page).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                theme={context.theme}
                showQuickAdd={show_quick_add}
                showSaleBadge={show_sale_badge}
                showComparePrice={show_compare_price}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: mutedColor }}>
              এই কালেকশনে কোনো পণ্য নেই
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 px-6 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        )}

        {/* Pagination placeholder */}
        {products.length > products_per_page && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <span
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: borderColor, color: mutedColor }}
              >
                আরো পণ্য লোড করুন
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
