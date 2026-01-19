/**
 * GhorerBazar Theme Configuration
 * 
 * Inspired by https://ghorerbazar.com - A premium Bangladeshi e-commerce store
 * Features: Orange accent, clean white design, modern product cards
 */

export const GHORER_BAZAR_THEME = {
  // Primary Colors
  primary: '#fc8934',        // Vibrant Orange (exact from ghorerbazar.com)
  primaryDark: '#e67a2e',    // Darker orange for hover states
  primaryLight: '#fff4eb',   // Light orange background
  
  // Secondary Colors  
  secondary: '#2d3748',      // Dark gray for text
  accent: '#e53935',         // Red for sale badges
  success: '#22c55e',        // Green for in-stock
  warning: '#f59e0b',        // Amber for limited stock
  
  // Badge Colors
  badgeSale: '#e53935',      // Red sale badge
  badgeNew: '#3b82f6',       // Blue new badge
  badgePreorder: '#8b5cf6',  // Purple preorder badge
  badgeHot: '#ef4444',       // Hot item badge
  
  // Layout Colors
  background: '#f5f5f5',     // Light gray page background
  cardBg: '#ffffff',         // White card background
  headerBg: '#ffffff',       // White header
  footerBg: '#1a1a1a',       // Dark footer
  footerText: '#ffffff',     // White footer text
  
  // Text Colors
  text: '#212121',           // Primary text
  textSecondary: '#757575',  // Secondary/muted text
  textMuted: '#9e9e9e',      // Muted text
  
  // Border & Divider
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  divider: '#eeeeee',
  
  // Price Colors
  priceRegular: '#212121',
  priceSale: '#fc8934',
  priceOld: '#9e9e9e',
  
  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  shadowCard: '0 2px 8px rgba(0,0,0,0.08)',
  
  // Border Radius
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusFull: '9999px',
  
  // Transitions
  transition: 'all 0.2s ease',
  transitionFast: 'all 0.15s ease',
  
  // Z-Index
  zHeader: 100,
  zModal: 200,
  zTooltip: 300,
};

// Font Configuration
export const GHORER_BAZAR_FONTS = {
  heading: "'Hind Siliguri', 'Arimo', sans-serif",
  body: "'Hind Siliguri', 'Arimo', sans-serif",
  bengali: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
};
