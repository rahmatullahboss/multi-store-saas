/**
 * Daraz Collection Header Section
 *
 * Shopify OS 2.0 Compatible Section
 * Collection page header with Daraz-style design:
 * - Clean white background
 * - Breadcrumb navigation
 * - Collection title and product count
 */

import { Link } from '@remix-run/react';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedCollection,
} from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'collection-header',
  name: 'Collection Header (Daraz)',
  tag: 'section',
  class: 'daraz-collection-header',

  enabled_on: {
    templates: ['collection'],
  },

  settings: [
    {
      type: 'checkbox',
      id: 'show_breadcrumb',
      label: 'Show breadcrumb',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_title',
      label: 'Show collection title',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_description',
      label: 'Show collection description',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_product_count',
      label: 'Show product count',
      default: true,
    },
    {
      type: 'text',
      id: 'product_count_text',
      label: 'Product count text',
      default: 'products',
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
  ],

  presets: [
    {
      name: 'Daraz Collection Header',
      category: 'Collection',
      settings: {
        show_breadcrumb: true,
        show_title: true,
        primary_color: '#F85606',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface DarazCollectionHeaderSettings {
  show_breadcrumb: boolean;
  show_title: boolean;
  show_description: boolean;
  show_product_count: boolean;
  product_count_text: string;
  primary_color: string;
}

// Demo collection for preview
const DEMO_COLLECTION: SerializedCollection = {
  id: 1,
  title: 'Electronics',
  slug: 'electronics',
  description: 'Discover the latest electronics and gadgets at amazing prices.',
  productCount: 156,
};

export default function DarazCollectionHeader({
  section,
  context,
  settings,
}: SectionComponentProps) {
  const {
    show_breadcrumb = true,
    show_title = true,
    show_description = true,
    show_product_count = true,
    product_count_text = 'products',
    primary_color = '#F85606',
  } = settings as unknown as DarazCollectionHeaderSettings;

  // Use context collection or demo collection
  const collection = context.collection || DEMO_COLLECTION;

  return (
    <section
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4"
      data-section-id={section.id}
      data-section-type="daraz-collection-header"
    >
      {/* Breadcrumb */}
      {show_breadcrumb && (
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/collections" className="text-gray-500 hover:text-gray-700">
            Collections
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span style={{ color: primary_color }}>{collection.title}</span>
        </nav>
      )}

      {/* Title & Description */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {show_title && (
            <div className="flex items-center gap-3 mb-2">
              <Grid3X3 size={24} style={{ color: primary_color }} />
              <h1 className="text-xl md:text-2xl font-medium text-gray-800">{collection.title}</h1>
            </div>
          )}

          {show_description && collection.description && (
            <p className="text-sm text-gray-600 max-w-2xl">{collection.description}</p>
          )}
        </div>

        {show_product_count && collection.productCount !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-bold" style={{ color: primary_color }}>
              {collection.productCount}
            </span>
            <p className="text-sm text-gray-500">{product_count_text}</p>
          </div>
        )}
      </div>
    </section>
  );
}
