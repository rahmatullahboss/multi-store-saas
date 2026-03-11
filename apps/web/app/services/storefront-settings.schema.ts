/**
 * Unified Storefront Settings Schema (Canonical Type)
 *
 * This is the single source of truth for all storefront settings.
 * Replaces fragmented historical settings and normalizes all storefront config
 * into one canonical JSON document.
 *
 * Version: 1
 */

import { z } from 'zod';
import { generateUUID } from '~/lib/uuid';

// ============================================================================
// THEME SETTINGS
// ============================================================================

const ThemeSettingsSchema = z.object({
  templateId: z.string().default('starter-store'),
  primary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#4F46E5'),
  accent: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#F59E0B'),
  background: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#ffffff'),
  text: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#1f2937'),
  muted: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#6b7280'),
  cardBg: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#ffffff'),
  headerBg: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#ffffff'),
  footerBg: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#1f2937'),
  footerText: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#ffffff'),
});

export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;

// ============================================================================
// BRANDING SETTINGS
// ============================================================================

const BrandingSettingsSchema = z.object({
  storeName: z.string().default('My Store'),
  logo: z.string().url().nullable().default(null),
  favicon: z.string().url().nullable().default(null),
  tagline: z.string().max(200).nullable().default(null),
  description: z.string().max(500).nullable().default(null),
  fontFamily: z.string().default('inter'),
});

export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;

// ============================================================================
// DOMAIN SETTINGS
// ============================================================================

const DomainSettingsSchema = z.object({
  subdomain: z.string(),
  customDomain: z.string().nullable().default(null),
});

export type DomainSettings = z.infer<typeof DomainSettingsSchema>;

// ============================================================================
// TRACKING SETTINGS
// ============================================================================

const TrackingSettingsSchema = z.object({
  facebookPixelId: z.string().nullable().default(null),
  googleAnalyticsId: z.string().nullable().default(null),
  googleTagManagerId: z.string().nullable().default(null),
  facebookAccessToken: z.string().nullable().default(null),
});

export type TrackingSettings = z.infer<typeof TrackingSettingsSchema>;

// ============================================================================
// BUSINESS SETTINGS
// ============================================================================

const BusinessSettingsSchema = z.object({
  phone: z.string().nullable().default(null),
  email: z.string().email().nullable().default(null),
  address: z.string().nullable().default(null),
});

export type BusinessSettings = z.infer<typeof BusinessSettingsSchema>;

// ============================================================================
// SOCIAL SETTINGS
// ============================================================================

const SocialSettingsSchema = z.object({
  facebook: z.string().url().nullable().default(null),
  instagram: z.string().nullable().default(null),
  whatsapp: z.string().nullable().default(null),
  twitter: z.string().nullable().default(null),
  youtube: z.string().url().nullable().default(null),
  linkedin: z.string().url().nullable().default(null),
});

export type SocialSettings = z.infer<typeof SocialSettingsSchema>;

// ============================================================================
// ANNOUNCEMENT SETTINGS
// ============================================================================

const AnnouncementSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().max(500).nullable().default(null),
  link: z.string().url().nullable().default(null),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#4F46E5'),
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default('#ffffff'),
});

export type AnnouncementSettings = z.infer<typeof AnnouncementSettingsSchema>;

// ============================================================================
// SEO SETTINGS
// ============================================================================

const SeoSettingsSchema = z.object({
  title: z.string().max(70).nullable().default(null),
  description: z.string().max(160).nullable().default(null),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().url().nullable().default(null),
});

export type SeoSettings = z.infer<typeof SeoSettingsSchema>;

// ============================================================================
// CHECKOUT SETTINGS (Storefront subset)
// ============================================================================

const CheckoutSettingsSchema = z.object({
  shippingSummaryText: z.string().nullable().default(null),
  showStockWarning: z.boolean().default(true),
  enableGuestCheckout: z.boolean().default(true),
});

export type CheckoutSettings = z.infer<typeof CheckoutSettingsSchema>;

// ============================================================================
// HERO BANNER SETTINGS
// ============================================================================

