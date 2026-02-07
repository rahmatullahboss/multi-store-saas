# Launch Readiness - 2026-02-04 (MVP → Production Gate)

> Updated: **February 7, 2026**  
> Scope: storefront reliability + transaction safety + “go-live” gates for real orders/payments.

For the detailed “what’s left + how to do it” plan, see:
- `docs/LAUNCH_PLAN_2026-02-07.md`

This doc is intentionally **truthful + verifiable**: every “Done” item includes at least one concrete file reference.

## ✅ Done (Implemented + Shipping)

### 1) Floating WhatsApp/Call buttons (settings-driven, all pages)
Behavior:
- WhatsApp/Call floating buttons show only when merchant configured number. Merchant can disable via theme config flags.
- Official WhatsApp brand glyph (SVG) used (no generic chat icon).
- Implemented at layout layer so it applies to **all templates** that render via `StorePageWrapper`.

Files:
- `apps/web/app/components/icons/WhatsAppIcon.tsx`
- `apps/web/app/components/FloatingContactButtons.tsx`
- `apps/web/app/components/store-layouts/StorePageWrapper.tsx`
- `apps/web/app/components/page-builder/FloatingActionButtons.tsx`
- `apps/web/app/components/templates/FloatingButtons.tsx`
- `apps/web/app/components/templates/_core/FloatingButtons.tsx`
- `apps/web/app/services/store-config.server.ts` (normalizes old configs where flags defaulted to `false`)

### 2) Product details tabs (real data only; no fake/demo tabs)
Behavior:
- Product page tabs render only when real data exists:
  - `Description`
  - `Specifications`
  - `Shipping & Returns`
  - `Reviews`
- Product-level “details” are saved as `metafields` (namespace: `product_details`).
- Shipping & Returns fallback:
  - Use product-level shipping/return if set
  - Else use store-level policy (`customShippingPolicy` / `customRefundPolicy`)
  - Else show simplified `shippingConfig` summary (if enabled)

Files:
- `apps/web/app/lib/product-details.server.ts`
- `apps/web/app/routes/app.products.new.tsx`
- `apps/web/app/routes/app.products.$id.tsx`
- `apps/web/app/routes/products.$id.tsx`
- `apps/web/app/components/store-templates/shared/ProductPage.tsx`
- `apps/web/app/components/store-templates/tech-modern/pages/ProductPage.tsx` (removed mock specs; uses metafields + store policy)

### 3) Storefront “blank homepage” prevention (wow-box class issue)
Root causes we saw in real stores:
- Theme config missing a catalog section (no product grid/scroll saved)
- Template code missing/empty section registry (Tech Modern bug)

Fixes:
- Runtime safety net: if store has products but homepage sections contain no catalog, inject a minimal `product-grid` section (render-time only; does not persist to DB).
- Templates that rely on `config.sections` now treat `sections: []` as “unset” and fall back to defaults (prevents blank home when store has products).
- Config normalization: stored `sections: []` is treated as unset at read-time.

Files:
- `apps/web/app/routes/_index.tsx` (runtime safety net)
- `apps/web/app/components/store-templates/tech-modern/index.tsx` (fallback when `sections` empty)
- `apps/web/app/components/store-templates/nova-lux/index.tsx` (fallback when `sections` empty)
- `apps/web/app/components/store-templates/luxe-boutique/index.tsx` (fallback when `sections` empty)
- `apps/web/app/services/store-config.server.ts` (read-time normalization)

### 4) Checkout safety hardening (duplicate / retry guard)
Goal: real inventory + real orders ⇒ safe retries.

Files:
- `apps/web/app/routes/api.create-order.ts`

### 4.1) Store mode gating uses `storeEnabled` (fix)
Behavior:
- Public storefront route gating now uses `stores.store_enabled` (`storeEnabled`) as the source of truth.
- Prevents “landing mode by accident” when legacy `storeMode` field is absent.

Files:
- `apps/web/app/lib/store.server.ts`

### 5) Image proxy safety (SSRF/open-proxy risk reduced)
Constraint: No paid Cloudflare Images/Image Resizing. Merchant does client-side compress→WebP upload to R2.

Files:
- `apps/web/app/routes/api.proxy-image.ts`

### 6) Tests (must-not-break baseline)
Status:
- `npm --workspace apps/web run test` is currently green in this workspace state.
- Playwright E2E: **Critical-path smoke is now deterministic** via an E2E seed endpoint + Playwright `globalSetup`.
  - Seed endpoint is hard-gated by `E2E_ENABLED=1` + `E2E_TOKEN` header, otherwise returns 404 (safe even if deployed).
  - `globalSetup` patches the local D1 schema for dev/E2E by ensuring missing columns/tables exist (prevents local-only drift from breaking tests).

Files (examples of recently-touched tests):
- `apps/web/app/tests/unit/IntentWizard.test.tsx`
- `apps/web/app/tests/unit/CheckoutModal.test.tsx`
- `apps/web/tests/api/metafields.api.test.ts`
- `apps/web/tests/api/template-versions.api.test.ts`
- `apps/web/e2e/smoke.test.ts`
- `apps/web/e2e/global-setup.ts`
- `apps/web/app/routes/api.e2e.seed.ts`
- `apps/web/playwright.config.ts`

### 7) Admin CSRF hard gate (origin/referer guard)
Behavior:
- For `/app/*` non-idempotent requests (POST/PUT/PATCH/DELETE), enforce same-origin via `Origin`/`Referer` checks.
- Fail-closed in production when origin headers are missing/mismatched.

