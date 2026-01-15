import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxeHowToOrder({
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
      <section className="py-24 bg-black border-y border-amber-500/10">
        <div className="container mx-auto px-4 mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-serif-display text-white mb-4 tracking-wider uppercase">
            {config.howToOrderData?.title || 'Acquisition'}
            </h2>
            <div className="w-24 h-px bg-amber-500 mx-auto" />
        </div>

        <div className="max-w-5xl mx-auto px-4">
           <div className="grid md:grid-cols-4 gap-12 relative">
             
             {config.howToOrderData.steps.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 border border-amber-500/30 flex items-center justify-center text-2xl font-serif-display text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 rotate-45 group-hover:rotate-0">
                    <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">{i + 1}</span>
                  </div>
                  
                  <h3 className="text-lg font-serif-display text-white uppercase tracking-widest mb-3">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-light tracking-wide max-w-[150px]">
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
