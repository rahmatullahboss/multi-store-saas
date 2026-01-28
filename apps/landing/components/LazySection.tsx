'use client';

/**
 * LazySection - Intersection Observer based lazy loading wrapper
 *
 * Only renders children when the section enters viewport.
 * This dramatically reduces initial JS parsing and execution time.
 *
 * SSR-SAFE: Always renders fallback on server and during initial hydration,
 * then switches to real content after mount + intersection.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Fallback skeleton to show while loading */
  fallback?: ReactNode;
  /** Root margin for intersection observer (default: 200px to preload slightly before visible) */
  rootMargin?: string;
  /** Minimum height to prevent layout shift */
  minHeight?: string;
  /** CSS class for the wrapper */
  className?: string;
}

/**
 * Default skeleton that matches common section styling
 */
function DefaultSkeleton({ minHeight }: { minHeight?: string }) {
  return (
    <div
      className="w-full animate-pulse bg-gradient-to-b from-transparent to-gray-900/5"
      style={{ minHeight: minHeight || '400px' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-800/10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LazySection({
  children,
  fallback,
  rootMargin = '300px', // Increased for smoother loading
  minHeight = '400px',
  className = '',
}: LazySectionProps) {
  // Start with false to match SSR output (skeleton)
  const [shouldRender, setShouldRender] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);

    // Server-side rendering check
    if (typeof window === 'undefined' || !ref.current) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: just render immediately
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          // Once visible, stop observing
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01, // Trigger when even 1% is visible
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin]);

  // Always show fallback until we've mounted AND section is in view
  const showChildren = hasMounted && shouldRender;

  return (
    <div ref={ref} className={className} style={{ minHeight: showChildren ? 'auto' : minHeight }}>
      {showChildren ? children : fallback || <DefaultSkeleton minHeight={minHeight} />}
    </div>
  );
}

/**
 * ClientOnly wrapper for components that should only render on client
 * Prevents hydration mismatches and reduces server-side processing
 */
interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : <>{fallback}</>;
}
