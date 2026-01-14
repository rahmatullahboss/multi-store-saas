import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function FeaturesSection({
  config,
  isEditMode,
  onUpdate,
  theme,
  lang = 'bn',
  templateId,
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

  // Render different layouts based on templateId
  const renderLayout = () => {
    switch (templateId) {
      case 'showcase':
        return (
          <div className="grid grid-cols-1 gap-12">
            {config.features?.map((feature, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2 aspect-video bg-zinc-900 rounded-3xl overflow-hidden flex items-center justify-center text-6xl shadow-2xl border border-rose-900/20">
                  {feature.icon}
                </div>
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <span className="text-rose-500 font-bold tracking-tighter text-4xl opacity-20 block mb-2">0{i + 1}</span>
                  <h4 className={`text-3xl font-black ${theme.textPrimary} mb-4 leading-none uppercase tracking-tighter`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`text-xl ${theme.textSecondary} leading-relaxed`}>{feature.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'modern-dark':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features?.map((feature, i) => (
              <div key={i} className={`relative group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative h-full ${theme.cardBg} rounded-3xl p-8 border ${theme.cardBorder} hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center text-center`}>
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-4xl mb-6 ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className={`text-xl font-bold ${theme.textPrimary} mb-3 uppercase tracking-wider`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`${theme.textSecondary} text-sm leading-relaxed`}>{feature.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'minimal-light':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.features?.map((feature, i) => (
              <div key={i} className="flex flex-col items-start translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                <div className="text-4xl mb-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                  {feature.icon}
                </div>
                <h4 className={`text-lg font-bold ${theme.textPrimary} mb-2`}>{feature.title}</h4>
                {feature.description && (
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed font-light`}>{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'organic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features?.map((feature, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem] border border-emerald-100/50 hover:bg-emerald-50 transition-colors flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mb-6 group-hover:bg-emerald-200 transition-all">
                  {feature.icon}
                </div>
                <h4 className={`text-xl font-bold text-emerald-900 mb-3`}>{feature.title}</h4>
                {feature.description && (
                  <p className="text-emerald-700/70 text-sm leading-relaxed">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'luxury':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-amber-500/10 border-y border-amber-500/10">
            {config.features?.map((feature, i) => (
              <div key={i} className={`bg-black p-12 flex flex-col items-center text-center ${i < config.features!.length - 1 ? 'border-r border-amber-500/10' : ''}`}>
                <div className="text-amber-500 text-5xl mb-8 opacity-60">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-serif-display text-white tracking-widest uppercase mb-6">{feature.title}</h4>
                {feature.description && (
                  <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-xs">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'premium-bd':
      case 'mobile-first':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {config.features?.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-2">{feature.title}</h4>
                {feature.description && (
                  <p className="text-xs text-slate-500 font-medium leading-tight">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'modern-premium':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.features?.map((feature, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border border-white/5 bg-zinc-900/50 backdrop-blur-xl group hover:border-blue-500/50 transition-all duration-500 ${i === 1 || i === 2 ? 'lg:translate-y-8' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl mb-6 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h4 className="text-white font-black text-lg mb-3 tracking-tight">{feature.title}</h4>
                {feature.description && (
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        );

      default:
        // Default layout (Original)
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.features?.map((feature, i) => (
              <div key={i} className={`flex items-start gap-4 ${theme.cardBg} rounded-2xl p-6 border ${theme.cardBorder}`}>
                <div className={`${theme.isDark ? 'bg-white/10' : 'bg-white'} w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className={`text-lg font-bold ${theme.textPrimary}`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`${theme.textSecondary} mt-1`}>{feature.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="Product Features"
      data={config.features}
      onUpdate={(newData) => onUpdate?.('features', newData)}
      isEditable={isEditMode}
    >
      <section className={`py-20 md:py-32 ${theme.bgPrimary} overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 relative">
          {/* Section Header */}
          <div className={`mb-16 ${templateId === 'showcase' ? 'text-left border-l-4 border-rose-600 pl-6' : 'text-center'}`}>
            <h2 className={`text-4xl md:text-6xl font-black ${theme.textPrimary} leading-none mb-4 uppercase tracking-tighter`}>
              {t('productFeatures')}
            </h2>
            <p className={`text-xl ${theme.textSecondary} max-w-2xl ${templateId !== 'showcase' ? 'mx-auto' : ''}`}>
              {t('whyThisProductSpecial')}
            </p>
          </div>
          
          {renderLayout()}
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
