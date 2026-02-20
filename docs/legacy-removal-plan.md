# Legacy Settings Removal Plan

> **Goal:** Fully remove `toLegacyFormat()`, `themeConfig`, and all legacy DB columns, leaving
> `storefront_settings` as the single source of truth everywhere.

## কেন এটা করবো? (Benefits)

### ⚡ Performance

- **KV/DB read কমবে** — প্রতি request এ legacy fallback চেক (themeConfig, socialLinks, businessInfo, courierSettings) আর হবে না
- **`toLegacyFormat()` overhead দূর হবে** — প্রতি page load এ unnecessary object transformation বন্ধ
- **Smaller Worker bundle** — ~200 lines bridge code মুছে গেলে cold-start দ্রুত হবে

### 🧹 Codebase Simplicity

- **Single source of truth** — `storefront_settings` JSON ছাড়া কোনো settings পড়ার দরকার নেই
- **No more "which field do I read?"** — নতুন ডেভেলপার কনফিউজ হবে না
- **Type safety** — `UnifiedStorefrontSettingsV1` single type, legacy ThemeConfig/MVPSettings দরকার নেই

### 🐛 Bug Prevention

- **Theme mismatch bug দূর হবে** — সেই cart/checkout এ wrong theme দেখানো type issues আর হবে না
- **Stale data impossible** — legacy columns update হয়নি কিন্তু unified update হয়েছে, এই ধরনের sync issue শেষ
- **Testing সহজ** — mock করতে একটা object, পাঁচটা না

### 💾 Database

- **4টা column ড্রপ + 1টা table ড্রপ** — disk space সেভ, D1 query faster
- **Schema cleaner** — stores table থেকে JSON blob columns কমবে

---

## Phase 0 — Audit (Before touching code)

- [ ] Run this query to confirm ALL stores have `storefront_settings` populated:
  ```sql
  SELECT id, name, storefront_settings IS NULL as missing
  FROM stores
  WHERE storefront_settings IS NULL;
  ```
- [ ] If any store is missing data → run the explicit backfill script:
  ```bash
  # Use the migration endpoint (or create a one-off script)
  # Do NOT rely on "auto-backfill on visit" — it requires fallback enabled + env passed
  curl -X POST https://your-worker/api/admin/migrate-storefront-settings?releaseTag=v2.0
  ```
  > ⚠️ **Why not "visit the store"?** The auto-backfill in `getUnifiedStorefrontSettings()` only runs when `enableFallback=true`, which requires `env` to be passed AND `UNIFIED_SETTINGS_STRICT != "true"`. Some callsites (e.g., `shipping.server.ts`) don't pass `env`, so strict mode defaults ON and fallback never fires.
- [ ] Only proceed to Phase 1 when **zero rows** are returned from the audit query

---

## Phase 1 — Disable Legacy Fallback (Low Risk)

Turn on strict mode so `getUnifiedStorefrontSettings` no longer falls back to legacy sources.

- [ ] Set the `UNIFIED_SETTINGS_STRICT=true` secret in Cloudflare:
  ```bash
  npx wrangler secret put UNIFIED_SETTINGS_STRICT
  # Enter: true
  ```
- [ ] Monitor production logs for 24h — watch for these actual log patterns:
  - `Error reading unified settings, trying fallback:` (line 111 of `unified-storefront-settings.server.ts`)
  - `Failed to backfill unified settings:` (line 126)
  - `legacyFallbackUsed: true` in any response payload
- [ ] If no errors → proceed to Phase 2

---

## Phase 2 — Remove `toLegacyFormat()` Usage Route by Route

Each route currently calls `toLegacyFormat(unifiedSettings)` and uses the result.
Replace each with direct unified reads.

### Routes that use `toLegacyFormat()` (all need migration):

