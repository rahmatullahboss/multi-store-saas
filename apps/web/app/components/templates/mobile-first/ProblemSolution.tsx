import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { XCircle, CheckCircle } from 'lucide-react';

export function MobileFirstProblemSolution({
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            
            {/* Problems */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
               <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                 <XCircle className="w-5 h-5" />
                 আপনার সমস্যা
               </h3>
               <div className="space-y-3">
                 {config.problemSolution.problems.map((problem, i) => (
                   <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-lg">
                     <span className="text-red-500 font-bold text-sm mt-0.5">•</span>
                     <p className="text-gray-700 text-sm font-medium">{problem}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Solutions */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
               <h3 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">
                 <CheckCircle className="w-5 h-5" />
                 আমাদের সমাধান
               </h3>
               <div className="space-y-3">
                 {config.problemSolution.solutions.map((solution, i) => (
                   <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-lg">
                     <span className="text-indigo-500 font-bold text-sm mt-0.5">✓</span>
                     <p className="text-gray-700 text-sm font-medium">{solution}</p>
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
