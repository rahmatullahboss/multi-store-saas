/**
 * Problem Solution Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { ProblemSolutionProps, ProblemSolutionPreviewProps } from './types';

import { DefaultProblemSolution } from './DefaultProblemSolution';
import { GlassmorphismProblemSolution } from './GlassmorphismProblemSolution';
import { NeubrutalistProblemSolution } from './NeubrutalistProblemSolution';
import { UrgencyProblemSolution } from './UrgencyProblemSolution';

export type ProblemSolutionVariant = 
  | 'default' 
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'urgency';

export function ProblemSolutionPreview({ props, theme }: ProblemSolutionPreviewProps) {
  const {
    title = 'আপনার সমস্যা, আমাদের সমাধান',
    problemTitle = 'আপনি কি এই সমস্যায় ভুগছেন?',
    problems = ['সমস্যা ১ এখানে লিখুন', 'সমস্যা ২ এখানে লিখুন', 'সমস্যা ৩ এখানে লিখুন'],
    solutionTitle = '✨ আমাদের সমাধান',
    solutions = [],
    solution = 'এই পণ্য দিয়ে আপনি সকল সমস্যার সমাধান পাবেন!',
    variant = 'default',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as ProblemSolutionProps & { variant?: ProblemSolutionVariant };

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
    problemTitle,
    problems: problems as string[],
    solutionTitle,
    solutions: solutions as string[],
    solution,
    theme,
    styleProps,
  };

  switch (variant) {
    case 'glassmorphism':
      return <GlassmorphismProblemSolution {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistProblemSolution {...commonProps} />;
    case 'urgency':
      return <UrgencyProblemSolution {...commonProps} />;
    case 'default':
    default:
      return <DefaultProblemSolution {...commonProps} />;
  }
}

export type { ProblemSolutionProps, ProblemSolutionPreviewProps };
