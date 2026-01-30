import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface ShowcaseFeature {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface ShowcaseVariantProps {
  title: string;
  subtitle?: string;
  features: ShowcaseFeature[];
  theme?: SectionTheme;
  styleProps?: SectionStyleProps;
  variant?: string;
}
