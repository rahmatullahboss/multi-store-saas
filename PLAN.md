# Multi-Tenant Feature Gaps — Implementation Plan

> **Platform**: Ozzyl Multi-Store SaaS (Cloudflare Edge + Remix + D1 + Drizzle ORM)  
> **Goal**: Close critical multi-tenancy gaps to reach Shopify-grade reliability and merchant experience  
> **Last Updated**: 2026-02-25  
> **Sprint cadence**: 2-week sprints. P0 = Week 1–3 · P0.5 = Week 3–4 · P1 = Week 5–8 · P2 = Week 9+

---

## 1. Gap Analysis (Current State)

| Area | Current State | Gap |
|---|---|---|
| **Tenant Isolation** | `store_id` filtering on most tables; composite indexes exist | No middleware-level enforcement; relies on developer discipline |
| **Billing / Plan Enforcement** | `planType` + `usageLimits` stored on `stores`; billing page reads them | Limits are **UI-only** — no server-side gate at the loader/action layer |
| **Team & Permissions** | `users.permissions` JSON + `staffInvites` table; UI complete | Permissions not enforced in most route loaders/actions |
| **Subscription Lifecycle** | Manual bKash verification + `subscriptionEndDate` column | No automated dunning, no grace-period logic, no webhook-driven renewal |
| **Storefront Settings** | Unified `storefront_settings` column (migration 0091) in place | Legacy columns (`themeConfig`, `socialLinks`, etc.) still populated by some write paths |
| **API Platform** | `api_keys` + `api_plans` + `api_subscriptions` tables (migrations 0092–0094) | No rate-limiter enforcement in production request path; scopes checked ad-hoc |
| **Audit Trail** | `activity_logs` table exists; `logActivity` helper in place | Not called consistently — missing on billing changes, team changes, settings saves |
| **Domain Provisioning** | `cloudflareHostnameId` + `sslStatus` columns exist | No automated Cloudflare for SaaS provisioning worker; manual admin approval only |
| **Data Retention / Purge** | Cron SQL documented in migration comments | No scheduled worker runs the purge queries |
| **Observability** | Structured logs in some services | No centralized error tracking; `wrangler tail` only |
| **Usage Metering** | `api_usage_daily` table planned (migration 0095) | Not yet wired into request path; no merchant-facing usage dashboard |
| **`activity_logs.actor`** | Column planned in migration 0096 | Migration not yet applied; `actor` field missing on all existing rows |
| **Theme scope isolation** | `storefront_settings` has `theme.templateId`; `landingConfig` lives separately | No canonical `landing.templateId` or `builder.previewTemplateId`; cross-scope bleed possible |
| **Template resolver fallback** | `buildTemplateFromThemeConfig` fallback still live | Storefront routes may read wrong source; no scope guard enforced |

---

## 1b. Feature-List Gaps (Merchant Experience)

| Feature | Status | Priority |
|---|---|---|
| **Fake order detection** | No fraud scoring on COD orders; IP/velocity checks missing | P1 |
| **Courier success analytics** | Delivery success/return rate not tracked per courier | P1 |
| **Profit/loss tracking** | Revenue tracked; COGS, shipping cost, refund cost not deducted | P1 |
| **Server-side tracking unify** | FB CAPI + GA4 MP fire independently; no unified event pipeline | P1 |
| **Checkout format toggle** | Single-page vs multi-step checkout hardcoded; no merchant toggle | P2 |
| **Review system rollout** | `product_reviews` table not yet migrated; no storefront display or moderation UI | P2 |
| **Theme scope isolation** | Three scopes (storefront/landing/builder) cross-bleed; no enforced canonical split | P0.5 |

---

## 2. Phased Roadmap

> **Priority legend**: P0 = ship this sprint (blocking launch) · P1 = next sprint · P2 = backlog

### Phase 0 — Blocker Fixes (Week 1–2 — P0)
*Must ship before any new feature work. These gaps create live data-leak or revenue-loss risk.*

| # | Item | File / Action | Blocker Reason |
|---|---|---|---|
| 0-A | **Tenant guard middleware** | `server/middleware/tenant-guard.ts` | Data isolation not enforced at middleware level |
| 0-B | **Plan enforcement (server-side)** | `lib/plan-enforcement.server.ts` | Limits are UI-only; trivially bypassable |
| 0-C | **Permission enforcement in loaders** | `lib/permissions.server.ts` | Staff can reach owner-only routes |
| 0-D | **`activity_logs.actor` migration** | migration `0096_audit_actor_field.sql` | All existing log rows missing `actor`; apply + backfill with `'system'` |
| 0-E | **Sentry wired to `entry.server.tsx`** | `SENTRY_DSN` already in env docs | Zero visibility into production errors right now |

#### 0-A · Tenant Guard Middleware (Day 1–2)

**Goal**: Enforce `store_id` scoping at the framework layer so no individual loader can accidentally leak cross-tenant data.

Steps:
1. Create `apps/web/app/server/middleware/tenant-guard.ts`:
   - Export `withTenantGuard(db, storeId)` — wraps a Drizzle query builder and injects `.where(eq(table.storeId, storeId))` automatically via a Proxy or explicit helper.
   - Export `assertStoreOwnership(userId, storeId, db)` — throws `403` if the requesting user does not own or have staff access to `storeId`.
