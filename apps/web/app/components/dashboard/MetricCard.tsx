/**
 * MetricCard - Enhanced stat card with trend indicator
 * Shopify-inspired design with comparison to previous period
 */

import { Link } from 'react-router';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number; // percentage change
    label: string; // "vs yesterday" or "vs last week"
  };
  link?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    border: 'border-orange-100',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    border: 'border-red-100',
  },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  link,
  color = 'blue',
}: MetricCardProps) {
  const colors = colorClasses[color];

  const TrendIcon =
    !trend ? null :
    trend.value > 0 ? TrendingUp :
    trend.value < 0 ? TrendingDown :
    Minus;

  const trendColor =
    !trend ? '' :
    trend.value > 0 ? 'text-emerald-600' :
    trend.value < 0 ? 'text-red-600' :
    'text-gray-500';

  const content = (
    <div className={`bg-white rounded-xl border ${colors.border} p-5 hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.iconText}`} />
        </div>
        {trend && TrendIcon && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className="text-xs text-gray-400 mt-1">{trend.label}</p>
      )}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}
