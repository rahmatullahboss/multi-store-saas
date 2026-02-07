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
- [x] “smoke test script” exists:
  - `apps/web/workers/health-check.sh` (post-deploy health check)
  - `apps/web/e2e/smoke.test.ts` (Playwright critical path)
- [ ] “one command” wrapper documentation (staging + prod) so release is muscle-memory

### 1.5 Verify (commands)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
npx wrangler deploy --env staging
```

### 1.6 Smoke (commands)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web

# Staging worker health (expects /api/health to return 200)
npm run health:staging

# Optional: local critical-path E2E (dev server)
# E2E_TOKEN is required if /api/e2e/seed is protected (recommended)
E2E_TOKEN=local-e2e-token npm run e2e:smoke
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

### 2.5 Rehearsal Notes (must write down)
- [ ] export/import runtime (minutes) for your prod DB size
- [ ] number of migrations applied and any failures
- [ ] rollback decision: “forward fix” vs “time-travel restore” when migration breaks prod
- [ ] a single “DB integrity check query pack” that you can re-run after every migration

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

### 5.2 Verify (minimum)
```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web

# Staging: deploy + verify /api/health
npm run deploy:staging
npm run health:staging

# Prod (non-destructive): just verify /api/health
npm run health:prod
```

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

## 9) Release Execution (Staging → Prod) (P0)

Reference:
- `docs/RELEASE_PROCESS.md`
- `docs/LAUNCH_PLAN_2026-02-07.md`

### 9.1 One Release (minimum steps)
- [ ] Local checks green (`apps/web`): typecheck + unit tests
  - Note: lint baseline is currently not green; keep it as P1 gate until cleaned up.
- [ ] Staging DB migrate
- [ ] Deploy staging
- [ ] Run staging smoke (`npm run health:staging`)
- [ ] (If migrations exist) Production DB export backup
- [ ] Production DB migrate
- [ ] Deploy production
- [ ] Run production smoke (`npm run health:prod`)

### 9.2 Commands (copy/paste)
```bash
# 1) Local gates
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npm run test:release

# 2) Staging migrate + deploy + smoke
npx wrangler d1 migrations apply multi-store-saas-db-staging --remote --env staging
npm run deploy:staging
npm run health:staging

# 3) Prod backup + migrate + deploy + smoke
npm run db:export:prod
npx wrangler d1 migrations apply multi-store-saas-db --remote
npm run deploy:prod
npm run health:prod
```

## 10) Go‑Live Day‑0 Checklist (P0)

### 10.1 Before flipping “real orders”
- [ ] Staging is green (deploy + health + critical E2E if possible)
- [ ] Production DB export taken (timestamped file exists in `apps/web/tmp/`)
- [ ] Confirm production routes bound to `env.production` only (no staging route leakage)
- [ ] Confirm secrets present in production env (email/AI optional; auth required)
- [ ] Confirm a rollback target exists (last known good Worker version)

### 10.2 First real order (scripted manual run)
- [ ] Create 1 COD order from a real storefront domain (not `workers.dev`)
- [ ] Verify in admin:
  - [ ] order shows correct totals
  - [ ] customer details persisted correctly
  - [ ] inventory changed as expected (no negative)
- [ ] Update order state once (e.g., confirmed) and verify audit trail/log visibility

### 10.3 First 60 minutes monitoring
- [ ] Watch 5xx rate + checkout failures
- [ ] Watch D1 errors (timeouts / locked / migrations)
- [ ] Watch latency spikes (p95/p99)
- [ ] If anything looks off: stop taking orders and rollback deploy first
