import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Leaf, Sprout } from 'lucide-react';

export function OrganicProblemSolution({
  config,
  isEditMode,
  onUpdate,
  theme,
  storeName,
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
      <section className="py-20 bg-green-50/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Problems */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-red-100">
              <h3 className="text-xl font-bold text-red-500 mb-8 flex items-center gap-3">
                <Leaf className="w-6 h-6 rotate-180" />
                Before
              </h3>
              <ul className="space-y-6">
                {config.problemSolution.problems.map((problem, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-sm shadow-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 leading-relaxed pt-1">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-green-900/5 border border-green-100 relative overflow-hidden">
               {/* Decorative Circle */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[4rem]" />
               
              <h3 className="text-xl font-bold text-green-600 mb-8 flex items-center gap-3 relative">
                <Sprout className="w-6 h-6" />
                With {storeName || 'Us'}
              </h3>
              <ul className="space-y-6 relative">
                {config.problemSolution.solutions.map((solution, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-green-200">
                      ✓
                    </span>
                    <span className="text-gray-700 font-medium leading-relaxed pt-1">{solution}</span>
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
