/**
 * Block Registry - Shopify-style block definitions
 * 
 * Blocks are reusable content modules inside sections.
 * Each section can contain multiple blocks that merchants can add, remove, and reorder.
 */

import { z } from 'zod';

// ============================================================================
// SETTING TYPES (Shopify-aligned)
// ============================================================================

export type SettingType =
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'richtext'       // HTML content
  | 'image_picker'   // Image URL
  | 'url'            // Link URL
  | 'checkbox'       // Boolean toggle
  | 'number'         // Numeric input
  | 'range'          // Slider (min/max)
  | 'select'         // Dropdown
  | 'radio'          // Radio buttons
  | 'color'          // Color picker
  | 'font_picker'    // Font selection
  | 'collection'     // Collection reference
  | 'product'        // Product reference
  | 'header'         // UI grouping (no value)
  | 'paragraph';     // Help text (no value)

export interface SettingDefinition {
  type: SettingType;
  id: string;
  label: string;
  default?: unknown;
  info?: string;
  placeholder?: string;
  // Type-specific options
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
}

// ============================================================================
// BLOCK DEFINITION
// ============================================================================

export interface BlockDefinition {
  type: string;
  name: string;
  limit?: number;  // Max instances per section
  settings: SettingDefinition[];
}

export interface Block {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

// ============================================================================
// BLOCK SCHEMAS (Zod Validation)
// ============================================================================

// Reusable validators
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

// Button Block Schema
export const ButtonBlockSchema = z.object({
  text: z.string().max(50).default('Click Me'),
  link: urlSchema.default(''),
  style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  openInNewTab: z.boolean().default(false),
});

// Text Block Schema
export const TextBlockSchema = z.object({
  content: z.string().max(5000).default(''),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
});

// Image Block Schema
export const ImageBlockSchema = z.object({
  image: imageSchema.default(''),
  alt: z.string().max(200).default(''),
  link: urlSchema.default(''),
  caption: z.string().max(200).default(''),
});

// Slide Block Schema (for Slideshow)
export const SlideBlockSchema = z.object({
  image: imageSchema.default(''),
  heading: z.string().max(100).default(''),
  subheading: z.string().max(200).default(''),
  buttonText: z.string().max(30).default(''),
  buttonLink: urlSchema.default(''),
  textPosition: z.enum(['left', 'center', 'right']).default('center'),
  overlayOpacity: z.number().min(0).max(100).default(40),
});

// Feature Block Schema (for Feature Grid)
export const FeatureBlockSchema = z.object({
  icon: z.string().max(50).default('star'),
  title: z.string().max(100).default('Feature'),
  description: z.string().max(500).default(''),
  link: urlSchema.default(''),
});

// Testimonial Block Schema
export const TestimonialBlockSchema = z.object({
  quote: z.string().max(500).default(''),
  author: z.string().max(100).default(''),
  role: z.string().max(100).default(''),
  avatar: imageSchema.default(''),
  rating: z.number().min(1).max(5).default(5),
});

// FAQ Block Schema
export const FAQBlockSchema = z.object({
  question: z.string().max(200).default(''),
  answer: z.string().max(2000).default(''),
});

// Product Block Schema
export const ProductBlockSchema = z.object({
  productId: z.string().default(''),
  showPrice: z.boolean().default(true),
  showRating: z.boolean().default(true),
  showAddToCart: z.boolean().default(true),
});

// Collection Block Schema
export const CollectionBlockSchema = z.object({
  collectionId: z.string().default(''),
  productsToShow: z.number().min(1).max(12).default(4),
  showViewAll: z.boolean().default(true),
});

// ============================================================================
// BLOCK REGISTRY
// ============================================================================

export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  // Button Block
  button: {
    type: 'button',
    name: 'Button',
    settings: [
      { type: 'text', id: 'text', label: 'Button Text', default: 'Click Me' },
      { type: 'url', id: 'link', label: 'Link' },
      { 
        type: 'select', 
        id: 'style', 
        label: 'Style', 
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
        ],
        default: 'primary' 
      },
      {
        type: 'select',
        id: 'size',
        label: 'Size',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
        default: 'md'
      },
      { type: 'checkbox', id: 'openInNewTab', label: 'Open in new tab', default: false },
    ],
  },

  // Text Block
  text: {
    type: 'text',
    name: 'Text',
    settings: [
      { type: 'richtext', id: 'content', label: 'Content' },
      {
        type: 'select',
        id: 'alignment',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        default: 'left'
      },
    ],
  },

  // Image Block
  image: {
    type: 'image',
    name: 'Image',
    settings: [
      { type: 'image_picker', id: 'image', label: 'Image' },
      { type: 'text', id: 'alt', label: 'Alt Text' },
      { type: 'url', id: 'link', label: 'Link (optional)' },
      { type: 'text', id: 'caption', label: 'Caption (optional)' },
    ],
  },

  // Slide Block (for Slideshow section)
  slide: {
    type: 'slide',
    name: 'Slide',
    limit: 10,
    settings: [
      { type: 'image_picker', id: 'image', label: 'Slide Image' },
      { type: 'text', id: 'heading', label: 'Heading' },
      { type: 'text', id: 'subheading', label: 'Subheading' },
      { type: 'text', id: 'buttonText', label: 'Button Text' },
      { type: 'url', id: 'buttonLink', label: 'Button Link' },
      {
        type: 'select',
        id: 'textPosition',
        label: 'Text Position',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        default: 'center'
      },
      { type: 'range', id: 'overlayOpacity', label: 'Overlay Opacity', min: 0, max: 100, default: 40 },
    ],
  },

  // Feature Block
  feature: {
    type: 'feature',
    name: 'Feature',
    limit: 12,
    settings: [
      { type: 'text', id: 'icon', label: 'Icon Name', default: 'star', info: 'Lucide icon name' },
      { type: 'text', id: 'title', label: 'Title' },
      { type: 'textarea', id: 'description', label: 'Description' },
      { type: 'url', id: 'link', label: 'Link (optional)' },
    ],
  },

  // Testimonial Block
  testimonial: {
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

  // FAQ Block
  faq: {
    type: 'faq',
    name: 'FAQ Item',
    limit: 20,
    settings: [
      { type: 'text', id: 'question', label: 'Question' },
      { type: 'textarea', id: 'answer', label: 'Answer' },
    ],
  },

  // Product Block
  product: {
    type: 'product',
    name: 'Product',
    limit: 12,
    settings: [
      { type: 'product', id: 'productId', label: 'Product' },
      { type: 'checkbox', id: 'showPrice', label: 'Show Price', default: true },
      { type: 'checkbox', id: 'showRating', label: 'Show Rating', default: true },
      { type: 'checkbox', id: 'showAddToCart', label: 'Show Add to Cart', default: true },
    ],
  },

  // Collection Block
  collection: {
    type: 'collection',
    name: 'Collection',
    limit: 6,
    settings: [
      { type: 'collection', id: 'collectionId', label: 'Collection' },
      { type: 'number', id: 'productsToShow', label: 'Products to Show', min: 1, max: 12, default: 4 },
      { type: 'checkbox', id: 'showViewAll', label: 'Show View All Button', default: true },
    ],
  },
};

