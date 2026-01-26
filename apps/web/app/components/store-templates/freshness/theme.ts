/**
 * Freshness Premium Theme Constants
 *
 * Vibrant, organic-focused e-commerce template.
 * Perfect for grocery, health, and natural product stores.
 *
 * STANDARDIZED to NovaLux Premium pattern for consistency.
 */

export const FRESHNESS_THEME = {
  // Primary Colors
  primary: '#3730A3', // Indigo-800
  primaryHover: '#312E81', // Indigo-900
  secondary: '#16A34A', // Green-600
  accent: '#FBBF24', // Amber-400
  accentHover: '#F59E0B', // Amber-500
  accentLight: 'rgba(251, 191, 36, 0.15)', // Amber with transparency
  success: '#16A34A', // Green-600

  // Background Colors
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC', // Slate-50
  surface: '#FFFFFF',

  // Text Colors
  text: '#1F2937', // Gray-800
  textLight: '#FFFFFF',
  muted: '#9CA3AF', // Gray-400
  mutedLight: '#D1D5DB', // Gray-300

  // UI Elements
  cardBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.95)',
  headerBgSolid: '#FFFFFF',
  footerBg: '#F9FAFB', // Gray-50
  footerText: '#6B7280', // Gray-500
  border: '#F3F4F6', // Gray-100
  borderLight: '#F9FAFB', // Gray-50

  // Fresh/Organic Colors
  freshGreen: '#22C55E', // Green-500
  organicBrown: '#92400E', // Amber-800
  naturalBeige: '#FEF3C7', // Amber-100
  leafGreen: '#15803D', // Green-700

  // Gradients
  accentGradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #16A34A 100%)',
  primaryGradient: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)',
  heroGradient: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)',
  freshGradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',

  // Shadows
  cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardShadowHover: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  headerShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  buttonShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',

  // Typography
  fontHeading: "'Pacifico', 'Caveat', cursive",
  fontBody: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

  // Spacing
  containerPadding: '1rem',
  sectionPadding: '4rem',

  // Transitions
  transitionFast: '0.15s ease',
  transitionBase: '0.3s ease',
  transitionSlow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',

  // Border Radius
  radiusSmall: '0.5rem',
  radiusMedium: '1rem',
  radiusLarge: '1.5rem',
  radiusFull: '9999px',

  // Category Badge Colors
  categoryColors: {
    vegetables: '#22C55E',
    fruits: '#F97316',
    dairy: '#3B82F6',
    meat: '#EF4444',
    bakery: '#A16207',
    beverages: '#06B6D4',
    organic: '#15803D',
    default: '#6B7280',
  },
} as const;

export type FreshnessTheme = typeof FRESHNESS_THEME;
