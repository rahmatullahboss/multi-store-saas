/**
 * Minimal Light Section Renderer
 */

import { MinimalLightHero } from './Hero';
import { MinimalLightFeatures } from './Features';
import { MinimalLightTestimonials } from './Testimonials';
import { MinimalLightGallery } from './Gallery';
import { MinimalLightFAQ } from './FAQ';
import { MinimalLightOrderForm } from './OrderForm';
import { MinimalLightTrust } from './Trust';
import { MinimalLightVideo } from './Video';
import { MinimalLightBenefits } from './Benefits';
import { MinimalLightComparison } from './Comparison';
import { MinimalLightSocialProof } from './SocialProof';
import { MinimalLightDeliveryInfo } from './DeliveryInfo';
import { MinimalLightGuarantee } from './Guarantee';
// New Components
import { MinimalLightProblemSolution } from './ProblemSolution';
import { MinimalLightHowToOrder } from './HowToOrder';
import { MinimalLightShowcase } from './Showcase';
import { MinimalLightPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: MinimalLightHero,
  trust: MinimalLightTrust,
  features: MinimalLightFeatures,
  gallery: MinimalLightGallery,
  video: MinimalLightVideo,
  benefits: MinimalLightBenefits,
  comparison: MinimalLightComparison,
  testimonials: MinimalLightTestimonials,
  social: MinimalLightSocialProof,
  delivery: MinimalLightDeliveryInfo,
  faq: MinimalLightFAQ,
  guarantee: MinimalLightGuarantee,
  'order-form': MinimalLightOrderForm,
  cta: MinimalLightOrderForm,
  // New Sections
  'problem-solution': MinimalLightProblemSolution,
  showcase: MinimalLightShowcase,
  pricing: MinimalLightPricing,
  'how-to-order': MinimalLightHowToOrder,
};

interface MinimalLightSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function MinimalLightSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: MinimalLightSectionRendererProps) {
  // Use global default order if no custom order is provided
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;

  // Filter out hidden sections
  const visibleSections = order.filter(sectionId => !hiddenSections.includes(sectionId));

  return (
    <>
      {visibleSections.map((sectionId) => {
        const Component = SECTION_COMPONENTS[sectionId];
        if (!Component) return null;

        return <Component key={sectionId} {...props} />;
      })}
    </>
  );
}
