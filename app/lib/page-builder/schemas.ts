/**
 * Page Builder v2 - Zod Validation Schemas
 * 
 * Type-safe validation for all section props.
 * Each section type has its own schema that validates props before saving.
 */

import { z } from 'zod';

// ============================================================================
// BASE SECTION STYLING SCHEMA
// ============================================================================
/**
 * Common styling options for all sections.
 * Each section can override background, text color, and font.
 */
export const BaseSectionStyleSchema = z.object({
  // Background
  backgroundColor: z.string().optional(),
  backgroundGradient: z.string().optional(),
  backgroundPattern: z.enum(['none', 'dots', 'grid', 'waves', 'diagonal']).optional().default('none'),
  
  // Text Colors
  textColor: z.string().optional(),
  headingColor: z.string().optional(),
  
  // Font Family
  fontFamily: z.enum([
    'default',
    'hind-siliguri',
    'noto-sans-bengali', 
    'galada',
    'tiro-bangla',
    'mina',
    'atma',
    'poppins',
    'inter',
    'roboto',
    'lato',
    'montserrat',
    'oswald',
    'playfair-display',
    'open-sans'
  ]).optional().default('default'),
  
  // Spacing
  paddingY: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('md'),
  
  // Border & Shadow
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).optional().default('none'),
  boxShadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('none'),
  
  // Animation
  animationEntrance: z.enum(['none', 'fadeIn', 'fadeInUp', 'fadeInDown', 'slideInLeft', 'slideInRight', 'zoomIn']).optional().default('none'),
});
export type BaseSectionStyle = z.infer<typeof BaseSectionStyleSchema>;

/**
 * Font family CSS mapping
 */
export const FONT_FAMILIES: Record<string, string> = {
  'default': 'inherit',
  // Bengali Fonts
  'hind-siliguri': '"Hind Siliguri", sans-serif',
  'noto-sans-bengali': '"Noto Sans Bengali", sans-serif',
  'galada': '"Galada", cursive',
  'tiro-bangla': '"Tiro Bangla", serif',
  'mina': '"Mina", sans-serif',
  'atma': '"Atma", display',
  // English Fonts
  'poppins': '"Poppins", sans-serif',
  'inter': '"Inter", sans-serif',
  'roboto': '"Roboto", sans-serif',
  'lato': '"Lato", sans-serif',
  'montserrat': '"Montserrat", sans-serif',
  'oswald': '"Oswald", sans-serif',
  'playfair-display': '"Playfair Display", serif',
  'open-sans': '"Open Sans", sans-serif',
};

/**
 * Border Radius CSS mapping
 */
export const BORDER_RADIUS_VALUES: Record<string, string> = {
  'none': '0',
  'sm': '0.25rem',
  'md': '0.5rem',
  'lg': '1rem',
  'xl': '1.5rem',
  'full': '9999px',
};

/**
 * Box Shadow CSS mapping
 */
export const BOX_SHADOW_VALUES: Record<string, string> = {
  'none': 'none',
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

/**
 * Background Pattern CSS mapping
 */
export const BACKGROUND_PATTERNS: Record<string, string> = {
  'none': '',
  'dots': 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
  'grid': 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
  'waves': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'rgba(0,0,0,0.03)\' d=\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
  'diagonal': 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 10px)',
};

/**
 * Padding Y CSS mapping
 */
export const PADDING_Y_VALUES: Record<string, string> = {
  'none': '0',
  'sm': '1rem',
  'md': '2rem',
  'lg': '4rem',
  'xl': '6rem',
};

// ============================================================================
// HERO SECTION
// ============================================================================
export const HeroPropsSchema = z.object({
  headline: z.string().min(1, 'Headline is required').default('আপনার পণ্যের শিরোনাম'),
  subheadline: z.string().optional().default(''),
  ctaText: z.string().default('অর্ডার করুন'),
  ctaLink: z.string().optional(),
  badgeText: z.string().optional(),
  priceLabel: z.string().optional(),
  backgroundImage: z.string().optional(),
  variant: z.enum(['centered', 'split-left', 'split-right', 'glow', 'modern']).optional().default('centered'),
  features: z.array(z.object({
    icon: z.string(),
    text: z.string(),
  })).optional().default([]),
});
export type HeroProps = z.infer<typeof HeroPropsSchema>;

