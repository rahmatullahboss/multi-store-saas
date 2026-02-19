/**
 * Tracking Timeline Component
 *
 * Displays shipment tracking progress as a visual timeline.
 * Steps: Order Placed → Picked Up → In Transit → Out for Delivery → Delivered
 *
 * Supports multiple courier providers: Steadfast, Pathao, RedX
 */

import { useFetcher } from '@remix-run/react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type CourierProvider = 'steadfast' | 'pathao' | 'redx';

interface TrackingTimelineProps {
  consignmentId: string;
  trackingCode?: string;
  currentStatus?: string;
  courierProvider?: CourierProvider;
  isOpen: boolean;
  onClose: () => void;
}

interface StatusResponse {
  status: string;
  trackingCode?: string;
  normalizedStatus: string;
  timelineStep: number;
  isTerminal?: boolean;
  terminalType?: 'returned' | 'cancelled';
}

const TIMELINE_STEPS = [
  {
    key: 'pending',
    label: 'Order Placed',
    labelBn: 'অর্ডার প্লেসড',
    icon: Package,
    description: 'Order has been booked with courier',
  },
  {
    key: 'picked',
    label: 'Picked Up',
    labelBn: 'পিক আপ',
    icon: Package,
    description: 'Courier has picked up the package',
  },
  {
    key: 'in_transit',
    label: 'In Transit',
    labelBn: 'ট্রানজিটে',
    icon: Truck,
    description: 'Package is on the way',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    labelBn: 'ডেলিভারিতে',
    icon: MapPin,
    description: 'Package is out for delivery',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    labelBn: 'ডেলিভার্ড',
    icon: CheckCircle,
    description: 'Package has been delivered',
  },
];