- [ ] `cart.tsx` — uses `legacySettings.storeTemplateId`, `legacySettings.themeConfig`, `legacySettings.mvpSettings`
- [ ] `checkout.tsx` — uses `legacySettings.themeConfig`, shipping config
- [ ] `products.$handle.tsx` — uses `unified.themeConfig`, `unified.mvpSettings`
- [ ] `products._index.tsx` — uses `unified.mvpSettings`, theme
- [ ] `store.home.tsx` — uses `unified.mvpSettings`, theme, full layout config
- [ ] `search.tsx` — uses `unified` for theme and layout
- [ ] `store.auth.login.tsx` — uses `legacySettings.themeConfig`, `legacySettings.theme`
- [ ] `debug-cart-theme.tsx` — **DELETE this route entirely** (debug-only)

### For each route, the pattern to apply:

```typescript
// ❌ Old (remove this)
const legacySettings = toLegacyFormat(unifiedSettings);
const theme = legacySettings.theme;
const storeTemplateId = legacySettings.storeTemplateId;

// ✅ New (use this)
const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
const baseTheme = getStoreTemplateTheme(storeTemplateId);
const theme = {
  ...baseTheme,
  primary: unifiedSettings.theme.primary || baseTheme.primary,
  accent: unifiedSettings.theme.accent || baseTheme.accent,
};
const storeName = unifiedSettings.branding.storeName;
const logo = unifiedSettings.branding.logo;
```

---

## Phase 2b — Remove Direct `themeConfig` Column Usage (Routes)

These routes don't use `toLegacyFormat()` but still read the legacy `store.themeConfig` column directly:

- [ ] `_index.tsx` — reads `store.themeConfig` from DB, parses as JSON
- [ ] `categories.tsx` — constructs themeConfig from store data
- [ ] `pages.$slug.tsx` — builds themeConfig manually
- [ ] `$.tsx` (catch-all) — constructs themeConfig from store
- [ ] `store-live-editor.tsx` — passes themeConfig to editor

---

## Phase 2c — Remove Legacy Reads from Core Services & Libs

These service/library files directly read legacy DB columns. If these are not updated before Phase 5, **column drops will cause runtime errors**.

- [ ] `root.tsx` (line 63) — reads `store.themeConfig` via `parseThemeConfig`; replace with unified theme or CSS vars
- [ ] `auth.server.ts` (line 84, 110) — SELECTs `stores.themeConfig` column; remove from query or use unified
- [ ] `store-config.server.ts` (line 71-77) — SELECTs `themeConfig`, `socialLinks`, `businessInfo` columns; migrate to unified reads
- [ ] `store-live-editor.server.ts` (line 121+) — heavily reads/writes `store.themeConfig`; needs full refactor to unified
- [ ] `api.courier.pathao.ts` (line 67) — reads `stores.courierSettings` column; migrate to `unifiedSettings.courier`
- [ ] `shipping.server.ts` (line 25) — calls `getUnifiedStorefrontSettings` without `env` parameter; add `env` for proper strict mode check

---

## Phase 3 — Remove `toLegacyFormat()` from Components

Some UI components still accept old-format props.

- [ ] `StorePageWrapper.tsx` — replace `ThemeConfig` typed props with unified equivalents
- [ ] `UnifiedStoreLayout.tsx` — remove `TemplateHeader` usage of old props
- [ ] `MobileBottomNav.tsx` — verify source is unified (not legacy)
- [ ] All template components' `config` prop — type should be unified, not `ThemeConfig`
- [ ] Store template preview routes — replace `DEMO_THEME_CONFIG` with unified demo config

---

## Phase 4 — Delete Bridge Functions

Once **all** routes, services, and components pass Phase 2/2b/2c/3:

- [ ] Delete `toLegacyFormat()` from `unified-storefront-settings.server.ts`
- [ ] Delete `migrateLegacyToUnified()` (internal function)
- [ ] Delete `getLegacySettings()` (internal function)
- [ ] Delete `LegacySources` interface
- [ ] Delete `resolveTemplateId(legacy)` helper
- [ ] Delete `normalizeThemeConfig()` from `store-config.server.ts`
- [ ] Delete `parseThemeConfig` import from `root.tsx` and `@db/types`
- [ ] ✅ **KEEP** `getShippingConfigFromUnified()` — this reads from unified, NOT legacy