// ============================================================================
// FEATURES SECTION
// ============================================================================
export const FeaturesPropsSchema = z.object({
  title: z.string().optional().default('প্রধান বৈশিষ্ট্যসমূহ'),
  features: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).default([
    { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য' },
    { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনে ডেলিভারি' },
    { icon: '💯', title: 'সন্তুষ্টির গ্যারান্টি', description: 'পছন্দ না হলে ফেরত' },
  ]),
  variant: z.enum(['grid', 'bento', 'cards']).optional().default('grid'),
});
export type FeaturesProps = z.infer<typeof FeaturesPropsSchema>;

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================
export const TestimonialsPropsSchema = z.object({
  title: z.string().optional().default('কাস্টমারদের মতামত'),
  testimonials: z.array(z.object({
    name: z.string(),
    text: z.string().optional(),
    imageUrl: z.string().optional(),
  })).default([]),
});
export type TestimonialsProps = z.infer<typeof TestimonialsPropsSchema>;

// ============================================================================
// FAQ SECTION
// ============================================================================
export const FAQPropsSchema = z.object({
  title: z.string().optional().default('সাধারণ জিজ্ঞাসা'),
  subtitle: z.string().optional(),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([
    { question: 'ডেলিভারি কতদিনে হয়?', answer: 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৩ দিন।' },
    { question: 'পেমেন্ট কিভাবে করব?', answer: 'ক্যাশ অন ডেলিভারি বা বিকাশ/নগদ।' },
  ]),
});
export type FAQProps = z.infer<typeof FAQPropsSchema>;

// ============================================================================
// GALLERY SECTION
// ============================================================================
export const GalleryPropsSchema = z.object({
  title: z.string().optional().default('ফটো গ্যালারি'),
  images: z.array(z.string()).default([]),
});
export type GalleryProps = z.infer<typeof GalleryPropsSchema>;

// ============================================================================
// VIDEO SECTION
// ============================================================================
export const VideoPropsSchema = z.object({
  title: z.string().optional().default('ভিডিও দেখুন'),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});
export type VideoProps = z.infer<typeof VideoPropsSchema>;

// ============================================================================
// CTA/ORDER FORM SECTION - BD Landing Page Style
// ============================================================================
const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().optional(),
});

export const CTAPropsSchema = z.object({
  headline: z.string().optional().default('এখনই অর্ডার করুন'),
  subheadline: z.string().optional().default('সীমিত সময়ের জন্য বিশেষ অফার!'),
  buttonText: z.string().default('অর্ডার কনফার্ম করুন'),
  
  // Template variation
  template: z.enum(['minimal', 'premium', 'urgent', 'singleColumn', 'withImage']).optional().default('minimal'),
  
  // Product Selection (from store products)
  productId: z.number().nullable().optional(),
  
  // Pricing
  productPrice: z.number().optional().default(1990),
  discountedPrice: z.number().optional().default(1490),
  insideDhakaCharge: z.number().optional().default(60),
  outsideDhakaCharge: z.number().optional().default(120),
  
  // Variants/Packages
  variants: z.array(VariantSchema).default([
    { id: '1', name: '১ পিস', price: 1490 },
    { id: '2', name: '২ পিস (সেভ ৳২০০)', price: 2780 },
    { id: '3', name: '৩ পিস (সেভ ৳৫০০)', price: 3970 },
  ]),
  variantLabel: z.string().optional().default('প্যাকেজ নির্বাচন করুন'),
  
  // Form placeholders
  phonePlaceholder: z.string().optional().default('আপনার মোবাইল নম্বর'),
  addressPlaceholder: z.string().optional().default('পূর্ণ ডেলিভারি ঠিকানা লিখুন'),
  
  // Labels
  quantityLabel: z.string().optional().default('পরিমাণ'),
  insideDhakaLabel: z.string().optional().default('ঢাকার ভিতরে'),
  outsideDhakaLabel: z.string().optional().default('ঢাকার বাইরে'),
  subtotalLabel: z.string().optional().default('সাবটোটাল'),
  deliveryLabel: z.string().optional().default('ডেলিভারি চার্জ'),
  totalLabel: z.string().optional().default('সর্বমোট'),
  
  // Trust badges
  showTrustBadges: z.boolean().optional().default(true),
  codLabel: z.string().optional().default('ক্যাশ অন ডেলিভারি'),
  secureLabel: z.string().optional().default('১০০% সিকিউর অর্ডার'),
});
export type CTAProps = z.infer<typeof CTAPropsSchema>;

