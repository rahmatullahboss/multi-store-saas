# Database Migrations (Production Workflow)

This repo is a monorepo. To avoid “it works on one app but not another”, we use **one** D1 migrations directory for everything.

## Single Source Of Truth

All D1 migrations live in:

- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/packages/database/src/migrations`

Wrangler reads them via `migrations_dir`:

- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/wrangler.toml`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/workers/webhook-dispatcher/wrangler.toml`

## Why This Matters (Simple Explanation)

- `wrangler d1 execute --file ...` is “run this SQL now”.
  - Good for one-off debugging/bootstrapping.
  - Easy to drift across environments because it does **not** track what already ran.
- `wrangler d1 migrations apply ...` is “apply only the migrations that were not applied yet”.
  - Safer for production: it tracks applied migrations and avoids double-applying.

## Commands

### Local (recommended first)

From `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web`:

```bash
npm run db:migrate:local
```

### Production (remote)

From `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web`:

```bash
npm run db:migrate:prod
```

### Bootstrap (only for brand-new DBs)

If you want to create a brand-new DB from the early “initial schema + seed” scripts:

```bash
npm run db:bootstrap:local
```

## Notes / Safety

- Always run local migrations before remote.
- If a migration fails in production, do not “hack” it in the dashboard; fix the migration and re-apply.
- Legacy FK integrity: some older migrations reference `store_users(id)`. We added a `store_users` shim migration:
  - `0077_create_store_users_shim.sql`

