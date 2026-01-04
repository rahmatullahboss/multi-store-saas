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
    R2: R2Bucket;
    SAAS_DOMAIN: string;
    ASSETS: Fetcher;
  }
}

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
      cf: CfProperties;
    };
    // Tenant context injected by middleware
    storeId: number;
    store: Store;
    isCustomDomain: boolean;
  }
}

export {};
