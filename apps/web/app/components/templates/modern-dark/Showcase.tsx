import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Box } from 'lucide-react';

export function ModernDarkShowcase({
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
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-12">
            <div className="text-center mb-12">
              <Box className="w-16 h-16 text-orange-500 mx-auto mb-6 stroke-1" />
              <h2 className="text-4xl font-black text-white uppercase tracking-tight">
                What's Included
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-zinc-200 font-medium text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
