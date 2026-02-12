/**
 * MVP Simple Theme Settings Configuration
 *
 * This is the simplified theme configuration system for MVP launch.
 * Instead of the complex Shopify OS 2.0 section-based system, we use
 * a simple key-value approach with only 5 customizable settings.
 *
 * Context7 Research: Based on Shopify's theme settings best practices,
 * merchants typically only customize: store name, logo, and 2-3 colors.
 *
 * Benefits:
 * - Simple & fast (single DB query)
 * - Consistent across all pages (uses old React component system)
 * - Easy to migrate to full system later
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * MVP Theme Settings - Simplified for MVP
 * Based on research: merchants typically customize these most
 */
export interface MVPThemeSettings {
  /** Store display name (can override DB store name) */
  storeName: string;

  /** Store logo URL */
  logo?: string | null;

  /** Browser favicon */
  favicon?: string | null;

  /** Primary brand color (buttons, links, headings) */
  primaryColor: string;

  /** Accent color (badges, highlights, CTAs) */
  accentColor: string;

  /** Show announcement banner on storefront */
  showAnnouncement?: boolean;

  /** Announcement banner text */
  announcementText?: string | null;
}

/**
 * Settings with theme ID for database storage
 */
export interface MVPSettingsWithTheme extends MVPThemeSettings {
  /** Currently active theme template ID */
  themeId: string;
}

// ============================================================================
// DEFAULT VALUES FOR EACH THEME
// ============================================================================

/**
 * Default MVP settings for each theme
 * These match the theme's built-in color scheme
 * NOTE: No announcement banner for MVP - keep it simple
 */
export const DEFAULT_MVP_SETTINGS: Record<string, MVPThemeSettings> = {
  'starter-store': {
    storeName: 'My Store',
    primaryColor: '#4F46E5', // Indigo
    accentColor: '#F59E0B', // Amber
    logo: null,
    favicon: null,
    showAnnouncement: false,
    announcementText: null,
  },

  'ghorer-bazar': {
    storeName: 'ঘরের বাজার',
    primaryColor: '#fc8934', // Orange (exact from ghorerbazar.com)
    accentColor: '#e53935', // Red for sale badges
    logo: null,
    favicon: null,
    showAnnouncement: true,
    announcementText: '১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি!',
  },

  'luxe-boutique': {
    storeName: 'Luxe Boutique',
    primaryColor: '#1a1a1a', // Black
    accentColor: '#c9a961', // Gold
    logo: null,
    favicon: null,
    showAnnouncement: false,
    announcementText: null,
  },

  'nova-lux': {
    storeName: 'Nova Lux',
    primaryColor: '#1C1C1E', // Deep Charcoal
    accentColor: '#C4A35A', // Rose Gold
    logo: null,
    favicon: null,
    showAnnouncement: false,
    announcementText: null,
  },

  'nova-lux-ultra': {
    storeName: 'Nova Lux Ultra',
    primaryColor: '#0D0D0D', // Deep black
    accentColor: '#D4AF37', // Rich gold
    logo: null,
    favicon: null,
    showAnnouncement: true,
    announcementText: '✨ Welcome to Ultra Luxury - Free Express Shipping on orders over ৳5,000!',
  },

  'tech-modern': {
    storeName: 'Tech Store',
    primaryColor: '#0f172a', // Dark Slate
    accentColor: '#3b82f6', // Blue
    logo: null,
    favicon: null,
    showAnnouncement: false,
    announcementText: null,
  },
};

// ============================================================================
// VALIDATION & HELPERS
// ============================================================================

/**
 * Validate and normalize MVP settings
 * Ensures all required fields have values
 */
export function validateMVPSettings(
  settings: Partial<MVPThemeSettings>,
  themeId: string = 'starter-store'
): MVPThemeSettings {
  const defaults = DEFAULT_MVP_SETTINGS[themeId] || DEFAULT_MVP_SETTINGS['starter-store'];

  return {
    storeName: settings.storeName || defaults.storeName,
    logo: settings.logo ?? defaults.logo,
    favicon: settings.favicon ?? defaults.favicon,
    primaryColor: isValidHexColor(settings.primaryColor)
      ? settings.primaryColor!
      : defaults.primaryColor,
    accentColor: isValidHexColor(settings.accentColor)
      ? settings.accentColor!
      : defaults.accentColor,
    showAnnouncement: settings.showAnnouncement ?? defaults.showAnnouncement,
    announcementText: settings.announcementText ?? defaults.announcementText,
  };
}

/**
 * Check if a string is a valid hex color
 */
