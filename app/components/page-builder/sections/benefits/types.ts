import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface Benefit {
  icon?: string;
  title: string;
  description?: string;
}

export interface BenefitsProps extends SectionStyleProps {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
  variant?: string;
}

export interface BenefitsSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface BenefitsVariantProps {
  title: string;
  subtitle: string;
  benefits: Benefit[];
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}
