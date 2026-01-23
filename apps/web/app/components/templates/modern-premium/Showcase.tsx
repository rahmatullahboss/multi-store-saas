import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { PackageOpen } from 'lucide-react';

export function ModernPremiumShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="What You Get"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-[3rem] bg-white border border-gray-200 p-8 md:p-12 text-center shadow-xl shadow-gray-100/50">
             
             <div className="inline-block mb-8">
               <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform duration-300 shadow-xl shadow-black/20">
                 <PackageOpen size={40} strokeWidth={1.5} />
               </div>
             </div>

             <h2 className="text-3xl md:text-5xl font-black text-black mb-10 tracking-tighter uppercase italic">
               What's Inside The Box
             </h2>

             <div className="grid md:grid-cols-2 gap-4 text-left">
               {config.showcaseData.features.map((feature, i) => (
                 <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                       <span className="font-bold text-lg">{feature}</span>
                       <span className="font-mono text-xs bg-white text-black px-2 py-1 rounded border border-gray-200 group-hover:border-black">x1</span>
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
