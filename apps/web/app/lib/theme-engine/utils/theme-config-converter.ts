/**
 * Theme Config Converter
 *
 * Bridges the gap between the existing StoreTemplateTheme format
 * and the new Shopify OS 2.0 compatible ThemeConfig format.
 *
 * This allows existing templates to work with the new theme engine
 * without requiring immediate migration of all template code.
 */

import type { ThemeConfig } from '../types';
import type { StoreTemplateTheme, StoreTemplateDefinition } from '~/templates/store-registry';

// ============================================================================
// FONT MAPPINGS - Map template fonts to CSS font-family
// ============================================================================

const FONT_FAMILY_MAP: Record<string, string> = {
  // Serif fonts
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'Cormorant Garamond': "'Cormorant Garamond', Georgia, serif",
  Newsreader: "'Newsreader', Georgia, serif",

  // Sans-serif fonts
  Inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  Roboto: "'Roboto', -apple-system, sans-serif",
  'DM Sans': "'DM Sans', -apple-system, sans-serif",
  'Work Sans': "'Work Sans', -apple-system, sans-serif",
  'Space Grotesk': "'Space Grotesk', -apple-system, sans-serif",
  Outfit: "'Outfit', -apple-system, sans-serif",
  Poppins: "'Poppins', -apple-system, sans-serif",
  Oswald: "'Oswald', -apple-system, sans-serif",
  'Noto Sans Bengali': "'Noto Sans Bengali', -apple-system, sans-serif",
  'Hind Siliguri': "'Hind Siliguri', -apple-system, sans-serif",

  // Display fonts
  Pacifico: "'Pacifico', cursive",
};

// ============================================================================
// DEFAULT THEME VALUES
// ============================================================================

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Default Theme',
  version: '1.0.0',
  colors: {
    primary: '#1a1a1a',
    accent: '#c9a961',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#6b6b6b',
    border: '#e5e5e5',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyHeading: "'Playfair Display', Georgia, serif",
    baseFontSize: 16,
    lineHeight: 1.6,
    headingLineHeight: 1.2,
  },
  spacing: {
    unit: 4,
    containerMaxWidth: '1280px',
    containerPadding: '1rem',
  },
  borders: {
    radius: '0.5rem',
    radiusLarge: '1rem',
    width: '1px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  buttons: {
    borderRadius: '0.5rem',
    fontWeight: '600',
    textTransform: 'none',
  },
  cards: {
    borderRadius: '0.75rem',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    padding: '1.25rem',
  },
  animation: {
    duration: '200ms',
    easing: 'ease-in-out',
  },
};

// ============================================================================
// TEMPLATE-SPECIFIC ENHANCEMENTS
// ============================================================================

interface TemplateEnhancements {
  typography?: Partial<ThemeConfig['typography']>;
  borders?: Partial<ThemeConfig['borders']>;
  shadows?: Partial<ThemeConfig['shadows']>;
  buttons?: Partial<ThemeConfig['buttons']>;
  cards?: Partial<ThemeConfig['cards']>;
  animation?: Partial<ThemeConfig['animation']>;
}

