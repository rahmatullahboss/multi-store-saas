/**
 * Section Renderer Component
 * 
 * Dynamically renders landing page sections based on sectionOrder.
 * This is the core component that enables drag-and-drop reordering.
 */

import type { LandingConfig } from '@db/types';
import type { SerializedProduct } from '~/templates/registry';
import { DEFAULT_SECTION_ORDER } from '~/components/landing-builder';

// Import all section components
import { HeroSection } from './HeroSection';
import { TrustSection } from './TrustSection';
import { VideoSection } from './VideoSection';
import { GallerySection } from './GallerySection';
import { BenefitsSection } from './BenefitsSection';
import { ComparisonSection } from './ComparisonSection';
import { SocialProofSection } from './SocialProofSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FeaturesSection } from './FeaturesSection';
import { DeliverySection } from './DeliverySection';
import { FaqSection } from './FaqSection';
import { GuaranteeSection } from './GuaranteeSection';
import { WhyBuySection } from './WhyBuySection';

// Section component registry
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  trust: TrustSection,
  video: VideoSection,
  gallery: GallerySection,
  benefits: BenefitsSection,
  comparison: ComparisonSection,
  social: SocialProofSection,
  testimonials: TestimonialsSection,
  features: FeaturesSection,
  delivery: DeliverySection,
  faq: FaqSection,
  guarantee: GuaranteeSection,
  // 'cta' is handled separately (order form needs special handling)
};

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export interface SectionRendererProps {
  config: LandingConfig;
  product: SerializedProduct;
  storeName: string;
  currency: string;
  isPreview?: boolean;
  isEditMode?: boolean;
  discount?: number;
  // CTA section is rendered separately by the template
  // because it needs form state management
  excludeCta?: boolean;
  // Optional: render WhyBuy section (some templates may want it)
  includeWhyBuy?: boolean;
}

export function SectionRenderer({
  config,
  product,
  storeName,
  currency,
  isPreview = false,
  isEditMode = false,
  discount = 0,
  excludeCta = true,
  includeWhyBuy = true,
}: SectionRendererProps) {
  // Get section order, fallback to default
  const sectionOrder = config.sectionOrder?.length > 0 
    ? config.sectionOrder 
    : DEFAULT_SECTION_ORDER;
  
  const hiddenSections = config.hiddenSections || [];

  // Common props passed to all sections
  const baseProps = {
    config,
    product,
    storeName,
    currency,
    isPreview,
    isEditMode,
  };

  return (
    <>
      {sectionOrder.map((sectionId) => {
        // Skip hidden sections
        if (!isSectionVisible(sectionId, hiddenSections)) {
          return null;
        }

        // Skip CTA if excluded (handled separately)
        if (sectionId === 'cta' && excludeCta) {
          return null;
        }

        // Get the component for this section
        const SectionComponent = SECTION_COMPONENTS[sectionId];
        
        if (!SectionComponent) {
          // Unknown section ID, skip
          return null;
        }

        // Special props for specific sections
        const extraProps: Record<string, any> = {};
        if (sectionId === 'hero') {
          extraProps.discount = discount;
        }

        return (
          <SectionComponent
            key={sectionId}
            {...baseProps}
            {...extraProps}
          />
        );
      })}

      {/* WhyBuy section (not in standard section order, but common in templates) */}
      {includeWhyBuy && (
        <WhyBuySection {...baseProps} />
      )}
    </>
  );
}

// Export individual sections for direct use
export {
  HeroSection,
  TrustSection,
  VideoSection,
  GallerySection,
  BenefitsSection,
  ComparisonSection,
  SocialProofSection,
  TestimonialsSection,
  FeaturesSection,
  DeliverySection,
  FaqSection,
  GuaranteeSection,
  WhyBuySection,
};
