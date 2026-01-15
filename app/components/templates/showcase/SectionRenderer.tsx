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
import { SectionWrapper, getSectionDisplayName, isRequiredSection } from '../_core/SectionWrapper';

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
  selectedSection?: string | null;
}

export function ShowcaseSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: ShowcaseSectionRendererProps) {
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
            isRequired={isRequiredSection(sectionId)}
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
