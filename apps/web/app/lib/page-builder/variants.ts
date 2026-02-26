/**
 * Page Builder v2 — Section Variant Definitions
 *
 * Each section type can have multiple visual variants (like Framer's variant system).
 * Merchants can switch variants without losing their content.
 *
 * previewBg  — CSS background value for the 100×70 mini card (gradient strings allowed)
 * previewAccent — accent color used to render sample elements in the mini preview
 */

export interface SectionVariantMeta {
  id: string;
  nameBn: string;       // Bengali display name shown in picker
  description: string;  // English description (tooltip)
  previewBg: string;    // CSS background for mini preview card
  previewAccent: string;// Accent color for decorative elements inside preview
}

// ── Per-section variant lists ────────────────────────────────────────────────

export const SECTION_VARIANTS: Record<string, SectionVariantMeta[]> = {
  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: [
    {
      id: 'centered',
      nameBn: 'সেন্টারড',
      description: 'Centered layout with text and CTA in the middle',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'split',
      nameBn: 'স্প্লিট',
      description: 'Side-by-side text and product image',
      previewBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      previewAccent: 'rgba(255,255,255,0.85)',
    },
    {
      id: 'glow',
      nameBn: 'গ্লো',
      description: 'Dark background with glowing accent',
      previewBg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      previewAccent: '#a78bfa',
    },
    {
      id: 'modern',
      nameBn: 'মডার্ন',
      description: 'Clean modern layout with bold typography',
      previewBg: '#F9FAFB',
      previewAccent: '#111827',
    },
    {
      id: 'immersive',
      nameBn: 'ইমার্সিভ',
      description: 'Full-bleed background image with overlay',
      previewBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f2027 100%)',
      previewAccent: '#F59E0B',
    },
  ],

  // ── Features ──────────────────────────────────────────────────────────────
  features: [
    {
      id: 'grid',
      nameBn: 'গ্রিড',
      description: '3-column icon feature grid',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'bento',
      nameBn: 'বেন্টো',
      description: 'Bento-style mixed-size cards',
      previewBg: '#FDF4FF',
      previewAccent: '#A855F7',
    },
    {
      id: 'cards',
      nameBn: 'কার্ড',
      description: 'Elevated card layout with shadows',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'list',
      nameBn: 'লিস্ট',
      description: 'Vertical list with icons and descriptions',
      previewBg: '#FFFBEB',
      previewAccent: '#F59E0B',
    },
  ],

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials: [
    {
      id: 'cards',
      nameBn: 'কার্ড',
      description: 'Grid of review cards with stars',
      previewBg: '#FFF7ED',
      previewAccent: '#F97316',
    },
    {
      id: 'carousel',
      nameBn: 'ক্যারাউজেল',
      description: 'Auto-scrolling carousel',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'avatars',
      nameBn: 'অ্যাভাটার',
      description: 'Reviewer photo + quote layout',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'star-rating',
      nameBn: 'স্টার রেটিং',
      description: 'Prominent star ratings with short reviews',
      previewBg: '#FFFBEB',
      previewAccent: '#FBBF24',
    },
  ],

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faq: [
    {
      id: 'accordion',
      nameBn: 'অ্যাকর্ডিয়ন',
      description: 'Expandable accordion items',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
    {
      id: 'two-column',
      nameBn: '২ কলাম',
      description: 'Two-column grid of questions',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'minimal',
      nameBn: 'মিনিমাল',
      description: 'Clean borderless list',
      previewBg: '#FFFFFF',
      previewAccent: '#6B7280',
    },
  ],

  // ── CTA / Order Form ──────────────────────────────────────────────────────
  cta: [
    {
      id: 'button-only',
      nameBn: 'বাটন',
      description: 'Simple CTA button',
      previewBg: '#EFF6FF',
      previewAccent: '#2563EB',
    },
    {
      id: 'with-trust',
      nameBn: 'ট্রাস্ট সহ',
      description: 'CTA with trust badges below',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'urgency',
      nameBn: 'আর্জেন্ট',
      description: 'High-urgency red CTA with countdown',
      previewBg: '#FEF2F2',
      previewAccent: '#DC2626',
    },
    {
      id: 'form',
      nameBn: 'ফর্ম',
      description: 'Full order form with fields',
      previewBg: '#FFFBEB',
      previewAccent: '#D97706',
    },
  ],

  // ── Trust Badges ──────────────────────────────────────────────────────────
  'trust-badges': [
    {
      id: 'grid',
      nameBn: 'গ্রিড',
      description: 'Static badge grid',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
    {
      id: 'marquee',
      nameBn: 'মার্কি',
      description: 'Auto-scrolling marquee strip',
      previewBg: 'linear-gradient(90deg, #1e1e2e, #2d2d4e)',
      previewAccent: '#a78bfa',
    },
  ],

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: [
    {
      id: 'simple',
      nameBn: 'সিম্পল',
      description: 'Phone, email, and address list',
      previewBg: '#F9FAFB',
      previewAccent: '#6B7280',
    },
    {
      id: 'with-form',
      nameBn: 'ফর্ম সহ',
      description: 'Contact info alongside a message form',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'card',
      nameBn: 'কার্ড',
      description: 'Elevated card with icon buttons',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
  ],

  // ── Showcase / Product Details ────────────────────────────────────────────
  showcase: [
    {
      id: 'simple',
      nameBn: 'সাধারণ',
      description: 'Clean product detail layout',
      previewBg: '#F9FAFB',
      previewAccent: '#6B7280',
    },
    {
      id: 'detailed',
      nameBn: 'বিস্তারিত',
      description: 'Full detail with specs and gallery',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'highlight',
      nameBn: 'হাইলাইট',
      description: 'Dark premium showcase',
      previewBg: 'linear-gradient(135deg, #1e1e2e, #2d2d4e)',
      previewAccent: '#a78bfa',
    },
  ],

  // ── Product Grid ──────────────────────────────────────────────────────────
  'product-grid': [
    {
      id: 'grid-3',
      nameBn: '৩ কলাম',
      description: '3-column product grid',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'grid-2-featured',
      nameBn: 'ফিচার্ড',
      description: '2-col with featured product highlighted',
      previewBg: '#FDF4FF',
      previewAccent: '#A855F7',
    },
    {
      id: 'carousel',
      nameBn: 'ক্যারাউজেল',
      description: 'Horizontal scrollable product row',
      previewBg: '#FFF7ED',
      previewAccent: '#F97316',
    },
    {
      id: 'list',
      nameBn: 'লিস্ট',
      description: 'Vertical list style with details',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
  ],

  // ── Header ────────────────────────────────────────────────────────────────
  header: [
    {
      id: 'minimal',
      nameBn: 'মিনিমাল',
      description: 'Clean logo-only header',
      previewBg: '#FFFFFF',
      previewAccent: '#6B7280',
    },
    {
      id: 'with-nav',
      nameBn: 'নেভিগেশন',
      description: 'Logo with navigation links',
      previewBg: '#F9FAFB',
      previewAccent: '#4F46E5',
    },
    {
      id: 'announcement',
      nameBn: 'অ্যানাউন্সমেন্ট',
      description: 'Header with top announcement bar',
      previewBg: 'linear-gradient(180deg, #1e3a5f 0%, #f9fafb 0%)',
      previewAccent: '#F59E0B',
    },
  ],

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: [
    {
      id: 'minimal',
      nameBn: 'মিনিমাল',
      description: 'Simple single-row footer',
      previewBg: '#1F2937',
      previewAccent: '#9CA3AF',
    },
    {
      id: 'multi-column',
      nameBn: 'মাল্টি-কলাম',
      description: 'Multi-column with links and social icons',
      previewBg: '#111827',
      previewAccent: '#6366F1',
    },
    {
      id: 'centered',
      nameBn: 'সেন্টারড',
      description: 'Centered logo, tagline, and social links',
      previewBg: '#0f172a',
      previewAccent: '#38BDF8',
    },
  ],

  // ── Gallery ───────────────────────────────────────────────────────────────
  gallery: [
    {
      id: 'masonry',
      nameBn: 'ম্যাসনরি',
      description: 'Pinterest-style masonry grid',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
    {
      id: 'grid',
      nameBn: 'গ্রিড',
      description: 'Uniform grid layout',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'carousel',
      nameBn: 'ক্যারাউজেল',
      description: 'Swipeable image carousel',
      previewBg: '#FDF4FF',
      previewAccent: '#A855F7',
    },
  ],

  // ── Newsletter ────────────────────────────────────────────────────────────
  newsletter: [
    {
      id: 'banner',
      nameBn: 'ব্যানার',
      description: 'Full-width email capture banner',
      previewBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      previewAccent: '#FFFFFF',
    },
    {
      id: 'card',
      nameBn: 'কার্ড',
      description: 'Centered card with email input',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
  ],

  // ── Countdown ─────────────────────────────────────────────────────────────
  countdown: [
    {
      id: 'banner',
      nameBn: 'ব্যানার',
      description: 'Wide announcement banner',
      previewBg: '#FEF2F2',
      previewAccent: '#DC2626',
    },
    {
      id: 'card',
      nameBn: 'কার্ড',
      description: 'Compact countdown card',
      previewBg: '#FFFBEB',
      previewAccent: '#D97706',
    },
    {
      id: 'minimal',
      nameBn: 'মিনিমাল',
      description: 'Inline minimal timer',
      previewBg: '#F9FAFB',
      previewAccent: '#6B7280',
    },
    {
      id: 'urgent',
      nameBn: 'আর্জেন্ট',
      description: 'High-urgency pulsing timer',
      previewBg: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
      previewAccent: '#FBBF24',
    },
  ],

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats: [
    {
      id: 'light',
      nameBn: 'লাইট',
      description: 'Light background stats counters',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
    {
      id: 'dark',
      nameBn: 'ডার্ক',
      description: 'Dark background with glowing numbers',
      previewBg: 'linear-gradient(135deg, #0f0c29, #302b63)',
      previewAccent: '#a78bfa',
    },
    {
      id: 'brand',
      nameBn: 'ব্র্যান্ড',
      description: 'Brand-colored bold stats',
      previewBg: 'linear-gradient(135deg, #10B981, #059669)',
      previewAccent: '#FFFFFF',
    },
  ],

  // ── Benefits ──────────────────────────────────────────────────────────────
  benefits: [
    {
      id: 'checklist',
      nameBn: 'চেকলিস্ট',
      description: 'Simple checklist with icons',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'cards',
      nameBn: 'কার্ড',
      description: 'Card grid with benefit highlights',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'comparison',
      nameBn: 'তুলনা',
      description: 'Before/after benefit comparison',
      previewBg: '#FFF7ED',
      previewAccent: '#F97316',
    },
  ],

  // ── Pricing ───────────────────────────────────────────────────────────────
  pricing: [
    {
      id: 'cards',
      nameBn: 'কার্ড',
      description: 'Pricing tier cards side by side',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
    {
      id: 'table',
      nameBn: 'টেবিল',
      description: 'Feature comparison table',
      previewBg: '#EFF6FF',
      previewAccent: '#3B82F6',
    },
    {
      id: 'simple',
      nameBn: 'সিম্পল',
      description: 'Single product price with CTA',
      previewBg: '#FFFBEB',
      previewAccent: '#D97706',
    },
  ],

  // ── Social Proof ──────────────────────────────────────────────────────────
  'social-proof': [
    {
      id: 'counter',
      nameBn: 'কাউন্টার',
      description: 'Animated customer count',
      previewBg: '#F0FDF4',
      previewAccent: '#10B981',
    },
    {
      id: 'live-feed',
      nameBn: 'লাইভ ফিড',
      description: 'Scrolling live purchase notifications',
      previewBg: '#1F2937',
      previewAccent: '#34D399',
    },
    {
      id: 'badges',
      nameBn: 'ব্যাজ',
      description: 'Trust badge grid layout',
      previewBg: '#F9FAFB',
      previewAccent: '#6366F1',
    },
  ],
};

// ── Fallback variant for any unmapped section type ────────────────────────────

const DEFAULT_VARIANT: SectionVariantMeta = {
  id: 'classic',
  nameBn: 'ক্লাসিক',
  description: 'Default style',
  previewBg: '#F3F4F6',
  previewAccent: '#6B7280',
};

/**
 * Returns the variant list for a given section type.
 * Falls back to a single "Classic" variant for unknown types.
 */
export function getVariantsForSection(sectionType: string): SectionVariantMeta[] {
  return SECTION_VARIANTS[sectionType] ?? [DEFAULT_VARIANT];
}

/**
 * Returns the active variant id for a section, defaulting to the first variant.
 */
export function getActiveVariantId(
  sectionType: string,
  currentVariantId: string | null | undefined
): string {
  const variants = getVariantsForSection(sectionType);
  if (!currentVariantId) return variants[0]?.id ?? 'classic';
  const found = variants.find((v) => v.id === currentVariantId);
  return found ? found.id : (variants[0]?.id ?? 'classic');
}
