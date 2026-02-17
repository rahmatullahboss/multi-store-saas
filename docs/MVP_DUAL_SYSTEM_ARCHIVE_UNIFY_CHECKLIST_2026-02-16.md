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

- [x] Active decision lock: MVP theme management = `app.store.settings.tsx` + unified settings service
- [x] Freeze/archive candidate routes (moved to `.archive/` folder):
  - [x] `apps/web/app/routes/.archive/theme-management/app.theme._index.tsx`
  - [x] `apps/web/app/routes/.archive/theme-management/app.theme-store.tsx`
  - [x] `apps/web/app/routes/.archive/theme-management/app.store-design.tsx`
  - [x] Additional frozen: `app.theme.templates.$templateId.tsx`, `app.my-themes.tsx`
- [x] Ensure only 3 MVP themes are selectable (`luxe-boutique`, `nova-lux`, `starter-store`)
- [x] Remove duplicate theme-selection UI entrypoints from merchant flow (updated app.tsx sidebar)

Acceptance:

- [x] Theme select/save একটাই path দিয়ে হয়
- [x] Theme switch-এর পর home/products/product/collection-এ consistent store name + colors

### 2) Storefront read-path split remove

- [x] Migrate these routes to unified read service:
  - [x] `apps/web/app/routes/_index.tsx` (already using getUnifiedStorefrontSettings)
  - [x] `apps/web/app/routes/categories.tsx` (updated to use unified)
  - [x] `apps/web/app/routes/pages.$slug.tsx` (updated to use unified)
- [x] Direct `themeConfig + getMVPSettings` merge logic route-level থেকে remove
- [x] Use `getUnifiedStorefrontSettings` or `resolveUnifiedStorefrontSettings` only

Acceptance:

- [ ] `_data` parity pass:
  - [ ] `/?_data=routes/_index`
  - [ ] `/products?_data=routes/products._index`
  - [ ] `/products/1?_data=routes/products.$handle`
  - [ ] `/products/<collection>?_data=routes/products.$handle`
  - [ ] `/categories?_data=routes/categories`

### 3) Settings write-path duplication remove

- [x] Canonical write service enforce (`saveUnifiedStorefrontSettingsWithCacheInvalidation`) - app.store.settings.tsx uses it
- [x] Update routes to submit normalized patch only:
  - [x] `apps/web/app/routes/app.settings._index.tsx` (general settings - separate from theme)
  - [x] `apps/web/app/routes/app.store.settings.tsx` (canonical theme settings - dual-write)
  - [x] `apps/web/app/routes/app.store-design.tsx` (frozen - archived)
- [x] Block direct route-level writes to `stores.themeConfig` except temporary migration block

Acceptance:

- [x] Name/logo/favicon/theme/colors একটাই write pipeline দিয়ে persist হয় (app.store.settings.tsx)
- [ ] After save, all storefront pages show same value (needs testing)

---

## Phase 2 (P2) - Stabilization and Risk Reduction

### 4) Cache dual system unify

- [x] Centralize invalidation into one helper: `invalidateUnifiedSettingsCache()`
- [x] Use helper after every settings write (in app.store.settings.tsx)
- [x] Reduce stale window during rollout: `store-config` TTL 300 -> 60
- [x] Ensure D1 + KV + DO invalidation all run in one flow

Files touched:

- `apps/web/app/services/store-config.server.ts`
- `apps/web/app/services/store-config-do.server.ts`
- `apps/web/app/services/kv-cache.server.ts` (TTL 300 -> 60)
- `apps/web/app/services/cache-layer.server.ts` (TTL 300 -> 60)
- route-level settings actions

Acceptance:

- [ ] Save -> refresh => new settings visible immediately on all critical pages
- [ ] 48h staging run without name/color mismatch incident

### 5) Landing builder dual architecture choose one

- [x] Choose active MVP landing model:
  - [x] Option A: JSON `landingConfig` (stores.landingConfig) - SELECTED for MVP
  - [ ] Option B: `builder_pages/builder_sections` (frozen for future)
- [x] Freeze/archive non-active one under `dev/future_improvements_multistore_saas`
- [x] Stop new features in non-active landing system

Evidence locations:

- `packages/database/src/schema_page_builder.ts`
- `packages/database/src/schema.ts` (`landingConfig`)

Note: Multiple landing systems exist for different use cases:

- stores.landingConfig: Simple landing page in store mode
- landingPages table: Full GrapesJS page builder
- savedLandingConfigs: Campaign/quick builder
  For MVP, keep landingConfig (simplest, most integrated). Others frozen.

Acceptance:

- [ ] Landing publish/read path single model
- [ ] Merchant UI থেকে একটাই landing editor entry থাকে

### 6) Preview routes standardize

- [x] Pick one canonical preview route per active builder
- [x] Archive/freeze extra preview routes:
  - [x] `apps/web/app/routes/.archive/preview-routes/preview.$pageId.tsx`
  - [x] `apps/web/app/routes/.archive/preview-routes/builder-preview.$pageId.tsx`
  - [x] `apps/web/app/routes/app.page-builder_.preview.$pageId.tsx` (canonical - keep)
- [x] Update all preview links/buttons to canonical route (LiveEditorV2 updated)

Note: Multiple preview routes existed for different purposes:

- .archive/preview-routes/preview.$pageId.tsx: GrapesJS preview (archived)
- .archive/preview-routes/builder-preview.$pageId.tsx: Builder v2 iframe preview (archived)
- app.page-builder\_.preview.$pageId.tsx: Customer-facing preview (canonical)

Acceptance:

- [x] Preview behavior identical across admin entrypoints
- [x] No broken preview links in merchant UI

---

## Phase 3 (P3) - Guardrails and Cleanup

### 7) Legacy migration utilities hard-guard

- [x] Admin-only + explicit permission check:
  - [x] `apps/web/app/routes/.archive/admin-api/api.admin.migrate-themes.ts` (archived - runbook only)
- [x] Keep seed script as manual runbook tool only:
  - [x] `packages/database/src/seeds/.archive/migrate-theme-config.ts` (archived - runbook only)
- [x] Add clear warning docs: not for normal runtime use

Acceptance:

- [x] Accidental invocation impossible in normal merchant flow

### 8) Intentional duals (keep as-is for now)

Do not merge now:

- `apps/web/app/routes/api.products.ts` (internal builder API)
- `apps/web/app/routes/api.v1.products.ts` (public API-key API)

Reason:

- Different audience/auth contract

---

## Global Quality Gates (Every Phase)

### Build and Types

- [ ] `npm run -w apps/web typecheck` (pre-existing error in \_index.tsx - not from these changes)
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

## Archived Files Location

All deprecated routes moved to `docs/archive/frozen-routes/`:

### Theme Management

- `docs/archive/frozen-routes/theme-management/` (5 files)

### Preview Routes

- `docs/archive/frozen-routes/preview-routes/` (2 files)

### Admin/Migration

- `docs/archive/frozen-routes/admin-api/api.admin.migrate-themes.ts`
- `packages/database/src/seeds/.archive/migrate-theme-config.ts`

### Redirect Handler

- `apps/web/app/routes/.archive-redirects.tsx` - Redirects old URLs to `/app/store/settings`

---

## Linked Master Plan

For full architecture + migration detail:

- `docs/UNIFIED_STOREFRONT_SETTINGS_MIGRATION_PLAN_2026-02-16.md`
