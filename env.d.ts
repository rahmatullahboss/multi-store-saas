/**
 * Environment Type Definitions
 * 
 * Cloudflare Workers bindings (D1, R2) and Remix context types.
 */

/// <reference types="@cloudflare/workers-types" />

import type { Store } from '@db/schema';

declare global {
  interface Env {
    DB: D1Database;
    R2: R2Bucket; // R2 bucket for image storage
    R2_PUBLIC_URL: string; // Public URL for R2 bucket
    SAAS_DOMAIN: string;
    RESEND_API_KEY: string; // Email service
    VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    VAPID_SUBJECT: string;
    ASSETS?: Fetcher; // Optional - only present in Workers, not Pages
    OPENROUTER_API_KEY?: string;
    AI_MODEL?: string;
    AI_BASE_URL?: string;
    // Super Admin Email (only this email can impersonate users)
    SUPER_ADMIN_EMAIL?: string;
    // bKash Payment Gateway
    BKASH_BASE_URL?: string;
    BKASH_APP_KEY?: string;
    BKASH_APP_SECRET?: string;
    BKASH_USERNAME?: string;
    BKASH_PASSWORD?: string;
    // Cloudflare Queue
    EMAIL_QUEUE?: Queue<unknown>;
    // KV Namespace for AI Rate Limiting
    AI_RATE_LIMIT?: KVNamespace;
    // Session Secret for Cookie Encryption
    SESSION_SECRET: string;
    // Google OAuth
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;

    // Agent Flow Bindings
    AI: any; // Cloudflare Workers AI
    VECTORIZE: VectorizeIndex;
    MIMO_API_KEY?: string; // XiaoMi MiMo API Key
    ENVIRONMENT?: 'development' | 'production' | 'staging';
    SENTRY_DSN?: string;
    // Master Facebook Pixel for platform-wide audience aggregation
    MASTER_FACEBOOK_PIXEL_ID?: string;

    // SMS Gateway (SSL Wireless)
    SSL_SMS_API_TOKEN?: string;
    SSL_SMS_SID?: string;
    SSL_SMS_DOMAIN?: string;

    // WhatsApp Cloud API
    META_WHATSAPP_TOKEN?: string;
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
