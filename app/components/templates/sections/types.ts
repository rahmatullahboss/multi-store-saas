import type { LandingConfig } from '@db/types';

// ============================================================================
// THEME CONFIGURATION - All templates must provide these theme properties
// ============================================================================
export interface ThemeConfig {
  isDark: boolean;
  // Primary colors
  primary: string;
  accent: string;
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  // Text colors
  textPrimary: string;
  textSecondary: string;
  // Cards
  cardBg: string;
  cardBorder: string;
  // CTA buttons
  ctaBg: string;
  ctaText: string;
  // Header/Footer
  headerBg: string;
  footerBg: string;
  footerText: string;
  // Urgency (optional)
  urgencyBg?: string;
}

// ============================================================================
// SECTION PROPS - All sections must accept these props
// ============================================================================
export interface SectionProps {
  config: LandingConfig;
  product: any;
  storeName: string;
  isPreview?: boolean;
  isEditMode?: boolean;
  onUpdate?: (sectionId: string, newData: any) => void;
  lang?: string;
  currency?: string;
  theme: ThemeConfig;  // Now required and typed
  productVariants?: any[];
  orderBumps?: any[];
  storeId?: number | string;
  planType?: string;
}

export type SectionType = 
  | 'hero' 
  | 'trust' 
  | 'features' 
  | 'gallery' 
  | 'video' 
  | 'benefits' 
  | 'comparison' 
  | 'testimonials' 
  | 'social' 
  | 'delivery' 
  | 'faq' 
  | 'guarantee' 
  | 'cta'
  | 'contact'
  | 'order-form'
  | 'showcase-hero'
  | 'showcase-gallery-grid'
  | 'mobile-first-hero'
  | 'modern-dark-hero'
  | 'video-focus-hero';

// ============================================================================
// PRESET THEMES - Ready-to-use themes for each template
// ============================================================================

export const FLASH_SALE_THEME: ThemeConfig = {
  isDark: true,
  primary: '#dc2626',
  accent: '#f59e0b',
  bgPrimary: 'bg-black',
  bgSecondary: 'bg-gray-900',
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  cardBg: 'bg-gray-800',
  cardBorder: 'border-gray-700',
  ctaBg: 'bg-gradient-to-r from-red-600 to-yellow-500',
  ctaText: 'text-white',
  headerBg: 'bg-black',
  footerBg: 'bg-black',
  footerText: 'text-gray-400',
  urgencyBg: 'bg-gradient-to-r from-red-600 via-red-500 to-yellow-500',
};

export const MODERN_DARK_THEME: ThemeConfig = {
  isDark: true,
  primary: '#ef4444',
  accent: '#f97316',
  bgPrimary: 'bg-zinc-950',
  bgSecondary: 'bg-zinc-900',
  textPrimary: 'text-white',
  textSecondary: 'text-zinc-400',
  cardBg: 'bg-zinc-900',
  cardBorder: 'border-zinc-700',
  ctaBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  ctaText: 'text-white',
  headerBg: 'bg-black',
  footerBg: 'bg-black',
  footerText: 'text-gray-500',
  urgencyBg: 'bg-gradient-to-r from-red-600 to-orange-500',
};

export const MINIMAL_LIGHT_THEME: ThemeConfig = {
  isDark: false,
  primary: '#0ea5e9',
  accent: '#8b5cf6',
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  cardBg: 'bg-white',
  cardBorder: 'border-gray-200',
  ctaBg: 'bg-sky-500 hover:bg-sky-600',
  ctaText: 'text-white',
  headerBg: 'bg-white',
  footerBg: 'bg-gray-50',
  footerText: 'text-gray-600',
};

export const PREMIUM_BD_THEME: ThemeConfig = {
  isDark: false,
  primary: '#f97316',
  accent: '#ef4444',
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gradient-to-b from-gray-50 to-white',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  cardBg: 'bg-white',
  cardBorder: 'border-gray-200',
  ctaBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  ctaText: 'text-white',
  headerBg: 'bg-white',
  footerBg: 'bg-gray-900',
  footerText: 'text-gray-400',
};

export const ORGANIC_THEME: ThemeConfig = {
  isDark: false,
  primary: '#22c55e',
  accent: '#84cc16',
  bgPrimary: 'bg-gradient-to-b from-green-50 to-white',
  bgSecondary: 'bg-green-50',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  cardBg: 'bg-white',
  cardBorder: 'border-green-200',
  ctaBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
  ctaText: 'text-white',
  headerBg: 'bg-white',
  footerBg: 'bg-green-900',
  footerText: 'text-green-200',
};

export const LUXE_THEME: ThemeConfig = {
  isDark: true,
  primary: '#d4af37',
  accent: '#c9a227',
  bgPrimary: 'bg-black',
  bgSecondary: 'bg-zinc-900',
  textPrimary: 'text-white',
  textSecondary: 'text-zinc-400',
  cardBg: 'bg-zinc-900',
  cardBorder: 'border-yellow-600/30',
  ctaBg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
  ctaText: 'text-black',
  headerBg: 'bg-black',
  footerBg: 'bg-black',
  footerText: 'text-zinc-500',
};

export const VIDEO_FOCUS_THEME: ThemeConfig = {
  isDark: true,
  primary: '#8b5cf6',
  accent: '#a855f7',
  bgPrimary: 'bg-slate-950',
  bgSecondary: 'bg-slate-900',
  textPrimary: 'text-white',
  textSecondary: 'text-slate-400',
  cardBg: 'bg-slate-900',
  cardBorder: 'border-slate-700',
  ctaBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
  ctaText: 'text-white',
  headerBg: 'bg-black',
  footerBg: 'bg-black',
  footerText: 'text-slate-500',
};

// Showcase Template - Rose/Pink elegant luxury theme
export const SHOWCASE_THEME: ThemeConfig = {
  isDark: true,
  primary: '#f43f5e',
  accent: '#fb7185',
  bgPrimary: 'bg-[#0a0a0a]',
  bgSecondary: 'bg-zinc-900',
  textPrimary: 'text-white',
  textSecondary: 'text-zinc-400',
  cardBg: 'bg-zinc-900/50',
  cardBorder: 'border-rose-900/30',
  ctaBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
  ctaText: 'text-white',
  headerBg: 'bg-black',
  footerBg: 'bg-black',
  footerText: 'text-zinc-500',
  urgencyBg: 'bg-rose-900/20',
};

// Mobile-First Template - Bright orange/red conversion-focused theme
export const MOBILE_FIRST_THEME: ThemeConfig = {
  isDark: false,
  primary: '#f97316',
  accent: '#fb923c',
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-orange-50',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  cardBg: 'bg-white',
  cardBorder: 'border-orange-200',
  ctaBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  ctaText: 'text-white',
  headerBg: 'bg-white',
  footerBg: 'bg-gray-900',
  footerText: 'text-gray-400',
  urgencyBg: 'bg-orange-100',
};

// Helper to customize theme with user-selected colors
export function applyCustomColors(theme: ThemeConfig, primaryColor?: string, accentColor?: string): ThemeConfig {
  return {
    ...theme,
    primary: primaryColor || theme.primary,
    accent: accentColor || theme.accent,
  };
}
