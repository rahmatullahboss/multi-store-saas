import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ShowcaseHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="Ordering Process"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto">
             
             {/* Left - Title */}
             <div className="md:w-1/3 pt-8">
               <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                 Simple steps to <span className="text-rose-500">purchase</span>
               </h2>
               <p className="text-zinc-500 text-lg leading-relaxed">
                 We've outlined the process to make it as transparent and easy as possible for you.
               </p>
             </div>

             {/* Right - Steps */}
             <div className="md:w-2/3 grid gap-6">
                {config.howToOrderData.steps.map((step, i) => (
                  <div key={i} className="bg-zinc-950 p-8 rounded-[2rem] border border-white/5 flex gap-6 hover:border-white/10 transition-colors group">
                    <div className="text-5xl font-bold text-zinc-800 group-hover:text-rose-500/20 transition-colors">
                      0{i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-zinc-500 font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
             </div>

          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
