# Cloudflare for SaaS - Wildcard Subdomain Setup Guide

## Step 1: Enable Cloudflare for SaaS

1. **Cloudflare Dashboard** → **digitalcare.site** zone → **SSL/TLS** → **Custom Hostnames**
2. Click **"Enable Cloudflare for SaaS"**
3. Accept the terms and enable

---

## Step 2: Configure Fallback Origin

1. In **Custom Hostnames** page → Click **"Add Fallback Origin"**
2. Enter: `multi-store-saas.pages.dev`
3. Wait for verification (usually instant if Pages is already deployed)

---

## Step 3: Add Wildcard Custom Hostname

1. Click **"Add Custom Hostname"**
2. Enter hostname: `*.digitalcare.site`
3. SSL Method: **HTTP Validation** (recommended)
4. Click **Add**

---

## Step 4: Add Environment Variables for Auto-Provisioning

**Cloudflare Dashboard** → **Pages** → **multi-store-saas** → **Settings** → **Environment Variables**

Add these Production variables:

| Variable               | Value          | Where to Find                                                                |
| ---------------------- | -------------- | ---------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | `your-token`   | My Profile → API Tokens → Create Token → "Edit Cloudflare for SaaS" template |
| `CLOUDFLARE_ZONE_ID`   | `your-zone-id` | digitalcare.site zone → Overview → Zone ID (right sidebar)                   |

### API Token Required Permissions:

- **SSL and Certificates** → Edit
- **Zone** → Zone Settings → Read
- Zone scope: `digitalcare.site`

---

## Step 5: Re-deploy Pages

After adding variables, re-deploy to apply:

```bash
npm run build && npx wrangler pages deploy ./build/client --project-name=multi-store-saas
```

---

## Verification

| Test                                 | Expected Result                        |
| ------------------------------------ | -------------------------------------- |
| `https://digitalcare.site`           | Marketing landing page                 |
| `https://yourstore.digitalcare.site` | Store homepage                         |
| Add custom domain in Dashboard       | Auto-provisions SSL via Cloudflare API |

---

## Troubleshooting

### Subdomain shows "Host Error" or 522

- Verify fallback origin is set to `multi-store-saas.pages.dev`
- Check wildcard hostname `*.digitalcare.site` is active

### Custom domain not auto-provisioning

- Check `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` are set
- Verify token has correct permissions
- Check Pages logs for API errors
