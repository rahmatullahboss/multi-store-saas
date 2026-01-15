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
import { SectionWrapper, getSectionDisplayName } from '../_core/SectionWrapper';

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
  selectedSection?: string | null;
}

export function PremiumBDSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: PremiumBDSectionRendererProps) {
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
