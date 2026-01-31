import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components
import NovaLuxHeader, { schema as headerSchema } from './sections/header';
import NovaLuxFooter, { schema as footerSchema } from './sections/footer';
import NovaLuxHeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';
import NovaLuxProductMain, { schema as productMainSchema } from './sections/product-main';
import NovaLuxCartItems, { schema as cartItemsSchema } from './sections/cart-items';
import NovaLuxCartSummary, { schema as cartSummarySchema } from './sections/cart-summary';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'nova-lux',
  name: 'Nova Lux',
  version: '1.0.0',
  author: 'Ozzyl Team',
  description: 'World-class luxury ecommerce template inspired by Shopify Prestige.',
  previewImage: '/templates/nova-lux.png',
  features: [
    'Premium Design',
    'Sticky Header',
    'Mega Menu',
    'Product Quick View',
    'Advanced Filtering',
  ],
  templates: ['index', 'product', 'collection', 'cart', 'page'],
  categories: ['fashion', 'luxury', 'jewelry', 'beauty'],
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Nova Lux',
  version: '1.0.0',
  colors: {
    primary: '#1C1C1E',
    secondary: '#FFFFFF',
    accent: '#C4A35A',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#2C2C2C',
    textMuted: '#8E8E93',
    border: '#E5E5EA',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyHeading: "'Cormorant Garamond', Georgia, serif",
    baseFontSize: 16,
    lineHeight: 1.6,
    headingLineHeight: 1.2,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },
  borders: {
    radius: '0.75rem',
    radiusLarge: '1rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 20px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 25px rgba(0,0,0,0.1)',
  },
  buttons: {
    borderRadius: '9999px',
    fontWeight: '500',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '0.75rem',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    padding: '1rem',
  },
  animation: {
    duration: '300ms',
    easing: 'ease-out',
  },
};

// ============================================================================
// SECTION REGISTRY
// ============================================================================

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    schema: headerSchema,
    component: NovaLuxHeader,
  },
  'hero-banner': {
    type: 'hero-banner',
    schema: heroBannerSchema,
    component: NovaLuxHeroBanner,
  },
  'product-main': {
    type: 'product-main',
    schema: productMainSchema,
    component: NovaLuxProductMain,
  },
  'cart-items': {
    type: 'cart-items',
    schema: cartItemsSchema,
    component: NovaLuxCartItems,
  },
  'cart-summary': {
    type: 'cart-summary',
    schema: cartSummarySchema,
    component: NovaLuxCartSummary,
  },
  footer: {
    type: 'footer',
    schema: footerSchema,
    component: NovaLuxFooter,
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export const NOVALUX_THEME = {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};

export default NOVALUX_THEME;
