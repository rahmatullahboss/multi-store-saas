---
name: Cloudflare KV
description: Expert skill for Cloudflare KV - distributed key-value storage, caching strategies, rate limiting, and session management.
---

# Cloudflare KV Skill

This skill covers Cloudflare KV for building high-performance caching, session management, rate limiting, and global key-value storage.

## 1) Core Concepts

### KV Binding

```typescript
// wrangler.toml
[[kv_namespaces]];
binding = 'KV';
id = 'your-namespace-id'[
  // For rate limiting
  [kv_namespaces]
];
binding = 'AI_RATE_LIMIT';
id = 'rate-limit-namespace-id'[
  // For store caching
  [kv_namespaces]
];
binding = 'STORE_CACHE';
id = 'store-cache-namespace-id';

// TypeScript
interface Env {
  KV: KVNamespace;
  AI_RATE_LIMIT: KVNamespace;
  STORE_CACHE: KVNamespace;
}
```

### KV Characteristics

| Feature               | Details                         |
| --------------------- | ------------------------------- |
| **Consistency**       | Eventually consistent (seconds) |
| **Max Value Size**    | 25MB                            |
| **Max Key Size**      | 512 bytes                       |
| **Read Latency**      | <10ms globally                  |
| **Write Propagation** | ~60 seconds globally            |

---

## 2) Basic Operations

### Get/Put/Delete

```typescript
// Get value
const value = await env.KV.get('key');
const jsonValue = await env.KV.get('key', 'json');
const bufferValue = await env.KV.get('key', 'arrayBuffer');

// Put value
await env.KV.put('key', 'value');
await env.KV.put('key', JSON.stringify({ data: 'object' }));

// Put with TTL (seconds)
await env.KV.put('key', 'value', { expirationTtl: 3600 }); // 1 hour

// Put with expiration timestamp
await env.KV.put('key', 'value', { expiration: Math.floor(Date.now() / 1000) + 3600 });

// Delete
await env.KV.delete('key');
```

### Get with Metadata

```typescript
interface CacheMetadata {
  version: number;
  createdAt: string;
  storeId: string;
}

const result = await env.KV.getWithMetadata<CacheMetadata>('key', 'json');
if (result.value) {
  console.log('Value:', result.value);
  console.log('Metadata:', result.metadata);
}

// Put with metadata
await env.KV.put('key', JSON.stringify(data), {
  metadata: { version: 1, createdAt: new Date().toISOString(), storeId: 'abc' },
  expirationTtl: 3600,
});
```

### List Keys

```typescript
// List all keys with prefix
const list = await env.KV.list({ prefix: 'store:abc:' });

for (const key of list.keys) {
  console.log(key.name, key.expiration, key.metadata);
}

// Paginated listing
let cursor: string | undefined;
do {
  const result = await env.KV.list({ prefix: 'products:', cursor, limit: 100 });
  for (const key of result.keys) {
    // Process key
  }
  cursor = result.list_complete ? undefined : result.cursor;
} while (cursor);
```

---

## 3) Caching Patterns

### Cache-Aside Pattern

```typescript
interface CacheOptions {
  ttl?: number;
  storeId: string;
}

export async function getWithCache<T>(
  env: Env,
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cacheKey = `cache:${options.storeId}:${key}`;

  // Try cache first
  const cached = await env.STORE_CACHE.get(cacheKey, 'json');
  if (cached) {
    return cached as T;
  }

  // Fetch from source
  const data = await fetcher();

  // Store in cache
  await env.STORE_CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: options.ttl ?? 3600,
  });

  return data;
}

// Usage
const products = await getWithCache(
  env,
  'products:featured',
  () => db.select().from(products).limit(10),
  { storeId: 'store-abc', ttl: 300 }
);
```

### Write-Through Cache

```typescript
export async function updateWithCache<T>(
  env: Env,
  key: string,
  storeId: string,
  updater: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  // Update source
  const data = await updater();

  // Update cache
  const cacheKey = `cache:${storeId}:${key}`;
  await env.STORE_CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: ttl,
  });

  return data;
}
```

### Cache Invalidation

```typescript
export async function invalidateCache(
  env: Env,
  storeId: string,
  patterns: string[]
): Promise<void> {
  for (const pattern of patterns) {
    const prefix = `cache:${storeId}:${pattern}`;
    const keys = await env.STORE_CACHE.list({ prefix });

    await Promise.all(keys.keys.map((key) => env.STORE_CACHE.delete(key.name)));
  }
}

// Usage: Invalidate all product caches for a store
await invalidateCache(env, 'store-abc', ['products:']);
```

