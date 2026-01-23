import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { MousePointerClick } from 'lucide-react';

export function ModernPremiumHowToOrder({
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
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter uppercase italic inline-flex items-center gap-4">
              How To Buy
              <MousePointerClick className="w-10 h-10" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative group">
                 {/* Number */}
                 <div className="text-[120px] leading-none font-black text-gray-50 absolute -top-10 -left-6 -z-10 group-hover:text-black/5 transition-colors duration-500">
                   {i + 1}
                 </div>
                 
                 <div className="bg-white border border-black rounded-[2rem] p-8 h-full hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-black mb-3 uppercase tracking-tight">{step.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
                 </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </MagicSectionWrapper>
  );
}
