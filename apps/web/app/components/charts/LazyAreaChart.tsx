/**
 * Lazy-loaded Area Chart Component
 * 
 * Wraps recharts AreaChart for dynamic import to reduce server bundle size.
 * This prevents Recharts (~315KB) from being included in the main server bundle.
 */

import { lazy, Suspense } from 'react';

// Lazy load the actual chart component
const AreaChartImpl = lazy(() => import('./impl/AreaChartImpl'));

interface LazyAreaChartProps {
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

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="animate-pulse bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  );
}

export function LazyAreaChart(props: LazyAreaChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <AreaChartImpl {...props} />
    </Suspense>
  );
}
