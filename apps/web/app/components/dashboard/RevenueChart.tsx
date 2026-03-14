import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from '~/contexts/LanguageContext';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  currency?: string;
}

type Period = '7D' | '30D' | '90D';

export function RevenueChart({ data, currency = 'BDT' }: RevenueChartProps) {
  const { t, lang } = useTranslation();
  const [period, setPeriod] = useState<Period>('30D');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const daysMap: Record<Period, number> = {
      '7D': 7,
      '30D': 30,
      '90D': 90,
    };

    const daysToKeep = daysMap[period];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    cutoffDate.setHours(0, 0, 0, 0);

    return data.filter(d => {
      const pointDate = new Date(d.date);
      return pointDate >= cutoffDate;
    });
  }, [data, period]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-4 border border-gray-100 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {t('revenue') || 'Revenue'}: {formatPrice(payload[0].value)}
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              {t('orders') || 'Orders'}: {payload[0].payload.orders}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t('revenueTrend') || 'Revenue Trend'}</h3>
          <p className="text-sm text-gray-500">{t('revenueOverTime') || 'Revenue over selected period'}</p>
        </div>

        {/* Period Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['7D', '30D', '90D'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `৳${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
                  }
                  return `৳${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            {t('noRevenueData') || 'No revenue data available'}
          </div>
        )}
      </div>
    </div>
  );
}
