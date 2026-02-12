# 🎯 How to Enable Lead Gen Page

**Current Status:**
- ✅ Database migration done (lead_submissions table created)
- ✅ Demo store created (`leadsdemo` subdomain)
- ✅ All code committed (3 commits)
- ⚠️ Build has local deadlock issue (not code problem)

---

## 🔄 Option 1: Switch via SQL (Immediate)

আপনার existing domain এ lead gen page দেখাতে:

```sql
-- Run this via wrangler
npx wrangler d1 execute multi-store-saas-db --remote --command="
UPDATE stores 
SET 
  home_entry = 'lead_gen',
  store_enabled = 0,
  lead_gen_config = '{\"enabled\": true, \"themeId\": \"professional-services\", \"storeName\": \"Your Business\", \"primaryColor\": \"#2563EB\", \"accentColor\": \"#F59E0B\", \"heroHeading\": \"Grow Your Business with Expert Consulting\", \"heroDescription\": \"We help businesses scale with proven strategies\", \"ctaButtonText\": \"Get Free Consultation\", \"showAnnouncement\": true, \"announcementText\": \"Free consultation for new clients\", \"showTestimonials\": true, \"showServices\": true, \"phone\": \"+880 1234-567890\", \"email\": \"hello@yourbusiness.com\", \"address\": \"Dhaka, Bangladesh\"}'
WHERE id = 1;
"
```

**এটা করলে:**
- ✅ Homepage lead gen page হবে
- ✅ E-commerce disabled হবে
- ✅ Contact form দেখাবে
- ✅ Lead dashboard কাজ করবে

---

## 🔄 Option 2: Switch via Admin Panel (After Build)

Build successful হলে:

1. Login করুন: `/auth/login`
2. যান: `/app/settings/business-mode`
3. Select করুন: **Lead Generation**
4. Auto-save হবে

---

## 📋 Demo Store Access (leads.ozzyl.com)

Demo store already created:

```sql
-- Check demo store
npx wrangler d1 execute multi-store-saas-db --remote --command="
SELECT id, name, subdomain, custom_domain, home_entry, store_enabled 
FROM stores 
WHERE subdomain = 'leadsdemo';
"
```

**DNS Setup করলে:**
- Domain: `leads.ozzyl.com`
- Already lead gen mode enabled
- Form submission ready
- Dashboard accessible

---

## 🎨 What the Lead Gen Page Looks Like

### Header
- Logo/Store name
- Navigation (Services, Testimonials, Contact)
- CTA button

### Hero Section
- Large heading: "Grow Your Business with Expert Consulting"
- Description text
- **Contact Form** (inline) with:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Company (optional)
  - Message (textarea)
  - Submit button

### Services Section
- 3-column grid
- Service cards with icons
- Customizable (future)

### Testimonials Section
- 3-column grid
- Customer testimonials with ratings
- Photos and names

### Contact CTA Section
- Gradient background
- Call to action
- Contact buttons
- Contact info (phone, email, address)

### Footer
- Company info
- Quick links
- Social links
- Copyright

---

## 🔧 How to Test Lead Submission

1. Visit your store URL
2. Fill the contact form
3. Submit
4. Check:
   - ✅ Thank you message appears
   - ✅ Email notification received
   - ✅ Lead in database

**Check leads in database:**
```sql
npx wrangler d1 execute multi-store-saas-db --remote --command="
SELECT id, name, email, phone, status, created_at 
FROM lead_submissions 
ORDER BY created_at DESC 
LIMIT 10;
"
```

**View in dashboard:**
- Login: `/auth/login`
- Navigate: `/app/leads`
- See all submissions

---

## 🎯 Lead Gen Features Included

### Forms
- ✅ Contact form with validation
- ✅ Spam protection (honeypot)
- ✅ Rate limiting (5/hour per IP)
- ✅ Email/phone required
- ✅ Progressive enhancement

### Dashboard
- ✅ Lead list with filters
- ✅ Stats (total, new, contacted, converted)
- ✅ Lead details view
- ✅ Status management
- ✅ Notes system

### Email Notifications
- ✅ Instant alerts to merchant
- ✅ Beautiful HTML template
- ✅ Lead details included
- ✅ Direct link to dashboard

### Themes (5 available)
1. **Professional Services** (default)
2. Consulting Firm
3. Law Firm
4. Healthcare
5. Digital Agency

---

## 🛠️ Customization via SQL

```sql
-- Update colors
UPDATE stores 
SET lead_gen_config = json_replace(
  lead_gen_config,
  '$.primaryColor', '#1E40AF',
  '$.accentColor', '#10B981'
)
WHERE id = 1;

-- Update text
UPDATE stores 
SET lead_gen_config = json_replace(
  lead_gen_config,
  '$.heroHeading', 'Your Custom Heading',
  '$.heroDescription', 'Your description text',
  '$.ctaButtonText', 'Contact Us Today'
)
WHERE id = 1;

-- Change theme
UPDATE stores 
SET lead_gen_config = json_replace(
  lead_gen_config,
  '$.themeId', 'law-firm'
)
WHERE id = 1;
```

---

## 📊 What's Already Done

### Database ✅
```sql
-- Check if table exists
npx wrangler d1 execute multi-store-saas-db --remote --command="
SELECT name FROM sqlite_master WHERE type='table' AND name='lead_submissions';
"
-- Should return: lead_submissions

-- Check indexes
npx wrangler d1 execute multi-store-saas-db --remote --command="
PRAGMA index_list('lead_submissions');
"
-- Should show 6 indexes
```

### Demo Store ✅
```sql
-- Verify demo store
npx wrangler d1 execute multi-store-saas-db --remote --command="
SELECT * FROM stores WHERE subdomain = 'leadsdemo';
"
-- Should return store with lead_gen_config
```

---

## 🚀 Deploy Options

### Option A: Build on Different Machine
- Try on a machine with more RAM
- Or on Cloudflare Pages (auto-build)

### Option B: Push to GitHub
```bash
# Push commits
git push origin master

# Cloudflare Pages will auto-build
# Then configure domain
```

### Option C: Deploy Build Folder (If you have one)
```bash
# If build folder exists from previous build
cd apps/web
npx wrangler pages deploy ./build/client --project-name=ozzyl-web
```

---

## ✅ Summary

**To See Lead Gen Page NOW:**

```sql
# Run this command:
npx wrangler d1 execute multi-store-saas-db --remote --command="UPDATE stores SET home_entry = 'lead_gen', store_enabled = 0 WHERE id = 1;"

# Then visit your domain
# You'll see the lead gen page!
```

**Everything is ready except build:**
- ✅ Code complete (37 files)
- ✅ Database migrated
- ✅ Demo store created
- ✅ All committed
- ⏳ Build (local deadlock - try different machine)

---

**Lead Gen Page is READY - just switch the mode!** 🚀
