/**
 * Page Builder v2 - Section Registry
 * 
 * Central registry that maps section types to their metadata, schemas, and defaults.
 * This is the single source of truth for all section definitions.
 */

import type { z } from 'zod';
import type { SectionType, SectionMeta } from './types';
import {
  HeroPropsSchema,
  FeaturesPropsSchema,
  TestimonialsPropsSchema,
  FAQPropsSchema,
  GalleryPropsSchema,
  VideoPropsSchema,
  CTAPropsSchema,
  TrustBadgesPropsSchema,
  BenefitsPropsSchema,
  ComparisonPropsSchema,
  DeliveryPropsSchema,
  GuaranteePropsSchema,
  ProblemSolutionPropsSchema,
  PricingPropsSchema,
  HowToOrderPropsSchema,
  ShowcasePropsSchema,
  ProductGridPropsSchema,
  CustomHtmlPropsSchema,
  OrderButtonPropsSchema,
  HeaderPropsSchema,
  CountdownPropsSchema,
  StatsPropsSchema,
  ContactPropsSchema,
  FooterPropsSchema,
  validateSectionProps,
} from './schemas';

// ============================================================================
// SECTION REGISTRY
// ============================================================================

interface SectionRegistryEntry extends SectionMeta {
  schema: z.ZodTypeAny;
  defaultProps: Record<string, unknown>;
}

/**
 * Complete section registry with all metadata.
 * Icon names are from lucide-react.
 */
