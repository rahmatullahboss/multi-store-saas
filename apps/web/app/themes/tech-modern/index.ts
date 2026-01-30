/**
 * Tech Modern Theme - Theme Registration & Metadata
 *
 * A clean, bold theme for electronics & tech products with:
 * - Slate + Electric Blue color scheme
 * - Modern rounded corners
 * - Inter typography
 * - Gradient hero backgrounds
 * - Zap icon branding
 *
 * Shopify OS 2.0 Compatible Architecture
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components
import TechHeader, { schema as headerSchema } from './sections/header';
import TechHeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';
import TechFeaturedProducts, {
  schema as featuredProductsSchema,
} from './sections/featured-products';
import TechFeatures, { schema as featuresSchema } from './sections/features';
import TechFooter, { schema as footerSchema } from './sections/footer';
import TechProductMain, { schema as productMainSchema } from './sections/product-main';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'tech-modern',
  name: 'Tech Modern',
  nameBn: 'টেক মডার্ন',
  version: '1.0.0',
  author: 'Ozzyl',
  description:
    'A clean, bold theme for electronics & tech products with slate + blue accents and modern UI',
  descriptionBn:
    'ইলেকট্রনিক্স ও টেক প্রোডাক্টের জন্য পরিষ্কার, বোল্ড থিম - স্লেট ও নীল অ্যাকসেন্ট সহ',

  previewImage: '/themes/tech-modern/preview.png',

  features: [
    'responsive',
    'mobile-first',
    'bangla-support',
    'modern-typography',
    'rounded-corners',
    'gradient-hero',
    'tech-focused',
    'blue-accents',
  ],

  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],

  categories: ['tech', 'electronics', 'gadgets', 'modern', 'clean'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Tech Modern',
  version: '1.0.0',

  colors: {
    primary: '#0f172a', // Slate 900
    secondary: '#1e293b', // Slate 800
    accent: '#3b82f6', // Blue 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff', // White
    text: '#0f172a', // Slate 900
    textMuted: '#64748b', // Slate 500
    border: '#e2e8f0', // Slate 200
    success: '#22c55e', // Green 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
  },

  typography: {
    fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif",
    fontFamilyHeading: "'Inter', 'Noto Sans Bengali', sans-serif",
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
    radius: '0.75rem', // 12px rounded
    radiusLarge: '1rem', // 16px rounded
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },

  buttons: {
    borderRadius: '0.75rem',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '1rem',
    shadow: '0 4px 6px rgba(0,0,0,0.05)',
    padding: '1.25rem',
  },

  animation: {
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// SECTION REGISTRY
// ============================================================================

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    schema: headerSchema,
    component: TechHeader,
  },
  'hero-banner': {
    type: 'hero-banner',
    schema: heroBannerSchema,
    component: TechHeroBanner,
  },
  'featured-products': {
    type: 'featured-products',
    schema: featuredProductsSchema,
    component: TechFeaturedProducts,
  },
  features: {
    type: 'features',
    schema: featuresSchema,
    component: TechFeatures,
  },
  'product-main': {
    type: 'product-main',
    schema: productMainSchema,
    component: TechProductMain,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: TechFooter,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TechHeader,
  TechHeroBanner,
  TechFeaturedProducts,
  TechFeatures,
  TechFooter,
  TechProductMain,
  headerSchema,
  heroBannerSchema,
  featuredProductsSchema,
  featuresSchema,
  footerSchema,
  productMainSchema,
};

export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
