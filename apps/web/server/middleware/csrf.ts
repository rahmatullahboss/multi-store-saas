/**
 * CSRF / Cross-site mutation guard (admin + authenticated routes)
 *
 * Remix's default `SameSite=Lax` cookies reduce CSRF risk, but for admin actions
 * (settings, products, inventory) we add an explicit origin check as a hard gate.
 *
 * Policy:
 * - For non-idempotent methods (POST/PUT/PATCH/DELETE):
 *   - If `Origin` is present, it must match `request.url` origin.
 *   - Else if `Referer` is present, it must start with `request.url` origin.
 *   - Else: allow only in non-production (to avoid breaking local tools),
 *     deny in production.
 *
 * Notes:
 * - This is intentionally "fail closed" in production for admin routes.
 * - Do NOT apply to public storefront routes like `/api/create-order` (no auth),
 *   as it would break legitimate cross-site/payment redirect flows.
 */

import type { MiddlewareHandler } from 'hono';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function csrfOriginGuard(): MiddlewareHandler {
  return async (c, next) => {
    if (!MUTATION_METHODS.has(c.req.method)) {
      return next();
    }

    const url = new URL(c.req.url);
    const requestOrigin = url.origin;

    const origin = c.req.header('origin') ?? undefined;
    const referer = c.req.header('referer') ?? undefined;

    const isProd = c.env?.ENVIRONMENT === 'production' || !c.env?.ENVIRONMENT;

    // If browser provides Origin, prefer it.
    if (origin) {
      if (origin !== requestOrigin) {
        return c.json(
          {
            error: 'CSRF protection: invalid origin',
            expected: requestOrigin,
            received: origin,
          },
          403
        );
      }
      return next();
    }

    // Fallback: Referer check.
    if (referer) {
      if (!referer.startsWith(requestOrigin + '/')) {
        return c.json(
          {
            error: 'CSRF protection: invalid referer',
            expectedPrefix: requestOrigin + '/',
            received: referer,
          },
          403
        );
      }
      return next();
    }

    // If neither header exists, be strict in prod.
    if (isProd) {
      return c.json(
        {
          error: 'CSRF protection: missing origin headers',
        },
        403
      );
    }

    return next();
  };
}

