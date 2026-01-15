import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Package } from 'lucide-react';

export function VideoFocusShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="প্যাকেজ ডিটেইলস"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900/50 rounded-2xl p-8 border border-white/10 md:p-12">
            <div className="flex items-center justify-center mb-10">
              <div className="bg-red-600/10 p-4 rounded-full">
                <Package className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-10">
              Box Contents
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold text-xs ring-1 ring-red-500/50">
                    {i + 1}
                  </div>
                  <span className="text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
