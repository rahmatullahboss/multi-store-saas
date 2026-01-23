/**
 * Minimal Clean Theme - Apple-like Simplicity
 * 
 * Design Philosophy:
 * - Black & White with subtle accents
 * - Massive typography
 * - Lots of whitespace
 * - Single focused CTA
 * - Premium minimalist feel
 */

import type { ThemeConfig } from '../_core/types';

export const MINIMAL_CLEAN_THEME: ThemeConfig = {
  isDark: false,
  // Monochrome with blue accent
  primary: '#000000',
  accent: '#3B82F6',       // Blue accent
  // Backgrounds - Pure white
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  // Text
  textPrimary: '#111827',
  textSecondary: '#9CA3AF',
  // Cards
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  // CTA - Black
  ctaBg: '#000000',
  ctaText: '#FFFFFF',
  // Header
  headerBg: '#FFFFFF',
  // Footer
  footerBg: '#111827',
  footerText: '#9CA3AF',
  // Urgency
  urgencyBg: '#EF4444',
};
