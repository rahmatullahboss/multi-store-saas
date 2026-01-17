/**
 * Story-Driven Theme - Emotional Problem→Solution Narrative
 * 
 * Design Philosophy:
 * - Warm orange/amber tones = Urgency but Friendly
 * - Long-form storytelling layout
 * - Emotional connection focus
 * - Personal, relatable feel
 */

import type { ThemeConfig } from '../_core/types';

export const STORY_DRIVEN_THEME: ThemeConfig = {
  isDark: false,
  // Warm amber - Friendly urgency
  primary: '#D97706',      // Amber
  accent: '#F59E0B',       // Yellow-orange
  // Backgrounds - Warm cream
  bgPrimary: '#FFFBEB',    // Warm cream
  bgSecondary: '#FEF3C7',  // Light amber
  // Text
  textPrimary: '#78350F',  // Dark brown
  textSecondary: '#92400E',
  // Cards
  cardBg: '#FFFFFF',
  cardBorder: '#FDE68A',
  // CTA
  ctaBg: '#D97706',
  ctaText: '#FFFFFF',
  // Header
  headerBg: '#FFFBEB',
  // Footer
  footerBg: '#78350F',
  footerText: '#FDE68A',
  // Urgency
  urgencyBg: '#DC2626',
};
