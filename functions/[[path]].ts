/**
 * Cloudflare Pages Functions Entry Point
 * 
 * This catch-all function handles SSR for all routes.
 * Includes tenant resolution for multi-tenancy support.
 */

import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import type { ServerBuild } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '../db/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as build from '../build/server';
import type { CfProperties } from '@cloudflare/workers-types';

/**
 * Environment interface for Cloudflare Pages Functions
 */
interface Env {
  DB: D1Database;
  R2: R2Bucket;
  R2_PUBLIC_URL: string;
  SAAS_DOMAIN: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ZONE_ID: string;
  OPENROUTER_API_KEY?: string;
  [key: string]: any;
}

/**
 * Parse hostname to extract subdomain or custom domain
 */
function parseHostname(hostname: string, saasDomain: string): { type: 'subdomain' | 'custom'; value: string } {
  const cleanHostname = hostname.split(':')[0];
  
  if (cleanHostname.endsWith(`.${saasDomain}`)) {
    const subdomain = cleanHostname.replace(`.${saasDomain}`, '');
    return { type: 'subdomain', value: subdomain };
  }
  
  if (cleanHostname === saasDomain || cleanHostname === `www.${saasDomain}`) {
    return { type: 'subdomain', value: 'www' };
  }
  
  return { type: 'custom', value: cleanHostname };
}

/**
 * Check if hostname is a main domain (should show marketing page) 
 * or a reserved subdomain (handled by separate workers/pages)
 */
function isMainDomain(hostname: string): boolean {
  const mainDomains = [
    'localhost',
    '127.0.0.1',
    'multi-store-saas.pages.dev',
    'ozzyl.com',
    'www.ozzyl.com',
    // Reserved subdomains - handled by separate Cloudflare Pages workers
    'builder.ozzyl.com', // Page builder worker
  ];
  
  return mainDomains.includes(hostname) || 
    (hostname.endsWith('.pages.dev') && hostname.split('.').length <= 3);
}

// Reserved subdomains that should be proxied to their own workers
const RESERVED_SUBDOMAINS: Record<string, string> = {
  'builder.ozzyl.com': 'https://multi-store-saas-builder.pages.dev',
};

/**
 * Proxy requests to reserved subdomains
 * Preserves the original Host as X-Forwarded-Host for cookie validation
 */
async function proxyToWorker(request: Request, targetWorkerUrl: string, originalHost: string): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = new URL(url.pathname + url.search, targetWorkerUrl);
  
  // Clone headers and add X-Forwarded-Host
  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', originalHost);
  headers.set('X-Original-URL', request.url);
  
  // Create forwarded request
  const forwardRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    redirect: 'manual',
  });
  
  try {
    const response = await fetch(forwardRequest);
    
    // If it's a redirect, rewrite the Location header to use the original host
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (location) {
        const newHeaders = new Headers(response.headers);
        // Rewrite redirect URL to use original host
        const locationUrl = new URL(location, targetWorkerUrl);
        if (locationUrl.hostname === new URL(targetWorkerUrl).hostname) {
          locationUrl.hostname = originalHost.split(':')[0];
          locationUrl.protocol = 'https:';
          newHeaders.set('Location', locationUrl.toString());
        }
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    }
    
    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Proxy error', { status: 502 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest = async (context: any): Promise<Response> => {
  const request = context.request;
  const hostname = request.headers.get('host') || new URL(request.url).hostname;
  
  // Check if this is a reserved subdomain that needs proxying
  const targetWorkerUrl = RESERVED_SUBDOMAINS[hostname];
  if (targetWorkerUrl) {
    return proxyToWorker(request, targetWorkerUrl, hostname);
  }
  
  // Otherwise, use the standard Remix handler
  return pagesFunctionHandler(context);
};

const pagesFunctionHandler = createPagesFunctionHandler({
  build: build as unknown as ServerBuild,
  getLoadContext: async (context) => {
    const env = context.env as {
      DB: D1Database;
      R2: R2Bucket;
      R2_PUBLIC_URL?: string;
      SAAS_DOMAIN?: string;
      CLOUDFLARE_API_TOKEN?: string;
      CLOUDFLARE_ZONE_ID?: string;
    };
    
    const request = context.request;
    const url = new URL(request.url);
    
    // Get hostname from X-Forwarded-Host header (set by proxy) or Host header
    const hostname = request.headers.get('x-forwarded-host') || 
                     request.headers.get('host') || 
                     url.hostname;
    
    const saasDomain = env.SAAS_DOMAIN || 'ozzyl.com';
    
    // Default context values
    let storeId = 0;
    let store = null;
    let isCustomDomainAccess = false;
    
    // Skip tenant resolution for main domains
    if (isMainDomain(hostname)) {
      return {
        cloudflare: {
          env: {
            ...context.env,
            R2_PUBLIC_URL: (context.env.R2_PUBLIC_URL as string) || '',
            SAAS_DOMAIN: saasDomain,
            CLOUDFLARE_API_TOKEN: (context.env.CLOUDFLARE_API_TOKEN as string) || '',
            CLOUDFLARE_ZONE_ID: (context.env.CLOUDFLARE_ZONE_ID as string) || '',
          } as Env,
          ctx: context as unknown as ExecutionContext,
          cf: context.request.cf,
        },
        storeId: 0,
        store: null,
        isCustomDomain: false,
      };
    }
    
    // Resolve tenant from hostname
    const { type, value } = parseHostname(hostname, saasDomain);
    
    try {
      const db = drizzle(env.DB);
      
      if (type === 'subdomain') {
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.subdomain, value))
          .limit(1);
        
        if (result[0]) {
          store = result[0];
          storeId = result[0].id;
        }
      } else {
        // Custom domain lookup
        isCustomDomainAccess = true;
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.customDomain, value))
          .limit(1);
        
        if (result[0]) {
          store = result[0];
          storeId = result[0].id;
        }
      }
    } catch (error) {
      // Log error to monitoring service in production
    }
    
    return {
      cloudflare: {
        env: {
          ...context.env,
          R2_PUBLIC_URL: (context.env.R2_PUBLIC_URL as string) || '',
          SAAS_DOMAIN: saasDomain,
          CLOUDFLARE_API_TOKEN: (context.env.CLOUDFLARE_API_TOKEN as string) || '',
          CLOUDFLARE_ZONE_ID: (context.env.CLOUDFLARE_ZONE_ID as string) || '',
        } as Env,
        ctx: context as unknown as ExecutionContext,
        cf: context.request.cf,
      },
      storeId,
      store,
      isCustomDomain: isCustomDomainAccess,
    };
  },
});
