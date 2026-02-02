# Architecture Decision: Centralized Authentication Domain

## Problem

The current setup uses a split-hosting architecture:

- `ozzyl.com` (Main Domain) -> Hosted on **Vercel** (Landing Page).
- `app.ozzyl.com` (Admin) -> Hosted on **Cloudflare** (SaaS App).
- `*.ozzyl.com` (Stores) -> Hosted on **Cloudflare** (SaaS App).

The Google OAuth callback is currently configured as `https://ozzyl.com/store/auth/google/callback`.
**Issue:** Google redirects the user to `ozzyl.com` (Vercel), which does not have the auth logic, resulting in a **404 Not Found**.

## Solution Options

### Option 1: Use `app.ozzyl.com` for Auth (Recommended)

Configure the application to use `app.ozzyl.com` as the canonical domain for authentication callbacks.

- **Callback URL:** `https://app.ozzyl.com/store/auth/google/callback`
- **Session Cookie:** Must be set with `Domain=.ozzyl.com` so it is shared across `app.ozzyl.com` and `store.ozzyl.com`.
- **Pros:** No changes needed on Vercel. Works purely within Cloudflare.
- **Cons:** Requires updating Google Cloud Console Authorized Redirect URIs.

### Option 2: Vercel Rewrite (Proxy)

Configure Vercel (`next.config.js`) to rewrite specific paths to Cloudflare.

- **Rule:** `/store/auth/*` -> `https://multi-store-saas.pages.dev/store/auth/*`
- **Pros:** Keeps `ozzyl.com` as the visible URL.
- **Cons:** Adds latency (double hop). Requires maintaining Vercel config.

## Implementation Plan (Option 1)

1. **Update Environment Variable:**
   Change `SAAS_DOMAIN` in `wrangler.toml` (or add a specific `AUTH_DOMAIN` variable) to point to the Cloudflare-hosted domain.
   _Currently `SAAS_DOMAIN="ozzyl.com"`. We might need to keep this for subdomain parsing logic, so adding `AUTH_DOMAIN` is safer._

2. **Update Code (`store.auth.google.ts`):**
   Use `AUTH_DOMAIN` (defaulting to `app.ozzyl.com` or `SAAS_DOMAIN`) for constructing the `callbackUrl`.

3. **Update Google Cloud Console:**
   Add `https://app.ozzyl.com/store/auth/google/callback` to the list of authorized redirect URIs.

## Current Recommendation

Proceed with **Option 1** as it is more robust and decouples the app logic from the marketing site's hosting provider.
