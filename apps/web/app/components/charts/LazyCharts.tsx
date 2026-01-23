/**
 * Lazy-loaded Chart Components
 * 
 * These wrappers use React.lazy to ensure Recharts (~315KB) is only loaded
 * when charts are actually needed. This prevents the Recharts bundle
 * from being included in storefront routes.
 * 
 * Usage:
 * import { LazyAreaChart, LazyBarChart } from '~/components/charts/LazyCharts';
 * 
 * <Suspense fallback={<ChartSkeleton />}>
 *   <LazyAreaChart data={data} />
 * </Suspense>
 */

import { lazy, Suspense, type ComponentProps } from 'react';

// Lazy load the chart implementations
const AreaChartImpl = lazy(() => import('./impl/AreaChartImpl'));
const BarChartImpl = lazy(() => import('./impl/BarChartImpl'));

// Skeleton loader for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="animate-pulse bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  );
}

// Type for lazy chart props
type AreaChartProps = ComponentProps<typeof AreaChartImpl>;
type BarChartProps = ComponentProps<typeof BarChartImpl>;

// Lazy AreaChart with built-in fallback
export function LazyAreaChart(props: AreaChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height || 300} />}>
      <AreaChartImpl {...props} />
    </Suspense>
  );
}

// Lazy BarChart with built-in fallback
export function LazyBarChart(props: BarChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height || 300} />}>
      <BarChartImpl {...props} />
    </Suspense>
  );
}
