/**
 * Flash Sale Section Renderer
 * 
 * Renders sections in order, completely isolated from other templates.
 */

import { FlashSaleHero } from './Hero';
import { FlashSaleFeatures } from './Features';
import { FlashSaleTestimonials } from './Testimonials';
import { FlashSaleGallery } from './Gallery';
import { FlashSaleFAQ } from './FAQ';
import { FlashSaleOrderForm } from './OrderForm';
import { FlashSaleTrust } from './Trust';
import { FlashSaleVideo } from './Video';
import { FlashSaleBenefits } from './Benefits';
import { FlashSaleComparison } from './Comparison';
import { FlashSaleSocialProof } from './SocialProof';
import { FlashSaleDeliveryInfo } from './DeliveryInfo';
import { FlashSaleGuarantee } from './Guarantee';
// New Components
import { FlashSaleProblemSolution } from './ProblemSolution';
import { FlashSaleHowToOrder } from './HowToOrder';
import { FlashSaleShowcase } from './Showcase';
import { FlashSalePricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName } from '../_core/SectionWrapper';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: FlashSaleHero,
  trust: FlashSaleTrust,
  features: FlashSaleFeatures,
  gallery: FlashSaleGallery,
  video: FlashSaleVideo,
  benefits: FlashSaleBenefits,
  comparison: FlashSaleComparison,
  testimonials: FlashSaleTestimonials,
  social: FlashSaleSocialProof,
  delivery: FlashSaleDeliveryInfo,
  faq: FlashSaleFAQ,
  guarantee: FlashSaleGuarantee,
  'order-form': FlashSaleOrderForm,
  cta: FlashSaleOrderForm,
  // New Sections
  'problem-solution': FlashSaleProblemSolution,
  showcase: FlashSaleShowcase,
  pricing: FlashSalePricing,
  'how-to-order': FlashSaleHowToOrder,
};

interface FlashSaleSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function FlashSaleSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: FlashSaleSectionRendererProps) {
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

