/**
 * Featured Collection Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays products from a featured collection.
 */

import { Link } from '@remix-run/react';
import { ShoppingCart, Star } from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
} from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Featured Collection',
  tag: 'section',
  class: 'featured-collection',

  enabled_on: {
    templates: ['index', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'ফিচার্ড পণ্য',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
    },
    {
      type: 'collection',
      id: 'collection',
      label: 'Collection',
    },
    {
      type: 'range',
      id: 'products_count',
      min: 2,
      max: 12,
      step: 1,
      default: 4,
      label: 'Products to show',
    },
    {
      type: 'select',
      id: 'columns',
      options: [
        { value: '2', label: '2 columns' },
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
      ],
      default: '4',
      label: 'Columns (desktop)',
    },
    {
      type: 'checkbox',
      id: 'show_view_all',
      label: 'Show "View All" link',
      default: true,
    },
    {
      type: 'text',
      id: 'view_all_label',
      label: 'View all label',
      default: 'সব দেখুন →',
    },
    {
      type: 'url',
      id: 'view_all_link',
      label: 'View all link',
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
      default: 48,
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
      name: 'Featured Collection',
      category: 'Products',
      settings: {
        heading: 'ফিচার্ড পণ্য',
        products_count: 4,
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface FeaturedCollectionSettings {
  heading: string;
  subheading?: string;
  collection?: number;
  products_count: number;
  columns: '2' | '3' | '4';
  show_view_all: boolean;
  view_all_label: string;
  view_all_link?: string;
  background_color: string;
  padding_top: number;
  padding_bottom: number;
}

// Product Card Component (internal)
function ProductCard({
  product,
  theme,
  currency,
}: {
  product: SerializedProduct;
  theme?: any;
  currency?: string;
}) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const primaryColor = theme?.colors?.primary || '#6366f1';
  const accentColor = theme?.colors?.accent || '#f59e0b';
  const textColor = theme?.colors?.text || '#111827';
  const mutedColor = theme?.colors?.textMuted || '#6b7280';
  const surfaceColor = theme?.colors?.surface || '#ffffff';

  return (
    <div className="group">
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
          {discount > 0 && (
            <span
              className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              -{discount}%
            </span>
          )}
          {product.tags?.includes('new') && (
            <span
              className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: primaryColor }}
            >
              নতুন
            </span>
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
              {formatPrice(product.price, currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm line-through" style={{ color: mutedColor }}>
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
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
];

export default function FeaturedCollection({ section, context, settings }: SectionComponentProps) {
  const {
    heading = 'ফিচার্ড পণ্য',
    subheading,
    products_count = 4,
    columns = '4',
    show_view_all = true,
    view_all_label = 'সব দেখুন →',
    view_all_link = '/products',
    background_color = '#ffffff',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as FeaturedCollectionSettings;

  // Use context products or demo products
  const products =
    context.products?.slice(0, products_count) || DEMO_PRODUCTS.slice(0, products_count);

  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  }[columns];

  const textColor = context.theme?.colors?.text || '#111827';
  const primaryColor = context.theme?.colors?.primary || '#6366f1';

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="featured-collection"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {heading && (
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>
              {heading}
            </h2>
          )}
          {show_view_all && (
            <Link
              to={view_all_link || '/products'}
              className="text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              {view_all_label}
            </Link>
          )}
        </div>
        {subheading && (
          <p
            className="-mt-4 mb-8"
            style={{ color: context.theme?.colors?.textMuted || '#6b7280' }}
          >
            {subheading}
          </p>
        )}

        {/* Products Grid */}
        <div className={`grid grid-cols-2 ${gridCols} gap-4 md:gap-6`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              theme={context.theme}
              currency={context.store?.currency}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
