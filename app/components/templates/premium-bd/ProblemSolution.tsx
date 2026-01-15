import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { X, Check } from 'lucide-react';

export function PremiumBDProblemSolution({
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
      sectionLabel="কেন ও সমাধান"
      data={{ problemSolution: config.problemSolution }}
      onUpdate={(data) => onUpdate?.('problemSolution', data.problemSolution)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Problems Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="text-red-600 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  সাধারণ সমস্যাসমূহ
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {config.problemSolution.problems.map((problem, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                    <span className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 font-medium">{problem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer/Solution Divider */}
            <div className="flex items-center justify-center">
               <div className="bg-orange-100 px-6 py-2 rounded-full border border-orange-200">
                 <span className="text-orange-700 font-bold text-sm">আমাদের সমাধান 👇</span>
               </div>
            </div>

            {/* Solutions Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 justify-end">
                <h3 className="text-2xl font-bold text-gray-900 text-right">
                  কেন এটি সেরা?
                </h3>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="text-green-600 w-6 h-6" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {config.problemSolution.solutions.map((solution, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                    <span className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <p className="text-gray-700 font-medium">{solution}</p>
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
