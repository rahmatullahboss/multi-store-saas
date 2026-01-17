/**
 * Social Proof Theme - Facebook/WhatsApp Style
 * 
 * Design Philosophy:
 * - Blue/Gray like Facebook
 * - Chat bubble testimonials
 * - WhatsApp message screenshots style
 * - Social media comment cards
 * - Familiar, trustworthy feel
 */

import type { ThemeConfig } from '../_core/types';

export const SOCIAL_PROOF_THEME: ThemeConfig = {
  isDark: false,
  // Facebook blue
  primary: '#1877F2',
  accent: '#25D366',       // WhatsApp green
  // Backgrounds - Light gray like FB
  bgPrimary: '#F0F2F5',
  bgSecondary: '#FFFFFF',
  // Text
  textPrimary: '#1C1E21',
  textSecondary: '#65676B',
  // Cards - White like FB posts
  cardBg: '#FFFFFF',
  cardBorder: '#DADDE1',
  // CTA - Blue
  ctaBg: '#1877F2',
  ctaText: '#FFFFFF',
  // Header
  headerBg: '#FFFFFF',
  // Footer
  footerBg: '#1C1E21',
  footerText: '#B0B3B8',
  // Urgency - Red notification
  urgencyBg: '#F02849',
};