const TEMPLATE_ENHANCEMENTS: Record<string, TemplateEnhancements> = {
  'luxe-boutique': {
    buttons: { textTransform: 'uppercase' },
    cards: { shadow: '0 8px 30px rgba(0, 0, 0, 0.08)' },
  },
  'tech-modern': {
    borders: { radius: '0.375rem', radiusLarge: '0.75rem' },
    buttons: { borderRadius: '0.375rem' },
  },
  'artisan-market': {
    borders: { radius: '0.25rem' },
    buttons: { borderRadius: '0.25rem' },
  },
  daraz: {
    borders: { radius: '0.25rem' },
    buttons: { borderRadius: '0.25rem', fontWeight: '500' },
  },
  bdshop: {
    borders: { radius: '0.5rem' },
  },
  'ghorer-bazar': {
    borders: { radius: '0.5rem' },
    buttons: { fontWeight: '500' },
  },
  'nova-lux': {
    borders: { radius: '0.75rem', radiusLarge: '1rem' },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
      md: '0 4px 20px rgba(0, 0, 0, 0.05)',
      lg: '0 12px 40px rgba(0, 0, 0, 0.12)',
    },
    buttons: { borderRadius: '9999px' },
    cards: {
      borderRadius: '1rem',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    },
    animation: { duration: '300ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  },
  eclipse: {
    borders: { radius: '0.75rem' },
    shadows: {
      sm: '0 0 10px rgba(139, 92, 246, 0.1)',
      md: '0 0 20px rgba(139, 92, 246, 0.15)',
      lg: '0 0 40px rgba(139, 92, 246, 0.2)',
    },
    buttons: { borderRadius: '0.5rem' },
  },
  'aurora-minimal': {
    borders: { radius: '1rem', radiusLarge: '1.5rem' },
    buttons: { borderRadius: '9999px' },
  },
  freshness: {
    borders: { radius: '1rem' },
    buttons: { borderRadius: '9999px' },
  },
  'zenith-rise': {
    borders: { radius: '0.75rem' },
    shadows: {
      md: '0 8px 32px rgba(0, 0, 0, 0.3)',
      lg: '0 16px 48px rgba(0, 0, 0, 0.4)',
    },
    buttons: { borderRadius: '0.5rem' },
  },
  'turbo-sale': {
    buttons: { borderRadius: '0.25rem', fontWeight: '700' },
  },
  rovo: {
    borders: { radius: '0.5rem' },
    buttons: { textTransform: 'uppercase', fontWeight: '700' },
  },
  sokol: {
    borders: { radius: '0.75rem' },
    buttons: { borderRadius: '9999px' },
  },
  'starter-store': {
    borders: { radius: '0.5rem' },
  },
};

// ============================================================================
// CONVERTER FUNCTIONS
// ============================================================================

/**
 * Convert StoreTemplateTheme to ThemeConfig
 *
 * Takes the simple color-based theme and expands it into a full ThemeConfig
 * with typography, spacing, borders, shadows, etc.
 */
export function convertToThemeConfig(
  theme: StoreTemplateTheme,
  fonts: { heading: string; body: string },
  templateId?: string
): ThemeConfig {
  const enhancements = templateId ? TEMPLATE_ENHANCEMENTS[templateId] : {};

  return {
    name: templateId || 'Custom Theme',
    version: '1.0.0',

    colors: {
      primary: theme.primary,
      secondary: theme.muted,
      accent: theme.accent,
      background: theme.background,
      surface: theme.cardBg,
      text: theme.text,
      textMuted: theme.muted,
      border: adjustOpacity(theme.text, 0.1),
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },

    typography: {
      fontFamily: FONT_FAMILY_MAP[fonts.body] || fonts.body,
      fontFamilyHeading: FONT_FAMILY_MAP[fonts.heading] || fonts.heading,
      baseFontSize: 16,
      lineHeight: 1.6,
      headingLineHeight: 1.2,
      ...enhancements.typography,
    },

    spacing: {
      unit: 4,
      containerMaxWidth: '1280px',
      containerPadding: '1rem',
    },

    borders: {
      ...DEFAULT_THEME_CONFIG.borders,
      ...enhancements.borders,
    },

    shadows: {
      ...DEFAULT_THEME_CONFIG.shadows,
      ...enhancements.shadows,
    },

    buttons: {
      ...DEFAULT_THEME_CONFIG.buttons,
      ...enhancements.buttons,
    },

    cards: {
      ...DEFAULT_THEME_CONFIG.cards,
      ...enhancements.cards,
    },

    animation: {
      ...DEFAULT_THEME_CONFIG.animation,
      ...enhancements.animation,
    },
  };
}

/**
 * Convert a StoreTemplateDefinition to ThemeConfig
 *
 * Convenience function that extracts theme and fonts from a template definition
 */
export function convertTemplateToThemeConfig(template: StoreTemplateDefinition): ThemeConfig {
  return convertToThemeConfig(template.theme, template.fonts, template.id);
}

/**
 * Convert ThemeConfig back to StoreTemplateTheme
 *
 * Used when we need to pass data to legacy components that expect the old format
 */
export function convertToStoreTemplateTheme(config: ThemeConfig): StoreTemplateTheme {
  return {
    primary: config.colors.primary,
    accent: config.colors.accent,
    background: config.colors.background,
    text: config.colors.text,
    muted: config.colors.textMuted,
    cardBg: config.colors.surface,
    headerBg: config.colors.surface,
    footerBg: config.colors.primary,
    footerText: config.colors.background,
  };
}

/**
 * Extract CSS variables from ThemeConfig
 *
 * Returns a style object that can be applied to a container element
 * to make theme values available as CSS custom properties
 */
export function themeConfigToCSSVariables(config: ThemeConfig): Record<string, string> {
  return {
    // Colors
    '--color-primary': config.colors.primary,
    '--color-secondary': config.colors.secondary || config.colors.textMuted,
    '--color-accent': config.colors.accent,
    '--color-background': config.colors.background,
    '--color-surface': config.colors.surface,
    '--color-text': config.colors.text,
    '--color-text-muted': config.colors.textMuted,
    '--color-border': config.colors.border,
    '--color-success': config.colors.success || '#22c55e',
    '--color-warning': config.colors.warning || '#f59e0b',
    '--color-error': config.colors.error || '#ef4444',

    // Typography - with safe defaults for missing typography config
    '--font-family': config.typography?.fontFamily || "'Inter', sans-serif",
    '--font-family-heading':
      config.typography?.fontFamilyHeading ||
      config.typography?.fontFamily ||
      "'Inter', sans-serif",
    '--font-size-base': `${config.typography?.baseFontSize || 16}px`,
    '--line-height': String(config.typography?.lineHeight || 1.6),
    '--line-height-heading': String(config.typography?.headingLineHeight || 1.2),

    // Spacing
    '--spacing-unit': `${config.spacing.unit}px`,
    '--container-max-width': config.spacing.containerMaxWidth,
    '--container-padding': config.spacing.containerPadding,

    // Borders
    '--border-radius': config.borders.radius,
    '--border-radius-lg': config.borders.radiusLarge,
    '--border-width': config.borders.width,

    // Shadows
    '--shadow-sm': config.shadows.sm,
    '--shadow-md': config.shadows.md,
    '--shadow-lg': config.shadows.lg,

    // Buttons
    '--button-radius': config.buttons.borderRadius,
    '--button-font-weight': config.buttons.fontWeight,

    // Cards
    '--card-radius': config.cards.borderRadius,
    '--card-shadow': config.cards.shadow,
    '--card-padding': config.cards.padding,

    // Animation
    '--animation-duration': config.animation.duration,
    '--animation-easing': config.animation.easing,
  };
}

/**
 * Create a style object from ThemeConfig for inline application
 *
 * Useful for components that need direct style application
 */
export function createThemeStyles(config: ThemeConfig): React.CSSProperties {
  return {
    '--color-primary': config.colors.primary,
    '--color-accent': config.colors.accent,
    '--color-background': config.colors.background,
    '--color-surface': config.colors.surface,
    '--color-text': config.colors.text,
    '--color-text-muted': config.colors.textMuted,
    fontFamily: config.typography.fontFamily,
    backgroundColor: config.colors.background,
    color: config.colors.text,
  } as React.CSSProperties;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Adjust color opacity
 * Simple utility to create a border color from text color
 */
function adjustOpacity(hexColor: string, opacity: number): string {
  // Handle rgba colors
  if (hexColor.startsWith('rgba')) {
    return hexColor.replace(/[\d.]+\)$/, `${opacity})`);
  }

  // Handle hex colors
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Check if a color is dark
 * Used to determine text color on backgrounds
 */
export function isDarkColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Get contrasting text color
 * Returns white or dark text based on background
 */
export function getContrastingColor(backgroundColor: string): string {
  return isDarkColor(backgroundColor) ? '#ffffff' : '#1a1a1a';
}

// ============================================================================
// GOOGLE FONTS HELPERS
// ============================================================================

/**
 * Get Google Fonts URL for a template's fonts
 */
export function getGoogleFontsUrl(fonts: { heading: string; body: string }): string {
  const families: string[] = [];

  // Add heading font
  if (fonts.heading && fonts.heading !== fonts.body) {
    const headingFormatted = fonts.heading.replace(/ /g, '+');
    families.push(`family=${headingFormatted}:wght@400;500;600;700`);
  }

  // Add body font
  if (fonts.body) {
    const bodyFormatted = fonts.body.replace(/ /g, '+');
    families.push(`family=${bodyFormatted}:wght@400;500;600;700`);
  }

  if (families.length === 0) {
    return '';
  }

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

/**
 * Get font link element for SSR
 */
export function getFontLinkProps(fonts: { heading: string; body: string }): {
  href: string;
  rel: 'stylesheet';
} | null {
  const url = getGoogleFontsUrl(fonts);
  if (!url) return null;
  return { href: url, rel: 'stylesheet' };
}

// ============================================================================
// ALL TEMPLATE CONFIGS (Pre-computed)
// ============================================================================

import {
  STORE_TEMPLATES,
  STORE_TEMPLATE_THEMES,
  type StoreTemplateDefinition as TemplateDef,
} from '~/templates/store-registry';

/**
 * Pre-computed ThemeConfigs for all templates
 */
export const TEMPLATE_THEME_CONFIGS: Record<string, ThemeConfig> = Object.fromEntries(
  STORE_TEMPLATES.map((template) => [template.id, convertTemplateToThemeConfig(template)])
);

/**
 * Get ThemeConfig for a template by ID
 */
export function getThemeConfigForTemplate(templateId: string): ThemeConfig {
  return (
    TEMPLATE_THEME_CONFIGS[templateId] ||
    TEMPLATE_THEME_CONFIGS['luxe-boutique'] ||
    DEFAULT_THEME_CONFIG
  );
}

/**
 * Get all available template IDs with their display names
 */
export function getAvailableTemplates(): Array<{ id: string; name: string }> {
  return STORE_TEMPLATES.map((t) => ({ id: t.id, name: t.name }));
}
