/**
 * Risk Badge Component
 * 
 * Displays customer fraud risk level using Steadfast external check.
 * Posts FRAUD_CHECK intent to the current page action, which saves to KV.
 * Accepts initialData prop to show persisted result on page load.
 *
 * Risk Levels:
 * - 🟢 Safe Customer: Risk score ≤ 10%
 * - 🟡 Moderate Risk: Risk score 10-30%
 * - 🔴 High Risk: Risk score > 30%
 */

import { useFetcher } from '@remix-run/react';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface FraudCacheData {
  successRate: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  isHighRisk: boolean;
  riskScore: number;
  source?: string;
  cachedAt?: string;
}

interface RiskBadgeProps {
  phone: string;
  /** Pre-loaded fraud data from KV cache (passed by loader) */
  initialData?: FraudCacheData | null;
  /** The orderId to pass in the FRAUD_CHECK form submission */
  orderId?: number;
  showDetails?: boolean;
  className?: string;
}

export function RiskBadge({ 
  phone, 
  initialData = null,
  orderId,
  showDetails: _showDetails = false, 
  className = '' 
}: RiskBadgeProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    riskResult?: FraudCacheData;
    error?: string;
  }>();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isLoading = fetcher.state !== 'idle';
  
  // Use fetcher result first, then fall back to initial data from KV
  const riskData: FraudCacheData | null = 
    (fetcher.data?.success && fetcher.data.riskResult) 
      ? fetcher.data.riskResult 
      : initialData;
  
  const riskScore = riskData?.riskScore ?? null;
  
  const getRiskLevel = (score: number | null) => {
    if (score === null) return 'unknown';
    if (score <= 10) return 'safe';
    if (score <= 30) return 'moderate';
    return 'high';
  };
  
  const riskLevel = riskScore !== null ? getRiskLevel(riskScore) : 'unknown';
  
  const riskConfig = {
    safe: {
      icon: ShieldCheck,
      label: 'Safe Customer',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
    },
    moderate: {
      icon: Shield,
      label: 'Moderate Risk',
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
      label: 'Check',
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
    
    // Post FRAUD_CHECK to the CURRENT page action (not a separate API route)
    // Both app.orders._index and app.orders.$id have this intent handler
    fetcher.submit(
      { intent: 'FRAUD_CHECK', orderId: String(orderId || 0), phone },
      { method: 'POST' }
    );
  };
  
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
        <span>{config.label}</span>
      </button>
      
      {/* Tooltip with details */}
      {showTooltip && riskData && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Total Orders:</span>
                <span className="font-medium">{riskData.totalOrders}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Success Rate:</span>
                <span className="font-medium">{riskData.successRate}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Returns:</span>
                <span className="font-medium">{riskData.returnedOrders}</span>
              </div>
              {riskData.cachedAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Source:</span>
                  <span className="font-medium">⚡ Cached</span>
                </div>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskBadge;