Files:
- `apps/web/server/middleware/csrf.ts`
- `apps/web/server/index.ts`

### 8) Order status transition safety (state machine)
Behavior:
- Order status updates from admin are validated against an allowed transition graph.
- Prevents impossible/inconsistent states that would break inventory and shipment flows.

Files:
- `apps/web/app/lib/orderStatus.ts`
- `apps/web/app/routes/app.orders.$id.tsx`

### 9) AI billing model migration: remove `aiPlan`, use `aiCredits`
Behavior:
- All AI usage gates for merchants now use **credits** (`stores.ai_credits`) instead of subscription add-on `aiPlan`.
- AI endpoints check credits up-front (`requireCredits`) and deduct after success (`chargeCredits`).
- Super admin bypass remains.
- A DB migration stub is added for removing legacy `stores.ai_plan`.
  - It is intentionally a **safe no-op** in code, because `DROP COLUMN` and table rebuilds are not consistently safe across all D1/SQLite states.
  - If your production DB still has `ai_plan`, remove it during a controlled maintenance window after verifying schema integrity.

Files:
- `apps/web/app/routes/api.ai.action.ts`
- `apps/web/app/services/ai-chat.server.ts`
- `apps/web/app/routes/app.billing.tsx`
- `apps/web/app/routes/app.dashboard.tsx`
- `apps/web/app/lib/rateLimit.server.ts` (KV usage kept as telemetry)
- `apps/web/app/utils/plans.server.ts` (removed `ai_message` usage-limit path)
- `packages/database/src/schema.ts` (adds `aiCredits`, removes `aiPlan`)
- `packages/database/src/migrations/0076_remove_ai_plan.sql`

### 10) DB integrity hardening: `store_users` shim for legacy FK
Behavior:
- Some existing schema objects reference `store_users(id)` (e.g. `page_revisions.created_by`).
- Missing `store_users` can break later schema operations (ALTER/RENAME/rebuild) with `no such table: main.store_users`.
- Added a minimal `store_users` table that mirrors `users.id`, with backfill + triggers to keep in sync.

Files:
- `packages/database/src/migrations/0077_create_store_users_shim.sql`

## 🚀 Deployment (Cloudflare Workers)

Latest deployed version (as of **2026-02-06**):
- `0dcf6c37-a692-4613-a581-daecdbdf6c39`

Recent deploy chain (newest last):
- `2217efb8-901c-4ba8-a1a0-dea928188d64`
- `61b9c0e0-9bf2-4558-84b9-40d1295897bf`
- `f30c6d0b-4675-4a94-9fcc-5c4779a47d5e`
- `877f7627-5f47-467e-866e-49231c52761a`
- `ee7b10b1-4312-43ad-a8a8-998e9d333a69`
- `f065b360-2450-4154-9b75-97c9dc976a2a`
- `f037b11d-81e5-4d8c-9873-0e2d4a27efae`
- `5cebbc12-4587-4a80-8893-86d823dd6fb3`
- `103daae6-7bd2-4f45-8399-62e36263baca`

## 🟡 Remaining Work Before “Real Money” Go-Live (Production Grade)

### P0) Migration workflow (single source of truth)
Goal:
- One migrations directory + one apply command path for all Workers/apps.

Status:
- `migrations_dir` now points to `packages/database/src/migrations` in:
  - `apps/web/wrangler.toml`
  - `apps/web/workers/webhook-dispatcher/wrangler.toml`
- New documented workflow:
  - `docs/DATABASE_MIGRATIONS.md`

### P0) Security gates (money + inventory)
Remix default `SameSite=Lax` sessions reduce CSRF risk, but for a real-money admin we still want explicit mutation guards. (Ref: Remix sessions docs + CSRF note.)

Do next:
- Add a centralized mutation guard for admin actions (Origin/Host allowlist + optional CSRF token) and apply to:
  - `/app/settings/*`
  - `/app/products*`
  - `/api/*` that mutate state
- Add signature verification + idempotency for payment webhooks (when provider routes are enabled).

Reference:
- Remix session cookies (`sameSite: "lax"`) and CSRF note: Remix v2 docs.
- Cloudflare Workers security headers patterns: CF Workers docs.

### P0) Transaction correctness
- E2E matrix for checkout/order:
  - success
  - stock-insufficient
  - duplicate submit/retry
  - network retry (same idempotency key)
- Order invariants:
  - unique order number per store
  - inventory never goes negative
  - “paid” state only after verified webhook (if online payment)

### P0) Operational readiness
- Rollback drill: deploy → validate → rollback to last known good version.
- D1 + R2 backup/restore procedure tested (timeboxed rehearsal).
- Monitoring/alerting for:
  - checkout failures
  - 5xx rate
  - p95 latency

### P1) Performance budget gates
- Re-run Lighthouse for:
  - homepage
  - product page
  - checkout
- Address render-blocking CSS/fonts where applicable:
  - prefer self-hosted fonts + preload critical WOFF2 + `font-display: swap`

## ✅ Go-Live Checklist (Minimum)
1. End-to-end QA: create store → set theme → add product → add to cart → checkout → create order → verify inventory change.
2. Settings QA: WhatsApp/call toggles + shipping policy + refund policy updates reflect on storefront.
3. Security QA: tenant isolation spot-check (`store_id` filter), WAF rules enabled, secrets audit.
4. Observability QA: errors visible, deploy versions identifiable, rollback path verified.
