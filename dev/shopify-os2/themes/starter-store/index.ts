/**
 * Starter Store Theme - Theme Registration & Metadata
 *
 * This is the default theme for Multi Store SaaS.
 * A clean, modern e-commerce theme optimized for Bangladeshi market.
 *
 * Shopify OS 2.0 Compatible Architecture:
 * - Sections with schemas
 * - JSON templates
 * - Block system
 * - Theme settings
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components - Homepage
import AnnouncementBar, { schema as announcementBarSchema } from './sections/announcement-bar';
import Header, { schema as headerSchema } from './sections/header';
import HeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';
import CategoriesGrid, { schema as categoriesGridSchema } from './sections/categories-grid';
import FeaturedCollection, {
  schema as featuredCollectionSchema,
} from './sections/featured-collection';
import SaleBanner, { schema as saleBannerSchema } from './sections/sale-banner';
import TrustBadges, { schema as trustBadgesSchema } from './sections/trust-badges';
import Footer, { schema as footerSchema } from './sections/footer';

// Import section components - Product Page
import ProductMain, { schema as productMainSchema } from './sections/product-main';

// Import section components - Cart Page
import CartItems, { schema as cartItemsSchema } from './sections/cart-items';
import CartSummary, { schema as cartSummarySchema } from './sections/cart-summary';

// Import section components - Collection Page
import CollectionHeader, { schema as collectionHeaderSchema } from './sections/collection-header';
import CollectionGrid, { schema as collectionGridSchema } from './sections/collection-grid';

// Import section components - General
import RichText, { schema as richTextSchema } from './sections/rich-text';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'starter-store',
  name: 'Starter Store',
  nameBn: 'স্টার্টার স্টোর',
  version: '1.0.0',
  author: 'Ozzyl',
  description: 'A clean, modern e-commerce theme optimized for the Bangladeshi market',
  descriptionBn: 'বাংলাদেশের বাজারের জন্য অপ্টিমাইজ করা একটি পরিষ্কার, আধুনিক ই-কমার্স থিম',

  // Preview
  previewImage: '/themes/starter-store/preview.png',

  // Features
  features: [
    'responsive',
    'mobile-first',
    'bangla-support',
    'rtl-support',
    'dark-mode-ready',
    'seo-optimized',
  ],

  // Supported page types
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],

  // Categories for theme picker
  categories: ['minimal', 'modern', 'fashion', 'general'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Starter Store',
  version: '1.0.0',

  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#4f46e5', // Darker indigo
    accent: '#f59e0b', // Amber
    background: '#f9fafb', // Light gray
    surface: '#ffffff', // White
    text: '#111827', // Dark gray
    textMuted: '#6b7280', // Gray
    border: '#e5e7eb', // Light border
    success: '#22c55e', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
  },

  typography: {
    fontFamily: "'Inter', 'Hind Siliguri', sans-serif",
    fontFamilyHeading: "'Inter', 'Hind Siliguri', sans-serif",
    baseFontSize: 16,
    lineHeight: 1.5,
    headingLineHeight: 1.2,
  },

  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },

  borders: {
    radius: '0.5rem',
    radiusLarge: '1rem',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },

  buttons: {
    borderRadius: '0.5rem',
    fontWeight: '500',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '0.75rem',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem',
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
  // Layout sections
  'announcement-bar': {
    type: 'announcement-bar',
    schema: announcementBarSchema,
    component: AnnouncementBar,
  },
  header: {
    type: 'header',
    schema: headerSchema,
    component: Header,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: Footer,
  },

  // Homepage sections
  'hero-banner': {
    type: 'hero-banner',
    schema: heroBannerSchema,
    component: HeroBanner,
  },
  'categories-grid': {
    type: 'categories-grid',
    schema: categoriesGridSchema,
    component: CategoriesGrid,
  },
  'featured-collection': {
    type: 'featured-collection',
    schema: featuredCollectionSchema,
    component: FeaturedCollection,
  },
  'sale-banner': {
    type: 'sale-banner',
    schema: saleBannerSchema,
    component: SaleBanner,
  },
  'trust-badges': {
    type: 'trust-badges',
    schema: trustBadgesSchema,
    component: TrustBadges,
  },

  // Product page sections
  'product-main': {
    type: 'product-main',
    schema: productMainSchema,
    component: ProductMain,
  },

  // Cart page sections
  'cart-items': {
    type: 'cart-items',
    schema: cartItemsSchema,
    component: CartItems,
  },
  'cart-summary': {
    type: 'cart-summary',
    schema: cartSummarySchema,
    component: CartSummary,
  },

  // Collection page sections
  'collection-header': {
    type: 'collection-header',
    schema: collectionHeaderSchema,
    component: CollectionHeader,
  },
  'collection-grid': {
    type: 'collection-grid',
    schema: collectionGridSchema,
    component: CollectionGrid,
  },

  // General sections
  'rich-text': {
    type: 'rich-text',
    schema: richTextSchema,
    component: RichText,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Section Components - Layout
  AnnouncementBar,
  Header,
  Footer,

  // Section Components - Homepage
  HeroBanner,
  CategoriesGrid,
  FeaturedCollection,
  SaleBanner,
  TrustBadges,

  // Section Components - Product
  ProductMain,

  // Section Components - Cart
  CartItems,
  CartSummary,

  // Section Components - Collection
  CollectionHeader,
  CollectionGrid,

  // Section Components - General
  RichText,

  // Section Schemas - Layout
  announcementBarSchema,
  headerSchema,
  footerSchema,

  // Section Schemas - Homepage
  heroBannerSchema,
  categoriesGridSchema,
  featuredCollectionSchema,
  saleBannerSchema,
  trustBadgesSchema,

  // Section Schemas - Product
  productMainSchema,

  // Section Schemas - Cart
  cartItemsSchema,
  cartSummarySchema,

  // Section Schemas - Collection
  collectionHeaderSchema,
  collectionGridSchema,

  // Section Schemas - General
  richTextSchema,
};

// Default export for theme loading
export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
