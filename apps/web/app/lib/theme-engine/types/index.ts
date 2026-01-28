/**
 * Theme Engine Types - Shopify OS 2.0 Compatible
 *
 * This is the core type system for the entire theme engine.
 * All types are designed to be compatible with Shopify's Online Store 2.0
 * while leveraging React's component model.
 */

import type { ComponentType } from 'react';
import type { z } from 'zod';

// ============================================================================
// SETTING TYPES (Shopify-aligned)
// ============================================================================

/**
 * All possible setting input types
 * These match Shopify's setting types for compatibility
 */
export type SettingType =
  // Text inputs
  | 'text' // Single line text
  | 'textarea' // Multi-line text
  | 'richtext' // HTML/Rich content editor
  | 'inline_richtext' // Inline rich text (bold, italic only)

  // Numeric inputs
  | 'number' // Numeric input
  | 'range' // Slider with min/max

  // Selection inputs
  | 'select' // Dropdown select
  | 'radio' // Radio button group
  | 'checkbox' // Boolean toggle

  // Visual inputs
  | 'color' // Color picker
  | 'color_background' // Color or gradient picker
  | 'color_scheme' // Predefined color schemes
  | 'color_scheme_group' // Group of color schemes

  // Media inputs
  | 'image_picker' // Image selector
  | 'video' // Video upload
  | 'video_url' // YouTube/Vimeo URL

  // Reference inputs
  | 'url' // Link URL
  | 'link_list' // Navigation menu reference
  | 'page' // Page reference
  | 'product' // Product reference
  | 'product_list' // Multiple products
  | 'collection' // Collection reference
  | 'collection_list' // Multiple collections
  | 'blog' // Blog reference
  | 'article' // Article reference

  // Typography
  | 'font_picker' // Font selection

  // Layout
  | 'header' // Section header (no value, grouping)
  | 'paragraph'; // Help text (no value)

/**
 * Setting definition for sections and blocks
 */
export interface SettingDefinition {
  type: SettingType;
  id: string;
  label: string;
  default?: unknown;
  info?: string; // Help text
  placeholder?: string; // Placeholder text

  // Validation
  min?: number; // For number/range
  max?: number; // For number/range
  step?: number; // For range
  unit?: string; // Unit label (px, %, etc.)

  // For select/radio
  options?: Array<{
    value: string;
    label: string;
    group?: string; // Option grouping
  }>;

  // Conditional visibility
  visibleIf?: {
    setting: string;
    eq?: unknown;
    neq?: unknown;
  };
}

// ============================================================================
// BLOCK TYPES
// ============================================================================

/**
 * Block definition - template for blocks within sections
 */
export interface BlockDefinition {
  type: string;
  name: string;
  limit?: number; // Max instances per section
  settings: SettingDefinition[];
}

/**
 * Block instance - actual block with values
 */
export interface BlockInstance {
  id: string;
  type: string;
  disabled?: boolean;
  settings: Record<string, unknown>;
}

// ============================================================================
// SECTION TYPES
// ============================================================================

/**
 * Page types where sections can be used
 */
export type PageType =
  | 'index' // Homepage
  | 'product' // Product detail page
  | 'collection' // Collection/category page
  | 'cart' // Cart page
  | 'page' // Static pages
  | 'blog' // Blog listing
  | 'article' // Blog article
  | 'search' // Search results
  | 'customers/login' // Customer login
  | 'customers/account' // Customer account
  | 'checkout'; // Checkout (limited)

/**
 * Section groups for layout organization
 */
export type SectionGroup =
  | 'header' // Site header
  | 'footer' // Site footer
  | 'aside' // Sidebar
  | 'body'; // Main content area (default)

/**
 * Section schema - defines a section's capabilities
 */
export interface SectionSchema {
  // Identity
  type?: string; // Section type identifier (Shopify OS 2.0)
  name: string;
  tag?: string; // HTML element (div, section, aside, etc.)
  class?: string; // CSS class

