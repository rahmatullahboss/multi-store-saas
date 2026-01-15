import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { MinusCircle, PlusCircle } from 'lucide-react';

export function ShowcaseProblemSolution({
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
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Problems */}
            <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-12 border border-white/5 relative overflow-hidden group">
               {/* Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <MinusCircle className="w-6 h-6 text-zinc-600" />
                Problem
              </h3>
              <ul className="space-y-6 relative z-10">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2.5 shrink-0 opacity-50" />
                    <span className="text-zinc-500 leading-relaxed font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
               {/* Glow */}
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full" />

              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                <PlusCircle className="w-6 h-6 text-rose-500" />
                Solution
              </h3>
              <ul className="space-y-6 relative z-10">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                    <span className="text-gray-200 leading-relaxed font-medium">{solution}</span>
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
