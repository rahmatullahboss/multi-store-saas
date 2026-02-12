import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { apiKeys } from '@db/schema';

/**
 * Generate a cryptographically strong random key
 */
function generateRandomKey(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash key using SHA-256 (Web Crypto API)
 */
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a new API Key for a store
 */
export async function generateApiKey(
  db: D1Database,
  storeId: number,
  name: string,
  scopes: string[] = ['read_orders', 'write_orders']
) {
  const drizzleDb = drizzle(db);
  
  // 1. Generate Key
  const randomPart = generateRandomKey(24);
  const key = `sk_live_${randomPart}`;
  
  // 2. Hash Key
  const keyHash = await hashKey(key);
  
  // 3. Create Prefix (sk_live_xxxx)
  const keyPrefix = `sk_live_${randomPart.substring(0, 4)}`;

  // 4. Store in DB
  const result = await drizzleDb
    .insert(apiKeys)
    .values({
      storeId,
      name,
      keyPrefix,
      keyHash,
      scopes: JSON.stringify(scopes),
    })
    .returning();

  return {
    key, // Show this ONCE to user
    apiKey: result[0],
  };
}

/**
 * Revoke an API Key
 */
export async function revokeApiKey(db: D1Database, keyId: number, storeId: number) {
  const drizzleDb = drizzle(db);
  
  await drizzleDb
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.storeId, storeId)));
}

/**
 * Validate an API Key
 */
export async function validateApiKey(db: D1Database, key: string) {
  const drizzleDb = drizzle(db);
  const keyHash = await hashKey(key);
  
  const result = await drizzleDb
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash)))
    .limit(1);

  if (result.length === 0) return null;
  
  const apiKey = result[0];
  if (apiKey.revokedAt) return null;

  // Update last used (fire and forget via WaitUntil if possible, but here we just return)
  // Ideally, update access time asynchronously
  
  return apiKey;
}

/**
 * Update Last Used Timestamp (Call this after successful validation)
 */
export async function updateKeyUsage(db: D1Database, keyId: number) {
   const drizzleDb = drizzle(db);
   await drizzleDb.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
}

/**
 * Middleware: Authenticate Request via API Key
 * Returns { storeId, scopes } or throws 401
 */
export async function authenticateApiKey(request: Request, env: { DB: D1Database }, requiredScope?: string) {
  const jsonHeaders = {
    'Content-Type': 'application/json',
  };
  const bearer = (extra?: string) =>
    extra ? `Bearer realm="api", ${extra}` : 'Bearer realm="api"';

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
    throw new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid API Key' }), {
      status: 401,
      headers: {
        ...jsonHeaders,
        'WWW-Authenticate': bearer(),
      },
    });
  }

  const key = authHeader.replace('Bearer ', '');
  const apiKey = await validateApiKey(env.DB, key);

  if (!apiKey) {
    throw new Response(JSON.stringify({ error: 'Unauthorized: Invalid API Key' }), {
      status: 401,
      headers: {
        ...jsonHeaders,
        'WWW-Authenticate': bearer(
          'error="invalid_token", error_description="The API key is invalid or revoked"'
        ),
      },
    });
  }

  const scopes = JSON.parse(apiKey.scopes as string) as string[];
  if (requiredScope && !scopes.includes(requiredScope)) {
    throw new Response(JSON.stringify({ error: `Forbidden: Missing scope '${requiredScope}'` }), {
      status: 403,
      headers: {
        ...jsonHeaders,
        'WWW-Authenticate': bearer(`error="insufficient_scope", scope="${requiredScope}"`),
      },
    });
  }

  // Async update usage (fire and forget)
  // We can't use context.waitUntil here easily unless passed, so we skip or await
  // For now, let's await to be safe, or just fire promise without await (edge workers might kill it though)
  await updateKeyUsage(env.DB, apiKey.id);

  return { storeId: apiKey.storeId, scopes };
}
