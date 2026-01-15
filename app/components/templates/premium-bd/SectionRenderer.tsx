/**
 * Premium BD Section Renderer
 */

import { PremiumBDHero } from './Hero';
import { PremiumBDFeatures } from './Features';
import { PremiumBDTestimonials } from './Testimonials';
import { PremiumBDGallery } from './Gallery';
import { PremiumBDFAQ } from './FAQ';
import { PremiumBDOrderForm } from './OrderForm';
import { PremiumBDTrust } from './Trust';
import { PremiumBDVideo } from './Video';
import { PremiumBDBenefits } from './Benefits';
import { PremiumBDComparison } from './Comparison';
import { PremiumBDSocialProof } from './SocialProof';
import { PremiumBDDeliveryInfo } from './DeliveryInfo';
import { PremiumBDGuarantee } from './Guarantee';
// New Components
import { PremiumBDProblemSolution } from './ProblemSolution';
import { PremiumBDHowToOrder } from './HowToOrder';
import { PremiumBDShowcase } from './Showcase';
import { PremiumBDPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: PremiumBDHero,
  trust: PremiumBDTrust,
  features: PremiumBDFeatures,
  gallery: PremiumBDGallery,
  video: PremiumBDVideo,
  benefits: PremiumBDBenefits,
  comparison: PremiumBDComparison,
  testimonials: PremiumBDTestimonials,
  social: PremiumBDSocialProof,
  delivery: PremiumBDDeliveryInfo,
  faq: PremiumBDFAQ,
  guarantee: PremiumBDGuarantee,
  'order-form': PremiumBDOrderForm,
  cta: PremiumBDOrderForm,
  // New Sections
  'problem-solution': PremiumBDProblemSolution,
  showcase: PremiumBDShowcase,
  pricing: PremiumBDPricing,
  'how-to-order': PremiumBDHowToOrder,
};

interface PremiumBDSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function PremiumBDSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: PremiumBDSectionRendererProps) {
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
