# DB Baseline Adoption Runbook (D1 Migrations) — 2026-02-07

> Goal: যদি কোনো production DB আগে `wrangler d1 execute --file ...` দিয়ে তৈরি/ম্যানেজ করা হয়ে থাকে, তাহলে সেটাকে **safe way** তে `wrangler d1 migrations apply`-এ আনা (adopt)।
>
> Core risk: `migrations apply` চালালে Wrangler `d1_migrations` টেবিল দেখে বোঝে কোন migration আগে applied হয়েছে। টেবিল/রো না থাকলে Wrangler **সব migration pending** ধরে নিয়ে আবার রান করাতে পারে (ঝুঁকিপূর্ণ)।

## Key Facts (Verified)

- Wrangler applied migrations ট্র্যাক করতে `d1_migrations` টেবিল ব্যবহার করে।
- `wrangler d1 migrations apply` চালালে Cloudflare docs অনুযায়ী **automatic backup** নেয়।

## Do This First: Safe Staging Clone

Wrangler v4 CLI-তে “fork/copy” কমান্ড আলাদা নেই; তাই **export → import** দিয়ে staging clone বানানোটা সবচেয়ে practical।

### Step A — Create a staging D1 DB

```bash
cd apps/web
npx wrangler d1 create multi-store-saas-db-staging
```

Wrangler output থেকে `database_id` নিয়ে `apps/web/wrangler.toml`-এ staging binding যোগ করুন (বা আলাদা env ব্যবহার করুন)।

### Step B — Export production DB (schema + data)

```bash
cd apps/web
npx wrangler d1 export multi-store-saas-db --remote --output ./tmp/prod-export.sql
```

Notes:
- শুধু schema দরকার হলে `--no-data`
- শুধু data দরকার হলে `--no-schema`

Practical note (observed):
- Full schema+data import into D1 via one big SQL file can fail with `SQLITE_TOOBIG` because some INSERT statements become extremely large (e.g. big JSON/text blobs). For adoption rehearsal, **schema-only clone** is usually sufficient.

### Step C — Import into staging DB

```bash
cd apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --file ./tmp/prod-export.sql
```

এখন staging DB = prod-এর “snapshot”।

## Recommended (Safer) Variant — Schema-only clone + stamp

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run db:export:prod:schema
wrangler d1 execute multi-store-saas-db-staging --remote --file ./tmp/prod-export.schema.sql
npm run db:stamp-migrations:staging
```

## Migration Adoption Strategy (Staging First)

### Step 1 — See what Wrangler thinks is pending

```bash
cd apps/web
npx wrangler d1 migrations list multi-store-saas-db-staging --remote
```

Expected:
- যদি staging DB আগে কখনো `migrations apply` দিয়ে না চালানো হয়, অনেক migration pending দেখাতে পারে।

### Step 2 — Decide baseline point (stamp)

Baseline point মানে: “আমরা ধরে নিচ্ছি এই পর্যন্ত schema already exists, তাই এগুলো আবার রান করা যাবে না।”

Options:
1. **Best (ideal):** staging-এ একটি clean DB + only migrations apply দিয়ে schema rebuild (সময় বেশি লাগতে পারে)
2. **Pragmatic (most common):** `d1_migrations` টেবিলে পুরনো migration গুলোর নাম insert করে stamp করা, তারপর শুধু নতুন migration apply করা।

### Step 3 — Stamp (only if you are sure schema already matches)

> সতর্কতা: এটা ভুল করলে future migration wrong assumptions নিয়ে চলবে। তাই staging-এ rehearsal বাধ্যতামূলক।

Stamp করার generic pattern:
1. নিশ্চিত করুন staging DB-তে `d1_migrations` টেবিল আছে:

```bash
cd apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --command \
  "SELECT name FROM sqlite_master WHERE type='table' AND name='d1_migrations';"
```

2. যেসব migration “already represented in schema”, সেগুলোর filename insert করুন:

```bash
cd apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --command \
  "INSERT OR IGNORE INTO d1_migrations(name) VALUES ('0000_clever_spencer_smythe.sql');"
```

এটা script করে batch-এ করা যাবে (পরের ধাপে আমরা automation/script যোগ করবো, কিন্তু আগে আপনার approve দরকার)।

### Step 4 — Apply “new” migrations only

```bash
cd apps/web
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote
```

### Step 5 — Validate staging

- storefront loads
- admin loads
- create order (COD) works
- key tables/columns exist
- no migration errors

## Rollback / Recovery

### If a migration goes wrong

1. stop immediately
2. use D1 Time Travel restore (same DB) — Wrangler supports:

```bash
cd apps/web
npx wrangler d1 time-travel restore multi-store-saas-db-staging --help
```

> prod restore করার আগে staging-এ drill করা বাধ্যতামূলক।

## What We’ll Do Next (after your approval)

- Add a small Node script: “stamp migrations up to N” (reads migration folder, generates a SQL file with `INSERT OR IGNORE INTO d1_migrations(...)`)
- Add an explicit “staging DB” env workflow in docs
- Run the full rehearsal, then only then apply on production

### Stamp Script (Now Available)

Script:
- `scripts/generate-d1-stamp-sql.mjs`

Example:
```bash
node scripts/generate-d1-stamp-sql.mjs \
  --migrations-dir packages/database/src/migrations \
  --up-to 0077_create_store_users_shim.sql \
  --out tmp/stamp-up-to-0077.sql

cd apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --file ../tmp/stamp-up-to-0077.sql
```
