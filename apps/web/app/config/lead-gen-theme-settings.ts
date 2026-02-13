/**
 * Lead Gen Theme Settings Configuration
 *
 * Following the EXACT same pattern as MVP Theme Settings (mvp-theme-settings.ts)
 * for e-commerce stores, but tailored for lead generation websites.
 *
 * Simple key-value approach with only essential customizable settings.
 * Merchants can customize: name, logo, colors, heading, CTA text.
 *
 * Benefits:
 * - Simple & fast (single DB query)
 * - Consistent across all lead gen pages
 * - Easy to add more themes later
 *
 * @see apps/web/app/config/mvp-theme-settings.ts - E-commerce equivalent
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Lead Gen Theme Settings - Simplified for MVP
 * Matches MVPThemeSettings pattern but for lead generation
 */
export interface LeadGenThemeSettings {
  // Identity
  storeName: string; // Business name (e.g., "ABC Legal Services")
  logo: string | null; // Logo URL from R2
  favicon: string | null; // Browser favicon

  // Colors (Only 2 for simplicity)
  primaryColor: string; // Brand color (buttons, links, headers)
  accentColor: string; // Highlights, CTAs, badges

  // Content Customization
  heroHeading: string; // Main hero heading
  heroDescription: string; // Hero subtext
  ctaButtonText: string; // Primary CTA button text

  // Optional Features
  showAnnouncement: boolean; // Top banner toggle
  announcementText: string | null; // Banner text
  showTestimonials: boolean; // Testimonials section toggle
  showServices: boolean; // Services section toggle

  // Contact Information
  phone: string | null; // Business phone
  email: string | null; // Business email
  address: string | null; // Business address
}

/**
 * Lead Gen Settings with Theme ID
 * Includes the selected theme identifier
 */
export interface LeadGenSettingsWithTheme extends LeadGenThemeSettings {
  themeId: string; // 'professional-services', 'consulting-firm', 'law-firm'
}

// ============================================================================
// DEFAULT SETTINGS PER THEME
// ============================================================================

export const DEFAULT_LEAD_GEN_SETTINGS: Record<string, LeadGenThemeSettings> = {
  'professional-services': {
    storeName: 'Professional Services',
    logo: null,
    favicon: null,
    primaryColor: '#2563EB', // Professional blue
    accentColor: '#F59E0B', // Amber accent
    heroHeading: 'Grow Your Business with Expert Consulting',
    heroDescription: 'We help businesses scale with proven strategies and personalized solutions',
    ctaButtonText: 'Get Free Consultation',
    showAnnouncement: false,
    announcementText: null,
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },

  'consulting-firm': {
    storeName: 'Consulting Firm',
    logo: null,
    favicon: null,
    primaryColor: '#1E40AF', // Deep blue
    accentColor: '#10B981', // Green accent
    heroHeading: 'Strategic Consulting for Business Growth',
    heroDescription: 'Transform your business with data-driven strategies',
    ctaButtonText: 'Schedule Consultation',
    showAnnouncement: false,
    announcementText: null,
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },

  'law-firm': {
    storeName: 'Law Firm',
    logo: null,
    favicon: null,
    primaryColor: '#1F2937', // Dark gray
    accentColor: '#C9A961', // Gold accent
    heroHeading: 'Expert Legal Services You Can Trust',
    heroDescription: 'Protecting your rights with experienced legal representation',
    ctaButtonText: 'Free Case Review',
    showAnnouncement: true,
    announcementText: 'Free consultation for new clients - Limited time offer',
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },

  'healthcare': {
    storeName: 'Healthcare Services',
    logo: null,
    favicon: null,
    primaryColor: '#059669', // Medical green
    accentColor: '#0EA5E9', // Sky blue
    heroHeading: 'Quality Healthcare Services',
    heroDescription: 'Compassionate care when you need it most',
    ctaButtonText: 'Book Appointment',
    showAnnouncement: false,
    announcementText: null,
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },

  'agency': {
    storeName: 'Digital Agency',
    logo: null,
    favicon: null,
    primaryColor: '#7C3AED', // Purple
    accentColor: '#EC4899', // Pink accent
    heroHeading: 'Digital Marketing That Drives Results',
    heroDescription: 'Grow your brand with proven digital strategies',
    ctaButtonText: 'Get Started',
    showAnnouncement: false,
    announcementText: null,
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },

  'study-abroad': {
    storeName: 'Expert Education',
    logo: null,
    favicon: null,
    primaryColor: '#ED1C24', // Expert Education Red
    accentColor: '#002C5F', // Navy Blue
    heroHeading: 'Rely on Experts for Your Study Abroad Journey',
    heroDescription: 'We help you discover your perfect study destination and guide you through every step from university selection to visa approval.',
    ctaButtonText: 'Get Free Consultation',
    showAnnouncement: true,
    announcementText: 'Turn your global study dream into Reality',
    showTestimonials: true,
    showServices: true,
    phone: null,
    email: null,
    address: null,
  },
};

