import { Plus, HelpCircle, ChevronDown } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

export function FAQSection({
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
        faq: '❓ সচরাচর জিজ্ঞাসা',
      },
      en: {
        faq: '❓ Frequently Asked Questions',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.faq || config.faq.length === 0) return null;

  const renderLayout = () => {
    switch (templateId) {
      case 'modern-dark':
        return (
          <div className="max-w-3xl mx-auto space-y-4">
            {config.faq?.map((item, idx) => (
              <div key={idx} className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} overflow-hidden group hover:border-rose-500/30 transition-all`}>
                <details className="group">
                  <summary className={`flex items-center justify-between p-6 cursor-pointer list-none ${theme.textPrimary} font-bold text-lg`}>
                    {item.question}
                    <Plus className="w-5 h-5 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className={`px-6 pb-6 ${theme.textSecondary} leading-relaxed`}>
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      case 'showcase':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="border-b border-rose-500/10 pb-8 hover:bg-rose-500/5 transition-all p-4 rounded-xl">
                <h4 className={`text-xl font-black ${theme.textPrimary} mb-4 flex items-center gap-4 uppercase tracking-tighter`}>
                  <span className="text-rose-500 text-sm">Q.</span> {item.question}
                </h4>
                <p className={`${theme.textSecondary} text-lg leading-relaxed pl-8 border-l border-rose-500/20`}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        );

      case 'flash-sale':
        return (
          <div className="max-w-2xl mx-auto space-y-3">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-bold text-zinc-900 group-open:bg-yellow-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-yellow-500" />
                      {item.question}
                    </div>
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 text-zinc-600 bg-white border-t border-zinc-100">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      case 'organic':
        return (
          <div className="max-w-3xl mx-auto space-y-4">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="bg-emerald-50 rounded-[2rem] border border-emerald-100 overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-8 cursor-pointer list-none font-bold text-emerald-900">
                    {item.question}
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                      <ChevronDown size={16} />
                    </div>
                  </summary>
                  <div className="px-8 pb-8 text-emerald-800/80 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      case 'luxury':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="border-b border-white/10 pb-8 hover:bg-white/5 transition-all p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-serif-display text-white text-xl tracking-widest uppercase">
                    {item.question}
                    <div className="text-amber-500 font-sans group-open:rotate-45 transition-transform text-2xl">+</div>
                  </summary>
                  <div className="pt-6 text-zinc-500 font-light leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      case 'premium-bd':
        return (
          <div className="max-w-2xl mx-auto space-y-4">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-black text-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      {item.question}
                    </div>
                    <Plus size={20} className="text-slate-300 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-500 font-medium">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      case 'modern-premium':
        return (
          <div className="max-w-3xl mx-auto space-y-4">
            {config.faq?.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden group hover:border-blue-500/20 transition-all">
                <details className="group">
                  <summary className="flex items-center justify-between p-7 cursor-pointer list-none font-black text-white text-lg tracking-tight">
                    {item.question}
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-open:bg-blue-500 group-open:text-white transition-all">
                      <Plus size={20} className="group-open:rotate-45 transition-transform" />
                    </div>
                  </summary>
                  <div className="px-7 pb-7 text-zinc-400 font-medium leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );

      default:
        // Default layout
        return (
          <div className="max-w-3xl mx-auto space-y-4">
            {config.faq?.map((item, idx) => (
              <div key={idx} className={`${theme.cardBg} rounded-xl border ${theme.cardBorder}`}>
                <details className="group">
                  <summary className={`flex items-center justify-between p-4 cursor-pointer list-none ${theme.textPrimary} font-bold`}>
                    {item.question}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className={`px-4 pb-4 ${theme.textSecondary}`}>
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <MagicSectionWrapper
      sectionId="faq"
      sectionLabel="FAQ Section"
      data={config.faq}
      onUpdate={(newData) => onUpdate?.('faq', newData)}
      isEditable={isEditMode}
    >
      <section className={`py-20 md:py-32 ${theme.bgPrimary} px-4 overflow-hidden`}>
        <div className={`max-w-6xl mx-auto mb-16 ${templateId === 'showcase' ? 'text-left' : 'text-center'}`}>
          <h3 className={`text-3xl md:text-6xl font-black ${theme.textPrimary} uppercase tracking-tighter leading-none`}>
            {t('faq')}
          </h3>
        </div>
        {renderLayout()}
      </section>
    </MagicSectionWrapper>
  );
}

