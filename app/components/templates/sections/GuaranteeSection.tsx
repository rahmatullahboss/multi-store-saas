import { Shield } from 'lucide-react';
import type { SectionProps } from './types';

export function GuaranteeSection({
  config,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        guarantee: '১০০% গ্যারান্টি',
      },
      en: {
        guarantee: '100% Guarantee',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.guaranteeText) return null;

  return (
    <section className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 py-10 px-4 text-center border-y border-emerald-500/30">
      <div className="flex items-center justify-center gap-3 text-emerald-400 font-black text-2xl mb-4">
        <Shield size={32} />
        <span>{t('guarantee')}</span>
      </div>
      <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed">
        {config.guaranteeText}
      </p>
    </section>
  );
}
