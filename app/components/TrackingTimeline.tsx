/**
 * Tracking Timeline Component
 * 
 * Displays shipment tracking progress as a visual timeline.
 * Steps: Order Placed → Picked Up → In Transit → Out for Delivery → Delivered
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
  X 
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrackingTimelineProps {
  consignmentId: string;
  trackingCode?: string;
  currentStatus?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StatusResponse {
  status: string;
  trackingCode: string;
  normalizedStatus: string;
  timelineStep: number;
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

export function TrackingTimeline({ 
  consignmentId, 
  trackingCode,
  currentStatus,
  isOpen, 
  onClose 
}: TrackingTimelineProps) {
  const fetcher = useFetcher<StatusResponse | { error: string }>();
  const [activeStep, setActiveStep] = useState(0);
  
  const isLoading = fetcher.state === 'submitting';
  const hasData = fetcher.data && !('error' in fetcher.data);
  const statusData = hasData ? (fetcher.data as StatusResponse) : null;
  
  // Fetch status when modal opens
  useEffect(() => {
    if (isOpen && consignmentId) {
      fetcher.submit(
        { intent: 'GET_STATUS', consignmentId },
        { method: 'POST', action: '/api/courier/steadfast' }
      );
    }
  }, [isOpen, consignmentId]);
  
  // Update active step when data arrives
  useEffect(() => {
    if (statusData) {
      setActiveStep(statusData.timelineStep);
    } else if (currentStatus) {
      // Fallback to current status
      const stepIndex = TIMELINE_STEPS.findIndex(s => 
        currentStatus.toLowerCase().includes(s.key)
      );
      setActiveStep(stepIndex >= 0 ? stepIndex : 0);
    }
  }, [statusData, currentStatus]);
  
  const handleRefresh = () => {
    if (consignmentId) {
      fetcher.submit(
        { intent: 'GET_STATUS', consignmentId },
        { method: 'POST', action: '/api/courier/steadfast' }
      );
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Track Shipment</h2>
            {(statusData?.trackingCode || trackingCode) && (
              <p className="text-sm text-gray-500">
                Tracking: {statusData?.trackingCode || trackingCode}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isLoading && !statusData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= activeStep;
                const isCurrent = index === activeStep;
                const isLast = index === TIMELINE_STEPS.length - 1;
                
                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Timeline line and dot */}
                    <div className="flex flex-col items-center">
                      <div 
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          transition-all duration-300
                          ${isCurrent 
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                            : isCompleted 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-100 text-gray-400'}
                        `}
                      >
                        <Icon className="w-5 h-5" />
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
                          ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                        `}
                      >
                        {step.label}
                        <span className="text-xs ml-1 text-gray-400">({step.labelBn})</span>
                      </h3>
                      <p 
                        className={`
                          text-sm transition-colors
                          ${isCompleted ? 'text-gray-500' : 'text-gray-400'}
                        `}
                      >
                        {step.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
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
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {fetcher.data.error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Powered by Steadfast Courier
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrackingTimeline;
