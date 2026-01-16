/**
 * Flash Sale Template - High Urgency Sales Page (Isolated)
 * 
 * Features:
 * - Sticky countdown timer bar
 * - Shake/Pulse animations on CTA
 * - Theme: Red, Yellow, Black
 */

import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Flame, Zap } from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { FlashSaleSectionRenderer } from './SectionRenderer';
import { FLASH_SALE_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

// Countdown Hook - accepts string to avoid Date object reference issues
function useCountdown(endTimeStr: string | undefined | null) {
  // Memoize the Date object to prevent new reference on each render
  const endTime = useMemo(() => {
    if (!endTimeStr) return null;
    const date = new Date(endTimeStr);
    return isNaN(date.getTime()) ? null : date;
  }, [endTimeStr]);

  // Calculate time left from a timestamp
  const calculateTimeLeft = (endTimestamp: number | null) => {
    if (endTimestamp === null) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    const now = Date.now();
    const difference = endTimestamp - now;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false,
    };
  };

  // Get stable timestamp from memoized Date
  const endTimestamp = endTime?.getTime() ?? null;

  // Initialize state with computed value
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endTimestamp));

  useEffect(() => {
    // Calculate and set initial state
    setTimeLeft(calculateTimeLeft(endTimestamp));
    
    // If no valid timestamp, don't set up interval
    if (endTimestamp === null) {
      return;
    }

    // Set up interval for countdown
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endTimestamp);
      setTimeLeft(newTimeLeft);
      
      // Clear interval if expired
      if (newTimeLeft.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTimestamp]);

  return timeLeft;
}

export function FlashSaleTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  planType = 'free',
  productVariants = [],
  orderBumps = [],
  selectedSection,
}: TemplateProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  
  const theme = applyCustomColors(FLASH_SALE_THEME, config.primaryColor, config.accentColor);
  const countdown = useCountdown(config.countdownEndTime);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Countdown Timer Bar */}
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

      {/* Spacer for fixed banner */}
      {!isPreview && <div className="h-11 md:h-[50px]" />}

      {/* Sections */}
      <FlashSaleSectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections}
        selectedSection={selectedSection}
        config={config}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={productVariants}
        orderBumps={orderBumps}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
      />

      {/* Footer */}
      <footer className="bg-black py-10 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>

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

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "অর্ডার করুন"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />

      <div className="md:hidden h-20" />

      {/* Floating Buttons */}
      <FloatingButtons
        whatsappEnabled={config.whatsappEnabled}
        whatsappNumber={config.whatsappNumber}
        whatsappMessage={config.whatsappMessage}
        callEnabled={config.callEnabled}
        callNumber={config.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}

export default FlashSaleTemplate;
