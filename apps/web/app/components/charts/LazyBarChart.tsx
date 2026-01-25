/**
 * Lazy-loaded Bar Chart Component (Client-Only)
 * 
 * Uses the Remix-recommended hydration tracking pattern to ensure
 * charts are only rendered on the client, preventing SSR hydration errors.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 */

import { lazy, Suspense, useState, useEffect } from 'react';

// Track hydration state globally - only updates once after initial hydration
let isHydrating = true;

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
      className="animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 dark:text-slate-500 text-sm">Loading chart...</div>
    </div>
  );
}

export function LazyBarChart(props: LazyBarChartProps) {
  // Use hydration tracking to prevent SSR rendering of charts
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  // Don't render chart during SSR or before hydration
  if (!isHydrated) {
    return <ChartSkeleton height={props.height} />;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <BarChartImpl {...props} />
    </Suspense>
  );
}
