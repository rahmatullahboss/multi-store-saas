import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import ArtisanHeader, { schema as headerSchema } from './sections/header';
import ArtisanFooter, { schema as footerSchema } from './sections/footer';
import ArtisanHero, { schema as heroSchema } from './sections/hero-banner';

export const ARTISAN_THEME_CONFIG: ThemeConfig = {
  name: 'Artisan Market',
  version: '1.0.0',
  colors: {
    primary: '#3d2f2f',
    secondary: '#57534e',
    accent: '#b45309',
    background: '#fefbf6',
    surface: '#ffffff',
    text: '#3d2f2f',
    textMuted: '#78716c',
    border: '#e7e5e4', // Warm gray/stone
    success: '#15803d',
    error: '#b91c1c',
    // Custom Artisan properties
    accentHover: '#92400e',
    accentLight: '#fef3c7',
    cream: '#fdf8f0',
    headerBg: '#fefbf6',
    footerBg: '#fef3c7',
    footerText: '#3d2f2f',
  },
  typography: {
    fontFamily: "'Work Sans', sans-serif",
    fontFamilyHeading: "'Newsreader', serif",
    baseFontSize: 16,
    lineHeight: 1.6,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1.5rem',
  },
  borders: {
    radius: '0.75rem', // Soft rounded
    radiusLarge: '1.5rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(61, 47, 47, 0.05)',
    md: '0 4px 6px -1px rgba(61, 47, 47, 0.1)',
    lg: '0 10px 15px -3px rgba(61, 47, 47, 0.1)',
  },
  buttons: {
    borderRadius: '1rem', // More organic feel
    fontWeight: '500',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '1.5rem',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    padding: '1.5rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'ease-out',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: ArtisanHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: ArtisanFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: ArtisanHero,
    schema: heroSchema,
  },
};

export default {
  config: ARTISAN_THEME_CONFIG,
  sections: SECTIONS,
};
