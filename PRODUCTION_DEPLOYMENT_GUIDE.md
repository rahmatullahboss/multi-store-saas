# 🚀 Lead Gen MVP - Production Deployment Guide

**Date**: 2026-02-12  
**Status**: Ready for Production  
**System**: Lead Generation MVP (Hybrid with E-commerce)

---

## 📋 Pre-Deployment Checklist

- [ ] Database migration file created (`0008_lead_gen_system.sql`)
- [ ] All code files created and verified
- [ ] Backend API routes working (`/api/submit-lead`)
- [ ] Lead dashboard routes working (`/app/leads`)
- [ ] Settings page working (`/app/settings/lead-gen`)
- [ ] Email notifications configured (Resend API key)
- [ ] DNS configuration ready

---

## 🗄️ Step 1: Database Migration (Production)

### Run Migration

```bash
# Navigate to web app
cd apps/web

# Run migration on PRODUCTION database
wrangler d1 execute ozzyl-saas-db --file=./migrations/0008_lead_gen_system.sql

# Verify migration
wrangler d1 execute ozzyl-saas-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='lead_submissions';"
```

**Expected Output:**
```
name
lead_submissions
```

### Verify Indexes

```bash
wrangler d1 execute ozzyl-saas-db --command="PRAGMA index_list('lead_submissions');"
```

**Expected:** Should show 6 indexes created.

---

## 🏪 Step 2: Create Demo Store

### Option A: SQL Script (Recommended)

Create file: `scripts/create-lead-gen-demo-store.sql`

```sql
-- Lead Gen Demo Store for leads.ozzyl.com
-- Run: wrangler d1 execute ozzyl-saas-db --file=./scripts/create-lead-gen-demo-store.sql

INSERT INTO stores (
  name,
  subdomain,
  custom_domain,
  home_entry,
  store_enabled,
  lead_gen_config,
  theme_config,
  currency,
  created_at,
  updated_at
) VALUES (
  'Ozzyl Lead Generation Demo',
  'leadsdemo',
  'leads.ozzyl.com',
  'lead_gen',  -- This enables lead gen mode
  0,  -- E-commerce disabled
  '{
    "enabled": true,
    "themeId": "professional-services",
    "storeName": "Ozzyl Lead Generation",
    "logo": null,
    "primaryColor": "#2563EB",
    "accentColor": "#F59E0B",
    "heroHeading": "Grow Your Business with Expert Consulting",
    "heroDescription": "We help businesses scale with proven strategies",
    "ctaButtonText": "Get Free Consultation",
    "showAnnouncement": true,
    "announcementText": "Limited time offer - Free consultation for new clients",
    "showTestimonials": true,
    "showServices": true,
    "phone": "+880 1234-567890",
    "email": "hello@ozzyl.com",
    "address": "Dhaka, Bangladesh"
  }',
  '{"storeTemplateId": "professional-services"}',
  'BDT',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Get the store ID
SELECT id, name, subdomain, custom_domain, home_entry 
FROM stores 
WHERE subdomain = 'leadsdemo';
```

### Option B: Direct Command

```bash
wrangler d1 execute ozzyl-saas-db --command="
INSERT INTO stores (name, subdomain, custom_domain, home_entry, store_enabled, lead_gen_config, currency, created_at, updated_at)
VALUES ('Lead Gen Demo', 'leadsdemo', 'leads.ozzyl.com', 'lead_gen', 0, '{\"enabled\": true, \"themeId\": \"professional-services\"}', 'BDT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
"
```

### Create Admin User (Optional)

```sql
-- Create user for demo store access
INSERT INTO users (
  email,
  password_hash,
  store_id,
  role,
  created_at,
  updated_at
) VALUES (
  'demo@ozzyl.com',
  '$2a$10$...', -- Generate with bcrypt
  (SELECT id FROM stores WHERE subdomain = 'leadsdemo'),
  'owner',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

---

## 🌐 Step 3: DNS Configuration

### Cloudflare DNS Setup

**For `leads.ozzyl.com`:**

```
Type: CNAME
Name: leads
Target: ozzyl-web.pages.dev  (or your Pages deployment URL)
Proxy: Enabled (Orange cloud)
TTL: Auto
```

### Verify DNS

```bash
# Check DNS propagation
dig leads.ozzyl.com

