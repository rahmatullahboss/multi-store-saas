/**
 * Video Focus Section Renderer
 */

import { VideoFocusHero } from './Hero';
import { VideoFocusFeatures } from './Features';
import { VideoFocusTestimonials } from './Testimonials';
import { VideoFocusGallery } from './Gallery';
import { VideoFocusFAQ } from './FAQ';
import { VideoFocusOrderForm } from './OrderForm';
import { VideoFocusTrust } from './Trust';
import { VideoFocusVideo } from './Video';
import { VideoFocusBenefits } from './Benefits';
import { VideoFocusComparison } from './Comparison';
import { VideoFocusSocialProof } from './SocialProof';
import { VideoFocusDeliveryInfo } from './DeliveryInfo';
import { VideoFocusGuarantee } from './Guarantee';
// New Components
import { VideoFocusProblemSolution } from './ProblemSolution';
import { VideoFocusHowToOrder } from './HowToOrder';
import { VideoFocusShowcase } from './Showcase';
import { VideoFocusPricing } from './Pricing';

import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName, isRequiredSection } from '../_core/SectionWrapper';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: VideoFocusHero,
  trust: VideoFocusTrust,
  features: VideoFocusFeatures,
  gallery: VideoFocusGallery,
  video: VideoFocusVideo,
  benefits: VideoFocusBenefits,
  comparison: VideoFocusComparison,
  testimonials: VideoFocusTestimonials,
  social: VideoFocusSocialProof,
  delivery: VideoFocusDeliveryInfo,
  faq: VideoFocusFAQ,
  guarantee: VideoFocusGuarantee,
  'order-form': VideoFocusOrderForm,
  cta: VideoFocusOrderForm,
  // New Sections
  'problem-solution': VideoFocusProblemSolution,
  showcase: VideoFocusShowcase,
  pricing: VideoFocusPricing,
  'how-to-order': VideoFocusHowToOrder,
};

interface VideoFocusSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function VideoFocusSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: VideoFocusSectionRendererProps) {
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
