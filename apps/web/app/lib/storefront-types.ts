/**
 * Storefront Types — Headless Data Contract
 * 
 * These types define the canonical data shape that the server (loader)
 * sends to all storefront templates. Every template component receives
 * a `StorefrontData` object — no template ever accesses the database directly.
 * 
 * Architecture:
 *   D1 Database → Unified Settings API → buildStorefrontData() → JSON → Template Component
 * 
 * @see storefront-data.server.ts for the builder function
 * @see templates/types.ts for StoreTemplateProps (template-side interface)
 */

// ============================================================================
// Product & Variant
// ============================================================================
export interface StorefrontProduct {
  id: number;
  title: string;
  slug: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string[];
  description: string | null;
  category: string | null;
  stock: number | null;
  isActive: boolean;
  avgRating: number | null;
  reviewCount: number | null;
}

// ============================================================================
// Category
// ============================================================================
export interface StorefrontCategory {
  title: string;
  slug: string;
  imageUrl?: string;
}

// ============================================================================
// Theme
// ============================================================================
export interface StorefrontTheme {
  primary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  cardBg: string;
  cardBorder?: string;
  headerBg: string;
  footerBg: string;
  footerText: string;
  secondary?: string;
  isDark?: boolean;
}

// ============================================================================
// Social Links
// ============================================================================
export interface StorefrontSocialLinks {
  facebook?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
}

// ============================================================================
// Business Info
// ============================================================================
export interface StorefrontBusinessInfo {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

// ============================================================================
// Hero Banner
// ============================================================================
export interface StorefrontHeroBanner {
  imageUrl?: string | null;
  heading?: string | null;
  subheading?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  overlayOpacity?: number | null;
  slides?: Array<{
    imageUrl?: string | null;
    heading?: string | null;
    subheading?: string | null;
    ctaText?: string | null;
    ctaLink?: string | null;
  }>;
}

// ============================================================================
// Announcement Bar
// ============================================================================
export interface StorefrontAnnouncement {
  text?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  enabled?: boolean;
}

// ============================================================================
// Footer Config
// ============================================================================
export interface StorefrontFooterConfig {
  showPoweredBy?: boolean;
  copyrightText?: string | null;
  showSocialIcons?: boolean;
  showBusinessInfo?: boolean;
  columns?: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>;
}

// ============================================================================
// Trust Badges
// ============================================================================
export interface StorefrontTrustBadges {
  showPaymentIcons?: boolean;
  showGuaranteeSeals?: boolean;
}

// ============================================================================
// StorefrontData — The canonical data contract
// ============================================================================
export interface StorefrontData {
  // Store identity
  storeId: number;
  storeName: string;
  logo: string | null;
  favicon: string | null;
  fontFamily: string;
  currency: string;
  planType: string;

  // Theme
  templateId: string;
  theme: StorefrontTheme;

  // Content
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  currentCategory: string | null;

  // Settings
  socialLinks: StorefrontSocialLinks;
  businessInfo: StorefrontBusinessInfo;
  footerConfig: StorefrontFooterConfig | null;
  heroBanner: StorefrontHeroBanner | null;
  announcement: StorefrontAnnouncement | null;
  trustBadges: StorefrontTrustBadges | null;

  // AI Features
  aiCredits: number;
  isCustomerAiEnabled: boolean;

  // Floating Buttons
  floatingWhatsapp?: {
    enabled: boolean;
    number?: string | null;
    message?: string | null;
  };
  floatingCall?: {
    enabled: boolean;
    number?: string | null;
  };
}
