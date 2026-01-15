import type { SectionProps } from '../_core/types';
import { Hero } from './Hero';
import { TrustBadges } from './TrustBadges';
import { ProblemSolution } from './ProblemSolution';
import { Benefits } from './Benefits';
import { ProductShowcase } from './ProductShowcase';
import { SocialProof } from './SocialProof';
import { Pricing } from './Pricing';
import { OrderForm } from './OrderForm';
import { HowToOrder } from './HowToOrder';
import { FAQ } from './FAQ';
import { SectionWrapper, getSectionDisplayName } from '../_core/SectionWrapper';

// Map section IDs into components
const SECTIONS: Record<string, React.FC<SectionProps>> = {
  hero: Hero,
  features: TrustBadges, 
  trust: TrustBadges, // Alias
  'problem-solution': ProblemSolution,
  benefits: Benefits,
  showcase: ProductShowcase,
  gallery: ProductShowcase, // Alias
  testimonials: SocialProof,
  social: SocialProof, // Alias
  pricing: Pricing,
  'order-form': OrderForm,
  cta: OrderForm, // Alias
  'how-to-order': HowToOrder,
  faq: FAQ,
  delivery: TrustBadges, // Alias (since it has delivery info)
  guarantee: TrustBadges // Alias
};

// Also export individual components for direct usage if needed
export {
  Hero,
  TrustBadges,
  ProblemSolution,
  Benefits,
  ProductShowcase,
  SocialProof,
  Pricing,
  OrderForm,
  HowToOrder,
  FAQ
};

interface QuickStartSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections: string[];
  selectedSection?: string | null;
}

export function QuickStartSectionRenderer({ 
  sectionOrder, 
  hiddenSections, 
  selectedSection,
  ...props 
}: QuickStartSectionRendererProps) {
  // If no specific order is provided, use a default order
  const effectiveOrder = sectionOrder && sectionOrder.length > 0
    ? sectionOrder
    : [
        'hero',
        'features', // Trust Badges
        'problem-solution',
        'benefits',
        'showcase',
        'testimonials', // Social Proof
        'pricing',
        'order-form',
        'how-to-order',
        'faq'
      ];

  // Filter visible sections
  const visibleSections = effectiveOrder.filter(id => !hiddenSections.includes(id));

  return (
    <div className="flex flex-col">
      {visibleSections.map((sectionId, index) => {
        const Component = SECTIONS[sectionId];
        
        // Handle mapped components
        if (!Component) {
            if (sectionId === 'features') {
              const sectionNames = getSectionDisplayName(sectionId);
              return (
                <SectionWrapper
                  key={sectionId}
                  sectionId={sectionId}
                  sectionName={sectionNames.name}
                  sectionNameEn={sectionNames.nameEn}
                  isPreview={props.isPreview}
                  isSelected={selectedSection === sectionId}
                  canMoveUp={index > 0}
                  canMoveDown={index < visibleSections.length - 1}
                  lang={props.config.landingLanguage || 'bn'}
                >
                  <TrustBadges {...props} />
                </SectionWrapper>
              );
            }
            if (sectionId === 'testimonials') {
              const sectionNames = getSectionDisplayName(sectionId);
              return (
                <SectionWrapper
                  key={sectionId}
                  sectionId={sectionId}
                  sectionName={sectionNames.name}
                  sectionNameEn={sectionNames.nameEn}
                  isPreview={props.isPreview}
                  isSelected={selectedSection === sectionId}
                  canMoveUp={index > 0}
                  canMoveDown={index < visibleSections.length - 1}
                  lang={props.config.landingLanguage || 'bn'}
                >
                  <SocialProof {...props} />
                </SectionWrapper>
              );
            }
            return null;
        }

        const sectionNames = getSectionDisplayName(sectionId);

        return (
          <SectionWrapper
            key={sectionId}
            sectionId={sectionId}
            sectionName={sectionNames.name}
            sectionNameEn={sectionNames.nameEn}
            isPreview={props.isPreview}
            isSelected={selectedSection === sectionId}
            canMoveUp={index > 0}
            canMoveDown={index < visibleSections.length - 1}
            lang={props.config.landingLanguage || 'bn'}
          >
            <Component {...props} />
          </SectionWrapper>
        );
      })}
    </div>
  );
}

