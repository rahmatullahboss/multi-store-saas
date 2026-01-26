/**
 * Zenith Rise Premium Theme Constants
 *
 * World-class dark-mode SaaS/Digital product template theme.
 * Featuring glassmorphism, deep indigos, and vibrant gradients.
 *
 * STANDARDIZED to NovaLux Premium pattern for consistency.
 */

export const ZENITH_RISE_THEME = {
  // Primary Colors
  primary: '#4F46E5', // Indigo-600
  primaryHover: '#4338CA', // Indigo-700
  secondary: '#0F172A', // Slate-900 (Deep Dark Background)
  accent: '#EC4899', // Pink-500 (Vibrant Gradient Accent)
  accentHover: '#DB2777', // Pink-600
  accentLight: 'rgba(236, 72, 153, 0.1)', // Pink with transparency
  success: '#10B981', // Emerald-500

  // Background Colors
  background: '#020617', // Slate-950 (Main bg)
  backgroundAlt: '#0F172A', // Slate-900
  surface: '#1E293B', // Slate-800 (Card/Section bg)

  // Text Colors
  text: '#F8FAFC', // Slate-50 (Main text)
  textLight: '#FFFFFF',
  muted: '#94A3B8', // Slate-400
  mutedLight: '#CBD5E1', // Slate-300

  // UI Elements
  cardBg: '#1E293B', // Slate-800
  headerBg: 'rgba(2, 6, 23, 0.8)', // Glassmorphism
  headerBgSolid: '#020617', // Slate-950
  footerBg: '#0F172A', // Slate-900
  footerText: '#F8FAFC', // Slate-50
  border: '#334155', // Slate-700
  borderLight: '#475569', // Slate-600

  // Gradients
  accentGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)', // Indigo to Violet to Pink
  primaryGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', // Indigo to Violet
  heroGradient: 'linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.8) 100%)', // Dark fade
  glassmorphism: 'rgba(30, 41, 59, 0.6)', // Slate-800 with transparency

  // Shadows
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  cardShadowHover: '0 12px 40px rgba(79, 70, 229, 0.25)',
  headerShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
  buttonShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
  glowShadow: '0 0 30px rgba(236, 72, 153, 0.3)',

  // Typography
  fontHeading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",

  // Spacing
  containerPadding: '1rem',
  sectionPadding: '5rem',

  // Transitions
  transitionFast: '0.15s ease',
  transitionBase: '0.3s ease',
  transitionSlow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',

  // Border Radius
  radiusSmall: '0.5rem',
  radiusMedium: '1rem',
  radiusLarge: '1.5rem',
  radiusFull: '9999px',

  // Glassmorphism
  glassBackground: 'rgba(30, 41, 59, 0.6)',
  glassBackdrop: 'blur(12px)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
} as const;

export type ZenithRiseTheme = typeof ZENITH_RISE_THEME;
