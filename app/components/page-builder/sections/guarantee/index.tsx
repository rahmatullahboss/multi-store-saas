/**
 * Guarantee Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { GuaranteeProps, GuaranteeSectionPreviewProps } from './types';

import { DefaultGuarantee } from './DefaultGuarantee';
import { GlassmorphismGuarantee } from './GlassmorphismGuarantee';
import { NeubrutalistGuarantee } from './NeubrutalistGuarantee';
import { TrustFirstGuarantee } from './TrustFirstGuarantee';
import { UrgencyGuarantee } from './UrgencyGuarantee';

export type GuaranteeVariant = 
  | 'default' 
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'trust-first'
  | 'urgency';

export function GuaranteeSectionPreview({ props, theme }: GuaranteeSectionPreviewProps) {
  const {
    title = 'আমাদের গ্যারান্টি',
    text = '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।',
    badgeLabel = '',
    variant = 'default',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as GuaranteeProps & { variant?: GuaranteeVariant };

  const styleProps = {
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  };

  const commonProps = {
    title,
    text,
    badgeLabel,
    theme,
    styleProps,
  };

  switch (variant) {
    case 'glassmorphism':
      return <GlassmorphismGuarantee {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistGuarantee {...commonProps} />;
    case 'trust-first':
      return <TrustFirstGuarantee {...commonProps} />;
    case 'urgency':
      return <UrgencyGuarantee {...commonProps} />;
    case 'default':
    default:
      return <DefaultGuarantee {...commonProps} />;
  }
}

export type { GuaranteeProps, GuaranteeSectionPreviewProps };
