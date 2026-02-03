import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export interface AreaChartProps {
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
  fill,
  gradientId = 'colorGradient',
  showGrid = true,
  showTooltip = true,
  referenceLine,
}: AreaChartProps) {
  const isAdminRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/app'));
  if (!isAdminRoute) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          fill={fill || `url(#${gradientId})`}
          strokeWidth={2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
