# Cloudflare for SaaS - Domain Setup Guide for ozzyl.com

## Current Configuration

- **SaaS Domain**: `ozzyl.com`
- **Zone ID**: `41147efa7d197cfddda0af7fcbf6d641`
- **Pages Project**: `multi-store-saas`
- **DNS Target**: `multi-store-saas.pages.dev`

## Step 1: Enable Cloudflare for SaaS

1. **Cloudflare Dashboard** → **ozzyl.com** zone → **SSL/TLS** → **Custom Hostnames**
2. Click **"Enable Cloudflare for SaaS"**
3. Accept the terms and enable

---

## Step 2: Configure Fallback Origin

1. In **Custom Hostnames** page → Click **"Add Fallback Origin"**
2. Enter: `multi-store-saas.pages.dev`
3. Wait for verification (usually instant if Pages is already deployed)
4. **Important**: This must be your actual Pages deployment URL

---

## Step 3: Add Wildcard Custom Hostname

1. Click **"Add Custom Hostname"**
2. Enter hostname: `*.ozzyl.com`
3. SSL Method: **HTTP Validation** (recommended)
4. Click **Add**

---

## Step 4: Add Environment Variables for Auto-Provisioning

**Cloudflare Dashboard** → **Pages** → **multi-store-saas** → **Settings** → **Environment Variables**

Add these Production variables:

| Variable               | Value                              | Where to Find                                                                |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | `your-api-token`                   | My Profile → API Tokens → Create Token → "Edit Cloudflare for SaaS" template |
| `CLOUDFLARE_ZONE_ID`   | `41147efa7d197cfddda0af7fcbf6d641` | ozzyl.com zone → Overview → Zone ID (right sidebar)                          |

### API Token Required Permissions:

- **SSL and Certificates** → Edit
- **Zone** → Zone Settings → Read
- Zone scope: `ozzyl.com`

**Token Creation Steps**:

1. Go to **My Profile** → **API Tokens** → **Create Token**
2. Use template: **"Edit Cloudflare for SaaS"**
3. Set zone resources to: `Include` → `Specific zone` → `ozzyl.com`
4. Create token and copy it

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
npx wrangler pages deploy ./build/client --project-name=multi-store-saas
```

---

## Verification

| Test                           | Expected Result                        |
| ------------------------------ | -------------------------------------- |
| `https://ozzyl.com`            | Marketing landing page                 |
| `https://yourstore.ozzyl.com`  | Store homepage                         |
| Add custom domain in Dashboard | Auto-provisions SSL via Cloudflare API |

---

## Troubleshooting

### Domain shows "Host Error" or 522

- Verify fallback origin is set to `multi-store-saas.pages.dev`
- Check wildcard hostname `*.ozzyl.com` is active
- Ensure Pages project is deployed and accessible

### Custom domain not auto-provisioning

- Check `CLOUDFLARE_API_TOKEN` is set in Pages environment variables
- Verify `CLOUDFLARE_ZONE_ID` is correct: `41147efa7d197cfddda0af7fcbf6d641`
- Verify token has correct permissions (SSL and Certificates: Edit)
- Check Pages logs for API errors
- Ensure Cloudflare for SaaS is enabled

### SSL certificate not issuing

- User must add CNAME record: `@` → `multi-store-saas.pages.dev`
- Or wait for HTTP validation to complete
- Click "Refresh Status" in domain settings

### API authentication errors

- Token must have zone-level permissions for `ozzyl.com`
- Token cannot be global (must be zone-scoped)
- Check token hasn't expired

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

## Testing the Flow

1. **User adds domain**: `mystore.com`
2. **System creates**: Cloudflare custom hostname
3. **User gets**: DNS instructions (CNAME to `multi-store-saas.pages.dev`)
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
