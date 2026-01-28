/**
 * Categories Grid Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays collection/category images in a grid.
 */

import { Link } from '@remix-run/react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Categories Grid',
  tag: 'section',
  class: 'categories-grid',

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'ক্যাটাগরি',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
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
      type: 'range',
      id: 'items_count',
      min: 2,
      max: 8,
      step: 1,
      default: 4,
      label: 'Number of categories to show',
    },
    {
      type: 'select',
      id: 'image_ratio',
      options: [
        { value: 'square', label: 'Square (1:1)' },
        { value: 'portrait', label: 'Portrait (2:3)' },
        { value: 'landscape', label: 'Landscape (3:2)' },
      ],
      default: 'square',
      label: 'Image ratio',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#f9fafb',
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

  blocks: [
    {
      type: 'category',
      name: 'Category',
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Category',
        },
        {
          type: 'image_picker',
          id: 'image',
          label: 'Image',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Categories Grid',
      category: 'Collections',
      settings: {
        heading: 'ক্যাটাগরি',
      },
      blocks: [
        { type: 'category', settings: { title: 'ইলেকট্রনিক্স' } },
        { type: 'category', settings: { title: 'ফ্যাশন' } },
        { type: 'category', settings: { title: 'হোম ডেকর' } },
        { type: 'category', settings: { title: 'বিউটি' } },
      ],
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CategoriesGridSettings {
  heading: string;
  subheading?: string;
  columns: '2' | '3' | '4';
  items_count: number;
  image_ratio: 'square' | 'portrait' | 'landscape';
  background_color: string;
  padding_top: number;
  padding_bottom: number;
}

const aspectRatioMap = {
  square: 'aspect-square',
  portrait: 'aspect-[2/3]',
  landscape: 'aspect-[3/2]',
};

// Default category data for demo
const DEFAULT_CATEGORIES = [
  {
    id: 'electronics',
    nameBn: 'ইলেকট্রনিক্স',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
  },
  {
    id: 'fashion',
    nameBn: 'ফ্যাশন',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  },
  {
    id: 'home-living',
    nameBn: 'হোম ডেকর',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop',
  },
  {
    id: 'beauty',
    nameBn: 'বিউটি',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  },
];

export default function CategoriesGrid({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    heading = 'ক্যাটাগরি',
    subheading,
    columns = '4',
    items_count = 4,
    image_ratio = 'square',
    background_color = '#f9fafb',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as CategoriesGridSettings;

  // Use collections from context or default categories
  const collections = context.collections?.slice(0, items_count) || [];
  const categories =
    collections.length > 0
      ? collections.map((c) => ({
          id: c.slug,
          nameBn: c.title,
          image: c.imageUrl || DEFAULT_CATEGORIES[0].image,
        }))
      : DEFAULT_CATEGORIES.slice(0, items_count);

  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  }[columns];

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="categories-grid"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {heading && (
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: context.theme?.colors?.text || '#111827' }}
          >
            {heading}
          </h2>
        )}
        {subheading && (
          <p
            className="text-center mb-8 -mt-4"
            style={{ color: context.theme?.colors?.textMuted || '#6b7280' }}
          >
            {subheading}
          </p>
        )}

        {/* Grid */}
        <div className={`grid grid-cols-2 ${gridCols} gap-4`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/collections/${category.id}`}
              className={`relative ${aspectRatioMap[image_ratio]} rounded-xl overflow-hidden group`}
            >
              <img
                src={category.image}
                alt={category.nameBn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{category.nameBn}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
