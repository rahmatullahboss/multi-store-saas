import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Countdown Timer Component
 *
 * Shows a countdown timer for flash sales, limited offers, etc.
 * Perfect for Bangladesh landing pages to create urgency.
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';
function calculateTimeLeft(endDate) {
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
export function CountdownTimer({ endDate, expiredText, variant = 'default', className = '', }) {
    const { t } = useTranslation();
    // Memoize the targetDate to prevent recreating on every render
    const targetDate = useMemo(() => {
        if (!endDate)
            return new Date(0); // Past date = expired
        return typeof endDate === 'string' ? new Date(endDate) : endDate;
    }, [endDate]);
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
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
        return (_jsx("div", { className: `text-center py-3 px-4 bg-gray-100 rounded-lg ${className}`, children: _jsx("p", { className: "text-gray-600 font-medium", children: finalExpiredText }) }));
    }
    // Compact variant - single line
    if (variant === 'compact') {
        return (_jsxs("div", { className: `inline-flex items-center gap-1 text-red-600 font-bold ${className}`, children: [_jsx("span", { className: "text-lg", children: "\u23F0" }), _jsxs("span", { children: [timeLeft.hours.toString().padStart(2, '0'), ":", timeLeft.minutes.toString().padStart(2, '0'), ":", timeLeft.seconds.toString().padStart(2, '0')] })] }));
    }
    // Banner variant - full width
    if (variant === 'banner') {
        return (_jsx("div", { className: `bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4 ${className}`, children: _jsxs("div", { className: "max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3", children: [_jsx("span", { className: "font-bold text-lg", children: t('landingConversion_offerEnding') }), _jsxs("div", { className: "flex items-center gap-2", children: [timeLeft.days > 0 && (_jsxs("div", { className: "bg-white/20 rounded px-3 py-1", children: [_jsx("span", { className: "font-bold text-xl", children: timeLeft.days }), _jsx("span", { className: "text-xs ml-1", children: labels.days })] })), _jsxs("div", { className: "bg-white/20 rounded px-3 py-1", children: [_jsx("span", { className: "font-bold text-xl", children: timeLeft.hours.toString().padStart(2, '0') }), _jsx("span", { className: "text-xs ml-1", children: labels.hours })] }), _jsx("span", { className: "text-2xl font-bold animate-pulse", children: ":" }), _jsxs("div", { className: "bg-white/20 rounded px-3 py-1", children: [_jsx("span", { className: "font-bold text-xl", children: timeLeft.minutes.toString().padStart(2, '0') }), _jsx("span", { className: "text-xs ml-1", children: labels.minutes })] }), _jsx("span", { className: "text-2xl font-bold animate-pulse", children: ":" }), _jsxs("div", { className: "bg-white/20 rounded px-3 py-1", children: [_jsx("span", { className: "font-bold text-xl", children: timeLeft.seconds.toString().padStart(2, '0') }), _jsx("span", { className: "text-xs ml-1", children: labels.seconds })] })] })] }) }));
    }
    // Default variant - boxes
    return (_jsxs("div", { className: `flex items-center justify-center gap-2 sm:gap-4 ${className}`, children: [timeLeft.days > 0 && (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white font-black text-xl sm:text-2xl", children: timeLeft.days }) }), _jsx("span", { className: "text-xs text-gray-500 mt-1", children: labels.days })] })), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white font-black text-xl sm:text-2xl", children: timeLeft.hours.toString().padStart(2, '0') }) }), _jsx("span", { className: "text-xs text-gray-500 mt-1", children: labels.hours })] }), _jsx("span", { className: "text-2xl font-bold text-gray-400 animate-pulse", children: ":" }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white font-black text-xl sm:text-2xl", children: timeLeft.minutes.toString().padStart(2, '0') }) }), _jsx("span", { className: "text-xs text-gray-500 mt-1", children: labels.minutes })] }), _jsx("span", { className: "text-2xl font-bold text-gray-400 animate-pulse", children: ":" }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("span", { className: "text-white font-black text-xl sm:text-2xl", children: timeLeft.seconds.toString().padStart(2, '0') }) }), _jsx("span", { className: "text-xs text-gray-500 mt-1", children: labels.seconds })] })] }));
    export function StockCounter({ stock, lowStockThreshold = 10, showProgress = true, initialStock = 100, className = '', }) {
        const { t } = useTranslation();
        const isLowStock = stock <= lowStockThreshold;
        const isCritical = stock <= 5;
        const stockPercentage = Math.min(100, (stock / initialStock) * 100);
        if (stock <= 0) {
            return (_jsxs("div", { className: `flex items-center gap-2 text-red-600 ${className}`, children: [_jsx("span", { className: "text-xl", children: "\u274C" }), _jsx("span", { className: "font-bold", children: t('landingConversion_stockOut') })] }));
        }
        return (_jsxs("div", { className: `${className}`, children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: `text-lg ${isCritical ? 'animate-pulse' : ''}`, children: isCritical ? '🔥' : isLowStock ? '⚠️' : '📦' }), _jsx("span", { className: `font-bold ${isCritical ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-700'}`, children: isCritical
                                ? t('landingConversion_onlyStockLeft', { stock })
                                : isLowStock
                                    ? t('landingConversion_onlyXInStock', { stock })
                                    : t('landingConversion_xInStock', { stock }) })] }), showProgress && (_jsx("div", { className: "h-2 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all duration-500 ${isCritical
                            ? 'bg-red-500 animate-pulse'
                            : isLowStock
                                ? 'bg-orange-500'
                                : 'bg-green-500'}`, style: { width: `${stockPercentage}%` } }) }))] }));
    }
    export function SocialProofPopup({ productName, interval = 15, buyers, locations, variant = 'default', }) {
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
        if (!visible)
            return null;
        const isStoryDriven = variant === 'story-driven';
        return (_jsxs("div", { className: "fixed bottom-20 left-4 z-50 animate-slide-in-left", children: [_jsx("div", { className: `
        rounded-xl shadow-2xl border p-4 max-w-xs transition-all
        ${isStoryDriven
                        ? 'bg-[#FFFBEB] border-amber-200 shadow-amber-900/10'
                        : 'bg-white border-gray-100'}
      `, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `
            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0
            ${isStoryDriven
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md'
                                    : 'bg-gradient-to-br from-green-400 to-emerald-500'}
          `, children: isStoryDriven ? '🛍️' : '✓' }), _jsxs("div", { children: [_jsx("p", { className: `text-sm ${isStoryDriven ? 'text-amber-900 font-serif' : 'text-gray-800'}`, children: lang === 'bn' ? (_jsxs(_Fragment, { children: [_jsx("strong", { children: currentBuyer.name }), " ", currentBuyer.location && `(${currentBuyer.location})`, " ", _jsx("br", {}), _jsx("strong", { children: productName }), " ", t('landingConversion_orderedText')] })) : (_jsxs(_Fragment, { children: [_jsx("strong", { children: currentBuyer.name }), " ", currentBuyer.location && `(${currentBuyer.location})`, " ", _jsx("br", {}), t('landingConversion_orderedText'), " ", _jsx("strong", { children: productName })] })) }), _jsx("p", { className: `text-xs mt-1 ${isStoryDriven ? 'text-amber-700/70 italic' : 'text-gray-500'}`, children: currentBuyer.time })] }), _jsx("button", { onClick: () => setVisible(false), className: `ml-auto ${isStoryDriven ? 'text-amber-400 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}`, children: "\u2715" })] }) }), _jsx("style", { children: `
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
      ` })] }));
    }
}
