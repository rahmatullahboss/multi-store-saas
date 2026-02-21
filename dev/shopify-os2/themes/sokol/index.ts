import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import SokolHeader, { schema as headerSchema } from './sections/header';
import SokolFooter, { schema as footerSchema } from './sections/footer';
import SokolHero, { schema as heroSchema } from './sections/hero-banner';

export const SOKOL_THEME_CONFIG: ThemeConfig = {
  name: 'Sokol',
  version: '2.0.0',
  colors: {
    primary: '#0D0D0D', // Deep Black
    secondary: '#E11D48', // Rose-600
    accent: '#E11D48',
    background: '#FAFAFA', // Off-white
    surface: '#FFFFFF',
    text: '#0D0D0D',
    textMuted: '#6B7280',
    border: '#E5E5E5',
    error: '#EF4444',
    success: '#10B981',
    footerBg: '#0D0D0D',
    footerText: '#F5F5F5',
    headerBg: 'rgba(255, 255, 255, 0.98)',
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontFamilyHeading: "Inter, system-ui, sans-serif",
    baseFontSize: 16,
    lineHeight: 1.5,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },
  borders: {
    radius: '0.75rem', // Slightly rounded
    radiusLarge: '1rem',
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
    duration: '0.2s',
    easing: 'ease-out',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: SokolHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: SokolFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: SokolHero,
    schema: heroSchema,
  },
};

export default {
  config: SOKOL_THEME_CONFIG,
  sections: SECTIONS,
  metadata: {
    id: 'sokol',
    name: 'Sokol',
    version: '2.0.0',
    description: 'Modern & Dark High-Contrast Theme',
    previewImage: '/templates/sokol.png',
    features: ['Dark Mode Footer', 'Rose Accents', 'Clean Layout'],
    templates: ['index'],
    categories: ['fashion', 'lifestyle', 'tech'],
    author: 'Ozzyl Team',
  },
};