const PROVIDER_CONFIG: Record<CourierProvider, { name: string; color: string; bgColor: string }> = {
  steadfast: { name: 'Steadfast', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  pathao: { name: 'Pathao', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  redx: { name: 'RedX', color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200' },
};

function getApiEndpoint(provider: CourierProvider): string {
  switch (provider) {
    case 'pathao': return '/api/courier/pathao';
    case 'redx': return '/api/courier/redx';
    case 'steadfast':
    default: return '/api/courier/steadfast';
  }
}

function getProviderLabel(provider: CourierProvider): string {
  return PROVIDER_CONFIG[provider]?.name || provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function TrackingTimeline({
  consignmentId,
  trackingCode,
  currentStatus,
  courierProvider = 'steadfast',
  isOpen,
  onClose
}: TrackingTimelineProps): React.ReactElement | null {
  const fetcher = useFetcher<StatusResponse | { error: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [terminalState, setTerminalState] = useState<'returned' | 'cancelled' | null>(null);

  const isLoading = fetcher.state === 'submitting';
  const hasData = fetcher.data && !('error' in fetcher.data);
  const statusData = hasData ? (fetcher.data as StatusResponse) : null;
  const providerConfig = PROVIDER_CONFIG[courierProvider] || PROVIDER_CONFIG.steadfast;

  // Fetch status when modal opens
  useEffect(() => {
    if (isOpen && consignmentId) {
      // RedX doesn't have a GET_STATUS endpoint yet — skip API call
      if (courierProvider === 'redx') return;

      fetcher.submit(
        { intent: 'GET_STATUS', consignmentId },
        { method: 'POST', action: getApiEndpoint(courierProvider) }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, consignmentId, courierProvider]);

  // Update active step when data arrives
  useEffect(() => {
    if (statusData) {
      setActiveStep(statusData.timelineStep);
      if (statusData.isTerminal && statusData.terminalType) {
        setTerminalState(statusData.terminalType);
      } else {
        setTerminalState(null);
      }
    } else if (currentStatus) {
      // Check for terminal states from currentStatus
      const lowerStatus = currentStatus.toLowerCase();
      if (lowerStatus.includes('return')) {
        setTerminalState('returned');
        setActiveStep(2); // Show up to in_transit
      } else if (lowerStatus.includes('cancel')) {
        setTerminalState('cancelled');
        setActiveStep(0);
      } else {
        setTerminalState(null);
        const stepIndex = TIMELINE_STEPS.findIndex(s =>
          lowerStatus.includes(s.key)
        );
        setActiveStep(stepIndex >= 0 ? stepIndex : 0);
      }
    }
  }, [statusData, currentStatus]);

  const handleRefresh = (): void => {
    if (consignmentId && courierProvider !== 'redx') {
      fetcher.submit(
        { intent: 'GET_STATUS', consignmentId },
        { method: 'POST', action: getApiEndpoint(courierProvider) }
      );
    }
  };

  const handleCopyConsignment = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(consignmentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Track Shipment</h2>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${providerConfig.bgColor} ${providerConfig.color}`}>
                  via {providerConfig.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {courierProvider !== 'redx' && (
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Shipment Info Summary */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Consignment ID</p>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-sm font-mono font-semibold text-gray-900">
                  {consignmentId}
                </code>
                <button
                  onClick={handleCopyConsignment}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition"
                  title="Copy consignment ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {statusData && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                <span className={`inline-block mt-0.5 text-sm font-medium ${
                  terminalState === 'returned' ? 'text-orange-600' :
                  terminalState === 'cancelled' ? 'text-red-600' :
                  statusData.normalizedStatus === 'delivered' ? 'text-emerald-600' :
                  'text-blue-600'
                }`}>
                  {statusData.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Terminal state banner */}
          {terminalState && (
            <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${
              terminalState === 'returned'
                ? 'bg-orange-50 border-orange-200 text-orange-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {terminalState === 'returned' ? (
                <RotateCcw className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {terminalState === 'returned' ? 'Package Returned' : 'Order Cancelled'}
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  {terminalState === 'returned'
                    ? 'The package has been returned to sender'
                    : 'This shipment has been cancelled'}
                </p>
              </div>
            </div>
          )}

          {isLoading && !statusData ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Fetching tracking info...</p>
            </div>
          ) : courierProvider === 'redx' && !statusData ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Package className="w-10 h-10 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">RedX Tracking</p>
                <p className="text-xs text-gray-500 mt-1">
                  Real-time tracking is not yet available for RedX.
                </p>
                <p className="text-xs text-gray-500">
                  Use the consignment ID above to check status on RedX portal.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = !terminalState && index <= activeStep;
                const isCurrent = !terminalState && index === activeStep;
                const isLast = index === TIMELINE_STEPS.length - 1;
                // When terminal, dim everything past the last active step
                const isDimmed = terminalState ? index > activeStep : false;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Timeline line and dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          transition-all duration-300 relative
                          ${isCurrent
                            ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                            : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isDimmed
                                ? 'bg-gray-100 text-gray-300'
                                : 'bg-gray-100 text-gray-400'}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`
                            w-0.5 h-12 transition-colors duration-300
                            ${isCompleted && index < activeStep
                              ? 'bg-emerald-500'
                              : 'bg-gray-200'}
                          `}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                      <h3
                        className={`
                          font-medium transition-colors
                          ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : isDimmed ? 'text-gray-300' : 'text-gray-400'}
                        `}
                      >
                        {step.label}
                        <span className={`text-xs ml-1 ${isDimmed ? 'text-gray-300' : 'text-gray-400'}`}>({step.labelBn})</span>
                      </h3>
                      <p
                        className={`
                          text-sm transition-colors
                          ${isCompleted ? 'text-gray-500' : isDimmed ? 'text-gray-300' : 'text-gray-400'}
                        `}
                      >
                        {step.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium">
                          <Clock className="w-3 h-3" />
                          Current Status
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Error state */}
          {fetcher.data && 'error' in fetcher.data && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{fetcher.data.error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Tracking via {getProviderLabel(courierProvider)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrackingTimeline;
