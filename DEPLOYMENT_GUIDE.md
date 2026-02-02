# Cloudflare Workers Migration - Deployment Guide

## 🚀 Complete Deployment Guide

This guide will walk you through deploying all components after the Pages → Workers migration.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code changes are committed to git
- [ ] You have the latest `wrangler` CLI installed globally: `npm install -g wrangler`
- [ ] You're logged into Wrangler: `wrangler login`
- [ ] Your Cloudflare account has Workers enabled
- [ ] All environment variables are set in Cloudflare Dashboard

---

## 📦 Deployment Order

**CRITICAL: Deploy in this exact order to avoid service binding errors**

### Step 1: Deploy Workers (Service Dependencies)

These workers must be deployed first because the main app depends on them via service bindings.

```bash
# Navigate to workers directory
cd apps/web/workers

# Deploy each worker in order:

echo "🚀 Deploying Cart Processor..."
cd cart-processor && wrangler deploy && cd ..

echo "🚀 Deploying Checkout Lock..."
cd checkout-lock && wrangler deploy && cd ..

echo "🚀 Deploying Order Processor..."
cd order-processor && wrangler deploy && cd ..

echo "🚀 Deploying Rate Limiter..."
cd rate-limiter && wrangler deploy && cd ..

echo "🚀 Deploying Store Config..."
cd store-config && wrangler deploy && cd ..

echo "🚀 Deploying Editor State..."
cd editor-state && wrangler deploy && cd ..

echo "🚀 Deploying PDF Generator..."
cd pdf-generator && wrangler deploy && cd ..

echo "🚀 Deploying Webhook Dispatcher..."
cd webhook-dispatcher && wrangler deploy && cd ..

echo "🚀 Deploying Subdomain Proxy..."
cd subdomain-proxy && wrangler deploy && cd ..
```

### Step 2: Deploy Page Builder (Separate Worker)

```bash
cd apps/page-builder
npm run build
wrangler deploy
cd ../..
```

### Step 3: Deploy Main App (Multi-Store SaaS)

```bash
cd apps/web

# Clean build
rm -rf .wrangler dist node_modules/.vite

# Build
npm run build

# Deploy
wrangler deploy
```

---

## 🔧 Environment Variables Setup

Set these in Cloudflare Dashboard > Workers & Pages > [Your Worker] > Settings > Variables

### Main App (multi-store-saas)

- [ ] `SESSION_SECRET` - Random string for session encryption
- [ ] `RESEND_API_KEY` - For email sending
- [ ] `OPENROUTER_API_KEY` - For AI features
- [ ] `CLOUDFLARE_API_TOKEN` - For custom domain SSL
- [ ] `GOOGLE_CLIENT_SECRET` - For OAuth
- [ ] `VAPID_PRIVATE_KEY` - For push notifications
- [ ] `AXION_TOKEN` - For logging (optional)

### Page Builder (multi-store-saas-builder)

- [ ] `SESSION_SECRET` - Must match main app for cross-subdomain auth

### Workers (if they need secrets)

- [ ] `webhook-dispatcher`: Any webhook-specific secrets
- [ ] `pdf-generator`: Any PDF generation secrets

---

## 🧪 Testing After Deployment

### 1. Test Main App

```bash
# Test health endpoint
curl https://multi-store-saas.ozzyl.workers.dev/api/health

# Should return: {"status":"ok",...}
```

### 2. Test Page Builder

```bash
# Test builder subdomain
curl https://builder.ozzyl.com/api/health
```

### 3. Test Workers

```bash
# Test service bindings are working
curl https://multi-store-saas.ozzyl.workers.dev/api/store
```

### 4. Test Subdomain Routing

```bash
# Test a store subdomain
curl https://demo.ozzyl.com/
```

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# View deployment history
wrangler deployment list

# Rollback to previous version
wrangler deployment rollback <deployment-id>

# For workers
cd workers/[worker-name]
wrangler deployment list
wrangler deployment rollback <deployment-id>
```

---

## 📊 Monitoring

### View Logs

```bash
# Main app
wrangler tail

# Specific worker
cd workers/[worker-name]
wrangler tail
```

### Check Analytics

- Go to Cloudflare Dashboard > Workers & Pages
- View request metrics, errors, and performance data

---

## 🆘 Troubleshooting

### Issue: Service binding errors

**Cause**: Workers not deployed in correct order
**Fix**: Deploy service workers first, then main app

### Issue: ASSETS 404 errors

**Cause**: Static assets not building properly
**Fix**:

```bash
rm -rf .wrangler dist
npm run build
wrangler deploy
```

### Issue: API routes returning HTML

**Cause**: `run_worker_first` not configured
**Fix**: Check `wrangler.toml` has `run_worker_first` patterns

### Issue: D1/R2/KV not found

**Cause**: Resources not provisioned
**Fix**: With Wrangler 4.x, they auto-provision on deploy. If not:

```bash
wrangler d1 create multi-store-saas-db
wrangler r2 bucket create multi-store-saas-media
wrangler kv namespace create STORE_CACHE
```

---

## 📈 Post-Deployment Verification

Verify all components are working:

1. [ ] Main app loads at `https://multi-store-saas.ozzyl.workers.dev`
2. [ ] Page builder loads at `https://builder.ozzyl.com`
3. [ ] Store subdomains work (e.g., `https://demo.ozzyl.com`)
4. [ ] API endpoints return JSON (not HTML)
5. [ ] Service bindings are working (check logs)
6. [ ] Static assets load correctly
7. [ ] Custom domains work (if configured)

---

## 🎉 Success!

Your migration from Cloudflare Pages to Workers is complete!

All components are now running on Cloudflare Workers with:

- ✅ Wrangler 4.x auto-provisioning
- ✅ `run_worker_first` for proper API routing
- ✅ Service bindings for microservices architecture
- ✅ Static assets served via ASSETS binding

---

**Last Updated**: 2026-02-02
**Migration Version**: Pages → Workers Complete ✅
