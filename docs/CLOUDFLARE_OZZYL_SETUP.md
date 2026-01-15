# Cloudflare Domain Setup for ozzyl.com

## Current Configuration Analysis

Your system is configured for **ozzyl.com** as the SaaS domain with the following setup:

- **Zone ID**: `41147efa7d197cfddda0af7fcbf6d641`
- **SaaS Domain**: `ozzyl.com`
- **Pages Project**: `multi-store-saas`

## Problem Diagnosis

The domain setup issue for ozzyl.com is likely due to one of these common problems:

1. **Cloudflare for SaaS not enabled**
2. **Missing or incorrect API token**
3. **Fallback origin not configured**
4. **Wildcard hostname not set up**
5. **DNS target mismatch**

## Step-by-Step Fix for ozzyl.com

### Step 1: Verify Cloudflare for SaaS Setup

1. **Go to Cloudflare Dashboard** → **ozzyl.com** zone → **SSL/TLS** → **Custom Hostnames**

2. **Check if Cloudflare for SaaS is enabled**:

   - If you see "Enable Cloudflare for SaaS" button → **Not enabled**
   - If you see custom hostnames list → **Already enabled**

3. **Enable if needed**:
   - Click **"Enable Cloudflare for SaaS"**
   - Accept terms and enable

### Step 2: Configure Fallback Origin

1. In **Custom Hostnames** page → Click **"Add Fallback Origin"**
2. Enter: `multi-store-saas.pages.dev`
3. Wait for verification (usually instant)
4. **Important**: The fallback origin must be your actual Pages deployment

### Step 3: Add Wildcard Custom Hostname

1. Click **"Add Custom Hostname"**
2. Enter hostname: `*.ozzyl.com`
3. SSL Method: **HTTP Validation** (recommended)
4. Click **Add**

### Step 4: Set Environment Variables in Cloudflare Pages

**Cloudflare Dashboard** → **Pages** → **multi-store-saas** → **Settings** → **Environment Variables**

Add these Production variables:

| Variable               | Value                              | Where to Find                          |
| ---------------------- | ---------------------------------- | -------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | Your API token                     | My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ZONE_ID`   | `41147efa7d197cfddda0af7fcbf6d641` | ozzy.com zone → Overview → Zone ID     |

#### Required API Token Permissions:

Create a token with these exact permissions:

- **SSL and Certificates** → Edit
- **Zone** → Zone Settings → Read
- **Zone scope**: `ozzyl.com`

**Token Creation Steps**:

1. Go to **My Profile** → **API Tokens** → **Create Token**
2. Use template: **"Edit Cloudflare for SaaS"**
3. Set zone resources to: `Include` → `Specific zone` → `ozzyl.com`
4. Create token and copy it

### Step 5: Update wrangler.toml

Your current `wrangler.toml` has the correct Zone ID, but you need to add the API token:

```toml
[vars]
SAAS_DOMAIN = "ozzyl.com"
CLOUDFLARE_ZONE_ID = "41147efa7d197cfddda0af7fcbf6d641"

# Add this line (but set the actual value in Cloudflare Dashboard, not here for security)
# CLOUDFLARE_API_TOKEN = "your-api-token-here"
```

**Important**: The `CLOUDFLARE_API_TOKEN` should be set in Cloudflare Dashboard, not in wrangler.toml for security.

### Step 6: Re-deploy Pages

After adding environment variables, re-deploy:

```bash
npm run build
npx wrangler pages deploy ./build/client --project-name=multi-store-saas
```

## Verification Steps

### Test 1: Check Current Setup

```bash
# Check if Cloudflare credentials are configured
# Your system will show this in the domain settings page
```

### Test 2: Add a Custom Domain

1. Go to **/app/settings/domain**
2. Enter a test domain: `yourstore.ozzyl.com`
3. Click "Add Custom Domain"
4. Check if it creates successfully

### Test 3: Verify DNS Setup

After adding a domain, users should see:

- **CNAME Record**: `@` → `multi-store-saas.pages.dev`
- **SSL Status**: Pending → Active
- **DNS Status**: Pending → Verified

## Common Issues & Solutions

### Issue 1: "Cloudflare credentials not configured"

**Solution**: Set `CLOUDFLARE_API_TOKEN` in Pages environment variables

### Issue 2: "Failed to create custom hostname"

**Solution**:

- Verify API token has correct permissions
- Check Zone ID is correct
- Ensure Cloudflare for SaaS is enabled

### Issue 3: Domain shows "pending" forever

**Solution**:

- User needs to add CNAME record: `@` → `multi-store-saas.pages.dev`
- Or wait for HTTP validation to complete
- Click "Refresh Status" in domain settings

### Issue 4: SSL certificate not issuing

**Solution**:

- Verify fallback origin is set correctly
- Check wildcard hostname `*.ozzyl.com` is active
- Ensure domain is not already in another Cloudflare account

## Database Schema Requirements

Your database should have these columns in `stores` table:

- `customDomain`: string | null
- `cloudflareHostnameId`: string | null
- `sslStatus`: 'pending' | 'active' | 'failed'
- `dnsVerified`: boolean
- `customDomainRequest`: string | null
- `customDomainStatus`: 'none' | 'pending' | 'approved' | 'rejected'
- `customDomainRequestedAt`: Date | null

## Testing the Complete Flow

1. **User adds domain**: `mystore.com`
2. **System creates**: Cloudflare custom hostname
3. **User gets**: DNS instructions (CNAME to `multi-store-saas.pages.dev`)
4. **System monitors**: SSL/DNS status automatically
5. **Result**: `https://mystore.com` loads your store

## Monitoring & Debugging

### Check Cloudflare API Logs

```bash
# Monitor API calls in real-time
# Cloudflare Dashboard → Analytics → Logs
```

### Check Database Status

```sql
SELECT customDomain, sslStatus, dnsVerified, cloudflareHostnameId
FROM stores
WHERE customDomain IS NOT NULL;
```

### Manual Cloudflare Check

```bash
# List custom hostnames
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/custom_hostnames" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Next Steps

1. ✅ **Fix DNS target references** (completed)
2. ✅ **Update environment variables** (pending - do this now)
3. ✅ **Enable Cloudflare for SaaS** (pending - do this now)
4. ✅ **Test domain provisioning** (pending - after setup)
5. ✅ **Monitor for issues** (ongoing)

## Support Checklist

If domains still don't work after following this guide:

- [ ] Cloudflare for SaaS is enabled on ozzyl.com zone
- [ ] Fallback origin is set to `multi-store-saas.pages.dev`
- [ ] Wildcard `*.ozzyl.com` custom hostname exists
- [ ] `CLOUDFLARE_API_TOKEN` is set in Pages environment
- [ ] `CLOUDFLARE_ZONE_ID` is correct (`41147efa7d197cfddda0af7fcbf6d641`)
- [ ] API token has SSL and Certificates: Edit permission
- [ ] Pages project is deployed and accessible
- [ ] User adds domain in correct format (e.g., `mystore.com`)

## Expected Behavior After Fix

When a user adds `mystore.com`:

1. ✅ Domain appears in their settings immediately
2. ✅ SSL status shows "pending"
3. ✅ DNS instructions show CNAME target
4. ✅ After DNS setup: SSL becomes "active"
5. ✅ Store accessible at `https://mystore.com`

This should resolve your ozzyl.com domain setup issues!
