import { HeroSection } from './sections/HeroSection';
import { TrustSection } from './sections/TrustSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { GallerySection } from './sections/GallerySection';
import { VideoSection } from './sections/VideoSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { SocialProofSection } from './sections/SocialProofSection';
import { DeliverySection } from './sections/DeliverySection';
import { FAQSection } from './sections/FAQSection';
import { GuaranteeSection } from './sections/GuaranteeSection';
import { OrderFormSection } from './sections/OrderFormSection';
import { ContactSection } from './sections/ContactSection';
import { ShowcaseHero } from './sections/ShowcaseHero';
import { ShowcaseGalleryGrid } from './sections/ShowcaseGalleryGrid';
import { MobileFirstHero } from './sections/MobileFirstHero';
import { ModernDarkHero } from './sections/ModernDarkHero';
import { VideoFocusHero } from './sections/VideoFocusHero';
import { FlashSaleHero } from './sections/FlashSaleHero';
import { MinimalLightHero } from './sections/MinimalLightHero';
import { OrganicHero } from './sections/OrganicHero';
import { LuxeHero } from './sections/LuxeHero';
import { ModernPremiumHero } from './sections/ModernPremiumHero';
import { PremiumBDHero } from './sections/PremiumBDHero';
import { AddSectionButton } from './AddSectionButton';
import type { SectionProps } from './sections/types';

// Map of section IDs to components
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  trust: TrustSection,
  features: FeaturesSection,
  gallery: GallerySection,
  video: VideoSection,
  benefits: BenefitsSection,
  comparison: ComparisonSection,
  testimonials: TestimonialsSection,
  social: SocialProofSection,
  delivery: DeliverySection,
  faq: FAQSection,
  guarantee: GuaranteeSection,
  cta: OrderFormSection,
  'order-form': OrderFormSection,  // Alias for cta
  contact: ContactSection,
  'showcase-hero': ShowcaseHero,
  'showcase-gallery-grid': ShowcaseGalleryGrid,
  'mobile-first-hero': MobileFirstHero,
  'modern-dark-hero': ModernDarkHero,
  'video-focus-hero': VideoFocusHero,
  'flash-sale-hero': FlashSaleHero,
  'minimal-light-hero': MinimalLightHero,
  'organic-hero': OrganicHero,
  'luxe-hero': LuxeHero,
  'modern-premium-hero': ModernPremiumHero,
  'premium-bd-hero': PremiumBDHero,
};

interface SectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  templateId?: string;
  isPreview?: boolean;
}

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
  'cta',
  'contact',
];

export function SectionRenderer({
  sectionOrder,
  hiddenSections = [],
  templateId,
  isPreview = false,
  ...props
}: SectionRendererProps & { formatPrice: (price: number) => string }) {
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_ORDER;

  // Filter out hidden sections first to get the visible ones
  const visibleSections = order.filter(sectionId => !hiddenSections.includes(sectionId));

  // FORCE ORDERING: Hero at top, Order Form at bottom
  const finalSections = [...visibleSections];
  
  // 1. Ensure Hero is at the top if present
  const heroIndex = finalSections.findIndex(id => id === 'hero' || id.includes('-hero'));
  if (heroIndex > 0) {
    const heroSection = finalSections.splice(heroIndex, 1)[0];
    finalSections.unshift(heroSection);
  }

  // 2. Ensure Order Form is at the bottom if present
  const ctaIndex = finalSections.findIndex(id => id === 'cta' || id === 'order-form');
  if (ctaIndex !== -1 && ctaIndex !== finalSections.length - 1) {
    const ctaSection = finalSections.splice(ctaIndex, 1)[0];
    finalSections.push(ctaSection);
  }

  return (
    <>
      {finalSections.map((sectionId, index) => {
        let Component = SECTION_COMPONENTS[sectionId];

        // Template-specific overrides
        if (sectionId === 'hero') {
          if (templateId === 'modern-dark') Component = ModernDarkHero;
          if (templateId === 'flash-sale') Component = FlashSaleHero;
          if (templateId === 'showcase') Component = ShowcaseHero;
          if (templateId === 'mobile-first') Component = MobileFirstHero;
          if (templateId === 'premium-bd') Component = PremiumBDHero;
          if (templateId === 'video-focus') Component = VideoFocusHero;
          if (templateId === 'minimal-light') Component = MinimalLightHero;
          if (templateId === 'organic') Component = OrganicHero;
          if (templateId === 'luxury') Component = LuxeHero;
          if (templateId === 'modern-premium') Component = ModernPremiumHero;
        }

        if (sectionId === 'gallery' && templateId === 'showcase') {
          Component = ShowcaseGalleryGrid;
        }

        if (!Component) return null;

        return (
          <div key={sectionId}>
            {/* Add button before first section */}
            {index === 0 && isPreview && (
              <AddSectionButton position={`before-${sectionId}`} />
            )}
            
            <Component {...props} templateId={templateId} />
            
            {/* Add button after each section */}
            {isPreview && (
              <AddSectionButton position={`after-${sectionId}`} />
            )}
          </div>
        );
      })}
    </>
  );
}
