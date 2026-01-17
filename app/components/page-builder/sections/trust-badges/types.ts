import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface Badge {
  icon: string;
  text: string;
}

export interface TrustBadgesProps extends SectionStyleProps {
  title?: string;
  badges?: Badge[];
  variant?: string;
}

export interface TrustBadgesSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface TrustBadgesVariantProps {
  title: string;
  badges: Badge[];
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}
