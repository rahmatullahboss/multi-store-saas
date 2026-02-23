import type { StoreTemplateTheme } from '~/templates/types';

export const OZZYL_PREMIUM_THEME: StoreTemplateTheme = {
  id: 'ozzyl-premium',
  name: 'Ozzyl Premium',
  primary: '#C8A961',
  accent: '#E5D4A1',
  background: '#0A0A0C',
  muted: '#6B7280',
  cardBg: '#141418',
  cardBorder: '#2A2A32',
  headerBg: 'rgba(10, 10, 12, 0.85)',
  footerBg: '#0A0A0C',
  footerText: '#9CA3AF',
  surface: '#141418',
  surfaceHover: '#1C1C22',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: '#2A2A32',
  success: '#10B981',
  error: '#EF4444',
  fontHeading: 'Manrope',
  fontBody: 'Manrope',
  borderRadius: '12px',
  containerMaxWidth: '1400px',
};

export type OzzylPremiumTheme = typeof OZZYL_PREMIUM_THEME;
