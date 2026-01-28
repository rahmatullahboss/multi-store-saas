import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import ZenithHeader, { schema as headerSchema } from './sections/header';
import ZenithFooter, { schema as footerSchema } from './sections/footer';
import ZenithHero, { schema as heroSchema } from './sections/hero-banner';
import ZenithFeatures, { schema as featuresSchema } from './sections/features';

export const ZENITH_RISE_THEME_CONFIG: ThemeConfig = {
  name: 'Zenith Rise',
  version: '2.0.0',
  colors: {
    primary: '#4F46E5', // Indigo-600
    secondary: '#0F172A', // Slate-900
    accent: '#EC4899', // Pink-500
    background: '#020617', // Slate-950
    surface: '#1E293B', // Slate-800
    text: '#F8FAFC', // Slate-50
    textMuted: '#94A3B8', // Slate-400
    border: '#334155', // Slate-700
    error: '#EF4444',
    success: '#10B981',
    footerBg: '#0F172A',
    footerText: '#F8FAFC',
    headerBg: 'rgba(2, 6, 23, 0.8)',
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    fontFamilyHeading: "'Outfit', 'Inter', sans-serif",
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
    borderRadius: '9999px',
    fontWeight: '600',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '1rem',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
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
    component: ZenithHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: ZenithFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: ZenithHero,
    schema: heroSchema,
  },
  features: {
    type: 'features',
    component: ZenithFeatures,
    schema: featuresSchema,
  },
};

export default {
  config: ZENITH_RISE_THEME_CONFIG,
  sections: SECTIONS,
  metadata: {
    id: 'zenith-rise',
    name: 'Zenith Rise',
    version: '2.0.0',
    description: 'World-class dark-mode SaaS/Digital product template.',
    previewImage: '/templates/zenith-rise.png',
    features: ['Glassmorphism', 'Dark Mode', 'Animations'],
    templates: ['index'],
    categories: ['saas', 'digital', 'tech'],
    author: 'Ozzyl Team',
  },
};
