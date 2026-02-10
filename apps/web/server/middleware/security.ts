/**
 * Security Headers Middleware
 * 
 * Implements OWASP recommended security headers:
 * - Content-Security-Policy
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - X-XSS-Protection
 * - Strict-Transport-Security
 * - Referrer-Policy
 * - Permissions-Policy
 */

import { Context, MiddlewareHandler } from 'hono';

interface SecurityHeadersOptions {
  /** Enable strict CSP (default: true for API, false for pages) */
  strictCSP?: boolean;
  /** Allow embedding in iframes (default: false) */
  allowIframe?: boolean;
  /** Custom trusted domains for CSP */
  trustedDomains?: string[];
  /** Enable HSTS (default: true in production) */
  enableHSTS?: boolean;
  /** HSTS max-age in seconds (default: 1 year) */
  hstsMaxAge?: number;
}

const defaultOptions: SecurityHeadersOptions = {
  strictCSP: false,
  allowIframe: false,
  trustedDomains: [],
  enableHSTS: true,
  hstsMaxAge: 31536000, // 1 year
};

/**
 * Generate Content-Security-Policy header
 */
function generateCSP(options: SecurityHeadersOptions): string {
  // const trustedDomains = options.trustedDomains || [];
  
  // Add common trusted domains
  // Add common trusted domains
  // const defaultSources = [
  //   "'self'",
  //   'https://fonts.googleapis.com',
  //   'https://fonts.gstatic.com',
  //   'https://res.cloudinary.com',
  //   'https://*.cloudinary.com',
  //   ...trustedDomains,
  // ];
  
  // For strict API mode
  if (options.strictCSP) {
    return [
      "default-src 'none'",
      "frame-ancestors 'none'",
    ].join('; ');
  }
  
  // For page rendering
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com https://cdnjs.cloudflare.com blob:`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https: http:`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `connect-src 'self' https://api.openrouter.ai https://accounts.google.com https://sslcommerz.com https://*.sslcommerz.com https://static.cloudflareinsights.com https://fonts.googleapis.com https://fonts.gstatic.com https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev https://images.unsplash.com https://o4509758332141568.ingest.de.sentry.io wss: ws:`,
    `frame-src 'self' https://accounts.google.com https://sslcommerz.com`,
    `frame-ancestors ${options.allowIframe ? '*' : "'self'"}`,
    `base-uri 'self'`,
    `form-action 'self' https://accounts.google.com https://sslcommerz.com`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

/**
 * Security Headers Middleware
 * 
 * @example
 * ```ts
 * // For API routes (strict)
 * app.use('/api/*', securityHeaders({ strictCSP: true }));
 * 
 * // For page routes (allow inline scripts)
 * app.use('*', securityHeaders({ strictCSP: false }));
 * ```
 */
export const securityHeaders = (
  userOptions: SecurityHeadersOptions = {}
): MiddlewareHandler => {
  const options = { ...defaultOptions, ...userOptions };
  
  return async (c: Context, next: () => Promise<void>) => {
    await next();
    
    // Skip for preflight requests
    if (c.req.method === 'OPTIONS') {
      return;
    }
    
    const isProd = c.env?.ENVIRONMENT === 'production' || !c.env?.ENVIRONMENT;
    
    // =========================================================================
    // OWASP Security Headers
    // =========================================================================
    
    // Prevent MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    c.header('X-Frame-Options', options.allowIframe ? 'SAMEORIGIN' : 'DENY');
    
    // XSS Protection (legacy browsers)
    c.header('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy - don't leak full URL
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy - restrict browser features
    c.header('Permissions-Policy', [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Block FLoC
    ].join(', '));
    
    // HSTS - Force HTTPS (only in production)
    if (options.enableHSTS && isProd) {
      c.header(
        'Strict-Transport-Security',
        `max-age=${options.hstsMaxAge}; includeSubDomains; preload`
      );
    }
    
    // Content-Security-Policy
    c.header('Content-Security-Policy', generateCSP(options));
    
    // Report-To header for CSP violations (optional)
    // c.header('Report-To', JSON.stringify({
    //   group: 'csp-violations',
    //   max_age: 10886400,
    //   endpoints: [{ url: '/api/csp-report' }],
    // }));
  };
};

/**
 * API Security Headers - Stricter for JSON APIs
 */
export const apiSecurityHeaders = (): MiddlewareHandler => {
  return securityHeaders({
    strictCSP: true,
    allowIframe: false,
  });
};

/**
 * Page Security Headers - Allow inline scripts for React
 */
export const pageSecurityHeaders = (): MiddlewareHandler => {
  return securityHeaders({
    strictCSP: false,
    allowIframe: false,
  });
};
