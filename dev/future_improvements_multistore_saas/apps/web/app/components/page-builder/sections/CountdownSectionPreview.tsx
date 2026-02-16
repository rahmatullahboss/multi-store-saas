/**
 * Countdown Timer Section Preview
 * 
 * Renders a countdown timer for flash sales and urgency messaging.
 * Supports multiple variants: banner, card, minimal, urgent.
 */

import { useState, useEffect } from 'react';
import type { CountdownProps } from '~/lib/page-builder/schemas';

interface CountdownSectionPreviewProps {
  props: Record<string, unknown>;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(endDate: string, endTime: string): TimeLeft {
  if (!endDate) {
    // No end date provided - default to 0 (expired) to avoid fake urgency by default
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const targetDate = new Date(`${endDate}T${endTime || '23:59'}:00`);
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export function CountdownSectionPreview({ props }: CountdownSectionPreviewProps) {
  const {
    endDate = '',
    endTime = '23:59',
    title = '⏰ অফার শেষ হচ্ছে!',
    subtitle = '',
    expiredMessage = 'অফার শেষ হয়ে গেছে!',
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    daysLabel = 'দিন',
    hoursLabel = 'ঘন্টা',
    minutesLabel = 'মিনিট',
    secondsLabel = 'সেকেন্ড',
    variant = 'banner',
    bgColor = '#DC2626',
    textColor = '#FFFFFF',
    numberBgColor = 'rgba(255,255,255,0.2)',
    numberTextColor = '#FFFFFF',
    pulseAnimation = true,
    shakeOnLowTime = true,
  } = props as CountdownProps;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(endDate, endTime)
  );

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate, endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, endTime]);

  // Check if low time (less than 1 hour)
  const isLowTime = !timeLeft.isExpired && timeLeft.days === 0 && timeLeft.hours === 0;

  // Time unit component
  const TimeUnit = ({ value, label, show }: { value: number; label: string; show: boolean }) => {
    if (!show) return null;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`
            px-3 py-2 rounded-lg font-bold text-xl min-w-[50px] text-center
            ${pulseAnimation && !timeLeft.isExpired ? 'animate-pulse' : ''}
          `}
          style={{ 
            backgroundColor: numberBgColor, 
            color: numberTextColor 
          }}
        >
          {String(value).padStart(2, '0')}
        </div>
        <span 
          className="text-xs mt-1 opacity-80"
          style={{ color: textColor }}
        >
          {label}
        </span>
      </div>
    );
  };

  // EXPIRED STATE
  if (timeLeft.isExpired) {
    return (
      <div 
        className="w-full py-4 text-center"
        style={{ backgroundColor: '#6B7280', color: '#FFFFFF' }}
      >
        <p className="text-lg font-bold">{expiredMessage}</p>
      </div>
    );
  }

  // BANNER variant - Full width strip
  if (variant === 'banner') {
    return (
      <div 
        className={`w-full py-4 ${isLowTime && shakeOnLowTime ? 'animate-bounce' : ''}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-4xl mx-auto px-4">
          {title && (
            <h3 
              className="text-lg font-bold text-center mb-3"
              style={{ color: textColor }}
            >
              {title}
            </h3>
          )}
          
          <div className="flex items-center justify-center gap-3">
            <TimeUnit value={timeLeft.days} label={daysLabel} show={showDays} />
            <span className="text-2xl font-bold" style={{ color: textColor }}>:</span>
            <TimeUnit value={timeLeft.hours} label={hoursLabel} show={showHours} />
            <span className="text-2xl font-bold" style={{ color: textColor }}>:</span>
            <TimeUnit value={timeLeft.minutes} label={minutesLabel} show={showMinutes} />
            <span className="text-2xl font-bold" style={{ color: textColor }}>:</span>
            <TimeUnit value={timeLeft.seconds} label={secondsLabel} show={showSeconds} />
          </div>
          
          {subtitle && (
            <p 
              className="text-sm text-center mt-3 opacity-90"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // CARD variant - Centered card
  if (variant === 'card') {
    return (
      <div className="w-full py-8 px-4">
        <div 
          className="max-w-md mx-auto p-6 rounded-2xl shadow-xl"
          style={{ backgroundColor: bgColor }}
        >
          {title && (
            <h3 
              className="text-xl font-bold text-center mb-4"
              style={{ color: textColor }}
            >
              {title}
            </h3>
          )}
          
          <div className="flex items-center justify-center gap-4">
            <TimeUnit value={timeLeft.days} label={daysLabel} show={showDays} />
            <TimeUnit value={timeLeft.hours} label={hoursLabel} show={showHours} />
            <TimeUnit value={timeLeft.minutes} label={minutesLabel} show={showMinutes} />
            <TimeUnit value={timeLeft.seconds} label={secondsLabel} show={showSeconds} />
          </div>
          
          {subtitle && (
            <p 
              className="text-sm text-center mt-4 opacity-90"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // URGENT variant - Flashing urgent style
  if (variant === 'urgent') {
    return (
      <div 
        className={`w-full py-6 ${pulseAnimation ? 'animate-pulse' : ''}`}
        style={{ 
          backgroundColor: bgColor,
          background: `linear-gradient(45deg, ${bgColor} 0%, #991B1B 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl animate-bounce">🔥</span>
            <h3 
              className="text-xl font-extrabold uppercase tracking-wide"
              style={{ color: textColor }}
            >
              {title}
            </h3>
            <span className="text-2xl animate-bounce">🔥</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {showDays && (
              <>
                <span 
                  className="text-4xl font-black"
                  style={{ color: numberTextColor }}
                >
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-lg opacity-80" style={{ color: textColor }}>{daysLabel}</span>
              </>
            )}
            {showHours && (
              <>
                <span 
                  className="text-4xl font-black"
                  style={{ color: numberTextColor }}
                >
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-lg opacity-80" style={{ color: textColor }}>{hoursLabel}</span>
              </>
            )}
            {showMinutes && (
              <>
                <span 
                  className="text-4xl font-black"
                  style={{ color: numberTextColor }}
                >
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-lg opacity-80" style={{ color: textColor }}>{minutesLabel}</span>
              </>
            )}
            {showSeconds && (
              <span 
                className="text-4xl font-black"
                style={{ color: numberTextColor }}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p 
              className="text-sm mt-3 opacity-90"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // MINIMAL variant - Simple inline
  return (
    <div 
      className="w-full py-3 text-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-center gap-1">
        {title && (
          <span 
            className="text-sm font-semibold mr-2"
            style={{ color: textColor }}
          >
            {title}
          </span>
        )}
        <span 
          className="font-mono font-bold text-lg"
          style={{ color: numberTextColor }}
        >
          {showDays && `${String(timeLeft.days).padStart(2, '0')}:`}
          {showHours && `${String(timeLeft.hours).padStart(2, '0')}:`}
          {showMinutes && `${String(timeLeft.minutes).padStart(2, '0')}:`}
          {showSeconds && String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
