/**
 * Aurora Minimal Theme - Theme Registration & Metadata
 *
 * Ultra-premium minimalist ecommerce theme featuring:
 * - Warm Rose + Cool Sage split-tone gradients
 * - Glassmorphism header with scroll effects
 * - Elegant product cards
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components - to be created
import AuroraHeader, { schema as headerSchema } from './sections/header';
import AuroraFooter, { schema as footerSchema } from './sections/footer';
import AuroraHeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'aurora-minimal',
  name: 'Aurora Minimal',
  nameBn: 'অরোরা মিনিমাল',
  version: '1.0.0',
  author: 'Ozzyl',
  description:
    'Ultra-premium minimalist theme featuring warm rose & cool sage accents with glassmorphism effects.',
  descriptionBn:
    'উষ্ণ গোলাপী এবং শীতল সেজ রঙের মিশ্রণে তৈরি প্রিমিয়াম মিনিমালিস্ট থিম।',

  // Preview
  previewImage: '/templates/aurora-minimal.png', // Assuming this path based on template registry

  // Features
  features: [
    'responsive',
    'mobile-first',
    'minimalist',
    'glassmorphism',
    'split-tone-gradient',
    'elegant-typography',
  ],

  // Supported page types
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],

  // Categories for theme picker
  categories: ['minimalist', 'modern', 'premium', 'fashion'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Aurora Minimal',
  version: '1.0.0',

  colors: {
    primary: '#2C2C2C',
    secondary: '#8E8E8E', // using muted text color as secondary
    accent: '#E8C4C4',
    background: '#FDFBF9',
    surface: '#FFFFFF',
    text: '#2C2C2C',
    textMuted: '#8E8E8E',
    border: 'rgba(0, 0, 0, 0.06)',
    success: '#B5C4B1', // Using sage for success
    warning: '#E8C4C4', // Using rose for warning
    error: '#E53935',
  },

  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontFamilyHeading: "'Outfit', sans-serif",
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
    radius: '1.25rem',
    radiusLarge: '1.5rem',
    width: '1px',
  },

  shadows: {
    sm: '0 4px 20px rgba(0, 0, 0, 0.04)',
    md: '0 8px 30px rgba(0, 0, 0, 0.08)',
    lg: '0 20px 60px rgba(0, 0, 0, 0.12)',
  },

  buttons: {
    borderRadius: '9999px',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '1.25rem',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    padding: '0',
  },

  animation: {
    duration: '400ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

// ============================================================================
// SECTION REGISTRY
// ============================================================================

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    schema: headerSchema,
    component: AuroraHeader,
  },
  'hero-banner': {
    type: 'hero-banner',
    schema: heroBannerSchema,
    component: AuroraHeroBanner,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: AuroraFooter,
  },
  // Add other sections as they are migrated
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  AuroraHeader,
  AuroraFooter,
  headerSchema,
  footerSchema,
};

export const AURORA_THEME = {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};

export default AURORA_THEME;
