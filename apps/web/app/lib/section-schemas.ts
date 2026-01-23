/**
 * Section Schemas - Shopify-style section validation
 * 
 * Each section has a Zod schema for validation and default values.
 * Follows Shopify OS 2.0 setting types pattern.
 */

import { z } from 'zod';
import { type BlockDefinition, type SettingDefinition } from './block-registry';

// ============================================================================
// REUSABLE VALIDATORS
// ============================================================================

const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/i).or(z.literal('')).optional();
const urlSchema = z
  .string()
  .refine(
    (val) =>
      val === '' ||
      val.startsWith('/') ||
      val.startsWith('#') ||
      /^https?:\/\//.test(val),
    'Invalid URL format'
  )
  .optional();
const imageSchema = z.string().url().or(z.literal('')).optional();

// ============================================================================
// SECTION DEFINITION INTERFACE
// ============================================================================

export interface SectionDefinition {
  type: string;
  name: string;
  description?: string;
  settings: SettingDefinition[];
  blocks?: BlockDefinition[];
  max_blocks?: number;
  presets?: SectionPreset[];
}

export interface SectionPreset {
  name: string;
  settings?: Record<string, unknown>;
  blocks?: Array<{ type: string; settings?: Record<string, unknown> }>;
}

// ============================================================================
// HERO SECTION
// ============================================================================

export const HeroSectionSchema = z.object({
  heading: z.string().max(100).default('Welcome to Our Store'),
  subheading: z.string().max(200).default('Discover amazing products'),
  buttonText: z.string().max(30).default('Shop Now'),
  buttonLink: urlSchema.default('/products'),
  secondaryButtonText: z.string().max(30).default(''),
  secondaryButtonLink: urlSchema.default(''),
  backgroundImage: imageSchema.default(''),
  backgroundColor: colorSchema.default('#000000'),
  textColor: colorSchema.default('#ffffff'),
  textAlignment: z.enum(['left', 'center', 'right']).default('center'),
  overlayOpacity: z.number().min(0).max(100).default(50),
  minHeight: z.enum(['small', 'medium', 'large', 'fullscreen']).default('medium'),
});

export const HeroSectionDefinition: SectionDefinition = {
  type: 'hero',
  name: 'Hero Banner',
  description: 'A large banner with heading, text, and call-to-action buttons',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome to Our Store' },
    { type: 'text', id: 'subheading', label: 'Subheading', default: 'Discover amazing products' },
    { type: 'text', id: 'buttonText', label: 'Button Text', default: 'Shop Now' },
    { type: 'url', id: 'buttonLink', label: 'Button Link', default: '/products' },
    { type: 'text', id: 'secondaryButtonText', label: 'Secondary Button Text' },
    { type: 'url', id: 'secondaryButtonLink', label: 'Secondary Button Link' },
    { type: 'image_picker', id: 'backgroundImage', label: 'Background Image' },
    { type: 'color', id: 'backgroundColor', label: 'Background Color', default: '#000000' },
    { type: 'color', id: 'textColor', label: 'Text Color', default: '#ffffff' },
    { 
      type: 'select', 
      id: 'textAlignment', 
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center'
    },
    { type: 'range', id: 'overlayOpacity', label: 'Overlay Opacity', min: 0, max: 100, default: 50 },
    {
      type: 'select',
      id: 'minHeight',
      label: 'Section Height',
      options: [
        { value: 'small', label: 'Small (300px)' },
        { value: 'medium', label: 'Medium (500px)' },
        { value: 'large', label: 'Large (700px)' },
        { value: 'fullscreen', label: 'Full Screen' },
      ],
      default: 'medium'
    },
  ],
  presets: [
    {
      name: 'Default Hero',
      settings: { heading: 'Welcome', subheading: 'Discover our products', textAlignment: 'center' }
    }
  ]
};

// ============================================================================
// SLIDESHOW SECTION
// ============================================================================

export const SlideshowSectionSchema = z.object({
  autoplay: z.boolean().default(true),
  interval: z.number().min(2).max(10).default(5),
  showArrows: z.boolean().default(true),
  showDots: z.boolean().default(true),
  minHeight: z.enum(['small', 'medium', 'large', 'fullscreen']).default('medium'),
});

