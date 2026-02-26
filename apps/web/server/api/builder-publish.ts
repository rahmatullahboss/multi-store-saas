/**
 * Builder Publish API Routes — Phase 7
 *
 * Hono routes for publishing/unpublishing builder pages via KV static snapshots.
 *
 * Endpoints:
 *   POST /api/builder/publish/:pageId    → publish page to KV
 *   POST /api/builder/unpublish/:pageId  → unpublish page, remove from KV
 *   GET  /api/builder/status/:pageId     → get publish status
 *
 * Auth: Session cookie (same __session cookie used across the platform).
 * Tenancy: ALL D1 queries scoped by store_id from tenant middleware.
 * Validation: Zod schemas on all incoming bodies.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { TenantEnv, TenantContext } from '../middleware/tenant';
import { getSessionStorage } from '../../app/services/auth.server';
import {
  publishPage,
  unpublishPage,
  getPublishStatus,
} from '../../app/services/builder-publisher.server';

// ─── Context Types ────────────────────────────────────────────────────────────

type BuilderPublishEnv = TenantEnv & {
  SESSION_SECRET: string;
  STORE_CACHE?: KVNamespace;
  SAAS_DOMAIN: string;
};

type BuilderPublishContext = {
  Bindings: BuilderPublishEnv;
  Variables: TenantContext;
};

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/** pageId param — must be a non-empty string (UUID). */
const PageIdParamSchema = z.object({
  pageId: z.string().min(1, 'pageId is required').max(128),
});

// ─── Auth Helper (Hono-native session extraction) ─────────────────────────────

/**
 * Extract the authenticated userId and sessionStoreId from the session cookie.
 * Returns null if the session is missing or invalid.
 *
 * This mirrors the pattern in auth.server.ts (getUserId / getStoreId) but works
 * directly on the raw Request inside a Hono handler without requiring Remix context.
 */
async function getSessionUser(
  request: Request,
  env: BuilderPublishEnv
): Promise<{ userId: number; sessionStoreId: number } | null> {
  try {
    const storage = getSessionStorage(env as unknown as Env);
    const session = await storage.getSession(request.headers.get('Cookie'));
    const userId = session.get('userId');
    const sessionStoreId = session.get('storeId');
    if (!userId || !sessionStoreId) return null;
    return { userId, sessionStoreId };
  } catch {
    return null;
  }
}

/**
 * Verify that:
 * 1. The request has a valid session (userId + storeId in cookie).
 * 2. The session's storeId matches the tenant storeId resolved by middleware.
 *
 * Store ownership is established via the session cookie: the platform only writes
 * `storeId` into the session during login for the store that belongs to the user.
 * There is no `stores.userId` FK — ownership is implicit through the session.
 *
 * Returns the verified { userId, storeId }, or throws an enriched Error.
 */
async function requireStoreAccess(
  request: Request,
  env: BuilderPublishEnv,
  tenantStoreId: number
): Promise<{ userId: number; storeId: number }> {
  const sessionUser = await getSessionUser(request, env);
  if (!sessionUser) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }

  const { userId, sessionStoreId } = sessionUser;

  // The session storeId must match the tenant storeId resolved from hostname.
  // This ensures a merchant can only publish pages for their own store.
  if (sessionStoreId !== tenantStoreId) {
    throw Object.assign(new Error('Forbidden: store mismatch'), { status: 403 });
  }

  return { userId, storeId: tenantStoreId };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const builderPublishApi = new Hono<BuilderPublishContext>();

// ─── POST /api/builder/publish/:pageId ────────────────────────────────────────

/**
 * Publish a builder page.
 *
 * Copies draft props → published props for every section, builds a JSON snapshot,
 * writes it to KV (deleting stale entry first), and updates D1 status.
 *
 * Response 200: { success: true, url, publishedAt, sectionsCount }
 */
