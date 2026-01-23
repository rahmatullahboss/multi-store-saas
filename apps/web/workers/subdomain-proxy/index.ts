/**
 * Wildcard Subdomain Proxy Worker
 * 
 * Routes subdomain requests to Cloudflare Pages while serving
 * static assets directly (bypassing Worker for performance).
 * 
 * OPTIMIZATION: Static assets (JS, CSS, images, fonts) are served
 * directly from the CDN, only HTML/API requests hit this Worker.
 */

export interface Env {
  PAGES_URL: string; // e.g., "https://multi-store-saas.pages.dev"
}

// Static asset patterns to skip (serve directly from CDN)
const STATIC_ASSET_PATTERNS = [
  /^\/assets\//,
  /^\/build\//,
  /^\/favicon\.ico$/,
  /\.(js|css|woff|woff2|ttf|eot|png|jpg|jpeg|gif|webp|svg|ico|map)$/i,
];

/**
 * Check if request is for a static asset
 * Static assets should be served directly from CDN, not proxied
 */
function isStaticAsset(pathname: string): boolean {
  return STATIC_ASSET_PATTERNS.some(pattern => pattern.test(pathname));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const pathname = url.pathname;
    
    // ========================================================================
    // OPTIMIZATION: Serve static assets directly - no redirect (saves 1 request)
    // ========================================================================
    if (isStaticAsset(pathname)) {
      // Direct fetch from CDN - avoids 302 redirect which causes 2 requests
      const cdnUrl = new URL(pathname + url.search, env.PAGES_URL || 'https://multi-store-saas.pages.dev');
      return fetch(cdnUrl.toString());
    }
    
    console.log(`[Proxy] Request: ${hostname}${pathname}`);
    
    // Build the Pages URL
    const pagesUrl = env.PAGES_URL || 'https://multi-store-saas.pages.dev';
    const targetUrl = new URL(pathname + url.search, pagesUrl);
    
    // Clone headers and add forwarded host
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', hostname);
    headers.set('X-Original-Host', hostname);
    headers.set('Host', new URL(pagesUrl).hostname);
    
    // Create the proxied request
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual',
    });
    
    try {
      const response = await fetch(proxyRequest);
      
      // Return response with modified headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete('content-encoding');
      
      // Add CORS headers for API responses
      if (pathname.startsWith('/api/')) {
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error(`[Proxy] Error:`, error);
      return new Response('Service temporarily unavailable', { status: 503 });
    }
  },
};
