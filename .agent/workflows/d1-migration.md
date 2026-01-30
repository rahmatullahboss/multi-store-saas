---
description: Create and apply D1 database migrations safely
---

# D1 Database Migration Workflow

This workflow guides you through creating, testing, and deploying D1 database migrations for the Multi Store SaaS platform.

## Prerequisites

- Read `.agent/skills/database-design/SKILL.md`
- Read `.agent/skills/wrangler/SKILL.md`
- Understand the current schema in `db/migrations/`

---

## Step 1: Identify the Schema Change

Before creating a migration:

1. **What tables are affected?**
2. **Is this additive (new table/column) or destructive (drop/rename)?**
3. **Are there existing rows that need migration?**
4. **What indexes are needed?**

---

## Step 2: Create Migration File

### 2.1 Generate Migration File

// turbo

```bash
npx wrangler d1 migrations create DB "description_of_change"
```

This creates: `db/migrations/XXXX_description_of_change.sql`

### 2.2 Write Migration SQL

```sql
-- db/migrations/XXXX_description_of_change.sql

-- Add new table
CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Add index (always index store_id for multi-tenant!)
CREATE INDEX IF NOT EXISTS idx_new_table_store ON new_table(store_id);

-- Add column to existing table
ALTER TABLE existing_table ADD COLUMN new_column TEXT;
```

---

## Step 3: SQLite Migration Patterns

### Adding Columns (Safe)

```sql
-- ✅ Safe: Add column with default
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';

-- ✅ Safe: Add nullable column
ALTER TABLE products ADD COLUMN description TEXT;
```

### Renaming Columns (Requires Recreate)

SQLite doesn't support `ALTER TABLE RENAME COLUMN` in older versions. Use table recreation:

```sql
-- Step 1: Create new table
CREATE TABLE products_new (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,  -- renamed from 'name'
  price INTEGER NOT NULL,
  store_id TEXT NOT NULL
);

-- Step 2: Copy data
INSERT INTO products_new (id, product_name, price, store_id)
SELECT id, name, price, store_id FROM products;

-- Step 3: Drop old table
DROP TABLE products;

-- Step 4: Rename new table
ALTER TABLE products_new RENAME TO products;

-- Step 5: Recreate indexes
CREATE INDEX idx_products_store ON products(store_id);
```

### Adding Foreign Keys (Requires Recreate)

SQLite doesn't support `ALTER TABLE ADD CONSTRAINT`. Use table recreation as above.

---

## Step 4: Test Locally

### 4.1 Apply Migration Locally

// turbo

```bash
npx wrangler d1 migrations apply DB --local
```

### 4.2 Verify Schema

```bash
npx wrangler d1 execute DB --local --command "SELECT sql FROM sqlite_master WHERE type='table' AND name='new_table'"
```

### 4.3 Test with App

// turbo

```bash
npm run dev
```

Test the feature that uses the new schema.

### 4.4 Run Tests

// turbo

```bash
npm run test
```

---

## Step 5: Update Drizzle Schema (if using Drizzle ORM)

```typescript
// db/schema/newTable.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// db/schema/index.ts
export * from './newTable';
```

---

## Step 6: Regenerate Types

// turbo

```bash
npx wrangler types
```

Or if using Drizzle:

```bash
npx drizzle-kit generate
```

---

## Step 7: Deploy to Production

### 7.1 Double-Check Migration

⚠️ **Review the migration SQL one more time before applying to production!**

### 7.2 Check Current State

```bash
npx wrangler d1 migrations list DB --remote
```

### 7.3 Apply Migration

```bash
npx wrangler d1 migrations apply DB --remote
```

### 7.4 Verify

```bash
npx wrangler d1 execute DB --remote --command "SELECT sql FROM sqlite_master WHERE type='table' AND name='new_table'"
```

---

## Step 8: Data Migration (if needed)

If the migration requires data transformation:

```sql
-- Example: Populate new column from existing data
UPDATE products
SET status = CASE
  WHEN stock > 0 THEN 'active'
  ELSE 'out_of_stock'
END
WHERE status IS NULL;
```

Run via:

```bash
npx wrangler d1 execute DB --remote --command "UPDATE products SET..."
```

---

## Step 9: Commit Changes

// turbo

```bash
git add db/migrations/ db/schema/
git commit -m "feat(db): add new_table for feature X"
```

---

## Step 10: Rollback (if needed)

### Using D1 Time Travel

```bash
# Check available restore points
npx wrangler d1 time-travel info DB

# Restore to before migration
npx wrangler d1 time-travel restore DB --timestamp "2025-01-22T10:00:00Z"
```

### Manual Rollback

Create a reverse migration:

```sql
-- db/migrations/XXXX_rollback_new_table.sql
DROP TABLE IF EXISTS new_table;
ALTER TABLE products DROP COLUMN new_column;
```

---

## Migration Checklist

### Before Migration

- [ ] Schema change documented
- [ ] Migration file created
- [ ] SQL syntax verified
- [ ] Indexes added for store_id

### Local Testing

- [ ] Migration applied locally
- [ ] Schema verified
- [ ] App tested with new schema
- [ ] Tests passing

### Production

- [ ] Migration reviewed
- [ ] Applied to production
- [ ] Schema verified
- [ ] Data migrated (if needed)
- [ ] Changes committed

---

## Common Issues

| Issue                  | Solution                                |
| ---------------------- | --------------------------------------- |
| "table already exists" | Use `IF NOT EXISTS`                     |
| "cannot add column"    | Check column syntax, SQLite limitations |
| Foreign key fails      | Ensure referenced table/column exists   |
| Index fails            | Check column name spelling              |
| Migration stuck        | Check D1 dashboard for status           |

---

## Best Practices

1. **Always use `IF NOT EXISTS`** for CREATE statements
2. **Always add indexes** for `store_id` columns
3. **Test locally first** before production
4. **Keep migrations small** - one logical change per file
5. **Never modify applied migrations** - create new ones
6. **Document breaking changes** in commit message