2. Grep all `app.*` route loaders for raw `db.select().from(...)` calls without a `storeId` filter — patch each one to call `assertStoreOwnership` first.
3. Add integration test: authenticated request to a different store's data must return `403`.
4. Wire into `entry.server.tsx` as a before-loader hook (or use Remix middleware pattern).
5. Add one-time **migration ordering audit**: verify new migrations `0095–0099` don’t conflict with existing numbering in `packages/database/src/migrations`.

**Components**:
- `apps/web/app/server/middleware/tenant-guard.ts` *(new)*
- `apps/web/app/lib/store-ownership.server.ts` *(new — thin wrapper)*
- Patch: all `app.*` loaders that lack `storeId` guard

---

#### 0-B · Plan Enforcement — Server-Side (Day 2–3)

**Goal**: Move plan limit checks from the UI (easily bypassed) to the server action layer.

Steps:
1. Create `apps/web/app/lib/plan-enforcement.server.ts`:
   - Export `assertPlanLimit(db, storeId, resource: 'products'|'staff'|'api_keys'|'domains', env)`.
   - Internally: fetch current count with a single `COUNT(*)` query; compare against `stores.usageLimits` JSON; throw `402` with a structured error if exceeded.
   - Cache the limit check in KV for 60 s (`plan:limit:{storeId}:{resource}`) to reduce D1 reads.
   - **Race note**: on insert, re-check or increment a D1 counter to avoid TOCTOU over-limit writes under concurrency.
2. Call `assertPlanLimit` at the top of every `action()` that inserts a plan-limited resource (products, staff invites, API keys, custom domains).
3. Return a user-friendly error JSON: `{ success: false, error: 'PLAN_LIMIT_EXCEEDED', limit: 50, current: 50 }`.
4. Add unit test: mock a store at limit; assert `assertPlanLimit` throws `402`.

**Components**:
- `apps/web/app/lib/plan-enforcement.server.ts` *(new)*
- KV key pattern: `plan:limit:{storeId}:{resource}` (TTL 60 s)
- Patch: `app.products.tsx`, `app.team.tsx`, `app.api-keys.tsx`, `app.domains.tsx` actions

---

#### 0-C · Permission Enforcement in Route Loaders (Day 3–4)

**Goal**: Staff roles respect their assigned permissions at the server layer.

Steps:
1. Create `apps/web/app/lib/permissions.server.ts`:
   - Export `requirePermission(userId, storeId, permission: Permission, db)`.
   - Reads `users.permissions` JSON; throws `403` if the required permission is absent.
   - Enumerate all `Permission` values as a TypeScript union (`'products:write'|'orders:write'|'settings:write'|...`).
2. Annotate every `app.*` route with the permission it requires (add a `REQUIRED_PERMISSION` constant at the top of the file as documentation + enforcement).
3. Call `requirePermission` at the top of each loader and action accordingly.
4. Add unit test: staff missing `settings:write` cannot access `app.settings` loader.

**Components**:
- `apps/web/app/lib/permissions.server.ts` *(new)*
- `apps/web/app/lib/permission-types.ts` *(new — shared enum/union)*
- Patch: `app.settings._index.tsx`, `app.team.tsx`, `app.billing.tsx`, `app.api-keys.tsx`

---

#### 0-D · `activity_logs.actor` Migration (Day 4)

**Goal**: Every audit log row identifies who or what performed the action.

Steps:
1. Create `packages/database/src/migrations/0096_audit_actor_field.sql`:
   ```sql
   ALTER TABLE activity_logs ADD COLUMN actor TEXT NOT NULL DEFAULT 'system';
   CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs(actor);
   ```
   *(SQLite applies the default to existing rows; no UPDATE needed.)
2. Update Drizzle schema `schema-activity-logs.ts`: add `actor: text('actor').notNull().default('system')`.
3. Update `logActivity()` helper to accept and persist `actor` (user ID string, `'system'`, or `'api:{keyId}'`).
4. Run `npm run db:migrate:local` and `npm run db:migrate:prod` (after staging verification).
5. Verify backfill: `SELECT COUNT(*) FROM activity_logs WHERE actor = '';` must return 0. (Also verify `actor` value matches `actor_type` policy.)

**Components**:
- `packages/database/src/migrations/0096_audit_actor_field.sql` *(new)*
- `packages/database/src/schema-activity-logs.ts` *(update)*
- `apps/web/app/lib/activity-logger.server.ts` *(update `logActivity` signature)*

---

#### 0-E · Sentry Error Tracking (Day 5)

**Goal**: Capture all unhandled loader/action errors in production with store context.

Steps:
1. Verify existing Sentry wiring in `apps/web/app/entry.server.tsx` (packages already installed).
2. If missing, wrap `handleRequest` with `Sentry.wrapRequestHandler`.
3. Set `SENTRY_DSN` via `wrangler secret put SENTRY_DSN`.
4. Tag every error with `store_id` from the request context using `Sentry.setTag('store_id', storeId)`.
5. Configure `sampleRate: 1.0` for errors, `tracesSampleRate: 0.1` for performance.
6. Verify: trigger a deliberate error in staging; confirm it appears in Sentry dashboard with `store_id` tag.

**Components**:
- `apps/web/app/entry.server.tsx` *(update)*
- `apps/web/app/lib/sentry.server.ts` *(new — init helper)*
- Cloudflare secret: `SENTRY_DSN`

