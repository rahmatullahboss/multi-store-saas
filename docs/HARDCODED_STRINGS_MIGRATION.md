# Hardcoded Strings Migration Guide

## 🎯 Overview

This document identifies files with hardcoded strings that need migration to the translation system. These strings should be moved to the appropriate i18n files to support internationalization.

---

## 🔴 Priority 1: High-Impact Files

### File 1: `app/routes/admin.billing.tsx` (~46 hardcoded strings)

**Why it matters:** Billing is a critical customer-facing area. Users must understand pricing and payment options in their language.

**Common hardcoded patterns to look for:**
```tsx
// ❌ Hardcoded strings in billing
'Choose Your Plan'
'Most Popular'
'Unlimited Products'
'Upgrade Now'
'Current Plan'
'Billing History'
'Next Billing Date'
'Cancel Subscription'
'Invoice'
'bKash / Nagad Payment'
'Send Money to this number'
'Payment pending verification'
```

**Keys to add:**
```typescript
// apps/web/app/utils/i18n/en/dashboard.ts (add to existing file)
billing: 'Billing',
billingHistory: 'Billing History',
currentSubscription: 'Current Subscription',
nextBillingDate: 'Next Billing Date',
changePlan: 'Change Plan',
cancelSubscription: 'Cancel Subscription',
invoices: 'Invoices',
paymentPending: 'Payment Pending',
bkashNagadPayment: 'bKash / Nagad Payment',
```

**Apps/web/app/utils/i18n/bn/dashboard.ts additions:**
```typescript
billing: 'বিলিং',
billingHistory: 'বিলিং হিস্টোরি',
currentSubscription: 'বর্তমান সাবস্ক্রিপশন',
nextBillingDate: 'পরবর্তী বিলিং তারিখ',
changePlan: 'প্ল্যান পরিবর্তন করুন',
cancelSubscription: 'সাবস্ক্রিপশন বাতিল করুন',
invoices: 'ইনভয়েস',
paymentPending: 'পেমেন্ট অপেক্ষমান',
bkashNagadPayment: 'বিকাশ / নগদ পেমেন্ট',
```

**Migration steps:**
1. Search for `"Choose Your Plan"` in `admin.billing.tsx`
2. Replace with `t('choosePlan')`
3. Repeat for each hardcoded string
4. Test in both EN and BN languages

---

### File 2: `app/routes/admin.analytics.tsx` (~26 hardcoded strings)

**Why it matters:** Analytics help merchants understand their business performance. Language support ensures all users can interpret their data.

**Common hardcoded patterns:**
```tsx
// ❌ Hardcoded analytics strings
'Sales Overview'
'Total Orders'
'Conversion Rate'
'Average Order Value'
'Top Products'
'Traffic Analytics'
'Last 7 Days'
'Export Report'
'Date Range'
'Filter by date'
```

**Keys to add:**
```typescript
// apps/web/app/utils/i18n/en/dashboard.ts
analyticsOverview: 'Analytics Overview',
salesAnalytics: 'Sales Analytics',
conversionRate: 'Conversion Rate',
averageOrderValue: 'Average Order Value',
topProducts: 'Top Products',
trafficAnalytics: 'Traffic Analytics',
last7Days: 'Last 7 days',
exportReport: 'Export Report',
filterByDate: 'Filter by date',
```

**Bangla versions:**
```typescript
// apps/web/app/utils/i18n/bn/dashboard.ts
analyticsOverview: 'অ্যানালিটিক্স ওভারভিউ',
salesAnalytics: 'সেলস অ্যানালিটিক্স',
conversionRate: 'কনভার্সন রেট',
averageOrderValue: 'গড় অর্ডার মূল্য',
topProducts: 'শীর্ষ পণ্য',
trafficAnalytics: 'ট্রাফিক অ্যানালিটিক্স',
last7Days: 'গত ৭ দিন',
exportReport: 'রিপোর্ট এক্সপোর্ট করুন',
filterByDate: 'তারিখ অনুযায়ী ফিল্টার করুন',
```

---

## 🟠 Priority 2: Medium-Impact Files

