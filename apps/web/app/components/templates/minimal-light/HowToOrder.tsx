import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MinimalLightHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="Order Process"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How It Works</h2>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative group text-center">
                {/* Connector Line (Desktop) */}
                {i < config.howToOrderData!.steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-[1px] bg-gray-100 z-0" />
                )}
                
                <div className="relative z-10 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-bold text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900 transition-colors">
                  {i + 1}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] mx-auto">
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
