import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function FeaturesSection({
  config,
  isEditMode,
  onUpdate,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        productFeatures: 'পণ্যের বৈশিষ্ট্য',
        whyThisProductSpecial: 'আপনার জন্য কেন এই পণ্যটি স্পেশাল',
      },
      en: {
        productFeatures: 'Product Features',
        whyThisProductSpecial: 'Why this product is special',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="Product Features"
      data={config.features}
      onUpdate={(newData) => onUpdate?.('features', newData)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('productFeatures')}
            </h2>
            <p className="text-xl text-gray-600">{t('whyThisProductSpecial')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{feature.title}</h4>
                  {feature.description && (
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