### File 3: `app/routes/admin.domains.tsx` (~16 hardcoded strings)

**Why it matters:** Domain configuration is crucial for store customization. Clear instructions in the user's language prevent setup errors.

**Hardcoded strings to migrate:**
```tsx
'Domain Settings'
'Your Store URLs'
'Free subdomain'
'Add Custom Domain'
'DNS Setup'
'CNAME Record'
'SSL Certificate'
'Domain Connected'
```

**Translation additions:**
```typescript
// apps/web/app/utils/i18n/en/dashboard.ts
domainSettings: 'Domain Settings',
yourStoreUrls: 'Your Store URLs',
freeSubdomain: 'Free subdomain',
addCustomDomain: 'Add Custom Domain',
dnsSetup: 'DNS Setup',
cnameRecord: 'CNAME Record',
sslCertificate: 'SSL Certificate',
domainConnected: 'Domain Connected',

// apps/web/app/utils/i18n/bn/dashboard.ts
domainSettings: 'ডোমেইন সেটিংস',
yourStoreUrls: 'আপনার স্টোর URL',
freeSubdomain: 'ফ্রি সাবডোমেইন',
addCustomDomain: 'কাস্টম ডোমেইন যোগ করুন',
dnsSetup: 'DNS সেটআপ',
cnameRecord: 'CNAME রেকর্ড',
sslCertificate: 'SSL সার্টিফিকেট',
domainConnected: 'ডোমেইন সংযুক্ত',
```

---

### File 4: `app/routes/app.pages.tsx` (~15 hardcoded strings)

**Why it matters:** Page builder is a key feature for creating store pages. Users need clear instructions in their language.

**Hardcoded strings:**
```tsx
'Create New Page'
'Page Title'
'URL Slug'
'Published'
'Draft'
'Edit Page'
'Delete Page'
'Publish'
'Save as Draft'
```

**Translation additions:**
```typescript
// apps/web/app/utils/i18n/en/dashboard.ts
createNewPage: 'Create New Page',
pageTitle: 'Page Title',
urlSlug: 'URL Slug',
publishedStatus: 'Published',
draftStatus: 'Draft',
editPage: 'Edit Page',
deletePage: 'Delete Page',
publishPage: 'Publish',

// apps/web/app/utils/i18n/bn/dashboard.ts
createNewPage: 'নতুন পেজ তৈরি করুন',
pageTitle: 'পেজের শিরোনাম',
urlSlug: 'URL স্ল্যাগ',
publishedStatus: 'প্রকাশিত',
draftStatus: 'ড্রাফট',
editPage: 'পেজ এডিট করুন',
deletePage: 'পেজ মুছুন',
publishPage: 'প্রকাশ করুন',
```

---

### File 5: `app/routes/admin.ai-requests.tsx` (~13 hardcoded strings)

**Why it matters:** AI features are complex. Clear explanations help users understand what they can do.

**Hardcoded strings:**
```tsx
'AI Credits'
'Generate Description'
'Write Product Description'
'Design Landing Page'
'Available Balance'
'Top Up Credits'
'Transaction History'
'Processing'
```

**Translation additions:**
```typescript
// apps/web/app/utils/i18n/en/dashboard.ts
aiCredits: 'AI Credits',
generateDescription: 'Generate Description',
writeProductDescription: 'Write Product Description',
designLandingPage: 'Design Landing Page',
availableBalance: 'Available Balance',
topUpCredits: 'Top Up Credits',
transactionHistory: 'Transaction History',

// apps/web/app/utils/i18n/bn/dashboard.ts
aiCredits: 'AI ক্রেডিট',
generateDescription: 'বিবরণ তৈরি করুন',
writeProductDescription: 'পণ্যের বিবরণ লিখুন',
designLandingPage: 'ল্যান্ডিং পেজ ডিজাইন করুন',
availableBalance: 'বর্তমান ব্যালেন্স',
topUpCredits: 'ক্রেডিট যোগ করুন',
transactionHistory: 'লেনদেনের ইতিহাস',
```

---

## 📋 Migration Workflow

### Step 1: Identify Hardcoded Strings