// ============================================================================
// BLOCK SCHEMA MAP
// ============================================================================

export const BLOCK_SCHEMA_MAP: Record<string, z.ZodSchema> = {
  button: ButtonBlockSchema,
  text: TextBlockSchema,
  image: ImageBlockSchema,
  slide: SlideBlockSchema,
  feature: FeatureBlockSchema,
  testimonial: TestimonialBlockSchema,
  faq: FAQBlockSchema,
  product: ProductBlockSchema,
  collection: CollectionBlockSchema,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default settings for a block type
 */
export function getBlockDefaults(blockType: string): Record<string, unknown> {
  const schema = BLOCK_SCHEMA_MAP[blockType];
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
 * Validate block settings
 */
export function validateBlock(blockType: string, settings: unknown): { 
  success: boolean; 
  data?: Record<string, unknown>; 
  errors?: Array<{ path: string; message: string }>;
} {
  const schema = BLOCK_SCHEMA_MAP[blockType];
  if (!schema) {
    return { success: false, errors: [{ path: '', message: `Unknown block type: ${blockType}` }] };
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
 * Create a new block with default settings
 */
export function createBlock(blockType: string, id?: string): Block {
  return {
    id: id || `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    settings: getBlockDefaults(blockType),
  };
}

/**
 * Get block definition
 */
export function getBlockDefinition(blockType: string): BlockDefinition | undefined {
  return BLOCK_REGISTRY[blockType];
}

/**
 * Get all available block types
 */
export function getAvailableBlockTypes(): string[] {
  return Object.keys(BLOCK_REGISTRY);
}
