/**
 * Cloudflare Pages Functions Entry Point
 * 
 * This catch-all function handles SSR for all routes.
 * Bindings (D1, R2) are configured in the Cloudflare Pages dashboard
 * or via wrangler.toml for local development.
 */

import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import type { ServerBuild } from '@remix-run/cloudflare';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as build from '../build/server';

export const onRequest = createPagesFunctionHandler({
  build: build as unknown as ServerBuild,
  getLoadContext: (context) => {
    // Access Cloudflare bindings from context.env
    const env = context.env as {
      DB: D1Database;
      R2: R2Bucket;
      R2_PUBLIC_URL?: string;
      SAAS_DOMAIN?: string;
    };
    
    return {
      cloudflare: {
        env: {
          DB: env.DB,
          R2: env.R2,
          R2_PUBLIC_URL: env.R2_PUBLIC_URL || '',
          SAAS_DOMAIN: env.SAAS_DOMAIN || 'mysaas.com',
        },
        ctx: context as unknown as ExecutionContext,
        cf: context.request.cf,
      },
      // These will be populated by tenant middleware in the loader
      storeId: 0,
      store: null,
      isCustomDomain: false,
    };
  },
});
