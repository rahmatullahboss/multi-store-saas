/**
 * Modern Premium Section Renderer
 */

import { ModernPremiumHero } from './Hero';
import { ModernPremiumFeatures } from './Features';
import { ModernPremiumTestimonials } from './Testimonials';
import { ModernPremiumGallery } from './Gallery';
import { ModernPremiumFAQ } from './FAQ';
import { ModernPremiumOrderForm } from './OrderForm';
import type { SectionProps } from '../_core/types';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: ModernPremiumHero,
  features: ModernPremiumFeatures,
  testimonials: ModernPremiumTestimonials,
  gallery: ModernPremiumGallery,
  faq: ModernPremiumFAQ,
  'order-form': ModernPremiumOrderForm,
  cta: ModernPremiumOrderForm,
};

const DEFAULT_ORDER = [
  'hero',
  'features',
  'gallery',
  'testimonials',
  'faq',
  'order-form',
];

interface ModernPremiumSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export function ModernPremiumSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  ...props
}: ModernPremiumSectionRendererProps) {
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
