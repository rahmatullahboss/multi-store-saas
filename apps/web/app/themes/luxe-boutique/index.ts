/**
 * Luxe Boutique Theme - Theme Registration & Metadata
 *
 * An elegant luxury e-commerce theme with:
 * - Black & Gold color scheme
 * - Serif typography (Playfair Display)
 * - Minimalist design
 * - Portrait product cards
 * - Gold accent details
 *
 * Shopify OS 2.0 Compatible Architecture:
 * - Sections with schemas
 * - JSON templates
 * - Block system
 * - Theme settings
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components
import LuxeHeader, { schema as headerSchema } from './sections/header';
import LuxeHeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';
import LuxeFeaturedCollection, {
  schema as featuredCollectionSchema,
} from './sections/featured-collection';
import LuxeTrustBadges, { schema as trustBadgesSchema } from './sections/trust-badges';
import LuxeFooter, { schema as footerSchema } from './sections/footer';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'luxe-boutique',
  name: 'Luxe Boutique',
  nameBn: 'লাক্স বুটিক',
  version: '1.0.0',
  author: 'Ozzyl',
  description:
    'An elegant luxury theme with black & gold accents, perfect for fashion, jewelry, and premium products',
  descriptionBn:
    'কালো ও সোনালি রঙের মিশ্রণে তৈরি বিলাসবহুল থিম, ফ্যাশন, গহনা ও প্রিমিয়াম পণ্যের জন্য উপযুক্ত',

  // Preview
  previewImage: '/themes/luxe-boutique/preview.png',

  // Features
  features: [
    'responsive',
    'mobile-first',
    'bangla-support',
    'serif-typography',
    'gold-accents',
    'portrait-cards',
    'wishlist',
    'elegant-animations',
  ],

  // Supported page types
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],

  // Categories for theme picker
  categories: ['luxury', 'fashion', 'jewelry', 'premium', 'elegant'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Luxe Boutique',
  version: '1.0.0',

  colors: {
    primary: '#1a1a1a', // Black
    secondary: '#2d2d2d', // Dark Gray
    accent: '#c9a961', // Gold
    background: '#faf9f7', // Off-white
    surface: '#ffffff', // White
    text: '#1a1a1a', // Black
    textMuted: '#6b6b6b', // Gray
    border: '#e5e5e5', // Light gray
    success: '#2d6a4f', // Deep green
    warning: '#b8860b', // Dark gold
    error: '#9b2335', // Deep red
  },

  typography: {
    fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif",
    fontFamilyHeading: "'Playfair Display', 'Noto Serif Bengali', serif",
    baseFontSize: 16,
    lineHeight: 1.6,
    headingLineHeight: 1.2,
  },

  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1.5rem',
  },

  borders: {
    radius: '0', // Sharp edges for luxury feel
    radiusLarge: '0',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 12px 24px rgba(0,0,0,0.12)',
  },

  buttons: {
    borderRadius: '0',
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  cards: {
    borderRadius: '0',
    shadow: 'none',
    padding: '0',
  },

  animation: {
    duration: '300ms',
    easing: 'ease-out',
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
    component: LuxeHeader,
  },
  'hero-banner': {
    type: 'hero-banner',
    schema: heroBannerSchema,
    component: LuxeHeroBanner,
  },
  'featured-collection': {
    type: 'featured-collection',
    schema: featuredCollectionSchema,
    component: LuxeFeaturedCollection,
  },
  'trust-badges': {
    type: 'trust-badges',
    schema: trustBadgesSchema,
    component: LuxeTrustBadges,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: LuxeFooter,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Section Components
  LuxeHeader,
  LuxeHeroBanner,
  LuxeFeaturedCollection,
  LuxeTrustBadges,
  LuxeFooter,

  // Section Schemas
  headerSchema,
  heroBannerSchema,
  featuredCollectionSchema,
  trustBadgesSchema,
  footerSchema,
};

// Default export for theme loading
export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
