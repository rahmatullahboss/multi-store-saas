# Legacy Settings Retirement Plan
**System**: Ozzyl Multi-Store SaaS  
**Author**: Architecture Team  
**Status**: ⛔ BLOCKED — Adversarial Review Found 5 Phase-3 Blockers  
**Last Updated**: 2026-02-26  
**Adversarial Review**: Completed 2026-02-26 — 16 issues found (5 Critical, 7 Warning, 4 Info)

---

## Executive Summary

The system has two overlapping settings systems. The unified system (`stores.storefront_settings`) is the canonical source of truth. Legacy columns (`theme_config`, `social_links`, `business_info`, `courier_settings`) and the `store_mvp_settings` table are deprecated. The `store_lead_gen_settings` table mentioned in the original request **does not exist in the codebase** — no action needed.

This plan retires all legacy paths in 4 phases over 3–4 weeks with zero data loss and a clear rollback path at each stage.

---

## Audit Results (Phase 1 Complete)

### Legacy Column Usage in `stores` Table

| Column | Drizzle field | Still read from DB? | Notes |
|---|---|---|---|
| `theme_config` | `themeConfig` | ✅ Yes — `store-config-do.server.ts:184` | Durable Object still SELECTs it |
| `social_links` | `socialLinks` | ✅ Yes — constructed from unified but prop name survives | Routes build local objects from unified, pass as `socialLinks` prop |
| `business_info` | `businessInfo` | ✅ Yes — same pattern | Built locally from unified, passed as `businessInfo` prop |
| `courier_settings` | `courierSettings` | ✅ Yes — `app.orders._index.tsx`, `courier-dispatch.server.ts` | Already reading from `unified.courier` — variable name collision only |
| `store_mvp_settings` table | — | ✅ Yes — schema defined, routes reference `mvpSettings` prop | Prop still threaded through `StorePageWrapper` |

### Safe to Remove Immediately (No Migration Needed)

These are **variable names / prop names** that shadow the old column names but are already sourced from unified settings. The legacy DB column is never read — only the local variable name is "legacy":

| File | Legacy-named construct | Reality |
|---|---|---|
| `routes/store.home.tsx:68–78` | `const socialLinks = {...}` / `const businessInfo = {...}` | Built from `unifiedSettings` — not DB column |
| `routes/cart.tsx:88–98` | Same pattern | Built from `unifiedSettings` |
| `routes/products._index.tsx:105` | `buildUnifiedSocialLinks(unifiedSettings)` | Already unified — just rename |
| `routes/categories.tsx:76,92` | `const businessInfo`, `const socialLinks` | Built locally, not from DB |
| `routes/pages.$slug.tsx:63–80` | `const socialLinks`, `const businessInfo`, `const themeConfig` | Built locally |
| `routes/account.tsx:56` | `const socialLinks` | Built locally |
| `routes/app.orders._index.tsx:308` | `const courierSettings = unified.courier` | Already from unified! Variable name only |
| `services/courier-dispatch.server.ts:54` | `const courierSettings = unified.courier` | Already from unified! |

### Requires Code Change (DB Column Still Read)

| File | Line(s) | Problem | Risk |
|---|---|---|---|
| `services/store-config-do.server.ts` | 184, 200, 224 | Still SELECTs `theme_config` from DB in raw SQL | **High** — only place that reads raw column |
| `services/mvp-settings.server.ts` | 220 | Migration helper references old `themeConfig` | Medium |
| `lib/theme-seeding.server.ts` | 457–485 | Writes to `themeConfig` column after seeding | **High** — actively writing legacy column |
| `lib/store.server.ts` | 260 | Fallback reads `themeConfig` for template resolution | Medium |
| `routes/api.e2e.seed.ts` | 76–87 | Seeds `businessInfo`, `socialLinks` directly into DB columns | Low — test only |
| `routes/api.marketplace.apply.ts` | 45,51 | Reads `themeConfig` from marketplace theme row | Medium |
| `packages/database/src/schema.ts` | 94,96,109,144 | Drizzle schema still defines all 4 columns | Blocks DB drop |

### Prop Threading (Rename-Only Work)

These files pass `socialLinks` / `businessInfo` / `mvpSettings` / `themeConfig` as component props. The **data source** is already unified, but the prop names persist. This is cosmetic cleanup — no data risk.

