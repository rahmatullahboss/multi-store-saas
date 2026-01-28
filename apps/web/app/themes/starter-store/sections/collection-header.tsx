/**
 * Collection Header Section
 *
 * Shopify OS 2.0 Compatible Section
 * Header section for collection pages with title, description, and banner.
 */

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
  name: 'Collection Header',
  tag: 'section',
  class: 'collection-header',

  enabled_on: {
    templates: ['collection'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_layout',
      label: 'Layout',
    },
    {
      type: 'select',
      id: 'layout',
      options: [
        { value: 'simple', label: 'Simple (Text only)' },
        { value: 'banner', label: 'Banner with image' },
        { value: 'overlay', label: 'Image with text overlay' },
      ],
      default: 'simple',
      label: 'Layout style',
    },
    {
      type: 'image_picker',
      id: 'fallback_image',
      label: 'Fallback banner image',
    },
    {
      type: 'select',
      id: 'image_height',
      options: [
        { value: 'small', label: 'Small (200px)' },
        { value: 'medium', label: 'Medium (300px)' },
        { value: 'large', label: 'Large (400px)' },
      ],
      default: 'medium',
      label: 'Banner height',
    },
    {
      type: 'range',
      id: 'overlay_opacity',
      min: 0,
      max: 100,
      step: 5,
      default: 40,
      unit: '%',
      label: 'Overlay opacity',
    },
    {
      type: 'header',
      id: 'header_content',
      label: 'Content',
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
      default: 'টি পণ্য',
    },
    {
      type: 'select',
      id: 'text_alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'left',
      label: 'Text alignment',
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
      default: '#f9fafb',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color (for overlay)',
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
      default: 32,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  presets: [
    {
      name: 'Collection Header',
      category: 'Collection',
      settings: {
        layout: 'simple',
        show_title: true,
        show_description: true,
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CollectionHeaderSettings {
  layout: 'simple' | 'banner' | 'overlay';
  fallback_image?: string;
  image_height: 'small' | 'medium' | 'large';
  overlay_opacity: number;
  show_title: boolean;
  show_description: boolean;
  show_product_count: boolean;
  product_count_text: string;
  text_alignment: 'left' | 'center' | 'right';
  background_color: string;
  text_color: string;
  padding_top: number;
  padding_bottom: number;
}

// Demo collection for preview
const DEMO_COLLECTION: SerializedCollection = {
  id: 1,
  title: 'ইলেকট্রনিক্স',
  slug: 'electronics',
  description: 'সেরা মানের ইলেকট্রনিক পণ্য। হেডফোন, স্মার্টওয়াচ, স্পিকার এবং আরও অনেক কিছু।',
  imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&h=400&fit=crop',
  productCount: 24,
};

const heightMap = {
  small: '200px',
  medium: '300px',
  large: '400px',
};

const alignmentClass = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

export default function CollectionHeader({ section, context, settings }: SectionComponentProps) {
  const {
    layout = 'simple',
    fallback_image,
    image_height = 'medium',
    overlay_opacity = 40,
    show_title = true,
    show_description = true,
    show_product_count = true,
    product_count_text = 'টি পণ্য',
    text_alignment = 'left',
    background_color = '#f9fafb',
    text_color = '#ffffff',
    padding_top = 32,
    padding_bottom = 32,
  } = settings as unknown as CollectionHeaderSettings;

  // Use context collection or demo
  const collection = context.collection || DEMO_COLLECTION;

  // Theme colors
  const themePrimaryColor = context.theme?.colors?.primary || '#6366f1';
  const themeTextColor = context.theme?.colors?.text || '#111827';
  const themeMutedColor = context.theme?.colors?.textMuted || '#6b7280';

  // Get banner image
  const bannerImage = collection.imageUrl || fallback_image;

  // Simple layout (no image)
  if (layout === 'simple') {
    return (
      <section
        className={`px-4 ${alignmentClass[text_alignment]}`}
        style={{
          backgroundColor: background_color,
          paddingTop: `${padding_top}px`,
          paddingBottom: `${padding_bottom}px`,
        }}
        data-section-id={section.id}
        data-section-type="collection-header"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col ${alignmentClass[text_alignment]}`}>
            {show_title && (
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: themeTextColor }}>
                {collection.title}
              </h1>
            )}
            {show_product_count && collection.productCount !== undefined && (
              <p className="text-lg mb-4" style={{ color: themePrimaryColor }}>
                {collection.productCount} {product_count_text}
              </p>
            )}
            {show_description && collection.description && (
              <p className="max-w-2xl" style={{ color: themeMutedColor }}>
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Banner layout (image above text)
  if (layout === 'banner') {
    return (
      <section data-section-id={section.id} data-section-type="collection-header">
        {bannerImage && (
          <div
            className="relative w-full overflow-hidden"
            style={{ height: heightMap[image_height] }}
          >
            <img src={bannerImage} alt={collection.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div
          className={`px-4 ${alignmentClass[text_alignment]}`}
          style={{
            backgroundColor: background_color,
            paddingTop: `${padding_top}px`,
            paddingBottom: `${padding_bottom}px`,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className={`flex flex-col ${alignmentClass[text_alignment]}`}>
              {show_title && (
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: themeTextColor }}
                >
                  {collection.title}
                </h1>
              )}
              {show_product_count && collection.productCount !== undefined && (
                <p className="text-lg mb-4" style={{ color: themePrimaryColor }}>
                  {collection.productCount} {product_count_text}
                </p>
              )}
              {show_description && collection.description && (
                <p className="max-w-2xl" style={{ color: themeMutedColor }}>
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Overlay layout (text over image)
  return (
    <section
      className="relative"
      style={{ height: heightMap[image_height] }}
      data-section-id={section.id}
      data-section-type="collection-header"
    >
      {/* Background Image */}
      {bannerImage ? (
        <img
          src={bannerImage}
          alt={collection.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: themePrimaryColor }} />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlay_opacity / 100})` }}
      />

      {/* Content */}
      <div className={`relative h-full flex px-4 ${alignmentClass[text_alignment]}`}>
        <div
          className={`max-w-7xl mx-auto w-full flex flex-col justify-center ${alignmentClass[text_alignment]}`}
        >
          {show_title && (
            <h1 className="text-3xl md:text-5xl font-bold mb-3" style={{ color: text_color }}>
              {collection.title}
            </h1>
          )}
          {show_product_count && collection.productCount !== undefined && (
            <p className="text-xl mb-4 opacity-90" style={{ color: text_color }}>
              {collection.productCount} {product_count_text}
            </p>
          )}
          {show_description && collection.description && (
            <p className="max-w-2xl text-lg opacity-80" style={{ color: text_color }}>
              {collection.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
