import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { X, Check } from 'lucide-react';

export function LuxeProblemSolution({
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
      <section className="py-24 bg-black border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-px bg-amber-500/10">
          {/* Problems */}
          <div className="bg-black p-12 lg:p-16">
            <h3 className="text-2xl font-serif-display text-white mb-12 uppercase tracking-widest flex items-center gap-4">
              <span className="w-8 h-px bg-red-500" />
              Before
            </h3>
            <ul className="space-y-8">
              {config.problemSolution.problems.map((problem, i) => (
                <li key={i} className="flex gap-6 group">
                  <X className="w-5 h-5 text-red-500/50 shrink-0 group-hover:text-red-500 transition-colors" />
                  <span className="text-zinc-500 font-light leading-relaxed group-hover:text-zinc-400 transition-colors">
                    {problem}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="bg-black p-12 lg:p-16 relative overflow-hidden">
             {/* Subtle Highlight */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
             
            <h3 className="text-2xl font-serif-display text-white mb-12 uppercase tracking-widest flex items-center gap-4">
              <span className="w-8 h-px bg-emerald-500" />
              After
            </h3>
            <ul className="space-y-8 relative z-10">
              {config.problemSolution.solutions.map((solution, i) => (
                <li key={i} className="flex gap-6 group">
                  <Check className="w-5 h-5 text-emerald-500/50 shrink-0 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-zinc-300 font-light leading-relaxed group-hover:text-white transition-colors">
                    {solution}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
