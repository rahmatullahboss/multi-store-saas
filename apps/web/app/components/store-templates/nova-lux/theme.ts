/**
 * NovaLux Premium Theme Constants
 * 
 * World-class luxury ecommerce template theme.
 * Inspired by Shopify Prestige, Squarespace Fulton, and 2024 design trends.
 */

export const NOVALUX_THEME = {
  // Colors
  primary: '#1C1C1E',
  accent: '#C4A35A',
  accentHover: '#B8943F',
  accentLight: '#F5F0E6',
  background: '#FAFAFA',
  backgroundAlt: '#F5F5F5',
  text: '#2C2C2C',
  textLight: '#FFFFFF',
  muted: '#8E8E93',
  mutedLight: '#AEAEB2',
  cardBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.95)',
  headerBgSolid: '#FFFFFF',
  footerBg: '#1C1C1E',
  footerText: '#FAFAFA',
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  
  // Gradients
  accentGradient: 'linear-gradient(135deg, #C4A35A 0%, #D4B86A 50%, #C4A35A 100%)',
  heroGradient: 'linear-gradient(180deg, rgba(28,28,30,0) 0%, rgba(28,28,30,0.7) 100%)',
  
  // Shadows
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  cardShadowHover: '0 12px 40px rgba(0, 0, 0, 0.12)',
  headerShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
  buttonShadow: '0 4px 14px rgba(196, 163, 90, 0.3)',
  
  // Typography
  fontHeading: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  
  // Spacing
  containerPadding: '1rem',
  sectionPadding: '4rem',
  
  // Transitions
  transitionFast: '0.15s ease',
  transitionBase: '0.3s ease',
  transitionSlow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Border Radius
  radiusSmall: '0.375rem',
  radiusMedium: '0.75rem',
  radiusLarge: '1rem',
  radiusFull: '9999px',
} as const;

export type NovaLuxTheme = typeof NOVALUX_THEME;
