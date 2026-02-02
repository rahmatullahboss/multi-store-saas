---
description: Production deployment workflow for Ozzyl
---

# Deploy Workflow

## ⚠️ Pre-Deployment Checklist

Before deploying, ALL must pass:

- [ ] Reviewed `.agent/skills/wrangler/SKILL.md`

```bash
cd apps/web

# 1. Type check
npm run typecheck
# Expected: No errors

# 2. Lint check
npm run lint
# Expected: No errors

# 3. Unit tests
npm run test
# Expected: All pass

# 4. E2E tests (if time permits)
npm run e2e
# Expected: All pass

# 5. Build
npm run build
# Expected: Successful build
```

## Phase 1: Database Migrations (If Needed)

### Check Pending Migrations

```bash
# List migration files
ls packages/database/src/migrations/
```

### Apply to Production

```bash
cd apps/web

# Apply migrations (one at a time, verify each)
wrangler d1 execute multi-store-saas-db --file=../../packages/database/src/migrations/XXXX_migration.sql

# Verify
wrangler d1 execute multi-store-saas-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### ⚠️ Migration Safety Rules

- [ ] Backup data before destructive migrations
- [ ] Test migration on local first
- [ ] Apply one migration at a time
- [ ] Verify data integrity after each

## Phase 2: Environment Variables

### Check Required Secrets in Cloudflare Dashboard

- [ ] `SESSION_SECRET` - Auth session encryption
- [ ] `RESEND_API_KEY` - Email service
- [ ] `OPENROUTER_API_KEY` - AI features
- [ ] `CLOUDFLARE_API_TOKEN` - SSL certificates
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth

### Update Variables (if needed)

```bash
# Via wrangler
wrangler secret put SECRET_NAME --name=multi-store-saas

# Or via Cloudflare Dashboard (recommended)
```

## Phase 3: Build & Deploy

### Main App (Cloudflare Pages)

```bash
cd apps/web

# Build
npm run build

# Deploy
npm run deploy
# OR
wrangler deploy --name=multi-store-saas
```

### Page Builder Worker (if changed)

```bash
cd apps/page-builder

# Build & Deploy
npm run deploy
# OR
wrangler deploy
```

## Phase 4: Post-Deployment Verification

### Smoke Tests

- [ ] Homepage loads: `https://ozzyl.com`
- [ ] Auth works: Login/Register flow
- [ ] Dashboard loads: `/app/dashboard`
- [ ] API responds: `/api/products`
- [ ] Store pages work: Check a live store

### Monitor Logs

```bash
# Watch production logs
wrangler tail --name=multi-store-saas
```

### Check Error Tracking

- [ ] Sentry dashboard for new errors
- [ ] Cloudflare Analytics for traffic

## Phase 5: Rollback (If Issues)

### Quick Rollback via Cloudflare Dashboard

1. Go to Cloudflare Workers & Pages > multi-store-saas
2. Deployments tab
3. Find previous working deployment
4. Click "Rollback to this deployment"

### Database Rollback

```bash
# D1 Time Travel (within 30 days)
wrangler d1 time-travel multi-store-saas-db --timestamp "2026-01-23T12:00:00Z"
```

## Deployment Checklist Summary

```markdown
## Deploy Checklist - [Date]

### Pre-Deploy

- [ ] `npm run typecheck` - Pass
- [ ] `npm run lint` - Pass
- [ ] `npm run test` - Pass
- [ ] `npm run build` - Success

### Deploy

- [ ] Migrations applied (if any)
- [ ] Secrets updated (if any)
- [ ] `npm run deploy` - Success

### Post-Deploy

- [ ] Homepage loads
- [ ] Auth flow works
- [ ] Dashboard accessible
- [ ] No new Sentry errors
- [ ] Logs clean

### Sign-off

Deployed by: [Name]
Time: [Timestamp]
Commit: [Hash]
```
