/**
 * Section Variants Registry for Quick Builder v2
 * 
 * Defines all available variants for each section type
 * Each variant has: id, name (BN), nameEn, description, thumbnail, tags
 */

export interface SectionVariantDef {
  id: string;
  sectionId: string;
  name: string;        // Bangla name
  nameEn: string;      // English name
  description: string; // Bangla description
  descriptionEn: string;
  thumbnail?: string;  // Thumbnail image URL
  tags: string[];      // For filtering/suggestions
  compatibleWith: string[]; // Intent types this works best with
}

/**
 * Hero Section Variants
 */
export const HERO_VARIANTS: SectionVariantDef[] = [
  {
    id: 'product-focused',
    sectionId: 'hero',
    name: 'প্রোডাক্ট ফোকাস',
    nameEn: 'Product Focused',
    description: 'বড় প্রোডাক্ট ইমেজ, প্রাইস ও CTA বাটন',
    descriptionEn: 'Large product image with price and CTA',
    tags: ['mobile-friendly', 'conversion', 'e-commerce'],
    compatibleWith: ['direct_sales', 'facebook', 'organic'],
  },
  {
    id: 'offer-focused',
    sectionId: 'hero',
    name: 'অফার ফোকাস',
    nameEn: 'Offer Focused',
    description: 'ডিসকাউন্ট, কাউন্টডাউন ও আর্জেন্সি হাইলাইট',
    descriptionEn: 'Discount, countdown and urgency highlight',
    tags: ['urgency', 'facebook-ads', 'flash-sale'],
    compatibleWith: ['direct_sales', 'facebook', 'tiktok'],
  },
  {
    id: 'video-focused',
    sectionId: 'hero',
    name: 'ভিডিও ফোকাস',
    nameEn: 'Video Focused',
    description: 'ফুল-উইড্থ ভিডিও ব্যাকগ্রাউন্ড বা এম্বেড',
    descriptionEn: 'Full-width video background or embed',
    tags: ['tiktok', 'engagement', 'video'],
    compatibleWith: ['direct_sales', 'tiktok'],
  },
  {
    id: 'text-focused',
    sectionId: 'hero',
    name: 'টেক্সট ফোকাস',
    nameEn: 'Text Focused',
    description: 'বড় হেডলাইন ও সাবহেডলাইন, মিনিমাল ডিজাইন',
    descriptionEn: 'Bold headline and subheadline, minimal design',
    tags: ['minimal', 'clean', 'professional'],
    compatibleWith: ['lead_whatsapp', 'organic'],
  },
];

/**
 * Testimonials Section Variants
 */
export const TESTIMONIALS_VARIANTS: SectionVariantDef[] = [
  {
    id: 'cards',
    sectionId: 'testimonials',
    name: 'কার্ড গ্রিড',
    nameEn: 'Card Grid',
    description: '২-৩ কলামে রিভিউ কার্ড',
    descriptionEn: 'Review cards in 2-3 column grid',
    tags: ['grid', 'desktop-friendly'],
    compatibleWith: ['organic', 'direct_sales'],
  },
  {
    id: 'carousel',
    sectionId: 'testimonials',
    name: 'ক্যারোসেল',
    nameEn: 'Carousel',
    description: 'হরিজন্টাল স্ক্রল স্লাইডার',
    descriptionEn: 'Horizontal scroll slider',
    tags: ['mobile-friendly', 'interactive'],
    compatibleWith: ['facebook', 'tiktok', 'direct_sales'],
  },
  {
    id: 'avatars',
    sectionId: 'testimonials',
    name: 'অ্যাভাটার',
    nameEn: 'Avatars Only',
    description: 'শুধু কাস্টমার ফটো ও নাম',
    descriptionEn: 'Just customer photos and names',
    tags: ['minimal', 'quick'],
    compatibleWith: ['lead_whatsapp'],
  },
  {
    id: 'screenshots',
    sectionId: 'testimonials',
    name: 'স্ক্রিনশট',
    nameEn: 'Screenshots',
    description: 'Facebook/WhatsApp রিভিউ স্ক্রিনশট',
    descriptionEn: 'Facebook/WhatsApp review screenshots',
    tags: ['authentic', 'social-proof', 'trust'],
    compatibleWith: ['facebook', 'direct_sales'],
  },
  {
    id: 'star-rating',
    sectionId: 'testimonials',
    name: 'স্টার রেটিং',
    nameEn: 'Star Rating',
    description: 'স্টার রেটিং সহ রিভিউ',
    descriptionEn: 'Reviews with star ratings',
    tags: ['rating', 'professional'],
    compatibleWith: ['organic', 'direct_sales'],
  },
];

/**
 * CTA Section Variants
 */
