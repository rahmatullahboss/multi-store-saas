/**
 * Image Helper
 * 
 * Provides image URL utilities for R2 storage.
 * Simple and efficient - no external transformations needed
 * since images are pre-compressed on upload.
 */

/**
 * Get the full R2 public URL for an image
 * 
 * @param key - The R2 object key (e.g., 'products/abc123.webp')
 * @param baseUrl - The R2 public bucket URL
 * @returns Full URL to the image
 * 
 * @example
 * getImageUrl('products/abc123.webp', 'https://pub-xxx.r2.dev')
 * // => 'https://pub-xxx.r2.dev/products/abc123.webp'
 */
export function getImageUrl(key: string, baseUrl: string): string {
  if (!key) return '';
  
  // If already a full URL, return as-is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  
  // Ensure base URL doesn't end with slash
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure key doesn't start with slash
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  
  return `${base}/${cleanKey}`;
}

/**
 * Generate a unique filename for upload
 * 
 * @param originalName - Original file name
 * @param folder - Folder prefix (e.g., 'products', 'stores')
 * @returns Unique key for R2
 */
export function generateImageKey(originalName: string, folder: string = 'uploads'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = 'webp'; // Always save as WebP after compression
  
  return `${folder}/${timestamp}-${random}.${extension}`;
}

/**
 * Generate responsive image srcset
 * For R2, we serve the pre-optimized image at different sizes
 * Note: Since images are pre-compressed, we just serve the same URL
 */
export function generateSrcSet(src: string): string {
  // Since images are already optimized on upload, 
  // we don't need multiple sizes - just serve the original
  return src;
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].some(ext => 
      pathname.endsWith(ext)
    );
  } catch {
    return false;
  }
}

export default {
  getImageUrl,
  generateImageKey,
  generateSrcSet,
  isValidImageUrl,
};
