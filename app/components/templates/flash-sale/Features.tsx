import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="বৈশিষ্ট্য"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 ${theme.bgSecondary}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} text-center mb-12 uppercase italic tracking-tighter`}>
            🔥 এই পণ্যের বিশেষত্ব
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {config.features.map((feature, i) => (
              <div 
                key={i} 
                className={`${theme.cardBg} p-6 rounded-2xl border ${theme.cardBorder} hover:border-yellow-500/50 transition-all group text-center`}
              >
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className={`text-lg font-bold ${theme.textPrimary} mb-2`}>
                  {feature.title}
                </h4>
                {feature.description && (
                  <p className={`${theme.textSecondary} text-sm`}>
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
