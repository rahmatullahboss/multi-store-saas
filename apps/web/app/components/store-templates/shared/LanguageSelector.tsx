
import { useLanguage } from '~/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'minimal' | 'full' | 'dropdown';
  iconSize?: number;
}

export function LanguageSelector({ className = '', variant = 'minimal', iconSize = 16 }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  if (variant === 'dropdown') {
    return (
      <button 
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors ${className}`}
        aria-label="Switch Language"
      >
        <Globe size={iconSize} className="opacity-70" />
        <span className="font-medium text-sm uppercase">{lang}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors ${className}`}
      title={lang === 'en' ? 'Switch to Bengali' : 'Switch to English'}
    >
      <Globe size={iconSize} />
      <span className="font-medium">
        {lang === 'en' ? 'বাংলা' : 'English'}
      </span>
    </button>
  );
}
