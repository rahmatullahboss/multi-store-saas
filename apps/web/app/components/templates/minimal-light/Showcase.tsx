import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MinimalLightShowcase({
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
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center border border-gray-100 rounded-2xl p-10 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]">
            <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">
              What's Included
            </h2>
            
            <div className="grid gap-4 text-left">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-4 -mx-4 transition-colors rounded-lg">
                  <span className="text-gray-300 font-mono text-xs">0{i + 1}</span>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