export const SlideshowSectionDefinition: SectionDefinition = {
  type: 'slideshow',
  name: 'Slideshow',
  description: 'A carousel of slides with images and text',
  max_blocks: 10,
  settings: [
    { type: 'checkbox', id: 'autoplay', label: 'Autoplay', default: true },
    { type: 'range', id: 'interval', label: 'Slide Interval (seconds)', min: 2, max: 10, default: 5 },
    { type: 'checkbox', id: 'showArrows', label: 'Show Navigation Arrows', default: true },
    { type: 'checkbox', id: 'showDots', label: 'Show Dots', default: true },
    {
      type: 'select',
      id: 'minHeight',
      label: 'Section Height',
      options: [
        { value: 'small', label: 'Small (300px)' },
        { value: 'medium', label: 'Medium (500px)' },
        { value: 'large', label: 'Large (700px)' },
        { value: 'fullscreen', label: 'Full Screen' },
      ],
      default: 'medium'
    },
  ],
  blocks: [
    {
      type: 'slide',
      name: 'Slide',
      limit: 10,
      settings: [
        { type: 'image_picker', id: 'image', label: 'Slide Image' },
        { type: 'text', id: 'heading', label: 'Heading' },
        { type: 'text', id: 'subheading', label: 'Subheading' },
        { type: 'text', id: 'buttonText', label: 'Button Text' },
        { type: 'url', id: 'buttonLink', label: 'Button Link' },
      ],
    },
  ],
  presets: [
    {
      name: 'Default Slideshow',
      settings: { autoplay: true, interval: 5 },
      blocks: [
        { type: 'slide', settings: { heading: 'Slide 1' } },
        { type: 'slide', settings: { heading: 'Slide 2' } },
      ]
    }
  ]
};

// ============================================================================
// FEATURED PRODUCTS SECTION
// ============================================================================

export const FeaturedProductsSectionSchema = z.object({
  title: z.string().max(100).default('Featured Products'),
  subtitle: z.string().max(200).default(''),
  productsToShow: z.number().min(2).max(12).default(4),
  columns: z.number().min(2).max(6).default(4),
  showViewAll: z.boolean().default(true),
  viewAllLink: urlSchema.default('/products'),
  collectionId: z.string().default(''),
  productSource: z.enum(['featured', 'collection', 'manual']).default('featured'),
});

export const FeaturedProductsSectionDefinition: SectionDefinition = {
  type: 'featured-products',
  name: 'Featured Products',
  description: 'Display a grid of featured products',
  settings: [
    { type: 'text', id: 'title', label: 'Title', default: 'Featured Products' },
    { type: 'text', id: 'subtitle', label: 'Subtitle' },
    { type: 'range', id: 'productsToShow', label: 'Products to Show', min: 2, max: 12, default: 4 },
    { type: 'range', id: 'columns', label: 'Columns', min: 2, max: 6, default: 4 },
    { type: 'checkbox', id: 'showViewAll', label: 'Show View All Button', default: true },
    { type: 'url', id: 'viewAllLink', label: 'View All Link', default: '/products' },
    {
      type: 'select',
      id: 'productSource',
      label: 'Product Source',
      options: [
        { value: 'featured', label: 'Featured Products' },
        { value: 'collection', label: 'From Collection' },
        { value: 'manual', label: 'Manual Selection' },
      ],
      default: 'featured'
    },
    { type: 'collection', id: 'collectionId', label: 'Collection' },
  ],
  blocks: [
    {
      type: 'product',
      name: 'Product',
      limit: 12,
      settings: [
        { type: 'product', id: 'productId', label: 'Product' },
      ],
    },
  ],
  presets: [
    {
      name: 'Default Featured Products',
      settings: { title: 'Featured Products', productsToShow: 4, columns: 4 }
    }
  ]
};

// ============================================================================
// COLLECTION LIST SECTION
// ============================================================================

export const CollectionListSectionSchema = z.object({
  title: z.string().max(100).default('Shop by Category'),
  subtitle: z.string().max(200).default(''),
  columns: z.number().min(2).max(6).default(3),
  showProductCount: z.boolean().default(true),
  imageRatio: z.enum(['square', 'portrait', 'landscape']).default('square'),
});

export const CollectionListSectionDefinition: SectionDefinition = {
  type: 'collection-list',
  name: 'Collection List',
  description: 'Display a grid of collections/categories',
  max_blocks: 12,
  settings: [
    { type: 'text', id: 'title', label: 'Title', default: 'Shop by Category' },
    { type: 'text', id: 'subtitle', label: 'Subtitle' },
    { type: 'range', id: 'columns', label: 'Columns', min: 2, max: 6, default: 3 },
    { type: 'checkbox', id: 'showProductCount', label: 'Show Product Count', default: true },
    {
      type: 'select',
      id: 'imageRatio',
      label: 'Image Ratio',
      options: [
        { value: 'square', label: 'Square (1:1)' },
        { value: 'portrait', label: 'Portrait (2:3)' },
        { value: 'landscape', label: 'Landscape (3:2)' },
      ],
      default: 'square'
    },
  ],
  blocks: [
    {
      type: 'collection',
      name: 'Collection',
      limit: 12,
      settings: [
        { type: 'collection', id: 'collectionId', label: 'Collection' },
        { type: 'image_picker', id: 'customImage', label: 'Custom Image (optional)' },
      ],
    },
  ],
};

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

