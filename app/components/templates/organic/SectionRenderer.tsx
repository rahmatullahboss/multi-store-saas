/**
 * Organic Section Renderer
 */

import { OrganicHero } from './Hero';
import { OrganicFeatures } from './Features';
import { OrganicTestimonials } from './Testimonials';
import { OrganicGallery } from './Gallery';
import { OrganicFAQ } from './FAQ';
import { OrganicOrderForm } from './OrderForm';
import { OrganicTrust } from './Trust';
import { OrganicVideo } from './Video';
import { OrganicBenefits } from './Benefits';
import { OrganicComparison } from './Comparison';
import { OrganicSocialProof } from './SocialProof';
import { OrganicDeliveryInfo } from './DeliveryInfo';
import { OrganicGuarantee } from './Guarantee';
import type { SectionProps } from '../_core/types';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: OrganicHero,
  trust: OrganicTrust,
  features: OrganicFeatures,
  gallery: OrganicGallery,
  video: OrganicVideo,
  benefits: OrganicBenefits,
  comparison: OrganicComparison,
  testimonials: OrganicTestimonials,
  social: OrganicSocialProof,
  delivery: OrganicDeliveryInfo,
  faq: OrganicFAQ,
  guarantee: OrganicGuarantee,
  'order-form': OrganicOrderForm,
  cta: OrganicOrderForm,
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

interface OrganicSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function OrganicSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: OrganicSectionRendererProps) {
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
