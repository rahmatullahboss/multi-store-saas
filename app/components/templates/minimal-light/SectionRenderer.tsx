/**
 * Minimal Light Section Renderer
 */

import { MinimalLightHero } from './Hero';
import { MinimalLightFeatures } from './Features';
import { MinimalLightTestimonials } from './Testimonials';
import { MinimalLightGallery } from './Gallery';
import { MinimalLightFAQ } from './FAQ';
import { MinimalLightOrderForm } from './OrderForm';
import type { SectionProps } from '../_core/types';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: MinimalLightHero,
  features: MinimalLightFeatures,
  testimonials: MinimalLightTestimonials,
  gallery: MinimalLightGallery,
  faq: MinimalLightFAQ,
  'order-form': MinimalLightOrderForm,
  cta: MinimalLightOrderForm,
};

const DEFAULT_ORDER = [
  'hero',
  'features',
  'gallery',
  'testimonials',
  'faq',
  'order-form',
];

interface MinimalLightSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function MinimalLightSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: MinimalLightSectionRendererProps) {
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
