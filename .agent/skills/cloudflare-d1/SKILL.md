---
name: Cloudflare D1
description: Expert skill for Cloudflare D1 - SQLite database, Sessions API, migrations, Drizzle ORM, and query optimization.
---

# Cloudflare D1 Skill

This skill covers Cloudflare D1 for building production-ready database applications with SQLite at the edge, including the Sessions API for read replication, Drizzle ORM integration, and migration patterns.

## 1) Core Concepts

### D1 Binding

```typescript
// wrangler.toml
[[d1_databases]];
binding = 'DB';
database_name = 'multi-store-saas-db';
database_id = 'your-database-id';
migrations_dir = 'db/migrations';

// TypeScript
interface Env {
  DB: D1Database;
}
```

### D1 Characteristics

| Feature            | Details                 |
| ------------------ | ----------------------- |
| **Engine**         | SQLite (edge-optimized) |
| **Read Replicas**  | Global read replication |
| **Max DB Size**    | 10GB per database       |
| **Max Query Size** | 100KB                   |
| **Transactions**   | Limited (use batch)     |

---

## 2) Basic Operations

### Prepared Statements (Recommended)

```typescript
// Always use prepared statements (SQL injection safe)
export async function getProduct(env: Env, productId: string, storeId: string) {
  const result = await env.DB.prepare(
    `
    SELECT * FROM products 
    WHERE id = ? AND store_id = ?
  `
  )
    .bind(productId, storeId)
    .first();

  return result;
}

// Multiple bindings
export async function searchProducts(env: Env, storeId: string, category: string, limit: number) {
  const { results } = await env.DB.prepare(
    `
    SELECT * FROM products 
    WHERE store_id = ? AND category = ?
    ORDER BY created_at DESC
    LIMIT ?
  `
  )
    .bind(storeId, category, limit)
    .all();

  return results;
}
```

### Query Methods

| Method     | Returns                      | Use Case             |
| ---------- | ---------------------------- | -------------------- |
| `.first()` | Single row or null           | Get one record       |
| `.all()`   | `{ results, success, meta }` | Get multiple records |
| `.run()`   | `{ success, meta }`          | INSERT/UPDATE/DELETE |
| `.raw()`   | Array of arrays              | Raw column values    |

---

## 3) Sessions API (Read Replication)

### Why Sessions API?

D1 uses read replicas globally. The Sessions API ensures **read-after-write consistency**:

```
Write → Primary DB (one location)
Read  → Read Replica (closest to user)
```

Without Sessions, you might read stale data after a write.

### Using Sessions

```typescript
export async function updateAndRead(
  env: Env,
  request: Request,
  productId: string,
  newPrice: number
) {
  // Get bookmark from previous request (or 'first-primary' for writes)
  const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-primary';

  // Create session
  const session = env.DB.withSession(bookmark);

  // Write operation
  await session
    .prepare(
      `
    UPDATE products SET price = ? WHERE id = ?
  `
    )
    .bind(newPrice, productId)
    .run();

  // Read immediately after write (consistent!)
  const product = await session
    .prepare(
      `
    SELECT * FROM products WHERE id = ?
  `
    )
    .bind(productId)
    .first();

  // Return new bookmark for next request
  const response = new Response(JSON.stringify(product));
  response.headers.set('x-d1-bookmark', session.getBookmark() ?? '');

  return response;
}
```

### Session Best Practices

| Scenario          | Bookmark Value                          |
| ----------------- | --------------------------------------- |
| Write operations  | `'first-primary'`                       |
| Read after write  | Previous response bookmark              |
| Read-only queries | No session needed (default replication) |

---

## 4) Batch Operations

### Batch Writes

```typescript
export async function batchInsertProducts(
  env: Env,
  products: Array<{ name: string; price: number; storeId: string }>
) {
  const statements = products.map((product) =>
    env.DB.prepare(
      `
      INSERT INTO products (name, price, store_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `
    ).bind(product.name, product.price, product.storeId)
  );

  // Execute all in one round-trip
  const results = await env.DB.batch(statements);

  return results;
}
```

### Atomic Operations (Pseudo-Transaction)

```typescript
export async function transferStock(
  env: Env,
  fromProductId: string,
  toProductId: string,
  quantity: number
) {
  // D1 batch is atomic - all succeed or all fail
  const results = await env.DB.batch([
    env.DB.prepare(
      `
      UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
    `
    ).bind(quantity, fromProductId, quantity),

    env.DB.prepare(
      `
      UPDATE products SET stock = stock + ? WHERE id = ?
    `
    ).bind(quantity, toProductId),
  ]);

  // Check if first update affected any rows
  if (results[0].meta.changes === 0) {
    throw new Error('Insufficient stock');
  }

  return results;
}
```

---

## 5) Drizzle ORM Integration

### Setup

```typescript
// db/schema/products.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // cents/paisa
  storeId: text('store_id').notNull(),
  category: text('category'),
  stock: integer('stock').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDB(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

### Drizzle Queries

```typescript
import { eq, and, desc, sql } from 'drizzle-orm';
import { products } from '~/db/schema';
import { getDB } from '~/db';

export async function getStoreProducts(env: Env, storeId: string) {
  const db = getDB(env.DB);

  const result = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt))
    .limit(50);

  return result;
}

