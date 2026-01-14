import type { SectionProps } from './types';

export function BenefitsSection({
  config,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        whyBuy: '✅ কেন কিনবেন এই প্রোডাক্ট?',
        specialBenefits: 'এখানে আছে আপনার জন্য বিশেষ সুবিধা',
      },
      en: {
        whyBuy: '✅ Why Buy This Product?',
        specialBenefits: 'Here are exclusive benefits for you',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.benefits || config.benefits.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            {t('whyBuy')}
          </h2>
          <p className="text-xl text-gray-600">{t('specialBenefits')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{benefit.title}</h4>
                {benefit.description && (
                  <p className="text-gray-600">{benefit.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
