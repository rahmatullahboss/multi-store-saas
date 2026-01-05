/**
 * Type definitions for Hybrid Mode configurations
 */

// Landing page configuration stored in landingConfig JSON field
export interface LandingConfig {
  templateId?: string; // Template ID (e.g., 'modern-dark', 'minimal-light', 'video-focus')
  headline: string;
  subheadline?: string;
  videoUrl?: string;
  ctaText: string;
  ctaSubtext?: string;
  testimonials?: {
    name: string;
    text: string;
    avatar?: string;
  }[];
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  urgencyText?: string; // e.g., "Only 5 left!" or "Sale ends in 2 hours"
  guaranteeText?: string;
  socialProof?: {
    count: number; // e.g., "500+ sold"
    text: string;
  };
}

// Theme configuration for full store mode
export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  customAccentColor?: string; // Override preset accent color
  bannerUrl?: string;
  bannerText?: string;
  collections?: {
    id: string;
    name: string;
    imageUrl?: string;
  }[];
  announcement?: {
    text: string;
    link?: string;
  };
  footerLinks?: {
    title: string;
    url: string;
  }[];
}

// Social media links configuration
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  twitter?: string;
}

// Footer customization configuration
export interface FooterConfig {
  description?: string;
  links?: {
    title: string;
    url: string;
  }[];
  showPoweredBy?: boolean;
}

// Helper to parse social links
export function parseSocialLinks(json: string | null): SocialLinks | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as SocialLinks;
  } catch {
    return null;
  }
}

// Helper to parse footer config
export function parseFooterConfig(json: string | null): FooterConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as FooterConfig;
  } catch {
    return null;
  }
}

// Helper to parse JSON config safely
export function parseLandingConfig(json: string | null): LandingConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as LandingConfig;
  } catch {
    return null;
  }
}

export function parseThemeConfig(json: string | null): ThemeConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ThemeConfig;
  } catch {
    return null;
  }
}

// Default landing config for new stores
export const defaultLandingConfig: LandingConfig = {
  headline: "Transform Your Life Today",
  subheadline: "The only solution you'll ever need",
  ctaText: "Buy Now",
  ctaSubtext: "30-day money back guarantee",
  urgencyText: "Limited time offer",
};

// Default theme config for new stores
export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#6366f1",
  accentColor: "#f59e0b",
};
