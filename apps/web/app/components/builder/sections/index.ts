/**
 * Builder Section Components — Central Export
 *
 * Each component accepts:
 *   { props: Record<string, unknown>; isPreview?: boolean }
 *
 * The SECTION_COMPONENTS map is used by the preview renderer to resolve
 * a section type string → React component.
 */

import type { ComponentType } from 'react';

export { HeroSection } from './HeroSection';
export { FeaturesSection } from './FeaturesSection';
export { TestimonialsSection } from './TestimonialsSection';
export { FAQSection } from './FAQSection';
export { CTASection } from './CTASection';
export { TrustBadgesSection } from './TrustBadgesSection';
export { BenefitsSection } from './BenefitsSection';
export { FooterSection } from './FooterSection';
export { CountdownSection } from './CountdownSection';
export { PricingSection } from './PricingSection';
export { SocialProofSection } from './SocialProofSection';
export { StatsSection } from './StatsSection';
export { HeaderSection } from './HeaderSection';
export { GallerySection } from './GallerySection';
export { VideoSection } from './VideoSection';
export { HowToOrderSection } from './HowToOrderSection';
export { ComparisonSection } from './ComparisonSection';
export { ProductGridSection } from './ProductGridSection';

import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { TrustBadgesSection } from './TrustBadgesSection';
import { BenefitsSection } from './BenefitsSection';
import { FooterSection } from './FooterSection';
import { CountdownSection } from './CountdownSection';
import { PricingSection } from './PricingSection';
import { SocialProofSection } from './SocialProofSection';
import { StatsSection } from './StatsSection';
import { HeaderSection } from './HeaderSection';
import { GallerySection } from './GallerySection';
import { VideoSection } from './VideoSection';
import { HowToOrderSection } from './HowToOrderSection';
import { ComparisonSection } from './ComparisonSection';
import { ProductGridSection } from './ProductGridSection';

/**
 * Shared section component prop type.
 * Every section component must conform to this interface.
 */
export interface SectionComponentProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

/**
 * Map from section type string → React component.
 *
 * Used by the preview iframe renderer:
 *
 * ```tsx
 * const Component = SECTION_COMPONENTS[section.type];
 * if (Component) return <Component props={section.props} isPreview />;
 * ```
 */
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionComponentProps>> = {
  // Core landing page sections
  hero: HeroSection,
  features: FeaturesSection,
  testimonials: TestimonialsSection,
  faq: FAQSection,
  cta: CTASection,
  'order-form': CTASection,     // alias
  'trust-badges': TrustBadgesSection,
  trust: TrustBadgesSection,    // alias
  benefits: BenefitsSection,
  footer: FooterSection,
  countdown: CountdownSection,
  pricing: PricingSection,

  // Social proof / stats
  'social-proof': SocialProofSection,
  social: StatsSection,         // legacy alias → stats style
  stats: StatsSection,

  // New sections
  header: HeaderSection,
  gallery: GallerySection,
  'product-gallery': GallerySection, // alias
  video: VideoSection,
  'how-to-order': HowToOrderSection,
  comparison: ComparisonSection,
  'product-grid': ProductGridSection,
  'related-products': ProductGridSection, // alias
};

/**
 * Resolve a section component by type, with a null fallback.
 *
 * @example
 * const Component = getSectionComponent(section.type);
 * if (!Component) return <UnknownSection type={section.type} />;
 * return <Component props={section.props} isPreview />;
 */
export function getSectionComponent(
  type: string
): ComponentType<SectionComponentProps> | null {
  return SECTION_COMPONENTS[type] ?? null;
}