```bash
# Search for strings in specific file
grep -r "const.*=" apps/web/app/routes/admin.billing.tsx | head -20

# Or use VS Code find feature (Ctrl+F)
# Search for: ".tsx" files containing quoted strings outside of t() calls
```

### Step 2: Add Translation Keys

**Example addition to `en/dashboard.ts`:**

```typescript
// Before
export const dashboard = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  // ... other keys
};

// After
export const dashboard = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  // ... other keys
  
  // Billing Section (NEW)
  billing: 'Billing',
  billingHistory: 'Billing History',
  invoiceNumber: 'Invoice Number',
  invoiceDate: 'Invoice Date',
  invoiceAmount: 'Amount',
  downloadInvoice: 'Download Invoice',
};
```

**Example addition to `bn/dashboard.ts`:**

```typescript
// Billing Section (নতুন)
billing: 'বিলিং',
billingHistory: 'বিলিং হিস্টোরি',
invoiceNumber: 'ইনভয়েস নম্বর',
invoiceDate: 'ইনভয়েস তারিখ',
invoiceAmount: 'পরিমাণ',
downloadInvoice: 'ইনভয়েস ডাউনলোড করুন',
```

### Step 3: Update Component Code

**Before:**
```tsx
export function BillingPage() {
  return (
    <div>
      <h1>Billing</h1>
      <p>Current Plan: Premium</p>
      <button>Change Plan</button>
      <div>Billing History</div>
    </div>
  );
}
```

**After:**
```tsx
import { useTranslation } from '~/contexts/LanguageContext';

export function BillingPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('billing')}</h1>
      <p>{t('currentPlan')}: Premium</p>
      <button>{t('changePlan')}</button>
      <div>{t('billingHistory')}</div>
    </div>
  );
}
```

### Step 4: Test

1. **Language switching:**
   - Navigate to the updated page
   - Switch to Bengali (if language switcher exists)
   - Verify all text updates

2. **Check console:**
   - Look for undefined key warnings
   - Verify no missing translation errors

3. **Visual inspection:**
   - Check text alignment
   - Verify no truncation
   - Ensure proper spacing

---

## 🔍 Finding Hardcoded Strings Programmatically

### Script to Identify Hardcoded Strings

```bash
#!/bin/bash
# find-hardcoded-strings.sh

FILE="$1"

echo "=== Potential hardcoded strings in $FILE ==="
echo ""

# Look for single-quoted strings
grep -n "'" "$FILE" | grep -v "t(" | grep -v "import" | grep -v "export" | head -20

echo ""
echo "=== Double-quoted strings ==="
grep -n '"' "$FILE" | grep -v "t(" | grep -v "import" | grep -v "export" | head -20

echo ""
echo "Note: Review results manually to filter out false positives"
```

**Usage:**
```bash
chmod +x find-hardcoded-strings.sh
./find-hardcoded-strings.sh apps/web/app/routes/admin.billing.tsx
```

---

## 📊 Migration Checklist

### For Each File:

#### admin.billing.tsx
- [ ] Identify all ~46 hardcoded strings
- [ ] Add translation keys to EN and BN
- [ ] Import `useTranslation` hook
- [ ] Replace hardcoded strings with `t()` calls
- [ ] Test in both languages
- [ ] Verify formatting and alignment
- [ ] Create PR with translations + code changes

#### admin.analytics.tsx
- [ ] Identify all ~26 hardcoded strings
- [ ] Add translation keys to EN and BN
- [ ] Import `useTranslation` hook
- [ ] Replace hardcoded strings with `t()` calls
- [ ] Test date filtering with translations
- [ ] Verify chart labels translate
- [ ] Create PR

#### admin.domains.tsx
- [ ] Identify all ~16 hardcoded strings
- [ ] Add translation keys to EN and BN
- [ ] Update domain setup instructions
- [ ] Translate error messages
- [ ] Test in both languages
- [ ] Create PR

#### app.pages.tsx
- [ ] Identify all ~15 hardcoded strings
- [ ] Add translation keys to EN and BN
- [ ] Update page builder UI strings
- [ ] Translate publish/draft status
- [ ] Test page creation flow
- [ ] Create PR

