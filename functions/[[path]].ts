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
 */
function isMainDomain(hostname: string): boolean {
  const mainDomains = [
    'localhost',
    '127.0.0.1',
    'multi-store-saas.pages.dev',
    'digitalcare.site',
    'www.digitalcare.site',
  ];
  
  return mainDomains.includes(hostname) || 
    (hostname.endsWith('.pages.dev') && hostname.split('.').length <= 3);
}

export const onRequest = createPagesFunctionHandler({
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
    
    const saasDomain = env.SAAS_DOMAIN || 'digitalcare.site';
    
    console.log(`[PAGES] ============================================`);
    console.log(`[PAGES] Request: ${request.method} ${url.pathname}`);
    console.log(`[PAGES] Hostname: ${hostname}`);
    console.log(`[PAGES] SAAS_DOMAIN: ${saasDomain}`);
    
    // Default context values
    let storeId = 0;
    let store = null;
    let isCustomDomainAccess = false;
    
    // Skip tenant resolution for main domains
    if (isMainDomain(hostname)) {
      console.log(`[PAGES] Main domain detected, skipping tenant resolution`);
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
    console.log(`[PAGES] Parsed hostname: type=${type}, value=${value}`);
    
    try {
      const db = drizzle(env.DB);
      
      if (type === 'subdomain') {
        console.log(`[PAGES] Looking up store by subdomain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.subdomain, value))
          .limit(1);
        
        if (result[0]) {
          store = result[0];
          storeId = result[0].id;
          console.log(`[PAGES] ✓ Store found: ID=${storeId}, Name=${store.name}`);
        } else {
          console.warn(`[PAGES] Store not found for subdomain: ${value}`);
        }
      } else {
        // Custom domain lookup
        isCustomDomainAccess = true;
        console.log(`[PAGES] Looking up store by custom domain: ${value}`);
        const result = await db
          .select()
          .from(stores)
          .where(eq(stores.customDomain, value))
          .limit(1);
        
        if (result[0]) {
          store = result[0];
          storeId = result[0].id;
          console.log(`[PAGES] ✓ Store found: ID=${storeId}, Name=${store.name}`);
        } else {
          console.warn(`[PAGES] Store not found for custom domain: ${value}`);
        }
      }
    } catch (error) {
      console.error(`[PAGES] Error resolving tenant:`, error);
      console.error(`[PAGES] Error message:`, error instanceof Error ? error.message : String(error));
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
