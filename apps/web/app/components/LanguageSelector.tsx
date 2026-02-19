/**
 * Language Selector Component
 * 
 * A dropdown/toggle for switching between languages
 * Extensible - automatically shows all available languages from config
 * 
 * Variants:
 * - dropdown: Shows a dropdown menu with all languages (default)
 * - toggle: Simple toggle button (for 2 languages)
 * - pills: Horizontal pill buttons
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'pills';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageSelector({
  variant = 'dropdown',
  showFlag = true,
  showName = true,
  className = '',
  size = 'md',
}: LanguageSelectorProps) {
  const { lang, setLang, currentLanguage, availableLanguages, toggleLang } = useLanguage();
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

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  // Toggle variant - simple button for 2 languages
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleLang}
        className={`
          inline-flex items-center gap-2 rounded-lg border border-gray-200 
          bg-white hover:bg-gray-50 transition-colors font-medium
          ${sizeClasses[size]} ${className}
        `}
        title="Toggle language"
      >
        {showFlag && currentLanguage?.flag}
        {showName && (
          <span className="font-medium">
            {lang === 'en' ? 'বাংলা' : 'English'}
          </span>
        )}
      </button>
    );
  }

  // Pills variant - horizontal buttons with improved UI
  if (variant === 'pills') {
    return (
      <div className={`inline-flex rounded-xl bg-gray-100 p-1 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => setLang(language.code)}
            className={`
              ${sizeClasses[size]} font-semibold rounded-lg transition-all duration-200
              ${lang === language.code
                ? 'bg-[#006A4E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            {showFlag && <span className="mr-1.5">{language.flag}</span>}
            {showName ? language.nativeName : language.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 rounded-lg border border-gray-200 
          bg-white hover:bg-gray-50 transition-colors
          ${sizeClasses[size]}
        `}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        {showFlag && currentLanguage?.flag}
        {showName && (
          <span className="font-medium text-gray-700">
            {currentLanguage?.nativeName || 'Language'}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors
                ${lang === language.code ? 'bg-emerald-50' : ''}
              `}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{language.nativeName}</div>
                <div className="text-xs text-gray-500">{language.name}</div>
              </div>
              {lang === language.code && (
                <Check className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact language toggle - just shows current flag/code
 * Good for headers where space is limited
 */
export function CompactLanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang, currentLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
        bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium
        ${className}
      `}
      title={`Switch to ${lang === 'en' ? 'বাংলা' : 'English'}`}
    >
      <span className="text-base">{currentLanguage?.flag}</span>
      <span className="uppercase font-bold text-gray-700">{lang}</span>
    </button>
  );
}
