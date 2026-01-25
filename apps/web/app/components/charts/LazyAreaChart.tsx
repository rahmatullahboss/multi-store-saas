/**
 * Lazy-loaded Area Chart Component (Client-Only)
 * 
 * Uses the Remix-recommended hydration tracking pattern to ensure
 * charts are only rendered on the client, preventing SSR hydration errors.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 */

import { lazy, Suspense, useState, useEffect } from 'react';

// Track hydration state globally - only updates once after initial hydration
let isHydrating = true;

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
      className="animate-pulse bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 dark:text-slate-500 text-sm">Loading chart...</div>
    </div>
  );
}

export function LazyAreaChart(props: LazyAreaChartProps) {
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
      <AreaChartImpl {...props} />
    </Suspense>
  );
}
