import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { XCircle, CheckCircle } from 'lucide-react';

export function VideoFocusProblemSolution({
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
      <section className="py-20 bg-zinc-900 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <div className="bg-red-950/20 p-8 rounded-2xl border border-red-900/30">
              <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-3">
                <XCircle className="w-6 h-6" />
                Before
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0" />
                    <span className="text-gray-400 leading-relaxed font-light">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-green-950/20 p-8 rounded-2xl border border-green-900/30">
              <h3 className="text-xl font-bold text-green-500 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                After
              </h3>
              <ul className="space-y-4">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 shrink-0" />
                    <span className="text-white leading-relaxed font-medium">{solution}</span>
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
