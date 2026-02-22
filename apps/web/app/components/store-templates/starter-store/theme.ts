/**
 * Starter Store Theme Configuration
 *
 * A complete, immersive e-commerce theme with full functionality:
 * - Working cart and checkout simulation
 * - Search functionality
 * - Static pages (About, Contact, FAQ, Policies)
 * - Mobile responsive
 * - Clean modern design
 *
 * Design System:
 * - Primary: #4F46E5 (Indigo)
 * - Accent: #F59E0B (Amber)
 * - Font: system font stack
 * - Border Radius: rounded-xl (12px)
 */

import type { ThemeConfig } from '@db/types';
import type { StoreTemplateTheme } from '~/templates/types';

/**
 * Complete design system theme configuration
 */
export const starterStoreTheme = {
  colors: {
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    accent: '#F59E0B',
    accentHover: '#D97706',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  spacing: {
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  },
};

/**
 * Legacy theme object for backward compatibility
 */
export const STARTER_STORE_THEME = {
  // Primary Colors
  primary: starterStoreTheme.colors.primary,
  secondary: starterStoreTheme.colors.primaryHover,
  primaryDark: starterStoreTheme.colors.primaryHover,
  primaryLight: '#EEF2FF', // Light indigo background

  // Accent & Status
  accent: starterStoreTheme.colors.accent,
  success: starterStoreTheme.colors.success,
  danger: starterStoreTheme.colors.error,
  warning: starterStoreTheme.colors.warning,

  // Layout Colors
  background: starterStoreTheme.colors.surface,
  cardBg: starterStoreTheme.colors.background,
  headerBg: starterStoreTheme.colors.background,
  footerBg: '#111827', // Dark gray footer
  footerText: '#FFFFFF', // White footer text

  // Text Colors
  text: starterStoreTheme.colors.text.primary,
  textSecondary: starterStoreTheme.colors.text.secondary,
  muted: starterStoreTheme.colors.text.muted,

  // Border
  border: starterStoreTheme.colors.border,
  borderLight: '#F3F4F6',

  // Shadows
  shadowSm: starterStoreTheme.shadows.sm,
  shadowMd: starterStoreTheme.shadows.md,
  shadowLg: starterStoreTheme.shadows.lg,
  shadowCard: '0 1px 3px rgba(0,0,0,0.1)',
};

export const STARTER_STORE_FONTS = {
  heading: starterStoreTheme.typography.fontFamily,
  body: starterStoreTheme.typography.fontFamily,
};

type StarterThemeWithSecondary = StoreTemplateTheme & {
  secondary?: string;
};

export type StarterStoreResolvedTheme = typeof STARTER_STORE_THEME & StoreTemplateTheme;

function normalizeHex(color: string | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  const threeHex = /^#([a-fA-F0-9]{3})$/;
  const sixHex = /^#([a-fA-F0-9]{6})$/;

  if (sixHex.test(trimmed)) return trimmed.toLowerCase();
  const shortMatch = trimmed.match(threeHex);
  if (!shortMatch) return null;
  const [r, g, b] = shortMatch[1].split('');
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return `rgba(79, 70, 229, ${alpha})`;
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, percent: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return STARTER_STORE_THEME.secondary;
  const value = normalized.slice(1);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const scale = 1 - percent;
  const r = clamp(parseInt(value.slice(0, 2), 16) * scale);
  const g = clamp(parseInt(value.slice(2, 4), 16) * scale);
  const b = clamp(parseInt(value.slice(4, 6), 16) * scale);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`;
}

export function resolveStarterStoreTheme(
  config?: ThemeConfig | null,
  theme?: StarterThemeWithSecondary | null
): StarterStoreResolvedTheme {
  const configWithSecondary = config as ThemeConfig & { secondaryColor?: string };
  // Merchant custom config must win over template defaults for cross-page color consistency.
  const primary = config?.primaryColor || theme?.primary || STARTER_STORE_THEME.primary;
  const secondary =
    configWithSecondary?.secondaryColor || theme?.secondary || darken(primary, 0.12);
  const accent = config?.accentColor || theme?.accent || STARTER_STORE_THEME.accent;
  const background = config?.backgroundColor || theme?.background || STARTER_STORE_THEME.background;
  const text = config?.textColor || theme?.text || STARTER_STORE_THEME.text;
  const border = config?.borderColor || theme?.cardBorder || STARTER_STORE_THEME.border;

  return {
    ...STARTER_STORE_THEME,
    ...theme,
    primary,
    secondary,
    primaryDark: darken(primary, 0.12),
    primaryLight: withAlpha(primary, 0.12),
    accent,
    background,
    text,
    textSecondary: withAlpha(text, 0.72),
    muted: theme?.muted || STARTER_STORE_THEME.muted,
    border,
    borderLight: withAlpha(border, 0.55),
    cardBg: theme?.cardBg || STARTER_STORE_THEME.cardBg,
    headerBg: theme?.headerBg || STARTER_STORE_THEME.headerBg,
    footerBg: theme?.footerBg || STARTER_STORE_THEME.footerBg,
    footerText: theme?.footerText || STARTER_STORE_THEME.footerText,
    cardBorder: border,
  };
}
