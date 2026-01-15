/**
 * Mobile First Section Renderer
 */

import { MobileFirstHero } from './Hero';
import { MobileFirstFeatures } from './Features';
import { MobileFirstTestimonials } from './Testimonials';
import { MobileFirstGallery } from './Gallery';
import { MobileFirstFAQ } from './FAQ';
import { MobileFirstOrderForm } from './OrderForm';
import { MobileFirstTrust } from './Trust';
import { MobileFirstVideo } from './Video';
import { MobileFirstBenefits } from './Benefits';
import { MobileFirstComparison } from './Comparison';
import { MobileFirstSocialProof } from './SocialProof';
import { MobileFirstDeliveryInfo } from './DeliveryInfo';
import { MobileFirstGuarantee } from './Guarantee';
// New Components
import { MobileFirstProblemSolution } from './ProblemSolution';
import { MobileFirstHowToOrder } from './HowToOrder';
import { MobileFirstShowcase } from './Showcase';
import { MobileFirstPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName } from '../_core/SectionWrapper';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: MobileFirstHero,
  trust: MobileFirstTrust,
  features: MobileFirstFeatures,
  gallery: MobileFirstGallery,
  video: MobileFirstVideo,
  benefits: MobileFirstBenefits,
  comparison: MobileFirstComparison,
  testimonials: MobileFirstTestimonials,
  social: MobileFirstSocialProof,
  delivery: MobileFirstDeliveryInfo,
  faq: MobileFirstFAQ,
  guarantee: MobileFirstGuarantee,
  'order-form': MobileFirstOrderForm,
  cta: MobileFirstOrderForm,
  // New Sections
  'problem-solution': MobileFirstProblemSolution,
  showcase: MobileFirstShowcase,
  pricing: MobileFirstPricing,
  'how-to-order': MobileFirstHowToOrder,
};

interface MobileFirstSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function MobileFirstSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: MobileFirstSectionRendererProps) {
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
