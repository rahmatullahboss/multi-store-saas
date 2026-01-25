/**
 * Lazy-loaded Chart Components (Client-Only)
 * 
 * Uses the Remix-recommended hydration tracking pattern to ensure
 * charts are only rendered on the client, preventing SSR hydration errors.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 * 
 * Usage:
 * import { LazyAreaChart, LazyBarChart } from '~/components/charts/LazyCharts';
 * 
 * <LazyAreaChart data={data} height={300} dataKey="value" />
 */

import { lazy, Suspense, useState, useEffect, type ComponentProps } from 'react';

// Track hydration state globally - only updates once after initial hydration
let isHydrating = true;

// Lazy load the chart implementations
const AreaChartImpl = lazy(() => import('./impl/AreaChartImpl'));
const BarChartImpl = lazy(() => import('./impl/BarChartImpl'));

// Skeleton loader for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 dark:text-slate-500 text-sm">Loading chart...</div>
    </div>
  );
}

// Custom hook for hydration tracking
function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Type for lazy chart props
type AreaChartProps = ComponentProps<typeof AreaChartImpl>;
type BarChartProps = ComponentProps<typeof BarChartImpl>;

// Lazy AreaChart with client-only rendering
export function LazyAreaChart(props: AreaChartProps) {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return <ChartSkeleton height={props.height || 300} />;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={props.height || 300} />}>
      <AreaChartImpl {...props} />
    </Suspense>
  );
}

// Lazy BarChart with client-only rendering
export function LazyBarChart(props: BarChartProps) {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return <ChartSkeleton height={props.height || 300} />;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={props.height || 300} />}>
      <BarChartImpl {...props} />
    </Suspense>
  );
}