---

### Phase 0.5 — Theme Isolation Cutover (Week 3–4 — P0.5)
*Risk: HIGH. Prevents theme drift and cross-scope contamination before P1.*

> **Scopes**: Storefront (home/cart/checkout/products/search/auth/account) · Landing (campaign/landing-template routes) · Builder (page-builder/live-editor preview). No cross-scope template bleed.

---

#### 0.5-A · Canonical Scoped Source-of-Truth (Day 6–7)

**Goal**: Extend `storefront_settings` with explicit `landing` and `builder` scoped template IDs.

Steps:
1. Update `apps/web/app/services/storefront-settings.schema.ts`:
   - Add `landing: { templateId: string }` and `builder: { previewTemplateId: string }`.
   - Keep `theme.templateId` as storefront-only.
2. Update `apps/web/app/services/unified-storefront-settings.server.ts`:
   - Add scoped getters: `getStorefrontTemplateId`, `getLandingTemplateId`, `getBuilderTemplateId`.
   - Migration fallback: landing from `stores.landingConfig.templateId`, builder from existing builder defaults.
3. Add strict validation: scoped template IDs must be in `VALID_TEMPLATE_IDS`.

**Components**:
- `apps/web/app/services/storefront-settings.schema.ts` *(update)*
- `apps/web/app/services/unified-storefront-settings.server.ts` *(update)*

---

#### 0.5-B · Storefront Routes Hard-Unify (Day 7–8)

**Goal**: All storefront routes read `settings.theme.templateId` only.

Steps:
1. Patch storefront routes to use `getStorefrontTemplateId(settings)` only.
2. Remove any `landingConfig`, `themeConfig`, or `buildTemplateFromThemeConfig` fallback branches.
3. Add lint comment: `// SCOPE: storefront — reads theme.templateId only`.

**Components**:
- `routes/_index.tsx`, `store.home.tsx`, `cart.tsx`, `checkout.tsx`, `products._index.tsx`, `products.$handle.tsx`, `search.tsx`, `store.auth.login.tsx`, `account.tsx` *(patch)*

---

#### 0.5-C · Remove Legacy Fallback in Template Resolver (Day 8)

**Goal**: Delete legacy fallback path so template resolver never uses deprecated columns.

Steps:
1. Remove `buildTemplateFromThemeConfig` from `apps/web/app/lib/store.server.ts`.
2. Replace call-sites with `getStorefrontTemplateId` and scoped defaults only.
3. Ensure missing template triggers structured `404` instead of silent fallback.

**Components**:
- `apps/web/app/lib/store.server.ts` *(update)*

---

#### 0.5-D · Landing Isolation (Day 8–9)

**Goal**: `/app/design` reads/writes only `settings.landing.templateId`.

Steps:
1. Replace `stores.landingConfig` reads with `getLandingTemplateId(settings)`.
2. Save via `saveUnifiedStorefrontSettingsWithCacheInvalidation(db, storeId, { landing: { templateId } }, env)`.
3. Update UI copy: “Landing Template” + “Affects landing pages only”.
4. Keep one-release compatibility mirror to `stores.landingConfig.templateId`.

**Components**:
- `apps/web/app/routes/app.design.tsx` *(update)*

---

#### 0.5-E · Builder Preview Isolation (Day 9)

**Goal**: Builder preview reads only `settings.builder.previewTemplateId`.

Steps:
1. Update `store-live-editor.server.ts` and `store-preview-frame.tsx` to use `getBuilderTemplateId(settings)`.
2. Save path updates only `builder` scoped branch.
3. Precedence: explicit builder override > builder scoped default > storefront fallback (read-only).

**Components**:
- `apps/web/app/lib/store-live-editor.server.ts` *(update)*
- `apps/web/app/routes/store-preview-frame.tsx` *(update)*

---

#### 0.5-F · Admin Settings Clarity (Day 9–10)

**Goal**: Settings UI labels are scope-explicit.

Steps:
1. Relabel sections: “Storefront Theme”, “Landing Theme”, “Builder Preview Theme”.
2. Add warning badge when editing a different scope than last edited.
3. One-time migration notice: “Themes are now scope-isolated.”

**Components**:
- `apps/web/app/routes/app.store.settings.tsx` *(update)*
- `apps/web/app/routes/app.settings._index.tsx` *(update)*

---

#### 0.5-G · Data Migration & Cache Invalidation (Day 10)

**Goal**: Backfill scoped template IDs and invalidate caches.

Steps:
1. Create `scripts/migrate-theme-scopes.ts` (idempotent, `--dry-run` + `--apply`).
2. Backfill missing `landing.templateId` and `builder.previewTemplateId`.
3. Invalidate KV keys: `store:{id}:config`.

**Components**:
- `scripts/migrate-theme-scopes.ts` *(new)*

---

### Phase 1 — Platform Hardening & Revenue Protection (Week 5–8 — P1)
*Risk: HIGH. Enforces revenue safety and platform integrity after P0/P0.5 blockers.*

---

#### P1-A · Subscription Lifecycle Automation (Week 3)

**Goal**: Replace manual bKash verification with automated state transitions and grace-period logic so expired stores are handled without admin intervention.

