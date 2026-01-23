import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { ArrowDown } from 'lucide-react';

export function MobileFirstHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="অর্ডার করার নিয়ম"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            অর্ডার করার নিয়ম
          </h2>

          <div className="space-y-4">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative">
                 {/* Connector Line */}
                 {i < config.howToOrderData!.steps.length - 1 && (
                   <div className="absolute left-[1.65rem] top-10 bottom-[-1rem] w-0.5 bg-gray-100 z-0" />
                 )}
                 
                 <div className="relative z-10 flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-snug">{step.description}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
