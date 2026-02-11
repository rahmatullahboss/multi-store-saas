import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '~/components/ui/Badge';
import { cn } from '~/lib/utils';
import { useTranslation } from '~/contexts/LanguageContext';

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  bgClass?: string;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const config: Record<string, StatusConfig> = {
    pending: { label: t('statusPending'), icon: Clock, className: 'text-amber-700 border-amber-200', bgClass: 'bg-amber-50' },
    confirmed: { label: t('statusConfirmed'), icon: CheckCircle2, className: 'text-blue-700 border-blue-200', bgClass: 'bg-blue-50' },
    processing: { label: t('statusProcessing'), icon: Package, className: 'text-indigo-700 border-indigo-200', bgClass: 'bg-indigo-50' },
    shipped: { label: t('statusShipped'), icon: Truck, className: 'text-purple-700 border-purple-200', bgClass: 'bg-purple-50' },
    delivered: { label: t('statusDelivered'), icon: CheckCircle2, className: 'text-emerald-700 border-emerald-200', bgClass: 'bg-emerald-50' },
    cancelled: { label: t('statusCancelled'), icon: XCircle, className: 'text-red-700 border-red-200', bgClass: 'bg-red-50' },
    returned: { label: t('statusReturned'), icon: AlertCircle, className: 'text-gray-700 border-gray-200', bgClass: 'bg-gray-50' },
  };

  const statusInfo = config[status] || config.pending;
  const Icon = statusInfo.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-normal', statusInfo.bgClass, statusInfo.className)}>
      <Icon className="h-3.5 w-3.5" />
      {statusInfo.label}
    </Badge>
  );
}