Steps:
1. Create `apps/web/app/services/subscription-lifecycle.server.ts`:
   - Define state machine: `active → grace_period (day 0) → restricted (day 3) → suspended (day 7) → cancelled (day 30)`.
   - Export `transitionSubscription(db, storeId, newStatus, actor, env)`:
     - Updates `stores.subscriptionStatus` + `stores.subscriptionEndDate`.
     - Calls `saveUnifiedStorefrontSettingsWithCacheInvalidation(db, storeId, patch, env)` to disable storefront features on downgrade.
     - Calls `logActivity(db, { storeId, action: 'subscription:status_changed', actor, meta: { from, to } })`.
   - Export `computeSubscriptionStatus(store)` — pure function, returns target status given current date + end date.
2. Extend existing `apps/web/workers/subscription-cron/` (if present) **instead of creating a parallel worker**:
   - Scheduled trigger: `"0 2 * * *"` (daily at 02:00 UTC).
   - Fetch all stores where `subscriptionEndDate <= NOW() + 7 days`.
   - For each store, call `transitionSubscription` with `actor = 'system'`.
   - Run retention purge queries at end of cron (see P1-D).
3. If `subscription-cron` does not exist, create `apps/web/workers/billing-cron.ts` and register cron in `wrangler.toml`:
   ```toml
   [triggers]
   crons = ["0 2 * * *"]
   ```
4. Test in staging: create a store with `subscriptionEndDate = yesterday`; verify cron moves it to `grace_period` and KV cache is invalidated.

**Components**:
- `apps/web/app/services/subscription-lifecycle.server.ts` *(new)*
- `apps/web/workers/subscription-cron/` *(extend)* **OR** `apps/web/workers/billing-cron.ts` *(new)*
- `wrangler.toml` *(add cron trigger)*
- `apps/web/app/lib/activity-logger.server.ts` *(ensure `actor` field passed through)*

---

#### P1-B · API Platform Enforcement + Usage Metering (Week 3–4)

**Goal**: API keys are scoped, rate-limited, and every request is metered in `api_usage_daily` for merchant dashboards and billing.

Steps:
1. Apply migration `packages/database/src/migrations/0095_api_usage_daily.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS api_usage_daily (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     api_key_id INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
     store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
     date TEXT NOT NULL,          -- ISO date YYYY-MM-DD
     endpoint TEXT NOT NULL,
     request_count INTEGER NOT NULL DEFAULT 0,
     UNIQUE(api_key_id, date, endpoint)
   );
   CREATE INDEX idx_api_usage_store_date ON api_usage_daily(store_id, date);
   ```
2. Create `apps/web/app/server/middleware/api-auth.ts` (Hono middleware):
   - Extract `Authorization: Bearer <key>` header.
   - Validate key against `api_keys` table; confirm `status = 'active'` and `storeId` match.
   - Attach `{ apiKeyId, storeId, scopes }` to `c.set('apiContext', ...)`.
   - Enforce per-endpoint scope: `GET /api/v1/products` requires `products:read` scope; `POST` requires `products:write`. Return `403` on scope mismatch.
3. Create `apps/web/app/server/middleware/rate-limiter.ts` (Durable Object backed):
   - Use existing `rate-limiter-do.server.ts` pattern; integrate into Hono chain after `api-auth`.
   - Limit: configurable per `api_plans` row (default 30 req/min). Return `429` with `Retry-After` header.
4. Wire both middlewares into all API routes that are actually mounted in Remix (`api.*` and any `api.v1.*` if present). Use a shared `createApiRouter()` to avoid missed routes.
5. Increment `api_usage_daily` via `ctx.waitUntil()` (non-blocking) on every successful request.
6. Add merchant-facing usage widget to `app.api-keys.tsx`: bar chart of daily request counts (last 30 days) from `api_usage_daily`.

**Components**:
- `packages/database/src/migrations/0095_api_usage_daily.sql` *(new)*
- `apps/web/app/server/middleware/api-auth.ts` *(new — Hono middleware)*
- `apps/web/app/server/middleware/rate-limiter.ts` *(new — DO-backed)*
- `apps/web/app/routes/api.v1.*.ts` *(patch: add middleware chain)*
- `apps/web/app/routes/app.api-keys.tsx` *(update: add usage chart)*

---

#### P1-C · Domain Provisioning Automation (Week 4)

**Goal**: Custom domain requests go from manual admin approval to automated Cloudflare for SaaS provisioning within minutes.

Steps:
1. Create `apps/web/workers/domain-provisioner.ts` (Queue consumer):
   - Consume messages from `DOMAIN_QUEUE` (Cloudflare Queue).
   - Call Cloudflare API: `POST /zones/{zone_id}/custom_hostnames` with the requested hostname.
   - Poll SSL status every 30 s (max 5 retries); update `stores.sslStatus` + `stores.cloudflareHostnameId` in D1.
   - On success: update `stores.customDomain` status to `active`; send notification to merchant.
   - On failure after retries: mark as `failed`; log to `activity_logs` with `actor = 'system'`.
   - Implement exponential backoff: `delay = min(30 * 2^attempt, 300)` seconds.
2. Update `apps/web/app/routes/admin.domains.tsx`:
   - "Approve" button publishes a message to `DOMAIN_QUEUE` instead of directly updating DB.
   - Show real-time SSL status polling from `stores.sslStatus` on the domain detail page.
