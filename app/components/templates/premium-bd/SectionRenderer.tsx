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
import type { SectionProps } from '../_core/types';

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

interface PremiumBDSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function PremiumBDSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: PremiumBDSectionRendererProps) {
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
