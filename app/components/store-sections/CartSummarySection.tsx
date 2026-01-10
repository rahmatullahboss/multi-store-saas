
import { Link } from '@remix-run/react';
import { useTranslation, useFormatPrice } from '~/contexts/LanguageContext';
import { trackingEvents } from '~/utils/tracking';
import type { SectionSettings } from './registry';

interface CartSummarySectionProps {
  settings: SectionSettings;
  theme: any;
  currency?: string;
  storeId?: number;
}

export function CartSummarySection({ settings, theme, currency = 'BDT' }: CartSummarySectionProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const primaryColor = settings.primaryColor || theme.primary || '#000000';
  
  return (
    <section className="py-4 px-4 sticky top-20">
       <div className="rounded-xl border border-gray-200 p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>{t('orderSummary')}</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('subtotal')}</span>
              <span className="font-medium" style={{ color: theme.text }} id="cart-subtotal">{formatPrice(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('shipping')}</span>
              <span className="text-gray-500">Calculated at checkout</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold" style={{ color: theme.text }}>{t('total')}</span>
              <span className="font-bold text-lg" style={{ color: primaryColor }} id="cart-total">{formatPrice(0)}</span>
            </div>
          </div>
          
          <Link 
            to="/checkout"
            className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              // Fire InitiateCheckout tracking event (FB Pixel + GA4)
              // Note: value and numItems computed client-side from localStorage
              trackingEvents.initiateCheckout(0, 0, currency);
              console.log('[Tracking] InitiateCheckout event fired');
            }}
          >
            {t('proceedToCheckout')}
          </Link>
          
          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              🔒 Secure checkout
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              🚚 Fast delivery
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              ↩️ Easy returns
            </p>
          </div>
        </div>
    </section>
  );
}
