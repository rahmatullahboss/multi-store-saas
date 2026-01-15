export const ECLIPSE_THEME = {
  // Colors (Dark Mode First)
  primary: '#030712', // Deepest Slate/Black
  accent: '#8B5CF6',  // Electric Violet
  accentHover: '#7C3AED',
  accentSecondary: '#06B6D4', // Cyan
  background: '#030712',
  backgroundAlt: '#111827', // Gray 900
  text: '#F9FAFB', // Gray 50
  textMuted: '#9CA3AF', // Gray 400
  cardBg: '#111827',
  cardBgHover: '#1F2937',
  headerBg: 'rgba(3, 7, 18, 0.7)', // Glass
  footerBg: '#000000', // Pure Black
  border: 'rgba(255, 255, 255, 0.08)',
  borderHighlight: 'rgba(139, 92, 246, 0.5)', // Violet glow
  
  // Gradients
  primaryGradient: 'linear-gradient(135deg, #030712 0%, #111827 100%)',
  accentGradient: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)', // Violet to Cyan
  spotlightGradient: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)',
  
  // Shadows
  cardShadow: '0 0 0 1px rgba(255,255,255,0.05)',
  cardShadowHover: '0 0 30px rgba(139, 92, 246, 0.15)',
  glow: '0 0 20px rgba(139, 92, 246, 0.5)',
  
  // Typography
  fontHeading: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  
  // Spacing
  containerPadding: '1.5rem',
  radius: '1.5rem', // Large rounded corners (Bento style)
  radiusSmall: '0.75rem',
  
  // Animations
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy
} as const;