function isValidHexColor(color: string | undefined | null): boolean {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Merge user settings with theme defaults
 * User settings take priority, fall back to theme defaults
 */
export function mergeWithThemeDefaults(
  userSettings: Partial<MVPThemeSettings>,
  themeId: string
): MVPThemeSettings {
  const defaults = DEFAULT_MVP_SETTINGS[themeId] || DEFAULT_MVP_SETTINGS['starter-store'];

  return {
    ...defaults,
    ...userSettings,
    // Ensure colors are valid
    primaryColor: isValidHexColor(userSettings.primaryColor)
      ? userSettings.primaryColor!
      : defaults.primaryColor,
    accentColor: isValidHexColor(userSettings.accentColor)
      ? userSettings.accentColor!
      : defaults.accentColor,
  };
}

/**
 * Convert MVP settings to theme colors object
 * Matches the StoreTemplateTheme interface from store-registry.ts
 */
export function mvpSettingsToThemeColors(
  settings: MVPThemeSettings,
  baseThemeColors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    cardBg: string;
    headerBg: string;
    footerBg: string;
    footerText: string;
  }
) {
  return {
    ...baseThemeColors,
    primary: settings.primaryColor,
    accent: settings.accentColor,
  };
}

/**
 * Serialize settings for database storage
 */
export function serializeMVPSettings(settings: MVPSettingsWithTheme): string {
  return JSON.stringify({
    storeName: settings.storeName,
    logo: settings.logo,
    favicon: settings.favicon,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    themeId: settings.themeId,
    showAnnouncement: settings.showAnnouncement ?? false,
    announcementText: settings.announcementText ?? null,
  });
}

/**
 * Deserialize settings from database
 */
export function deserializeMVPSettings(json: string | null): MVPSettingsWithTheme | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return {
      storeName: parsed.storeName || '',
      logo: parsed.logo || null,
      favicon: parsed.favicon || null,
      primaryColor: parsed.primaryColor || '#4F46E5',
      accentColor: parsed.accentColor || '#F59E0B',
      themeId: parsed.themeId || 'starter-store',
      showAnnouncement: parsed.showAnnouncement ?? false,
      announcementText: parsed.announcementText || null,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// SETTING INPUT SCHEMA FOR ADMIN UI
// ============================================================================

/**
 * Form field definitions for admin settings page
 * Matches Shopify's settings_schema.json format
 * NOTE: No announcement banner section for MVP
 */
export const MVP_SETTINGS_FORM_FIELDS = [
  {
    type: 'header' as const,
    id: 'identity',
    label: 'Store Identity',
  },
  {
    type: 'text' as const,
    id: 'storeName',
    label: 'Store Name',
    placeholder: 'Enter your store name',
    maxLength: 100,
  },
  {
    type: 'image' as const,
    id: 'logo',
    label: 'Store Logo',
    info: 'Recommended size: 200x60px, transparent PNG',
  },
  {
    type: 'image' as const,
    id: 'favicon',
    label: 'Browser Favicon',
    info: 'Recommended size: 32x32px, ICO or PNG',
  },
  {
    type: 'header' as const,
    id: 'colors',
    label: 'Brand Colors',
  },
  {
    type: 'color' as const,
    id: 'primaryColor',
    label: 'Primary Color',
    info: 'Used for buttons, links, and headings',
  },
  {
    type: 'color' as const,
    id: 'accentColor',
    label: 'Accent Color',
    info: 'Used for badges, highlights, and special CTAs',
  },
];

// ============================================================================
// THEME LIST FOR MVP
// ============================================================================

/**
 * MVP Theme IDs - Only these themes are shown in the Theme Store UI
 * Based on research: 5 themes cover 90% of use cases
 */
export const MVP_THEME_IDS = [
  'starter-store',
  'luxe-boutique',
  'nova-lux',
] as const;

export type MVPThemeId = (typeof MVP_THEME_IDS)[number];

/**
 * Check if a theme ID is valid for MVP
 */
export function isValidMVPTheme(themeId: string): themeId is MVPThemeId {
  return MVP_THEME_IDS.includes(themeId as MVPThemeId);
}

// ============================================================================
// AVAILABLE THEMES FOR UI
// ============================================================================

/**
 * Theme metadata for the theme selector UI
 */
export const AVAILABLE_MVP_THEMES = [
  {
    id: 'starter-store',
    name: 'Starter Store',
    description: 'Clean, minimal design perfect for any business',
    previewColor: '#4F46E5',
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description: 'Vibrant marketplace style for grocery and essentials',
    previewColor: '#fc8934',
  },
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Elegant black and gold for luxury fashion',
    previewColor: '#1a1a1a',
  },
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    description: 'Modern charcoal with rose gold accents',
    previewColor: '#1C1C1E',
  },
  {
    id: 'nova-lux-ultra',
    name: 'Nova Lux Ultra',
    description: 'Ultra-premium luxury theme worth 10 million. Cinematic animations and 3D effects',
    previewColor: '#D4AF37',
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Sleek dark theme perfect for electronics',
    previewColor: '#0f172a',
  },
];
