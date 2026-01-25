# Theme System Audit & Fixes

## Executive Summary
The audit revealed a synchronization issue between the legacy `themeConfig` system (used by the Editor) and the new `themes`/`templates` table structure (used by the Seeding logic). This caused new stores or newly installed themes to appear "broken" or empty in the editor. Additionally, the specific Template Builder UI was missing its preview iframe.

**Status:** ✅ All Critical Issues Fixed

## Focus Areas & Findings

### 1. Template Selection & Installation Flow
- **Issue:** The Theme Store (`app.theme-store.tsx`) was only updating the legacy `stores.themeConfig` and `storeThemes` table. It was **ignoring** the new Shopify-like `themes`, `themeTemplates`, and `templateSections` tables required by the advanced builder.
- **Fix:** Updated the installation action to call `installThemePreset` (or `installCustomThemePreset` for legacy templates). This ensures a robust seeding of all necessary database tables upon theme installation.

### 2. Template Preview Functionality
- **Theme Store Preview:** `store-template-preview.$templateId.tsx` works correctly, using mock data to render template components.
- **Template Builder Preview:** The advanced builder route (`app.theme.templates.$templateId.tsx`) had a **missing iframe**. It displayed a placeholder div instead of the live preview.
- **Fix:** Restored the `<iframe>` element pointing to `/template-preview/$id`, enabling live visual editing in the advanced builder.

### 3. Store Setup/Seeding
- **Issue:** The `seedDefaultTheme` function correctly populated the new tables (`themes`, `templateSections`) but **failed to update** `stores.themeConfig`. Since the main Editor reads from `stores.themeConfig` on load, it would show a default/empty state even after successful seeding.
- **Fix:** Updated `seedDefaultTheme` in `theme-seeding.server.ts` to construct a compatible `ThemeConfig` JSON and sync it to `stores.themeConfig`. This bridges the gap between the backend seeding and the frontend editor.

### 4. Theme Editor
- **Architecture:** The editor (`store-live-editor.server.ts`) reads from `stores.themeConfig` but writes to *both* systems (Legacy + New).
- **Status:** With the seeding fix (Area 3), the editor now loads the correct initial state. No changes were needed in the editor logic itself, as the data supply chain was the root cause.

## Files Modified
1.  `apps/web/app/lib/theme-seeding.server.ts` - Added legacy sync logic & exported helper functions.
2.  `apps/web/app/lib/theme-presets.ts` - Added `createPresetFromStoreTemplate` helper.
3.  `apps/web/app/routes/app.theme-store.tsx` - Integrated full theme seeding on install.
4.  `apps/web/app/routes/app.theme.templates.$templateId.tsx` - Fixed missing preview iframe.

## Verification
- **New Store:** Will now have populated `themes` tables AND a valid `themeConfig`.
- **Install Theme:** Will correctly wipe old themes, seed new tables, and update `themeConfig`.
- **Editor:** Will correctly load the installed theme.
- **Builder:** Will correctly show the live preview.
