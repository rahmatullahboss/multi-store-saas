/**
 * api-key-auth.ts — Ozzyl API Platform
 * Hono middleware: API key authentication
 *
 * KV-first (cache hit = no D1 query)
 * D1 fallback on cache miss
 * Sets c.var.apiKey for downstream handlers
 */

import type { MiddlewareHandler } from 'hono';
import { validateApiKey, type ValidatedApiKey, type ApiKeyScope } from '~/services/api.server';

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    apiKey: ValidatedApiKey;
  }
}

/**
 * apiKeyAuth middleware
 * Extracts Bearer token from Authorization header,
 * validates against KV cache + D1, sets c.var.apiKey
 *
 * @param requiredScopes - Optional scopes required for this route
 *
 * @example
 * v1.get('/products', apiKeyAuth(['read_products']), listProducts)
 */
export function apiKeyAuth(requiredScopes: ApiKeyScope[] = []): MiddlewareHandler {
  return async (c, next) => {
    // 1. Extract token from Authorization: Bearer sk_live_xxx
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json(
        { success: false, error: 'missing_auth', message: 'Authorization: Bearer <api_key> required' },
        401
      );
    }

    const rawKey = authHeader.slice(7).trim();
    if (!rawKey) {
      return c.json(
        { success: false, error: 'missing_auth', message: 'API key is empty' },
        401
      );
    }

    // 2. Validate key (KV-first, D1 fallback)
    const hmacSecret = c.env.API_KEY_SECRET;
    if (!hmacSecret) {
      console.error('[apiKeyAuth] API_KEY_SECRET env var is not set!');
      return c.json({ success: false, error: 'server_error', message: 'Internal configuration error' }, 500);
    }

    const validated = await validateApiKey(
      c.env.DB,
      c.env.KV,
      rawKey,
      hmacSecret,
      requiredScopes,
      c.executionCtx
    );

    if (!validated) {
      return c.json(
        { success: false, error: 'invalid_api_key', message: 'API key is invalid, revoked, or expired' },
        401
      );
    }

    // 3. Set on context for downstream handlers
    c.set('apiKey', validated);

    // 4. Add response headers
    // NOTE: X-Store-Id intentionally omitted — exposing the raw integer PK
    // enables sequential enumeration of all stores. Downstream server-side
    // handlers access storeId via c.var.apiKey.storeId instead.
    c.res.headers.set('X-Api-Key-Mode', validated.mode);

    await next();
  };
}

/**
 * requireScopes — scope-check middleware
 * Use AFTER apiKeyAuth when you need fine-grained scope control per route
 *
 * @example
 * v1.delete('/products/:id',
 *   apiKeyAuth(),          // authenticate
 *   requireScopes(['write_products']), // authorize
 *   deleteProduct
 * )
 */
export function requireScopes(scopes: ApiKeyScope[]): MiddlewareHandler {
  return async (c, next) => {
    const apiKey = c.var.apiKey;
    if (!apiKey) {
      return c.json({ success: false, error: 'unauthenticated', message: 'apiKeyAuth must run first' }, 401);
    }

    const keyScopes = apiKey.scopes;
    // Cast to string[] to check for '*' superscope at runtime without widening
    // the public ApiKeyScope type (InternalScope is intentionally not exported).
    const hasSuperScope = (keyScopes as string[]).includes('*');
    const hasAll = hasSuperScope || scopes.every((s) => keyScopes.includes(s));

    if (!hasAll) {
      const missing = scopes.filter((s) => !keyScopes.includes(s));
      return c.json(
        {
          success: false,
          error: 'insufficient_scopes',
          message: `Missing required scopes: ${missing.join(', ')}`,
          required: scopes,
          granted: keyScopes,
        },
        403
      );
    }

    await next();
  };
}
