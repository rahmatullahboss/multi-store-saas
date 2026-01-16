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
    description: 'প্রোডাক্টের বিস্তারিত',
    descriptionEn: 'Detailed product info',
    icon: 'Box',
    schema: ShowcasePropsSchema,
    defaultProps: ShowcasePropsSchema.parse({}),
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
