# GEMINI.md — Unified Storefront Settings Rules

Last Updated: 2026-02-18

## Core Rule

Use `stores.storefront_settings` (Unified V1 JSON) as the only canonical storefront settings source.

## Required APIs

- Read: `getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env })`
- Write: `saveUnifiedStorefrontSettingsWithCacheInvalidation(...)`
- **Legacy bridge REMOVED**: `toLegacyFormat(...)` has been deleted - use unified settings directly

## Strict Mode

- Production recommendation: set `UNIFIED_SETTINGS_STRICT=true`
- Command:

```bash
wrangler secret put UNIFIED_SETTINGS_STRICT
```

When strict mode is enabled (and env is passed), legacy fallback is disabled.

## Legacy Policy

These columns are deprecated but still exist in DB:

- `stores.themeConfig`
- `stores.socialLinks`
- `stores.businessInfo`
- `stores.courierSettings`
- `store_mvp_settings` table

## Unified Coverage

The unified schema must cover and drive:

- Theme and branding
- Business/contact and social links
- SEO
- Shipping/delivery charge and free-shipping rules
- Checkout settings
- Floating WhatsApp/call/chat widget settings
- Courier provider credentials/config

## Implementation Guardrails

- Always pass `env` when calling unified read APIs.
- Do not introduce new direct writes to legacy settings columns.

## Migration Complete (Feb 2026)

The legacy bridge `toLegacyFormat()` has been **removed**. All routes now use unified settings directly:

```typescript
// NEW PATTERN (required)
const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });

// Build theme from unified settings
const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
const baseTheme = getStoreTemplateTheme(storeTemplateId);
const theme = {
  ...baseTheme,
  primary: unifiedSettings.theme.primary || baseTheme.primary,
  accent: unifiedSettings.theme.accent || baseTheme.accent,
};

// Pass to components
<StorePageWrapper
  storeName={unifiedSettings.branding.storeName}
  templateId={storeTemplateId}
  theme={theme}
  config={null} // No longer needed
>
```

### 🚨 Strict Rules (Updated)

1. **NEVER** read from legacy columns directly (themeConfig, businessInfo, etc.)
2. **ALWAYS** use `getUnifiedStorefrontSettings()` for reading
3. **USE** `saveUnifiedStorefrontSettingsWithCacheInvalidation()` for writing
