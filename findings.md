# Findings

## 🚨 Critical: Google Auth 404 Diagnosis

**Status:** Diagnosed
**Issue:** Google Auth Callback returns 404 on `ozzyl.com`.
**Root Cause:** The domain `ozzyl.com` is currently pointing to a **Vercel** deployment (Legacy/Old App), not the new Cloudflare Pages application.

- `apps/web` (Cloudflare) has the correct route: `/store/auth/google/callback`.
- `ozzyl.com` (Vercel) does NOT have this route, returning a Next.js 404.

**Proof:**

- `curl -I https://ozzyl.com/store/auth/google/callback` -> Returns **404** (Vercel Headers: `x-vercel-cache: HIT`).
- `curl -I https://multi-store-saas.pages.dev/store/auth/google/callback` -> Returns **302 Redirect** (Works Correctly).

**Action Required:**
Update DNS settings for `ozzyl.com` to point to the new Cloudflare Pages project.

## Relevant Code

- `apps/web/app/routes/store.auth.google.callback.ts`: Correctly implemented callback route.
- `apps/web/server/middleware/tenant.ts`: Correctly allows auth routes to bypass store lookup.
- `apps/web/wrangler.toml`: `SAAS_DOMAIN` is set to "ozzyl.com".

## Documentation

- User requested: "Header position seems correct, but use white background instead of transparent."

## Decisions

- [x] Fix: Updated `StarterStoreHeader` to usage fixed positioning (overlay) but with a **solid white background**.
- [x] Fix: Resolved `Cannot read properties of undefined (reading 'typography')` by adding `nova-lux-ultra` to `TEMPLATE_ENHANCEMENTS` in `theme-config-converter.ts`.
