/**
 * Language & Currency Toggle Component
 * 
 * Dropdown component for storefront header
 * Allows users to switch between languages and currencies
 */

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import type { SupportedLocale, SupportedCurrency } from '~/utils/formatPrice';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  showCurrency?: boolean;
  variant?: 'light' | 'dark';
}

const LANGUAGES: { code: SupportedLocale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
];

const CURRENCIES: { code: SupportedCurrency; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'BDT', label: 'BDT', symbol: '৳' },
];

export function LanguageToggle({ 
  className = '', 
  showCurrency = true,
  variant = 'light' 
}: LanguageToggleProps) {
  const { locale, currency, setLocale, setCurrency } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];
  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const isDark = variant === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-700';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor} ${hoverBg} transition-colors`}
        aria-label="Language and currency settings"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage.flag} {showCurrency && `/ ${currentCurrency.symbol}`}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg ${bgColor} border ${borderColor} z-50 overflow-hidden`}>
          {/* Language Section */}
          <div className="p-2">
            <p className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Language
            </p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${hoverBg} transition-colors ${
                  locale === lang.code ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className={`text-sm ${textColor}`}>{lang.label}</span>
                {locale === lang.code && (
                  <span className="ml-auto text-emerald-500">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Currency Section */}
          {showCurrency && (
            <>
              <div className={`border-t ${borderColor}`} />
              <div className="p-2">
                <p className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Currency
                </p>
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${hoverBg} transition-colors ${
                      currency === curr.code ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''
                    }`}
                  >
                    <span className="text-lg font-bold">{curr.symbol}</span>
                    <span className={`text-sm ${textColor}`}>{curr.label}</span>
                    {currency === curr.code && (
                      <span className="ml-auto text-emerald-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
