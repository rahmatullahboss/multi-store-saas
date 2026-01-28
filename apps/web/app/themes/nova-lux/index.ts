import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components - to be created
import NovaLuxHeader, { schema as headerSchema } from './sections/header';
import NovaLuxFooter, { schema as footerSchema } from './sections/footer';
import NovaLuxHeroBanner, { schema as heroBannerSchema } from './sections/hero-banner';

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
    fontFamilyHeading: "'Cormorant Garamond', Georgia, serif",
    fontFamilyBody: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSizeBase: '16px',
    fontSizeHeading: '2.5rem',
    lineHeightBase: '1.6',
    lineHeightHeading: '1.2',
  },
  spacing: {
    containerMaxWidth: '1280px',
    sectionPaddingY: '4rem',
    gridGap: '2rem',
  },
  borderRadius: {
    button: '9999px',
    card: '0.75rem',
    input: '0.375rem',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.05)',
    button: '0 4px 14px rgba(196, 163, 90, 0.3)',
    dropdown: '0 10px 25px rgba(0,0,0,0.1)',
  },
  buttons: {
    primaryStyle: 'solid',
    secondaryStyle: 'outline',
    uppercase: false,
  },
  cards: {
    style: 'elevated',
    imageAspectRatio: '4/5',
    contentAlignment: 'left',
  },
  animation: {
    enable: true,
    duration: '0.3s',
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
