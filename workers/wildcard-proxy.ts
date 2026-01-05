/**
 * Cloudflare Worker: Wildcard Subdomain Proxy
 * 
 * Routes all *.digitalcare.site requests to the Pages site
 * while preserving the original Host header for multi-tenant resolution.
 * 
 * Free Plan Limits: 100,000 requests/day (sufficient for starting)
 * 
 * Deploy: npx wrangler deploy -c workers/wrangler.toml
 * 
 * Route Setup in Cloudflare Dashboard:
 * Workers & Pages → wildcard-proxy → Settings → Triggers → Add Route
 * Route: *.digitalcare.site/*
 * Zone: digitalcare.site
 */

export interface Env {
  PAGES_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const originalHost = url.hostname;
    
    // Target Pages URL
    const pagesOrigin = env.PAGES_URL || 'https://multi-store-saas.pages.dev';
    
    // Rewrite URL to point to Pages
    url.hostname = new URL(pagesOrigin).hostname;
    url.protocol = 'https:';
    
    // Create new request with modified URL
    // Pass original request to preserve method, body, and most headers
    const proxyRequest = new Request(url.toString(), request);
    
    // Preserve original host for tenant middleware resolution
    proxyRequest.headers.set('X-Forwarded-Host', originalHost);
    proxyRequest.headers.set('Host', new URL(pagesOrigin).hostname);
    
    try {
      // Fetch from Pages origin
      const response = await fetch(proxyRequest);
      
      // Return response with proxy header for debugging
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('X-Proxy-Worker', 'wildcard-proxy');
      
      return newResponse;
    } catch (error) {
      console.error('[wildcard-proxy] Error:', error);
      return new Response('Service temporarily unavailable', {
        status: 502,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