| File | Props to clean up |
|---|---|
| `routes/store.home.tsx` | `socialLinks`, `businessInfo`, `themeConfig` |
| `routes/products.$handle.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/products._index.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/cart.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/checkout.tsx` | `themeConfig` (already `null`) |
| `routes/_index.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/categories.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/pages.$slug.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/account.tsx` | `socialLinks`, `themeConfig` |
| `routes/store.auth.login.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/store.auth.register.tsx` | `themeConfig`, `socialLinks`, `businessInfo` |
| `routes/search.tsx` | `themeConfig` |
| `routes/$.tsx` | `themeConfig` |
| `components/StorePageWrapper.tsx` | `mvpSettings` prop |
| `components/store-templates/luxe-boutique/LiveHomepage.tsx` | `socialLinks`, `businessInfo` |
| `components/store-templates/zenith-rise/index.tsx` | `socialLinks`, `businessInfo` |
| `components/store-templates/shared/CartPage.tsx` | `mvpSettings` |
| `components/store-templates/starter-store/pages/CartPage.tsx` | `mvpSettings` |
| `components/store-templates/rovo/sections/CartDrawer.tsx` | `mvpSettings` |
| `templates/store-registry.ts` | `mvpSettings` param in `resolveTemplateFromSettings` |
| `components/ThemePreview.tsx` | `socialLinks`, `businessInfo` (mock data only — cosmetic) |

### Not in DB Schema (Confirmed Absent)

- `store_lead_gen_settings` — **does not exist** in schema or migrations. No action needed.

---

## Phase 1: Audit (Week 1) — Complete ✅

The audit above is the deliverable. Summary of findings:

- **1 service** actively SELECTs `theme_config` from DB: `store-config-do.server.ts`
- **1 service** actively WRITEs `theme_config` to DB: `lib/theme-seeding.server.ts`
- **1 route** actively WRITEs legacy columns: `routes/api.e2e.seed.ts` (test seeder)
- **20+ files** use legacy-named props/variables but are sourced from unified settings already
- **`store_mvp_settings`** table exists and is defined in schema — needs DROP migration
- **4 legacy columns** on `stores` table need to be dropped after code cleanup

---

## Phase 2: Code Cleanup (Weeks 1–2)

Work in this order to avoid breaking changes. Each sub-step is independently deployable.

### Step 2.1 — Stop Writing to `theme_config` (HIGH PRIORITY)

**File**: `apps/web/app/lib/theme-seeding.server.ts`, lines 457–485

**Remove** the entire `legacyThemeConfig` block:
```typescript
// DELETE lines 457–485:
// 4. Update legacy store config for compatibility with Editor/Live view
try {
  const legacyThemeConfig = { ... };
  await db.update(storesTable).set({
    themeConfig: JSON.stringify(legacyThemeConfig),  // ← REMOVE THIS WRITE
  })...
} catch (legacyError) {
  console.warn('Failed to sync legacy store config:', legacyError);
}
```

**Replace with**: Nothing. The unified write (`saveUnifiedStorefrontSettingsWithCacheInvalidation`) that already happens earlier in the same function is sufficient.

---

### Step 2.2 — Stop Reading `theme_config` from Raw SQL (HIGH PRIORITY)

**File**: `apps/web/app/services/store-config-do.server.ts`, lines 184–224

The raw SQL `SELECT` includes `theme_config`:
```sql
-- Line 184 — REMOVE theme_config from SELECT:
SELECT id, name, slug, logo, plan_type, usage_limits, is_active, theme_config,
       storefront_settings, ...
```

**Change to**:
```sql
SELECT id, name, slug, logo, plan_type, usage_limits, is_active,
       storefront_settings, ...
```

Remove the TypeScript type field on line 200:
```typescript
// DELETE:
theme_config: string | null;
```

Remove usage on line 224:
```typescript
// DELETE:
theme: result.theme_config ? JSON.parse(result.theme_config) : {},
// REPLACE WITH (read from storefront_settings):
theme: result.storefront_settings
  ? JSON.parse(result.storefront_settings)?.theme ?? {}
  : {},
```

---

### Step 2.3 — Fix Marketplace Apply Route (MEDIUM PRIORITY)

**File**: `apps/web/app/routes/api.marketplace.apply.ts`, lines 45–51

