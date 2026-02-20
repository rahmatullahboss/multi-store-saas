# Legacy Settings Removal Plan

> **Status:** 🔶 IN PROGRESS (~90% Complete)
>
> **Goal:** Fully remove `toLegacyFormat()`, `themeConfig`, and all legacy DB columns, leaving
> `storefront_settings` as the single source of truth everywhere.

## ✅ Migration Progress Summary

| Phase                          | Status      | Notes                                       |
| ------------------------------ | ----------- | ------------------------------------------- |
| Phase 0: Audit & Backfill      | ✅ Complete | All stores have storefront_settings         |
| Phase 1: Disable Fallback      | ✅ Complete | Code removed                                |
| Phase 2: Remove toLegacyFormat | ✅ Complete | 8 routes migrated                           |
| Phase 2b/2c: Route cleanup     | 🔶 ~90%     | Root, courier done; builder pending         |
| Phase 3: Components            | ✅ Complete | Props nullable                              |
| Phase 4: Delete bridge         | ✅ Complete | Core functions removed                      |
| Phase 5: DB columns            |             | Pending maintenance window 🔶 No-op created |
| Phase 6: Docs                  | ✅ Complete | Updated                                     |

### Remaining Issues (for future):

- `store-live-editor.server.ts`: Still reads/writes legacy `stores.themeConfig`
- Schema: Legacy columns still exist (theme_config, social_links, business_info, courier_settings)

---

## কেন এটা করবো? (Benefits)

### ⚡ Performance

- **KV/DB read কমবে** — প্রতি request এ legacy fallback চেক আর হবে না
- **`toLegacyFormat()` overhead দূর হবে** — প্রতি page load এ unnecessary object transformation বন্ধ
- **Smaller Worker bundle** — ~200 lines bridge code মুছে গেলে cold-start দ্রুত হবে

### 🧹 Codebase Simplicity

- **Single source of truth** — `storefront_settings` JSON ছাড়া কোনো settings পড়ার দরকার নেই
- **Type safety** — `UnifiedStorefrontSettingsV1` single type, legacy ThemeConfig/MVPSettings দরকার নেই

### 🐛 Bug Prevention

- **Theme mismatch bug দূর হবে** — cart/checkout এ wrong theme issue শেষ
- **Stale data impossible** — legacy vs unified sync issue শেষ

### 💾 Database

- **4টা column ড্রপ + 1টা table ড্রপ** — disk space সেভ, D1 query faster

---

## Phase 0 — Audit & Backfill

- [ ] Run this query to confirm ALL stores have `storefront_settings` populated:
  ```sql
  SELECT id, name, storefront_settings IS NULL as missing
  FROM stores WHERE storefront_settings IS NULL;
  ```
- [ ] If any store is missing → run explicit backfill script:
  ```bash
  curl -X POST https://your-worker/api/admin/migrate-storefront-settings?releaseTag=v2.0
  ```
  > ⚠️ **Do NOT rely on "visit the store" auto-backfill.** It requires `enableFallback=true` + `env` passed. Some callsites (e.g., `resolveShippingConfig` in `shipping.server.ts`) don't pass `env`, so strict mode defaults ON and fallback never fires.
- [x] Only proceed when **zero rows** returned

---

## Phase 1 — Disable Legacy Fallback

- [x] Set `UNIFIED_SETTINGS_STRICT=true`:
  ```bash
  npx wrangler secret put UNIFIED_SETTINGS_STRICT
  ```
- [x] Monitor production logs 24h for these patterns (skipped - code migration done first)
- [x] If no errors → proceed to Phase 2

---

## Phase 2 — Remove `toLegacyFormat()` Usage (Routes)

### Routes using `toLegacyFormat()` — 8 files:

| File                   | Status                                                    |
| ---------------------- | --------------------------------------------------------- |
| `cart.tsx`             | ✅ Done                                                   |
| `checkout.tsx`         | ✅ Done                                                   |
| `products.$handle.tsx` | ✅ Done                                                   |
| `products._index.tsx`  | ✅ Done                                                   |
| `store.home.tsx`       | ✅ Done                                                   |
| `search.tsx`           | ✅ Done                                                   |
| `store.auth.login.tsx` | ✅ Done                                                   |
| `debug-cart-theme.tsx` | 🗑️ Deleted                                                |
| `products.$handle.tsx` | `toLegacyFormat` → `unified.themeConfig`, `.mvpSettings`  |
| `products._index.tsx`  | `toLegacyFormat` → `unified.mvpSettings`                  |
| `store.home.tsx`       | `toLegacyFormat` → `unified.mvpSettings`, theme, layout   |
| `search.tsx`           | `toLegacyFormat` → `unified` for theme/layout             |
| `store.auth.login.tsx` | `toLegacyFormat` → `legacySettings.themeConfig`, `.theme` |
| `debug-cart-theme.tsx` | **DELETE entirely** (debug-only)                          |

### Migration pattern:

```typescript
// ❌ Old
const legacySettings = toLegacyFormat(unifiedSettings);

// ✅ New
const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
const baseTheme = getStoreTemplateTheme(storeTemplateId);
const theme = {
  ...baseTheme,
  primary: unifiedSettings.theme.primary || baseTheme.primary,
  accent: unifiedSettings.theme.accent || baseTheme.accent,
};
```

---

## Phase 2b — Remove Direct `theme_config` Column Reads (Routes)

| File                    | Legacy symbol                                   |
| ----------------------- | ----------------------------------------------- |
| `_index.tsx`            | `parseJsonSafe<ThemeConfig>(store.themeConfig)` |
| `categories.tsx`        | constructs `themeConfig` from store data        |
| `pages.$slug.tsx`       | builds `themeConfig` manually                   |
| `$.tsx`                 | constructs `themeConfig` from store             |
| `store-live-editor.tsx` | passes `themeConfig` to editor                  |

---

## Phase 2c — Remove Legacy Reads from Services, Libs & Admin Routes

> [!CAUTION]
> **These are the most critical dependencies.** If not migrated before Phase 5, column drops will cause runtime crashes.

### `theme_config` column readers:

| File                          | Legacy symbol                                                       |
| ----------------------------- | ------------------------------------------------------------------- |
| `root.tsx`                    | `parseThemeConfig(store.themeConfig)` → theme-color meta            |
| `auth.server.ts`              | SELECT `stores.themeConfig` column                                  |
| `store-config.server.ts`      | SELECT `themeConfig`, `socialLinks`, `businessInfo` → cached config |
| `store-live-editor.server.ts` | Heavy read/write of `store.themeConfig`                             |

### `courier_settings` column readers:

| File                       | Legacy symbol                                                  |
| -------------------------- | -------------------------------------------------------------- |
| `app.settings.courier.tsx` | `store.courierSettings` — full CRUD for courier setup          |
| `app.orders._index.tsx`    | `stores.courierSettings` — courier dispatch in bulk actions    |
| `app.orders.$id.tsx`       | `stores.courierSettings` — single order courier dispatch       |
| `api.courier.pathao.ts`    | `stores.courierSettings` → Pathao client init                  |
| `api.courier.redx.ts`      | `stores.courierSettings` → RedX client init                    |
| `api.courier.steadfast.ts` | `stores.courierSettings` → Steadfast client init (3 callsites) |
| `scheduler.server.ts`      | `stores.courierSettings` — cron shipment sync flow             |

### `business_info` column readers:

| File                                | Legacy symbol                                       |
| ----------------------------------- | --------------------------------------------------- |
| `app.settings.legal.tsx`            | `stores.businessInfo` → legal policy generation     |
| `api.generate-marketing-message.ts` | `stores.businessInfo` → AI marketing context        |
| `thank-you.$orderId.tsx`            | `stores.businessInfo` → thank you page contact info |
| `store-policy.server.ts`            | `store.businessInfo` → policy builder               |

### `social_links` column readers:

| File                        | Legacy symbol                                           |
| --------------------------- | ------------------------------------------------------- |
| `app.quick-builder.new.tsx` | `store.socialLinks` → WhatsApp number for quick builder |

### `shipping.server.ts` (env fix):

| File                 | Issue                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `shipping.server.ts` | `getUnifiedStorefrontSettings(db, storeId)` — missing `env` param, strict mode defaults ON |

---