3. Add `DOMAIN_QUEUE` binding in `wrangler.toml`:
   ```toml
   [[queues.producers]]
   queue = "domain-provisioning"
   binding = "DOMAIN_QUEUE"

   [[queues.consumers]]
   queue = "domain-provisioning"
   max_batch_size = 1
   max_retries = 5
   ```
4. Add Cloudflare API credentials to secrets: `CF_API_TOKEN`, `CF_ZONE_ID`.

**Components**:
- `apps/web/workers/domain-provisioner.ts` *(new — Queue consumer)*
- `apps/web/app/routes/admin.domains.tsx` *(update: Queue publish on approve)*
- `wrangler.toml` *(add queue bindings)*
- Cloudflare secrets: `CF_API_TOKEN`, `CF_ZONE_ID`

---

#### P1-D · Audit Coverage + Data Retention Purge (Week 4–5)

**Goal**: Every sensitive platform action is logged with `actor`; old data is purged on schedule.

Steps:
1. Audit call-sites — grep for all places `logActivity` is **not** called but should be:
   - `app.billing.tsx` action (plan change, payment verified)
   - `app.team.tsx` action (invite sent, member removed, role changed)
   - `app.settings._index.tsx` action (settings saved)
   - `app.api-keys.tsx` action (key created, key revoked)
2. Add `logActivity` calls with correct `actor` (user ID or `'system'`) in all missing locations.
3. Extend cron worker (`subscription-cron` if present, else `billing-cron.ts`) with retention purge at end of daily run:
   ```sql
   DELETE FROM activity_logs WHERE created_at < DATE('now', '-90 days');
   DELETE FROM api_usage_daily WHERE date < DATE('now', '-365 days');
   DELETE FROM sessions WHERE expires_at < DATE('now', '-1 day');
   ```
4. Add purge dry-run flag: `PURGE_DRY_RUN=true` Cloudflare secret → logs row counts instead of deleting.
5. Verify purge in staging: insert old rows, run cron manually, confirm deletion.

**Components**:
- `apps/web/workers/subscription-cron/` *(update: add purge block)* **OR** `apps/web/workers/billing-cron.ts` *(update: add purge block)*
- `apps/web/app/lib/activity-logger.server.ts` *(update: add missing call-sites)*
- Cloudflare secret: `PURGE_DRY_RUN`

---

#### P1-E · Merchant Experience Gaps (Week 5–6)

**Goal**: Four critical merchant-facing features that protect revenue and improve operational visibility.

---

**P1-E1 · Fake Order Detection (Fraud Scoring)**

Steps:
1. Create `apps/web/app/services/fraud-detection.server.ts`:
   - Export `scoreFraudRisk(order, db, env): Promise<FraudScore>`.
   - Scoring signals (weighted sum, max 100):
     - IP velocity: >3 orders same IP in 1 h → +40 pts
     - Phone velocity: >2 orders same phone in 24 h → +30 pts
     - Address blacklist: phone/address in `fraud_blacklist` table → +50 pts
     - COD order with no prior order history → +10 pts
     - Order value > 5× store average order value → +20 pts
   - Return `{ score, risk: 'low'|'medium'|'high', signals: string[] }`.
2. Create migration `0097_fraud_blacklist.sql`:
   ```sql
   CREATE TABLE fraud_blacklist (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
     type TEXT NOT NULL CHECK(type IN ('phone','ip','address')),
     value TEXT NOT NULL,
     reason TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(store_id, type, value)
   );
   ```
3. Call `scoreFraudRisk` in `checkout.tsx` action; attach `fraudScore` + `riskLevel` to order row.
4. Surface risk badge on `app.orders.tsx` list: 🟡 Medium / 🔴 High. Filter by risk.
5. Add "Block" action on high-risk orders → inserts phone/IP into `fraud_blacklist`.

**Components**:
- `apps/web/app/services/fraud-detection.server.ts` *(new)*
- `packages/database/src/migrations/0097_fraud_blacklist.sql` *(new)*
- `apps/web/app/routes/checkout.tsx` *(update: call fraud scorer)*
- `apps/web/app/routes/app.orders.tsx` *(update: risk badge + filter)*

---

**P1-E2 · Courier Success Analytics**

Steps:
1. Add columns to `orders` (migration `0098_order_delivery_tracking.sql`):
   ```sql
   ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT NULL;
   ALTER TABLE orders ADD COLUMN delivered_at DATETIME DEFAULT NULL;
   ALTER TABLE orders ADD COLUMN returned_at DATETIME DEFAULT NULL;
   ```
2. Create `apps/web/app/services/courier-analytics.server.ts`:
   - Export `getCourierSuccessRates(db, storeId, dateRange)`:
     - Returns per-courier: `{ courier, total, delivered, returned, pending, successRate, returnRate }`.
   - Driven by `orders.courierName` + `orders.delivery_status`.
3. Add webhook handlers for Steadfast and Pathao delivery status callbacks → update `delivery_status`, `delivered_at`, `returned_at`.
4. Add `Courier Analytics` tab to `app.analytics.tsx`: table + bar chart of success/return rates per courier.

