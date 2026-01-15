/**
 * Organic Section Renderer
 */

import { OrganicHero } from './Hero';
import { OrganicFeatures } from './Features';
import { OrganicTestimonials } from './Testimonials';
import { OrganicGallery } from './Gallery';
import { OrganicFAQ } from './FAQ';
import { OrganicOrderForm } from './OrderForm';
import { OrganicTrust } from './Trust';
import { OrganicVideo } from './Video';
import { OrganicBenefits } from './Benefits';
import { OrganicComparison } from './Comparison';
import { OrganicSocialProof } from './SocialProof';
import { OrganicDeliveryInfo } from './DeliveryInfo';
import { OrganicGuarantee } from './Guarantee';
// New Components
import { OrganicProblemSolution } from './ProblemSolution';
import { OrganicHowToOrder } from './HowToOrder';
import { OrganicShowcase } from './Showcase';
import { OrganicPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: OrganicHero,
  trust: OrganicTrust,
  features: OrganicFeatures,
  gallery: OrganicGallery,
  video: OrganicVideo,
  benefits: OrganicBenefits,
  comparison: OrganicComparison,
  testimonials: OrganicTestimonials,
  social: OrganicSocialProof,
  delivery: OrganicDeliveryInfo,
  faq: OrganicFAQ,
  guarantee: OrganicGuarantee,
  'order-form': OrganicOrderForm,
  cta: OrganicOrderForm,
  // New Sections
  'problem-solution': OrganicProblemSolution,
  showcase: OrganicShowcase,
  pricing: OrganicPricing,
  'how-to-order': OrganicHowToOrder,
};

interface OrganicSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function OrganicSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: OrganicSectionRendererProps) {
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