---

## Phase 5 — Drop Legacy DB Columns

> [!CAUTION]
> The actual DB column names are **snake_case** (Drizzle maps camelCase to snake_case). Use the correct names in SQL.
> `mvpSettings` is NOT a column — it's a **separate table** (`store_mvp_settings`).

Create **separate** D1 migrations per column to avoid partial failure.

- [ ] Migration 1: `migrations/XXXX_drop_theme_config.sql`
  ```sql
  ALTER TABLE stores DROP COLUMN theme_config;
  ```
- [ ] Verify: `SELECT sql FROM sqlite_master WHERE name='stores';`
- [ ] Migration 2: `migrations/XXXX_drop_social_links.sql`
  ```sql
  ALTER TABLE stores DROP COLUMN social_links;
  ```
- [ ] Migration 3: `migrations/XXXX_drop_business_info.sql`
  ```sql
  ALTER TABLE stores DROP COLUMN business_info;
  ```
- [ ] Migration 4: `migrations/XXXX_drop_courier_settings.sql`
  ```sql
  ALTER TABLE stores DROP COLUMN courier_settings;
  ```
- [ ] Migration 5 (separate table): `migrations/XXXX_drop_store_mvp_settings.sql`
  ```sql
  DROP TABLE IF EXISTS store_mvp_settings;
  ```

**Apply order:** local first → test → production one by one:

```bash
npx wrangler d1 execute DB --local --file=migrations/XXXX_drop_theme_config.sql
# Test everything locally
npx wrangler d1 execute DB --remote --file=migrations/XXXX_drop_theme_config.sql
# Repeat for each column/table
```

---

## Phase 6 — Cleanup TypeScript Types & Docs

- [ ] Remove `LegacySources` interface from `unified-storefront-settings.server.ts`
- [ ] Remove legacy type fields from `storefront-settings.schema.ts` if any
- [ ] Update `@db/types` to remove `ThemeConfig`, `parseThemeConfig`
- [ ] Remove Drizzle schema columns for dropped DB columns (`themeConfig`, `socialLinks`, `businessInfo`, `courierSettings` from `schema.ts`)
- [ ] Remove `store_mvp_settings` table definition from `schema.ts`
- [ ] Remove `getRawMVPSettings` from `mvp-settings.server.ts`
- [ ] Run `npm run turbo:typecheck` — fix all errors
- [ ] Update `GEMINI.md` — remove bridge strategy section (no longer needed)
- [ ] Update `AGENTS.md` — remove `toLegacyFormat` references
- [ ] Update `DEVELOPMENT_ROADMAP.md` — mark legacy removal as complete

---

## Rollback Plan

If anything breaks after Phase 1 or 2:

1. Set `UNIFIED_SETTINGS_STRICT=false` (disables strict mode immediately)
2. Revert the specific route commit
3. The DB columns will still be intact since they are dropped last (Phase 5)

---

## Estimated Risk Per Phase

| Phase                          | Risk                   | Time            |
| ------------------------------ | ---------------------- | --------------- |
| 0 — Audit + Backfill           | 🟢 None                | 30 min          |
| 1 — Strict Mode                | 🟡 Low                 | 30 min          |
| 2 — Route cleanup (8 routes)   | 🟡 Medium              | 4-6 hrs         |
| 2b — Direct themeConfig routes | 🟠 Medium              | 2-3 hrs         |
| 2c — Core services/libs        | 🔴 High                | 3-4 hrs         |
| 3 — Component cleanup          | 🟠 Medium              | 3-5 hrs         |
| 4 — Delete bridge functions    | 🟠 Medium              | 1 hr            |
| 5 — Drop DB columns + table    | 🔴 High — irreversible | 1 hr            |
| 6 — TypeScript + Docs cleanup  | 🟢 Low                 | 1-2 hrs         |
| **Total**                      |                        | **~2.5-3 days** |
