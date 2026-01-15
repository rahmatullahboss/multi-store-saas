import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { X, Check } from 'lucide-react';

export function ModernDarkProblemSolution({
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
      sectionLabel="Problems & Solutions"
      data={{ problemSolution: config.problemSolution }}
      onUpdate={(data) => onUpdate?.('problemSolution', data.problemSolution)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Problems */}
            <div className="bg-zinc-900/50 p-10 rounded-[2rem] border border-red-900/20 hover:border-red-600/50 transition-colors">
              <h3 className="text-2xl font-black text-red-500 mb-8 uppercase tracking-widest flex items-center gap-3">
                <X className="w-6 h-6" />
                The Problem
              </h3>
              <ul className="space-y-6">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-4 text-zinc-400">
                    <span className="w-6 h-6 rounded-full bg-red-900/30 flex items-center justify-center text-red-500 text-xs shrink-0 mt-0.5">X</span>
                    <span className="text-lg font-light leading-relaxed">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-zinc-900/50 p-10 rounded-[2rem] border border-emerald-900/20 hover:border-emerald-600/50 transition-colors">
              <h3 className="text-2xl font-black text-emerald-500 mb-8 uppercase tracking-widest flex items-center gap-3">
                <Check className="w-6 h-6" />
                Our Solution
              </h3>
              <ul className="space-y-6">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-4 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-500 text-xs shrink-0 mt-0.5">✓</span>
                    <span className="text-lg font-light leading-relaxed">{solution}</span>
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
