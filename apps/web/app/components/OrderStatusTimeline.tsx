import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle,
} from 'lucide-react';

interface OrderStatusTimelineProps {
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  createdAt: string | Date;
}

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

export function OrderStatusTimeline({
  status,
  createdAt,
}: OrderStatusTimelineProps) {
  const isCancelled = status === 'cancelled';

  // Determine active step index
  let activeStepIndex = steps.findIndex((step) => step.key === status);
  if (activeStepIndex === -1 && !isCancelled) activeStepIndex = 0; // fallback

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>

      <div className="space-y-6">
        {isCancelled ? (
          // Cancelled Flow
          <>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div className="w-0.5 h-12 bg-gray-200" />
              </div>
              <div className="pt-2">
                <h3 className="font-medium text-gray-900">Order Placed</h3>
                <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white ring-4 ring-red-100">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-2">
                <h3 className="font-medium text-red-600">Cancelled</h3>
                <p className="text-sm text-gray-400">
                  Order has been cancelled
                </p>
              </div>
            </div>
          </>
        ) : (
          // Normal Flow
          steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= activeStepIndex;
            const isCurrent = index === activeStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${
                        isCurrent
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isLast && (
                    <div
                      className={`
                        w-0.5 h-12 transition-colors duration-300
                        ${isCompleted && index < activeStepIndex
                          ? 'bg-emerald-500'
                          : 'bg-gray-200'
                        }
                      `}
                    />
                  )}
                </div>

                <div className="pt-2">
                  <h3
                    className={`
                      font-medium transition-colors
                      ${
                        isCurrent
                          ? 'text-emerald-600'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`
                      text-sm transition-colors
                      ${isCompleted ? 'text-gray-500' : 'text-gray-400'}
                    `}
                  >
                    {step.key === 'pending'
                      ? formatDate(createdAt)
                      : isCompleted
                      ? '(completed)'
                      : '(pending)'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
