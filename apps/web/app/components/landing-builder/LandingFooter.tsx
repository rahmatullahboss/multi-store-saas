/**
 * Landing Page Footer Component
 * Reusable footer for all landing page templates
 */

import { useTranslation } from '~/contexts/LanguageContext';

interface LandingFooterProps {
  storeName: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export function LandingFooter({ storeName, theme = 'dark', className = '' }: LandingFooterProps) {
  const { t } = useTranslation();
  
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
  const textClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const borderClass = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  const hoverClass = theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900';
  
  return (
    <footer className={`${bgClass} ${textClass} py-8 border-t ${borderClass} ${className}`}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className={`font-semibold ${headingClass} mb-2`}>{storeName}</p>
        <p className="text-sm mb-4" suppressHydrationWarning>© {new Date().getFullYear()} {t('allRightsReserved')}</p>
        {/* Policy Links */}
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <a href="/policies/privacy" className={`${hoverClass} transition`}>
            {t('privacyPolicy') || 'Privacy Policy'}
          </a>
          <span className="opacity-50">•</span>
          <a href="/policies/terms" className={`${hoverClass} transition`}>
            {t('termsOfService') || 'Terms of Service'}
          </a>
          <span className="opacity-50">•</span>
          <a href="/policies/refund" className={`${hoverClass} transition`}>
            {t('refundPolicy') || 'Refund Policy'}
          </a>
        </div>
      </div>
    </footer>
  );
}