const HeroBannerSlideSchema = z.object({
  imageUrl: z.string().nullable().default(null),
  heading: z.string().max(200).nullable().default(null),
  subheading: z.string().max(300).nullable().default(null),
  ctaText: z.string().max(50).nullable().default(null),
  ctaLink: z.string().nullable().default(null),
});

export type HeroBannerSlide = z.infer<typeof HeroBannerSlideSchema>;

const HeroBannerSettingsSchema = z.object({
  mode: z.enum(['single', 'carousel']).default('single'),
  overlayOpacity: z.number().min(0).max(100).default(40),
  autoPlayInterval: z.number().optional().default(5000),
  showAppWidget: z.boolean().optional().default(true),
  slides: z
    .array(HeroBannerSlideSchema)
    .max(6)
    .default([
      {
        imageUrl:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600',
        heading: 'Welcome to Our Store',
        subheading: 'Discover amazing products at great prices',
        ctaText: 'Shop Now',
        ctaLink: '/products',
      },
    ]),
  fallbackHeadline: z.string().max(200).nullable().default(null),
});

export type HeroBannerSettings = z.infer<typeof HeroBannerSettingsSchema>;

// ============================================================================
// TRUST BADGES SETTINGS
// ============================================================================

const TrustBadgeSchema = z.object({
  icon: z.enum(['truck', 'shield', 'refresh']).default('truck'),
  title: z.string().max(100).default(''),
  description: z.string().max(200).default(''),
});

export type TrustBadge = z.infer<typeof TrustBadgeSchema>;

const TrustBadgesSettingsSchema = z.object({
  badges: z
    .array(TrustBadgeSchema)
    .max(3)
    .default([
      { icon: 'truck', title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
      { icon: 'shield', title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
      { icon: 'refresh', title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
    ]),
});

export type TrustBadgesSettings = z.infer<typeof TrustBadgesSettingsSchema>;

// ============================================================================
// LAYOUT SCHEMA (V1 JSON Template System)
// ============================================================================

export const SectionVariantSchema = z.enum([
  'default',
  'minimal',
  'bold',
  'marketplace',
  'luxury'
]).default('default');

export const HeroSectionSchema = z.object({
  id: z.string().default(() => generateUUID()),
  type: z.literal('unified-hero'),
  variant: SectionVariantSchema,
  props: HeroBannerSettingsSchema,
});

export const ProductGridSchema = z.object({
  id: z.string().default(() => generateUUID()),
  type: z.literal('unified-product-grid'),
  variant: SectionVariantSchema,
  props: z.object({
    title: z.string().optional(),
    category: z.string().nullable().optional(),
    limit: z.number().default(8)
  })
});

export const HeaderSectionSchema = z.object({
  id: z.string().default(() => generateUUID()),
  type: z.literal('unified-header'),
  variant: SectionVariantSchema,
  props: z.object({}).catchall(z.any()).optional()
});

export const FooterSectionSchema = z.object({
  id: z.string().default(() => generateUUID()),
  type: z.literal('unified-footer'),
  variant: SectionVariantSchema,
  props: z.object({}).catchall(z.any()).optional()
});

export const LayoutSettingsSchema = z.object({
  home: z.array(z.union([HeroSectionSchema, ProductGridSchema, HeaderSectionSchema, FooterSectionSchema])).default([]),
});

export type LayoutSettings = z.infer<typeof LayoutSettingsSchema>;

// ============================================================================
// TYPOGRAPHY SETTINGS
// ============================================================================

const TypographySettingsSchema = z.object({
  fontFamily: z.string().default('inter'),
});

export type TypographySettings = z.infer<typeof TypographySettingsSchema>;

// ============================================================================
// FLAGS
// ============================================================================

const SettingsFlagsSchema = z.object({
  sourceLocked: z.boolean().default(false),
  legacyFallbackUsed: z.boolean().default(false),
  migrationCompleted: z.boolean().default(false),
});

export type SettingsFlags = z.infer<typeof SettingsFlagsSchema>;

// ============================================================================
// SHIPPING CONFIG SETTINGS
// ============================================================================

export const ShippingConfigSchema = z.object({
  deliveryCharge: z.number().default(60),
  freeDeliveryAbove: z.number().nullable().default(null),
  insideDhaka: z.number().default(60),
  outsideDhaka: z.number().default(120),
  freeShippingAbove: z.number().default(0),
  enabled: z.boolean().default(true),
});

export type ShippingConfig = z.infer<typeof ShippingConfigSchema>;

// ============================================================================
// FLOATING CONTACT SETTINGS
// ============================================================================

const FloatingSettingsSchema = z.object({
  whatsappEnabled: z.boolean().default(false),
  whatsappNumber: z.string().nullable().default(null),
  whatsappMessage: z.string().nullable().default(null),
  callEnabled: z.boolean().default(false),
  callNumber: z.string().nullable().default(null),
});

export type FloatingSettings = z.infer<typeof FloatingSettingsSchema>;

// ============================================================================
// COURIER SETTINGS
// ============================================================================

const CourierProviderSettingsSchema = z.object({
  clientId: z.string().nullable().default(null),
  clientSecret: z.string().nullable().default(null),
  username: z.string().nullable().default(null),
  password: z.string().nullable().default(null),
  baseUrl: z.string().nullable().default(null),
  defaultStoreId: z.number().nullable().default(null),
});

const CourierSettingsSchema = z.object({
  provider: z.enum(['pathao', 'redx', 'steadfast']).nullable().default(null),
  pathao: CourierProviderSettingsSchema.nullable().default(null),
  redx: z
    .object({
      apiKey: z.string().nullable().default(null),
      baseUrl: z.string().nullable().default(null),
    })
    .nullable()
    .default(null),
  steadfast: z
    .object({
      apiKey: z.string().nullable().default(null),
      secretKey: z.string().nullable().default(null),
      steadfastEmail: z.string().nullable().default(null),
      steadfastPassword: z.string().nullable().default(null),
    })
    .nullable()
    .default(null),
});

export type CourierSettings = z.infer<typeof CourierSettingsSchema>;

const CourierSettingsPatchSchema = CourierSettingsSchema.partial();

// ============================================================================
// NAVIGATION SETTINGS
// ============================================================================

const NavigationSettingsSchema = z.object({
  headerMenu: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
        children: z.array(z.any()).default([]),
      })
    )
    .default([]),
  footerColumns: z
    .array(
      z.object({
        title: z.string(),
        links: z.array(z.object({ label: z.string(), url: z.string() })),
      })
    )
    .default([]),
  footerDescription: z.string().nullable().default(null),
});

