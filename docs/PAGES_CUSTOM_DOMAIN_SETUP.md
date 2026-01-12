# 🌐 Pages Custom Domain Setup for ozzyl.com

## Current Status

- **Pages Project**: `multi-store-saas`
- **Default Domain**: `multi-store-saas.pages.dev`
- **Target**: Add custom domains like `yourstore.ozzyl.com`

## 🔍 **Why Domain Verification Fails**

Your domains aren't verifying because:

1. **Missing Cloudflare for SaaS Setup** - Required for automatic SSL
2. **DNS Not Configured** - Custom domains need proper DNS records
3. **API Token Missing** - System can't create hostnames automatically

## 🛠️ **FIX: Complete Setup Process**

### **Step 1: Enable Cloudflare for SaaS (CRITICAL)**

This is **required** for custom domains to work:

1. Go to **Cloudflare Dashboard** → **ozzyl.com** zone
2. Navigate to **SSL/TLS** → **Custom Hostnames**
3. Click **"Enable Cloudflare for SaaS"**
4. Set **Fallback Origin**: `multi-store-saas.pages.dev`

### **Step 2: Add Environment Variables**

**Cloudflare Dashboard** → **Pages** → **multi-store-saas** → **Settings**

Add these variables:

| Variable               | Value                                                          | Purpose                |
| ---------------------- | -------------------------------------------------------------- | ---------------------- |
| `CLOUDFLARE_API_TOKEN` | [Create Token](https://dash.cloudflare.com/profile/api-tokens) | Auto-provision domains |
| `CLOUDFLARE_ZONE_ID`   | `41147efa7d197cfddda0af7fcbf6d641`                             | Your ozzyl.com zone    |

**API Token Permissions**:

- SSL and Certificates: **Edit**
- Zone Settings: **Read**
- Zone scope: `ozzyl.com`

### **Step 3: Test Domain Addition**

After setup, test with your application:

1. Go to **/app/settings/domain**
2. Add domain: `test.ozzyl.com` or `yourstore.com`
3. Should show: "Domain added successfully"
4. Get DNS instructions automatically

## 📋 **Manual Domain Setup (If Auto-Fails)**

If automatic provisioning fails, users can manually add domains:

### **For domains on ozzyl.com zone:**

1. User adds domain in your app
2. System creates Cloudflare custom hostname
3. User needs to add DNS record:
   - **Type**: CNAME
   - **Name**: `@` (or subdomain part)
   - **Target**: `multi-store-saas.pages.dev`

### **For external domains (yourstore.com):**

1. User adds domain in your app
2. System creates Cloudflare custom hostname
3. User needs to add DNS record:
   - **Type**: CNAME
   - **Name**: `@`
   - **Target**: `multi-store-saas.pages.dev`

## 🎯 **What Should Happen**

### **Correct Flow:**

1. ✅ User enters `mystore.com`
2. ✅ System creates Cloudflare custom hostname
3. ✅ User sees DNS instructions
4. ✅ SSL certificate automatically provisions
5. ✅ Domain becomes active after DNS setup

### **If Verification Fails:**

- Check Cloudflare for SaaS is enabled
- Verify API token has correct permissions
- Ensure fallback origin is set correctly
- Check if domain is already in another Cloudflare account

## 🔧 **Quick Test Commands**

```bash
# Check if Cloudflare for SaaS is enabled
# Go to: Cloudflare Dashboard → ozzyl.com → SSL/TLS → Custom Hostnames

# Check Pages project domains
npx wrangler pages project list

# Test API connection (replace with actual values)
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/custom_hostnames" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## 📝 **Expected Results After Fix**

Once Cloudflare for SaaS is enabled and API token is set:

- ✅ Users can add any custom domain
- ✅ SSL certificates auto-provision
- ✅ DNS verification automatic
- ✅ Stores accessible at `https://customdomain.com`

## ⚠️ **Common Issues**

**"Domain not verifying"**
→ Cloudflare for SaaS not enabled

**"API authentication failed"**
→ API token missing or wrong permissions

**"Domain already exists"**
→ Domain is in another Cloudflare account

**"SSL pending forever"**
→ User hasn't added DNS record yet

---

**Your Pages project is ready!** The issue is Cloudflare for SaaS configuration. Enable it and domains will work automatically.
