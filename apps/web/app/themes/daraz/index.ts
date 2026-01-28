/**
 * Daraz Theme - Theme Registration & Metadata
 *
 * A Daraz Bangladesh-inspired e-commerce theme with:
 * - Orange theme header (#F85606)
 * - Hero carousel with promotional banners
 * - Flash sale horizontal scroll section
 * - Category grid navigation
 * - Product grid layout (Just For You)
 * - Multi-column footer with payment badges
 *
 * Shopify OS 2.0 Compatible Architecture:
 * - Sections with schemas
 * - JSON templates
 * - Block system
 * - Theme settings
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components
import DarazHeader, { schema as headerSchema } from './sections/header';
import DarazHeroCarousel, { schema as heroCarouselSchema } from './sections/hero-carousel';
import DarazFlashSale, { schema as flashSaleSchema } from './sections/flash-sale';
import DarazCategoryGrid, { schema as categoryGridSchema } from './sections/category-grid';
import DarazProductGrid, { schema as productGridSchema } from './sections/product-grid';
import DarazFooter, { schema as footerSchema } from './sections/footer';

// New sections for product, cart, collection, and page templates
import DarazProductMain, { schema as productMainSchema } from './sections/product-main';
import DarazCartItems, { schema as cartItemsSchema } from './sections/cart-items';
import DarazCartSummary, { schema as cartSummarySchema } from './sections/cart-summary';
import DarazCollectionHeader, {
  schema as collectionHeaderSchema,
} from './sections/collection-header';
import DarazCollectionGrid, { schema as collectionGridSchema } from './sections/collection-grid';
import DarazRichText, { schema as richTextSchema } from './sections/rich-text';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'daraz',
  name: 'Daraz',
  nameBn: 'দারাজ',
  version: '1.0.0',
  author: 'Ozzyl',
  description: 'A Daraz Bangladesh-inspired e-commerce theme with orange branding',
  descriptionBn: 'কমলা রঙের ব্র্যান্ডিং সহ দারাজ বাংলাদেশ-অনুপ্রাণিত ই-কমার্স থিম',

  // Preview
  previewImage: '/themes/daraz/preview.png',

  // Features
  features: [
    'responsive',
    'mobile-first',
    'bangla-support',
    'flash-sale',
    'category-icons',
    'app-download-widget',
    'social-links',
  ],

  // Supported page types
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],

  // Categories for theme picker
  categories: ['marketplace', 'modern', 'orange', 'general'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Daraz',
  version: '1.0.0',

  colors: {
    primary: '#F85606', // Daraz Orange
    secondary: '#E04E05', // Darker Orange
    accent: '#FFD700', // Gold for badges
    background: '#F5F5F5', // Page background
    surface: '#FFFFFF', // Card backgrounds
    text: '#212121', // Primary text
    textMuted: '#757575', // Secondary text
    border: '#E8E8E8', // Borders
    success: '#52C41A', // Success states
    warning: '#F59E0B', // Warnings
    error: '#EF4444', // Errors
  },

  typography: {
    fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif",
    fontFamilyHeading: "'Roboto', 'NotoSans', Arial, sans-serif",
    baseFontSize: 14,
    lineHeight: 1.5,
    headingLineHeight: 1.2,
  },

  spacing: {
    unit: 4,
    containerMaxWidth: '1200px',
    containerPadding: '1rem',
  },

  borders: {
    radius: '0.5rem',
    radiusLarge: '0.75rem',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },

  buttons: {
    borderRadius: '0.375rem',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '0.5rem',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '0.75rem',
  },

  animation: {
    duration: '200ms',
    easing: 'ease-in-out',
  },
};

// ============================================================================
// SECTION REGISTRY
// ============================================================================

/**
 * All sections available in this theme
 * Each section has: type, schema, component
 */
export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    schema: headerSchema,
    component: DarazHeader,
  },
  'hero-carousel': {
    type: 'hero-carousel',
    schema: heroCarouselSchema,
    component: DarazHeroCarousel,
  },
  'flash-sale': {
    type: 'flash-sale',
    schema: flashSaleSchema,
    component: DarazFlashSale,
  },
  'category-grid': {
    type: 'category-grid',
    schema: categoryGridSchema,
    component: DarazCategoryGrid,
  },
  'product-grid': {
    type: 'product-grid',
    schema: productGridSchema,
    component: DarazProductGrid,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: DarazFooter,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Section Components
  DarazHeader,
  DarazHeroCarousel,
  DarazFlashSale,
  DarazCategoryGrid,
  DarazProductGrid,
  DarazFooter,

  // Section Schemas
  headerSchema,
  heroCarouselSchema,
  flashSaleSchema,
  categoryGridSchema,
  productGridSchema,
  footerSchema,
};

// Default export for theme loading
export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
