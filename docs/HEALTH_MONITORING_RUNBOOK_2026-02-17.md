# Health Monitoring Runbook — 2026-02-17

এই runbook production/staging health monitoring standardize করার জন্য।

## What Was Added

1. Monitoring endpoint: `GET /api/healthz`
2. Token-based auth:
   - `x-health-token: <token>`
   - or `Authorization: Bearer <token>`
   - or `?token=<token>`
3. Secret name: `HEALTH_CHECK_TOKEN`
4. Updated script: `apps/web/workers/health-check.sh`
   - primary domain + fallback domain aware
   - Cloudflare challenge-aware (false negative কমাতে)

## Security Model

- `HEALTH_CHECK_TOKEN` secret ছাড়া `/api/healthz` returns `503` (`disabled`)
- ভুল/না থাকা token হলে `401`
- token কখনো docs/repo-তে hardcode করা যাবে না

## Set/Rotate Token

### Production

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
openssl rand -hex 24 | npx wrangler secret put HEALTH_CHECK_TOKEN --env production
```

### Staging

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
openssl rand -hex 24 | npx wrangler secret put HEALTH_CHECK_TOKEN --env staging
```

## Post-Deploy Health Check

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas
HEALTH_CHECK_TOKEN='<token>' \
MAIN_APP_URL='https://app.ozzyl.com' \
MAIN_APP_FALLBACK_URL='https://multi-store-saas.rahmatullahzisan.workers.dev' \
bash apps/web/workers/health-check.sh --main
```

## Monitoring Integration (Recommended)

Use your uptime monitor against:

- `https://app.ozzyl.com/api/healthz`

with header:

- `x-health-token: <HEALTH_CHECK_TOKEN>`

If your monitor cannot send custom headers, use query token fallback:

- `https://app.ozzyl.com/api/healthz?token=<HEALTH_CHECK_TOKEN>`

## Troubleshooting

1. `403` + Cloudflare challenge page:
   - এটি সাধারণত edge challenge policy; service down না-ও হতে পারে
   - fallback domain check করুন
2. `404` on fallback workers.dev:
   - workers.dev route policy বা script context mismatch check করুন
3. `401`:
   - token mismatch বা secret rotate হয়েছে
4. `503 disabled`:
   - `HEALTH_CHECK_TOKEN` set করা নেই