### Versioned Cache Keys

```typescript
// Use version in cache key to avoid stale data
export async function getVersionedCache<T>(
  env: Env,
  storeId: string,
  version: number,
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = `v${version}:${storeId}:${key}`;

  const cached = await env.STORE_CACHE.get(cacheKey, 'json');
  if (cached) return cached as T;

  const data = await fetcher();
  await env.STORE_CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: 86400, // 24 hours
  });

  return data;
}
```

---

## 4) Rate Limiting

### Token Bucket Rate Limiter

```typescript
interface RateLimitConfig {
  maxTokens: number; // Max requests allowed
  refillRate: number; // Tokens added per second
  windowMs: number; // Time window in ms
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const kvKey = `ratelimit:${key}`;

  const stored = (await kv.get(kvKey, 'json')) as {
    tokens: number;
    lastRefill: number;
  } | null;

  let tokens: number;
  let lastRefill: number;

  if (!stored) {
    tokens = config.maxTokens;
    lastRefill = now;
  } else {
    // Calculate tokens to add based on time passed
    const timePassed = (now - stored.lastRefill) / 1000;
    const tokensToAdd = timePassed * config.refillRate;
    tokens = Math.min(config.maxTokens, stored.tokens + tokensToAdd);
    lastRefill = now;
  }

  if (tokens < 1) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: now + (1 / config.refillRate) * 1000,
    };
  }

  // Consume a token
  tokens -= 1;

  await kv.put(kvKey, JSON.stringify({ tokens, lastRefill }), {
    expirationTtl: Math.ceil(config.windowMs / 1000),
  });

  return {
    allowed: true,
    remaining: Math.floor(tokens),
    resetAt: now + config.windowMs,
  };
}

// Usage
const result = await checkRateLimit(env.AI_RATE_LIMIT, `user:${userId}`, {
  maxTokens: 20,
  refillRate: 20 / (15 * 60), // 20 tokens per 15 minutes
  windowMs: 15 * 60 * 1000,
});
```

### Simple Counter Rate Limiter

```typescript
export async function simpleRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number }> {
  const kvKey = `count:${key}`;
  const current = (await kv.get(kvKey, 'json')) as { count: number } | null;

  const count = (current?.count ?? 0) + 1;

  if (count > limit) {
    return { allowed: false, count };
  }

  await kv.put(kvKey, JSON.stringify({ count }), {
    expirationTtl: windowSeconds,
  });

  return { allowed: true, count };
}

// Usage: 100 requests per hour
const { allowed } = await simpleRateLimit(env.AI_RATE_LIMIT, `api:${storeId}`, 100, 3600);
```

---

## 5) Session Management

### Store Session

```typescript
interface Session {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff' | 'customer';
  createdAt: string;
  expiresAt: string;
}

export async function createSession(
  kv: KVNamespace,
  session: Omit<Session, 'createdAt' | 'expiresAt'>,
  ttlSeconds = 86400 // 24 hours
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = new Date();

  const sessionData: Session = {
    ...session,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
  };

  await kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
    expirationTtl: ttlSeconds,
  });

  return sessionId;
}

export async function getSession(kv: KVNamespace, sessionId: string): Promise<Session | null> {
  return await kv.get(`session:${sessionId}`, 'json');
}

export async function deleteSession(kv: KVNamespace, sessionId: string): Promise<void> {
  await kv.delete(`session:${sessionId}`);
}

// Extend session TTL
export async function touchSession(
  kv: KVNamespace,
  sessionId: string,
  ttlSeconds = 86400
): Promise<void> {
  const session = await getSession(kv, sessionId);
  if (session) {
    session.expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await kv.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: ttlSeconds,
    });
  }
}
```

---

## 6) Store Configuration Cache

### Published Page Cache