export const TestimonialsSectionSchema = z.object({
  title: z.string().max(100).default('What Our Customers Say'),
  subtitle: z.string().max(200).default(''),
  layout: z.enum(['grid', 'carousel']).default('grid'),
  columns: z.number().min(1).max(4).default(3),
  showRating: z.boolean().default(true),
});

export const TestimonialsSectionDefinition: SectionDefinition = {
  type: 'testimonials',
  name: 'Testimonials',
  description: 'Customer testimonials and reviews',
  max_blocks: 10,
  settings: [
    { type: 'text', id: 'title', label: 'Title', default: 'What Our Customers Say' },
    { type: 'text', id: 'subtitle', label: 'Subtitle' },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'carousel', label: 'Carousel' },
      ],
      default: 'grid'
    },
    { type: 'range', id: 'columns', label: 'Columns', min: 1, max: 4, default: 3 },
    { type: 'checkbox', id: 'showRating', label: 'Show Star Rating', default: true },
  ],
  blocks: [
    {
      type: 'testimonial',
      name: 'Testimonial',
      limit: 10,
      settings: [
        { type: 'textarea', id: 'quote', label: 'Quote' },
        { type: 'text', id: 'author', label: 'Author Name' },
        { type: 'text', id: 'role', label: 'Role / Company' },
        { type: 'image_picker', id: 'avatar', label: 'Avatar' },
        { type: 'range', id: 'rating', label: 'Rating', min: 1, max: 5, default: 5 },
      ],
    },
  ],
};

// ============================================================================
// FAQ SECTION
// ============================================================================

export const FAQSectionSchema = z.object({
  title: z.string().max(100).default('Frequently Asked Questions'),
  subtitle: z.string().max(200).default(''),
  layout: z.enum(['accordion', 'grid']).default('accordion'),
});

export const FAQSectionDefinition: SectionDefinition = {
  type: 'faq',
  name: 'FAQ',
  description: 'Frequently asked questions section',
  max_blocks: 20,
  settings: [
    { type: 'text', id: 'title', label: 'Title', default: 'Frequently Asked Questions' },
    { type: 'text', id: 'subtitle', label: 'Subtitle' },
    {
      type: 'select',
      id: 'layout',
      label: 'Layout',
      options: [
        { value: 'accordion', label: 'Accordion' },
        { value: 'grid', label: 'Two Column Grid' },
      ],
      default: 'accordion'
    },
  ],
  blocks: [
    {
      type: 'faq',
      name: 'FAQ Item',
      limit: 20,
      settings: [
        { type: 'text', id: 'question', label: 'Question' },
        { type: 'textarea', id: 'answer', label: 'Answer' },
      ],
    },
  ],
};

// ============================================================================
// RICH TEXT SECTION
// ============================================================================

export const RichTextSectionSchema = z.object({
  content: z.string().max(10000).default('<p>Add your content here</p>'),
  textAlignment: z.enum(['left', 'center', 'right']).default('left'),
  narrowWidth: z.boolean().default(false),
  backgroundColor: colorSchema.default(''),
  textColor: colorSchema.default(''),
});

export const RichTextSectionDefinition: SectionDefinition = {
  type: 'rich-text',
  name: 'Rich Text',
  description: 'Custom text content with formatting',
  settings: [
    { type: 'richtext', id: 'content', label: 'Content', default: '<p>Add your content here</p>' },
    {
      type: 'select',
      id: 'textAlignment',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'left'
    },
    { type: 'checkbox', id: 'narrowWidth', label: 'Narrow Width', default: false },
    { type: 'color', id: 'backgroundColor', label: 'Background Color' },
    { type: 'color', id: 'textColor', label: 'Text Color' },
  ],
};

// ============================================================================
// IMAGE WITH TEXT SECTION
// ============================================================================

export const ImageWithTextSectionSchema = z.object({
  image: imageSchema.default(''),
  heading: z.string().max(100).default('Image with Text'),
  content: z.string().max(2000).default(''),
  buttonText: z.string().max(30).default('Learn More'),
  buttonLink: urlSchema.default(''),
  imagePosition: z.enum(['left', 'right']).default('left'),
  imageWidth: z.enum(['small', 'medium', 'large']).default('medium'),
  backgroundColor: colorSchema.default(''),
});