**Components**:
- `packages/database/src/migrations/0098_order_delivery_tracking.sql` *(new)*
- `apps/web/app/services/courier-analytics.server.ts` *(new)*
- `apps/web/app/routes/api.webhooks.steadfast.ts` *(new/update)*
- `apps/web/app/routes/api.webhooks.pathao.ts` *(new/update)*
- `apps/web/app/routes/app.analytics.tsx` *(update: courier tab)*

---

**P1-E3 · Profit/Loss Tracking**

Steps:
1. Add `cogs` (cost of goods) column to `products` and `order_items` (migration `0099_cogs_tracking.sql`):
   ```sql
   ALTER TABLE products ADD COLUMN cogs INTEGER DEFAULT 0;  -- in base currency paisa
   ALTER TABLE order_items ADD COLUMN cogs_snapshot INTEGER DEFAULT 0;
   ```
2. Create `apps/web/app/services/profit-analytics.server.ts`:
   - Export `getProfitLossReport(db, storeId, dateRange)`:
     - Revenue = SUM of `order_items.price * quantity` for completed orders.
     - COGS = SUM of `order_items.cogs_snapshot`.
     - Shipping cost = SUM of `orders.shippingCost`.
     - Refunds = SUM of refunded order totals.
     - Gross profit = Revenue − COGS − Shipping − Refunds.
3. Snapshot `cogs` at order creation time into `order_items.cogs_snapshot` (price can change later).
4. Add `Profit & Loss` card to `app._index.tsx` dashboard: revenue, COGS, shipping, refunds, net profit, margin %.

**Components**:
- `packages/database/src/migrations/0099_cogs_tracking.sql` *(new)*
- `apps/web/app/services/profit-analytics.server.ts` *(new)*
- `apps/web/app/routes/app._index.tsx` *(update: P&L card)*
- `apps/web/app/routes/app.products.$id.tsx` *(update: COGS input field)*
- `apps/web/app/routes/checkout.tsx` *(update: snapshot COGS to order_items)*

---

**P1-E4 · Unified Server-Side Tracking Pipeline**

Steps:
1. Create `apps/web/app/services/tracking-pipeline.server.ts`:
   - Export `fireTrackingEvent(event: TrackingEvent, store, env)` — single entry point.
   - Internally fans out to: FB CAPI, GA4 Measurement Protocol, and any future providers.
   - Use `ctx.waitUntil()` so tracking never blocks the response.
   - Normalise event schema: `{ name, timestamp, userId, sessionId, storeId, properties }`.
2. Define `TrackingEvent` union: `'PageView'|'ViewContent'|'AddToCart'|'InitiateCheckout'|'Purchase'`.
3. Replace all direct `fetch(fbCapiUrl, ...)` and `fetch(ga4MpUrl, ...)` calls in route actions with `fireTrackingEvent(...)`.
4. Add per-store tracking config in `storefront_settings.tracking`: `{ fbPixelId, fbAccessToken, ga4MeasurementId, ga4ApiSecret }`.
5. Add retry logic: on transient failure (5xx from provider), retry once via `ctx.waitUntil`.

**Components**:
- `apps/web/app/services/tracking-pipeline.server.ts` *(new)*
- `apps/web/app/lib/tracking-types.ts` *(new — event schema)*
- `apps/web/app/routes/checkout.tsx` *(update: use unified pipeline)*
- `apps/web/app/routes/products.$handle.tsx` *(update: ViewContent via pipeline)*
- `apps/web/app/routes/cart.tsx` *(update: AddToCart via pipeline)*

---

### Phase 2 — Merchant UX Polish (Week 7+ — P2)
*Risk: LOW. Improves conversions and merchant satisfaction post-launch.*

---

#### P2-A · Checkout Format Toggle (Week 7)

**Goal**: Merchants can choose between one-page and multi-step checkout without code changes.

Steps:
1. Add `checkout.format` field to `storefront_settings` schema:
   ```typescript
   checkout: {
     format: 'single-page' | 'multi-step';  // default: 'single-page'
     // ... existing checkout fields
   }
   ```
2. Add merchant toggle in `app.store.settings.tsx` → "Checkout Experience" section:
   - Radio: `Single Page (faster, mobile-friendly)` vs `Multi-Step (guided, higher clarity)`.
   - Save via `saveUnifiedStorefrontSettingsWithCacheInvalidation`.
3. In `checkout.tsx` loader: read `storefront_settings.checkout.format`; conditionally render `<SinglePageCheckout />` or `<MultiStepCheckout />`.
4. Extract current checkout form into `<SinglePageCheckout />` component; build `<MultiStepCheckout />` with 3 steps: `Contact → Shipping → Payment`.
5. Persist step progress in `sessionStorage` so browser back button doesn't lose data.
6. A/B test readiness: log `checkout_format_used` event via unified tracking pipeline.

**Components**:
- `apps/web/app/routes/checkout.tsx` *(update: conditional render)*
- `apps/web/app/components/store/checkout/SinglePageCheckout.tsx` *(extract from existing)*
- `apps/web/app/components/store/checkout/MultiStepCheckout.tsx` *(new)*
- `apps/web/app/routes/app.store.settings.tsx` *(update: checkout format toggle)*
- Schema: `storefront_settings.checkout.format`

---

#### P2-B · Review System Rollout (Week 7–8)

**Goal**: `product_reviews` table is already migrated — wire up storefront display and merchant moderation.

