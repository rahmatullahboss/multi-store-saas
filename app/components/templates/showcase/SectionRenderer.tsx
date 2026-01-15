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
import type { SectionProps } from '../_core/types';

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

interface ShowcaseSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function ShowcaseSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: ShowcaseSectionRendererProps) {
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
