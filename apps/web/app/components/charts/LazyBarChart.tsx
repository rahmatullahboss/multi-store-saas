/**
 * Lazy-loaded Bar Chart Component (Client-Only)
 * 
 * Uses dynamic imports inside useEffect to ensure recharts is NEVER
 * processed during SSR. This prevents hydration errors completely.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 */

import { useState, useEffect, type ReactNode } from 'react';

// Track hydration state globally - only updates once after initial hydration
let isHydrating = true;

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

export function LazyBarChart({
  data,
  height = 300,
  bars,
  xAxisKey = 'name',
  showGrid = true,
  showTooltip = true,
  showLegend = false,
}: LazyBarChartProps) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);
  const [chartContent, setChartContent] = useState<ReactNode>(null);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);

    // Dynamic import - ONLY happens on client, never processed during SSR
    import('recharts').then((recharts) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
      
      setChartContent(
        <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                radius={bar.radius ? [bar.radius, bar.radius, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    });
  }, [data, height, bars, xAxisKey, showGrid, showTooltip, showLegend]);

  // Don't render chart during SSR or before hydration/loading
  if (!isHydrated || !chartContent) {
    return <ChartSkeleton height={height} />;
  }

  return <>{chartContent}</>;
}
