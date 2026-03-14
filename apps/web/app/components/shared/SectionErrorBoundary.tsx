/**
 * Shared Section Error Boundary
 *
 * A reusable error boundary component for wrapping section components.
 * Provides graceful degradation when a section fails to render.
 *
 * Usage:
 * ```tsx
 * <SectionErrorBoundary sectionType="hero" sectionId="hero-1">
 *   <HeroSection {...props} />
 * </SectionErrorBoundary>
 * ```
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SectionErrorBoundaryProps {
  /** Section type for error reporting */
  sectionType: string;
  /** Section ID for debugging */
  sectionId?: string;
  /** Children to render */
  children: React.ReactNode;
  /** Custom fallback component */
  fallback?: React.ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// FALLBACK COMPONENTS
// ============================================================================

/**
 * Loading fallback for Suspense boundaries
 */
export function SectionLoadingFallback({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-100 h-32 rounded-lg ${className || ''}`}
      role="status"
      aria-label="Loading section..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Error fallback shown in development mode
 */
function SectionErrorFallbackDev({
  sectionType,
  sectionId,
  error,
}: {
  sectionType: string;
  sectionId?: string;
  error: Error | null;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-red-800 font-medium text-sm">Section Error: {sectionType}</h3>
          {sectionId && <p className="text-red-600 text-xs mt-1">ID: {sectionId}</p>}
          {error && (
            <pre className="text-red-700 text-xs mt-2 whitespace-pre-wrap break-words bg-red-100 p-2 rounded">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal error fallback for production
 * Returns null to silently skip broken sections
 */
function SectionErrorFallbackProd() {
  return null;
}

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error(
      `[SectionErrorBoundary] Section "${this.props.sectionType}" (${this.props.sectionId || 'no-id'}) failed to render:`,
      error,
      errorInfo
    );

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // In development, show detailed error
      if (process.env.NODE_ENV === 'development') {
        return (
          <SectionErrorFallbackDev
            sectionType={this.props.sectionType}
            sectionId={this.props.sectionId}
            error={this.state.error}
          />
        );
      }

      // In production, silently skip broken sections
      return <SectionErrorFallbackProd />;
    }

    return this.props.children;
  }
}

// ============================================================================
// HOC WRAPPER
// ============================================================================

/**
 * Higher-order component to wrap a section with error boundary
 */
export function withSectionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  sectionType: string
): React.FC<P & { sectionId?: string }> {
  const WithErrorBoundary: React.FC<P & { sectionId?: string }> = (props) => {
    return (
      <SectionErrorBoundary sectionType={sectionType} sectionId={props.sectionId}>
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `withSectionErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

// ============================================================================
// SUSPENSE + ERROR BOUNDARY WRAPPER
// ============================================================================

/**
 * Combined Suspense + ErrorBoundary wrapper for lazy-loaded sections
 */
export function SectionWrapper({
  sectionType,
  sectionId,
  children,
  loadingFallback,
  errorFallback,
  onError,
}: {
  sectionType: string;
  sectionId?: string;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) {
  return (
    <SectionErrorBoundary
      sectionType={sectionType}
      sectionId={sectionId}
      fallback={errorFallback}
      onError={onError}
    >
      <React.Suspense fallback={loadingFallback || <SectionLoadingFallback />}>
        {children}
      </React.Suspense>
    </SectionErrorBoundary>
  );
}

export default SectionErrorBoundary;
