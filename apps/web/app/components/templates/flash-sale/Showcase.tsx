import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Box } from 'lucide-react';

export function FlashSaleShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="প্রোডাক্ট ডিটেইলস"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 ${theme.bgSecondary}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`${theme.cardBg} rounded-3xl p-8 md:p-12 border ${theme.cardBorder}`}>
            <div className="text-center mb-10">
              <Box className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className={`text-3xl font-black ${theme.textPrimary} uppercase`}>
                প্যাকেজে যা যা থাকছে
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                  <span className={`${theme.textPrimary} font-medium text-lg`}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
