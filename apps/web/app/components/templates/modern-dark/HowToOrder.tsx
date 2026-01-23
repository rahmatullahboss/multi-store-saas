import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernDarkHowToOrder({
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
      <section className="py-24 bg-black border-y border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
              Order Process
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative group">
                 {/* Connector Line (Desktop) */}
                 {i < config.howToOrderData!.steps.length - 1 && (
                  <div className="hidden md:block absolute top-[2.5rem] left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-zinc-800 to-transparent z-0" />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-black text-zinc-700 group-hover:text-orange-500 group-hover:border-orange-500/50 transition-all duration-300 mb-6 group-hover:scale-110">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
