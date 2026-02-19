/**
 * Flash Sale Banner Component
 * 
 * Displays a countdown timer banner for active flash sales on the storefront.
 * Used on homepage and product pages.
 */

import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

interface FlashSaleProps {
  title: string;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  endTime: Date | string;
  currency?: string;
}

export default function FlashSaleBanner({
  title,
  code,
  discountValue,
  discountType,
  endTime,
  currency = 'BDT',
}: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft()); // calculateTimeLeft uses closure over endTime
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  if (timeLeft.expired) {
    return null;
  }

  const discountDisplay = discountType === 'percentage' 
    ? `${discountValue}% OFF` 
    : `${currency} ${discountValue} OFF`;

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-lg">{title || 'Flash Sale!'}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-medium">
            {discountDisplay}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4" />
          <div className="flex items-center gap-1 font-mono text-lg">
            {timeLeft.days > 0 && (
              <>
                <TimeBlock value={timeLeft.days} label="d" />
                <span className="opacity-70">:</span>
              </>
            )}
            <TimeBlock value={timeLeft.hours} label="h" />
            <span className="opacity-70">:</span>
            <TimeBlock value={timeLeft.minutes} label="m" />
            <span className="opacity-70">:</span>
            <TimeBlock value={timeLeft.seconds} label="s" />
          </div>
        </div>

        {/* Code */}
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-90">Use code:</span>
          <span className="bg-white text-red-600 font-bold px-3 py-1 rounded text-sm">
            {code}
          </span>
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/20 px-2 py-1 rounded min-w-[40px] text-center">
      <span className="font-bold">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