  // Availability
  limit?: number; // Max instances per page
  enabled_on?: {
    templates?: PageType[]; // Which templates can use this
    groups?: SectionGroup[]; // Which groups can use this
  };
  disabled_on?: {
    templates?: PageType[];
    groups?: SectionGroup[];
  };

  // Content
  settings: SettingDefinition[];
  blocks?: BlockDefinition[];
  max_blocks?: number;

  // Presets (starter configurations)
  presets?: SectionPreset[];

  // Default settings
  default?: {
    settings?: Record<string, unknown>;
    blocks?: Array<{
      type: string;
      settings?: Record<string, unknown>;
    }>;
  };
}

/**
 * Section preset - pre-configured section variant
 */
export interface SectionPreset {
  name: string;
  category?: string; // For grouping in picker
  settings?: Record<string, unknown>;
  blocks?: Array<{
    type: string;
    settings?: Record<string, unknown>;
  }>;
}

/**
 * Section instance in a template
 */
export interface SectionInstance {
  id: string;
  type: string;
  disabled?: boolean;
  settings: Record<string, unknown>;
  blocks?: BlockInstance[];
  block_order?: string[]; // Order of block IDs
}

/**
 * Registered section with component
 */
export interface RegisteredSection {
  type: string;
  schema: SectionSchema;
  component: ComponentType<SectionComponentProps>;
  zodSchema?: z.ZodSchema; // Runtime validation
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Template JSON structure (like Shopify's templates/*.json)
 */
export interface TemplateJSON {
  name?: string;
  layout?: string; // Which layout to use (default: 'theme')
  wrapper?: string; // Wrapper CSS class
  sections: Record<string, SectionInstance>;
  order: string[]; // Section order
}

/**
 * Template types enum
 */
export type TemplateType =
  | 'index' // Homepage
  | 'product' // Product page
  | 'product.fashion' // Product variant for fashion
  | 'product.electronics' // Product variant for electronics
  | 'collection' // Collection page
  | 'collection.featured' // Featured collection variant
  | 'cart' // Cart page
  | 'page' // Generic page
  | 'page.about' // About page
  | 'page.contact' // Contact page
  | 'search' // Search results
  | 'blog' // Blog listing
  | 'article' // Blog article
  | 'password' // Password page
  | '404'; // Not found page

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Theme settings schema
 */
export interface ThemeSettingsSchema {
  name: string;
  settings: SettingDefinition[];
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  // Identity
  name: string;
  version: string;

  // Colors
  colors: {
    primary: string;
    secondary?: string;
    accent: string;
    background: string;
    surface: string; // Card backgrounds
    text: string;
    textMuted: string;
    border: string;
    success?: string;
    warning?: string;
    error?: string;
  };

  // Typography
  typography: {
    fontFamily: string;
    fontFamilyHeading?: string;
    baseFontSize: number; // in px
    lineHeight: number; // ratio
    headingLineHeight?: number;
  };

  // Spacing
  spacing: {
    unit: number; // Base unit in px (default 4)
    containerMaxWidth: string; // e.g., '1280px'
    containerPadding: string; // e.g., '1rem'
  };

  // Borders
  borders: {
    radius: string; // e.g., '0.5rem'
    radiusLarge: string;
    width: string; // e.g., '1px'
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };

  // Component-specific
  buttons: {
    borderRadius: string;
    fontWeight: string;
    textTransform?: 'none' | 'uppercase' | 'capitalize';
  };

  cards: {
    borderRadius: string;
    shadow: string;
    padding: string;
  };

  // Animation
  animation: {
    duration: string; // e.g., '200ms'
    easing: string; // e.g., 'ease-in-out'
  };
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Context data passed to sections
 */
export interface SectionContext {
  // Store info
  store: {
    id: number;
    name: string;
    logo?: string | null;
    currency: string;
    defaultLanguage: 'en' | 'bn';
  };

  // Current page context
  page: {
    type: PageType;
    handle?: string; // URL handle
  };

  // Theme
  theme: ThemeConfig;

  // Products (if available)
  products?: SerializedProduct[];

  // Collections (if available)
  collections?: SerializedCollection[];

  // Current product (on product page)
  product?: SerializedProduct;

  // Current collection (on collection page)
  collection?: SerializedCollection;

  // Cart (if available)
  cart?: CartData;

  // Customer (if logged in)
  customer?: CustomerData;

  // Metafields (resolved)
  metafields?: Record<string, unknown>;

  // Navigation helpers
  getLink: (path: string) => string;
  onNavigate?: (path: string) => void;

  // Preview mode
  isPreview?: boolean;
}

/**
 * Props passed to section components
 */
export interface SectionComponentProps {
  // Section instance data
  section: SectionInstance;

  // Context
  context: SectionContext;

  // Resolved settings (with defaults applied)
  settings: Record<string, unknown>;

  // Blocks (if any)
  blocks?: BlockInstance[];
}

/**
 * Props passed to block components
 */
export interface BlockComponentProps {
  // Block instance data
  block: BlockInstance;

  // Context
  context: SectionContext;

  // Resolved settings
  settings: Record<string, unknown>;

  // Index in block list
  index: number;
}

// ============================================================================
// DATA TYPES (Serialized for client)
// ============================================================================

/**
 * Serialized product for client-side use
 */
export interface SerializedProduct {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  inventory?: number;
  sku?: string | null;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  tags?: string[];
  isPublished?: boolean;

  // Variants
  variants?: ProductVariant[];

  // Metafields (resolved values)
  metafields?: Record<string, unknown>;

  // SEO
  seoTitle?: string | null;
  seoDescription?: string | null;
}

/**
 * Product variant
 */
export interface ProductVariant {
  id: number;
  option1Name?: string | null;
  option1Value?: string | null;
  option2Name?: string | null;
  option2Value?: string | null;
  option3Name?: string | null;
  option3Value?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  sku?: string | null;
  inventory?: number;
  available?: number;
  reserved?: number;
  imageUrl?: string | null;
  isAvailable?: boolean;

  // Computed
  title?: string; // e.g., "Red / Large"
}

/**
 * Serialized collection
 */
export interface SerializedCollection {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  productCount?: number;

  // Metafields
  metafields?: Record<string, unknown>;
}

/**
 * Cart data
 */
export interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  discounts?: CartDiscount[];
  note?: string;
}

export interface CartItem {
  id: string;
  productId: number;
  variantId?: number;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  image?: string;
  url?: string;
}

export interface CartDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  applied: number;
}

/**
 * Customer data
 */
export interface CustomerData {
  id: number;
  email?: string;
  name?: string;
  phone?: string;
  isLoggedIn: boolean;
}

// ============================================================================
// METAFIELD BINDING TYPES
// ============================================================================

/**
 * Dynamic source binding for section settings
 */
export interface DynamicBinding {
  source: 'product' | 'collection' | 'store' | 'page' | 'cart' | 'customer';
  field: string; // e.g., 'metafields.custom.warranty'
  fallback?: unknown; // Default if not found
}

/**
 * Section setting with possible dynamic binding
 */
export type BoundSetting<T = unknown> = T | { '@bind': DynamicBinding };

// ============================================================================
// SECTION REGISTRY TYPES
// ============================================================================

/**
 * Section registry - maps section types to their definitions
 */
export type SectionRegistry = Record<string, RegisteredSection>;

/**
 * Template registry - stores loaded templates
 */
export type TemplateRegistry = Record<TemplateType, TemplateJSON>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract setting value type from setting definition
 */
export type SettingValue<T extends SettingType> = T extends
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'inline_richtext'
  | 'url'
  | 'video_url'
  ? string
  : T extends 'number' | 'range'
    ? number
    : T extends 'checkbox'
      ? boolean
      : T extends 'select' | 'radio' | 'color' | 'color_background' | 'font_picker'
        ? string
        : T extends 'image_picker' | 'video'
          ? string | null
          : T extends 'product' | 'collection' | 'page' | 'blog' | 'article'
            ? number | null
            : T extends 'product_list' | 'collection_list'
              ? number[]
              : T extends 'link_list'
                ? string
                : T extends 'color_scheme' | 'color_scheme_group'
                  ? string
                  : unknown;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
