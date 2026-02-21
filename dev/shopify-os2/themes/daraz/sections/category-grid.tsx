/**
 * Daraz Category Grid Section
 *
 * Shopify OS 2.0 Compatible Section
 * 2-row category icon grid matching Daraz Bangladesh homepage
 *
 * Features:
 * - Square/circular category icons with labels
 * - 8 categories per row (responsive)
 * - Hover effects
 * - Auto-detect icons based on category name
 */

import { Link } from '@remix-run/react';
import {
  Shirt,
  Home,
  Smartphone,
  Tv,
  Gift,
  Heart,
  Car,
  Utensils,
  Baby,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Laptop,
  Watch,
  ShoppingBag,
  Package,
} from 'lucide-react';
import type { SectionSchema, SectionComponentProps, BlockInstance } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA (Shopify OS 2.0 Format)
// ============================================================================

export const schema: SectionSchema = {
  name: 'Category Grid (Daraz)',
  tag: 'section',
  class: 'daraz-category-grid',
  limit: 2,

  enabled_on: {
    templates: ['index'],
  },

  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Section title',
      default: 'Categories',
    },
    {
      type: 'range',
      id: 'max_categories',
      min: 4,
      max: 16,
      step: 1,
      default: 8,
      label: 'Max categories to show',
    },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid-4', label: '4 columns (mobile)' },
        { value: 'grid-6', label: '6 columns' },
        { value: 'grid-8', label: '8 columns (Daraz default)' },
      ],
      default: 'grid-8',
    },
    {
      type: 'checkbox',
      id: 'show_icons',
      label: 'Show category icons',
      default: true,
      info: 'Icons are auto-detected based on category name',
    },
    {
      type: 'color',
      id: 'icon_color',
      label: 'Icon color',
      default: '#F85606',
    },
  ],

  blocks: [
    {
      type: 'category',
      name: 'Category',
      limit: 16,
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Category name',
          default: 'Category',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
        },
        {
          type: 'image_picker',
          id: 'image',
          label: 'Category image',
          info: 'Optional - will use icon if not set',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Daraz Category Grid',
      category: 'Navigation',
      settings: {
        title: 'Categories',
        max_categories: 8,
        layout: 'grid-8',
        show_icons: true,
      },
    },
  ],
};

// ============================================================================
// ICON MAPPING
// ============================================================================

const CATEGORY_ICONS: Record<string, typeof Shirt> = {
  fashion: Shirt,
  clothing: Shirt,
  apparel: Shirt,
  'womens fashion': Shirt,
  'mens fashion': Shirt,
  home: Home,
  'home & living': Home,
  furniture: Home,
  phones: Smartphone,
  mobile: Smartphone,
  electronics: Tv,
  tv: Tv,
  appliances: Tv,
  beauty: Heart,
  health: Heart,
  'health & beauty': Heart,
  automotive: Car,
  motors: Car,
  food: Utensils,
  groceries: Utensils,
  grocery: Utensils,
  baby: Baby,
  kids: Baby,
  toys: Baby,
  sports: Dumbbell,
  fitness: Dumbbell,
  books: BookOpen,
  stationery: BookOpen,
  gaming: Gamepad2,
  computers: Laptop,
  laptops: Laptop,
  watches: Watch,
  accessories: Watch,
  bags: ShoppingBag,
  gift: Gift,
  gifts: Gift,
};

function getCategoryIcon(category: string) {
  const lowerCategory = category.toLowerCase();

  // Try exact match first
  if (CATEGORY_ICONS[lowerCategory]) {
    return CATEGORY_ICONS[lowerCategory];
  }

  // Try partial match
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return icon;
    }
  }

  // Default icon
  return Package;
}

// ============================================================================
// TYPES
// ============================================================================

interface CategoryGridSettings {
  title: string;
  max_categories: number;
  layout: 'grid-4' | 'grid-6' | 'grid-8';
  show_icons: boolean;
  icon_color: string;
}

interface CategoryBlockSettings {
  title: string;
  link?: string;
  image?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DarazCategoryGrid({
  section,
  context,
  settings,
  blocks = [],
}: SectionComponentProps) {
  const config = settings as unknown as CategoryGridSettings;

  const {
    title = 'Categories',
    max_categories = 8,
    layout = 'grid-8',
    show_icons = true,
    icon_color = '#F85606',
  } = config;

  // Get categories from blocks or from context collections
  let categories: Array<{ title: string; link: string; image?: string }> = [];

  if (blocks.length > 0) {
    // Use blocks if defined
    categories = blocks.slice(0, max_categories).map((block) => {
      const blockSettings = block.settings as unknown as CategoryBlockSettings;
      return {
        title: blockSettings.title || 'Category',
        link: blockSettings.link || `/?category=${encodeURIComponent(blockSettings.title || '')}`,
        image: blockSettings.image,
      };
    });
  } else {
    // Auto-generate from collections
    categories = (context.collections || []).slice(0, max_categories).map((collection) => ({
      title: collection.title,
      link: `/?category=${encodeURIComponent(collection.title)}`,
      image: collection.imageUrl || undefined,
    }));
  }

  if (categories.length === 0) return null;

  const gridCols = {
    'grid-4': 'grid-cols-4',
    'grid-6': 'grid-cols-4 sm:grid-cols-6',
    'grid-8': 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8',
  };

  return (
    <section
      className="bg-white rounded-lg shadow-sm mb-6 p-4"
      data-section-id={section.id}
      data-section-type="daraz-category-grid"
    >
      <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>

      <div className={`grid ${gridCols[layout]} gap-3 md:gap-4`}>
        {categories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.title);

          return (
            <Link
              key={category.title + index}
              to={category.link}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              {/* Category Image/Icon Container */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : show_icons ? (
                  <IconComponent
                    className="w-7 h-7 md:w-8 md:h-8 transition-transform group-hover:scale-110"
                    style={{ color: icon_color }}
                  />
                ) : (
                  <Package className="w-7 h-7 md:w-8 md:h-8" style={{ color: icon_color }} />
                )}
              </div>

              {/* Category Name */}
              <span className="text-[10px] md:text-xs text-center line-clamp-2 transition-colors text-gray-800 group-hover:text-orange-500">
                {category.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
