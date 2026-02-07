# Release Process (Staging → Production) — 2026-02-07

এই ডকটি ভবিষ্যতে “ফিচার অ্যাড/এডিট” করার সময় আপনার default অপারেটিং প্রসেস হবে।

## Goal

Production-এ কোনো পরিবর্তন পাঠানোর আগে:
1) staging-এ একই পরিবর্তন deploy  
2) staging-এ DB migrations + smoke test pass  
3) তারপর production-এ apply + deploy

## Branching (Recommended)

1. নতুন কাজ শুরু: `codex/<short-topic>` branch
2. ছোট ছোট PR/commit (rollback সহজ)

## Standard Release Steps

### 1) Local verify

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run test:all
```

### 2) Staging DB migrate

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
```

### 3) Deploy to staging

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run deploy:staging
```

### 4) Staging smoke checklist (minimum)

- Admin login works
- Storefront homepage loads
- Product page loads
- Cart add/remove works
- Checkout (COD) can create an order
- Admin order status update works

### 5) Production DB backup/export (recommended)

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run db:export:prod
```

### 6) Production DB migrate

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 migrations apply multi-store-saas-db --remote
```

### 7) Deploy to production

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run deploy
```

## If Production Deploy Goes Wrong

1. Immediately stop further changes.
2. Roll back to previous Worker version (Cloudflare dashboard / wrangler versions).
3. If DB migration caused the issue:
   - Use D1 Time Travel restore only after staging drill.
   - Keep incident notes and add a migration fix (forward-only if possible).

## Notes

- staging কনফিগ: `apps/web/wrangler.toml` → `[env.staging]`
- staging workflow: `docs/STAGING_WORKFLOW.md`
- migration adoption runbook: `docs/DB_BASELINE_ADOPTION_RUNBOOK.md`

