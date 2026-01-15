/**
 * Modern Premium Section Renderer
 */

import { ModernPremiumHero } from './Hero';
import { ModernPremiumFeatures } from './Features';
import { ModernPremiumTestimonials } from './Testimonials';
import { ModernPremiumGallery } from './Gallery';
import { ModernPremiumFAQ } from './FAQ';
import { ModernPremiumOrderForm } from './OrderForm';
import { ModernPremiumTrust } from './Trust';
import { ModernPremiumVideo } from './Video';
import { ModernPremiumBenefits } from './Benefits';
import { ModernPremiumComparison } from './Comparison';
import { ModernPremiumSocialProof } from './SocialProof';
import { ModernPremiumDeliveryInfo } from './DeliveryInfo';
import { ModernPremiumGuarantee } from './Guarantee';
import type { SectionProps } from '../_core/types';

const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: ModernPremiumHero,
  trust: ModernPremiumTrust,
  features: ModernPremiumFeatures,
  gallery: ModernPremiumGallery,
  video: ModernPremiumVideo,
  benefits: ModernPremiumBenefits,
  comparison: ModernPremiumComparison,
  testimonials: ModernPremiumTestimonials,
  social: ModernPremiumSocialProof,
  delivery: ModernPremiumDeliveryInfo,
  faq: ModernPremiumFAQ,
  guarantee: ModernPremiumGuarantee,
  'order-form': ModernPremiumOrderForm,
  cta: ModernPremiumOrderForm,
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
