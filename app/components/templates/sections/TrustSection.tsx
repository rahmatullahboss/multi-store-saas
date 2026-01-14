import type { SectionProps } from './types';

export function TrustSection({
  config,
  theme,
  lang = 'bn',
}: SectionProps) {
  // Simplified translation for now, can be passed from parent
  const t = (key: string) => {
    const translations: any = {
      bn: {
        freeDelivery: 'ফ্রি ডেলিভারি',
        freeDeliveryInDhaka: 'ঢাকার ভেতরে',
        originalProduct: 'অরিজিনাল পণ্য',
        originalGuarantee: '১০০% গ্যারান্টি',
        cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
        payOnReceive: 'হাতে পেয়ে পেমেন্ট',
        easyReturn: 'সহজ রিটার্ন',
        returnPolicy: '৭ দিনের পলিসি',
      },
      en: {
        freeDelivery: 'Free Delivery',
        freeDeliveryInDhaka: 'Inside Dhaka',
        originalProduct: 'Original Product',
        originalGuarantee: '100% Guarantee',
        cashOnDelivery: 'Cash on Delivery',
        payOnReceive: 'Pay on Receipt',
        easyReturn: 'Easy Return',
        returnPolicy: '7 Days Policy',
      }
    };
    return translations[lang]?.[key] || key;
  };

  return (
    <section className={`py-12 ${theme.bgSecondary} border-y ${theme.cardBorder}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className={`text-center p-4 md:p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
            <div className="text-4xl mb-3">🚚</div>
            <h4 className={`font-bold ${theme.textPrimary}`}>{t('freeDelivery')}</h4>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('freeDeliveryInDhaka')}</p>
          </div>
          <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
            <div className="text-4xl mb-3">💯</div>
            <h4 className={`font-bold ${theme.textPrimary}`}>{t('originalProduct')}</h4>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('originalGuarantee')}</p>
          </div>
          <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
            <div className="text-4xl mb-3">💵</div>
            <h4 className={`font-bold ${theme.textPrimary}`}>{t('cashOnDelivery')}</h4>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('payOnReceive')}</p>
          </div>
          <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
            <div className="text-4xl mb-3">🔄</div>
            <h4 className={`font-bold ${theme.textPrimary}`}>{t('easyReturn')}</h4>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('returnPolicy')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
