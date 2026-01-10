import { useTranslation } from '~/contexts/LanguageContext';

export function LanguageDebug() {
  const { t, lang } = useTranslation();
  
  return (
    <div className="fixed top-4 left-4 z-[9999] bg-black/90 text-white p-4 rounded-lg text-xs font-mono">
      <div>Current Language: <strong>{lang}</strong></div>
      <div>Test Key: <strong>{t('landingOzzylChat_greetingMsg')}</strong></div>
      <div>URL: <strong>{typeof window !== 'undefined' ? window.location.href : 'SSR'}</strong></div>
    </div>
  );
}
