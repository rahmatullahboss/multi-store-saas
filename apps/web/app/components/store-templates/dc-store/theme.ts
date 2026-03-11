/**
 * DC Store Theme Configuration
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features warm off-white backgrounds, amber primary colors, and rose accents.
 */

import type { ThemeConfig } from '@db/types';
import type { StoreTemplateTheme } from '~/templates/types';

export const DC_STORE_THEME = {
  // Primary Colors (Golden/Amber)
  primary: '#f59e0b',        // amber-500 - Main brand color
  secondary: '#d97706',      // amber-600 - Supportive action color
  primaryDark: '#d97706',    // Darker amber for hover states
  primaryLight: '#fef3c7',   // Light amber background (amber-100)

  // Accent & Status
  accent: '#f43f5e',         // rose-500 - Gradient end color
  success: '#22c55e',        // Green
  danger: '#ef4444',         // Red
  warning: '#f59e0b',        // Amber

  // Layout Colors (Warm off-white theme)
  background: '#f8f7f5',     // Warm off-white page background
  cardBg: '#ffffff',         // White card background
  headerBg: '#f8f7f5',       // Same as background for seamless look
  footerBg: '#f1ede8',       // Slightly darker warm gray
  footerText: '#181411',     // Dark text on footer

  // Text Colors
  text: '#181411',           // Dark brown-black primary text
  textSecondary: '#6b5c4c',  // Muted brown-gray
  muted: '#6b5c4c',          // Muted text

  // Border Colors
  border: '#e5e0d8',         // Warm light border
  borderLight: '#f1ede8',    // Very light border

  // Shadows (Soft elevated shadows)
  shadowSm: '0 1px 2px rgba(24, 20, 17, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(24, 20, 17, 0.1)',
  shadowLg: '0 10px 15px -3px rgba(24, 20, 17, 0.1)',
  shadowCard: '0 20px 25px -5px rgba(24, 20, 17, 0.05), 0 8px 10px -6px rgba(24, 20, 17, 0.05)',

  // Brand Gradient Colors
  brandGradient: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
  heroOverlay: 'linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)',
};

export const DC_STORE_FONTS = {
  heading: "'Inter', 'Hind Siliguri', sans-serif",
  body: "'Inter', 'Hind Siliguri', sans-serif",
};

type DCStoreThemeWithSecondary = StoreTemplateTheme & {
  secondary?: string;
};

export type DCStoreResolvedTheme = typeof DC_STORE_THEME & StoreTemplateTheme;

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
  if (!normalized) return `rgba(245, 158, 11, ${alpha})`;
  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, percent: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return DC_STORE_THEME.secondary;
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

export function resolveDCStoreTheme(
  config?: ThemeConfig | null,
  theme?: DCStoreThemeWithSecondary | null
): DCStoreResolvedTheme {
  const configWithSecondary = config as ThemeConfig & { secondaryColor?: string };
  
  // Merchant custom config must win over template defaults
  const primary = config?.primaryColor || theme?.primary || DC_STORE_THEME.primary;
  const secondary =
    configWithSecondary?.secondaryColor || theme?.secondary || darken(primary, 0.12);
  const accent = config?.accentColor || theme?.accent || DC_STORE_THEME.accent;
  const background = config?.backgroundColor || theme?.background || DC_STORE_THEME.background;
  const text = config?.textColor || theme?.text || DC_STORE_THEME.text;
  const border = config?.borderColor || theme?.cardBorder || DC_STORE_THEME.border;

  return {
    ...DC_STORE_THEME,
    ...theme,
    primary,
    secondary,
    primaryDark: darken(primary, 0.12),
    primaryLight: withAlpha(primary, 0.12),
    accent,
    background,
    text,
    textSecondary: withAlpha(text, 0.72),
    muted: theme?.muted || DC_STORE_THEME.muted,
    border,
    borderLight: withAlpha(border, 0.55),
    cardBg: theme?.cardBg || DC_STORE_THEME.cardBg,
    headerBg: theme?.headerBg || DC_STORE_THEME.headerBg,
    footerBg: theme?.footerBg || DC_STORE_THEME.footerBg,
    footerText: theme?.footerText || DC_STORE_THEME.footerText,
    cardBorder: border,
  };
}
