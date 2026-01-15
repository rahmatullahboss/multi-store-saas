import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { PackageCheck } from 'lucide-react';

export function ShowcaseShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="What's Inside"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
             <div className="text-center mb-16">
               <span className="text-rose-500 text-sm font-bold tracking-widest uppercase mb-4 block">Unboxing</span>
               <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Box Contents</h2>
             </div>

             <div className="grid md:grid-cols-2 gap-8 items-center bg-zinc-950 rounded-[3rem] p-8 md:p-12 border border-white/5">
                <div className="flex items-center justify-center py-12 md:py-0 border-b md:border-b-0 md:border-r border-white/5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-[80px] rounded-full" />
                    <PackageCheck size={120} className="text-white relative z-10 stroke-1" />
                  </div>
                </div>

                <div className="flex flex-col gap-6 pl-0 md:pl-8">
                  {config.showcaseData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                       <span className="text-zinc-600 font-mono text-sm group-hover:text-rose-500 transition-colors">0{i + 1}</span>
                       <span className="text-xl text-gray-300 font-medium group-hover:text-white transition-colors">{feature}</span>
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