# Should point to Cloudflare
nslookup leads.ozzyl.com
```

---

## 📦 Step 4: Deploy Application

### Build & Deploy

```bash
# From monorepo root
cd apps/web

# Build application
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Or using wrangler directly
wrangler pages deploy ./build/client --project-name=ozzyl-web
```

### Verify Deployment

```bash
# Check deployment status
wrangler pages deployments list --project-name=ozzyl-web

# Test health
curl https://ozzyl-web.pages.dev/
```

---

## 🔧 Step 5: Environment Variables

### Set Production Secrets

```bash
# Resend API Key (for email notifications)
wrangler pages secret put RESEND_API_KEY --project-name=ozzyl-web

# Workers AI (optional - for lead scoring)
# Already available via binding, no secret needed

# Verify secrets
wrangler pages secret list --project-name=ozzyl-web
```

### Required Bindings (wrangler.toml)

Ensure these are configured:

```toml
[[d1_databases]]
binding = "DB"
database_name = "ozzyl-saas-db"
database_id = "your-production-db-id"

[[kv_namespaces]]
binding = "KV"
id = "your-production-kv-id"

[ai]
binding = "AI"

[[vectorize]]
binding = "VECTORIZE"
index_name = "ozzyl-search"
```

---

## ✅ Step 6: Verification Tests

### Test 1: Visit Landing Page

```bash
# Visit demo site
open https://leads.ozzyl.com

# Check for:
# - Page loads correctly
# - Hero section with form
# - Services section
# - Testimonials section
# - Contact CTA section
# - Footer
```

### Test 2: Submit Lead

```bash
# Fill form with:
# - Name: Test User
# - Email: test@example.com
# - Phone: +880 1234567890
# - Message: This is a test submission

# Verify:
# - Form submits successfully
# - "Thank You" message appears
# - Email notification received
```

### Test 3: Check Database

```bash
# Verify lead was saved
wrangler d1 execute ozzyl-saas-db --command="
SELECT id, name, email, phone, status, created_at 
FROM lead_submissions 
WHERE email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
"
```

### Test 4: Dashboard Access

```bash
# Login to admin
open https://leads.ozzyl.com/auth/login

# Navigate to /app/leads
# Verify:
# - Lead appears in list
# - Can click to view details
# - Can update status
# - Can add notes
```

### Test 5: Settings Page

```bash
# Navigate to /app/settings/lead-gen

# Test:
# - Theme switching works
# - Color picker works
# - Text updates save
# - Changes reflect on public site
```

---

## 🔒 Security Verification

### Checklist

- [ ] All queries filtered by `store_id`
- [ ] Honeypot spam protection working
- [ ] Rate limiting active (5 submissions/hour per IP)
- [ ] Email validation working
- [ ] Form CSRF protection enabled
- [ ] SQL injection safe (using Drizzle ORM)
- [ ] XSS protection (escaped user input)

### Test Security

```bash
# Test rate limiting (submit 6 times quickly)
# 6th submission should be rejected with 429 error

# Test honeypot (fill hidden 'website' field)
# Should silently accept but not save

# Test SQL injection
# Try: name = "'; DROP TABLE lead_submissions; --"
# Should be safely escaped by Drizzle
```

---

## 📊 Step 7: Monitoring Setup

### Cloudflare Analytics

1. Visit Cloudflare Dashboard
2. Navigate to Analytics
3. Check:
   - Page views on `leads.ozzyl.com`
   - API requests to `/api/submit-lead`
   - Error rates
   - Response times

### Email Notifications

```bash
# Check Resend dashboard
# Verify emails are being sent
# Monitor delivery rates
```

### Database Monitoring

```bash
# Check D1 usage
wrangler d1 info ozzyl-saas-db

# Monitor query performance
# Check for slow queries in logs
```

---

## 🐛 Troubleshooting

### Issue: Page Shows 404

**Cause**: DNS not configured or store not found

**Fix**:
```bash
# Verify DNS
dig leads.ozzyl.com