export const CTA_VARIANTS: SectionVariantDef[] = [
  {
    id: 'button-only',
    sectionId: 'cta',
    name: 'শুধু বাটন',
    nameEn: 'Button Only',
    description: 'মিনিমাল CTA বাটন',
    descriptionEn: 'Minimal CTA button',
    tags: ['minimal', 'clean'],
    compatibleWith: ['organic', 'lead_whatsapp'],
  },
  {
    id: 'with-trust',
    sectionId: 'cta',
    name: 'ট্রাস্ট ব্যাজ সহ',
    nameEn: 'With Trust Badges',
    description: 'CTA বাটন + নিচে ট্রাস্ট ব্যাজ',
    descriptionEn: 'CTA button + trust badges below',
    tags: ['trust', 'conversion'],
    compatibleWith: ['direct_sales', 'facebook'],
  },
  {
    id: 'urgency',
    sectionId: 'cta',
    name: 'আর্জেন্সি',
    nameEn: 'Urgency',
    description: 'কাউন্টডাউন টাইমার ও স্টক কাউন্টার সহ',
    descriptionEn: 'With countdown timer and stock counter',
    tags: ['urgency', 'scarcity', 'flash-sale'],
    compatibleWith: ['facebook', 'tiktok', 'direct_sales'],
  },
];

/**
 * Features Section Variants
 */
export const FEATURES_VARIANTS: SectionVariantDef[] = [
  {
    id: 'grid-3',
    sectionId: 'features',
    name: '৩ কলাম গ্রিড',
    nameEn: '3 Column Grid',
    description: '৩টি ফিচার পাশাপাশি',
    descriptionEn: '3 features side by side',
    tags: ['desktop', 'balanced'],
    compatibleWith: ['organic', 'direct_sales'],
  },
  {
    id: 'grid-4',
    sectionId: 'features',
    name: '৪ কলাম গ্রিড',
    nameEn: '4 Column Grid',
    description: '৪টি ফিচার পাশাপাশি',
    descriptionEn: '4 features side by side',
    tags: ['desktop', 'detailed'],
    compatibleWith: ['organic'],
  },
  {
    id: 'list',
    sectionId: 'features',
    name: 'লিস্ট',
    nameEn: 'Vertical List',
    description: 'আইকন সহ ভার্টিকাল লিস্ট',
    descriptionEn: 'Vertical list with icons',
    tags: ['mobile-friendly', 'simple'],
    compatibleWith: ['facebook', 'tiktok', 'lead_whatsapp'],
  },
];

/**
 * Social Proof Section Variants
 */
export const SOCIAL_PROOF_VARIANTS: SectionVariantDef[] = [
  {
    id: 'counter',
    sectionId: 'social',
    name: 'কাউন্টার',
    nameEn: 'Counter',
    description: 'বড় সংখ্যা সহ স্ট্যাটস',
    descriptionEn: 'Big numbers with stats',
    tags: ['numbers', 'impressive'],
    compatibleWith: ['direct_sales', 'organic'],
  },
  {
    id: 'live-feed',
    sectionId: 'social',
    name: 'লাইভ ফিড',
    nameEn: 'Live Feed',
    description: 'সাম্প্রতিক অর্ডার নোটিফিকেশন',
    descriptionEn: 'Recent order notifications',
    tags: ['urgency', 'fomo'],
    compatibleWith: ['facebook', 'tiktok'],
  },
  {
    id: 'badges',
    sectionId: 'social',
    name: 'ব্যাজ',
    nameEn: 'Badges',
    description: 'ট্রাস্ট ব্যাজ ও সার্টিফিকেশন',
    descriptionEn: 'Trust badges and certifications',
    tags: ['trust', 'professional'],
    compatibleWith: ['organic', 'lead_whatsapp'],
  },
];

/**
 * All Section Variants Registry
 */
export const SECTION_VARIANTS: Record<string, SectionVariantDef[]> = {
  hero: HERO_VARIANTS,
  testimonials: TESTIMONIALS_VARIANTS,
  cta: CTA_VARIANTS,
  features: FEATURES_VARIANTS,
  social: SOCIAL_PROOF_VARIANTS,
};

/**
 * Get variants for a specific section
 */
export function getVariantsForSection(sectionId: string): SectionVariantDef[] {
  return SECTION_VARIANTS[sectionId] || [];
}

/**
 * Get a specific variant by section and variant ID
 */
export function getVariant(sectionId: string, variantId: string): SectionVariantDef | undefined {
  const variants = SECTION_VARIANTS[sectionId];
  if (!variants) return undefined;
  return variants.find(v => v.id === variantId);
}

/**
 * Get default variant for a section
 */
export function getDefaultVariant(sectionId: string): string {
  const defaults: Record<string, string> = {
    hero: 'product-focused',
    testimonials: 'screenshots',
    cta: 'with-trust',
    features: 'grid-3',
    social: 'counter',
  };
  return defaults[sectionId] || '';
}

/**
 * Get suggested variants based on intent
 */
export function getSuggestedVariants(
  sectionId: string,
  intent: { goal: string; trafficSource: string }
): SectionVariantDef[] {
  const variants = SECTION_VARIANTS[sectionId];
  if (!variants) return [];

  // Filter variants compatible with the intent
  return variants.filter(v => 
    v.compatibleWith.includes(intent.goal) || 
    v.compatibleWith.includes(intent.trafficSource)
  );
}

/**
 * Check if a section has variants
 */
export function hasVariants(sectionId: string): boolean {
  return sectionId in SECTION_VARIANTS;
}

/**
 * Get all sections that have variants
 */
export function getSectionsWithVariants(): string[] {
  return Object.keys(SECTION_VARIANTS);
}
