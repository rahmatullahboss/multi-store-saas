/**
 * Client-side image compression utility
 * Uses HTML5 Canvas to resize and compress images before upload.
 * This saves bandwidth and storage costs.
 */

// Format options
type ImageFormat = 'image/jpeg' | 'image/webp' | 'image/png';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  format?: ImageFormat;
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          format,
          quality
        );
      };
      
      img.onerror = (_err) => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = (_err) => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Determine optimal format based on browser support
 * Prefers WebP if available
 */
export function getOptimalFormat(): ImageFormat {
  // Most modern browsers support WebP
  return 'image/webp';
}
