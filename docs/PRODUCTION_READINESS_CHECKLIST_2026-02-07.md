# Production Readiness Checklist — 2026-02-07

এই ডকটার কাজ: production-এ **real-money e-commerce** চালু করার আগে কোন কোন জিনিস **exactly** বাকি আছে, কীভাবে করতে হবে, আর কীভাবে verify করতে হবে — এক জায়গায় রাখা।

Related docs:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/LAUNCH_PLAN_2026-02-07.md`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/STAGING_WORKFLOW.md`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/RELEASE_PROCESS.md`
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/DB_BASELINE_ADOPTION_RUNBOOK.md`

## 1) Staging Strategy (P0)

### 1.1 Goal
Production-এ যাওয়ার আগে একই change staging-এ চালিয়ে ঝুঁকি কমানো:
- DB migrations production DB ভাঙা থেকে বাঁচে
- checkout/order/inventory bug real order-এ যাওয়ার আগে ধরা পড়ে
- rollback story clear হয়

### 1.2 How It Works (Simple Bangla)
- আপনি `--env staging` দিয়ে deploy করলে Wrangler `wrangler.toml` এর `[env.staging]` ব্লক ব্যবহার করে।
- staging-এর জন্য আলাদা Worker name + আলাদা D1 + আলাদা KV দিলে staging-এ করা কিছুই production-এ প্রভাব ফেলে না।
- staging-এ সব green হলে একই commit production-এ deploy করবেন।

### 1.3 What’s Done
- [x] Staging worker env configured (`apps/web/wrangler.toml`)
- [x] Staging D1 created + bound (`multi-store-saas-db-staging`, id `510df28c-155e-45f2-8b1a-4e43d4e0f261`)
- [x] Staging KV created + bound (separate from prod)
- [x] Staging DB migrations “fresh apply” verified (2026-02-07)

### 1.4 What’s Pending
- [ ] staging custom domain/route (optional but recommended): `staging.app.ozzyl.com` বা `staging-<store>.ozzyl.com`
- [ ] staging secrets set (if staging needs email/AI keys for tests)
- [ ] “smoke test script” (one command that hits critical endpoints)

### 1.5 Verify (commands)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
npx wrangler deploy --env staging
```

## 2) Database Safety (P0)

### 2.1 Goal
Production DB-তে migration apply করা safe হতে হবে, এবং ভুল হলে recover করা যাবে।

### 2.2 What’s Done
- [x] Single migrations dir adopted: `packages/database/src/migrations`
- [x] “baseline/stamp” runbook written for existing prod DB adoption

### 2.3 What’s Pending
- [ ] Production DB baseline adoption rehearsal (prod export → staging import → apply → verify)
- [ ] Production restore drill (D1 backup/time-travel) — staging-এ prove করা
- [ ] Post-migration data integrity checks (orders totals, inventory non-negative, foreign keys)

### 2.4 Verify (commands)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run db:export:prod
npm run db:clone:prod-to-staging
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
```

## 3) Checkout/Order Correctness (COD-first) (P0)

### 3.1 Goal
COD হলেও order correctness ভুল হলে real operations ভেঙে যাবে।

### 3.2 What’s Pending (minimum)
- [ ] Order idempotency end-to-end enforced (same request retry → same order)
- [ ] Inventory decrement/reservation rules audited (no negative stock)
- [ ] Price snapshot correctness (product price later change হলেও order amount stable)
- [ ] Admin order state transitions rules + audit log

### 3.3 Verify
- [ ] E2E: submit checkout twice (network retry simulation) → 1 order only
- [ ] E2E: stock=0 product → checkout blocked

## 4) Multi-Tenant Security (P0)

### 4.1 Goal
এক store-এর ডাটা অন্য store-এ leak করা যাবে না।

### 4.2 What’s Pending (minimum)
- [ ] “store_id scope” audit for all DB access paths (admin + public + API)
- [ ] Admin mutation protection coverage review (Origin/Referer guard)
- [ ] Rate limiting: login/otp/checkout/order create
- [ ] Upload hardening (R2) + SSRF-safe image proxy (if used)
- [ ] Secrets: all API keys are CF secrets (not in repo)

### 4.3 Verify
- [ ] Cross-store ID guessing: returns 404/403
- [ ] unauth POST endpoints blocked

## 5) Observability + Ops (P0)

### 5.1 What’s Pending (minimum)
- [ ] Sentry (or equivalent) alerting verified on staging
- [ ] Structured logs include `store_id`, `request_id`, `order_id`
- [ ] Incident runbook: rollback worker + DB restore decision tree
- [ ] Uptime monitoring for `app.ozzyl.com` + `*.ozzyl.com`

## 6) Performance Baseline (P1)

### 6.1 What’s Pending
- [ ] Fonts: avoid render-blocking (self-host or optimize Google Fonts)
- [ ] LCP hero: `fetchpriority="high"`, correct sizes, no lazy
- [ ] Product images: responsive sizes (avoid 1024px download for 320px render)
- [ ] CSS: reduce root bundle or split critical CSS (only if needed)

## 7) Engineering Gates (P1 but recommended)

এখানে লক্ষ্য “future changes safe” করা:
- [ ] Lint baseline: `npm --workspace apps/web run lint` green (অথবা CI-তে lint scope ঠিক করা)
- [ ] CI pipeline: staging deploy on main branch, production deploy gated
- [ ] E2E smoke suite in CI (minimal critical flows)

## 8) Payments (Defer) (P2)

আপনার সিদ্ধান্ত অনুযায়ী:
- [ ] COD stable → bKash
- [ ] SSLCommerz/Stripe last

