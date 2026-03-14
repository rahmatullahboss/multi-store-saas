/**
 * StatCard - Compact stat card for page headers
 * Shopify-inspired design
 */

import { Link } from 'react-router';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'emerald' | 'yellow' | 'red' | 'purple' | 'gray';
  href?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-100 text-blue-600',
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
  red: 'bg-red-50 border-red-100 text-red-600',
  purple: 'bg-purple-50 border-purple-100 text-purple-600',
  gray: 'bg-gray-50 border-gray-100 text-gray-600',
};

export function StatCard({ label, value, icon, color = 'gray', href, trend }: StatCardProps) {
  const colorClass = colorClasses[color];

  const content = (
    <div className={`rounded-xl border p-4 ${colorClass} ${href ? 'hover:shadow-md cursor-pointer' : ''} transition`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}
