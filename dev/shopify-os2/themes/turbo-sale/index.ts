import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';
import TurboHeader, { schema as headerSchema } from './sections/header';
import TurboFooter, { schema as footerSchema } from './sections/footer';
import TurboHero, { schema as heroSchema } from './sections/hero-banner';
import UrgencyBar, { schema as urgencyBarSchema } from './sections/urgency-bar';

export const TURBO_SALE_THEME_CONFIG: ThemeConfig = {
  name: 'Turbo Sale',
  version: '2.0.0',
  colors: {
    primary: '#DC2626', // Red-600 (Urgency)
    secondary: '#FEF08A', // Yellow-200
    accent: '#16A34A', // Green-600
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#16A34A',
    footerBg: '#111827',
    footerText: '#F9FAFB',
    headerBg: '#FFFFFF',
    urgencyBg: '#DC2626',
    urgencyText: '#FFFFFF',
  },
  typography: {
    fontFamily: "'Hind Siliguri', 'Tiro Bangla', sans-serif",
    fontFamilyHeading: "'Hind Siliguri', 'Tiro Bangla', sans-serif",
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
    radiusLarge: '1rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  buttons: {
    borderRadius: '0.375rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cards: {
    borderRadius: '0.75rem',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '1rem',
  },
  animation: {
    duration: '0.3s',
    easing: 'ease-out',
  },
};

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    component: TurboHeader,
    schema: headerSchema,
  },
  footer: {
    type: 'footer',
    component: TurboFooter,
    schema: footerSchema,
  },
  'hero-banner': {
    type: 'hero-banner',
    component: TurboHero,
    schema: heroSchema,
  },
  'urgency-bar': {
    type: 'urgency-bar',
    component: UrgencyBar,
    schema: urgencyBarSchema,
  },
};

export default {
  config: TURBO_SALE_THEME_CONFIG,
  sections: SECTIONS,
  metadata: {
    id: 'turbo-sale',
    name: 'Turbo Sale',
    version: '2.0.0',
    description: 'High-urgency, video-first template for dropshipping.',
    previewImage: '/templates/turbo-sale.png',
    features: ['Flash Sale Bar', 'Video Hero', 'Sticky Cart'],
    templates: ['index'],
    categories: ['general', 'gadgets', 'fashion'],
    author: 'Ozzyl Team',
  },
};