#### admin.ai-requests.tsx
- [ ] Identify all ~13 hardcoded strings
- [ ] Add translation keys to EN and BN
- [ ] Translate AI feature descriptions
- [ ] Update credit-related strings
- [ ] Test transaction history display
- [ ] Create PR

---

## 🛠️ Useful Commands

### Search for t() usage to understand pattern

```bash
grep -r "t(" apps/web/app/routes/ | head -10
```

### Find files with most hardcoded strings

```bash
for file in apps/web/app/routes/*.tsx; do
  count=$(grep -c '"' "$file" 2>/dev/null | awk '{s+=$1} END {print s}')
  echo "$file: $count occurrences"
done | sort -t: -k2 -rn
```

### Validate translation key consistency

```bash
# Check if key exists in both EN and BN
grep "billingHistory:" apps/web/app/utils/i18n/en/dashboard.ts
grep "billingHistory:" apps/web/app/utils/i18n/bn/dashboard.ts
```

---

## 📝 Translation Best Practices During Migration

1. **Keep consistency:** Use same key names across files
2. **Use descriptive names:** Not `s1`, `s2` but `billingTitle`, `planDescription`
3. **Group by feature:** Group all billing-related keys together
4. **Document special cases:** If key has special formatting, add comment
5. **Test edge cases:** Empty states, long text, special characters
6. **Verify Bangla:** Use native Bangla speakers to review translations

### Example with Comments

```typescript
export const dashboard = {
  // ... existing keys

  // Billing & Plans Section
  billing: 'Billing',
  billingHistory: 'Billing History',
  currentPlan: 'Current Plan: {{planName}}',  // Note: Includes variable
  nextBillingDate: 'Next Billing Date',
  billingPaymentMethod: 'Payment Method',
  
  // Plan options
  freePlan: 'Free',
  starterPlan: 'Starter',
  professionalPlan: 'Professional',
  
  // Actions
  upgradePlan: 'Upgrade Plan',
  cancelSubscription: 'Cancel Subscription',
  downloadInvoice: 'Download Invoice',
  
  // Messages
  planUpgradeSuccess: 'Plan upgraded successfully!',
  subscriptionCancelledMsg: 'Your subscription has been cancelled.',
};
```

---

## 🔗 Related Files

- Main Translation Audit: `docs/TRANSLATION_AUDIT.md`
- Language Context: `apps/web/app/contexts/LanguageContext.tsx`
- Translation Config: `apps/web/app/i18n.ts`

---

## 📅 Priority Schedule

**Week 1:** Migrate `admin.billing.tsx` (most critical for revenue visibility)
**Week 2:** Migrate `admin.analytics.tsx` (important for performance tracking)
**Week 3:** Migrate remaining 3 files
**Week 4:** Review, test, and refine all migrations

---

## ⚠️ Common Mistakes to Avoid

| Mistake | Impact | Prevention |
|---------|--------|-----------|
| Missing key in one language | UI shows `undefined` | Always add key to both EN and BN |
| Wrong variable syntax | Dynamic values don't render | Use `{{variableName}}` format |
| Inconsistent key naming | Hard to find keys later | Follow naming conventions |
| Not testing RTL | Layout breaks | Test both LTR (EN) and visual review (BN) |
| Hardcoding plurals | Grammar errors in Bengali | Use plural forms: `key` and `key_plural` |
| Using Banglish instead of Bengali | Not true localization | Use Bengali script, not transliteration |

---

## 💡 Pro Tips

1. **Use VS Code Find & Replace:** Much faster than manual editing
   - Find: `"Billing"` (without t() call)
   - Replace with: `{t('billing')}`

2. **Keep old and new code side-by-side:** Compare before/after

3. **Use Git to track changes:** Makes review easier

4. **Test in incognito mode:** Clears translation cache

5. **Ask native speakers:** Validate Bengali translations are natural

---

## 📞 Questions?

Refer to the main TRANSLATION_AUDIT.md or reach out to the team for clarification on any translation-related issues.
