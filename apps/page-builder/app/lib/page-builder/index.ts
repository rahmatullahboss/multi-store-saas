/**
 * Page Builder v2 - Main Exports
 */

// Types
export type {
  SectionType,
  BuilderSection,
  BuilderSectionRow,
  BuilderPage,
  BuilderPageRow,
  SectionDefinition,
  SectionMeta,
  BuilderIntent,
  ActionResult,
  EditorState,
  EditorAction,
} from './types';

// Schemas
export {
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
  SectionSchemas,
  validateSectionProps,
} from './schemas';

export type {
  HeroProps,
  FeaturesProps,
  TestimonialsProps,
  FAQProps,
  GalleryProps,
  VideoProps,
  CTAProps,
  TrustBadgesProps,
  BenefitsProps,
  ComparisonProps,
  DeliveryProps,
  GuaranteeProps,
  ProblemSolutionProps,
  PricingProps,
  HowToOrderProps,
  ShowcaseProps,
} from './schemas';

// Registry
export {
  SECTION_REGISTRY,
  getAllSectionTypes,
  getSectionMeta,
  getDefaultProps,
  isValidSectionType,
  DEFAULT_SECTION_ORDER,
  AVAILABLE_SECTIONS,
} from './registry';
