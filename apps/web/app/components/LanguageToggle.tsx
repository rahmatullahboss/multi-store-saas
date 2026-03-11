import { Globe } from 'lucide-react';
import { useTranslation } from '~/hooks/useTranslation';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { lang, toggleLang } = useTranslation();

  return (
    <button
      onClick={toggleLang}
      className={`
        inline-flex items-center gap-2 rounded-lg border border-gray-200
        bg-white hover:bg-gray-50 transition-colors font-medium
        text-sm px-3 py-2 ${className}
      `}
      title="Toggle language"
    >
      <Globe className="w-4 h-4 text-gray-500" />
      <span className="font-medium">
        <span className={lang === 'en' ? 'text-emerald-600 font-bold' : 'text-gray-500'}>EN</span>
        <span className="text-gray-300 mx-1">|</span>
        <span className={lang === 'bn' ? 'text-emerald-600 font-bold' : 'text-gray-500'}>বাং</span>
      </span>
    </button>
  );
}