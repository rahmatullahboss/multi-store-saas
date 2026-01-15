/**
 * Modern Dark Section Renderer
 */

import { ModernDarkHero } from './Hero';
import { ModernDarkFeatures } from './Features';
import { ModernDarkTestimonials } from './Testimonials';
import { ModernDarkGallery } from './Gallery';
import { ModernDarkFAQ } from './FAQ';
import { ModernDarkOrderForm } from './OrderForm';
import { ModernDarkTrust } from './Trust';
import { ModernDarkVideo } from './Video';
import { ModernDarkBenefits } from './Benefits';
import { ModernDarkComparison } from './Comparison';
import { ModernDarkSocialProof } from './SocialProof';
import { ModernDarkDeliveryInfo } from './DeliveryInfo';
import { ModernDarkGuarantee } from './Guarantee';
// New Components
import { ModernDarkProblemSolution } from './ProblemSolution';
import { ModernDarkHowToOrder } from './HowToOrder';
import { ModernDarkShowcase } from './Showcase';
import { ModernDarkPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName, isRequiredSection } from '../_core/SectionWrapper';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: ModernDarkHero,
  trust: ModernDarkTrust,
  features: ModernDarkFeatures,
  gallery: ModernDarkGallery,
  video: ModernDarkVideo,
  benefits: ModernDarkBenefits,
  comparison: ModernDarkComparison,
  testimonials: ModernDarkTestimonials,
  social: ModernDarkSocialProof,
  delivery: ModernDarkDeliveryInfo,
  faq: ModernDarkFAQ,
  guarantee: ModernDarkGuarantee,
  'order-form': ModernDarkOrderForm,
  cta: ModernDarkOrderForm,
  // New Sections
  'problem-solution': ModernDarkProblemSolution,
  showcase: ModernDarkShowcase,
  pricing: ModernDarkPricing,
  'how-to-order': ModernDarkHowToOrder,
};

interface ModernDarkSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function ModernDarkSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: ModernDarkSectionRendererProps) {
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