Steps:
1. **Storefront display** (`products.$handle.tsx`):
   - Query approved reviews: `SELECT * FROM product_reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 20`.
   - Render star rating aggregate (average + count) in product info section.
   - Render review list below product description.
   - Add `<WriteReviewForm />` for logged-in customers (submits to `api.reviews.ts` action).
2. **Review submission** (`apps/web/app/routes/api.reviews.ts`):
   - `POST`: validate body `{ productId, rating: 1–5, title, body }`; insert with `status = 'pending'`.
   - Rate-limit: max 1 review per customer per product (unique constraint on `customer_id + product_id`).
   - Notify merchant via `activity_logs` entry.
3. **Moderation UI** (`apps/web/app/routes/app.reviews.tsx` — new route):
   - Table: pending reviews with Approve / Reject actions.
   - Bulk approve/reject support.
   - Filter by product, rating, date.
   - Show customer name + order reference to confirm legitimacy.
4. **Admin controls**:
   - Merchant can toggle "Allow reviews" per store in `app.store.settings.tsx`.
   - `storefront_settings.reviews.enabled: boolean` (default `false`; opt-in).

**Components**:
- `apps/web/app/routes/products.$handle.tsx` *(update: review display)*
- `apps/web/app/components/store/ProductReviews.tsx` *(new — star rating + list)*
- `apps/web/app/components/store/WriteReviewForm.tsx` *(new)*
- `apps/web/app/routes/api.reviews.ts` *(new — submit endpoint)*
- `apps/web/app/routes/app.reviews.tsx` *(new — moderation dashboard)*
- `apps/web/app/routes/app.store.settings.tsx` *(update: reviews toggle)*

---

## 3. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Breaking query regressions from tenant guard | Medium | High | Audit all `db.select()` calls with grep; add integration test per table |
| Billing cron double-downgrade | Low | High | Ensure only one cron exists (reuse `subscription-cron`); idempotency check — verify `subscriptionStatus` before transition |
| D1 write limits during plan enforcement checks | Medium | Medium | Use `assertPlanLimit` with a single `COUNT(*)` query + KV cache (TTL 60s) |
| Cloudflare API rate limit during domain provisioning | Low | Medium | Exponential backoff in provisioner worker; max 5 retries via Queue retry policy |
| Legacy columns causing settings drift | High | Medium | Add migration to `NOT NULL` or `DEFAULT NULL` legacy columns; enforce write only via `saveUnifiedStorefrontSettings` |
| Permission enforcement breaking existing staff workflows | Medium | High | Feature flag `PERMISSION_ENFORCEMENT=strict/warn` in KV; run in `warn` mode first (logs only), then flip to `strict` |
| Theme scope migration leaves stores missing `landing.templateId` | Medium | Medium | Idempotent migration with `--dry-run`; fallback to `'starter-store'` if missing; keep compatibility mirrors for one release |

---

## 4. Required New Components Summary

| Component | Type | Phase | Status |
|---|---|---|---|
| `server/middleware/tenant-guard.ts` | Middleware | P0 | ⬜ Pending |
| `lib/plan-enforcement.server.ts` | Server util | P0 | ⬜ Pending |
| `lib/permissions.server.ts` | Server util | P0 | ⬜ Pending |
| `migration/0096_audit_actor_field.sql` + backfill | DB migration | P0 | ⬜ Pending |
| Sentry in `entry.server.tsx` | Observability | P0 | ⬜ Pending |
| `storefront-settings.schema.ts` — `landing`+`builder` scope blocks | Schema update | P0.5 | ⬜ Pending |
| `unified-storefront-settings.server.ts` — scoped getters + fallback | Service update | P0.5 | ⬜ Pending |
| Patch storefront routes → `getStorefrontTemplateId` only | Route patches | P0.5 | ⬜ Pending |
| `lib/store.server.ts` — remove legacy fallback | Cleanup | P0.5 | ⬜ Pending |
| `app.design.tsx` — landing scope isolation | Route update | P0.5 | ⬜ Pending |
| Builder routes — `getBuilderTemplateId` isolation | Route patches | P0.5 | ⬜ Pending |
| `app.store.settings.tsx` — scope labels | UI update | P0.5 | ⬜ Pending |
| `scripts/migrate-theme-scopes.ts` — idempotent backfill | Migration script | P0.5 | ⬜ Pending |
| `services/subscription-lifecycle.server.ts` | Service | P1 | ⬜ Pending |
| `workers/subscription-cron/` (extended) OR `workers/billing-cron.ts` | Cron Worker | P1 | ⬜ Pending |
| `server/middleware/api-auth.ts` | Hono middleware | P1 | ⬜ Pending |
| `migration/0095_api_usage_daily.sql` | DB migration | P1 | ⬜ Pending |
| `workers/domain-provisioner.ts` | Queue Worker | P1 | ⬜ Pending |
| Fake order detection service | Fraud scoring | P1 | ⬜ Pending |
| Courier success analytics (delivery rate tracking) | Analytics | P1 | ⬜ Pending |
| Profit/loss tracking (COGS deduction) | Analytics | P1 | ⬜ Pending |
| Unified server-side tracking pipeline (FB CAPI + GA4) | Tracking | P1 | ⬜ Pending |
| Checkout format toggle (merchant setting) | Merchant UX | P2 | ⬜ Pending |
| Review system storefront display + moderation UI | Merchant UX | P2 | ⬜ Pending |

