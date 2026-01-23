/**
 * Theme Configuration
 * 
 * Maps preset theme names to color values for storefront styling.
 * These themes are selected in the merchant dashboard settings.
 */

export interface ThemeColors {
  primary: string;
  accent: string;
  primaryHover: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
}

/**
 * Preset theme color mappings
 * These match the themes defined in app/routes/app.settings.tsx
 */
export const presetThemes: Record<string, ThemeColors> = {
  default: {
    primary: '#10b981',      // emerald-500
    accent: '#f59e0b',       // amber-500
    primaryHover: '#059669', // emerald-600
    background: '#ffffff',
    textPrimary: '#111827',  // gray-900
    textSecondary: '#6b7280', // gray-500
  },
  ocean: {
    primary: '#3b82f6',      // blue-500
    accent: '#06b6d4',       // cyan-500
    primaryHover: '#2563eb', // blue-600
    background: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
  sunset: {
    primary: '#f59e0b',      // amber-500
    accent: '#ef4444',       // red-500
    primaryHover: '#d97706', // amber-600
    background: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
  rose: {
    primary: '#f43f5e',      // rose-500
    accent: '#ec4899',       // pink-500
    primaryHover: '#e11d48', // rose-600
    background: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
  purple: {
    primary: '#8b5cf6',      // violet-500
    accent: '#a855f7',       // purple-500
    primaryHover: '#7c3aed', // violet-600
    background: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
  dark: {
    primary: '#6366f1',      // indigo-500 (for dark mode contrast)
    accent: '#8b5cf6',       // violet-500
    primaryHover: '#4f46e5', // indigo-600
    background: '#111827',   // gray-900
    textPrimary: '#f9fafb',  // gray-50
    textSecondary: '#9ca3af', // gray-400
  },
};

/**
 * Get theme colors by preset name
 * Falls back to 'default' if theme not found
 */
export function getThemeColors(themeName: string | null | undefined): ThemeColors {
  if (!themeName) return presetThemes.default;
  return presetThemes[themeName] || presetThemes.default;
}

/**
 * Font options for store customization
 * Using Google Fonts for consistent cross-browser display
 */
export const fontOptions = [
  { value: 'inter', label: 'Inter', family: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { value: 'poppins', label: 'Poppins', family: "'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { value: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { value: 'playfair', label: 'Playfair Display', family: "'Playfair Display', serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
  { value: 'nunito', label: 'Nunito', family: "'Nunito', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
];

/**
 * Get font configuration by font name
 */
export function getFontConfig(fontName: string | null | undefined) {
  if (!fontName) return fontOptions[0]; // Default to Inter
  return fontOptions.find(f => f.value === fontName) || fontOptions[0];
}
