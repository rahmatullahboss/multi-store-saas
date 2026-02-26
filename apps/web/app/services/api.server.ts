/**
 * api.server.ts — Ozzyl API Platform
 * Enterprise-grade API key management service
 *
 * Fixes applied (Adversarial Review × 2):
 * ✅ HMAC-SHA256 hashing (not raw SHA-256)
 * ✅ KV caching for validateApiKey (no D1 hit on every request)
 * ✅ lastUsedAt update via waitUntil (non-blocking)
 * ✅ sk_live_ / sk_test_ mode support
 * ✅ 256-bit entropy (32 bytes)
 * ✅ Scope validation built into validateApiKey
 * ✅ Single source of truth for default scopes
 * ✅ Instant KV revocation on revokeApiKey
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { apiKeys } from '@db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiKeyMode = 'live' | 'test';

// Public scope union — these are the only values merchants ever see or set.
// '*' (superscope) is intentionally excluded to prevent accidental exposure
// in API responses, SDK types, and OpenAPI schemas.
export type ApiKeyScope =
  | 'read_products'
  | 'write_products'
  | 'read_orders'
  | 'write_orders'
  | 'read_customers'
  | 'write_customers'
  | 'read_analytics'
  | 'read_inventory'
  | 'write_inventory'
  | 'manage_webhooks';

// Internal-only superscope — NOT exported. Used only within this module for
// server-issued keys (e.g. internal service accounts). Never surfaces in
// public types, API responses, or the merchant dashboard.
type InternalScope = ApiKeyScope | '*';

export interface ValidatedApiKey {
  id: number;
  storeId: number;
  name: string;
  keyPrefix: string;
  // Typed as ApiKeyScope[] publicly. At runtime the array may also contain '*'
  // for internal service keys, but that value is never vended from the public
  // API surface and is handled internally by hasRequiredScopes.
  scopes: ApiKeyScope[];
  mode: ApiKeyMode;
  planId: number | null;
  expiresAt: Date | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KV_KEY_PREFIX = 'apikey:v1:';
const KV_TTL_SECONDS = 300; // 5 minutes
const KEY_ENTROPY_BYTES = 32; // 256-bit
const DEFAULT_SCOPES: ApiKeyScope[] = ['read_orders', 'write_orders'];

// ─── Crypto Utilities ─────────────────────────────────────────────────────────

/**
 * Generate cryptographically strong random hex string
 */
function generateRandomHex(bytes: number = KEY_ENTROPY_BYTES): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * HMAC-SHA256 hash of key using a server secret
 * Prevents rainbow table attacks if DB is compromised
 */
async function hmacHash(key: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(key));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}


// ─── KV Cache Helpers ─────────────────────────────────────────────────────────

function kvKey(keyHash: string): string {
  return `${KV_KEY_PREFIX}${keyHash}`;
}

async function getCachedKey(kv: KVNamespace, keyHash: string): Promise<ValidatedApiKey | null> {
  try {
    const cached = await kv.get(kvKey(keyHash), 'json');
    return cached as ValidatedApiKey | null;
  } catch {
    return null;
  }
}

async function setCachedKey(kv: KVNamespace, keyHash: string, data: ValidatedApiKey): Promise<void> {
  try {
    await kv.put(kvKey(keyHash), JSON.stringify(data), { expirationTtl: KV_TTL_SECONDS });
  } catch {
    // Non-critical — log and continue
    console.warn('[API] KV cache write failed');
  }
}