// ============================================================================
// TRUST BADGES SECTION
// ============================================================================
export const TrustBadgesPropsSchema = z.object({
  title: z.string().optional(),
  badges: z.array(z.object({
    icon: z.string(),
    text: z.string(),
  })).default([
    { icon: '🚚', text: 'দ্রুত ডেলিভারি' },
    { icon: '🔒', text: 'নিরাপদ পেমেন্ট' },
  ]),
  variant: z.enum(['grid', 'marquee']).optional().default('grid'),
});
export type TrustBadgesProps = z.infer<typeof TrustBadgesPropsSchema>;

// ============================================================================
// BENEFITS SECTION
// ============================================================================
export const BenefitsPropsSchema = z.object({
  title: z.string().optional().default('কেন আমাদের থেকে কিনবেন?'),
  benefits: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).default([
    { icon: '💎', title: 'সেরা মান', description: 'আমরা দিচ্ছি সেরা মানের নিশ্চয়তা' },
    { icon: '💰', title: 'সাশ্রয়ী মূল্য', description: 'বাজেটের মধ্যে সেরা পণ্য' },
  ]),
});
export type BenefitsProps = z.infer<typeof BenefitsPropsSchema>;

// ============================================================================
// COMPARISON SECTION
// ============================================================================
export const ComparisonPropsSchema = z.object({
  title: z.string().optional().default('পার্থক্য দেখুন'),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  beforeLabel: z.string().default('আগে'),
  afterLabel: z.string().default('পরে'),
  description: z.string().optional(),
});
export type ComparisonProps = z.infer<typeof ComparisonPropsSchema>;

// ============================================================================
// DELIVERY INFO SECTION
// ============================================================================
export const DeliveryPropsSchema = z.object({
  title: z.string().optional().default('ডেলিভারি তথ্য'),
  description: z.string().optional(),
  areas: z.array(z.string()).default(['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী']),
  insideDhakaPrice: z.number().optional(),
  outsideDhakaPrice: z.number().optional(),
});
export type DeliveryProps = z.infer<typeof DeliveryPropsSchema>;

// ============================================================================
// GUARANTEE SECTION
// ============================================================================
export const GuaranteePropsSchema = z.object({
  title: z.string().optional().default('আমাদের গ্যারান্টি'),
  text: z.string().default('১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।'),
  badgeLabel: z.string().optional(),
});
export type GuaranteeProps = z.infer<typeof GuaranteePropsSchema>;

// ============================================================================
// PROBLEM-SOLUTION SECTION
// ============================================================================
export const ProblemSolutionPropsSchema = z.object({
  beforeTitle: z.string().optional().default('সমস্যা'),
  afterTitle: z.string().optional().default('সমাধান'),
  problems: z.array(z.string()).default([]),
  solutions: z.array(z.string()).default([]),
});
export type ProblemSolutionProps = z.infer<typeof ProblemSolutionPropsSchema>;

// ============================================================================
// PRICING SECTION
// ============================================================================
export const PricingPropsSchema = z.object({
  title: z.string().optional().default('প্যাকেজ ও মূল্য'),
  buttonText: z.string().default('অর্ডার করুন'),
  features: z.array(z.string()).default([
    '১০০% অরিজিনাল প্রোডাক্ট',
    'ফ্রি হোম ডেলিভারি',
    '৭ দিনের রিপ্লেসমেন্ট',
  ]),
});
export type PricingProps = z.infer<typeof PricingPropsSchema>;

// ============================================================================
// HOW TO ORDER SECTION
// ============================================================================
export const HowToOrderPropsSchema = z.object({
  title: z.string().optional().default('কিভাবে অর্ডার করবেন?'),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).default([
    { title: 'অর্ডার করুন', description: 'ফর্ম পূরণ করে অর্ডার বাটনে ক্লিক করুন' },
    { title: 'কনফার্মেশন', description: 'আমরা কল করে অর্ডার কনফার্ম করব' },
    { title: 'ডেলিভারি', description: 'পণ্য হাতে পেয়ে পেমেন্ট করুন' },
  ]),
});
export type HowToOrderProps = z.infer<typeof HowToOrderPropsSchema>;

