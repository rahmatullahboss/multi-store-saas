/**
 * Risk Badge Component
 *
 * Shows customer delivery/return rate from courier API data.
 * No numeric score shown — only human-readable risk label + percentages.
 *
 * Risk Levels (based on successRate from courier API):
 * - 🟢 Low Risk:      deliveryRate ≥ 80%
 * - 🟡 Medium Risk:   deliveryRate 50–79%
 * - 🔴 High Risk:     deliveryRate < 50%
 * - ⚫ Unknown:        no data yet (click to check)
 */

import { useFetcher } from 'react-router';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface FraudCacheData {
  successRate: number;      // delivery rate % (from courier API)
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  isHighRisk: boolean;
  riskScore: number;        // kept for backend logic, not shown in UI
  source?: string;
  cachedAt?: string;
}

interface RiskBadgeProps {
  phone: string;
  initialData?: FraudCacheData | null;
  orderId?: number;
  showDetails?: boolean;
  className?: string;
}

/** Map delivery rate → risk level (no score shown in UI) */
function getRiskLevelFromRate(successRate: number): 'low' | 'medium' | 'high' {
  if (successRate >= 80) return 'low';
  if (successRate >= 50) return 'medium';
  return 'high';
}

export function RiskBadge({
  phone,
  initialData = null,
  orderId,
  showDetails: _showDetails = false,
  className = '',
}: RiskBadgeProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    riskResult?: FraudCacheData;
    error?: string;
  }>();
  const [showTooltip, setShowTooltip] = useState(false);

  const isLoading = fetcher.state !== 'idle';

  const riskData: FraudCacheData | null =
    fetcher.data?.success && fetcher.data.riskResult
      ? fetcher.data.riskResult
      : initialData;

  const hasData = riskData !== null && riskData.totalOrders > 0;
  const riskLevel = hasData ? getRiskLevelFromRate(riskData!.successRate) : 'unknown';

  const riskConfig = {
    low: {
      icon: ShieldCheck,
      label: 'Low Risk',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
    },
    medium: {
      icon: Shield,
      label: 'Medium Risk',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
    },
    high: {
      icon: ShieldAlert,
      label: 'High Risk',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
    },
    unknown: {
      icon: ShieldQuestion,
      label: 'Check Risk',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-400',
    },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const handleCheck = () => {
    if (!phone || isLoading) return;
    fetcher.submit(
      { intent: 'FRAUD_CHECK', orderId: String(orderId || 0), phone },
      { method: 'POST' }
    );
  };

  // Delivery rate label shown in badge when data available
  const deliveryRateLabel = hasData
    ? `${riskData!.successRate}% Delivery`
    : config.label;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={riskLevel === 'unknown' ? handleCheck : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          border transition-all ${riskLevel === 'unknown' ? 'cursor-pointer' : 'cursor-default'}
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          hover:opacity-90 disabled:opacity-50
        `}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        )}
        <span>{deliveryRateLabel}</span>
      </button>

      {/* Tooltip: delivery rate + return rate details */}
      {showTooltip && riskData && hasData && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Total Orders:</span>
                <span className="font-medium">{riskData.totalOrders}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Delivery Rate:</span>
                <span className="font-medium text-emerald-400">{riskData.successRate}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Return Rate:</span>
                <span className="font-medium text-red-400">
                  {riskData.totalOrders > 0
                    ? Math.round((riskData.returnedOrders / riskData.totalOrders) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Returned:</span>
                <span className="font-medium">{riskData.returnedOrders} orders</span>
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskBadge;
