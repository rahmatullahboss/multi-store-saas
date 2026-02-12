# 🚀 Lead Gen MVP - Quick Start Guide

**Ready to deploy in 5 minutes!**

---

## ⚡ Quick Deployment (Production)

### 1. Run Database Migration (1 min)

```bash
cd apps/web
wrangler d1 execute ozzyl-saas-db --file=./migrations/0008_lead_gen_system.sql
```

### 2. Create Demo Store (1 min)

```bash
wrangler d1 execute ozzyl-saas-db --file=./scripts/create-lead-gen-demo-store.sql
```

### 3. Configure DNS (2 min)

**Cloudflare DNS:**
- Type: `CNAME`
- Name: `leads`
- Target: `ozzyl-web.pages.dev`
- Proxy: ✅ Enabled

### 4. Deploy App (1 min)

```bash
cd apps/web
npm run build
npm run deploy
```

### 5. Test (30 sec)

Visit: `https://leads.ozzyl.com`

**Done!** 🎉

---

## 🧪 Local Testing (Before Production)

### 1. Run Migration Locally

```bash
cd apps/web
wrangler d1 execute ozzyl-saas-db --local --file=./migrations/0008_lead_gen_system.sql
```

### 2. Create Demo Store Locally

```bash
wrangler d1 execute ozzyl-saas-db --local --file=./scripts/create-lead-gen-demo-store.sql
```

### 3. Start Dev Server

```bash
npm run dev
```

### 4. Test Locally

Visit: `http://leadsdemo.localhost:3000`

**Or add to `/etc/hosts`:**
```
127.0.0.1  leads.ozzyl.local
```

Then visit: `http://leads.ozzyl.local:3000`

---

## ✅ Verification Checklist

Run verification script:

```bash
bash scripts/verify-lead-gen-system.sh
```

**Expected output:** All ✓ checks pass

---

## 🎨 Customize Demo Store

### Option 1: Via Settings Page

1. Login to admin: `https://leads.ozzyl.com/auth/login`
2. Navigate to: `/app/settings/lead-gen`
3. Customize:
   - Select theme
   - Change colors
   - Edit text
   - Upload logo
   - Add contact info
4. Click "Save Changes"
5. Refresh public site to see changes

### Option 2: Via SQL

```sql
-- Update lead_gen_config directly
UPDATE stores 
SET lead_gen_config = '{
  "enabled": true,
  "themeId": "law-firm",
  "storeName": "ABC Legal Services",
  "primaryColor": "#1F2937",
  "accentColor": "#C9A961",
  "heroHeading": "Expert Legal Services You Can Trust",
  "ctaButtonText": "Free Case Review",
  "phone": "+880 1234-567890",
  "email": "contact@abclegal.com"
}'
WHERE subdomain = 'leadsdemo';
```

---

## 🏪 Create More Stores

### Template: Professional Services

```sql
INSERT INTO stores (name, subdomain, custom_domain, home_entry, store_enabled, lead_gen_config, currency, created_at, updated_at)
VALUES (
  'Your Business Name',
  'yourbusiness',
  'yourbusiness.ozzyl.com',
  'lead_gen',
  0,
  '{"enabled": true, "themeId": "professional-services"}',
  'BDT',
  datetime('now'),
  datetime('now')
);
```

### Template: Law Firm

```sql
INSERT INTO stores (name, subdomain, home_entry, lead_gen_config, currency, created_at, updated_at)
VALUES (
  'ABC Legal Services',
  'abc-legal',
  'lead_gen',
  '{"enabled": true, "themeId": "law-firm", "primaryColor": "#1F2937", "accentColor": "#C9A961"}',
  'BDT',
  datetime('now'),
  datetime('now')
);
```

### Template: Healthcare

```sql
INSERT INTO stores (name, subdomain, home_entry, lead_gen_config, currency, created_at, updated_at)
VALUES (
  'HealthPlus Clinic',
  'healthplus',
  'lead_gen',
  '{"enabled": true, "themeId": "healthcare", "primaryColor": "#059669", "accentColor": "#0EA5E9"}',
  'BDT',
  datetime('now'),
  datetime('now')
);
```

---

## 📊 Monitor Leads

### View All Leads

```bash
wrangler d1 execute ozzyl-saas-db --command="
SELECT id, name, email, phone, status, created_at 
FROM lead_submissions 
ORDER BY created_at DESC 
LIMIT 10;
"
```

### Count by Status

```bash
wrangler d1 execute ozzyl-saas-db --command="
SELECT status, COUNT(*) as count 
FROM lead_submissions 
GROUP BY status;
"
```

### Export to CSV

Visit: `https://leads.ozzyl.com/app/leads/export`

---

## 🐛 Troubleshooting

### Issue: Page shows 404

**Solution:**
```bash
# Check if store exists
wrangler d1 execute ozzyl-saas-db --command="SELECT * FROM stores WHERE custom_domain = 'leads.ozzyl.com';"

# Check DNS
dig leads.ozzyl.com
```

### Issue: Form doesn't submit

**Solution:**
```bash
# Check logs
wrangler pages deployment tail --project-name=ozzyl-web

# Test API directly
curl -X POST https://leads.ozzyl.com/api/submit-lead \
  -d "form_id=test&name=Test&email=test@example.com"
```

### Issue: Email not received

**Solution:**
```bash
# Check if Resend API key is set
wrangler pages secret list --project-name=ozzyl-web

# Should show: RESEND_API_KEY
```

---

## 📞 Quick Commands Reference

```bash
# Database
wrangler d1 execute ozzyl-saas-db --command="..."
wrangler d1 info ozzyl-saas-db

# Deployment
npm run build
npm run deploy
wrangler pages deployments list

# Logs
wrangler pages deployment tail
wrangler tail

# Secrets
wrangler pages secret put RESEND_API_KEY
wrangler pages secret list
```

---

## 🎯 Next Steps After Deployment

1. **Test form submission**
   - Fill form on `https://leads.ozzyl.com`
   - Check email notification
   - Verify lead in dashboard

2. **Customize demo store**
   - Change colors, text, logo
   - Test different themes
   - Preview changes

3. **Create customer stores**
   - Use SQL templates above
   - Configure DNS for custom domains
   - Customize per customer

4. **Monitor performance**
   - Check Cloudflare Analytics
   - Monitor email delivery
   - Track conversion rates

---

## 📚 Documentation

- **Full Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Implementation**: `LEAD_GEN_IMPLEMENTATION_SUMMARY.md`
- **V2 Plan**: `docs/LEAD_GEN_MVP_IMPLEMENTATION_PLAN_V2.md`

---

**Deployment Time**: 5 minutes  
**Complexity**: Easy  
**Status**: ✅ Production Ready

Let's go! 🚀
