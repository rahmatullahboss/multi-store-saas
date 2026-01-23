/**
 * Trust Badges Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { TrustBadgesProps, TrustBadgesSectionPreviewProps, Badge } from './types';

import { GridTrustBadges } from './GridTrustBadges';
import { MarqueeTrustBadges } from './MarqueeTrustBadges';
import { GlassmorphismTrustBadges } from './GlassmorphismTrustBadges';
import { NeubrutalistTrustBadges } from './NeubrutalistTrustBadges';
import { TrustFirstTrustBadges } from './TrustFirstTrustBadges';
import { UrgencyTrustBadges } from './UrgencyTrustBadges';

export type TrustBadgesVariant = 
  | 'grid' 
  | 'marquee'
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'trust-first'
  | 'urgency';

export function TrustBadgesSectionPreview({ props, theme }: TrustBadgesSectionPreviewProps) {
  const {
    title = '',
    badges = [],
    variant = 'grid',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as TrustBadgesProps & { variant?: TrustBadgesVariant };

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
    badges: badges as Badge[],
    theme,
    styleProps,
  };

  switch (variant) {
    case 'marquee':
      return <MarqueeTrustBadges {...commonProps} />;
    case 'glassmorphism':
      return <GlassmorphismTrustBadges {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistTrustBadges {...commonProps} />;
    case 'trust-first':
      return <TrustFirstTrustBadges {...commonProps} />;
    case 'urgency':
      return <UrgencyTrustBadges {...commonProps} />;
    case 'grid':
    default:
      return <GridTrustBadges {...commonProps} />;
  }
}

export type { TrustBadgesProps, TrustBadgesSectionPreviewProps, Badge };