```typescript
// DELETE:
const themeConfig = theme[0].config;
// ...
themeConfig,

// REPLACE WITH: write the theme config into unified settings instead
await saveUnifiedStorefrontSettingsWithCacheInvalidation(db, storeId, {
  theme: { templateId: theme[0].id, ...theme[0].config },
}, env);
```

---

### Step 2.4 — Fix E2E Seed Route (LOW PRIORITY)

**File**: `apps/web/app/routes/api.e2e.seed.ts`, lines 72–87

```typescript
// DELETE these seed lines:
const themeConfig = JSON.stringify({ ... });
const businessInfo = JSON.stringify({ phone: '01712345678' });
const socialLinks = JSON.stringify({ whatsapp: '01712345678' });

// And remove from INSERT:
themeConfig,
businessInfo,
socialLinks,

// REPLACE WITH: after INSERT, call saveUnifiedStorefrontSettingsWithCacheInvalidation
// to write the same data into storefront_settings JSON
await saveUnifiedStorefrontSettingsWithCacheInvalidation(db, seededStoreId, {
  branding: { storeName: 'E2E Test Store' },
  social: { whatsapp: '01712345678' },
  business: { phone: '01712345678' },
}, env);
```

---

### Step 2.5 — Remove `mvpSettings` Prop Threading (MEDIUM PRIORITY)

The `mvpSettings` prop is passed through `StorePageWrapper` into cart/template components. It is used only for `shippingConfig`. This data lives in `unified.shipping` today.

**File**: `apps/web/app/components/store-layouts/StorePageWrapper.tsx`, line 75

```typescript
// DELETE from Props interface:
mvpSettings?: MVPSettingsWithTheme;

// DELETE from destructure (line 169) and all pass-throughs (lines 260, 271, 302, 314, 333, 348)
```

**File**: `apps/web/app/components/store-templates/shared/CartPage.tsx`, line 81

```typescript
// DELETE:
mvpSettings?: any;

// Line 251 — REPLACE:
const shippingConfig = mvpSettings?.shippingConfig;
// WITH (assuming unified settings already in scope via loader):
const shippingConfig = unifiedSettings?.shipping;
```

Apply same pattern to:
- `components/store-templates/starter-store/pages/CartPage.tsx:41,54,109`
- `components/store-templates/rovo/sections/CartDrawer.tsx:15,69`
- `components/store/rovo/RovoCartDrawer.tsx:15,69`
- `templates/store-registry.ts:485–522` — remove `mvpSettings` param, rely on unified settings passed from loader

---

### Step 2.6 — Remove `socialLinks` / `businessInfo` Prop Threading (CLEANUP)

All routes already build these from unified settings. The cleanup is: stop constructing the intermediate objects, stop passing them as props, and read from `unifiedSettings` directly inside components.

**Pattern for every affected route** (e.g., `store.home.tsx`):

```typescript
// DELETE (lines 68–78):
const socialLinks = {
  facebook: unifiedSettings.social?.facebook || null,
  instagram: unifiedSettings.social?.instagram || null,
  // ...
};
const businessInfo = {
  phone: unifiedSettings.business?.phone || null,
  // ...
};

// DELETE from json() return and component props:
socialLinks,
businessInfo,
```

**In affected template components** (e.g., `luxe-boutique/LiveHomepage.tsx`, `zenith-rise/index.tsx`):

```typescript
// DELETE props:
socialLinks,
businessInfo,

// REPLACE usage with direct unified settings access (passed from loader as `config` or `unifiedSettings`):
config?.social?.facebook
config?.business?.phone
```

Apply this to all 20 files listed in the prop threading table above.

---

### Step 2.7 — Clean Up `themeConfig` Prop Threading (CLEANUP)

Many routes return `themeConfig: null` already (confirmed in `checkout.tsx:296`, `store.home.tsx:63`, `products.$handle.tsx:248`). For routes that still build a local `themeConfig` object from unified settings and pass it down:

**Pattern** (e.g. `routes/categories.tsx:80`, `routes/pages.$slug.tsx:80`):

```typescript
// DELETE the local themeConfig construction
// DELETE themeConfig from json() return
// DELETE config={themeConfig} from JSX

// Components should read theme from the `theme` prop already passed via StorePageWrapper
```

