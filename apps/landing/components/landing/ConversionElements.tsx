/**
 * Countdown Timer Component
 * 
 * Shows a countdown timer for flash sales, limited offers, etc.
 * Perfect for Bangladesh landing pages to create urgency.
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';

interface CountdownTimerProps {
  /** End date/time for the countdown */
  endDate: Date | string;
  /** What to show when countdown ends */
  expiredText?: string;
  /** Visual style */
  variant?: 'default' | 'compact' | 'banner';
  /** Custom class names */
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(endDate: Date): TimeLeft {
  const difference = endDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function CountdownTimer({
  endDate,
  expiredText,
  variant = 'default',
  className = '',
}: CountdownTimerProps) {
  const { t } = useTranslation();
  
  // Memoize the targetDate to prevent recreating on every render
  const targetDate = useMemo(() => {
    if (!endDate) return new Date(0); // Past date = expired
    return typeof endDate === 'string' ? new Date(endDate) : endDate;
  }, [endDate]);
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const labels = {
    days: t('landingConversion_days'),
    hours: t('landingConversion_hours'),
    minutes: t('landingConversion_minutes'),
    seconds: t('landingConversion_seconds')
  };

  const finalExpiredText = expiredText || t('landingConversion_offerExpired');

  if (timeLeft.total <= 0) {
    return (
      <div className={`text-center py-3 px-4 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-600 font-medium">{finalExpiredText}</p>
      </div>
    );
}

  // Compact variant - single line
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 text-red-600 font-bold ${className}`}>
        <span className="text-lg">⏰</span>
        <span>
          {timeLeft.hours.toString().padStart(2, '0')}:
          {timeLeft.minutes.toString().padStart(2, '0')}:
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
}

  // Banner variant - full width
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4 ${className}`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="font-bold text-lg">{t('landingConversion_offerEnding')}</span>
          <div className="flex items-center gap-2">
            {timeLeft.days > 0 && (
              <div className="bg-white/20 rounded px-3 py-1">
                <span className="font-bold text-xl">{timeLeft.days}</span>
                <span className="text-xs ml-1">{labels.days}</span>
              </div>
            )}
            <div className="bg-white/20 rounded px-3 py-1">
              <span className="font-bold text-xl">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-xs ml-1">{labels.hours}</span>
            </div>
            <span className="text-2xl font-bold animate-pulse">:</span>
            <div className="bg-white/20 rounded px-3 py-1">
              <span className="font-bold text-xl">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-xs ml-1">{labels.minutes}</span>
            </div>
            <span className="text-2xl font-bold animate-pulse">:</span>
            <div className="bg-white/20 rounded px-3 py-1">
              <span className="font-bold text-xl">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-xs ml-1">{labels.seconds}</span>
            </div>
          </div>
        </div>
      </div>
    );
}

  // Default variant - boxes
  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl sm:text-2xl">{timeLeft.days}</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">{labels.days}</span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl sm:text-2xl">{timeLeft.hours.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-500 mt-1">{labels.hours}</span>
      </div>
      
      <span className="text-2xl font-bold text-gray-400 animate-pulse">:</span>
      
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl sm:text-2xl">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-500 mt-1">{labels.minutes}</span>
      </div>
      
      <span className="text-2xl font-bold text-gray-400 animate-pulse">:</span>
      
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl sm:text-2xl">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-500 mt-1">{labels.seconds}</span>
      </div>
    </div>
  );

/**
 * Stock Counter Component
 * 
 * Shows remaining stock with visual urgency
 */
interface StockCounterProps {
  /** Current stock quantity */
  stock: number;
  /** Threshold for "low stock" warning */
  lowStockThreshold?: number;
  /** Show progress bar */
  showProgress?: boolean;
  /** Initial stock (for progress calculation) */
  initialStock?: number;
  className?: string;
}

export function StockCounter({
  stock,
  lowStockThreshold = 10,
  showProgress = true,
  initialStock = 100,
  className = '',
}: StockCounterProps) {
  const { t } = useTranslation();
  const isLowStock = stock <= lowStockThreshold;
  const isCritical = stock <= 5;
  const stockPercentage = Math.min(100, (stock / initialStock) * 100);

  if (stock <= 0) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <span className="text-xl">❌</span>
        <span className="font-bold">{t('landingConversion_stockOut')}</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-lg ${isCritical ? 'animate-pulse' : ''}`}>
          {isCritical ? '🔥' : isLowStock ? '⚠️' : '📦'}
        </span>
        <span className={`font-bold ${isCritical ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-700'}`}>
          {isCritical 
            ? t('landingConversion_onlyStockLeft', { stock })
            : isLowStock 
              ? t('landingConversion_onlyXInStock', { stock })
              : t('landingConversion_xInStock', { stock })
          }
        </span>
      </div>
      
      {showProgress && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isCritical 
                ? 'bg-red-500 animate-pulse' 
                : isLowStock 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Social Proof Popup Component
 * 
 * Shows "X just ordered" notifications
 */
interface SocialProofPopupProps {
  /** Product name */
  productName: string;
  /** How often to show popups (in seconds) */
  interval?: number;
  /** Array of fake/real buyer names */
  buyers?: string[];
  /** Array of locations */
  locations?: string[];
  /** Theme variant */
  variant?: 'default' | 'story-driven';
}

export function SocialProofPopup({
  productName,
  interval = 15,
  buyers,
  locations,
  variant = 'default',
}: SocialProofPopupProps) {
  // If no buyers are provided, do not show fake data.
  // This component now only works if real data is passed.
  if (!buyers || buyers.length === 0) {
    return null;
  }

  const { t, lang } = useTranslation();
  
  const activeBuyers = buyers;
  const activeLocations = locations || []; // Handle case where locations might be empty
  const [visible, setVisible] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState({ name: '', location: '', time: '' });

  const showNotification = () => {
    const randomBuyer = activeBuyers[Math.floor(Math.random() * activeBuyers.length)];
    const randomLocation = activeLocations.length > 0 
      ? activeLocations[Math.floor(Math.random() * activeLocations.length)]
      : '';
    const randomMinutes = Math.floor(Math.random() * 30) + 1;

    const timeText = randomMinutes === 1 
      ? t('landingConversion_justNow') 
      : t('landingConversion_minutesAgo', { randomMinutes });

    setCurrentBuyer({
      name: randomBuyer,
      location: randomLocation,
      time: timeText,
    });

    setVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  useEffect(() => {
    // Show first popup after 5 seconds
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    // Then show periodically
    const timer = setInterval(() => {
      showNotification();
    }, interval * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  // Disable exhaustive-deps to avoid recreating interval on every render.
  // We only want to reset interval if 'interval' prop changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  if (!visible) return null;

  const isStoryDriven = variant === 'story-driven';

  return (
    <div className="fixed bottom-20 left-4 z-50 animate-slide-in-left">
      <div className={`
        rounded-xl shadow-2xl border p-4 max-w-xs transition-all
        ${isStoryDriven 
          ? 'bg-[#FFFBEB] border-amber-200 shadow-amber-900/10' 
          : 'bg-white border-gray-100'
        }
      `}>
        <div className="flex items-start gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0
            ${isStoryDriven
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md'
              : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }
          `}>
            {isStoryDriven ? '🛍️' : '✓'}
          </div>
          <div>
            <p className={`text-sm ${isStoryDriven ? 'text-amber-900 font-serif' : 'text-gray-800'}`}>
               {lang === 'bn' ? (
                 <><strong>{currentBuyer.name}</strong> {currentBuyer.location && `(${currentBuyer.location})`} <br/><strong>{productName}</strong> {t('landingConversion_orderedText')}</>
               ) : (
                 <><strong>{currentBuyer.name}</strong> {currentBuyer.location && `(${currentBuyer.location})`} <br/>{t('landingConversion_orderedText')} <strong>{productName}</strong></>
               )}
            </p>
            <p className={`text-xs mt-1 ${isStoryDriven ? 'text-amber-700/70 italic' : 'text-gray-500'}`}>
              {currentBuyer.time}
            </p>
          </div>
          <button 
            onClick={() => setVisible(false)}
            className={`ml-auto ${isStoryDriven ? 'text-amber-400 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