export type NavigationSettings = z.infer<typeof NavigationSettingsSchema>;

const WhyChooseUsSchema = z.array(
  z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })
).default([
  { icon: '✨', title: 'প্রিমিয়াম কোয়ালিটি', description: 'উন্নত মানের নিশ্চয়তা' },
  { icon: '⚡', title: 'দ্রুত ডেলিভারি', description: 'দ্রুত ও নিরাপদ ডেলিভারি' },
  { icon: '💬', title: '২৪/৭ সাপোর্ট', description: 'আমরা ২৪ ঘণ্টা আপনার সেবায় নিয়োজিত' },
]);

export type WhyChooseUsSettings = z.infer<typeof WhyChooseUsSchema>;

// ============================================================================
// UNIFIED STOREFRONT SETTINGS V1
// ============================================================================

export const UnifiedStorefrontSettingsV1Schema = z.object({
  version: z.literal(1),
  theme: ThemeSettingsSchema.default({
    templateId: 'starter-store',
    primary: '#4F46E5',
    accent: '#F59E0B',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1f2937',
    footerText: '#ffffff',
  }),
  branding: BrandingSettingsSchema.default({
    storeName: 'My Store',
    logo: null,
    favicon: null,
    tagline: null,
    description: null,
  }),
  business: BusinessSettingsSchema.default({
    phone: null,
    email: null,
    address: null,
  }),
  domain: DomainSettingsSchema.optional(),
  tracking: TrackingSettingsSchema.default({
    facebookPixelId: null,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    facebookAccessToken: null,
  }),
  social: SocialSettingsSchema.default({
    facebook: null,
    instagram: null,
    whatsapp: null,
    twitter: null,
    youtube: null,
    linkedin: null,
  }),
  announcement: AnnouncementSettingsSchema.default({
    enabled: false,
    text: null,
    link: null,
    backgroundColor: '#4F46E5',
    textColor: '#ffffff',
  }),
  seo: SeoSettingsSchema.default({
    title: null,
    description: null,
    keywords: [],
    ogImage: null,
  }),
  checkout: CheckoutSettingsSchema.default({
    shippingSummaryText: null,
    showStockWarning: true,
    enableGuestCheckout: true,
  }),
  shippingConfig: ShippingConfigSchema.default({
    deliveryCharge: 60,
    freeDeliveryAbove: null,
    insideDhaka: 60,
    outsideDhaka: 120,
    freeShippingAbove: 0,
    enabled: true,
  }),
  floating: FloatingSettingsSchema.default({
    whatsappEnabled: false,
    whatsappNumber: null,
    whatsappMessage: null,
    callEnabled: false,
    callNumber: null,
  }),
  courier: CourierSettingsSchema.default({
    provider: null,
    pathao: null,
    redx: null,
    steadfast: null,
  }),
  navigation: NavigationSettingsSchema.default({
    headerMenu: [],
    footerColumns: [],
    footerDescription: null,
  }),
  heroBanner: HeroBannerSettingsSchema.default({
    mode: 'single',
    overlayOpacity: 40,
    autoPlayInterval: 5000,
    showAppWidget: true,
    slides: [],
    fallbackHeadline: null,
  }),
  trustBadges: TrustBadgesSettingsSchema.default({
    badges: [
      { icon: 'truck', title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
      { icon: 'shield', title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
      { icon: 'refresh', title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
    ],
  }),
  whyChooseUs: WhyChooseUsSchema,
  typography: TypographySettingsSchema.default({
    fontFamily: 'inter',
  }),
  flags: SettingsFlagsSchema.default({
    sourceLocked: false,
    legacyFallbackUsed: false,
    migrationCompleted: false,
  }),
  layout: LayoutSettingsSchema.default({
    home: []
  }),
  updatedAt: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
});

export type UnifiedStorefrontSettingsV1 = z.infer<typeof UnifiedStorefrontSettingsV1Schema>;

// ============================================================================
// PARTIAL UPDATE SCHEMAS
// ============================================================================

export const ThemeSettingsPatchSchema = ThemeSettingsSchema.partial();
export const BrandingSettingsPatchSchema = BrandingSettingsSchema.partial();
export const BusinessSettingsPatchSchema = BusinessSettingsSchema.partial();
export const SocialSettingsPatchSchema = SocialSettingsSchema.partial();
export const AnnouncementSettingsPatchSchema = AnnouncementSettingsSchema.partial();
export const SeoSettingsPatchSchema = SeoSettingsSchema.partial();
export const CheckoutSettingsPatchSchema = CheckoutSettingsSchema.partial();
export const HeroBannerSettingsPatchSchema = HeroBannerSettingsSchema.partial();
export const TrustBadgesSettingsPatchSchema = TrustBadgesSettingsSchema.partial();
export const TypographySettingsPatchSchema = TypographySettingsSchema.partial();

export const ShippingConfigPatchSchema = ShippingConfigSchema.partial();

const FloatingSettingsPatchSchema = FloatingSettingsSchema.partial();

const NavigationSettingsPatchSchema = NavigationSettingsSchema.partial();
export const LayoutSettingsPatchSchema = LayoutSettingsSchema.partial();

export const UnifiedStorefrontSettingsPatchSchema = z.object({
  theme: ThemeSettingsPatchSchema.optional(),
  branding: BrandingSettingsPatchSchema.optional(),
  business: BusinessSettingsPatchSchema.optional(),
  social: SocialSettingsPatchSchema.optional(),
  announcement: AnnouncementSettingsPatchSchema.optional(),
  seo: SeoSettingsPatchSchema.optional(),
  checkout: CheckoutSettingsPatchSchema.optional(),
  shippingConfig: ShippingConfigPatchSchema.optional(),
  floating: FloatingSettingsPatchSchema.optional(),
  courier: CourierSettingsPatchSchema.optional(),
  heroBanner: HeroBannerSettingsPatchSchema.optional(),
  trustBadges: TrustBadgesSettingsPatchSchema.optional(),
  whyChooseUs: WhyChooseUsSchema.optional(),
  typography: TypographySettingsPatchSchema.optional(),
  navigation: NavigationSettingsPatchSchema.optional(),
  layout: LayoutSettingsPatchSchema.optional(),
});

export type UnifiedStorefrontSettingsPatch = z.infer<typeof UnifiedStorefrontSettingsPatchSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const ALLOWED_THEME_IDS = [
  'starter-store',
  'luxe-boutique',
  'nova-lux',
  'ozzyl-premium',
  'dc-store',
  'daraz',
  'ghorer-bazar',
  'tech-modern',
  'aurora-minimal',
  'eclipse',
  'artisan-market',
  'freshness',
  'rovo',
  'sokol',
  'turbo-sale',
  'zenith-rise',
  'nova-lux-ultra',
  'bdshop',
] as const;
export type AllowedThemeId = (typeof ALLOWED_THEME_IDS)[number];

export function isAllowedThemeId(themeId: string): themeId is AllowedThemeId {
  return ALLOWED_THEME_IDS.includes(themeId as AllowedThemeId);
}

export function validateThemeId(themeId: string): AllowedThemeId {
  return isAllowedThemeId(themeId) ? themeId : 'starter-store';
}

export function isValidHexColor(color: string | null | undefined): boolean {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function validateColor(color: string | null | undefined, fallback: string): string {
  if (!color || !isValidHexColor(color)) return fallback;
  return color;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_UNIFIED_SETTINGS: UnifiedStorefrontSettingsV1 = {
  version: 1,
  theme: {
    templateId: 'starter-store',
    primary: '#4F46E5',
    accent: '#F59E0B',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1f2937',
    footerText: '#ffffff',
  },
  branding: {
    storeName: 'My Store',
    logo: null,
    favicon: null,
    tagline: null,
    description: null,
    fontFamily: 'inter',
  },
  business: {
    phone: null,
    email: null,
    address: null,
  },
  tracking: {
    facebookPixelId: null,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    facebookAccessToken: null,
  },
  social: {
    facebook: null,
    instagram: null,
    whatsapp: null,
    twitter: null,
    youtube: null,
    linkedin: null,
  },
  announcement: {
    enabled: false,
    text: null,
    link: null,
    backgroundColor: '#4F46E5',
    textColor: '#ffffff',
  },
  seo: {
    title: null,
    description: null,
    keywords: [],
    ogImage: null,
  },
  checkout: {
    shippingSummaryText: null,
    showStockWarning: true,
    enableGuestCheckout: true,
  },
  shippingConfig: {
    deliveryCharge: 60,
    freeDeliveryAbove: null,
    insideDhaka: 60,
    outsideDhaka: 120,
    freeShippingAbove: 0,
    enabled: true,
  },
  floating: {
    whatsappEnabled: false,
    whatsappNumber: null,
    whatsappMessage: null,
    callEnabled: false,
    callNumber: null,
  },
  courier: {
    provider: null,
    pathao: null,
    redx: null,
    steadfast: null,
  },
  navigation: {
    headerMenu: [],
    footerColumns: [],
    footerDescription: null,
  },
  heroBanner: {
    mode: 'single',
    overlayOpacity: 40,
    autoPlayInterval: 5000,
    showAppWidget: true,
    slides: [
      {
        imageUrl:
          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600',
        heading: 'Welcome to Our Store',
        subheading: 'Discover amazing products at great prices',
        ctaText: 'Shop Now',
        ctaLink: '/products',
      },
    ],
    fallbackHeadline: null,
  },
  trustBadges: {
    badges: [
      { icon: 'truck', title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
      { icon: 'shield', title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
      { icon: 'refresh', title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
    ],
  },
  whyChooseUs: [
    { icon: '✨', title: 'প্রিমিয়াম কোয়ালিটি', description: 'উন্নত মানের নিশ্চয়তা' },
    { icon: '⚡', title: 'দ্রুত ডেলিভারি', description: 'দ্রুত ও নিরাপদ ডেলিভারি' },
    { icon: '💬', title: '২৪/৭ সাপোর্ট', description: 'আমরা ২৪ ঘণ্টা আপনার সেবায় নিয়োজিত' },
  ],
  typography: {
    fontFamily: 'inter',
  },
  flags: {
    sourceLocked: false,
    legacyFallbackUsed: false,
    migrationCompleted: false,
  },
  layout: {
    home: []
  },
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_THEME_COLORS: Record<AllowedThemeId, { primary: string; accent: string }> = {
  'starter-store': { primary: '#4F46E5', accent: '#F59E0B' },
  'luxe-boutique': { primary: '#1a1a1a', accent: '#c9a961' },
  'nova-lux': { primary: '#1C1C1E', accent: '#C4A35A' },
  'ghorer-bazar': { primary: '#fc8934', accent: '#e53935' },
  'tech-modern': { primary: '#0f172a', accent: '#3b82f6' },
  'dc-store': { primary: '#f59e0b', accent: '#f43f5e' },
  'ozzyl-premium': { primary: '#111827', accent: '#8b5cf6' },
  daraz: { primary: '#f85606', accent: '#ffffff' },
  'aurora-minimal': { primary: '#000000', accent: '#3b82f6' },
  eclipse: { primary: '#111827', accent: '#f43f5e' },
  'artisan-market': { primary: '#78350f', accent: '#10b981' },
  freshness: { primary: '#15803d', accent: '#f59e0b' },
  rovo: { primary: '#000000', accent: '#dc2626' },
  sokol: { primary: '#18181b', accent: '#e11d48' },
  'turbo-sale': { primary: '#ef4444', accent: '#fcd34d' },
  'zenith-rise': { primary: '#1e40af', accent: '#06b6d4' },
  'nova-lux-ultra': { primary: '#09090b', accent: '#c4a35a' },
  bdshop: { primary: '#e11d48', accent: '#1e293b' },
};

// ============================================================================
// SERIALIZATION
// ============================================================================

export function serializeUnifiedSettings(settings: UnifiedStorefrontSettingsV1): string {
  return JSON.stringify({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
}

export function deserializeUnifiedSettings(
  json: string | null
): UnifiedStorefrontSettingsV1 | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    const result = UnifiedStorefrontSettingsV1Schema.parse(parsed);
    return result;
  } catch (error) {
    // Log the error for debugging
    console.error('[deserializeUnifiedSettings] Failed to parse unified settings:', {
      error: error instanceof Error ? error.message : String(error),
      jsonLength: json?.length,
      jsonPreview: json?.slice(0, 100),
    });
    return null;
  }
}

export function createUnifiedSettingsFromPatch(
  current: UnifiedStorefrontSettingsV1,
  patch: UnifiedStorefrontSettingsPatch
): UnifiedStorefrontSettingsV1 {
  return {
    ...current,
    ...(patch.theme && { theme: { ...current.theme, ...patch.theme } }),
    ...(patch.branding && { branding: { ...current.branding, ...patch.branding } }),
    ...(patch.business && { business: { ...current.business, ...patch.business } }),
    ...(patch.social && { social: { ...current.social, ...patch.social } }),
    ...(patch.announcement && { announcement: { ...current.announcement, ...patch.announcement } }),
    ...(patch.seo && { seo: { ...current.seo, ...patch.seo } }),
    ...(patch.checkout && { checkout: { ...current.checkout, ...patch.checkout } }),
    ...(patch.shippingConfig && {
      shippingConfig: { ...current.shippingConfig, ...patch.shippingConfig },
    }),
    ...(patch.floating && { floating: { ...current.floating, ...patch.floating } }),
    ...(patch.courier && { courier: { ...current.courier, ...patch.courier } }),
    ...(patch.heroBanner && { heroBanner: { ...current.heroBanner, ...patch.heroBanner } }),
    ...(patch.trustBadges && { trustBadges: { ...current.trustBadges, ...patch.trustBadges } }),
    ...(patch.whyChooseUs && { whyChooseUs: patch.whyChooseUs }),
    ...(patch.typography && { typography: { ...current.typography, ...patch.typography } }),
    ...(patch.layout && { layout: { ...current.layout, ...patch.layout } }),
    updatedAt: new Date().toISOString(),
  };
}
