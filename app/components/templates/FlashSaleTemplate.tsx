/**
 * Flash Sale Template - High Urgency Sales Page
 * 
 * Features:
 * - Sticky countdown timer bar
 * - Shake/Pulse animations on CTA
 * - Stock counter with progress bar
 * - Compact layout: Hero -> Timer -> Product -> Form
 * - Theme: Red, Yellow, Black
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useCallback } from 'react';
import type { LandingConfig, ManualPaymentConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { Clock, ShoppingCart, Truck, Shield, AlertTriangle, CheckCircle2, Phone, User, MapPin, Package, Flame, Star, Zap } from 'lucide-react';
import { BD_DIVISIONS, DEFAULT_SHIPPING_CONFIG, calculateShipping } from '~/utils/shipping';
import { useCartTracking } from '~/hooks/useCartTracking';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';
import { getButtonStyles } from './theme-utils';
import { FloatingButtons } from './FloatingButtons';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { PaymentMethodSelector } from '~/components/checkout/PaymentMethodSelector';
import { SectionRenderer } from './SectionRenderer';
import { FLASH_SALE_THEME, applyCustomColors } from './sections/types';
import { useTranslation } from '~/contexts/LanguageContext';
import { useFormatPrice } from '~/contexts/LanguageContext';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

// ============================================================================
// COUNTDOWN TIMER HOOK
// ============================================================================
function useCountdown(endTime: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    // If no end time provided, show expired state (don't default to 24h)
    if (!endTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}

// ============================================================================
// TYPES
// ============================================================================
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  inventory?: number;
}

interface FlashSaleTemplateProps {
  storeName: string;
  storeId: number;
  product: SerializedProduct;
  config: LandingConfig;
  currency: string;
  flashSaleEndTime?: string | null;
  initialStock?: number;
  isPreview?: boolean;
  manualPaymentConfig?: ManualPaymentConfig | null;
  planType?: string;
  // Custom HTML sections
  customSections?: Array<{
    id: string;
    name: string;
    html: string;
    css?: string;
    position?: string;
  }>;
}

export function FlashSaleTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  flashSaleEndTime = null,
  initialStock = 15,
  isPreview = false,
  manualPaymentConfig,
  planType = 'free',
  customSections = [],
}: FlashSaleTemplateProps) {
  const fetcher = useFetcher();
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  
  const editableConfig = config;
  const theme = applyCustomColors(FLASH_SALE_THEME, editableConfig.primaryColor, editableConfig.accentColor);
  
  // Use countdownEndTime from config, fallback to flashSaleEndTime prop for backwards compatibility
  const endTimeStr = config.countdownEndTime || flashSaleEndTime;
  const countdown = useCountdown(endTimeStr ? new Date(endTimeStr) : null);
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 15;
  // Handle submit is now managed by OrderFormSection

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ================================================================
          STICKY COUNTDOWN TIMER BAR
          ================================================================ */}
      <div className={`${isPreview ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 py-2 shadow-lg`}>
        <div className="max-w-4xl mx-auto px-4">
          {countdown.expired ? (
            <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              অফার শেষ হয়ে গেছে!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="font-bold text-sm md:text-base">⚡ অফার শেষ হবে:</span>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">ঘণ্টা</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">মিনিট</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">সেকেন্ড</span>
                </div>
              </div>
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed offer banner - matches banner height */}
      {!isPreview && <div className="h-11 md:h-[50px]" />}

      <SectionRenderer
        sectionOrder={editableConfig.sectionOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={(product as any).variants || []}
        orderBumps={(editableConfig as any).orderBumps || []}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
        templateId="flash-sale"
      />


      {/* Custom Sections - Before Footer position */}
      <CustomSectionRenderer customSections={customSections} position="before-footer" />

      {/* ================================================================
          FOOTER - MINIMAL
          ================================================================ */}
      <footer className="bg-black py-10 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=flash-sale-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-300">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Footer - Hidden in preview mode */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-gray-800 p-3 shadow-2xl safe-area-pb">
          <a
            href="#order-form"
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse"
          >
            <Zap size={20} /> {editableConfig.ctaText || 'অর্ডার করুন'} — {formatPrice(product.price)}
          </a>
        </div>
      )}

      {/* Footer Spacer for Mobile */}
      <div className="md:hidden h-20" />

      {/* Floating Action Buttons - WhatsApp and Call */}
      <FloatingButtons
        whatsappEnabled={config.whatsappEnabled}
        whatsappNumber={config.whatsappNumber}
        whatsappMessage={config.whatsappMessage}
        callEnabled={config.callEnabled}
        callNumber={config.callNumber}
        productTitle={product.title}
      />

      {/* ================================================================
          CSS KEYFRAMES FOR SHAKE ANIMATION
          ================================================================ */}
      <style>{`
        @keyframes shake {
          0%, 50%, 100% { transform: translateX(0); }
          5%, 15%, 25%, 35%, 45% { transform: translateX(-2px); }
          10%, 20%, 30%, 40% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}

export default FlashSaleTemplate;
