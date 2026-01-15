import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { MinusCircle, CheckCircle2 } from 'lucide-react';

export function MinimalLightProblemSolution({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.problemSolution || 
      (config.problemSolution.problems.length === 0 && config.problemSolution.solutions.length === 0)) {
    return null;
  }

  return (
    <MagicSectionWrapper
      sectionId="problem-solution"
      sectionLabel="সমস্যা ও সমাধান"
      data={{ problemSolution: config.problemSolution }}
      onUpdate={(data) => onUpdate?.('problemSolution', data.problemSolution)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Problems */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MinusCircle className="w-6 h-6 text-red-400" />
                Problem
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-200 mt-2.5 group-hover:bg-red-400 transition-colors" />
                    <span className="text-gray-600 leading-relaxed font-light">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                Solution
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 mt-2.5 group-hover:bg-emerald-500 transition-colors" />
                    <span className="text-gray-800 leading-relaxed font-medium">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
