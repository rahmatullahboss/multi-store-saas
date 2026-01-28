import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import RovoHeader, { schema as headerSchema } from './sections/header';
import RovoFooter, { schema as footerSchema } from './sections/footer';
import RovoHero, { schema as heroSchema } from './sections/hero-banner';

export const ROVO_THEME_CONFIG: ThemeConfig = {
  name: 'Rovo',
  version: '2.0.0',
  colors: {
    primary: '#000000',
    secondary: '#DC2626', // Red-600
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#171717',
    textMuted: '#737373',
    border: '#E5E5E5',
    error: '#EF4444',
    success: '#10B981',
    footerBg: '#F5F5F5',
    footerText: '#171717',
    headerBg: 'rgba(255, 255, 255, 0.95)',
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontFamilyHeading: "Inter, system-ui, sans-serif",
    baseFontSize: 16,
    lineHeight: 1.5,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1400px', // Wider layout for Rovo
    containerPadding: '1.5rem',
  },
  borders: {
    radius: '0px', // Square aesthetic
    radiusLarge: '0px',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  buttons: {
    borderRadius: '0px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cards: {
    borderRadius: '0px',
    shadow: 'none',
    padding: '0rem', // Minimal card style
  },
  animation: {
    duration: '0.2s',
    easing: 'ease-out',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: RovoHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: RovoFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: RovoHero,
    schema: heroSchema,
  },
};

export default {
  config: ROVO_THEME_CONFIG,
  sections: SECTIONS,
  metadata: {
    id: 'rovo',
    name: 'Rovo',
    version: '2.0.0',
    description: 'Minimal & Bold High-Fashion Theme',
    previewImage: '/templates/rovo.png', 
    features: ['Minimalist', 'Uppercase Typography', 'Square aesthetics'],
    templates: ['index'],
    categories: ['fashion', 'electronics', 'lifestyle'],
    author: 'Ozzyl Team',
  },
};
