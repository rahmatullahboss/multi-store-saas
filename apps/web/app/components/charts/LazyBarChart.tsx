/**
 * Lazy-loaded Bar Chart Component
 * 
 * Uses lazyLoad to ensure recharts is loaded strictly on demand.
 */

import { lazyLoad, ComponentSkeleton } from '~/lib/lazy-imports';
// Import types only (erased at runtime)
import type { BarChartProps } from './BarChart.impl';

// Export type for consumers
export type { BarChartProps };

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
export const LazyBarChart = lazyLoad(
  () => import('./BarChart.impl'),
  <ChartSkeleton />
);
