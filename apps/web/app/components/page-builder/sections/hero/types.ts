/**
 * Hero Section Types
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export type HeroVariant = 
  | 'default' 
  | 'centered'
  | 'split-left'
  | 'split-right'
  | 'glow' 
  | 'modern'
  | 'glassmorphism'
  | 'neubrutalism'
  | 'bento'
  | 'trust-first'
  | 'story-driven'
  | 'story-driven-premium'
  | 'urgency'
  | 'social-proof'
  | 'organic';

export interface HeroProps extends SectionStyleProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  badgeText?: string;
  backgroundImage?: string;
  variant?: HeroVariant;
}

export interface HeroSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface BaseHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  backgroundImage?: string;
  primaryColor?: string;
  accentColor?: string;
}
