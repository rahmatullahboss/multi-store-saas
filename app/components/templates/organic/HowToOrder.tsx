import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function OrganicHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="Process"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-bl-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-lime-50 rounded-tr-full opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple Ordering Process
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                 {/* Connector (Desktop) */}
                 {i < config.howToOrderData!.steps.length - 1 && (
                  <div className="hidden md:block absolute top-[2.5rem] left-[60%] w-[80%] border-t-2 border-dashed border-gray-200 -z-10" />
                )}

                <div className="w-20 h-20 bg-white rounded-full border-4 border-green-50 shadow-md flex items-center justify-center text-2xl font-bold text-green-600 mb-6">
                  {i + 1}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
