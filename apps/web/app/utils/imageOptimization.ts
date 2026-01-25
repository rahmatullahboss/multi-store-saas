/**
 * Image Optimization Utilities
 * 
 * Provides helper functions for optimizing images on the landing page.
 */

/**
 * Optimizes an Unsplash image URL by adding WebP format and quality parameters.
 * 
 * @param url - The original Unsplash image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export function optimizeUnsplashUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Parse existing URL
  const urlObj = new URL(url);
  
  // Set format
  urlObj.searchParams.set('fm', format);
  
  // Set quality
  urlObj.searchParams.set('q', quality.toString());
  
  // Set dimensions if provided
  if (width) urlObj.searchParams.set('w', width.toString());
  if (height) urlObj.searchParams.set('h', height.toString());
  
  // Enable auto crop
  if (!urlObj.searchParams.has('fit')) {
    urlObj.searchParams.set('fit', 'crop');
  }
  
  return urlObj.toString();
}

/**
 * Generates srcset for responsive images
 * 
 * @param url - Base Unsplash image URL
 * @param widths - Array of widths for srcset
 * @returns srcset string
 */
export function generateSrcset(url: string, widths: number[] = [320, 640, 1024, 1280]): string {
  return widths
    .map(w => `${optimizeUnsplashUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Preload hint for LCP images
 * Use in route-specific links function (e.g., marketing landing page)
 * Note: Don't add to root.tsx to avoid unused preload warnings on other pages
 */
export const LCP_PRELOAD_HINTS = [
  // Hero brand logo - use only on pages where the logo is above the fold
  {
    rel: 'preload',
    as: 'image',
    href: '/brand/logo-white.webp',
    type: 'image/webp',
  },
];
