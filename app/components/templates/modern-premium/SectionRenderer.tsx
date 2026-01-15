/**
 * Modern Premium Section Renderer
 */

import { ModernPremiumHero } from './Hero';
import { ModernPremiumFeatures } from './Features';
import { ModernPremiumTestimonials } from './Testimonials';
import { ModernPremiumGallery } from './Gallery';
import { ModernPremiumFAQ } from './FAQ';
import { ModernPremiumOrderForm } from './OrderForm';
import { ModernPremiumTrust } from './Trust';
import { ModernPremiumVideo } from './Video';
import { ModernPremiumBenefits } from './Benefits';
import { ModernPremiumComparison } from './Comparison';
import { ModernPremiumSocialProof } from './SocialProof';
import { ModernPremiumDeliveryInfo } from './DeliveryInfo';
import { ModernPremiumGuarantee } from './Guarantee';
// New Components
import { ModernPremiumProblemSolution } from './ProblemSolution';
import { ModernPremiumHowToOrder } from './HowToOrder';
import { ModernPremiumShowcase } from './Showcase';
import { ModernPremiumPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: ModernPremiumHero,
  trust: ModernPremiumTrust,
  features: ModernPremiumFeatures,
  gallery: ModernPremiumGallery,
  video: ModernPremiumVideo,
  benefits: ModernPremiumBenefits,
  comparison: ModernPremiumComparison,
  testimonials: ModernPremiumTestimonials,
  social: ModernPremiumSocialProof,
  delivery: ModernPremiumDeliveryInfo,
  faq: ModernPremiumFAQ,
  guarantee: ModernPremiumGuarantee,
  'order-form': ModernPremiumOrderForm,
  cta: ModernPremiumOrderForm,
  // New Sections
  'problem-solution': ModernPremiumProblemSolution,
  showcase: ModernPremiumShowcase,
  pricing: ModernPremiumPricing,
  'how-to-order': ModernPremiumHowToOrder,
};

interface ModernPremiumSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function ModernPremiumSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: ModernPremiumSectionRendererProps) {
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
