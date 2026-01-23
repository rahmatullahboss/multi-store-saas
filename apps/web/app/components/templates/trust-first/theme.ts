/**
 * Trust-First Theme - Testimonial & Social Proof Focused
 * 
 * Design Philosophy:
 * - Fresh green tones = Trust, Health, Authenticity
 * - Heavy emphasis on customer testimonials
 * - Before/After comparisons
 * - Customer photos and reviews
 */

import type { ThemeConfig } from '../_core/types';

export const TRUST_FIRST_THEME: ThemeConfig = {
  isDark: false,
  // Fresh green - Trust & Health
  primary: '#059669',      // Emerald green
  accent: '#10B981',       // Light emerald
  // Backgrounds - Clean white with subtle green
  bgPrimary: '#FFFFFF',
  bgSecondary: '#ECFDF5',  // Very light green
  // Text
  textPrimary: '#064E3B',  // Dark green
  textSecondary: '#6B7280',
  // Cards
  cardBg: '#FFFFFF',
  cardBorder: '#D1FAE5',
  // CTA
  ctaBg: '#059669',
  ctaText: '#FFFFFF',
  // Header
  headerBg: '#059669',
  // Footer
  footerBg: '#064E3B',
  footerText: '#A7F3D0',
  // Urgency - Orange for contrast
  urgencyBg: '#F59E0B',
};