builderPublishApi.post('/publish/:pageId', async (c) => {
  // ── Validate path param ────────────────────────────────────────────────────
  const paramResult = PageIdParamSchema.safeParse({ pageId: c.req.param('pageId') });
  if (!paramResult.success) {
    return c.json(
      { success: false, error: 'Invalid pageId', details: paramResult.error.flatten() },
      400
    );
  }
  const { pageId } = paramResult.data;

  // ── Auth + store ownership ─────────────────────────────────────────────────
  const tenantStoreId = c.get('storeId');
  let verifiedStoreId: number;
  try {
    const auth = await requireStoreAccess(c.req.raw, c.env, tenantStoreId);
    verifiedStoreId = auth.storeId;
  } catch (err) {
    const e = err as Error & { status?: number };
    return c.json({ success: false, error: e.message }, (e.status ?? 401) as 401 | 403);
  }

  // ── KV availability guard ──────────────────────────────────────────────────
  if (!c.env.STORE_CACHE) {
    console.error('[builder-publish] STORE_CACHE KV binding is not configured');
    return c.json({ success: false, error: 'KV storage not configured' }, 503);
  }

  // ── Publish ────────────────────────────────────────────────────────────────
  try {
    const result = await publishPage(
      c.env.DB,
      c.env.STORE_CACHE,
      pageId,
      verifiedStoreId,
      c.env.SAAS_DOMAIN
    );
    return c.json(result, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to publish page';
    const isNotFound = message.includes('not found') || message.includes('access denied');
    console.error(`[builder-publish] publish error for page ${pageId}:`, err);
    return c.json({ success: false, error: message }, isNotFound ? 404 : 500);
  }
});

// ─── POST /api/builder/unpublish/:pageId ──────────────────────────────────────

/**
 * Unpublish a builder page.
 *
 * Removes KV entries and sets D1 status back to 'draft'.
 *
 * Response 200: { success: true }
 */
builderPublishApi.post('/unpublish/:pageId', async (c) => {
  // ── Validate path param ────────────────────────────────────────────────────
  const paramResult = PageIdParamSchema.safeParse({ pageId: c.req.param('pageId') });
  if (!paramResult.success) {
    return c.json(
      { success: false, error: 'Invalid pageId', details: paramResult.error.flatten() },
      400
    );
  }
  const { pageId } = paramResult.data;

  // ── Auth + store ownership ─────────────────────────────────────────────────
  const tenantStoreId = c.get('storeId');
  let verifiedStoreId: number;
  try {
    const auth = await requireStoreAccess(c.req.raw, c.env, tenantStoreId);
    verifiedStoreId = auth.storeId;
  } catch (err) {
    const e = err as Error & { status?: number };
    return c.json({ success: false, error: e.message }, (e.status ?? 401) as 401 | 403);
  }

  // ── KV availability guard ──────────────────────────────────────────────────
  if (!c.env.STORE_CACHE) {
    console.error('[builder-publish] STORE_CACHE KV binding is not configured');
    return c.json({ success: false, error: 'KV storage not configured' }, 503);
  }

  // ── Unpublish ──────────────────────────────────────────────────────────────
  try {
    const result = await unpublishPage(
      c.env.DB,
      c.env.STORE_CACHE,
      pageId,
      verifiedStoreId
    );
    return c.json(result, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unpublish page';
    const isNotFound = message.includes('not found') || message.includes('access denied');
    console.error(`[builder-publish] unpublish error for page ${pageId}:`, err);
    return c.json({ success: false, error: message }, isNotFound ? 404 : 500);
  }
});

// ─── GET /api/builder/status/:pageId ─────────────────────────────────────────

/**
 * Get the current publish status of a page.
 *
 * Checks both D1 (authoritative status) and KV (live entry presence).
 *
 * Response 200: { pageId, slug, status, publishedAt, lastPublishedAt, kvHit }
 */
builderPublishApi.get('/status/:pageId', async (c) => {
  // ── Validate path param ────────────────────────────────────────────────────
  const paramResult = PageIdParamSchema.safeParse({ pageId: c.req.param('pageId') });
  if (!paramResult.success) {
    return c.json(
      { success: false, error: 'Invalid pageId', details: paramResult.error.flatten() },
      400
    );
  }
  const { pageId } = paramResult.data;

  // ── Auth + store ownership ─────────────────────────────────────────────────
  const tenantStoreId = c.get('storeId');
  let verifiedStoreId: number;
  try {
    const auth = await requireStoreAccess(c.req.raw, c.env, tenantStoreId);
    verifiedStoreId = auth.storeId;
  } catch (err) {
    const e = err as Error & { status?: number };
    return c.json({ success: false, error: e.message }, (e.status ?? 401) as 401 | 403);
  }

  // ── KV availability guard ──────────────────────────────────────────────────
  if (!c.env.STORE_CACHE) {
    console.error('[builder-publish] STORE_CACHE KV binding is not configured');
    return c.json({ success: false, error: 'KV storage not configured' }, 503);
  }

  // ── Status ────────────────────────────────────────────────────────────────
  try {
    const status = await getPublishStatus(
      c.env.DB,
      c.env.STORE_CACHE,
      pageId,
      verifiedStoreId
    );
    return c.json(status, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get publish status';
    const isNotFound = message.includes('not found') || message.includes('access denied');
    console.error(`[builder-publish] status error for page ${pageId}:`, err);
    return c.json({ success: false, error: message }, isNotFound ? 404 : 500);
  }
});
