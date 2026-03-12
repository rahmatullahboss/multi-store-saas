import { Skeleton } from '~/components/Skeleton';
import { GlassCard } from '~/components/ui/GlassCard';
import { TableSkeleton } from '~/components/TableSkeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800/50 p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 md:w-96" />
            <Skeleton className="h-6 w-48 md:w-80" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} variant="default" className="p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </GlassCard>
        ))}
      </div>

      {/* Analytics Main Section Skeleton */}
      <GlassCard intensity="low" className="p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </GlassCard>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart Skeleton */}
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </GlassCard>

          {/* Recent Orders Skeleton */}
          <GlassCard intensity="low" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <TableSkeleton rows={5} columns={4} />
          </GlassCard>
        </div>

        {/* Right Column Stack */}
        <div className="space-y-6">
          {/* Growth Opportunities Skeleton */}
          <GlassCard intensity="low" className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </GlassCard>

          {/* Action Items Skeleton */}
          <GlassCard intensity="low" className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
