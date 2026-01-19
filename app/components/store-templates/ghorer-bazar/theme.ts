/**
 * GhorerBazar Theme Configuration
 * 
 * Bangladeshi Grocery & Organic Food Store Design System
 * Primary: Orange (#ff8a00)
 * Style: Clean, Trust-focused, WhatsApp-friendly, COD-first
 */

export const GHORER_BAZAR_THEME = {
  // Primary Colors
  primary: '#ff8a00',           // Main orange
  primaryDark: '#e67a00',       // Hover orange
  primaryLight: '#fff5e6',      // Light orange background
  
  // Accent Colors  
  secondary: '#1a1a1a',         // Black for buttons
  accent: '#ff8a00',            // Orange accent
  success: '#22c55e',           // Green for in-stock badge
  danger: '#ef4444',            // Red for sale badge
  warning: '#f59e0b',           // Yellow for pay online button
  
  // Badge Colors
  badgeSale: '#ef4444',         // Red sale badge
  badgeStock: '#22c55e',        // Green stock badge
  badgeNew: '#3b82f6',          // Blue new badge
  
  // Layout Colors
  background: '#f8f8f8',        // Light gray page background
  cardBg: '#ffffff',            // White card background
  headerBg: '#ff8a00',          // Orange header
  footerBg: '#1a1a1a',          // Dark footer
  footerText: '#ffffff',        // White footer text
  
  // Text Colors
  text: '#1a1a1a',              // Primary text (black)
  textSecondary: '#666666',     // Secondary text
  textMuted: '#999999',         // Muted text
  textWhite: '#ffffff',         // White text
  
  // Border & Divider
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  divider: '#eeeeee',
  
  // Price
  price: '#1a1a1a',             // Black price
  priceOld: '#999999',          // Strikethrough price
  
  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  shadowCard: '0 2px 8px rgba(0,0,0,0.06)',
  
  // Border Radius
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusXl: '16px',
  radiusFull: '9999px',
  
  // Transitions
  transition: 'all 0.2s ease',
  transitionFast: 'all 0.15s ease',
};

// Font Configuration
export const GHORER_BAZAR_FONTS = {
  heading: "'Hind Siliguri', sans-serif",
  body: "'Hind Siliguri', sans-serif",
};

// Category Menu Items
export const GHORER_BAZAR_CATEGORIES = [
  'Offer Zone',
  'Best Seller', 
  'Oil',
  'Ghee (ঘি)',
  'Dates (খেজুর)',
  'Honey',
  'Masala',
  'Nuts & Seeds',
  'Tea/Coffee',
  'Honeycomb',
  'Organic Zone',
  'Pickle',
];