Routes where `themeConfig` is already `null` in the loader but the variable still threads through the component — simply delete the variable and JSX prop.

The exception is `routes/p.$slug.tsx` (page builder preview) which builds CSS variables from `themeConfig.primaryColor`. This should be updated to read from `unifiedSettings.theme.primary` directly.

---

### Step 2.8 — Remove `store_mvp_settings` from Drizzle Schema (MEDIUM)

**File**: `packages/database/src/schema.ts`, line 3020

```typescript
// DELETE the entire store_mvp_settings table definition (~15 lines around line 3020)
export const storeMvpSettings = sqliteTable('store_mvp_settings', { ... });
```

Also remove from any `relations()` definitions that reference it.

---

### Step 2.9 — Remove Legacy Columns from Drizzle Schema (AFTER DB DROP)

Do this **after** the database migration in Phase 3:

**File**: `packages/database/src/schema.ts`

```typescript
// DELETE from storesTable definition:
themeConfig: text('theme_config'),          // line 94
businessInfo: text('business_info'),         // line 96
socialLinks: text('social_links'),           // line 109
courierSettings: text('courier_settings'),   // line 144
```

---

### Step 2.10 — Remove `mvp-settings.server.ts` Migration Helper

**File**: `apps/web/app/services/mvp-settings.server.ts`

The function on line 220 (`Migrate from old themeConfig JSON to new MVP settings`) is a one-time migration helper. Once all stores have been migrated to unified settings (verifiable via a DB query — see Phase 4), delete this file entirely. Update any imports.

---

## Phase 3: Database Cleanup (Week 3)

> ⚠️ **Prerequisites**: All Phase 2 code changes must be deployed and verified in production before running any DROP statements.

### Step 3.1 — Verify No Active Reads Before Dropping

Run these queries against production D1 before dropping anything:

```sql
-- Check how many stores still have data only in legacy columns (not in storefront_settings)
SELECT COUNT(*) as legacy_only_stores
FROM stores
WHERE (theme_config IS NOT NULL OR social_links IS NOT NULL 
       OR business_info IS NOT NULL OR courier_settings IS NOT NULL)
  AND (storefront_settings IS NULL OR storefront_settings = '{}' OR storefront_settings = '');

-- Inspect a sample
SELECT id, name, 
  CASE WHEN theme_config IS NOT NULL THEN 'has_data' ELSE 'null' END as theme_config,
  CASE WHEN storefront_settings IS NOT NULL THEN 'has_data' ELSE 'null' END as storefront_settings
FROM stores
WHERE theme_config IS NOT NULL AND (storefront_settings IS NULL OR storefront_settings = '{}')
LIMIT 20;
```

If `legacy_only_stores > 0`, run the data migration script (Step 3.2) first.

---

### Step 3.2 — One-Time Data Migration (If Needed)

If any stores have data in legacy columns but not in `storefront_settings`, backfill them. Run via a D1 Worker script (not raw SQL, to use the existing `saveUnifiedStorefrontSettingsWithCacheInvalidation` logic):

```typescript
// scripts/migrate-legacy-to-unified.ts
// Run once via: wrangler d1 execute ozzyl-prod --file=...
// Or as a one-off Worker invocation

const legacyStores = await db
  .select()
  .from(storesTable)
  .where(
    and(
      or(
        isNotNull(storesTable.themeConfig),
        isNotNull(storesTable.socialLinks),
        isNotNull(storesTable.businessInfo),
        isNotNull(storesTable.courierSettings),
      ),
      or(
        isNull(storesTable.storefrontSettings),
        eq(storesTable.storefrontSettings, '{}'),
      ),
    )
  );

for (const store of legacyStores) {
  const social = store.socialLinks ? JSON.parse(store.socialLinks) : {};
  const business = store.businessInfo ? JSON.parse(store.businessInfo) : {};
  const courier = store.courierSettings ? JSON.parse(store.courierSettings) : {};
  const theme = store.themeConfig ? JSON.parse(store.themeConfig) : {};

  await saveUnifiedStorefrontSettingsWithCacheInvalidation(db, store.id, {
    social,
    business,
    courier,
    theme: { templateId: theme.storeTemplateId, ...theme },
  }, env);

  console.log(`Migrated store ${store.id} (${store.name})`);
}
```

