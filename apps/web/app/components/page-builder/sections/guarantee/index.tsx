/**
 * Guarantee Section - Main Router
 */

import type { GuaranteeProps, GuaranteeSectionPreviewProps } from './types';

import { DefaultGuarantee } from './DefaultGuarantee';
import { WorldClassGuarantee } from './WorldClassGuarantee';

export type GuaranteeVariant = 
  | 'default' 
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'trust-first'
  | 'urgency';

export function GuaranteeSectionPreview({ props, theme }: GuaranteeSectionPreviewProps) {
  // Fix: Assign styleProps correctly to satisfy GuaranteeProps if needed, 
  // or just pass props directly if they align.
  // The error was that 'styleProps' is mandatory in GuaranteeVariantProps but missing in the cast.
  // Converting to GuaranteeProps which extends SectionStyleProps directly might be safer.
  
  const commonProps = {
    ...props,
    // Ensure styleProps exists as it is required by GuaranteeProps (which extends SectionStyleProps)
    // If not passed in props, we provide a default object
    styleProps: { theme, ...((props as any).styleProps || {}) },
    theme
  } as GuaranteeProps;
  
  // Choose variant based on props or theme
  const variant = props.variant || 'default';

  if (variant === 'story-driven-premium') {
    return <WorldClassGuarantee {...commonProps} />;
  }

  // Default fallback
  return <DefaultGuarantee {...commonProps} />;
}

export type { GuaranteeProps, GuaranteeSectionPreviewProps };