// ============================================================================
// HELPER FUNCTIONS (Matching MVP pattern)
// ============================================================================

/**
 * Validate lead gen settings
 * Ensures all required fields are present and valid
 */
export function validateLeadGenSettings(
  settings: Partial<LeadGenThemeSettings>,
  themeId: string = 'professional-services'
): LeadGenThemeSettings {
  const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  return {
    storeName: settings.storeName || defaults.storeName,
    logo: settings.logo || defaults.logo,
    favicon: settings.favicon || defaults.favicon,
    primaryColor: settings.primaryColor || defaults.primaryColor,
    accentColor: settings.accentColor || defaults.accentColor,
    heroHeading: settings.heroHeading || defaults.heroHeading,
    heroDescription: settings.heroDescription || defaults.heroDescription,
    ctaButtonText: settings.ctaButtonText || defaults.ctaButtonText,
    showAnnouncement: settings.showAnnouncement ?? defaults.showAnnouncement,
    announcementText: settings.announcementText || defaults.announcementText,
    showTestimonials: settings.showTestimonials ?? defaults.showTestimonials,
    showServices: settings.showServices ?? defaults.showServices,
    phone: settings.phone || defaults.phone,
    email: settings.email || defaults.email,
    address: settings.address || defaults.address,
  };
}

/**
 * Merge user settings with theme defaults
 * User settings override theme defaults
 */
export function mergeLeadGenSettings(
  userSettings: Partial<LeadGenThemeSettings>,
  themeId: string
): LeadGenThemeSettings {
  const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  return {
    ...defaults,
    ...userSettings,
  };
}

/**
 * Convert lead gen settings to theme colors object
 * Used by renderer components
 */
export function leadGenSettingsToThemeColors(
  settings: LeadGenThemeSettings,
  baseTheme: Record<string, string> = {}
): Record<string, string> {
  return {
    ...baseTheme,
    primary: settings.primaryColor,
    accent: settings.accentColor,
  };
}

/**
 * Serialize settings for database storage
 * Converts to JSON string
 */
export function serializeLeadGenSettings(settings: LeadGenSettingsWithTheme): string {
  return JSON.stringify(settings);
}

/**
 * Deserialize settings from database
 * Parses JSON string and validates
 */
export function deserializeLeadGenSettings(
  json: string,
  themeId: string = 'professional-services'
): LeadGenSettingsWithTheme {
  try {
    const parsed = JSON.parse(json) as Partial<LeadGenSettingsWithTheme>;
    const validated = validateLeadGenSettings(parsed, themeId);

    return {
      ...validated,
      themeId: parsed.themeId || themeId,
    };
  } catch (error) {
    console.error('Failed to parse lead gen settings:', error);
    const defaults = DEFAULT_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];
    return {
      ...defaults,
      themeId,
    };
  }
}

/**
 * Get available lead gen themes
 * Returns list of themes for selection UI
 */
export function getAvailableLeadGenThemes() {
  return [
    {
      id: 'professional-services',
      name: 'Professional Services',
      nameBn: 'প্রফেশনাল সার্ভিস',
      description: 'Clean, professional design for service businesses',
      descriptionBn: 'সার্ভিস ব্যবসার জন্য পরিষ্কার, পেশাদার ডিজাইন',
      preview: '/themes/professional-services/preview.png',
      category: 'business',
    },
    {
      id: 'consulting-firm',
      name: 'Consulting Firm',
      nameBn: 'কনসালটিং ফার্ম',
      description: 'Strategic layout for consulting businesses',
      descriptionBn: 'কনসালটিং ব্যবসার জন্য কৌশলগত লেআউট',
      preview: '/themes/consulting-firm/preview.png',
      category: 'business',
    },
    {
      id: 'law-firm',
      name: 'Law Firm',
      nameBn: 'আইন ফার্ম',
      description: 'Professional theme for legal services',
      descriptionBn: 'আইনি সেবার জন্য পেশাদার থিম',
      preview: '/themes/law-firm/preview.png',
      category: 'legal',
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      nameBn: 'হেলথকেয়ার',
      description: 'Clean design for medical practices',
      descriptionBn: 'চিকিৎসা সেবার জন্য পরিষ্কার ডিজাইন',
      preview: '/themes/healthcare/preview.png',
      category: 'medical',
    },
    {
      id: 'agency',
      name: 'Digital Agency',
      nameBn: 'ডিজিটাল এজেন্সি',
      description: 'Modern design for creative agencies',
      descriptionBn: 'ক্রিয়েটিভ এজেন্সির জন্য আধুনিক ডিজাইন',
      preview: '/themes/agency/preview.png',
      category: 'creative',
    },
    {
      id: 'study-abroad',
      name: 'Expert Education',
      nameBn: 'এক্সপার্ট এডুকেশন',
      description: 'Education consultancy theme with country guides',
      descriptionBn: 'দেশভিত্তিক গাইড সহ শিক্ষা পরামর্শ থিম',
      preview: '/themes/study-abroad/preview.png', // Placeholder
      category: 'education',
    },
  ];
}
