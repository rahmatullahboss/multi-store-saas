# Staging Workflow (Safe Releases) — 2026-02-07

এই প্রজেক্টে production-এ যাওয়ার আগে **staging** ব্যবহার করা বাধ্যতামূলক। কারণ:
- D1 migrations ভুল হলে production DB ভেঙে যেতে পারে
- real orders/inventory হলে downtime/data inconsistency বড় ক্ষতি

## Staging কী?
- **Production:** real customers + real orders
- **Staging:** production-এর মতোই আরেকটা Worker + আরেকটা D1 DB (safe rehearsal)

Staging-এ সব পরিবর্তন (feature/migration) আগে চালিয়ে validate করে তারপর production।

## One‑Time Setup (Staging Environment তৈরি)

### 1) Staging Worker env enable

এই repo-তে staging env কনফিগ যোগ করা আছে:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web/wrangler.toml`
  - `[env.staging]`
  - `name = "multi-store-saas-staging"`
  - `database_id = "635f8125-8d10-4522-aad6-301a01027a37"` (বর্তমানে সেট করা আছে)
  - staging KV namespaces (production থেকে আলাদা):
    - `AI_RATE_LIMIT_STAGING`: `4697fe943f0a4e8b9535f739374c56cb`
    - `STORE_CACHE_STAGING`: `7aea490529e049bcb2ebf98964012f71`

### 2) Staging D1 database create

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 create multi-store-saas-db-staging
```

Wrangler output থেকে `database_id` নিয়ে `apps/web/wrangler.toml` এ update করবেন (যদি নতুন করে create করেন)।

### 3) Staging deploy

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler deploy --env staging
```

নোট:
- staging-এর জন্য আলাদা routes/custom domain এখনো সেট করা হয়নি (intentional)।
- চাইলে পরে staging domain/route যোগ করবেন, কিন্তু production routes যেন staging-এ না যায়।

## Daily Workflow (Feature/Migration release)

### Step A — Develop locally

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas
npm run turbo:dev
```

### Step B — Run tests

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run test:release
```

### Step C — Apply migrations to staging first

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
```

তারপর staging site smoke test।

### Step D — Deploy to staging

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler deploy --env staging
```

Status (2026-02-07):
- staging DB-তে সব migrations **from-scratch apply** সফল হয়েছে।

### Step E — Production release

1. Production DB backup/export (recommended)
2. Production migrations apply
3. Production deploy

Details: `docs/LAUNCH_PLAN_2026-02-07.md`

নোট (গুরুত্বপূর্ণ):
- production routes এখন `apps/web/wrangler.toml` এর `env.production` এর ভেতরে রাখা হয়েছে।
- কারণ: staging deploy করলে যেন ভুল করে production domain/route staging script-এ bind না হয়ে যায়।
- তাই production deploy সবসময় `--env production` দিয়ে করবেন।

## Production → Staging DB Clone (Realistic Testing)

Wrangler v4 CLI-তে আলাদা “fork/copy” কমান্ড নেই, তাই recommended approach:

1. prod export (schema only) — recommended
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run db:export:prod:schema
```

2. staging import (schema)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
wrangler d1 execute multi-store-saas-db-staging --remote --file ./tmp/prod-export.schema.sql
```

3. stamp migrations (baseline adoption)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run db:stamp-migrations:staging
```

Notes:
- Full schema+data import via a single SQL export can fail in D1 with `SQLITE_TOOBIG` (very large INSERT statements, long JSON blobs). If you need data realism, export/import per table using `wrangler d1 export --table <table> --no-schema` and run it in smaller chunks.

## Existing Production DB Migration Adoption (Baseline / Stamp)

যদি production DB আগে `execute --file` দিয়ে বানানো হয়ে থাকে, migration adopt করতে baseline stamp লাগতে পারে।

Runbook:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/DB_BASELINE_ADOPTION_RUNBOOK.md`