## Phase 3 — Remove Legacy Props from Components

| Component                     | Change                                         |
| ----------------------------- | ---------------------------------------------- |
| `StorePageWrapper.tsx`        | Replace `ThemeConfig` typed props with unified |
| `UnifiedStoreLayout.tsx`      | Remove `TemplateHeader` old props              |
| `MobileBottomNav.tsx`         | Verify source is unified                       |
| All template `config` props   | Type → unified, not `ThemeConfig`              |
| Store template preview routes | Replace `DEMO_THEME_CONFIG` with unified demo  |

---

## Phase 4 — Delete Bridge Functions

✅ **COMPLETED** - Core bridge functions removed:

| Action                                                       | Status  |
| ------------------------------------------------------------ | ------- |
| Delete `toLegacyFormat()`                                    | ✅ Done |
| Delete fallback in `getUnifiedStorefrontSettings()`          | ✅ Done |
| Delete `migrateLegacyToUnified()` (kept for admin migration) | 🔶 Kept |
| Delete `getLegacySettings()` (kept for admin migration)      | 🔶 Kept |
| Delete `LegacySources` interface (kept for migration)        | 🔶 Kept |
| Delete `normalizeThemeConfig()`                              | ✅ Done |
| ✅ **KEEP** `getShippingConfigFromUnified()`                 | ✅ Done |

---

## Phase 5 — Drop Legacy DB Columns

> [!CAUTION]
> **D1/SQLite `ALTER TABLE DROP COLUMN` is not reliably supported in all environments.**
> See: `migrations/0076_remove_ai_plan.sql` — the project already has precedent for using **safe no-op migrations** when DROP COLUMN is risky.

### Status: No-op Migration Created

✅ **Migration file created:** `migrations/0011_mark_legacy_columns_deprecated.sql`

This migration marks the columns as deprecated but does NOT drop them. The actual DROP should happen during a controlled maintenance window.

### When to Drop

1. Run smoke tests on staging
2. During maintenance window:
   - Apply drops one by one
   - Test after each drop
   - Have rollback plan ready

### Commands (when ready):

```bash
# Apply no-op migration first
npx wrangler d1 execute ozzyl-prod --local --file=packages/database/src/migrations/0011_mark_legacy_columns_deprecated.sql
npx wrangler d1 execute ozzyl-prod --remote --file=packages/database/src/migrations/0011_mark_legacy_columns_deprecated.sql

# During maintenance window - DROP (one at a time!)
npx wrangler d1 execute ozzyl-prod --remote --command="ALTER TABLE stores DROP COLUMN theme_config;"
# Test thoroughly
npx wrangler d1 execute ozzyl-prod --remote --command="ALTER TABLE stores DROP COLUMN social_links;"
# Test thoroughly
npx wrangler d1 execute ozzyl-prod --remote --command="ALTER TABLE stores DROP COLUMN business_info;"
# Test thoroughly
npx wrangler d1 execute ozzyl-prod --remote --command="ALTER TABLE stores DROP COLUMN courier_settings;"
# Test thoroughly
# Then drop the table
npx wrangler d1 execute ozzyl-prod --remote --command="DROP TABLE IF EXISTS store_mvp_settings;"
```

```bash
npx wrangler d1 execute DB --local --file=migrations/XXXX_drop_theme_config.sql
# Smoke test: courier settings, orders, checkout, thank-you, legal pages
npx wrangler d1 execute DB --remote --file=migrations/XXXX_drop_theme_config.sql
```

---

## Phase 6 — Cleanup TypeScript Types & Docs

| Action                                   | File                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Remove `LegacySources` interface         | `unified-storefront-settings.server.ts`                                       |
| Remove legacy type fields                | `storefront-settings.schema.ts`                                               |
| Remove `ThemeConfig`, `parseThemeConfig` | `@db/types`                                                                   |
| Remove Drizzle schema columns            | `schema.ts` → `themeConfig`, `socialLinks`, `businessInfo`, `courierSettings` |
| Remove `store_mvp_settings` table def    | `schema.ts`                                                                   |
| Remove `getRawMVPSettings`               | `mvp-settings.server.ts`                                                      |
| Run `npm run turbo:typecheck`            | fix all errors                                                                |
| Update `GEMINI.md`                       | remove bridge strategy section                                                |
| Update `AGENTS.md`                       | remove `toLegacyFormat` references                                            |
| Update `DEVELOPMENT_ROADMAP.md`          | mark legacy removal complete                                                  |

