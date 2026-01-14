/**
 * Type definitions for Hybrid Mode configurations
 */

// Typography settings for editors
export interface TypographySettings {
  headingSize?: 'small' | 'medium' | 'large';  // H1: 24/32/40px
  bodySize?: 'small' | 'medium' | 'large';     // 14/16/18px
  lineHeight?: 'compact' | 'normal' | 'relaxed'; // 1.4/1.6/1.8
  letterSpacing?: 'tight' | 'normal' | 'wide';   // -0.02/0/0.02em
}

// Typography CSS values mapping
export const TYPOGRAPHY_VALUES = {
  headingSize: {
    small: { fontSize: '1.5rem', lineHeight: '1.3' },   // 24px
    medium: { fontSize: '2rem', lineHeight: '1.25' },   // 32px
    large: { fontSize: '2.5rem', lineHeight: '1.2' },   // 40px
  },
  bodySize: {
    small: '0.875rem',  // 14px
    medium: '1rem',     // 16px
    large: '1.125rem',  // 18px
  },
  lineHeight: {
    compact: '1.4',
    normal: '1.6',
    relaxed: '1.8',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

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
  accentColor?: string;  // Secondary accent color
  // Extended Colors (Phase 1)
  backgroundColor?: string; // Page background
  textColor?: string;       // Main text color
  borderColor?: string;     // Border/divider color
  // Typography Settings (Phase 1)
  typography?: TypographySettings;
  // Order Form Layout Variant
  orderFormVariant?: 'full-width' | 'compact'; // Default: 'full-width'
  // Custom CSS for advanced styling
  customCSS?: string;
  // Custom code injection (for FB Pixel, Google Analytics, etc.)
  customHeadCode?: string; // Injected in <head>
  customBodyCode?: string; // Injected before </body>
  // Font Family
  fontFamily?: string;
  // Landing Page Language (for visitor default view)
  landingLanguage?: 'bn' | 'en';
  // Custom HTML Sections (positionable)
  customSections?: CustomSection[];
}

// Custom HTML Section with position support
export type CustomSectionPosition = 
  | 'before-hero' 
  | 'after-hero' 
  | 'before-features' 
  | 'after-features' 
  | 'before-testimonials' 
  | 'after-testimonials' 
  | 'before-form' 
  | 'after-form' 
  | 'before-footer';

export interface CustomSection {
  id: string;
  name: string;
  html: string;
  css?: string;
  position: CustomSectionPosition;
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
  // Extended Colors (Phase 1)
  backgroundColor?: string; // Page background
  textColor?: string;       // Main text color
  borderColor?: string;     // Border/divider color
  // Typography Settings (Phase 1)
  typography?: TypographySettings;
  fontFamily?: string; // Global font family
  storeTemplateId?: string; // Selected store template ID
  checkoutStyle?: 'standard' | 'minimal' | 'one_page'; // Checkout Layout Style
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
  // Footer customization
  footerColumns?: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>;
  footerDescription?: string;
  copyrightText?: string;
  // Floating Contact Buttons
  floatingWhatsappEnabled?: boolean;
  floatingWhatsappNumber?: string;
  floatingWhatsappMessage?: string;
  floatingCallEnabled?: boolean;
  floatingCallNumber?: string;
  // Visual Editor Sections
  sections?: any[]; // StoreSections structure for Home Page
  productSections?: any[];
  collectionSections?: any[];
  cartSections?: any[]; // StoreSections structure for Product Details Page
  // Marketing & Sales
  flashSale?: {
    isActive: boolean;
    text?: string;
    endTime?: string;
    backgroundColor?: string;
    textColor?: string;
    discountPercentage?: number;
    discountType?: 'percent' | 'fixed';
  };
  trustBadges?: {
    showPaymentIcons: boolean;
    showGuaranteeSeals: boolean;
    customText?: string;
  };
  marketingPopup?: {
    isActive: boolean;
    title?: string;
    description?: string;
    delay?: number;
    offerCode?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
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
// Default theme config for new stores (Rich Preset)
export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#4f46e5", // Indigo-600 (More professional than 500)
  accentColor: "#f59e0b",  // Amber-500
  backgroundColor: "#ffffff",
  textColor: "#1f2937",    // Gray-800
  borderColor: "#e5e7eb",  // Gray-200
  fontFamily: 'inter',
  typography: {
    headingSize: 'medium',
    bodySize: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'normal'
  },
  checkoutStyle: 'standard',
  headerLayout: 'centered', // Modern default
  headerShowSearch: true,
  headerShowCart: true,
  bannerText: "Free delivery inside Dhaka on orders over 2000 BDT! 🚚",
  
  // Day 1 Ready Content:
  sections: [
    {
      id: 'default-hero',
      type: 'hero',
      settings: {
        title: 'Premium Quality, Delivered.',
        subtitle: 'Experience the best shopping experience with our curated collection of authentic products.',
        buttonText: 'Shop All Products',
        buttonLink: '/products',
        align: 'center',
        overlayOpacity: 50,
        height: 'large',
        image: '' // Fallback to gray placeholder in component if empty
      }
    },
    {
        id: 'default-features',
        type: 'features',
        settings: {
            title: 'Why Shop With Us?',
            columns: 3,
            features: [
                { icon: 'ShieldCheck', title: '100% Authentic', description: 'Original products guaranteed.' },
                { icon: 'Truck', title: 'Fast Delivery', description: '24H delivery inside Dhaka.' },
                { icon: 'Headphones', title: 'Support 24/7', description: 'Always here to help you.' }
            ]
        }
    },
    {
      id: 'default-products',
      type: 'product-grid',
      settings: {
        title: 'New Arrivals',
        collectionId: 'all',
        limit: 8,
        columns: 4,
        showViewAll: true
      }
    }
  ],
  footerDescription: "Your trusted destination for quality products. We prioritize customer satisfaction above all else.",
  footerColumns: [
    {
      title: "Shop",
      links: [
        { label: "All Products", url: "/products" },
        { label: "New Arrivals", url: "/products?sort=newest" },
        { label: "Top Sellers", url: "/products?sort=best_selling" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", url: "/pages/about" },
        { label: "Contact", url: "/pages/contact" },
        { label: "Terms", url: "/pages/terms" }
      ]
    }
  ],
  copyrightText: "© 2024. All Rights Reserved."
};
