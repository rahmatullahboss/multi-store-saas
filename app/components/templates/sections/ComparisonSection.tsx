import type { SectionProps } from './types';

export function ComparisonSection({
  config,
  lang = 'bn',
  theme,
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        difference: '🔄 দেখুন পার্থক্য',
        before: 'আগে',
        after: 'পরে',
      },
      en: {
        difference: '🔄 See the Difference',
        before: 'Before',
        after: 'After',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.comparison || (!config.comparison.beforeImage && !config.comparison.afterImage)) return null;

  return (
    <section className={`py-16 ${theme.isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} mb-4`}>
            {t('difference')}
          </h2>
          {config.comparison.description && (
            <p className={`text-xl ${theme.textSecondary}`}>{config.comparison.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {config.comparison.beforeImage && (
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border-4 border-red-500/20 shadow-xl group">
                <img 
                  src={config.comparison.beforeImage} 
                  alt="Before" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-full font-bold">
                  ❌ {config.comparison.beforeLabel || t('before')}
                </span>
              </div>
            </div>
          )}
          {config.comparison.afterImage && (
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border-4 border-emerald-500/20 shadow-xl group">
                <img 
                  src={config.comparison.afterImage} 
                  alt="After" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold animate-bounce">
                  ✅ {config.comparison.afterLabel || t('after')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
