/**
 * RecentOrders - Compact recent orders list
 * Shows last 5 orders with quick actions
 */

import { Link } from 'react-router';
import { ChevronRight, Clock, Package, Truck, CheckCircle, XCircle, ThumbsUp, RotateCcw } from 'lucide-react';

interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string | null;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | null;
  createdAt: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
  currency?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
  },
  confirmed: {
    icon: ThumbsUp,
    label: 'Confirmed',
    color: 'bg-cyan-100 text-cyan-700',
  },
  processing: {
    icon: Package,
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
  },
  returned: {
    icon: RotateCcw,
    label: 'Returned',
    color: 'bg-orange-100 text-orange-700',
  },
};

export function RecentOrders({ orders, currency = 'BDT' }: RecentOrdersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-BD', { month: 'short', day: 'numeric' });
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No orders yet</h3>
        <p className="text-sm text-gray-500">Orders will appear here when customers place them</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {orders.map((order) => {
        const orderStatus = order.status || 'pending';
        const status = statusConfig[orderStatus];
        const StatusIcon = status.icon;

        return (
          <Link
            key={order.id}
            to={`/app/orders/${order.id}`}
            className="flex items-center gap-4 py-4 hover:bg-gray-50 -mx-4 px-4 transition group first:pt-0 last:pb-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {order.customerName} • {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition" />
          </Link>
        );
      })}
      
      {/* View All Link */}
      <div className="pt-4">
        <Link
          to="/app/orders"
          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
        >
          View all orders
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