export async function createProduct(
  env: Env,
  data: { name: string; price: number; storeId: string; category: string }
) {
  const db = getDB(env.DB);

  const [product] = await db
    .insert(products)
    .values({
      id: crypto.randomUUID(),
      ...data,
    })
    .returning();

  return product;
}

export async function updateProduct(
  env: Env,
  productId: string,
  storeId: string,
  data: Partial<{ name: string; price: number; category: string }>
) {
  const db = getDB(env.DB);

  const [updated] = await db
    .update(products)
    .set(data)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
    .returning();

  return updated;
}
```

---

## 6) Migrations

### Migration File Structure

```sql
-- db/migrations/0001_create_products.sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  store_id TEXT NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(store_id, category);
```

### Migration Commands

```bash
# Apply migrations locally
npx wrangler d1 migrations apply DB --local

# Apply migrations to production
npx wrangler d1 migrations apply DB --remote

# Create new migration
npx wrangler d1 migrations create DB "add_inventory_table"

# List migrations
npx wrangler d1 migrations list DB --local
```

### Safe Migration Patterns

```sql
-- ✅ Good: Add column with default
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';

-- ✅ Good: Create index concurrently (SQLite does this automatically)
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ⚠️ Caution: Rename requires new table in SQLite
-- Step 1: Create new table
CREATE TABLE products_new (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,  -- renamed from 'name'
  price INTEGER NOT NULL
);

-- Step 2: Copy data
INSERT INTO products_new SELECT id, name, price FROM products;

-- Step 3: Drop old, rename new
DROP TABLE products;
ALTER TABLE products_new RENAME TO products;
```

---

## 7) Query Optimization

### Index Strategy

```sql
-- Always index store_id (multi-tenant)
CREATE INDEX idx_products_store ON products(store_id);

-- Composite indexes for common queries
CREATE INDEX idx_products_store_category ON products(store_id, category);
CREATE INDEX idx_products_store_status ON products(store_id, status);

-- Covering index for high-frequency queries
CREATE INDEX idx_products_list ON products(store_id, created_at DESC, name, price);
```

### Query Analysis

```typescript
// Get query plan
const plan = await env.DB.prepare(
  `
  EXPLAIN QUERY PLAN
  SELECT * FROM products WHERE store_id = ? AND category = ?
`
)
  .bind(storeId, category)
  .all();

console.log(plan.results);
// Should show: SEARCH products USING INDEX idx_products_store_category
```

### Common Optimizations

| Issue             | Solution                      |
| ----------------- | ----------------------------- |
| Full table scan   | Add appropriate index         |
| N+1 queries       | Use JOIN or batch fetch       |
| Large result sets | Add LIMIT, use pagination     |
| Slow aggregations | Pre-compute in separate table |

---

## 8) Multi-Tenant Safety

### Always Scope by store_id

```typescript
// ✅ CORRECT: Always filter by store_id
export async function getOrders(env: Env, storeId: string) {
  const { results } = await env.DB.prepare(
    `
    SELECT * FROM orders WHERE store_id = ?
  `
  )
    .bind(storeId)
    .all();
  return results;
}

// ❌ WRONG: No store_id filter (data leak!)
export async function getOrdersUnsafe(env: Env, orderId: string) {
  const result = await env.DB.prepare(
    `
    SELECT * FROM orders WHERE id = ?
  `
  )
    .bind(orderId)
    .first();
  return result; // Could return another store's order!
}
```

### Middleware for Store Scoping

```typescript
// Hono middleware to inject storeId
app.use('/api/*', async (c, next) => {
  const storeId = c.req.header('x-store-id');
  if (!storeId) {
    return c.json({ error: 'Store ID required' }, 400);
  }
  c.set('storeId', storeId);
  await next();
});

// Use in route
app.get('/api/products', async (c) => {
  const storeId = c.get('storeId'); // Guaranteed present
  // All queries scoped by storeId
});
```

---

## 9) Time Travel & Backups

### Point-in-Time Recovery

```bash
# List available restore points
npx wrangler d1 time-travel info DB

# Restore to specific timestamp
npx wrangler d1 time-travel restore DB --timestamp "2025-01-20T10:00:00Z"

# Create bookmark for manual recovery point
npx wrangler d1 time-travel info DB --json | jq '.bookmark'
```

### Export/Import

```bash
# Export database
npx wrangler d1 export DB --output backup.sql --remote

# Import into local
npx wrangler d1 execute DB --local --file backup.sql
```

---

## Quick Reference

| Operation     | Code                                                 |
| ------------- | ---------------------------------------------------- |
| Select one    | `env.DB.prepare('SELECT...').bind(...).first()`      |
| Select many   | `env.DB.prepare('SELECT...').bind(...).all()`        |
| Insert/Update | `env.DB.prepare('INSERT/UPDATE...').bind(...).run()` |
| Batch         | `env.DB.batch([stmt1, stmt2, ...])`                  |
| With session  | `env.DB.withSession(bookmark).prepare(...)`          |
| Get bookmark  | `session.getBookmark()`                              |
