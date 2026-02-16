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
  // Build props that extend SectionStyleProps directly (GuaranteeProps interface)
  const guaranteeProps = {
    ...props,
    theme,
  } as GuaranteeProps;

  // Choose variant based on props or theme
  const variant = props.variant || 'default';

  if (variant === 'story-driven-premium') {
    return <WorldClassGuarantee {...(guaranteeProps as any)} />;
  }

  // Default fallback
  return <DefaultGuarantee {...(guaranteeProps as any)} />;
}

export type { GuaranteeProps, GuaranteeSectionPreviewProps };
