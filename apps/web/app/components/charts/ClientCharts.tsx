/**
 * Client-Only Chart Components
 * 
 * These components use dynamic imports to ensure recharts is ONLY loaded on the client.
 * This prevents SSR hydration errors (React Error #418) caused by ResponsiveContainer
 * not being able to calculate dimensions on the server.
 * 
 * Usage:
 * import { ClientAreaChart, ClientBarChart, ClientComposedChart } from '~/components/charts/ClientCharts';
 * 
 * <ClientAreaChart 
 *   data={data} 
 *   height={300}
 *   fallback={<div className="h-[300px] bg-slate-800/50 rounded animate-pulse" />}
 * >
 *   {({ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
 *     <ResponsiveContainer width="100%" height="100%">
 *       <AreaChart data={data}>
 *         ...
 *       </AreaChart>
 *     </ResponsiveContainer>
 *   )}
 * </ClientAreaChart>
 */

import { useEffect, useState, type ReactNode, useSyncExternalStore } from 'react';

// Use 'any' to avoid static type import which can cause bundling issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RechartsModule = any;

interface ClientChartProps {
  children: (recharts: RechartsModule) => ReactNode;
  fallback?: ReactNode;
  height?: number;
}

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

/**
 * Generic client-only chart wrapper that dynamically imports recharts
 * Uses proper hydration tracking to prevent SSR rendering
 */
export function ClientChart({ children, fallback, height = 300 }: ClientChartProps) {
  const isClient = useIsClient();
  const [recharts, setRecharts] = useState<RechartsModule | null>(null);
  const isAdminRoute =
    isClient &&
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/app'));

  useEffect(() => {
    if (!isClient || !isAdminRoute) return;
    
    // Dynamic import - only happens on client after hydration
    import('recharts').then((mod) => {
      setRecharts(mod);
    });
  }, [isClient, isAdminRoute]);

  // Don't render during SSR
  if (!isClient) {
    return (
      <div 
        className="animate-pulse bg-slate-800/50 dark:bg-slate-800/50 bg-gray-100 rounded flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-slate-500 dark:text-slate-500 text-gray-400 text-sm">Loading chart...</span>
      </div>
    );
  }

  // If somehow rendered on non-admin routes, avoid loading charts
  if (!isAdminRoute) {
    return <>{fallback || null}</>;
  }

  // Show fallback while loading recharts
  if (!recharts) {
    return (
      <>
        {fallback || (
          <div 
            className="animate-pulse bg-slate-800/50 dark:bg-slate-800/50 bg-gray-100 rounded flex items-center justify-center"
            style={{ height }}
          >
            <span className="text-slate-500 dark:text-slate-500 text-gray-400 text-sm">Loading chart...</span>
          </div>
        )}
      </>
    );
  }

  return <>{children(recharts)}</>;
}

/**
 * Pre-configured Area Chart wrapper
 */
interface SimpleAreaChartProps {
  data: Record<string, unknown>[];
  height?: number;
  dataKey: string;
  xAxisKey?: string;
  stroke?: string;
  fillGradientId?: string;
  gradientColor?: string;
  tooltipFormatter?: (value: number) => string;
  fallback?: ReactNode;
}

export function SimpleAreaChart({
  data,
  height = 300,
  dataKey,
  xAxisKey = 'name',
  stroke = '#10b981',
  fillGradientId = 'areaGradient',
  gradientColor,
  tooltipFormatter,
  fallback,
}: SimpleAreaChartProps) {
  const gradientStroke = gradientColor || stroke;

  return (
    <ClientChart height={height} fallback={fallback}>
      {({ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
        <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientStroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={gradientStroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={tooltipFormatter}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              itemStyle={{ color: stroke }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={tooltipFormatter ? (value: number) => [tooltipFormatter(value), dataKey] : undefined}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${fillGradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ClientChart>
  );
}

/**
 * Pre-configured Bar Chart wrapper
 */
interface SimpleBarChartProps {
  data: Record<string, unknown>[];
  height?: number;
  dataKey: string;
  xAxisKey?: string;
  fill?: string;
  name?: string;
  layout?: 'horizontal' | 'vertical';
  fallback?: ReactNode;
}

export function SimpleBarChart({
  data,
  height = 300,
  dataKey,
  xAxisKey = 'name',
  fill = '#3b82f6',
  name,
  layout = 'horizontal',
  fallback,
}: SimpleBarChartProps) {
  return (
    <ClientChart height={height} fallback={fallback}>
      {({ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
        <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 500, height }}>
          <BarChart data={data} layout={layout} margin={{ top: 10, right: 30, left: layout === 'vertical' ? 20 : 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={layout === 'horizontal' ? false : true} horizontal={layout === 'vertical' ? false : true} />
            {layout === 'horizontal' ? (
              <>
                <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              </>
            ) : (
              <>
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis dataKey={xAxisKey} type="category" stroke="#94a3b8" fontSize={14} width={100} />
              </>
            )}
            <Tooltip
              cursor={{ fill: '#1e293b', opacity: 0.5 }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              itemStyle={{ color: fill }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey={dataKey} name={name} fill={fill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ClientChart>
  );
}

export default ClientChart;
