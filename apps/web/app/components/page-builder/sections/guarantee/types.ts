import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface GuaranteeProps extends SectionStyleProps {
  title?: string;
  text?: string;
  badgeLabel?: string;
  variant?:
    | 'cards'
    | 'organic'
    | 'story-driven'
    | 'story-driven-premium';
}

export interface GuaranteeSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface GuaranteeVariantProps {
  title: string;
  text: string;
  badgeLabel: string;
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}