async function deleteCachedKey(kv: KVNamespace, keyHash: string): Promise<void> {
  try {
    await kv.delete(kvKey(keyHash));
  } catch {
    console.warn('[API] KV cache delete failed');
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a new API key for a store
 * Returns the raw key ONCE — it is never stored in DB
 */
export async function generateApiKey(
  db: D1Database,
  storeId: number,
  name: string,
  options: {
    scopes?: ApiKeyScope[];
    mode?: ApiKeyMode;
    expiresAt?: Date;
    planId?: number;
    hmacSecret: string; // Required — from env.API_KEY_SECRET
  }
) {
  const drizzleDb = drizzle(db);
  const { scopes = DEFAULT_SCOPES, mode = 'live', expiresAt, planId, hmacSecret } = options;

  // 1. Generate raw key (256-bit entropy)
  const randomPart = generateRandomHex(KEY_ENTROPY_BYTES);
  const prefix = mode === 'test' ? 'sk_test_' : 'sk_live_';
  const rawKey = `${prefix}${randomPart}`;

  // 2. HMAC-SHA256 hash for storage
  const keyHash = await hmacHash(rawKey, hmacSecret);

  // 3. Key prefix for display (first 12 chars of raw key)
  const keyPrefix = rawKey.substring(0, 12);

  // 4. Store in D1
  const result = await drizzleDb
    .insert(apiKeys)
    .values({
      storeId,
      name,
      keyPrefix,
      keyHash,
      scopes: JSON.stringify(scopes),
      ...(planId !== undefined && { planId }),
      ...(expiresAt && { expiresAt }),
    })
    .returning();

  return {
    key: rawKey, // Show ONCE to user — never stored in plain text
    apiKey: result[0],
  };
}

/**
 * Validate an API key — KV-first, D1 fallback
 * Optionally checks required scopes
 *
 * @param db - D1Database binding
 * @param kv - KVNamespace binding (for caching)
 * @param rawKey - The raw API key from Authorization header
 * @param hmacSecret - From env.API_KEY_SECRET
 * @param requiredScopes - Optional scopes to validate
 * @param ctx - ExecutionContext for non-blocking lastUsedAt update
 */
export async function validateApiKey(
  db: D1Database,
  kv: KVNamespace,
  rawKey: string,
  hmacSecret: string,
  requiredScopes: ApiKeyScope[] = [],
  ctx?: ExecutionContext
): Promise<ValidatedApiKey | null> {
  // 0. Early validation — reject empty, too-short, or suspiciously long keys (C6: DoS guard)
  if (!rawKey || rawKey.length < 20 || rawKey.length > 200) return null;

  // 1. Hash the incoming key
  const keyHash = await hmacHash(rawKey, hmacSecret);

  // 2. Check KV cache first (avoids D1 hit on every request)
  const cached = await getCachedKey(kv, keyHash);
  if (cached) {
    // Validate scopes from cache
    if (!hasRequiredScopes(cached.scopes, requiredScopes)) return null;
    // Non-blocking lastUsedAt update
    if (ctx) {
      ctx.waitUntil(updateLastUsed(db, cached.id));
    }
    return cached;
  }

  // 3. D1 fallback — cache miss
  const drizzleDb = drizzle(db);
  const result = await drizzleDb
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (result.length === 0) return null;

  const apiKey = result[0];

  // 4. Check revocation
  if (apiKey.revokedAt) return null;

  // 5. Check expiry
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;

  // 6. Parse scopes — corrupted scopes must not grant DEFAULT_SCOPES (C8: privilege escalation fix)
  let scopes: ApiKeyScope[];
  try {
    scopes = JSON.parse(apiKey.scopes || '[]');
  } catch {
    console.error('[API] Corrupted scopes for key', apiKey.id);
    return null;
  }

  // 7. Check required scopes
  if (!hasRequiredScopes(scopes, requiredScopes)) return null;

  // 8. Detect mode from key prefix
  const mode: ApiKeyMode = apiKey.keyPrefix.startsWith('sk_test_') ? 'test' : 'live';

  // 9. Build validated key object
  const validated: ValidatedApiKey = {
    id: apiKey.id,
    storeId: apiKey.storeId,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    scopes,
    mode,
    planId: apiKey.planId ?? null,
    expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null,
  };

  // 10. Cache in KV (non-blocking)
  if (ctx) {
    ctx.waitUntil(setCachedKey(kv, keyHash, validated));
  } else {
    await setCachedKey(kv, keyHash, validated);
  }

  // 11. Non-blocking lastUsedAt update
  if (ctx) {
    ctx.waitUntil(updateLastUsed(db, apiKey.id));
  } else {
    await updateLastUsed(db, apiKey.id);
  }

  return validated;
}

/**
 * Revoke an API key — instantly removes KV cache
 */
export async function revokeApiKey(
  db: D1Database,
  kv: KVNamespace,
  keyId: number,
  storeId: number,
  hmacSecret: string
): Promise<void> {
  const drizzleDb = drizzle(db);

  // 1. Get the key hash before revoking (for KV deletion)
  const existing = await drizzleDb
    .select({ keyHash: apiKeys.keyHash, keyPrefix: apiKeys.keyPrefix })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.storeId, storeId)))
    .limit(1);

  if (existing.length === 0) throw new Error(`API key ${keyId} not found for store ${storeId}`);

  // 2. Revoke in D1 — verify rowsAffected to catch race conditions (C7)
  const result = await drizzleDb
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.storeId, storeId)));
  if ((result as D1Result).meta.changes === 0) throw new Error(`API key ${keyId} not found for store ${storeId}`);

  // 3. Instantly invalidate KV cache (~1s global propagation)
  await deleteCachedKey(kv, existing[0].keyHash);
}

/**
 * List all API keys for a store (without hashes)
 */
export async function listApiKeys(db: D1Database, storeId: number) {
  const drizzleDb = drizzle(db);
  return drizzleDb
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
      expiresAt: apiKeys.expiresAt,
      planId: apiKeys.planId,
    })
    .from(apiKeys)
    .where(eq(apiKeys.storeId, storeId))
    .orderBy(apiKeys.createdAt);
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Check if key scopes satisfy required scopes
 */
function hasRequiredScopes(keyScopes: ApiKeyScope[], required: ApiKeyScope[]): boolean {
  if (required.length === 0) return true;
  // Cast to string[] to check for '*' superscope without widening the public type.
  // '*' may be present at runtime for internal service-account keys.
  if ((keyScopes as string[]).includes('*')) return true;
  return required.every((s) => keyScopes.includes(s));
}

/**
 * authenticateApiKey — backward-compatible alias for existing routes
 * @deprecated Use validateApiKey from the new Hono middleware instead
 */
export async function authenticateApiKey(
  db: D1Database,
  kv: KVNamespace,
  rawKey: string,
  hmacSecret: string
): Promise<ValidatedApiKey | null> {
  return validateApiKey(db, kv, rawKey, hmacSecret, []);
}

/**
 * Non-blocking lastUsedAt update
 */
async function updateLastUsed(db: D1Database, keyId: number): Promise<void> {
  try {
    const drizzleDb = drizzle(db);
    await drizzleDb
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyId));
  } catch (err) {
    console.warn('[API] Failed to update lastUsedAt');
  }
}