---

### Step 3.3 — Backup Legacy Column Data Before DROP

D1 does not support `RENAME COLUMN` natively, so back up to a separate table first:

```sql
-- Create backup table (run BEFORE any DROP)
CREATE TABLE IF NOT EXISTS _legacy_settings_backup AS
SELECT 
  id AS store_id,
  theme_config,
  social_links,
  business_info,
  courier_settings,
  CURRENT_TIMESTAMP AS backed_up_at
FROM stores
WHERE theme_config IS NOT NULL 
   OR social_links IS NOT NULL 
   OR business_info IS NOT NULL 
   OR courier_settings IS NOT NULL;

-- Verify backup row count matches
SELECT COUNT(*) FROM _legacy_settings_backup;
SELECT COUNT(*) FROM stores 
WHERE theme_config IS NOT NULL 
   OR social_links IS NOT NULL 
   OR business_info IS NOT NULL 
   OR courier_settings IS NOT NULL;
```

---

### Step 3.4 — Migration File to Drop Legacy Columns

Create: `packages/database/src/migrations/0085_drop_legacy_settings_columns.sql`

```sql
-- Migration: Drop legacy settings columns from stores table
-- Prerequisites:
--   1. _legacy_settings_backup table created (Step 3.3)
--   2. All Phase 2 code deployed and verified
--   3. No legacy_only_stores from verification query (Step 3.1)
-- Rollback: See ROLLBACK section below
--
-- D1 does not support DROP COLUMN on tables with dependencies.
-- Strategy: recreate table without legacy columns.

-- Step A: Rename current table
ALTER TABLE stores RENAME TO stores_old;

-- Step B: Create new stores table WITHOUT legacy columns
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  -- ... (copy ALL other columns EXCEPT theme_config, social_links, business_info, courier_settings)
  storefront_settings TEXT,
  -- ... rest of columns
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step C: Copy data (all columns except the 4 legacy ones)
INSERT INTO stores SELECT
  id, user_id, name, slug, logo,
  -- ... all non-legacy columns
  storefront_settings
  -- ... rest of non-legacy columns
FROM stores_old;

-- Step D: Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
-- ... other indexes

-- Step E: Drop old table (POINT OF NO RETURN — only after verifying Step C)
-- Run this separately after verifying the new table is correct:
-- DROP TABLE stores_old;

-- Step F: Drop store_mvp_settings table
DROP TABLE IF EXISTS store_mvp_settings;
```

> ⚠️ **Important**: In D1/SQLite, split Step C verification and Step E (`DROP TABLE stores_old`) into separate executions. Keep `stores_old` for 72 hours post-migration as a live safety net.

---

### Step 3.5 — Rollback Plan

**If rollback is needed within 72 hours** (while `stores_old` exists):

```sql
-- 1. Rename new table out of the way
ALTER TABLE stores RENAME TO stores_new_failed;

-- 2. Restore original
ALTER TABLE stores_old RENAME TO stores;

-- 3. Rollback code deployment (Cloudflare Pages: revert to previous deployment)
```

**If rollback needed after `stores_old` is dropped** (use backup table):

```sql
-- Restore legacy columns from backup (adds them back as nullable)
ALTER TABLE stores ADD COLUMN theme_config TEXT;
ALTER TABLE stores ADD COLUMN social_links TEXT;
ALTER TABLE stores ADD COLUMN business_info TEXT;
ALTER TABLE stores ADD COLUMN courier_settings TEXT;

-- Backfill from backup
UPDATE stores
SET 
  theme_config = b.theme_config,
  social_links = b.social_links,
  business_info = b.business_info,
  courier_settings = b.courier_settings
FROM _legacy_settings_backup b
WHERE stores.id = b.store_id;
```

Keep `_legacy_settings_backup` for **30 days** minimum after the DROP, then drop it.

---

## Phase 4: Verification (Weeks 3–4)

### Pre-Deployment Checklist

