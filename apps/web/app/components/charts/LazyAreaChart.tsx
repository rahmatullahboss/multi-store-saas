/**
 * Lazy-loaded Area Chart Component (Client-Only)
 * 
 * Uses dynamic imports inside useEffect to ensure recharts is NEVER
 * processed during SSR. This prevents hydration errors completely.
 * 
 * @see https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components
 */

import { useState, useEffect, type ReactNode, useSyncExternalStore } from 'react';

// Simple subscribe function for useSyncExternalStore
const subscribe = () => () => {};

/**
 * Check if we're running on the client
 * This uses useSyncExternalStore for proper SSR/hydration compatibility
 */
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true, // Client: always return true
    () => false // Server: always return false
  );
}

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

export function LazyAreaChart({
  data,
  height = 300,
  dataKey,
  xAxisKey = 'name',
  stroke = '#10b981',
  fill,
  gradientId = 'colorGradient',
  showGrid = true,
  showTooltip = true,
  referenceLine,
}: LazyAreaChartProps) {
  const isClient = useIsClient();
  const [chartContent, setChartContent] = useState<ReactNode>(null);

  useEffect(() => {
    if (!isClient) return;

    // Dynamic import - ONLY happens on client, never processed during SSR
    import('recharts').then((recharts) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } = recharts;
      
      setChartContent(
        <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            {showTooltip && <Tooltip />}
            {referenceLine && (
              <ReferenceLine
                y={referenceLine.y}
                label={referenceLine.label}
                stroke={referenceLine.stroke || '#f59e0b'}
                strokeDasharray="5 5"
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              fill={fill || `url(#${gradientId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    });
  }, [data, height, dataKey, xAxisKey, stroke, fill, gradientId, showGrid, showTooltip, referenceLine, isClient]);

  // Don't render chart during SSR
  if (!isClient) {
    return <ChartSkeleton height={height} />;
  }

  // Show skeleton while loading
  if (!chartContent) {
    return <ChartSkeleton height={height} />;
  }

  return <>{chartContent}</>;
}
