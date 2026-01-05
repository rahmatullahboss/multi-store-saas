/**
 * Optimized Image Component
 * 
 * Simple image component for R2-hosted images.
 * Images are pre-compressed on upload, so no runtime transformations needed.
 * 
 * Features:
 * - Lazy loading by default
 * - Priority loading option for above-the-fold images
 * - Graceful fallback for missing images
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: OptimizedImageProps) {
  // Skip optimization for data URLs or empty
  if (!src || src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      sizes={sizes}
    />
  );
}
