import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import EclipseHeader, { schema as headerSchema } from './sections/header';
import EclipseFooter, { schema as footerSchema } from './sections/footer';
import EclipseHero, { schema as heroSchema } from './sections/hero-banner';

export const ECLIPSE_THEME_CONFIG: ThemeConfig = {
  name: 'Eclipse',
  version: '2.0.0',
  colors: {
    primary: '#030712', // Deepest Slate/Black
    secondary: '#111827', // Gray 900
    accent: '#8B5CF6',  // Electric Violet
    accentSecondary: '#06B6D4', // Cyan
    background: '#030712',
    surface: '#111827',
    text: '#F9FAFB', // Gray 50
    textMuted: '#9CA3AF', // Gray 400
    border: 'rgba(255, 255, 255, 0.08)',
    error: '#EF4444',
    success: '#10B981',
    footerBg: '#000000', // Pure Black
    footerText: '#F9FAFB',
    // Custom Eclipse properties
    headerBg: 'rgba(3, 7, 18, 0.7)',
    accentGradient: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
    spotlightGradient: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontFamilyHeading: "'Space Grotesk', sans-serif",
    baseFontSize: 16,
    lineHeight: 1.5,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1.5rem',
  },
  borders: {
    radius: '1.5rem',
    radiusLarge: '2rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  buttons: {
    borderRadius: '9999px',
    fontWeight: '600',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '1.5rem',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: EclipseHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: EclipseFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: EclipseHero,
    schema: heroSchema,
  },
};

export const metadata = {
  id: 'eclipse',
  name: 'Eclipse Premium',
  description: 'Futuristic dark mode theme with neon accents.',
  author: 'Ozzyl',
  version: '2.0.0',
  previewImage: '/templates/eclipse.png',
};

export default {
  config: ECLIPSE_THEME_CONFIG,
  sections: SECTIONS,
  metadata,
};
