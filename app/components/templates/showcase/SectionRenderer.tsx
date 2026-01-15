/**
 * Showcase Section Renderer
 */

import { ShowcaseHero } from './Hero';
import { ShowcaseFeatures } from './Features';
import { ShowcaseTestimonials } from './Testimonials';
import { ShowcaseGallery } from './Gallery';
import { ShowcaseFAQ } from './FAQ';
import { ShowcaseOrderForm } from './OrderForm';
import { ShowcaseTrust } from './Trust';
import { ShowcaseVideo } from './Video';
import { ShowcaseBenefits } from './Benefits';
import { ShowcaseComparison } from './Comparison';
import { ShowcaseSocialProof } from './SocialProof';
import { ShowcaseDeliveryInfo } from './DeliveryInfo';
import { ShowcaseGuarantee } from './Guarantee';
// New Components
import { ShowcaseProblemSolution } from './ProblemSolution';
import { ShowcaseHowToOrder } from './HowToOrder';
import { ShowcaseShowcase } from './Showcase';
import { ShowcasePricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: ShowcaseHero,
  trust: ShowcaseTrust,
  features: ShowcaseFeatures,
  gallery: ShowcaseGallery,
  video: ShowcaseVideo,
  benefits: ShowcaseBenefits,
  comparison: ShowcaseComparison,
  testimonials: ShowcaseTestimonials,
  social: ShowcaseSocialProof,
  delivery: ShowcaseDeliveryInfo,
  faq: ShowcaseFAQ,
  guarantee: ShowcaseGuarantee,
  'order-form': ShowcaseOrderForm,
  cta: ShowcaseOrderForm,
  // New Sections
  'problem-solution': ShowcaseProblemSolution,
  showcase: ShowcaseShowcase,
  pricing: ShowcasePricing,
  'how-to-order': ShowcaseHowToOrder,
};

interface ShowcaseSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function ShowcaseSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: ShowcaseSectionRendererProps) {
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
