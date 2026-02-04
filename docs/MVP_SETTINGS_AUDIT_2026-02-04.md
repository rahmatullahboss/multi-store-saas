# MVP Settings Audit - 2026-02-04

> Updated: **February 4, 2026**
> Scope: Admin settings that are saved vs. actually used in storefront/checkout.

## Summary
- All main settings routes persist data to DB (store-scoped).
- Most settings are wired into storefront or checkout.
- A few settings are admin-only or integration-dependent (require external setup or additional wiring).

## ✅ Functional + Used in Storefront/Checkout
- `app.settings._index.tsx` — Store name, logo, favicon, theme, social links, business info. Used by storefront layout/theme selection.
- `app.settings.homepage.tsx` — Store enable/disable + homepage config. Used in storefront routing and home render.
- `app.settings.navigation.tsx` — Header/footer navigation config. Used in theme layout.
- `app.settings.seo.tsx` — Meta title/desc/OG config. Used in `root.tsx` / landing meta.
- `app.settings.shipping.tsx` — Shipping zones/rates. Used in checkout and order pricing.
- `app.settings.payment.tsx` — Manual payment numbers/instructions. Used in checkout payment section.
- `app.settings.tracking.tsx` — FB Pixel + GA4. Injected via `root.tsx` and purchase events.
- `app.settings.discounts.tsx` — Discount codes. Used by discount service during checkout.
- `app.settings.order-bumps.tsx` — Order bump offers. Used in checkout/order flow.
- `app.settings.upsells.tsx` — Post‑purchase upsell offers. Used in upsell flow (`/upsell/:token`).
- `app.settings.landing.tsx` — Landing mode + landing config. Used by landing builder/landing page.
- `app.settings.legal.tsx` — Policy content. Used on storefront policy pages.
- `app.settings.domain.tsx` — Custom domain config. Used in host routing + store resolution.

## ⚠️ Functional but Integration‑Dependent
- `app.settings.courier.tsx` — Credentials saved. External courier API integration required for real dispatch.
- `app.settings.messaging.tsx` — WhatsApp/Messenger IDs saved. Requires bot/agent channel wiring in runtime.
- `app.settings.webhooks.tsx` — Webhooks saved. Requires external endpoints to receive.
- `app.settings.developer.tsx` — API keys/webhooks saved. Requires external usage.

## ℹ️ View‑Only / Admin‑Only
- `app.settings.activity.tsx` — Activity log view only.
- `app.settings.tsx` — Layout wrapper only (no persistence).

## QA Checklist (Minimal)
1. Update each setting and verify persisted values are visible on reload.
2. Verify storefront effects:
   - Theme + logo + footer config reflect immediately.
   - SEO meta changes visible in HTML source.
   - Shipping rates alter checkout total.
   - Payment instructions show updated numbers.
   - Tracking scripts present in page source when configured.
3. Integration checks:
   - Courier: ensure credentials are required and errors are surfaced.
   - Messaging: validate settings are read where the agent/embed is initialized.