// ============================================================================
// SHOWCASE SECTION
// ============================================================================
export const ShowcasePropsSchema = z.object({
  title: z.string().optional().default('প্রোডাক্ট ডিটেইলস'),
  image: z.string().optional(),
  features: z.array(z.string()).default([]),
});
export type ShowcaseProps = z.infer<typeof ShowcasePropsSchema>;
// ============================================================================
// CUSTOM HTML SECTION
// ============================================================================
export const CustomHtmlPropsSchema = z.object({
  title: z.string().optional().default('কাস্টম HTML'),
  htmlContent: z.string().default('<div class="p-8 text-center"><p>আপনার HTML কোড এখানে পেস্ট করুন</p></div>'),
  cssContent: z.string().optional().default(''),
  containerClass: z.string().optional().default(''),
});
export type CustomHtmlProps = z.infer<typeof CustomHtmlPropsSchema>;

// ============================================================================
// ORDER BUTTON SECTION - Placeable CTA button
// ============================================================================
export const OrderButtonPropsSchema = z.object({
  text: z.string().default('এখনই অর্ডার করুন'),
  subtext: z.string().optional().default(''),
  bgColor: z.string().default('#6366F1'),
  textColor: z.string().default('#FFFFFF'),
  size: z.enum(['sm', 'md', 'lg', 'xl']).default('lg'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  fullWidth: z.boolean().default(false),
  showIcon: z.boolean().default(true),
  iconPosition: z.enum(['left', 'right']).default('right'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('lg'),
  animation: z.enum(['none', 'pulse', 'bounce', 'shake']).default('pulse'),
  containerPadding: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
});
export type OrderButtonProps = z.infer<typeof OrderButtonPropsSchema>;

// ============================================================================
// FOOTER SECTION - Page footer with social links and contact info
// ============================================================================
const SocialLinkSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'youtube', 'tiktok', 'whatsapp', 'telegram']),
  url: z.string(),
});

export const FooterPropsSchema = z.object({
  // Branding
  storeName: z.string().optional().default(''),
  logoUrl: z.string().optional().default(''),
  tagline: z.string().optional().default('আমাদের সাথে থাকার জন্য ধন্যবাদ'),
  
  // Contact Info
  showContactInfo: z.boolean().default(true),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  address: z.string().optional().default(''),
  
  // Social Links
  showSocialLinks: z.boolean().default(true),
  socialLinks: z.array(SocialLinkSchema).default([]),
  
  // Payment & Trust
  showPaymentMethods: z.boolean().default(true),
  paymentMethods: z.array(z.string()).default(['বিকাশ', 'নগদ', 'রকেট', 'ক্যাশ অন ডেলিভারি']),
  
  // Styling
  bgColor: z.string().default('#18181B'),
  textColor: z.string().default('#FFFFFF'),
  accentColor: z.string().default('#10B981'),
  
  // Copyright
  copyrightText: z.string().optional().default(''),
  showPoweredBy: z.boolean().default(true),
});
export type FooterProps = z.infer<typeof FooterPropsSchema>;

// ============================================================================
// MASTER SCHEMA MAP
// ============================================================================
export const SectionSchemas: Record<string, z.ZodTypeAny> = {
  'hero': HeroPropsSchema,
  'features': FeaturesPropsSchema,
  'testimonials': TestimonialsPropsSchema,
  'faq': FAQPropsSchema,
  'gallery': GalleryPropsSchema,
  'video': VideoPropsSchema,
  'cta': CTAPropsSchema,
  'trust-badges': TrustBadgesPropsSchema,
  'benefits': BenefitsPropsSchema,
  'comparison': ComparisonPropsSchema,
  'delivery': DeliveryPropsSchema,
  'guarantee': GuaranteePropsSchema,
  'problem-solution': ProblemSolutionPropsSchema,
  'pricing': PricingPropsSchema,
  'how-to-order': HowToOrderPropsSchema,
  'showcase': ShowcasePropsSchema,
  'custom-html': CustomHtmlPropsSchema,
  'order-button': OrderButtonPropsSchema,
  'footer': FooterPropsSchema,
};

/**
 * Validate props for a given section type.
 * Returns parsed data or validation errors.
 */
export function validateSectionProps(type: string, props: unknown) {
  const schema = SectionSchemas[type];
  if (!schema) {
    return { success: false as const, error: `Unknown section type: ${type}` };
  }
  
  const result = schema.safeParse(props);
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  
  return { 
    success: false as const, 
    error: 'Validation failed', 
    details: result.error.flatten() 
  };
}