Before each Phase 2 PR merges:

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run turbo:lint` passes
- [ ] `npm run turbo:test` passes
- [ ] Every removed prop has been removed from the TypeScript interface **and** the JSX call site
- [ ] No `themeConfig`, `socialLinks`, `businessInfo`, `mvpSettings` remain in route `json()` returns (except preview/template routes which use mock data)
- [ ] `grep -rn 'themeConfig.*:.*null' apps/web/app/routes` returns zero results

### Post-Deployment Test Checklist

Run against production after each phase:

**Storefront pages** (test with 3 different store slugs — one per active theme):
- [ ] `https://{store-slug}.ozzyl.com/` — homepage loads, hero, announcement bar, footer social links visible
- [ ] `https://{store-slug}.ozzyl.com/products/{handle}` — product page loads, footer contact info visible
- [ ] `https://{store-slug}.ozzyl.com/products` — collection page loads
- [ ] `https://{store-slug}.ozzyl.com/cart` — cart loads, shipping config correct
- [ ] `https://{store-slug}.ozzyl.com/checkout` — checkout loads, shipping options correct
- [ ] `https://{store-slug}.ozzyl.com/pages/{slug}` — custom page loads
- [ ] `https://{store-slug}.ozzyl.com/categories` — categories page loads
- [ ] WhatsApp floating button appears if configured

**Admin routes**:
- [ ] `/app/settings` — settings page loads and saves
- [ ] `/app/orders` — orders page loads, courier dispatch works
- [ ] `/app/new-builder/{pageId}` — page builder loads

**After Phase 3 DB migration only**:
- [ ] Run the verification query: `SELECT COUNT(*) FROM stores WHERE theme_config IS NOT NULL` — must return 0 (column gone)
- [ ] Run `SELECT COUNT(*) FROM store_mvp_settings` — must fail with "no such table"

### Monitoring Plan

**Immediately after each Phase 2 deployment** (30 minutes):

```bash
# Watch for errors related to missing settings data
wrangler tail --format=pretty | grep -E 'socialLinks|businessInfo|themeConfig|mvpSettings|Cannot read properties of null'
```

**KPIs to watch in Cloudflare Dashboard for 48h post-deploy**:
- Worker error rate — should not increase by >0.1%
- P95 response time — should not increase
- 5xx rate on storefront routes — must stay at baseline

**Alerting**: Set a Cloudflare Alert for any route returning 5xx more than 10 times in 5 minutes on:
- `store.home.*`
- `products.*`
- `cart`
- `checkout`

### Final Cleanup Query (Run Week 4)

After 30 days of stable production operation:

```sql
-- Confirm everything is clean
SELECT 
  (SELECT COUNT(*) FROM _legacy_settings_backup) AS backup_rows,
  (SELECT COUNT(*) FROM stores WHERE storefront_settings IS NULL OR storefront_settings = '{}') AS stores_without_unified;

-- If stores_without_unified = 0, drop the backup table
DROP TABLE _legacy_settings_backup;
```

---

## File-by-File Priority Summary

| Priority | File | Action |
|---|---|---|
| 🔴 HIGH | `lib/theme-seeding.server.ts:457–485` | Remove legacy write block |
| 🔴 HIGH | `services/store-config-do.server.ts:184–224` | Remove `theme_config` from SELECT |
| 🟠 MEDIUM | `routes/api.marketplace.apply.ts:45–51` | Write to unified instead |
| 🟠 MEDIUM | `services/mvp-settings.server.ts` | Delete file after migration |
| 🟠 MEDIUM | `components/store-layouts/StorePageWrapper.tsx` | Remove `mvpSettings` prop |
| 🟡 LOW | `routes/api.e2e.seed.ts:72–87` | Seed via unified settings |
| 🟡 LOW | 20 route/component files | Remove prop threading (rename-only) |
| 🟡 LOW | `packages/database/src/schema.ts` | Remove 4 columns + table definition |

---

## What NOT to Touch

- `services/courier-dispatch.server.ts` — already reads from `unified.courier`. The variable name `courierSettings` is fine; it's not reading the DB column.
- `routes/app.orders._index.tsx` — same: `const courierSettings = unified.courier` is correct.
- `utils/i18n/*/dashboard.ts` — i18n keys like `courierSettings`, `businessInformation` are UI label strings, not data access. Leave them.
- `store-template-preview.*` routes — use `DEMO_SOCIAL_LINKS` / `DEMO_BUSINESS_INFO` mock constants for preview only. These are fine to keep as-is.
- `lib/theme-engine-types.ts` — exports type aliases for backward compat. Remove only after all consumers are cleaned up.

