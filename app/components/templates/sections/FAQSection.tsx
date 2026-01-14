import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function FAQSection({
  config,
  isEditMode,
  onUpdate,
  theme,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        faq: '❓ সচরাচর জিজ্ঞাসা',
      },
      en: {
        faq: '❓ Frequently Asked Questions',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.faq || config.faq.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="faq"
      sectionLabel="FAQ Section"
      data={config.faq}
      onUpdate={(newData) => onUpdate?.('faq', newData)}
      isEditable={isEditMode}
    >
      <section className={`py-16 ${theme.bgPrimary} px-4`}>
        <h3 className={`text-2xl md:text-3xl font-black ${theme.textPrimary} text-center mb-10`}>
          {t('faq')}
        </h3>
        <div className="max-w-3xl mx-auto space-y-4">
          {config.faq.map((item, idx) => (
            <details key={idx} className={`group ${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden transition-colors`}>
              <summary className={`p-6 cursor-pointer flex items-center justify-between ${theme.textPrimary} font-bold text-lg list-none`}>
                <span className="pr-4">{item.question}</span>
                <span className={`w-8 h-8 ${theme.isDark ? 'bg-white/10' : 'bg-white'} rounded-full flex items-center justify-center text-orange-500 group-open:rotate-45 transition-transform shadow-sm`}>+</span>
              </summary>
              <div className={`px-6 pb-6 ${theme.textSecondary} text-lg leading-relaxed border-t ${theme.cardBorder.replace('border-', 'border-t-')} mt-2 pt-2`}>
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