---

## Verification Checklist (Pre-Phase-5 Smoke Tests)

Before dropping any column, verify these flows work without legacy reads:

- [ ] **Storefront:** Homepage, product page, collection, cart, checkout, thank-you
- [ ] **Courier:** Pathao/RedX/Steadfast dispatch from orders list and single order
- [ ] **Admin Settings:** Courier settings page, legal settings page
- [ ] **Builder:** Quick builder, live editor
- [ ] **Auth:** Customer login page
- [ ] **Marketing:** AI marketing message generation
- [ ] **Shipping:** Shipping calculation (verify `env` is passed)

---

## Cutover Gate Checklist (Go/No-Go)

Do not proceed to irreversible DB drops unless **all gates pass**.

### Gate 0 — Data Readiness

- [ ] `storefront_settings IS NULL` query returns **0 rows**
- [ ] Explicit backfill endpoint/script execution log saved

### Gate 1 — Strict Mode Stability

- [ ] `UNIFIED_SETTINGS_STRICT=true` enabled in target env
- [ ] 24h log window has no fallback/backfill warnings

### Gate 2 — Legacy Runtime Reads = Zero

Run these and ensure no runtime hits (docs/migrations excluded):

```bash
rg -n "toLegacyFormat\(" apps/web/app
rg -n "stores\.(themeConfig|socialLinks|businessInfo|courierSettings)" apps/web/app/{routes,services,lib}
rg -n "store\.(themeConfig|socialLinks|businessInfo|courierSettings)" apps/web/app/{routes,services,lib}
```

- [ ] All three checks return no blocking runtime usages

### Gate 3 — Build & Functional Safety

- [ ] `npm run turbo:typecheck` passes
- [ ] Smoke tests pass for storefront, checkout, thank-you, courier, legal, builders

### Gate 4 — Staging Dry Run

- [ ] Apply drop migrations one-by-one in staging
- [ ] Re-run smoke tests after each migration

### Gate 5 — Production Go/No-Go

- [ ] Maintenance window approved
- [ ] Pre-drop schema snapshot saved (`sqlite_master`)
- [ ] One-by-one production drop with verification after each step
- [ ] Rollback levers ready (`UNIFIED_SETTINGS_STRICT=false` + fast revert plan)

---

## Definition of Done

Legacy removal is complete only when all are true:

- [ ] Legacy grep checks are clean in runtime code
- [ ] Typecheck is green
- [ ] Smoke tests are green (staging + production post-cutover)
- [ ] Deprecated columns/table removed (or intentionally no-op deferred with ticket)
- [ ] Docs updated (`AGENTS.md`, `GEMINI.md`, roadmap)

---

## Rollback Plan

If anything breaks after Phase 1 or 2:

1. Set `UNIFIED_SETTINGS_STRICT=false` (immediate rollback)
2. Revert the specific route commit
3. DB columns intact until Phase 5

---

## Estimated Risk Per Phase

| Phase                                 | Risk                   | Time          |
| ------------------------------------- | ---------------------- | ------------- |
| 0 — Audit + Backfill                  | 🟢 None                | 30 min        |
| 1 — Strict Mode                       | 🟡 Low                 | 30 min        |
| 2 — Route cleanup (8 routes)          | 🟡 Medium              | 4-6 hrs       |
| 2b — Direct themeConfig routes        | 🟠 Medium              | 2-3 hrs       |
| 2c — Services/libs/admin routes       | 🔴 High                | 4-6 hrs       |
| 3 — Component cleanup                 | 🟠 Medium              | 3-5 hrs       |
| 4 — Delete bridge functions           | 🟠 Medium              | 1 hr          |
| 5 — Drop columns (maintenance window) | 🔴 High — irreversible | 1-2 hrs       |
| 6 — TypeScript + Docs cleanup         | 🟢 Low                 | 1-2 hrs       |
| **Total**                             |                        | **~3-4 days** |
