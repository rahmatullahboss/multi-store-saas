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
}

export function QuickStartSectionRenderer({ 
  sectionOrder, 
  hiddenSections, 
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

  return (
    <div className="flex flex-col">
      {effectiveOrder.map((sectionId) => {
        if (hiddenSections.includes(sectionId)) return null;

        const Component = SECTIONS[sectionId];
        
        // Handle mapped components (e.g. if user adds 'custom-section', we might not have it)
        if (!Component) {
            // Check for aliases or fallbacks
            if (sectionId === 'features') return <TrustBadges key={sectionId} {...props} />;
            if (sectionId === 'testimonials') return <SocialProof key={sectionId} {...props} />;
            return null;
        }

        return <Component key={sectionId} {...props} />;
      })}
    </div>
  );
}
