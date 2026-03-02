/**
 * Optimized Image Component for Landing Page
 * 
 * Features:
 * - Lazy loading by default
 * - WebP format optimization for Unsplash
 * - Blur placeholder support
 * - Proper aspect ratio handling
 */

import { useState, useEffect, useRef } from 'react';

interface OptimizedLandingImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for LCP images
  onLoad?: () => void;

/**
 * Adds WebP format and quality params to Unsplash URLs
 */
function optimizeImageUrl(src: string): string {
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    if (!url.searchParams.has('fm')) {
      url.searchParams.set('fm', 'webp');
    }
    if (!url.searchParams.has('q')) {
      url.searchParams.set('q', '80');
    }
    return url.toString();
  }
  return src;
}

export function OptimizedLandingImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
}: OptimizedLandingImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const optimizedSrc = optimizeImageUrl(src);

  return (
    <img
      ref={imgRef}
      src={isInView ? optimizedSrc : undefined}
      data-src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={() => {
        setIsLoaded(true);
        onLoad?.();
      }}
    />
  );

/**
 * Simple lazy image for basic use cases
 */
export function LazyImage({
  src,
  alt,
  className = '',
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const optimizedSrc = typeof src === 'string' ? optimizeImageUrl(src) : src;
  
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
