import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { X, Check } from 'lucide-react';

export function ModernPremiumProblemSolution({
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
      sectionLabel="Why This Works"
      data={{ problemSolution: config.problemSolution }}
      onUpdate={(data) => onUpdate?.('problemSolution', data.problemSolution)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Problems */}
            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
               <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter flex items-center gap-3">
                 <span className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center -skew-x-6">
                   <X size={20} />
                 </span>
                 The Problem
               </h3>
               <div className="space-y-4">
                 {config.problemSolution.problems.map((problem, i) => (
                   <div key={i} className="flex gap-4 items-start group">
                     <span className="text-gray-300 font-black text-lg group-hover:text-black transition-colors">0{i + 1}</span>
                     <p className="text-gray-600 font-medium leading-relaxed">{problem}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Solutions */}
            <div className="bg-black text-white rounded-[2.5rem] p-10 relative overflow-hidden">
               {/* Decorative Circle */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-gray-800/20 rounded-full blur-3xl" />

               <h3 className="text-2xl font-black text-white mb-8 uppercase italic tracking-tighter flex items-center gap-3 relative z-10">
                 <span className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center -skew-x-6">
                   <Check size={20} strokeWidth={3} />
                 </span>
                 The Solution
               </h3>
               <div className="space-y-4 relative z-10">
                 {config.problemSolution.solutions.map((solution, i) => (
                   <div key={i} className="flex gap-4 items-start group">
                     <span className="text-gray-700 font-black text-lg group-hover:text-white transition-colors">0{i + 1}</span>
                     <p className="text-gray-300 font-medium leading-relaxed">{solution}</p>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
