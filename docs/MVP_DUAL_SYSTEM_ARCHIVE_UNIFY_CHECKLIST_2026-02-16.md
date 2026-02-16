# MVP Dual-System Archive & Unify Checklist
Date: 2026-02-16
Purpose: MVP phase-এ duplicate/dual systems কমিয়ে single predictable path করা

---

## How to Use This File
1. Phase 1 শেষ না করে Phase 2-তে যেও না।
2. প্রতিটি item complete হলে checkbox tick করো।
3. প্রতিটি phase শেষে staging verification বাধ্যতামূলক।
4. কোনো legacy system immediate delete করবে না; first archive/freeze, later delete.

---

## Phase 1 (P1) - Must Fix Before MVP Hard Freeze

### 1) Theme management triple-path unify
- [ ] Active decision lock: MVP theme management = `app.store.settings.tsx` + unified settings service
- [ ] Freeze/archive candidate routes:
  - [ ] `apps/web/app/routes/app.theme._index.tsx`
  - [ ] `apps/web/app/routes/app.theme-store.tsx`
  - [ ] `apps/web/app/routes/app.store-design.tsx` (complex ThemeBridge edit flows)
- [ ] Ensure only 3 MVP themes are selectable (`luxe-boutique`, `nova-lux`, `starter-store`)
- [ ] Remove duplicate theme-selection UI entrypoints from merchant flow

Acceptance:
- [ ] Theme select/save একটাই path দিয়ে হয়
- [ ] Theme switch-এর পর home/products/product/collection-এ consistent store name + colors

### 2) Storefront read-path split remove
- [ ] Migrate these routes to unified read service:
  - [ ] `apps/web/app/routes/_index.tsx`
  - [ ] `apps/web/app/routes/categories.tsx`
  - [ ] `apps/web/app/routes/pages.$slug.tsx`
- [ ] Direct `themeConfig + getMVPSettings` merge logic route-level থেকে remove
- [ ] Use `getUnifiedStorefrontSettings` or `resolveUnifiedStorefrontSettings` only

Acceptance:
- [ ] `_data` parity pass:
  - [ ] `/?_data=routes/_index`
  - [ ] `/products?_data=routes/products._index`
  - [ ] `/products/1?_data=routes/products.$handle`
  - [ ] `/products/<collection>?_data=routes/products.$handle`
  - [ ] `/categories?_data=routes/categories`

### 3) Settings write-path duplication remove
- [ ] Canonical write service enforce (`saveUnifiedStorefrontSettingsWithCacheInvalidation`)
- [ ] Update routes to submit normalized patch only:
  - [ ] `apps/web/app/routes/app.settings._index.tsx`
  - [ ] `apps/web/app/routes/app.store.settings.tsx`
  - [ ] `apps/web/app/routes/app.store-design.tsx` (if kept partially)
- [ ] Block direct route-level writes to `stores.themeConfig` except temporary migration block

Acceptance:
- [ ] Name/logo/favicon/theme/colors একটাই write pipeline দিয়ে persist হয়
- [ ] After save, all storefront pages show same value

---

## Phase 2 (P2) - Stabilization and Risk Reduction

### 4) Cache dual system unify
- [ ] Centralize invalidation into one helper: `invalidateUnifiedSettingsCache()`
- [ ] Use helper after every settings write
- [ ] Reduce stale window during rollout: `store-config` TTL 300 -> 60 (or 30)
- [ ] Ensure D1 + KV + DO invalidation all run in one flow

Files to touch:
- `apps/web/app/services/store-config.server.ts`
- `apps/web/app/services/store-config-do.server.ts`
- route-level settings actions

Acceptance:
- [ ] Save -> refresh => new settings visible immediately on all critical pages
- [ ] 48h staging run without name/color mismatch incident

### 5) Landing builder dual architecture choose one
- [ ] Choose active MVP landing model:
  - [ ] Option A: JSON `landingConfig`
  - [ ] Option B: `builder_pages/builder_sections`
- [ ] Freeze/archive non-active one under `dev/future_improvements_multistore_saas`
- [ ] Stop new features in non-active landing system

Evidence locations:
- `packages/database/src/schema_page_builder.ts`
- `packages/database/src/schema.ts` (`landingConfig`)

Acceptance:
- [ ] Landing publish/read path single model
- [ ] Merchant UI থেকে একটাই landing editor entry থাকে

### 6) Preview routes standardize
- [ ] Pick one canonical preview route per active builder
- [ ] Archive/freeze extra preview routes:
  - `apps/web/app/routes/preview.$pageId.tsx`
  - `apps/web/app/routes/builder-preview.$pageId.tsx`
  - `apps/web/app/routes/app.page-builder_.preview.$pageId.tsx`
- [ ] Update all preview links/buttons to canonical route

Acceptance:
- [ ] Preview behavior identical across admin entrypoints
- [ ] No broken preview links in merchant UI

---

## Phase 3 (P3) - Guardrails and Cleanup

### 7) Legacy migration utilities hard-guard
- [ ] Admin-only + explicit permission check:
  - `apps/web/app/routes/api.admin.migrate-themes.ts`
- [ ] Keep seed script as manual runbook tool only:
  - `packages/database/src/seeds/migrate-theme-config.ts`
- [ ] Add clear warning docs: not for normal runtime use

Acceptance:
- [ ] Accidental invocation impossible in normal merchant flow

### 8) Intentional duals (keep as-is for now)
Do not merge now:
- `apps/web/app/routes/api.products.ts` (internal builder API)
- `apps/web/app/routes/api.v1.products.ts` (public API-key API)

Reason:
- Different audience/auth contract

---

## Global Quality Gates (Every Phase)

### Build and Types
- [ ] `npm run -w apps/web typecheck`
- [ ] `npm run -w apps/web build`

### Staging Deploy + Verification
- [ ] `npm run -w apps/web deploy:staging`
- [ ] Validate store consistency via `_data` endpoints
- [ ] Validate customer login header/account routes unaffected

### Regression Checks
- [ ] Home page brand + colors
- [ ] All products + category filters brand + colors
- [ ] Product detail page brand + colors
- [ ] Cart + checkout brand consistency
- [ ] Settings save propagation speed

---

## Archive Policy (Mandatory)
1. Release N: dual-write + fallback + archive snapshots
2. Release N+1: fallback traffic reduce (10% → 50% → 100%)
3. Release N+2: remove legacy read path, keep archive table only

No immediate hard delete before N+2.

---

## Linked Master Plan
For full architecture + migration detail:
- `docs/UNIFIED_STOREFRONT_SETTINGS_MIGRATION_PLAN_2026-02-16.md`

