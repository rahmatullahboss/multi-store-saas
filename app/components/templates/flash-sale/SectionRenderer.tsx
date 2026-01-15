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
import type { SectionProps } from '../_core/types';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: FlashSaleHero,
  features: FlashSaleFeatures,
  testimonials: FlashSaleTestimonials,
  gallery: FlashSaleGallery,
  faq: FlashSaleFAQ,
  'order-form': FlashSaleOrderForm,
  cta: FlashSaleOrderForm,
};

const DEFAULT_ORDER = [
  'hero',
  'features',
  'gallery',
  'testimonials',
  'faq',
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
