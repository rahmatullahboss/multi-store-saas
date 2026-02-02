import { lazy, Suspense, ComponentType, ComponentProps, ReactNode } from 'react';

/**
 * Loading spinner component for lazy loaded boundaries
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 bg-white/50 rounded-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-b-emerald-600" />
  </div>
);

/**
 * Skeleton loader for content placeholders
 */
export const ComponentSkeleton = ({ height = "200px", className = "" }: { height?: string; className?: string }) => (
  <div 
    className={`animate-pulse bg-gray-100 rounded-lg w-full ${className}`}
    style={{ height }} 
  />
);

/**
 * Generic lazy loader with built-in Suspense and error boundary support
 * 
 * @param importFn Dynamic import function, e.g. () => import('./MyComponent')
 * @param fallback Optional fallback UI to show while loading. Defaults to ComponentSkeleton.
 * @returns A component that renders the lazy-loaded component inside Suspense
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  const DefaultFallback = fallback || <ComponentSkeleton />;

  return function LazyWrapper(props: ComponentProps<T>) {
    return (
      <Suspense fallback={DefaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
