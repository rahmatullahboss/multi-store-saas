/**
 * Cloudflare Pages Functions Entry Point
 * 
 * This catch-all function handles SSR for all routes.
 * Bindings (D1, R2) are configured in the Cloudflare Pages dashboard
 * or via wrangler.toml for local development.
 */

import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

// @ts-expect-error - Virtual module from Remix build
import * as build from '../build/server';

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => {
    // Access Cloudflare bindings from context.env
    const env = context.env as {
      DB: D1Database;
      R2: R2Bucket;
      SAAS_DOMAIN?: string;
    };
    
    return {
      cloudflare: {
        env: {
          DB: env.DB,
          R2: env.R2,
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
