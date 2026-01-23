/**
 * Urgency-Scarcity Theme - FOMO Focused
 * 
 * Design Philosophy:
 * - Red/Yellow = Urgency, Alert
 * - Countdown timers everywhere
 * - Stock warnings
 * - Limited offer badges
 * - High-pressure sales design
 */

import type { ThemeConfig } from '../_core/types';

export const URGENCY_SCARCITY_THEME: ThemeConfig = {
  isDark: true,
  // Red/Yellow urgency
  primary: '#DC2626',      // Red
  accent: '#FBBF24',       // Yellow
  // Backgrounds - Dark for drama
  bgPrimary: '#0F0F0F',
  bgSecondary: '#1A1A1A',
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  // Cards - Dark with red accent
  cardBg: '#1A1A1A',
  cardBorder: '#DC2626',
  // CTA - Bright yellow
  ctaBg: '#FBBF24',
  ctaText: '#000000',
  // Header
  headerBg: '#DC2626',
  // Footer
  footerBg: '#0A0A0A',
  footerText: '#737373',
  // Urgency - Bright red
  urgencyBg: '#EF4444',
};
