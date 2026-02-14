# Cloudflare for SaaS - Domain Setup Guide for ozzyl.com

## Current Configuration

- **SaaS Domain**: `ozzyl.com`
- **Zone ID**: `41147efa7d197cfddda0af7fcbf6d641`
- **Worker**: `multi-store-saas`
- **DNS Target**: `multi-store-saas.ozzyl.workers.dev`

## Step 1: Enable Cloudflare for SaaS

1. **Cloudflare Dashboard** → **ozzyl.com** zone → **SSL/TLS** → **Custom Hostnames**
2. Click **"Enable Cloudflare for SaaS"**
3. Accept the terms and enable

---

## Step 2: Configure Fallback Origin

1. In **Custom Hostnames** page → Click **"Add Fallback Origin"**
2. Enter: `multi-store-saas.ozzyl.workers.dev`
3. Wait for verification (usually instant if Pages is already deployed)
4. **Important**: This must be your actual Worker deployment URL

---

## Step 3: Add Wildcard Custom Hostname

1. Click **"Add Custom Hostname"**
2. Enter hostname: `*.ozzyl.com`
3. SSL Method: **HTTP Validation** (recommended)
4. Click **Add**

---

## Step 4: Set Secrets (Required for Auto-Provisioning)

### 4.1 Set via Wrangler CLI (Recommended)

**CLOUDFLARE_API_TOKEN** must be set as a secret (not a plain variable) for security:

```bash
cd apps/web
wrangler secret put CLOUDFLARE_API_TOKEN
# Paste your API token when prompted
```

### 4.2 API Token Creation

1. Go to **Cloudflare Dashboard** → **My Profile** → **API Tokens**
2. Click **Create Custom Token**
3. Configure:

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| Name           | `ozzyl-saas-admin`                                   |
| Permissions    | `Zone - Zone - Edit`                                 |
|                | `SSL and Certificates - SSL and Certificates - Edit` |
| Zone Resources | Include: `ozzyl.com`                                 |

4. Click **Create Token** and copy immediately

### 4.3 Additional Secrets

```bash
# Required for email notifications
wrangler secret put RESEND_API_KEY

# Check current secrets
wrangler secret list
```

### 4.4 Environment Variables (Plain Variables)

These are already set in `wrangler.toml`:

| Variable             | Value                              | Type      |
| -------------------- | ---------------------------------- | --------- |
| `CLOUDFLARE_ZONE_ID` | `41147efa7d197cfddda0af7fcbf6d641` | Plain var |
| `SAAS_DOMAIN`        | `ozzyl.com`                        | Plain var |

---

## Current Secrets Status

| Secret                      | Status     |
| --------------------------- | ---------- |
| `GOOGLE_CLIENT_SECRET`      | ✅ Set     |
| `OPENROUTER_API_KEY`        | ✅ Set     |
| `SESSION_SECRET`            | ✅ Set     |
| `SSLCOMMERZ_STORE_ID`       | ✅ Set     |
| `SSLCOMMERZ_STORE_PASSWORD` | ✅ Set     |
| `CLOUDFLARE_API_TOKEN`      | ❌ Not Set |
| `RESEND_API_KEY`            | ❌ Not Set |

---

## Step 5: Update wrangler.toml (Optional but Recommended)

Add to your `wrangler.toml`:

```toml
[vars]
SAAS_DOMAIN = "ozzyl.com"
CLOUDFLARE_ZONE_ID = "41147efa7d197cfddda0af7fcbf6d641"

# Note: CLOUDFLARE_API_TOKEN should be set in Cloudflare Dashboard for security
```

---

## Step 6: Re-deploy Pages

After adding variables, re-deploy to apply:

```bash
npm run build
npx wrangler deploy --name=multi-store-saas
```

---

## Step 5: Verify Setup

### 5.1 Check Wrangler Configuration

```bash
cd apps/web
wrangler check
```

### 5.2 Deploy to Production

```bash
npm run build
wrangler deploy --env production
```

### 5.3 Monitor Logs

```bash
# Real-time logs
wrangler tail
```

### Verification Tests

