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
import type { SectionProps } from '../_core/types';

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

interface FlashSaleSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function FlashSaleSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: FlashSaleSectionRendererProps) {
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_ORDER;

  // Filter out hidden sections
  const visibleSections = order.filter(sectionId => !hiddenSections.includes(sectionId));

  // Force Hero at top, Order Form at bottom
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