```typescript
interface PublishedPage {
  id: string;
  sections: Array<{ type: string; props: Record<string, unknown> }>;
  theme: Record<string, string>;
  version: number;
}

export async function cachePublishedPage(
  kv: KVNamespace,
  storeId: string,
  pageId: string,
  page: PublishedPage
): Promise<void> {
  const key = `page:${storeId}:${pageId}`;
  await kv.put(key, JSON.stringify(page), {
    metadata: { version: page.version, cachedAt: Date.now() },
  });
}

export async function getPublishedPage(
  kv: KVNamespace,
  storeId: string,
  pageId: string
): Promise<PublishedPage | null> {
  return await kv.get(`page:${storeId}:${pageId}`, 'json');
}

export async function invalidatePageCache(
  kv: KVNamespace,
  storeId: string,
  pageId: string
): Promise<void> {
  await kv.delete(`page:${storeId}:${pageId}`);
}
```

### Store Config Cache

```typescript
interface StoreConfig {
  name: string;
  domain: string;
  theme: Record<string, string>;
  settings: Record<string, unknown>;
}

export async function getStoreConfig(env: Env, storeId: string): Promise<StoreConfig> {
  const cacheKey = `config:${storeId}`;

  // Try cache
  const cached = await env.STORE_CACHE.get(cacheKey, 'json');
  if (cached) return cached as StoreConfig;

  // Fetch from D1
  const store = await env.DB.prepare(
    `
    SELECT * FROM stores WHERE id = ?
  `
  )
    .bind(storeId)
    .first();

  if (!store) throw new Error('Store not found');

  const config: StoreConfig = {
    name: store.name as string,
    domain: store.domain as string,
    theme: JSON.parse((store.theme as string) || '{}'),
    settings: JSON.parse((store.settings as string) || '{}'),
  };

  // Cache for 5 minutes
  await env.STORE_CACHE.put(cacheKey, JSON.stringify(config), {
    expirationTtl: 300,
  });

  return config;
}
```

---

## 7) Key Naming Conventions

### Recommended Patterns

| Pattern                  | Example                 | Use Case        |
| ------------------------ | ----------------------- | --------------- |
| `{type}:{storeId}:{id}`  | `product:abc:123`       | Entity cache    |
| `v{version}:{key}`       | `v5:config:abc`         | Versioned cache |
| `session:{sessionId}`    | `session:uuid`          | User sessions   |
| `ratelimit:{scope}:{id}` | `ratelimit:api:user123` | Rate limits     |
| `temp:{purpose}:{id}`    | `temp:upload:file123`   | Temporary data  |

### Key Design Best Practices

```typescript
// ✅ Good: Hierarchical, scannable
const key = `store:${storeId}:products:${productId}`;

// ✅ Good: Versioned for cache busting
const key = `v${version}:store:${storeId}:homepage`;

// ❌ Bad: No namespace, collision risk
const key = productId;

// ❌ Bad: Too long (512 byte limit)
const key = `store:${storeId}:category:${categoryId}:subcategory:${subId}:products:${productId}:variant:${variantId}:option:${optionId}`;
```

---

## 8) Best Practices

### Eventual Consistency Handling

```typescript
// For write-then-read scenarios, add small delay or use D1 Sessions API
export async function updateAndGet(env: Env, storeId: string, data: unknown) {
  // Write to D1 (source of truth)
  await env.DB.prepare('UPDATE stores SET data = ? WHERE id = ?')
    .bind(JSON.stringify(data), storeId)
    .run();

  // Update cache immediately (don't wait for propagation)
  await env.STORE_CACHE.put(`config:${storeId}`, JSON.stringify(data));

  // Return the data we just wrote (don't read from cache)
  return data;
}
```

### Batch Operations

```typescript
// KV doesn't support batch operations natively
// Use Promise.all for concurrent operations
export async function batchGet(kv: KVNamespace, keys: string[]): Promise<Map<string, unknown>> {
  const results = await Promise.all(
    keys.map(async (key) => ({
      key,
      value: await kv.get(key, 'json'),
    }))
  );

  return new Map(results.map((r) => [r.key, r.value]));
}

export async function batchDelete(kv: KVNamespace, keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => kv.delete(key)));
}
```

---

## Quick Reference

| Operation         | Code                                                  |
| ----------------- | ----------------------------------------------------- |
| Get string        | `await kv.get('key')`                                 |
| Get JSON          | `await kv.get('key', 'json')`                         |
| Get with metadata | `await kv.getWithMetadata('key', 'json')`             |
| Put with TTL      | `await kv.put('key', value, { expirationTtl: 3600 })` |
| Put with metadata | `await kv.put('key', value, { metadata: {...} })`     |
| Delete            | `await kv.delete('key')`                              |
| List keys         | `await kv.list({ prefix: 'store:' })`                 |
