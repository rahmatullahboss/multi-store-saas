import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesProps extends SectionStyleProps {
  title?: string;
  features?: Feature[];
  variant?: string;
}

export interface FeaturesSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface FeaturesVariantProps {
  title: string;
  features: Feature[];
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}

export type BaseFeaturesProps = FeaturesVariantProps;
