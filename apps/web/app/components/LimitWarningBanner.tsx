/**
 * Limit Warning Banner Component
 * 
 * Displays warning when store usage approaches or exceeds plan limits
 * Used in merchant dashboard
 */

import { Link } from '@remix-run/react';
import { AlertTriangle, ArrowUpRight, X } from 'lucide-react';
import { useState } from 'react';

interface UsageStats {
  orders: { current: number; limit: number; percentage: number };
  products: { current: number; limit: number; percentage: number };
  visitors: { current: number; limit: number; percentage: number };
}

interface LimitWarningBannerProps {
  usage: UsageStats;
  planType: string;
}

export function LimitWarningBanner({ usage, planType: _planType }: LimitWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;

  // Check which limits are approaching/exceeded
  const warnings: { type: string; label: string; percentage: number; level: string }[] = [];
  
  if (usage.orders.percentage >= 70) {
    warnings.push({
      type: 'orders',
      label: 'অর্ডার',
      percentage: usage.orders.percentage,
      level: usage.orders.percentage >= 100 ? 'exceeded' : usage.orders.percentage >= 90 ? 'critical' : 'warning',
    });
  }
  
  if (usage.products.percentage >= 70) {
    warnings.push({
      type: 'products',
      label: 'প্রোডাক্ট',
      percentage: usage.products.percentage,
      level: usage.products.percentage >= 100 ? 'exceeded' : usage.products.percentage >= 90 ? 'critical' : 'warning',
    });
  }
  
  if (usage.visitors.percentage >= 70) {
    warnings.push({
      type: 'visitors',
      label: 'ভিজিটর',
      percentage: usage.visitors.percentage,
      level: usage.visitors.percentage >= 100 ? 'exceeded' : usage.visitors.percentage >= 90 ? 'critical' : 'warning',
    });
  }

  // No warnings to show
  if (warnings.length === 0) return null;

  // Get highest severity
  const hasExceeded = warnings.some(w => w.level === 'exceeded');
  const hasCritical = warnings.some(w => w.level === 'critical');
  
  const severity = hasExceeded ? 'exceeded' : hasCritical ? 'critical' : 'warning';
  
  const bgColors = {
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-orange-50 border-orange-200',
    exceeded: 'bg-red-50 border-red-200',
  };
  
  const textColors = {
    warning: 'text-yellow-800',
    critical: 'text-orange-800',
    exceeded: 'text-red-800',
  };
  
  const iconColors = {
    warning: 'text-yellow-500',
    critical: 'text-orange-500',
    exceeded: 'text-red-500',
  };

  return (
    <div className={`rounded-xl border p-4 ${bgColors[severity]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[severity]}`} />
        
        <div className="flex-1">
          <h3 className={`font-semibold ${textColors[severity]}`}>
            {hasExceeded ? 'সীমা অতিক্রম করেছে!' : 'সীমা শেষ হয়ে আসছে'}
          </h3>
          <p className={`text-sm mt-1 ${textColors[severity]} opacity-80`}>
            {warnings.map((w, i) => (
              <span key={w.type}>
                {w.label} {w.percentage >= 100 ? '১০০%' : `${w.percentage}%`}
                {i < warnings.length - 1 ? ', ' : ''}
              </span>
            ))}
            {' '}ব্যবহার হয়েছে।
            {/* Only block orders if ORDER limit is exceeded */}
            {usage.orders.percentage >= 100 
              ? ' নতুন অর্ডার গ্রহণ বন্ধ আছে।'
              : usage.products.percentage >= 100
                ? ' নতুন প্রোডাক্ট যোগ করা যাবে না। আপগ্রেড করুন।'
                : ' আপগ্রেড করুন আরো সুবিধা পেতে।'
            }
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <Link
              to="/app/upgrade"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition ${
                hasExceeded 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-[#006A4E] text-white hover:bg-[#005740]'
              }`}
            >
              আপগ্রেড করুন
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app/billing"
              className={`text-sm hover:underline ${textColors[severity]}`}
            >
              বিস্তারিত দেখুন
            </Link>
          </div>
        </div>
        
        {!hasExceeded && (
          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded hover:bg-black/5 ${textColors[severity]}`}
            aria-label="বাতিল করুন"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for sidebar or smaller spaces
 */
export function LimitWarningCompact({ usage }: { usage: UsageStats }) {
  const maxPercentage = Math.max(
    usage.orders.percentage,
    usage.products.percentage,
    usage.visitors.percentage
  );
  
  if (maxPercentage < 70) return null;
  
  const level = maxPercentage >= 100 ? 'exceeded' : maxPercentage >= 90 ? 'critical' : 'warning';
  
  const colors = {
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    critical: 'bg-orange-100 text-orange-700 border-orange-200',
    exceeded: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Link
      to="/app/billing"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${colors[level]} hover:opacity-80 transition`}
    >
      <AlertTriangle className="w-4 h-4" />
      <span className="font-medium">
        {level === 'exceeded' ? 'সীমা অতিক্রম' : 'সীমা শেষ হচ্ছে'}
      </span>
    </Link>
  );
}
