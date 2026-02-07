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
  - `database_id = "REPLACE_ME_WITH_STAGING_DATABASE_ID"` (আপনাকে replace করতে হবে)

### 2) Staging D1 database create

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 create multi-store-saas-db-staging
```

Wrangler output থেকে `database_id` নিয়ে `apps/web/wrangler.toml` এ:
- `REPLACE_ME_WITH_STAGING_DATABASE_ID` → আসল staging DB id

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
npm run test:all
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

### Step E — Production release

1. Production DB backup/export (recommended)
2. Production migrations apply
3. Production deploy

Details: `docs/LAUNCH_PLAN_2026-02-07.md`

## Production → Staging DB Clone (Realistic Testing)

Wrangler v4 CLI-তে আলাদা “fork/copy” কমান্ড নেই, তাই recommended approach:

1. prod export (schema+data)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 export multi-store-saas-db --remote --output ./tmp/prod-export.sql
```

2. staging import
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --file ./tmp/prod-export.sql
```

## Existing Production DB Migration Adoption (Baseline / Stamp)

যদি production DB আগে `execute --file` দিয়ে বানানো হয়ে থাকে, migration adopt করতে baseline stamp লাগতে পারে।

Runbook:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/DB_BASELINE_ADOPTION_RUNBOOK.md`