---

## Timeline

| Week | Work |
|---|---|
| Week 1 (Days 1–3) | Steps 2.1 + 2.2 (stop writes, stop raw SQL reads) — deploy independently |
| Week 1 (Days 4–5) | Steps 2.3 + 2.4 (marketplace + e2e seed) |
| Week 2 (Days 1–3) | Steps 2.5 + 2.6 (prop threading cleanup — mvpSettings, socialLinks, businessInfo) |
| Week 2 (Days 4–5) | Steps 2.7 + 2.8 + 2.9 (themeConfig props + schema) |
| Week 3 (Days 1–2) | Run Step 3.1 verification query, run Step 3.2 data migration if needed |
| Week 3 (Days 3–4) | Step 3.3 backup, Step 3.4 migration (keep `stores_old` for 72h) |
| Week 3 (Day 5) | Drop `stores_old` after 72h verification |
| Week 4 | Step 4 monitoring, run final cleanup query, drop `_legacy_settings_backup` |

---

## ⛔ Adversarial Review Findings (2026-02-26)

**Verdict: DO NOT PROCEED TO PHASE 3. 5 blockers must be resolved first.**

### 🔴 Critical Issues (Block Phase 3)

#### Issue #1 — Audit Is Catastrophically Incomplete
- **Problem**: Plan lists 7 files. Actual codebase has 113+ files with legacy references outside `unified-storefront-settings.server.ts`. `lib/seo.server.ts`, `lib/auth.server.ts`, `lib/store.server.ts`, all 17 theme footer/header components are missing from the audit.
- **Fix**: Run full grep, fix ALL files, ensure `npm run typecheck` passes clean before Phase 3.

#### Issue #2 — `JSON_PATCH` Does Not Exist in D1/SQLite
- **Problem**: Step 3.2 uses `JSON_PATCH()` which doesn't exist in SQLite/D1. Will fail with parse error, causing data loss for unmigrated stores.
- **Fix**: Replace with `json_set()`:
```sql
UPDATE stores
SET storefront_settings = json_set(
  COALESCE(storefront_settings, '{}'),
  '$.theme.templateId', json_extract(theme_config, '$.storeTemplateId'),
  '$.social.facebook', json_extract(social_links, '$.facebook'),
  '$.social.instagram', json_extract(social_links, '$.instagram'),
  '$.social.whatsapp', json_extract(social_links, '$.whatsapp'),
  '$.business.phone', json_extract(business_info, '$.phone'),
  '$.business.email', json_extract(business_info, '$.email'),
  '$.business.address', json_extract(business_info, '$.address')
)
WHERE (storefront_settings IS NULL OR storefront_settings = '{}')
  AND (theme_config IS NOT NULL OR social_links IS NOT NULL OR business_info IS NOT NULL);
```

#### Issue #3 — Partial Migration Guard Misses Partially-Populated Stores
- **Problem**: `storefront_settings = '{}'` check misses stores with `{"theme":{}}` or partially migrated stores. Their `social`, `business`, `courier` data silently dropped.
- **Fix**: Run per-section completeness checks:
```sql
-- Run for each section before dropping columns
SELECT id FROM stores
WHERE storefront_settings IS NOT NULL
  AND json_extract(storefront_settings, '$.social') IS NULL
  AND social_links IS NOT NULL;
```

#### Issue #4 — Durable Object Caches `theme_config` with No Invalidation
- **Problem**: `store-config-do.server.ts` caches `theme_config` in DO memory. After column drop, DO refresh queries will fail or serve stale data. The actual DO worker implementation was never audited.
- **Fix**: (a) Find actual DO class: `find apps/ -name '*.ts' | xargs grep -l "DurableObjectState"`, (b) Add `POST /invalidate-all` endpoint to DO, (c) Call it before Phase 3 DDL.

#### Issue #5 — `CREATE TABLE stores_new AS SELECT` Drops All PK/FK/Indexes
- **Problem**: Table recreation silently removes PRIMARY KEY, all FOREIGN KEY references (orders, products, customers etc.), and all indexes. Every storefront request starts with a store lookup — without indexes this is a full table scan.
- **Fix**: Use `ALTER TABLE stores DROP COLUMN` (supported in SQLite 3.35.0+ for simple TEXT columns with no FK/index). Test on D1 preview first:
```sql
-- Preferred atomic approach (no table recreation needed):
ALTER TABLE stores DROP COLUMN theme_config;
ALTER TABLE stores DROP COLUMN social_links;
ALTER TABLE stores DROP COLUMN business_info;
ALTER TABLE stores DROP COLUMN courier_settings;
DROP TABLE IF EXISTS store_mvp_settings;
```

