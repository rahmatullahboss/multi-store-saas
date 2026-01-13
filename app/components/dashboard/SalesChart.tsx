/**
 * SalesChart - Simple SVG-based sales chart
 * No external library dependency - lightweight and fast
 */

import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

interface SalesDataPoint {
  date: string;
  label: string;
  value: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  currency?: string;
}

export function SalesChart({ data, currency = 'BDT' }: SalesChartProps) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        {t('noSalesData')}
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;
  const chartWidth = 100; // percentage
  const barWidth = chartWidth / data.length;
  const padding = 2; // gap between bars

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10 whitespace-nowrap"
          style={{
            left: `${(hoveredIndex + 0.5) * barWidth}%`,
          }}
        >
          <p className="font-semibold">{formatPrice(data[hoveredIndex].value)}</p>
          <p className="text-gray-300 text-xs">{data[hoveredIndex].label}</p>
        </div>
      )}

      {/* Chart */}
      <div className="h-52 flex items-end gap-1">
        {data.map((point, index) => {
          const height = (point.value / maxValue) * chartHeight;
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`w-full rounded-t-md transition-all duration-200 cursor-pointer ${
                  isHovered 
                    ? 'bg-emerald-500' 
                    : 'bg-emerald-200 hover:bg-emerald-300'
                }`}
                style={{ 
                  height: `${Math.max(height, 4)}px`,
                  minHeight: '4px'
                }}
              />
              <p className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                {point.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
        <div>
          <p className="text-gray-500">{t('totalSalesShort')}</p>
          <p className="font-bold text-gray-900 text-lg">
            {formatPrice(data.reduce((sum, d) => sum + d.value, 0))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">{t('avgPerDay')}</p>
          <p className="font-bold text-gray-900 text-lg">
            {formatPrice(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
