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
    text?: string; // Optional - can show just photo
    avatar?: string;
    imageUrl?: string; // Customer photo/screenshot
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
  // === NEW: Landing Page Builder Fields ===
  faq?: {
    question: string;
    answer: string;
  }[];
  sectionOrder?: string[]; // e.g., ['hero', 'features', 'video', 'testimonials', 'faq', 'cta']
  hiddenSections?: string[]; // Sections to hide
  // WhatsApp Integration
  whatsappEnabled?: boolean;
  whatsappNumber?: string; // e.g., '8801712345678'
  whatsappMessage?: string; // Pre-filled message template
  // Call Button
  callEnabled?: boolean;
  callNumber?: string; // e.g., '01712345678'
  // Countdown Timer
  countdownEnabled?: boolean;
  countdownEndTime?: string; // ISO date string
  countdownText?: string; // e.g., "অফার শেষ হতে বাকি"
  // Stock Counter Display
  showStockCounter?: boolean;
  lowStockThreshold?: number; // Show warning below this number
  // Social Proof Popup
  showSocialProof?: boolean;
  socialProofInterval?: number; // Seconds between popups
  // Product Gallery
  productImages?: string[];
  // Photo Gallery Section (multiple images)
  galleryImages?: string[];
  // Benefits / Why Buy Us Section
  benefits?: {
    icon: string;
    title: string;
    description: string;
  }[];
  // Before/After Comparison Section
  comparison?: {
    beforeImage?: string;
    afterImage?: string;
    beforeLabel?: string;
    afterLabel?: string;
    description?: string;
  };
  // Color Theme Customization
  primaryColor?: string; // Main brand color (buttons, accents)
  accentColor?: string;  // Secondary accent color // Additional product images
  // Order Form Layout Variant
  orderFormVariant?: 'full-width' | 'compact'; // Default: 'full-width'
}

// Store template configuration for full store mode
export interface StoreTemplateConfig {
  templateId: string; // 'luxe-boutique' | 'tech-modern' | 'artisan-market'
  settings?: {
    headerStyle?: 'minimal' | 'full' | 'centered';
    productGridColumns?: 2 | 3 | 4;
    showQuickView?: boolean;
    showWishlist?: boolean;
  };
}

// Theme configuration for full store mode
export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  customAccentColor?: string; // Override preset accent color
  storeTemplateId?: string; // Selected store template ID
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
  // Advanced customization
  customCSS?: string; // Custom CSS injected into store
  headerLayout?: 'centered' | 'left-logo' | 'minimal';
  headerShowSearch?: boolean;
  headerShowCart?: boolean;
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

export interface ManualPaymentConfig {
  bkashPersonal?: string;
  bkashMerchant?: string;
  nagadPersonal?: string;
  nagadMerchant?: string;
  rocketPersonal?: string;
  rocketMerchant?: string;
  instructions?: string; // Markdown supported
}

export function parseThemeConfig(json: string | null): ThemeConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ThemeConfig;
  } catch {
    return null;
  }
}

export function parseManualPaymentConfig(json: string | null): ManualPaymentConfig | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ManualPaymentConfig;
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
