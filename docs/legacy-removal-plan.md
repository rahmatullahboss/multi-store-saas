# Legacy Settings Removal Plan

> **Goal:** Fully remove `toLegacyFormat()`, `themeConfig`, and all legacy DB columns, leaving
> `storefront_settings` as the single source of truth everywhere.

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
- [ ] Only proceed when **zero rows** returned

---

## Phase 1 — Disable Legacy Fallback

- [ ] Set `UNIFIED_SETTINGS_STRICT=true`:
  ```bash
  npx wrangler secret put UNIFIED_SETTINGS_STRICT
  ```
- [ ] Monitor production logs 24h for these patterns:
  - `Error reading unified settings, trying fallback:` (`unified-storefront-settings.server.ts` → `getUnifiedStorefrontSettings`)
  - `Failed to backfill unified settings:` (same file → auto-backfill catch block)
  - `legacyFallbackUsed: true` in any response payload
- [ ] If no errors → proceed to Phase 2

---

## Phase 2 — Remove `toLegacyFormat()` Usage (Routes)

### Routes using `toLegacyFormat()` — 8 files:

| File                   | Legacy symbol usage                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `cart.tsx`             | `toLegacyFormat` → `legacySettings.storeTemplateId`, `.themeConfig`, `.mvpSettings` |
| `checkout.tsx`         | `toLegacyFormat` → `legacySettings.themeConfig`                                     |
| `products.$handle.tsx` | `toLegacyFormat` → `unified.themeConfig`, `.mvpSettings`                            |
| `products._index.tsx`  | `toLegacyFormat` → `unified.mvpSettings`                                            |
| `store.home.tsx`       | `toLegacyFormat` → `unified.mvpSettings`, theme, layout                             |
| `search.tsx`           | `toLegacyFormat` → `unified` for theme/layout                                       |
| `store.auth.login.tsx` | `toLegacyFormat` → `legacySettings.themeConfig`, `.theme`                           |
| `debug-cart-theme.tsx` | **DELETE entirely** (debug-only)                                                    |

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

Once **all** routes, services, and components pass Phase 2/2b/2c/3:

| Action                                       | File                                    |
| -------------------------------------------- | --------------------------------------- |
| Delete `toLegacyFormat()`                    | `unified-storefront-settings.server.ts` |
| Delete `migrateLegacyToUnified()`            | same file                               |
| Delete `getLegacySettings()`                 | same file                               |
| Delete `LegacySources` interface             | same file                               |
| Delete `resolveTemplateId(legacy)`           | same file                               |
| Delete `normalizeThemeConfig()`              | `store-config.server.ts`                |
| Delete `parseThemeConfig` import             | `root.tsx`, `@db/types`                 |
| ✅ **KEEP** `getShippingConfigFromUnified()` | reads unified, NOT legacy               |

---

## Phase 5 — Drop Legacy DB Columns

> [!CAUTION]
> **D1/SQLite `ALTER TABLE DROP COLUMN` is not reliably supported in all environments.**
> See: `migrations/0076_remove_ai_plan.sql` — the project already has precedent for using **safe no-op migrations** when DROP COLUMN is risky.

### Recommended strategy: No-op → Maintenance Window Drop

**Step 1:** Create no-op placeholder migrations to keep the chain moving:

```sql
-- migrations/XXXX_noop_mark_legacy_deprecated.sql
-- Legacy columns (theme_config, social_links, business_info, courier_settings)
-- are no longer read by application code as of Phase 4.
-- Actual DROP will happen during controlled maintenance window.
SELECT 1;
```

**Step 2:** During a controlled maintenance window, run drops one by one:

```sql
-- Correct column names (snake_case, per Drizzle schema):
ALTER TABLE stores DROP COLUMN theme_config;
ALTER TABLE stores DROP COLUMN social_links;
ALTER TABLE stores DROP COLUMN business_info;
ALTER TABLE stores DROP COLUMN courier_settings;

-- mvpSettings is a separate TABLE, not a column:
DROP TABLE IF EXISTS store_mvp_settings;
```

**Step 3:** Verify after each drop:

```sql
SELECT sql FROM sqlite_master WHERE name='stores';
```

**Apply order:** local → test → staging → production:

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
