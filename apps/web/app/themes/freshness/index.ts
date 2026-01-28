import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import FreshnessHeader, { schema as headerSchema } from './sections/header';
import FreshnessFooter, { schema as footerSchema } from './sections/footer';
import FreshnessHero, { schema as heroSchema } from './sections/hero-banner';

export const FRESHNESS_THEME_CONFIG: ThemeConfig = {
  name: 'Freshness',
  version: '2.0.0',
  colors: {
    primary: '#3730A3', // Indigo-800
    secondary: '#16A34A', // Green-600
    accent: '#FBBF24', // Amber-400
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1F2937', // Gray-800
    textMuted: '#9CA3AF', // Gray-400
    border: '#F3F4F6', // Gray-100
    error: '#EF4444',
    success: '#16A34A',
    footerBg: '#F9FAFB', // Gray-50
    footerText: '#6B7280', // Gray-500
    // Custom Freshness properties
    accentLight: 'rgba(251, 191, 36, 0.15)',
    freshGreen: '#22C55E', // Green-500
    organicBrown: '#92400E', // Amber-800
    naturalBeige: '#FEF3C7', // Amber-100
    leafGreen: '#15803D', // Green-700
    headerBg: 'rgba(255, 255, 255, 0.95)',
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyHeading: "'Pacifico', 'Caveat', cursive",
    baseFontSize: 16,
    lineHeight: 1.5,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },
  borders: {
    radius: '0.5rem',
    radiusLarge: '1.5rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  buttons: {
    borderRadius: '0.5rem',
    fontWeight: '600',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '1rem',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'ease-in-out',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: FreshnessHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: FreshnessFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: FreshnessHero,
    schema: heroSchema,
  },
};

export default {
  config: FRESHNESS_THEME_CONFIG,
  sections: SECTIONS,
  metadata: {
    id: 'freshness',
    name: 'Freshness',
    version: '2.0.0',
    description: 'Vibrant & Organic Theme',
    previewImage: '/templates/freshness.png', // Placeholder
    features: ['Organic Design', 'Vibrant Colors', 'Dual Navigation'],
    templates: ['index'],
    categories: ['grocery', 'health', 'food'],
    author: 'Ozzyl Team',
  },
};
