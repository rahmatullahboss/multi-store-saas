/**
 * Risk Badge Component
 * 
 * Displays customer fraud risk level based on their order history.
 * - 🟢 Safe Customer: Return rate < 10%
 * - 🟡 Moderate Risk: Return rate 10-30%
 * - 🔴 High Risk: Return rate > 30%
 */

import { useFetcher } from '@remix-run/react';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RiskBadgeProps {
  phone: string;
  initialRiskScore?: number | null;
  showDetails?: boolean;
  className?: string;
}

interface RiskData {
  isHighRisk: boolean;
  successRate: number;
  totalOrders: number;
  returnedOrders: number;
  riskScore: number;
}

export function RiskBadge({ 
  phone, 
  initialRiskScore,
  showDetails: _showDetails = false, 
  className = '' 
}: RiskBadgeProps) {
  const fetcher = useFetcher<RiskData | { error: string }>();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Check if we have data
  const isLoading = fetcher.state === 'submitting';
  const hasData = fetcher.data && !('error' in fetcher.data);
  const riskData = hasData ? (fetcher.data as RiskData) : null;
  
  // Calculate risk level from fetched data or initial score
  const riskScore = riskData?.riskScore ?? initialRiskScore ?? null;
  
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
      labelBn: 'নিরাপদ',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
    },
    moderate: {
      icon: Shield,
      label: 'Moderate Risk',
      labelBn: 'মাঝারি ঝুঁকি',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
    },
    high: {
      icon: ShieldAlert,
      label: 'High Risk',
      labelBn: 'উচ্চ ঝুঁকি',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
    },
    unknown: {
      icon: ShieldQuestion,
      label: 'Check Risk',
      labelBn: 'চেক করুন',
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
      { intent: 'CHECK_RISK', phone },
      { method: 'POST', action: '/api/courier/steadfast' }
    );
  };
  
  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleCheck}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          border transition-all cursor-pointer
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          hover:opacity-90 disabled:opacity-50
        `}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        )}
        <span>{riskLevel === 'unknown' ? 'Check' : config.label}</span>
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
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskBadge;
