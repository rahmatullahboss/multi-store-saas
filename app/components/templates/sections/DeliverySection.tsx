import type { SectionProps } from './types';

export function DeliverySection({
  lang = 'bn',
  theme,
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        deliveryInfo: '🚚 ডেলিভারি তথ্য',
        insideDhaka: 'ঢাকার ভেতরে',
        outsideDhaka: 'ঢাকার বাইরে',
        dhakaTime: '২৪-৪৮ ঘণ্টা',
        outsideTime: '২-৩ দিন',
        dhakaCharge: 'ডেলিভারি চার্জ: ৳৬০',
        outsideCharge: 'ডেলিভারি চার্জ: ৳১২০',
        sameDay: 'সেম-ডে ডেলিভারি সম্ভব',
        cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
        nationwide: 'সারাদেশে ডেলিভারি',
        courier: 'কুরিয়ার সার্ভিস',
      },
      en: {
        deliveryInfo: '🚚 Delivery Information',
        insideDhaka: 'Inside Dhaka',
        outsideDhaka: 'Outside Dhaka',
        dhakaTime: '24-48 Hours',
        outsideTime: '2-3 Days',
        dhakaCharge: 'Delivery Charge: ৳60',
        outsideCharge: 'Delivery Charge: ৳120',
        sameDay: 'Same-day delivery available',
        cashOnDelivery: 'Cash on Delivery',
        nationwide: 'Nationwide Delivery',
        courier: 'Courier Service',
      }
    };
    return translations[lang]?.[key] || key;
  };

  return (
    <section className={`py-16 ${theme.isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h3 className={`text-2xl md:text-3xl font-black ${theme.textPrimary} text-center mb-10`}>
          {t('deliveryInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`${theme.cardBg} ${theme.cardBorder} border-2 p-8 rounded-3xl shadow-lg`}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🏙️</span>
              <div>
                <h4 className={`text-xl font-bold ${theme.textPrimary}`}>{t('insideDhaka')}</h4>
                <p className="text-emerald-500 font-bold">{t('dhakaTime')}</p>
              </div>
            </div>
            <ul className={`space-y-3 ${theme.textSecondary} text-lg`}>
              <li className="flex items-center gap-2">✓ {t('dhakaCharge')}</li>
              <li className="flex items-center gap-2">✓ {t('sameDay')}</li>
              <li className="flex items-center gap-2">✓ {t('cashOnDelivery')}</li>
            </ul>
          </div>
          <div className={`${theme.cardBg} ${theme.cardBorder} border-2 p-8 rounded-3xl shadow-lg`}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🌍</span>
              <div>
                <h4 className={`text-xl font-bold ${theme.textPrimary}`}>{t('outsideDhaka')}</h4>
                <p className="text-blue-500 font-bold">{t('outsideTime')}</p>
              </div>
            </div>
            <ul className={`space-y-3 ${theme.textSecondary} text-lg`}>
              <li className="flex items-center gap-2">✓ {t('outsideCharge')}</li>
              <li className="flex items-center gap-2">✓ {t('nationwide')}</li>
              <li className="flex items-center gap-2">✓ {t('courier')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
