/**
 * Template Theme Utilities
 * 
 * Helper functions for dynamic color styling in templates.
 * Uses config.primaryColor and config.accentColor from the editor.
 */

/**
 * Get button styles based on primaryColor from config
 * Returns inline style object for dynamic coloring
 */
export function getButtonStyles(primaryColor?: string) {
  const color = primaryColor || '#10b981'; // Default emerald-500
  
  return {
    backgroundColor: color,
    boxShadow: `0 10px 25px -5px ${color}40, 0 4px 6px -2px ${color}20`,
  };
}

/**
 * Get gradient button styles (from primary to accent)
 */
export function getGradientButtonStyles(primaryColor?: string, accentColor?: string) {
  const primary = primaryColor || '#10b981'; // emerald-500
  const accent = accentColor || '#059669'; // emerald-600
  
  return {
    background: `linear-gradient(to right, ${accent}, ${primary})`,
    boxShadow: `0 10px 25px -5px ${primary}40`,
  };
}

/**
 * Get section accent styles (backgrounds, borders)
 */
export function getAccentStyles(primaryColor?: string) {
  const color = primaryColor || '#10b981';
  
  return {
    backgroundColor: `${color}10`, // 10% opacity
    borderColor: `${color}30`,     // 30% opacity
  };
}

/**
 * Get text color style matching primary color
 */
export function getPrimaryTextStyle(primaryColor?: string) {
  return {
    color: primaryColor || '#10b981',
  };
}

/**
 * Get icon container background
 */
export function getIconBgStyle(primaryColor?: string) {
  const color = primaryColor || '#10b981';
  return {
    backgroundColor: `${color}15`,
  };
}

/**
 * Get icon color style
 */
export function getIconColorStyle(primaryColor?: string) {
  return {
    color: primaryColor || '#10b981',
  };
}
