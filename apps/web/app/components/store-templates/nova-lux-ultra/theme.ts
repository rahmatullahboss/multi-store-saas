/**
 * Nova Lux Ultra Premium Theme Constants
 *
 * Ultra-premium luxury ecommerce template theme.
 * Worth 10,000,000৳ - World-class design with advanced animations.
 *
 * Features:
 * - Advanced glassmorphism effects
 * - Premium gold gradients with shimmer
 * - Cinematic color palette
 * - Ultra-smooth transitions
 * - Luxury typography hierarchy
 */

export const NOVALUX_ULTRA_THEME = {
  // Core Colors - Cinematic palette
  primary: '#0D0D0D', // Deep black
  primaryLight: '#1A1A1A', // Soft black
  accent: '#D4AF37', // Rich gold
  accentLight: '#F4D03F', // Light gold
  accentDark: '#B8860B', // Dark gold
  background: '#FAFAFA', // Off-white
  backgroundAlt: '#F5F5F0', // Warm white
  text: '#1C1C1E', // Rich charcoal
  textLight: '#FFFFFF', // Pure white
  textMuted: '#6B6B6B', // Sophisticated gray
  textSubtle: '#9B9B9B', // Subtle gray

  // Premium Card Colors
  cardBg: '#FFFFFF',
  cardBgHover: '#FFFBF0', // Warm cream on hover
  cardBorder: 'rgba(212, 175, 55, 0.15)',
  cardBorderHover: 'rgba(212, 175, 55, 0.4)',

  // Header & Footer
  headerBg: 'rgba(255, 255, 255, 0.85)',
  headerBgSolid: '#FFFFFF',
  footerBg: '#0D0D0D',
  footerText: '#FAFAFA',

  // Border Colors
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderGold: 'rgba(212, 175, 55, 0.3)',

  // Premium Gradients
  accentGradient:
    'linear-gradient(135deg, #D4AF37 0%, #F4D03F 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%)',
  accentShimmer:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
  heroGradient: 'linear-gradient(180deg, rgba(13,13,13,0) 0%, rgba(13,13,13,0.8) 100%)',
  glassGradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  goldGlow: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',

  // Luxury Shadows
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardShadowHover: '0 20px 50px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(212, 175, 55, 0.1)',
  headerShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
  buttonShadow: '0 4px 20px rgba(212, 175, 55, 0.35)',
  buttonShadowHover: '0 8px 30px rgba(212, 175, 55, 0.45)',
  glowShadow: '0 0 60px rgba(212, 175, 55, 0.2)',

  // Typography - Premium font stack
  fontHeading: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontAccent: "'Cormorant Garamond', Georgia, serif",

  // Spacing Scale
  containerPadding: '1.5rem',
  sectionPadding: '6rem',
  cardPadding: '1.5rem',

  // Transitions - Ultra smooth
  transitionFast: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionBase: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: '0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionBounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Border Radius - Sophisticated
  radiusSmall: '0.5rem',
  radiusMedium: '1rem',
  radiusLarge: '1.5rem',
  radiusXL: '2rem',
  radiusFull: '9999px',

  // Z-Index Scale
  zDropdown: 100,
  zSticky: 200,
  zModal: 300,
  zPopover: 400,
  zToast: 500,

  // Animation Durations
  animationFast: 0.2,
  animationBase: 0.4,
  animationSlow: 0.8,
  animationCinematic: 1.2,
} as const;

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const luxuryHover = {
  scale: 1.02,
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const cardHover = {
  y: -12,
  scale: 1.01,
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

export const shimmerAnimation = {
  background: [
    'linear-gradient(90deg, transparent 0%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, transparent 100%)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
};

export type NovaLuxUltraTheme = typeof NOVALUX_ULTRA_THEME;
