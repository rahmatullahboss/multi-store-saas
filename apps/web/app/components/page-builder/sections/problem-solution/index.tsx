import type { ProblemSolutionProps, ProblemSolutionPreviewProps } from './types';

import { DefaultProblemSolution } from './DefaultProblemSolution';
import { WorldClassProblemSolution } from './WorldClassProblemSolution';

export type ProblemSolutionVariant = 
  | 'default' 
  | 'world-class'
  | 'story-driven-premium';

export function ProblemSolutionPreview({ props, theme }: ProblemSolutionPreviewProps) {
  const commonProps = { 
    ...props,
    // Ensure styleProps exists as it is required by ProblemSolutionProps
    styleProps: { theme, ...((props as any).styleProps || {}) },
    theme
  } as ProblemSolutionProps;
  
  // Choose variant based on props or theme
  const variant = props.variant || 'default';

  if (variant === 'story-driven-premium' || variant === 'world-class') {
    return <WorldClassProblemSolution {...commonProps} />;
  }

  return <DefaultProblemSolution {...commonProps} />;
}

export type { ProblemSolutionProps, ProblemSolutionPreviewProps };
