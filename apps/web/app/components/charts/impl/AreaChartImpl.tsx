/**
 * Area Chart Implementation
 * 
 * This is the actual recharts implementation that gets lazy-loaded.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface AreaChartImplProps {
  data: Record<string, unknown>[];
  height?: number;
  dataKey: string;
  xAxisKey?: string;
  stroke?: string;
  fill?: string;
  gradientId?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  referenceLine?: { y: number; label?: string; stroke?: string };
}

export default function AreaChartImpl({
  data,
  height = 300,
  dataKey,
  xAxisKey = 'name',
  stroke = '#10b981',
  fill = 'url(#colorGradient)',
  gradientId = 'colorGradient',
  showGrid = true,
  showTooltip = true,
  referenceLine,
}: AreaChartImplProps) {
  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" fontSize={12} />
        {showTooltip && <Tooltip />}
        {referenceLine && (
          <ReferenceLine
            y={referenceLine.y}
            label={referenceLine.label}
            stroke={referenceLine.stroke || '#f59e0b'}
            strokeDasharray="5 5"
          />
        )}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          fill={fill}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
