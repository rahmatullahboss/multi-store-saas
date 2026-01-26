/**
 * Turbo Sale Premium Theme Constants
 *
 * High-urgency, video-first template for BD dropshipping market.
 * Features comparison tables, sticky CTAs, and urgency elements.
 *
 * STANDARDIZED to NovaLux Premium pattern for consistency.
 */

export const TURBO_SALE_THEME = {
  // Primary Colors
  primary: '#DC2626', // Red-600 (Urgency)
  primaryHover: '#B91C1C', // Red-700
  secondary: '#FEF08A', // Yellow-200 (Attention/Highlight)
  accent: '#16A34A', // Green-600 (Success/Call Action)
  accentHover: '#15803D', // Green-700
  accentLight: 'rgba(22, 163, 74, 0.1)', // Green with transparency
  success: '#16A34A', // Green-600
  warning: '#F59E0B', // Amber-500

  // Background Colors
  background: '#F9FAFB', // Gray-50
  backgroundAlt: '#F3F4F6', // Gray-100
  surface: '#FFFFFF', // White

  // Text Colors
  text: '#1F2937', // Gray-800
  textLight: '#FFFFFF',
  muted: '#6B7280', // Gray-500
  mutedLight: '#9CA3AF', // Gray-400

  // UI Elements
  cardBg: '#FFFFFF',
  headerBg: '#FFFFFF',
  headerBgSolid: '#FFFFFF',
  footerBg: '#111827', // Gray-900
  footerText: '#F9FAFB', // Gray-50
  border: '#E5E7EB', // Gray-200
  borderLight: '#F3F4F6', // Gray-100

  // Urgency Colors
  urgencyBg: '#DC2626', // Red-600
  urgencyText: '#FFFFFF',
  saleBadge: '#EF4444', // Red-500
  flashSaleBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',

  // Gradients
  accentGradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)', // Green gradient
  primaryGradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', // Red gradient
  heroGradient: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  ctaGradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #16A34A 100%)',

  // Shadows
  cardShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardShadowHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
  headerShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  buttonShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
  urgencyShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',

  // Typography (Bengali optimized)
  fontHeading: "'Hind Siliguri', 'Tiro Bangla', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBody: "'Hind Siliguri', -apple-system, BlinkMacSystemFont, sans-serif",

  // Spacing
  containerPadding: '1rem',
  sectionPadding: '3rem',

  // Transitions
  transitionFast: '0.15s ease',
  transitionBase: '0.3s ease',
  transitionSlow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',

  // Border Radius
  radiusSmall: '0.375rem',
  radiusMedium: '0.75rem',
  radiusLarge: '1rem',
  radiusFull: '9999px',

  // Mobile Sticky Footer
  stickyFooterBg: '#FFFFFF',
  stickyFooterShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',

  // Urgency Animation
  pulseAnimation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const;

export type TurboSaleTheme = typeof TURBO_SALE_THEME;