# Verify store exists
wrangler d1 execute ozzyl-saas-db --command="SELECT * FROM stores WHERE custom_domain = 'leads.ozzyl.com';"
```

### Issue: Form Submission Fails

**Cause**: API route error or validation issue

**Fix**:
```bash
# Check logs
wrangler pages deployment tail --project-name=ozzyl-web

# Test API directly
curl -X POST https://leads.ozzyl.com/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{"form_id":"test","name":"Test","email":"test@example.com"}'
```

### Issue: Email Notifications Not Sent

**Cause**: Resend API key missing or invalid

**Fix**:
```bash
# Verify secret is set
wrangler pages secret list --project-name=ozzyl-web

# Test Resend API
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@ozzyl.com","to":"test@example.com","subject":"Test","html":"Test"}'
```

### Issue: Settings Not Saving

**Cause**: Database write issue or validation error

**Fix**:
```bash
# Check database permissions
wrangler d1 execute ozzyl-saas-db --command="UPDATE stores SET lead_gen_config = '{}' WHERE id = 1;"

# Check for validation errors in browser console
# Open DevTools → Network → Check response
```

---

## 🚀 Post-Deployment Tasks

### 1. Create More Stores

```sql
-- Create customer stores
INSERT INTO stores (name, subdomain, home_entry, lead_gen_config, currency)
VALUES 
  ('ABC Legal Services', 'abc-legal', 'lead_gen', '{"enabled":true,"themeId":"law-firm"}', 'BDT'),
  ('XYZ Consulting', 'xyz-consulting', 'lead_gen', '{"enabled":true,"themeId":"consulting-firm"}', 'BDT'),
  ('Health Plus Clinic', 'healthplus', 'lead_gen', '{"enabled":true,"themeId":"healthcare"}', 'BDT');
```

### 2. Customize Each Store

For each store:
1. Login as admin
2. Visit `/app/settings/lead-gen`
3. Customize theme, colors, text
4. Add logo, contact info
5. Save changes

### 3. Monitor Performance

- Track lead submissions per day
- Monitor email delivery rates
- Check conversion rates
- Analyze lead sources

### 4. Iterate Based on Feedback

- Collect merchant feedback
- Add requested features
- Optimize performance
- Fix any bugs

---

## 📈 Success Metrics

### Week 1 Targets

- [ ] 3+ demo stores created
- [ ] 10+ lead submissions
- [ ] 95%+ email delivery rate
- [ ] <100ms average response time
- [ ] 0 critical errors

### Month 1 Targets

- [ ] 10+ customer stores
- [ ] 100+ lead submissions
- [ ] 3+ new themes added
- [ ] Form builder UI (optional)
- [ ] WhatsApp integration (optional)

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# Option 1: Revert migration
wrangler d1 execute ozzyl-saas-db --command="DROP TABLE lead_submissions;"

# Option 2: Disable lead gen for specific store
wrangler d1 execute ozzyl-saas-db --command="UPDATE stores SET home_entry = 'store_home' WHERE subdomain = 'leadsdemo';"

# Option 3: Rollback entire deployment
wrangler pages deployments list --project-name=ozzyl-web
wrangler pages deployment rollback <DEPLOYMENT_ID>
```

---

## ✅ Final Checklist

Before announcing to customers:

- [ ] Production migration successful
- [ ] Demo store created and working
- [ ] DNS configured and propagated
- [ ] Application deployed successfully
- [ ] All tests passing
- [ ] Email notifications working
- [ ] Dashboard accessible
- [ ] Settings page working
- [ ] Security verified
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] Rollback plan tested

---

## 📞 Support

If you encounter issues:

1. Check logs: `wrangler pages deployment tail`
2. Verify database: `wrangler d1 execute ozzyl-saas-db --command="..."`
3. Test API: Use curl or Postman
4. Review this guide
5. Check error messages in browser console

---

**Deployment Estimated Time**: 30-45 minutes  
**Complexity**: Medium  
**Risk**: Low (isolated feature, can be rolled back)

**Ready to deploy!** 🚀
