/**
 * Optimized Image Component
 * 
 * Uses Cloudinary for image optimization with:
 * - Auto format (WebP/AVIF)
 * - Responsive srcset
 * - Lazy loading
 * - Blur placeholder
 */

import { cloudinaryUrl, cloudinarySrcSet } from '~/lib/cloudinary';

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

  const optimizedSrc = cloudinaryUrl(src, { width, height });
  const srcSet = cloudinarySrcSet(src);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
}
