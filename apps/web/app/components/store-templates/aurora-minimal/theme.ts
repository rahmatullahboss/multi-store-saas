/**
 * AuroraMinimal Theme Constants (2025 Edition)
 * 
 * A premium minimalist theme featuring warm rose and cool sage gradients,
 * glassmorphism effects, and elegant typography.
 */

export const AURORA_THEME = {
  // Core Colors - Split-Tone Palette
  primary: '#2C2C2C',           // Deep Charcoal
  accent: '#E8C4C4',            // Warm Rose
  accentSecondary: '#B5C4B1',   // Cool Sage
  accentHover: '#D9B3B3',       // Rose Hover
  background: '#FDFBF9',        // Warm Off-White
  backgroundAlt: '#F5F2EF',     // Slightly Darker Off-White
  text: '#2C2C2C',              // Deep Charcoal
  textMuted: '#8E8E8E',         // Muted Gray
  cardBg: '#FFFFFF',            // Pure White
  headerBg: 'rgba(253, 251, 249, 0.85)', // Frosted Glass
  headerBgSolid: '#FDFBF9',     // Solid Header
  footerBg: '#2C2C2C',          // Deep Charcoal
  footerText: '#FDFBF9',        // Warm Off-White
  border: 'rgba(0, 0, 0, 0.06)', // Subtle Border
  
  // Gradients - Aurora Inspired
  auroraGradient: 'linear-gradient(135deg, #E8C4C4 0%, #D4C8D4 50%, #B5C4B1 100%)',
  auroraGradientSoft: 'linear-gradient(135deg, rgba(232, 196, 196, 0.3) 0%, rgba(181, 196, 177, 0.3) 100%)',
  auroraGradientHover: 'linear-gradient(135deg, #D9B3B3 0%, #C5B9C5 50%, #A6B5A2 100%)',
  textGradient: 'linear-gradient(135deg, #E8C4C4 0%, #B5C4B1 100%)',
  
  // Shadows - Soft & Premium
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
  cardShadowHover: '0 20px 60px rgba(0, 0, 0, 0.08)',
  headerShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
  buttonShadow: '0 8px 30px rgba(232, 196, 196, 0.4)',
  glowRose: '0 0 40px rgba(232, 196, 196, 0.3)',
  glowSage: '0 0 40px rgba(181, 196, 177, 0.3)',
  
  // Typography - Bold & Modern
  fontHeading: "'Outfit', sans-serif",
  fontBody: "'Plus Jakarta Sans', sans-serif",
  
  // Spacing
  containerPadding: '1.5rem',
  radius: '1.25rem',        // Rounded corners
  radiusSmall: '0.75rem',
  radiusFull: '9999px',     // Pills
  
  // Animations
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  transitionFast: 'all 0.2s ease',
  transitionBounce: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;
