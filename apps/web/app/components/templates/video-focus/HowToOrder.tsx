import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function VideoFocusHowToOrder({
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
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              ORDER PROCESS
            </h2>
            <div className="w-12 h-1 bg-red-600 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative group text-center">
                 {/* Arrow Connector (Desktop) */}
                 {i < config.howToOrderData!.steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-white/10 border-t border-dashed border-white/20 z-0" />
                )}

                <div className="relative z-10 w-12 h-12 bg-black border border-white/20 rounded-xl rotate-45 flex items-center justify-center mx-auto mb-8 group-hover:border-red-600 transition-colors duration-300">
                  <span className="-rotate-45 text-white font-bold">{i + 1}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[180px] mx-auto">
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
