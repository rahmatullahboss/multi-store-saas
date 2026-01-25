/**
 * Lazy-loaded Chart Components (Client-Only)
 * 
 * Re-exports from individual chart files for convenience.
 * All charts use dynamic imports inside useEffect to ensure recharts
 * is NEVER processed during SSR.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 * 
 * Usage:
 * import { LazyAreaChart, LazyBarChart } from '~/components/charts/LazyCharts';
 * 
 * <LazyAreaChart data={data} height={300} dataKey="value" />
 */

// Re-export from individual files
export { LazyAreaChart } from './LazyAreaChart';
export { LazyBarChart } from './LazyBarChart';

// Skeleton loader for charts (can be used externally)
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
