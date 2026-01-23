---
description: Deploy to Cloudflare Pages/Workers with bindings verification
---

# Cloudflare Deployment Workflow

This workflow guides you through deploying the Multi Store SaaS application to Cloudflare, including pre-deployment checks, binding verification, and cache invalidation.

## Prerequisites

- Cloudflare account with Pages/Workers access
- D1 database, R2 bucket, KV namespaces created
- `wrangler` CLI authenticated (`npx wrangler login`)

---

## Step 1: Pre-Deployment Checks

### 1.1 Run Type Check

// turbo

```bash
npm run typecheck
```

### 1.2 Run Linter

// turbo

```bash
npm run lint
```

### 1.3 Run Tests

// turbo

```bash
npm run test
```

### 1.4 Build Production Bundle

// turbo

```bash
npm run build
```

---

## Step 2: Verify Bindings in wrangler.toml

Open `wrangler.toml` and verify:

```toml
# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "multi-store-saas-db"
database_id = "your-database-id"

# R2 Storage
[[r2_buckets]]
binding = "R2"
bucket_name = "multi-store-saas-media"

# KV Namespaces
[[kv_namespaces]]
binding = "AI_RATE_LIMIT"
id = "your-kv-id"

[[kv_namespaces]]
binding = "STORE_CACHE"
id = "your-kv-id"

# Vectorize
[[vectorize]]
binding = "VECTORIZE"
index_name = "multi-store-saas-vectors"

# Workers AI
[ai]
binding = "AI"
```

---

## Step 3: Apply Database Migrations (if any)

### 3.1 Check for pending migrations

// turbo

```bash
npx wrangler d1 migrations list DB --remote
```

### 3.2 Apply migrations to production

```bash
npx wrangler d1 migrations apply DB --remote
```

**⚠️ WARNING**: Review migration files before applying to production!

---

## Step 4: Deploy to Cloudflare Pages

### 4.1 Deploy Main App

// turbo

```bash
npm run deploy
```

Or manually:

```bash
npx wrangler pages deploy ./build/client --project-name=multi-store-saas
```

### 4.2 Verify Deployment

```bash
npx wrangler pages deployment list --project-name=multi-store-saas
```

---

## Step 5: Deploy Page Builder Worker (if applicable)

```bash
cd apps/page-builder
npm run deploy
```

---

## Step 6: Verify Environment Variables

Check that all secrets are set in Cloudflare Dashboard:

| Secret                 | Purpose         |
| ---------------------- | --------------- |
| `SESSION_SECRET`       | Auth encryption |
| `RESEND_API_KEY`       | Email service   |
| `OPENROUTER_API_KEY`   | AI/LLM          |
| `CLOUDFLARE_API_TOKEN` | SSL certs       |
| `BKASH_*`              | bKash payment   |

**Never commit secrets to git or wrangler.toml!**

---

## Step 7: Invalidate Caches (if needed)

### 7.1 Clear KV Cache

```typescript
// Run via wrangler tail or add an admin endpoint
const keys = await env.STORE_CACHE.list({ prefix: 'page:' });
for (const key of keys.keys) {
  await env.STORE_CACHE.delete(key.name);
}
```

### 7.2 Purge Cloudflare CDN Cache

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## Step 8: Post-Deployment Verification

### 8.1 Health Check

// turbo

```bash
curl https://your-domain.com/health
```

### 8.2 Test Critical Flows

1. **Homepage loads** → Check for errors
2. **Store pages** → Verify data loads
3. **Checkout flow** → Test end-to-end
4. **AI features** → Verify bindings work

### 8.3 Monitor Logs

```bash
npx wrangler pages deployment tail --project-name=multi-store-saas
```

---

## Step 9: Rollback (if needed)

### 9.1 Rollback to Previous Deployment

```bash
npx wrangler pages deployment list --project-name=multi-store-saas
# Find previous deployment ID

npx wrangler pages deployment rollback --deployment-id=<id>
```

### 9.2 Rollback Database Migration

```bash
# Use D1 Time Travel
npx wrangler d1 time-travel info DB
npx wrangler d1 time-travel restore DB --timestamp "2025-01-22T10:00:00Z"
```

---

## Step 10: Commit Deployment Record

// turbo

```bash
git tag -a "v$(date +%Y%m%d-%H%M)" -m "Production deployment"
git push --tags
```

---

## Deployment Checklist

### Pre-Deploy

- [ ] Type check passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Migrations reviewed

### Deploy

- [ ] Migrations applied
- [ ] Pages deployed
- [ ] Worker deployed (if applicable)
- [ ] Secrets verified

### Post-Deploy

- [ ] Health check passes
- [ ] Critical flows tested
- [ ] Logs monitored
- [ ] Tag created

---

## Troubleshooting

| Issue           | Solution                                      |
| --------------- | --------------------------------------------- |
| Build fails     | Check TypeScript errors, clear `node_modules` |
| D1 errors       | Verify database ID, check migrations          |
| KV not updating | Check namespace ID, TTL settings              |
| R2 upload fails | Verify CORS, bucket permissions               |
| AI errors       | Check rate limits, model availability         |
