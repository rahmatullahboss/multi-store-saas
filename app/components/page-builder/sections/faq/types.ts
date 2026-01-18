import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps extends SectionStyleProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  variant?: string;
}

export interface FAQSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface FAQVariantProps {
  title: string;
  subtitle: string;
  items: FAQItem[];
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}
