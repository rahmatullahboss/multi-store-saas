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
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    RESEND_API_KEY?: string; // Email service
    ASSETS?: Fetcher; // Optional - only present in Workers, not Pages
    // bKash Payment Gateway
    BKASH_BASE_URL?: string;
    BKASH_APP_KEY?: string;
    BKASH_APP_SECRET?: string;
    BKASH_USERNAME?: string;
    BKASH_PASSWORD?: string;
    // Cloudflare Queue
    EMAIL_QUEUE?: Queue<unknown>;
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
