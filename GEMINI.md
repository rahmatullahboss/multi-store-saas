# GEMINI.md — Unified Storefront Settings Rules

Last Updated: 2026-02-18

## Core Rule

Use `stores.storefront_settings` (Unified V1 JSON) as the only canonical storefront settings source.

## Required APIs

- Read: `getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env })`
- Write: `saveUnifiedStorefrontSettingsWithCacheInvalidation(...)`
- Compatibility only: `toLegacyFormat(...)` for legacy component props during migration

## Strict Mode

- Production recommendation: set `UNIFIED_SETTINGS_STRICT=true`
- Command:

```bash
wrangler secret put UNIFIED_SETTINGS_STRICT
```

When strict mode is enabled (and env is passed), legacy fallback is disabled.

## Legacy Policy

These are fallback/migration sources only, not primary read/write targets for new features:

- `stores.themeConfig`
- `stores.socialLinks`
- `stores.businessInfo`
- `stores.courierSettings`

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
- If a legacy route/component still needs old props, convert from unified using `toLegacyFormat`.
