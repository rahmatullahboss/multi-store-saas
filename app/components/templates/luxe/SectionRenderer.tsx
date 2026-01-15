/**
 * Luxe Section Renderer
 */

import { LuxeHero } from './Hero';
import { LuxeFeatures } from './Features';
import { LuxeTestimonials } from './Testimonials';
import { LuxeGallery } from './Gallery';
import { LuxeFAQ } from './FAQ';
import { LuxeOrderForm } from './OrderForm';
import { LuxeTrust } from './Trust';
import { LuxeVideo } from './Video';
import { LuxeBenefits } from './Benefits';
import { LuxeComparison } from './Comparison';
import { LuxeSocialProof } from './SocialProof';
import { LuxeDeliveryInfo } from './DeliveryInfo';
import { LuxeGuarantee } from './Guarantee';
// New Components
import { LuxeProblemSolution } from './ProblemSolution';
import { LuxeHowToOrder } from './HowToOrder';
import { LuxeShowcase } from './Showcase';
import { LuxePricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName, isRequiredSection } from '../_core/SectionWrapper';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: LuxeHero,
  trust: LuxeTrust,
  features: LuxeFeatures,
  gallery: LuxeGallery,
  video: LuxeVideo,
  benefits: LuxeBenefits,
  comparison: LuxeComparison,
  testimonials: LuxeTestimonials,
  social: LuxeSocialProof,
  delivery: LuxeDeliveryInfo,
  faq: LuxeFAQ,
  guarantee: LuxeGuarantee,
  'order-form': LuxeOrderForm,
  cta: LuxeOrderForm,
  // New Sections
  'problem-solution': LuxeProblemSolution,
  showcase: LuxeShowcase,
  pricing: LuxePricing,
  'how-to-order': LuxeHowToOrder,
};

interface LuxeSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function LuxeSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: LuxeSectionRendererProps) {
  // Use global default order if no custom order is provided
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;

  // Filter out hidden sections
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
