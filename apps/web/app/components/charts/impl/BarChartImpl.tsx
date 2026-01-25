/**
 * Bar Chart Implementation
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartImplProps {
  data: Record<string, unknown>[];
  height?: number;
  bars: Array<{
    dataKey: string;
    fill: string;
    name?: string;
    radius?: number;
  }>;
  xAxisKey?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export default function BarChartImpl({
  data,
  height = 300,
  bars,
  xAxisKey = 'name',
  showGrid = true,
  showTooltip = true,
  showLegend = false,
}: BarChartImplProps) {
  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" fontSize={12} />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name}
            radius={bar.radius || 4}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
