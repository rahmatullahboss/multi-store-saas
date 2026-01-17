import type { SectionTheme } from '~/lib/page-builder/types';
import type { SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

export interface ProblemSolutionProps extends SectionStyleProps {
  title?: string;
  problemTitle?: string;
  problems?: string[];
  solutionTitle?: string;
  solutions?: string[];
  solution?: string;
  variant?: string;
}

export interface ProblemSolutionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export interface ProblemSolutionVariantProps {
  title: string;
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutions: string[];
  solution: string;
  theme?: SectionTheme;
  styleProps: SectionStyleProps;
}
