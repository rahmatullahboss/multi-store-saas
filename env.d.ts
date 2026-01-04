/**
 * Environment Type Definitions
 * 
 * Cloudflare Workers bindings and Remix context types.
 */

/// <reference types="@cloudflare/workers-types" />

import type { Store } from '@db/schema';

declare global {
  interface Env {
    DB: D1Database;
    R2?: R2Bucket; // Optional - requires R2 activation in dashboard
    SAAS_DOMAIN: string;
    ASSETS?: Fetcher; // Optional - only present in Workers, not Pages
  }
}

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
      cf?: CfProperties;
    };
    // Tenant context injected by middleware
    storeId: number;
    store: Store | null;
    isCustomDomain: boolean;
  }
}

export {};
