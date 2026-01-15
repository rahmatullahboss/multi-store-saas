import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Package } from 'lucide-react';

export function LuxeShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="In The Box"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif-display text-white mb-4 tracking-wider uppercase">
            Unboxing Experience
          </h2>
          <div className="w-24 h-px bg-amber-500 mx-auto" />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="border border-amber-500/20 p-8 md:p-12 relative">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-amber-500" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-amber-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500" />

            <div className="grid md:grid-cols-2 gap-8">
               <div className="flex flex-col items-center justify-center p-8 border border-amber-500/10 bg-amber-900/5">
                 <Package className="w-20 h-20 text-amber-500/80 stroke-1 mb-4" />
                 <span className="text-amber-500/60 uppercase tracking-widest text-xs">Premium Packaging</span>
               </div>
               
               <div className="space-y-4 flex flex-col justify-center">
                  {config.showcaseData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-amber-500/10 last:border-0">
                      <span className="text-amber-500 font-serif-display text-lg italic">{i + 1}.</span>
                      <span className="text-zinc-300 font-light tracking-wide uppercase text-sm">{feature}</span>
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