export const ImageWithTextSectionDefinition: SectionDefinition = {
  type: 'image-with-text',
  name: 'Image with Text',
  description: 'Side-by-side image and text content',
  settings: [
    { type: 'image_picker', id: 'image', label: 'Image' },
    { type: 'text', id: 'heading', label: 'Heading', default: 'Image with Text' },
    { type: 'richtext', id: 'content', label: 'Content' },
    { type: 'text', id: 'buttonText', label: 'Button Text', default: 'Learn More' },
    { type: 'url', id: 'buttonLink', label: 'Button Link' },
    {
      type: 'select',
      id: 'imagePosition',
      label: 'Image Position',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      default: 'left'
    },
    {
      type: 'select',
      id: 'imageWidth',
      label: 'Image Width',
      options: [
        { value: 'small', label: 'Small (33%)' },
        { value: 'medium', label: 'Medium (50%)' },
        { value: 'large', label: 'Large (66%)' },
      ],
      default: 'medium'
    },
    { type: 'color', id: 'backgroundColor', label: 'Background Color' },
  ],
};

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================

export const NewsletterSectionSchema = z.object({
  heading: z.string().max(100).default('Subscribe to Our Newsletter'),
  subheading: z.string().max(200).default('Get the latest updates and offers'),
  buttonText: z.string().max(30).default('Subscribe'),
  backgroundColor: colorSchema.default(''),
  textColor: colorSchema.default(''),
  successMessage: z.string().max(200).default('Thank you for subscribing!'),
});

export const NewsletterSectionDefinition: SectionDefinition = {
  type: 'newsletter',
  name: 'Newsletter',
  description: 'Email subscription form',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Subscribe to Our Newsletter' },
    { type: 'text', id: 'subheading', label: 'Subheading', default: 'Get the latest updates and offers' },
    { type: 'text', id: 'buttonText', label: 'Button Text', default: 'Subscribe' },
    { type: 'color', id: 'backgroundColor', label: 'Background Color' },
    { type: 'color', id: 'textColor', label: 'Text Color' },
    { type: 'text', id: 'successMessage', label: 'Success Message', default: 'Thank you for subscribing!' },
  ],
};

// ============================================================================
// SECTION SCHEMA MAP
// ============================================================================

export const SECTION_SCHEMA_MAP: Record<string, z.ZodSchema> = {
  'hero': HeroSectionSchema,
  'slideshow': SlideshowSectionSchema,
  'featured-products': FeaturedProductsSectionSchema,
  'collection-list': CollectionListSectionSchema,
  'testimonials': TestimonialsSectionSchema,
  'faq': FAQSectionSchema,
  'rich-text': RichTextSectionSchema,
  'image-with-text': ImageWithTextSectionSchema,
  'newsletter': NewsletterSectionSchema,
};

export const SECTION_DEFINITION_MAP: Record<string, SectionDefinition> = {
  'hero': HeroSectionDefinition,
  'slideshow': SlideshowSectionDefinition,
  'featured-products': FeaturedProductsSectionDefinition,
  'collection-list': CollectionListSectionDefinition,
  'testimonials': TestimonialsSectionDefinition,
  'faq': FAQSectionDefinition,
  'rich-text': RichTextSectionDefinition,
  'image-with-text': ImageWithTextSectionDefinition,
  'newsletter': NewsletterSectionDefinition,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default settings for a section type
 */
export function getSectionDefaults(sectionType: string): Record<string, unknown> {
  const schema = SECTION_SCHEMA_MAP[sectionType];
  if (schema) {
    try {
      return schema.parse({});
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Validate section settings
 */
export function validateSection(sectionType: string, settings: unknown): {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Array<{ path: string; message: string }>;
} {
  const schema = SECTION_SCHEMA_MAP[sectionType];
  if (!schema) {
    // Unknown section type - allow but don't validate
    return { success: true, data: settings as Record<string, unknown> };
  }

  const result = schema.safeParse(settings);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  return {
    success: false,
    errors: result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Get section definition
 */
export function getSectionDefinition(sectionType: string): SectionDefinition | undefined {
  return SECTION_DEFINITION_MAP[sectionType];
}

/**
 * Get all section types with block support
 */
export function getSectionsWithBlocks(): string[] {
  return Object.entries(SECTION_DEFINITION_MAP)
    .filter(([, def]) => def.blocks && def.blocks.length > 0)
    .map(([type]) => type);
}

/**
 * Get allowed block types for a section
 */
export function getAllowedBlocks(sectionType: string): string[] {
  const definition = SECTION_DEFINITION_MAP[sectionType];
  if (!definition?.blocks) return [];
  return definition.blocks.map(b => b.type);
}

/**
 * Get max blocks for a section
 */
export function getMaxBlocks(sectionType: string): number | undefined {
  return SECTION_DEFINITION_MAP[sectionType]?.max_blocks;
}
