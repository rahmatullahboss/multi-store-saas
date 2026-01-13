/**
 * LowStockAlertBanner Component
 * 
 * Displays a warning banner when products are running low in stock.
 * Used in inventory and dashboard pages.
 */

import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface LowStockAlertBannerProps {
  count: number;
  threshold: number;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

export function LowStockAlertBanner({ 
  count, 
  threshold, 
  onAction, 
  actionText,
  className = "" 
}: LowStockAlertBannerProps) {
  const { t } = useTranslation();

  if (count <= 0) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <p className="font-medium text-yellow-800">
            {t('lowStockAlertWithCount', { count })}
          </p>
          <p className="text-sm text-yellow-600">
            {t('lowStockThresholdDesc', { threshold })}
          </p>
        </div>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition"
        >
          {actionText || t('viewLowStock')}
        </button>
      )}
    </div>
  );
}
