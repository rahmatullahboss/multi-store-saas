---
name: "d1-batch-write"
description: "Write multiple D1 records in single batch to avoid limits"
when_to_use: "When inserting/updating > 5 records at once"
allowed-tools: ["Read", "Write", "Bash(wrangler d1:*)"]
---

# D1 Batch Write Process

## Step 1: Prepare Data

1. Read input array
2. Validate each record has required fields
3. Generate IDs if missing: `crypto.randomUUID()`

## Step 2: Create Batch

```typescript
const stmt = db.prepare("INSERT INTO products (id, title) VALUES (?, ?)");
const batch = items.map((item) => stmt.bind(item.id, item.title));
```

## Step 3: Execute

1. Run: `await db.batch(batch)`
2. Handle errors: log which record failed
3. Retry failed items individually (if critical)

## Step 4: Cache Invalidate

```typescript
// If using KV/Cache API
await cache.delete(`store:${storeId}:products:*`);
```

## Limits

- Max 100 statements per batch (Cloudflare limit)
- If > 100, chunk array: `chunk(items, 100)`
