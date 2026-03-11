/**
 * Cross-environment UUID v4 generator
 * 
 * Provides a consistent API for generating UUIDs across:
 * - Cloudflare Workers (with nodejs_compat)
 * - Modern browsers (with crypto.randomUUID)
 * - Older browsers (with fallback implementation)
 * 
 * @example
 * ```ts
 * import { generateUUID } from '~/lib/uuid';
 * 
 * const id = generateUUID();
 * ```
 */

/**
 * Generate a UUID v4 string
 * 
 * Uses the best available method for the current environment:
 * 1. crypto.randomUUID() in modern browsers
 * 2. crypto.randomUUID() in Cloudflare Workers
 * 3. Fallback implementation for older browsers
 */
export function generateUUID(): string {
  // Browser environment with Web Crypto API
  if (typeof self !== 'undefined' && self.crypto && typeof self.crypto.randomUUID === 'function') {
    return self.crypto.randomUUID();
  }
  
  // Node.js or Cloudflare Workers with nodejs_compat
  // @ts-ignore - crypto may not be in types but exists at runtime in Workers
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // @ts-ignore
    return crypto.randomUUID();
  }
  
  // Fallback: Pure JavaScript UUID v4 implementation
  // This follows RFC 4122 section 4.4 for UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a compact UUID (without hyphens)
 * Useful for shorter identifiers where full UUID format isn't required
 */
export function generateCompactUUID(): string {
  return generateUUID().replace(/-/g, '');
}

/**
 * Generate a short UUID (first N characters)
 * @param length - Desired length (default: 8, max: 36)
 */
export function generateShortUUID(length: number = 8): string {
  if (length <= 0) return '';
  if (length > 36) length = 36;
  return generateUUID().replace(/-/g, '').slice(0, length);
}
