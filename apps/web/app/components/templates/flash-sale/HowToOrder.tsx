import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="অর্ডার প্রক্রিয়া"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 ${theme.bgSecondary}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-black ${theme.textPrimary} text-center mb-12 uppercase italic`}>
            কিভাবে অর্ডার করবেন?
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector Line (Desktop) */}
                {i < config.howToOrderData!.steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-gray-800 z-0" />
                )}
                
                <div className="relative z-10 w-16 h-16 rounded-full bg-yellow-500 text-black font-black text-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                  {i + 1}
                </div>
                
                <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>
                  {step.title}
                </h3>
                <p className={`${theme.textSecondary} text-sm`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