---

### 🟡 Warning Issues

#### Issue #6 — Non-Atomic DDL Swap Risk
- If DROP+RENAME fails mid-flight, `stores` table disappears. No recovery path.
- **Fix**: Use `ALTER TABLE DROP COLUMN` instead (atomic per-column, no swap needed).

#### Issue #7 — Drizzle Journal vs Manual DDL Conflict
- Removing columns from `schema.ts` without a proper Drizzle migration will cause `drizzle-kit generate` to re-add them.
- **Fix**: Express column drops as a numbered Drizzle migration file (e.g., `0094_drop_legacy_columns.sql`).

#### Issue #8 — `store_mvp_settings` DROP TABLE Missing from Phase 3
- **Fix**: Add to Phase 3:
```sql
CREATE TABLE _mvp_settings_backup AS SELECT * FROM store_mvp_settings;
DROP TABLE IF EXISTS store_mvp_settings;
```

#### Issue #9 — KV Cache Key Format Inconsistency
- `store:{id}:config` and `store:config:{id}` are two different key formats for same data. Stale entries survive migration.
- **Fix**: Before Phase 3, purge all KV keys matching `store:*:config` pattern.

#### Issue #10 — `seo.server.ts` Reads Legacy Column via Unsafe Cast (Not in Audit)
- `lib/seo.server.ts:124` reads `socialLinks` via unsafe runtime cast on store object. Missing from Phase 2 steps.
- **Fix**: Update `seo.server.ts` to read from `unifiedSettings.social` parameter.

#### Issue #11 — Rollback Plan Cannot Reconstruct `stores` Table
- `_legacy_settings_backup` only contains 5 columns — cannot restore full table.
- **Fix**: `wrangler d1 export` full DB snapshot to R2 before Phase 3. Keep for 30 days minimum.

#### Issue #12 — Migration 0011 Is a No-Op That Claims Completion
- Comments in migration file say legacy columns are no longer read. This is false.
- **Fix**: Add honest comment. Update AGENTS.md to reflect actual state.

#### Issue #13 — Only 3 of 17 Themes Tested; TypeScript Breaks on 14 Others
- **Fix**: `npm run typecheck` must pass with zero errors after each Phase 2 step. This is the gate condition, not "test 3 store slugs."

---

### 🔵 Info Issues

#### Issue #14 — SQL Operator Precedence Bug in Step 3.2 WHERE Clause
```sql
-- WRONG (AND binds tighter than OR):
WHERE storefront_settings IS NULL OR storefront_settings = '{}' AND theme_config IS NOT NULL
-- CORRECT:
WHERE (storefront_settings IS NULL OR storefront_settings = '{}') AND theme_config IS NOT NULL
```

#### Issue #15 — Actual DO Worker Implementation Never Audited
- `store-config-do.server.ts` is only the client helper. The actual DO class (with `state.storage`) was not found or audited.

#### Issue #16 — Zero Soak Time Between Phase 2 and Phase 3
- **Fix**: Minimum 2-week soak after Phase 2 deploys. Monitor `wrangler tail` for any `theme_config`/`social_links`/`business_info` log mentions. Zero occurrences required before Phase 3.

---

## Revised Prerequisites Before Phase 3 Can Execute

- [ ] All 113+ legacy references audited and fixed
- [ ] `npm run typecheck` passes with zero errors
- [ ] `JSON_PATCH` replaced with `json_set()` in migration SQL
- [ ] Per-section completeness queries run and all stores migrated
- [ ] DO worker implementation found, audited, and updated
- [ ] `wrangler d1 export` snapshot taken and stored in R2
- [ ] `ALTER TABLE DROP COLUMN` approach validated on D1 preview DB
- [ ] Drizzle migration file created for column drops
- [ ] Minimum 2-week soak period completed post Phase 2
- [ ] `UNIFIED_SETTINGS_STRICT=true` set in production for soak period
