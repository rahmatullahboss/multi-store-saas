/**
 * ActionItems - Todo-style action items for dashboard
 * Shows pending tasks that need merchant attention
 */

import { Link } from 'react-router';
import { 
  AlertTriangle, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

import { useTranslation } from '~/contexts/LanguageContext';

interface ActionItem {
  id: string;
  type: 'low_stock' | 'pending_order' | 'abandoned_cart' | 'domain_request';
  count: number;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

interface ActionItemsProps {
  items: ActionItem[];
}

const iconMap = {
  low_stock: Package,
  pending_order: ShoppingCart,
  abandoned_cart: ShoppingBag,
  domain_request: AlertTriangle,
};

const priorityColors = {
  high: 'bg-red-100 text-red-600 border-red-200',
  medium: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  low: 'bg-blue-100 text-blue-600 border-blue-200',
};

export function ActionItems({ items }: ActionItemsProps) {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{t('allCaughtUp')}</h3>
        <p className="text-sm text-gray-500">{t('noPendingActions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = iconMap[item.type] || AlertTriangle;
        const priorityClass = priorityColors[item.priority];
        
        // Resolve translations based on type
        let titleKey = 'actionItems';
        let descKey = 'actionItems';
        
        switch (item.type) {
          case 'pending_order':
            titleKey = 'pendingOrdersTitle';
            descKey = 'pendingOrdersDesc';
            break;
          case 'low_stock':
            titleKey = 'lowStockTitle';
            descKey = 'lowStockDesc';
            break;
          case 'abandoned_cart':
            titleKey = 'abandonedCartsTitle';
            descKey = 'abandonedCartsDesc';
            break;
        }

        return (
          <Link
            key={item.id}
            to={item.link}
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{t(titleKey)}</p>
                {item.count && item.count > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                    {item.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {t(descKey, { count: item.count })}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
          </Link>
        );
      })}
    </div>
  );
}
