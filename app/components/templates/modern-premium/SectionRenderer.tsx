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
import { SectionWrapper, getSectionDisplayName } from '../_core/SectionWrapper';

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
  selectedSection?: string | null;
}

export function ModernPremiumSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: ModernPremiumSectionRendererProps) {
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;
  const visibleSections = order.filter(sectionId => !hiddenSections.includes(sectionId));

  return (
    <>
      {visibleSections.map((sectionId, index) => {
        const Component = SECTION_COMPONENTS[sectionId];
        if (!Component) return null;
        const sectionNames = getSectionDisplayName(sectionId);
        return (
          <SectionWrapper
            key={sectionId}
            sectionId={sectionId}
            sectionName={sectionNames.name}
            sectionNameEn={sectionNames.nameEn}
            isPreview={props.isPreview}
            isSelected={selectedSection === sectionId}
            canMoveUp={index > 0}
            canMoveDown={index < visibleSections.length - 1}
            lang={props.config.landingLanguage || 'bn'}
          >
            <Component {...props} />
          </SectionWrapper>
        );
      })}
    </>
  );
}
