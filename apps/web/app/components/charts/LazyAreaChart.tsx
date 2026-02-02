/**
 * Lazy-loaded Area Chart Component
 * 
 * Uses lazyLoad to ensure recharts is loaded strictly on demand.
 */

import { lazyLoad, ComponentSkeleton } from '~/lib/lazy-imports';
// Import types only
import type { AreaChartProps } from './AreaChart.impl';

// Export type for consumers
export type { AreaChartProps };

// Custom Skeleton for Chart
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <ComponentSkeleton 
      height={`${height}px`} 
      className="flex items-center justify-center bg-gray-100 dark:bg-slate-800"
    />
  );
}

// Lazy load the implementation
export const LazyAreaChart = lazyLoad(
  () => import('./AreaChart.impl'),
  <ChartSkeleton />
);
