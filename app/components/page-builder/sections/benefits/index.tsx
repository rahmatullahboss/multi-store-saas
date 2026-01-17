/**
 * Benefits Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { BenefitsProps, BenefitsSectionPreviewProps, Benefit } from './types';

import { GridBenefits } from './GridBenefits';
import { GlassmorphismBenefits } from './GlassmorphismBenefits';
import { NeubrutalistBenefits } from './NeubrutalistBenefits';
import { TrustFirstBenefits } from './TrustFirstBenefits';
import { UrgencyBenefits } from './UrgencyBenefits';
import { SocialProofBenefits } from './SocialProofBenefits';
import { StoryDrivenBenefits } from './StoryDrivenBenefits';

export type BenefitsVariant = 
  | 'grid' 
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'trust-first'
  | 'urgency'
  | 'social-proof'
  | 'story-driven';

const defaultBenefits: Benefit[] = [
  { icon: '✓', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য' },
  { icon: '✓', title: 'দ্রুত ডেলিভারি', description: 'সারাদেশে দ্রুত পৌঁছে যাবে' },
  { icon: '✓', title: 'মানি ব্যাক গ্যারান্টি', description: 'সন্তুষ্ট না হলে টাকা ফেরত' },
];

export function BenefitsSectionPreview({ props, theme }: BenefitsSectionPreviewProps) {
  const {
    title = 'কেন আমাদের থেকে কিনবেন?',
    subtitle = '',
    benefits = [],
    variant = 'grid',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as BenefitsProps & { variant?: BenefitsVariant };

  const styleProps = {
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  };

  const displayBenefits = (benefits as Benefit[]).length > 0 ? (benefits as Benefit[]) : defaultBenefits;

  const commonProps = {
    title,
    subtitle: subtitle || '',
    benefits: displayBenefits,
    theme,
    styleProps,
  };

  switch (variant) {
    case 'glassmorphism':
      return <GlassmorphismBenefits {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistBenefits {...commonProps} />;
    case 'trust-first':
      return <TrustFirstBenefits {...commonProps} />;
    case 'urgency':
      return <UrgencyBenefits {...commonProps} />;
    case 'social-proof':
      return <SocialProofBenefits {...commonProps} />;
    case 'story-driven':
      return <StoryDrivenBenefits {...commonProps} />;
    case 'grid':
    default:
      return <GridBenefits {...commonProps} />;
  }
}

export type { BenefitsProps, BenefitsSectionPreviewProps, Benefit };
