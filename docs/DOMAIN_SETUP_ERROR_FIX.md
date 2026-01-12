# 🔧 Domain Setup Error Fix for ozzyl.com

## Common Error: "Failed to add domain"

Based on your code analysis, here are the **exact fixes** needed:

---

## 🎯 **IMMEDIATE FIX REQUIRED**

### **Problem 1: Missing Cloudflare API Token**

Your `wrangler.toml` is missing the `CLOUDFLARE_API_TOKEN` variable.

**Fix**: Add this to your `wrangler.toml`:

```toml
[vars]
SAAS_DOMAIN = "ozzyl.com"
CLOUDFLARE_ZONE_ID = "41147efa7d197cfddda0af7fcbf6d641"
CLOUDFLARE_API_TOKEN = "your-actual-api-token-here"  # ← ADD THIS
```

**But wait!** For security, you should set this in Cloudflare Dashboard instead:

1. Go to **Cloudflare Dashboard** → **Pages** → **multi-store-saas** → **Settings**
2. Add environment variable:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: `[Create new token](https://dash.cloudflare.com/profile/api-tokens)`

---

### **Problem 2: Cloudflare for SaaS Not Enabled**

Your system falls back to manual approval because it can't connect to Cloudflare API.

**Check if enabled**:

1. Go to **Cloudflare Dashboard** → **ozzyl.com** → **SSL/TLS** → **Custom Hostnames**
2. If you see "Enable Cloudflare for SaaS" → **Click it!**
3. Set fallback origin to: `multi-store-saas.pages.dev`

---

### **Problem 3: API Token Permissions**

Your token needs these exact permissions:

**Token Creation Steps**:

1. Go to **My Profile** → **API Tokens** → **Create Token**
2. Click **"Create Custom Token"**
3. Give it name: `SaaS Domain Provisioning`
4. Set permissions:
   - **Zone** → **SSL and Certificates** → **Edit**
   - **Zone** → **Zone Settings** → **Read**
5. Set zone resources: `Include` → `Specific zone` → `ozzyl.com`
6. Create token and copy it

---

## 🔍 **DIAGNOSTIC STEPS**

### Step 1: Check Current Configuration

```bash
# Check if Cloudflare credentials are set
# Your app will show this in domain settings page
```

### Step 2: Test API Connection

```bash
# Replace YOUR_TOKEN with actual token
curl -X GET "https://api.cloudflare.com/client/v4/zones/41147efa7d197cfddda0af7fcbf6d641/custom_hostnames" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: Returns list of custom hostnames (or empty array)
**Error**: `Authentication error` → Token is wrong
**Error**: `Zone not found` → Zone ID is wrong

---

## 🛠️ **IMMEDIATE ACTION PLAN**

### **Option A: Quick Fix (Recommended)**

1. **Enable Cloudflare for SaaS** (2 minutes)

   - Dashboard → ozzyl.com → SSL/TLS → Custom Hostnames
   - Enable + Set fallback origin

2. **Create API Token** (3 minutes)

   - Profile → API Tokens → Create Token
   - Use template: "Edit Cloudflare for SaaS"
   - Set zone: ozzyl.com

3. **Add to Pages Environment** (1 minute)

   - Pages → multi-store-saas → Settings
   - Add: `CLOUDFLARE_API_TOKEN` = your token

4. **Test** (1 minute)
   - Go to /app/settings/domain
   - Add: `test.ozzyl.com`
   - Should show success message

### **Option B: Manual Approval (Temporary)**

If auto-provisioning still fails, your system already has fallback:

1. User adds domain → Gets "Request Submitted" message
2. Admin approves in `/app/admin/domains`
3. User gets DNS instructions

---

## 📋 **VERIFICATION CHECKLIST**

After fixes, verify:

- [ ] Cloudflare for SaaS enabled on ozzyl.com
- [ ] Fallback origin = `multi-store-saas.pages.dev`
- [ ] `CLOUDFLARE_API_TOKEN` set in Pages environment
- [ ] Token has SSL & Certificates: Edit permission
- [ ] Token scoped to ozzyl.com zone
- [ ] Pages project deployed and accessible
- [ ] User can add domain without error

---

## 🎯 **Expected Behavior After Fix**

**User adds domain**: `mystore.com`

**System response**:

1. ✅ "Domain added successfully!"
2. ✅ Shows DNS instructions (CNAME → multi-store-saas.pages.dev)
3. ✅ SSL status: "pending"
4. ✅ Auto-refreshes every 30 seconds
5. ✅ After DNS setup: SSL becomes "active"
6. ✅ Store accessible at `https://mystore.com`

---

## 🚨 **If Still Getting Errors**

**Error**: "Cloudflare credentials not configured"
→ API token not set in Pages environment

**Error**: "Failed to create custom hostname: [API error]"
→ Token permissions incorrect or Cloudflare for SaaS not enabled

**Error**: "Invalid domain format"
→ User must enter full domain (e.g., `mystore.com`, not just `mystore`)

**Error**: "Domain already taken"
→ Another store already has this custom domain

---

## 📞 **Next Steps**

1. **Try the quick fix above** (Option A)
2. **Test with a simple domain** like `test.yourdomain.com`
3. **Check browser console** for exact error message
4. **Check server logs** for Cloudflare API errors

Your DNS target is now correctly set to `multi-store-saas.pages.dev` ✅

The remaining issue is **Cloudflare API authentication** - fix the token setup above!
