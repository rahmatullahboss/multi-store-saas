/**
 * Core Types for All Templates
 * 
 * These are the ONLY shared types across all isolated templates.
 */

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
  selectedSection?: string | null;  // Currently selected section for highlighting
  onUpdate?: (sectionId: string, newData: any) => void;
  lang?: string;
  currency?: string;
  theme: ThemeConfig;
  productVariants?: any[];
  orderBumps?: any[];
  storeId?: number | string;
  planType?: string;
  formatPrice: (price: number) => string;
}

// Helper to customize theme with user-selected colors
export function applyCustomColors(theme: ThemeConfig, primaryColor?: string, accentColor?: string): ThemeConfig {
  return {
    ...theme,
    primary: primaryColor || theme.primary,
    accent: accentColor || theme.accent,
  };
}

// Button style helper
export function getButtonStyles(primaryColor: string): React.CSSProperties {
  return {
    backgroundColor: primaryColor,
    color: '#fff',
  };
}
