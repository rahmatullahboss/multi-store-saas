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
import type { SectionProps } from '../_core/types';

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

interface LuxeSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function LuxeSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: LuxeSectionRendererProps) {
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