---

## 5. Non-Goals (Deferred)

- Full Shopify OS 2.0 theme editor activation (frozen in `dev/shopify-os2/`)
- WooCommerce Power Layer SMS automation (schema done, service integration deferred)
- Multi-region D1 read replicas (use `first-unconstrained` session for now)
- Remotion video engine integration

---

## 6. Definition of Done

### P0 — Must pass before next deploy (Week 1–2)
- [ ] `assertStoreOwnership` called in every `app.*` loader; integration test passes for cross-store `403`
- [ ] `assertPlanLimit` called in every create action for plan-limited resources; unit test at-limit returns `402`
- [ ] `requirePermission` called in every permission-sensitive loader/action; unit test missing-permission returns `403`
- [ ] Migration `0096_audit_actor_field.sql` applied to staging + prod; `SELECT COUNT(*) FROM activity_logs WHERE actor = ''` returns 0
- [ ] `logActivity` signature updated to require `actor`; all existing call-sites pass actor
- [ ] Sentry captures loader/action errors in production with `store_id` tag; test error visible in Sentry dashboard
- [ ] `npm run turbo:test` passes with no regressions after P0 changes

### P0.5 — Must pass before P1 begins (Week 3–4)
- [ ] `getStorefrontTemplateId`, `getLandingTemplateId`, `getBuilderTemplateId` helpers exist and unit-tested
- [ ] Changing `landing.templateId` does not mutate `theme.templateId` or `builder.previewTemplateId`
- [ ] All 9 storefront routes verified to use `getStorefrontTemplateId` only (no `landingConfig`/`buildTemplateFromThemeConfig`)
- [ ] `buildTemplateFromThemeConfig` removed from `lib/store.server.ts`; no remaining imports
- [ ] Integration test: storefront=`starter-store`, landing=`luxe-boutique`, builder=`daraz` — scopes render correctly
- [ ] Migration script dry-run and apply complete; KV cache invalidated

### P1 — Must pass before public launch (Week 5–8)

**P1-A Subscription**
- [ ] `computeSubscriptionStatus` unit test: store expired 4 days ago → `restricted`
- [ ] Billing cron deployed to staging; test store with `subscriptionEndDate = yesterday` transitions to `grace_period`
- [ ] KV cache invalidated for downgraded store (verify storefront reflects restriction within 60 s)
- [ ] Retention purge queries run in cron; D1 row counts verified before and after

**P1-B API Platform**
- [ ] Migration `0095_api_usage_daily.sql` applied; table exists with correct indexes
- [ ] `api-auth` middleware returns `401` for missing/invalid key, `403` for wrong scope
- [ ] Rate limiter returns `429` with `Retry-After` header under load test (>30 req/min per key)
- [ ] `api_usage_daily` increments on every successful API request (verified via D1 `SELECT`)
- [ ] Merchant usage chart visible in `app.api-keys.tsx` with accurate 30-day data

**P1-C Domains**
- [ ] `domain-provisioner` worker deployed; test domain provisioned end-to-end in staging
- [ ] SSL status polling updates `stores.sslStatus`; domain detail page reflects live status
- [ ] Queue retry logic verified: invalid hostname fails gracefully after 5 retries, `activity_logs` entry created

**P1-D Audit & Retention**
- [ ] `activity_logs` populated for: plan change, payment verified, team invite, member removed, role changed, settings saved, API key created/revoked
- [ ] Retention purge dry-run mode logs row counts without deleting; flip to live mode works

**P1-E Merchant Gaps**
- [ ] Fraud scorer flags synthetic high-risk COD order (score ≥ 70) in staging; badge shows on order list
- [ ] "Block" action inserts phone into `fraud_blacklist`; subsequent order from same phone raises score
- [ ] Courier analytics tab shows at least per-courier delivered/returned counts for test data
- [ ] Delivery webhook updates `delivery_status` + `delivered_at` correctly
- [ ] P&L report: revenue − COGS − shipping − refunds = correct net profit for a known test order set
- [ ] `cogs_snapshot` captured at order creation time; survives product price update
- [ ] `fireTrackingEvent('Purchase', ...)` calls both FB CAPI and GA4 MP in staging (confirm in provider debug tools)
- [ ] Tracking pipeline does not block checkout response (use `ctx.waitUntil`; verify response time < 500 ms)

### P2 — Post-launch polish (Week 7+)
- [ ] Checkout format toggle: single-page and multi-step both complete a full purchase in staging
- [ ] Multi-step checkout persists progress in `sessionStorage`; back button restores previous step
- [ ] `checkout_format_used` event fires via unified tracking pipeline
- [ ] Review submission rate-limited to 1 review per customer per product (duplicate returns `409`)
- [ ] Approved reviews display star aggregate on product page; pending reviews hidden from storefront
- [ ] Merchant moderation UI: approve/reject works; bulk actions work on ≥10 selected reviews
- [ ] `storefront_settings.reviews.enabled = false` (default) hides review form and list from storefront

### Always
- [ ] Zero `any` types introduced in new files
- [ ] `npm run turbo:test` passes with no regressions
- [ ] Every new DB migration is idempotent (`IF NOT EXISTS`, `IF NOT EXISTS` indexes)
- [ ] Every new server utility has at least one unit test covering the happy path and one error case
