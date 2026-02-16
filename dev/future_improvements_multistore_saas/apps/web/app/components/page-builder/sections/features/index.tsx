/**
 * Features Section - Main Router
 */

import type { FeaturesProps, FeaturesSectionPreviewProps, Feature } from './types';

import { GridFeatures } from './GridFeatures';
import { BentoFeatures } from './BentoFeatures';
import { CardsFeatures } from './CardsFeatures';
import { GlassmorphismFeatures } from './GlassmorphismFeatures';
import { NeubrutalistFeatures } from './NeubrutalistFeatures';
import { TrustFirstFeatures } from './TrustFirstFeatures';
import { UrgencyFeatures } from './UrgencyFeatures';
import { SocialProofFeatures } from './SocialProofFeatures';
import { StoryDrivenFeatures } from './StoryDrivenFeatures';
import { StoryTimelineFeatures } from './StoryTimelineFeatures';
import { OrganicFeatures } from './OrganicFeatures';

export type FeaturesVariant =
  | 'grid'
  | 'bento'
  | 'cards'
  | 'glassmorphism'
  | 'neubrutalism'
  | 'trust-first'
  | 'urgency'
  | 'social-proof'
  | 'story-driven'
  | 'story-driven-premium'
  | 'organic';

export function FeaturesSectionPreview({ props, theme }: FeaturesSectionPreviewProps) {
  const {
    title = 'প্রধান বৈশিষ্ট্যসমূহ',
    features = [],
    variant = 'grid',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as FeaturesProps & { variant?: FeaturesVariant };

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
    features: features as Feature[],
    theme,
    styleProps,
  };

  switch (variant) {
    case 'bento':
      return <BentoFeatures {...commonProps} />;
    case 'cards':
      return <CardsFeatures {...commonProps} />;
    case 'glassmorphism':
      return <GlassmorphismFeatures {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistFeatures {...commonProps} />;
    case 'trust-first':
      return <TrustFirstFeatures {...commonProps} />;
    case 'urgency':
      return <UrgencyFeatures {...commonProps} />;
    case 'social-proof':
      return <SocialProofFeatures {...commonProps} />;
    case 'story-driven':
      return <StoryDrivenFeatures {...commonProps} />;
    case 'story-driven-premium':
      return <StoryTimelineFeatures {...commonProps} />;
    case 'organic':
      return <OrganicFeatures {...commonProps} />;
    case 'grid':
    default:
      return <GridFeatures {...commonProps} />;
  }
}

export type { FeaturesProps, FeaturesSectionPreviewProps, Feature };
