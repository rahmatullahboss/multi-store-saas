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
import type { SectionProps } from '../_core/types';

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

interface MobileFirstSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function MobileFirstSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: MobileFirstSectionRendererProps) {
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
