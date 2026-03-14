import { Skeleton } from '~/components/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={`th-${i}`} className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={`tr-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={`td-${i}-${j}`} className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className={`h-4 ${j === 0 ? 'w-32' : 'w-20'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
