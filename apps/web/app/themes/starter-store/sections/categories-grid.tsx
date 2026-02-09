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
const R2_PUBLIC_URL = 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev';

const DEFAULT_CATEGORIES = [
  {
    id: 'electronics',
    nameBn: 'ইলেকট্রনিক্স',
    image: `${R2_PUBLIC_URL}/assets/categories/category-electronics.webp`,
  },
  {
    id: 'fashion',
    nameBn: 'ফ্যাশন',
    image: `${R2_PUBLIC_URL}/assets/categories/category-fashion.webp`,
  },
  {
    id: 'home',
    nameBn: 'হোম ডেকর',
    image: `${R2_PUBLIC_URL}/assets/categories/category-home.webp`,
  },
  {
    id: 'beauty',
    nameBn: 'বিউটি',
    image: `${R2_PUBLIC_URL}/assets/categories/category-beauty.webp`,
  },
  {
    id: 'sports',
    nameBn: 'খেলাধুলা',
    image: `${R2_PUBLIC_URL}/assets/categories/category-sports.webp`,
  },
  {
    id: 'toys',
    nameBn: 'খেলনা',
    image: `${R2_PUBLIC_URL}/assets/categories/category-toys.webp`,
  },
  {
    id: 'books',
    nameBn: 'বই',
    image: `${R2_PUBLIC_URL}/assets/categories/category-books.webp`,
  },
  {
    id: 'accessories',
    nameBn: 'এক্সেসরিজ',
    image: `${R2_PUBLIC_URL}/assets/categories/category-accessories.webp`,
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  electronics: DEFAULT_CATEGORIES[0].image,
  fashion: DEFAULT_CATEGORIES[1].image,
  home: DEFAULT_CATEGORIES[2].image,
  beauty: DEFAULT_CATEGORIES[3].image,
  sports: DEFAULT_CATEGORIES[4].image,
  toys: DEFAULT_CATEGORIES[5].image,
  books: DEFAULT_CATEGORIES[6].image,
  accessories: DEFAULT_CATEGORIES[7].image,
  'home-living': DEFAULT_CATEGORIES[2].image,
};

export default function CategoriesGrid({
  section,
  context,
  settings,
}: SectionComponentProps) {
  const {
    heading = 'ক্যাটাগরি',
    subheading,
    columns = '4',
    items_count = 8,
    image_ratio = 'square',
    background_color = '#f9fafb',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as CategoriesGridSettings;

  // Use collections from context or default categories
  const collections = context.collections?.slice(0, items_count) || [];
  
  const getCategoryImage = (slug: string) => {
    // Try to match partial slugs if exact match fails
    const lowerSlug = slug.toLowerCase();
    if (CATEGORY_IMAGES[lowerSlug]) return CATEGORY_IMAGES[lowerSlug];
    if (lowerSlug.includes('electron')) return CATEGORY_IMAGES.electronics;
    if (lowerSlug.includes('fashion') || lowerSlug.includes('cloth')) return CATEGORY_IMAGES.fashion;
    if (lowerSlug.includes('home') || lowerSlug.includes('decor')) return CATEGORY_IMAGES.home;
    if (lowerSlug.includes('beauty') || lowerSlug.includes('cosmetic')) return CATEGORY_IMAGES.beauty;
    if (lowerSlug.includes('sport') || lowerSlug.includes('fit')) return CATEGORY_IMAGES.sports;
    if (lowerSlug.includes('toy') || lowerSlug.includes('game') || lowerSlug.includes('kid')) return CATEGORY_IMAGES.toys;
    if (lowerSlug.includes('book') || lowerSlug.includes('read')) return CATEGORY_IMAGES.books;
    if (lowerSlug.includes('access') || lowerSlug.includes('watch') || lowerSlug.includes('jewel')) return CATEGORY_IMAGES.accessories;
    return DEFAULT_CATEGORIES[0].image;
  };

  const categories =
    collections.length > 0
      ? collections.map((c) => ({
          id: c.slug,
          nameBn: c.title,
          image: c.imageUrl || getCategoryImage(c.slug),
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
