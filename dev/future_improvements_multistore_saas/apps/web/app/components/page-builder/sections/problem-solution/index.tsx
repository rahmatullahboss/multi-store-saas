import type { ProblemSolutionProps, ProblemSolutionPreviewProps } from './types';

import { DefaultProblemSolution } from './DefaultProblemSolution';
import { WorldClassProblemSolution } from './WorldClassProblemSolution';

export type ProblemSolutionVariant = 'default' | 'world-class' | 'story-driven-premium';

export function ProblemSolutionPreview({ props, theme }: ProblemSolutionPreviewProps) {
  // Build props that extend SectionStyleProps directly (ProblemSolutionProps interface)
  const problemSolutionProps = {
    ...props,
    theme,
  } as ProblemSolutionProps;

  // Choose variant based on props or theme
  const variant = props.variant || 'default';

  if (variant === 'story-driven-premium' || variant === 'world-class') {
    return <WorldClassProblemSolution {...(problemSolutionProps as any)} />;
  }

  return <DefaultProblemSolution {...(problemSolutionProps as any)} />;
}

export type { ProblemSolutionProps, ProblemSolutionPreviewProps };