export const SECTION_REGISTRY: Record<SectionType, SectionRegistryEntry> = {
  'hero': {
    type: 'hero',
    name: 'হিরো',
    nameEn: 'Hero',
    description: 'প্রথমে যা দেখা যাবে',
    descriptionEn: 'First thing visitors see',
    icon: 'Type',
    schema: HeroPropsSchema,
    defaultProps: HeroPropsSchema.parse({}),
  },
  'features': {
    type: 'features',
    name: 'বৈশিষ্ট্য',
    nameEn: 'Features',
    description: 'প্রোডাক্টের সুবিধাসমূহ',
    descriptionEn: 'Product benefits',
    icon: 'Star',
    schema: FeaturesPropsSchema,
    defaultProps: FeaturesPropsSchema.parse({}),
  },
  'testimonials': {
    type: 'testimonials',
    name: 'টেস্টিমোনিয়াল',
    nameEn: 'Testimonials',
    description: 'কাস্টমার রিভিউ',
    descriptionEn: 'Customer reviews',
    icon: 'MessageSquare',
    schema: TestimonialsPropsSchema,
    defaultProps: TestimonialsPropsSchema.parse({}),
  },
  'faq': {
    type: 'faq',
    name: 'FAQ',
    nameEn: 'FAQ',
    description: 'সচরাচর জিজ্ঞাসা',
    descriptionEn: 'Frequently asked questions',
    icon: 'HelpCircle',
    schema: FAQPropsSchema,
    defaultProps: FAQPropsSchema.parse({}),
  },
  'gallery': {
    type: 'gallery',
    name: 'গ্যালারি',
    nameEn: 'Gallery',
    description: 'প্রোডাক্ট ইমেজ গ্যালারি',
    descriptionEn: 'Product image gallery',
    icon: 'Image',
    schema: GalleryPropsSchema,
    defaultProps: GalleryPropsSchema.parse({}),
  },
  'video': {
    type: 'video',
    name: 'ভিডিও',
    nameEn: 'Video',
    description: 'প্রোডাক্ট ভিডিও',
    descriptionEn: 'Product video',
    icon: 'Video',
    schema: VideoPropsSchema,
    defaultProps: VideoPropsSchema.parse({}),
  },
  'cta': {
    type: 'cta',
    name: 'অর্ডার ফর্ম',
    nameEn: 'Order Form',
    description: 'যেখানে কাস্টমার অর্ডার করবে',
    descriptionEn: 'Where customers place orders',
    icon: 'ShoppingCart',
    schema: CTAPropsSchema,
    defaultProps: CTAPropsSchema.parse({}),
  },
  'trust-badges': {
    type: 'trust-badges',
    name: 'ট্রাস্ট ব্যাজ',
    nameEn: 'Trust Badges',
    description: 'গ্যারান্টি ও নিরাপত্তা',
    descriptionEn: 'Guarantee & safety',
    icon: 'ShieldCheck',
    schema: TrustBadgesPropsSchema,
    defaultProps: TrustBadgesPropsSchema.parse({}),
  },
  'benefits': {
    type: 'benefits',
    name: 'কেন কিনবেন',
    nameEn: 'Why Buy',
    description: 'কেন আমাদের থেকে কিনবেন',
    descriptionEn: 'Why buy from us',
    icon: 'CheckCircle',
    schema: BenefitsPropsSchema,
    defaultProps: BenefitsPropsSchema.parse({}),
  },
  'comparison': {
    type: 'comparison',
    name: 'তুলনা',
    nameEn: 'Comparison',
    description: 'আগে/পরে তুলনা',
    descriptionEn: 'Before/After comparison',
    icon: 'Layers',
    schema: ComparisonPropsSchema,
    defaultProps: ComparisonPropsSchema.parse({}),
  },
  'delivery': {
    type: 'delivery',
    name: 'ডেলিভারি',
    nameEn: 'Delivery',
    description: 'শিপিং ও ডেলিভারি তথ্য',
    descriptionEn: 'Shipping & delivery info',
    icon: 'Truck',
    schema: DeliveryPropsSchema,
    defaultProps: DeliveryPropsSchema.parse({}),
  },
  'guarantee': {
    type: 'guarantee',
    name: 'গ্যারান্টি',
    nameEn: 'Guarantee',
    description: 'রিটার্ন ও রিফান্ড পলিসি',
    descriptionEn: 'Return & refund policy',
    icon: 'Shield',
    schema: GuaranteePropsSchema,
    defaultProps: GuaranteePropsSchema.parse({}),
  },
  'problem-solution': {
    type: 'problem-solution',
    name: 'সমস্যা-সমাধান',
    nameEn: 'Problem-Solution',
    description: 'সমস্যা এবং সমাধান দেখান',
    descriptionEn: 'Show problems and solutions',
    icon: 'AlertCircle',
    schema: ProblemSolutionPropsSchema,
    defaultProps: ProblemSolutionPropsSchema.parse({}),
  },
  'pricing': {
    type: 'pricing',
    name: 'প্রাইসিং',
    nameEn: 'Pricing',
    description: 'প্যাকেজ ও মূল্য',
    descriptionEn: 'Packages and pricing',
    icon: 'Tag',
    schema: PricingPropsSchema,
    defaultProps: PricingPropsSchema.parse({}),
  },
  'how-to-order': {
    type: 'how-to-order',
    name: 'অর্ডার প্রক্রিয়া',
    nameEn: 'How to Order',
    description: 'অর্ডার করার নিয়মাবলী',
    descriptionEn: 'Ordering instructions',
    icon: 'ListOrdered',
    schema: HowToOrderPropsSchema,
    defaultProps: HowToOrderPropsSchema.parse({}),
  },
  'showcase': {
    type: 'showcase',
    name: 'প্রোডাক্ট ডিটেইলস',
    nameEn: 'Product Details',
    description: 'প্রোডাক্টের বিস্তারিত (একক)',
    descriptionEn: 'Detailed product info (single)',
    icon: 'Box',
    schema: ShowcasePropsSchema,
    defaultProps: ShowcasePropsSchema.parse({}),
  },
  'product-grid': {
    type: 'product-grid',
    name: 'প্রোডাক্ট গ্রিড',
    nameEn: 'Product Grid',
    description: 'একাধিক প্রোডাক্ট প্রদর্শন',
    descriptionEn: 'Multi-product showcase grid',
    icon: 'LayoutGrid',
    schema: ProductGridPropsSchema,
    defaultProps: ProductGridPropsSchema.parse({}),
  },
  'custom-html': {
    type: 'custom-html',
    name: 'কাস্টম HTML',
    nameEn: 'Custom HTML',
    description: 'নিজের ডিজাইন ইম্পোর্ট করুন',
    descriptionEn: 'Import your own HTML design',
    icon: 'Code',
    schema: CustomHtmlPropsSchema,
    defaultProps: CustomHtmlPropsSchema.parse({}),
  },
  'order-button': {
    type: 'order-button',
    name: 'অর্ডার বাটন',
    nameEn: 'Order Button',
    description: 'যেকোনো জায়গায় অর্ডার বাটন',
    descriptionEn: 'Placeable order button',
    icon: 'ShoppingCart',
    schema: OrderButtonPropsSchema,
    defaultProps: OrderButtonPropsSchema.parse({}),
  },
  'header': {
    type: 'header',
    name: 'হেডার',
    nameEn: 'Header',
    description: 'পেজের শুরুতে লোগো ও নেভিগেশন',
    descriptionEn: 'Page header with logo and navigation',
    icon: 'LayoutPanelTop',
    schema: HeaderPropsSchema,
    defaultProps: HeaderPropsSchema.parse({}),
  },
  'countdown': {
    type: 'countdown',
    name: 'কাউন্টডাউন',
    nameEn: 'Countdown Timer',
    description: 'অফার শেষ হওয়ার সময় দেখান',
    descriptionEn: 'Show offer expiry countdown',
    icon: 'Timer',
    schema: CountdownPropsSchema,
    defaultProps: CountdownPropsSchema.parse({}),
  },
  'stats': {
    type: 'stats',
    name: 'পরিসংখ্যান',
    nameEn: 'Stats Counter',
    description: 'সন্তুষ্ট গ্রাহক ও অর্ডার সংখ্যা',
    descriptionEn: 'Animated statistics counters',
    icon: 'BarChart3',
    schema: StatsPropsSchema,
    defaultProps: StatsPropsSchema.parse({}),
  },
  'contact': {
    type: 'contact',
    name: 'যোগাযোগ',
    nameEn: 'Contact',
    description: 'ফোন, ঠিকানা ও মেসেজ ফর্ম',
    descriptionEn: 'Phone, address and message form',
    icon: 'MessageCircle',
    schema: ContactPropsSchema,
    defaultProps: ContactPropsSchema.parse({}),
  },
  'footer': {
    type: 'footer',
    name: 'ফুটার',
    nameEn: 'Footer',
    description: 'পেজের শেষে যোগাযোগ ও সোশ্যাল লিংক',
    descriptionEn: 'Contact info and social links',
    icon: 'LayoutGrid',
    schema: FooterPropsSchema,
    defaultProps: FooterPropsSchema.parse({}),
  },
  'social-proof': {
    type: 'social-proof',
    name: 'সোশ্যাল প্রুফ',
    nameEn: 'Social Proof',
    description: 'বিশ্বাসযোগ্যতা বাড়াতে সোশ্যাল প্রুফ',
    descriptionEn: 'Social proof for credibility',
    icon: 'Users',
    schema: StatsPropsSchema, // Reuse stats schema
    defaultProps: { count: 1000, text: 'সন্তুষ্ট গ্রাহক' },
  },
  'newsletter': {
    type: 'newsletter',
    name: 'নিউজলেটার',
    nameEn: 'Newsletter',
    description: 'ইমেইল সাবস্ক্রিপশন ফর্ম',
    descriptionEn: 'Email subscription form',
    icon: 'Mail',
    schema: CTAPropsSchema, // Reuse CTA schema
    defaultProps: { title: 'সাবস্ক্রাইব করুন', buttonText: 'সাবস্ক্রাইব' },
  },
  'order-form': {
    type: 'order-form',
    name: 'অর্ডার ফর্ম',
    nameEn: 'Order Form',
    description: 'পণ্য অর্ডার করার ফর্ম',
    descriptionEn: 'Product order form',
    icon: 'ShoppingCart',
    schema: CTAPropsSchema,
    defaultProps: { title: 'এখনই অর্ডার করুন', buttonText: 'অর্ডার করুন' },
  },
  'product-header': {
    type: 'product-header',
    name: 'প্রোডাক্ট হেডার',
    nameEn: 'Product Header',
    description: 'প্রোডাক্ট পেজের হেডার',
    descriptionEn: 'Product page header',
    icon: 'Package',
    schema: HeroPropsSchema,
    defaultProps: {},
  },
  'product-gallery': {
    type: 'product-gallery',
    name: 'প্রোডাক্ট গ্যালারি',
    nameEn: 'Product Gallery',
    description: 'প্রোডাক্ট ইমেজ গ্যালারি',
    descriptionEn: 'Product image gallery',
    icon: 'Images',
    schema: GalleryPropsSchema,
    defaultProps: GalleryPropsSchema.parse({}),
  },
  'product-info': {
    type: 'product-info',
    name: 'প্রোডাক্ট ইনফো',
    nameEn: 'Product Info',
    description: 'প্রোডাক্ট তথ্য',
    descriptionEn: 'Product information',
    icon: 'Info',
    schema: FeaturesPropsSchema,
    defaultProps: {},
  },
  'product-description': {
    type: 'product-description',
    name: 'প্রোডাক্ট বিবরণ',
    nameEn: 'Product Description',
    description: 'প্রোডাক্ট বিস্তারিত বিবরণ',
    descriptionEn: 'Product detailed description',
    icon: 'FileText',
    schema: CustomHtmlPropsSchema,
    defaultProps: {},
  },
  'related-products': {
    type: 'related-products',
    name: 'সম্পর্কিত প্রোডাক্ট',
    nameEn: 'Related Products',
    description: 'সম্পর্কিত প্রোডাক্ট দেখান',
    descriptionEn: 'Show related products',
    icon: 'Grid3x3',
    schema: ProductGridPropsSchema,
    defaultProps: ProductGridPropsSchema.parse({}),
  },
  'collection-header': {
    type: 'collection-header',
    name: 'কালেকশন হেডার',
    nameEn: 'Collection Header',
    description: 'কালেকশন পেজের হেডার',
    descriptionEn: 'Collection page header',
    icon: 'FolderOpen',
    schema: HeroPropsSchema,
    defaultProps: {},
  },
  'cart-items': {
    type: 'cart-items',
    name: 'কার্ট আইটেম',
    nameEn: 'Cart Items',
    description: 'কার্টে থাকা আইটেম',
    descriptionEn: 'Items in cart',
    icon: 'ShoppingBag',
    schema: ProductGridPropsSchema,
    defaultProps: {},
  },
  'cart-summary': {
    type: 'cart-summary',
    name: 'কার্ট সামারি',
    nameEn: 'Cart Summary',
    description: 'কার্ট সারসংক্ষেপ',
    descriptionEn: 'Cart summary',
    icon: 'Receipt',
    schema: PricingPropsSchema,
    defaultProps: {},
  },
  'rich-text': {
    type: 'rich-text',
    name: 'রিচ টেক্সট',
    nameEn: 'Rich Text',
    description: 'ফর্ম্যাটেড টেক্সট কন্টেন্ট',
    descriptionEn: 'Formatted text content',
    icon: 'Type',
    schema: CustomHtmlPropsSchema,
    defaultProps: { content: '' },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all section types as an array.
 */
export function getAllSectionTypes(): SectionType[] {
  return Object.keys(SECTION_REGISTRY) as SectionType[];
}

/**
 * Get section metadata by type.
 */
export function getSectionMeta(type: SectionType | string): SectionMeta | null {
  const definition = SECTION_REGISTRY[type as SectionType];
  if (!definition) return null;
  
  return {
    type: definition.type,
    name: definition.name,
    nameEn: definition.nameEn,
    description: definition.description,
    descriptionEn: definition.descriptionEn,
    icon: definition.icon,
  };
}

/**
 * Get default props for a section type.
 */
export function getDefaultProps(type: SectionType | string): Record<string, unknown> {
  const definition = SECTION_REGISTRY[type as SectionType];
  return definition?.defaultProps ?? {};
}

/**
 * Check if a section type is valid.
 */
export function isValidSectionType(type: string): type is SectionType {
  return type in SECTION_REGISTRY;
}

/**
 * Validate and parse section props.
 * Re-export from schemas for convenience.
 */
export { validateSectionProps };

// ============================================================================
// DEFAULT SECTION ORDER
// ============================================================================

/**
 * Default order for new pages.
 * Core sections that most landing pages need.
 */
export const DEFAULT_SECTION_ORDER: SectionType[] = [
  'hero',
  'trust-badges',
  'features',
  'benefits',
  'testimonials',
  'faq',
  'cta',
];

/**
 * All available sections for the "Add Section" modal.
 */
export const AVAILABLE_SECTIONS: SectionMeta[] = getAllSectionTypes().map(type => getSectionMeta(type)!);
