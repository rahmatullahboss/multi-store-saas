/**
 * Starter Store Theme Configuration
 *
 * A complete, immersive e-commerce theme with full functionality:
 * - Working cart and checkout simulation
 * - Search functionality
 * - Static pages (About, Contact, FAQ, Policies)
 * - Mobile responsive
 * - Clean modern design
 */

import type { ThemeConfig } from '@db/types';
import type { StoreTemplateTheme } from '~/templates/store-registry';

export const STARTER_STORE_THEME = {
  // Primary Colors
  primary: '#6366f1', // Indigo
  secondary: '#4f46e5', // Supportive action color (e.g. secondary CTA)
  primaryDark: '#4f46e5', // Darker indigo
  primaryLight: '#eef2ff', // Light indigo background

  // Accent & Status
  accent: '#f59e0b', // Amber for highlights
  success: '#22c55e', // Green
  danger: '#ef4444', // Red
  warning: '#f59e0b', // Amber

  // Layout Colors
  background: '#f9fafb', // Light gray page background
  cardBg: '#ffffff', // White card background
  headerBg: '#ffffff', // White header
  footerBg: '#111827', // Dark gray footer
  footerText: '#ffffff', // White footer text

  // Text Colors
  text: '#111827', // Primary text
  textSecondary: '#4b5563', // Secondary text
  muted: '#6b7280', // Muted text

  // Border
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  shadowCard: '0 1px 3px rgba(0,0,0,0.1)',
};

export const STARTER_STORE_FONTS = {
  heading: "'Inter', 'Hind Siliguri', sans-serif",
  body: "'Inter', 'Hind Siliguri', sans-serif",
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
  if (!normalized) return `rgba(99, 102, 241, ${alpha})`;
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
  const primary = theme?.primary || config?.primaryColor || STARTER_STORE_THEME.primary;
  const secondary =
    theme?.secondary || configWithSecondary.secondaryColor || darken(primary, 0.12);
  const accent = theme?.accent || config?.accentColor || STARTER_STORE_THEME.accent;
  const background = theme?.background || config?.backgroundColor || STARTER_STORE_THEME.background;
  const text = theme?.text || config?.textColor || STARTER_STORE_THEME.text;
  const border = theme?.cardBorder || config?.borderColor || STARTER_STORE_THEME.border;

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
