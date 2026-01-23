/**
 * Lazy-loaded Bar Chart Component
 */

import { lazy, Suspense } from 'react';

const BarChartImpl = lazy(() => import('./impl/BarChartImpl'));

interface LazyBarChartProps {
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

export function LazyBarChart(props: LazyBarChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <BarChartImpl {...props} />
    </Suspense>
  );
}
