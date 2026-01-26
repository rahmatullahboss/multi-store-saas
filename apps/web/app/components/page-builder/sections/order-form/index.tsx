/**
 * Order Form Section - Variant Router
 * Routes to the appropriate order form variant based on props.variant
 */

import type { OrderFormComponentProps } from './types';
import { DefaultOrderForm } from './DefaultOrderForm';
import { GlassmorphismOrderForm } from './GlassmorphismOrderForm';
import { NeubrutalistOrderForm } from './NeubrutalistOrderForm';
import { TrustFirstOrderForm } from './TrustFirstOrderForm';
import { UrgencyOrderForm } from './UrgencyOrderForm';
import { SocialProofOrderForm } from './SocialProofOrderForm';
import { StoryDrivenOrderForm } from './StoryDrivenOrderForm';
import { OrganicOrderForm } from './OrganicOrderForm';

export type { OrderFormVariant, OrderFormProps, OrderFormComponentProps } from './types';

export function OrderFormSection(componentProps: OrderFormComponentProps) {
  const variant = (componentProps.props.variant as string) || 
                  (componentProps.props.styleVariant as string) || 
                  'default';
  
  switch (variant) {
    case 'glassmorphism':
      return <GlassmorphismOrderForm {...componentProps} />;
    
    case 'neubrutalism':
      return <NeubrutalistOrderForm {...componentProps} />;
    
    case 'trust-first':
      return <TrustFirstOrderForm {...componentProps} />;
    
    case 'urgency':
      return <UrgencyOrderForm {...componentProps} />;
    
    case 'social-proof':
      return <SocialProofOrderForm {...componentProps} />;
    
    case 'story-driven':
      return <StoryDrivenOrderForm {...componentProps} />;

    case 'organic':
      return <OrganicOrderForm {...componentProps} />;
    
    case 'default':
    case 'minimal':
    case 'premium':
    default:
      return <DefaultOrderForm {...componentProps} />;
  }
}

// Export individual components for direct use
export { DefaultOrderForm } from './DefaultOrderForm';
export { GlassmorphismOrderForm } from './GlassmorphismOrderForm';
export { NeubrutalistOrderForm } from './NeubrutalistOrderForm';
export { TrustFirstOrderForm } from './TrustFirstOrderForm';
export { UrgencyOrderForm } from './UrgencyOrderForm';
export { SocialProofOrderForm } from './SocialProofOrderForm';
export { StoryDrivenOrderForm } from './StoryDrivenOrderForm';
export { OrganicOrderForm } from './OrganicOrderForm';