| Test                           | Expected Result                        |
| ------------------------------ | -------------------------------------- |
| `https://ozzyl.com`            | Marketing landing page                 |
| `https://yourstore.ozzyl.com`  | Store homepage                         |
| Add custom domain in Dashboard | Auto-provisions SSL via Cloudflare API |
| Admin > Domains                | Shows all custom domains with status   |

---

## Troubleshooting

### "Cloudflare for SaaS not enabled" Error

**Cause**: Cloudflare for SaaS requires a paid plan (Pro/Business/Enterprise).

**Solution**:

1. Upgrade your Cloudflare plan to Pro or higher
2. Go to **Cloudflare Dashboard > Traffic > Cloudflare for SaaS**
3. Enable Cloudflare for SaaS

### Domain shows "Host Error" or 522

- Verify fallback origin is set to `multi-store-saas.ozzyl.workers.dev`
- Check wildcard hostname `*.ozzyl.com` is active
- Ensure Worker is deployed and accessible

### Custom domain not auto-provisioning

- Check `CLOUDFLARE_API_TOKEN` is set via `wrangler secret put`
- Verify `CLOUDFLARE_ZONE_ID` is correct: `41147efa7d197cfddda0af7fcbf6d641`
- Verify token has correct permissions (SSL and Certificates: Edit)
- Check Worker logs: `wrangler tail`
- Ensure Cloudflare for SaaS is enabled in Dashboard

### Fallback origin error when creating custom hostname

**Cause**: Fallback origin not configured or not accessible

**Solution**:

1. Go to **SSL/TLS > Custom Hostnames**
2. Click **Add Fallback Origin**
3. Enter: `multi-store-saas.ozzyl.workers.dev`
4. Ensure this is a CNAME to your deployed Worker

### SSL certificate not issuing

- User must add CNAME record: `@` → `multi-store-saas.ozzyl.workers.dev`
- Or wait for HTTP validation to complete
- Click "Refresh Status" in domain settings

### API authentication errors

- Token must have zone-level permissions for `ozzyl.com`
- Token cannot be global (must be zone-scoped)
- Check token hasn't expired
- Ensure token is set via `wrangler secret put` not plain variable

---

## Database Requirements

Ensure your `stores` table has these columns:

- `customDomain`: string | null
- `cloudflareHostnameId`: string | null
- `sslStatus`: 'pending' | 'active' | 'failed'
- `dnsVerified`: boolean
- `customDomainRequest`: string | null
- `customDomainStatus`: 'none' | 'pending' | 'approved' | 'rejected'

---

## How It Works

### With Cloudflare API Configured (Auto-Approval)

1. **User adds domain**: `mystore.com` from Settings > Domain
2. **System creates**: Cloudflare custom hostname via API
3. **SSL auto-provisioned**: DV certificate issued automatically
4. **User adds CNAME**: `mystore.com` → `multi-store-saas.ozzyl.workers.dev`
5. **System monitors**: SSL/DNS status automatically
6. **Result**: `https://mystore.com` loads your store

### Without Cloudflare API (Manual Approval)

If `CLOUDFLARE_API_TOKEN` is not set:

1. **User adds domain**: Request saved as `pending`
2. **Admin reviews**: Go to `/admin/domains`
3. **Admin approves**: Manually creates hostname in Cloudflare Dashboard
4. **Admin marks approved**: Updates status in database

---

## Testing the Flow

1. **User adds domain**: `mystore.com`
2. **System creates**: Cloudflare custom hostname (if API configured)
3. **User gets**: DNS instructions (CNAME to `multi-store-saas.ozzyl.workers.dev`)
4. **System monitors**: SSL/DNS status automatically
5. **Result**: `https://mystore.com` loads your store

---

## Manual Verification Commands

```bash
# Check custom hostnames
curl -X GET "https://api.cloudflare.com/client/v4/zones/41147efa7d197cfddda0af7fcbf6d641/custom_hostnames" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Check specific hostname
curl -X GET "https://api.cloudflare.com/client/v4/zones/41147efa7d197cfddda0af7fcbf6d641/custom_hostnames/HOSTNAME_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

This guide should resolve your ozzyl.com domain setup issues!
