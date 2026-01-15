import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { XCircle, CheckCircle } from 'lucide-react';

export function FlashSaleProblemSolution({
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
      <section className={`py-16 md:py-24 ${theme.bgPrimary}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Problems */}
            <div className={`${theme.cardBg} p-8 rounded-3xl border border-red-500/30`}>
              <h3 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-2 uppercase">
                <XCircle className="w-8 h-8" />
                আপনার সমস্যা
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-red-500 mt-1">❌</span>
                    <span className="text-lg">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className={`${theme.cardBg} p-8 rounded-3xl border border-green-500/30`}>
              <h3 className="text-2xl font-bold text-green-500 mb-6 flex items-center gap-2 uppercase">
                <CheckCircle className="w-8 h-8" />
                আমাদের সমাধান
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-green-500 mt-1">✅</span>
                    <span className="text-lg">{solution}</span>
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
