/**
 * Cloudinary Image Helper
 * 
 * Provides image URL optimization through Cloudinary.
 * Cloud Name: dpnccgsja
 * 
 * Features:
 * - Auto format (f_auto): WebP/AVIF based on browser
 * - Auto quality (q_auto): Optimized quality
 * - Responsive sizing: Creates optimal sizes
 */

const CLOUD_NAME = 'dpnccgsja';

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
}

/**
 * Generate optimized Cloudinary URL for an image
 * 
 * @param src - Image source (Cloudinary public_id or URL)
 * @param options - Transformation options
 * 
 * @example
 * // For a Cloudinary public_id:
 * cloudinaryUrl('dc-store/products/shirt', { width: 400 })
 * 
 * // For an external URL (uses Cloudinary fetch):
 * cloudinaryUrl('https://example.com/image.jpg', { width: 400 })
 */
export function cloudinaryUrl(src: string, options: CloudinaryOptions = {}): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
  
  // Build transformation string
  const transforms: string[] = [`f_${format}`, `q_${quality}`];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  
  const transformString = transforms.join(',');
  
  // If already a full Cloudinary URL, insert transformations
  if (src.includes('cloudinary.com')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformString}/${parts[1]}`;
    }
    return src;
  }
  
  // If it's an external URL, use Cloudinary fetch
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformString}/${src}`;
  }
  
  // Default: treat as Cloudinary public_id
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${src}`;
}

/**
 * Generate srcset for responsive images
 */
export function cloudinarySrcSet(src: string, widths: number[] = [320, 640, 960, 1280]): string {
  return widths
    .map(w => `${cloudinaryUrl(src, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Get placeholder blur URL (low quality, tiny size)
 */
export function cloudinaryBlurUrl(src: string): string {
  return cloudinaryUrl(src, { width: 20, quality: 30 });
}

export default {
  url: cloudinaryUrl,
  srcSet: cloudinarySrcSet,
  blurUrl: cloudinaryBlurUrl,
  cloudName: CLOUD_NAME,
};
