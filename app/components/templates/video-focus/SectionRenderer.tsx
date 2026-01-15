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
import type { SectionProps } from '../_core/types';

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
};

const DEFAULT_ORDER = [
  'hero',
  'trust',
  'features',
  'gallery',
  'video',
  'benefits',
  'comparison',
  'testimonials',
  'social',
  'delivery',
  'faq',
  'guarantee',
  'order-form',
];

interface VideoFocusSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function VideoFocusSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: VideoFocusSectionRendererProps) {
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_ORDER;
  const visibleSections = order.filter(sectionId => !hiddenSections.includes(sectionId));

  const finalSections = [...visibleSections];
  
  const heroIndex = finalSections.findIndex(id => id === 'hero');
  if (heroIndex > 0) {
    const heroSection = finalSections.splice(heroIndex, 1)[0];
    finalSections.unshift(heroSection);
  }

  const ctaIndex = finalSections.findIndex(id => id === 'cta' || id === 'order-form');
  if (ctaIndex !== -1 && ctaIndex !== finalSections.length - 1) {
    const ctaSection = finalSections.splice(ctaIndex, 1)[0];
    finalSections.push(ctaSection);
  }

  return (
    <>
      {finalSections.map((sectionId) => {
        const Component = SECTION_COMPONENTS[sectionId];
        if (!Component) return null;
        return <Component key={sectionId} {...props} />;
      })}
    </>
  );
}
