# Translation System Audit & Guidelines

## 📋 Overview

This document provides a comprehensive overview of the translation system for the Multi-Store SaaS platform. We support two languages:
- **English (EN)** - Default language
- **Bengali (BN)** - Localized for Bangladesh market

### Translation System Architecture

The application uses a **dual translation system**:

1. **JSON Files** (Public Locales)
   - Location: `apps/web/public/locales/{en,bn}/common.json`
   - Used for: Static landing page content, public-facing text
   - Format: Simple key-value pairs

2. **TypeScript Files** (Application Locales)
   - Location: `apps/web/app/utils/i18n/{en,bn}/*.ts`
   - Used for: Dashboard, admin UI, dynamic content
   - Files: `common.ts`, `dashboard.ts`, `admin.ts`, `chat.ts`, `onboarding.ts`, `landing.ts`, `store.ts`
   - Format: TypeScript objects with `as const` type assertion

---

## ✅ Translation Coverage Status

### JSON Files (Public Locales)

| File | EN | BN | Status |
|------|----|----|--------|
| `common.json` | ✅ 382 keys | ✅ 382 keys | **COMPLETE** |

**Summary:** All JSON translation files are fully synced and complete.

### TypeScript Files (Application Locales)

#### `common.ts`
| Language | Keys | Status |
|----------|------|--------|
| English | 291 keys | ✅ COMPLETE |
| Bengali | 292 keys | ✅ COMPLETE (includes `pendingOrders`) |

#### `dashboard.ts`
| Language | Keys | Status | Notes |
|----------|------|--------|-------|
| English | 1157 keys | ✅ COMPLETE | All 15 missing keys added |
| Bengali | 1149 keys | ✅ COMPLETE | All 8 missing keys added |

**English missing keys (FIXED):**
- `confirmStatusUpdate` ✅
- `generateReport` ✅
- `favicon` ✅
- `indexed` ✅
- `noAbandonedCartsDesc` ✅
- `noConversationsYet` ✅
- `noNotes` ✅
- `orSelectLandingPage` ✅
- `processing` ✅
- `quantity` ✅
- `sidebarSettings` ✅
- `storeRoutesDisabledWarning` ✅
- `textEdit` ✅
- `homepageSettingsUpdated` ✅

**Bengali missing keys (FIXED):**
- `campaignSentSuccess` ✅
- `clicks` ✅
- `emailContent` ✅
- `failed` ✅
- `favicon` ✅
- `noTransactionHistory` ✅
- `opens` ✅
- `scheduled` ✅
- `sendTo` ✅
- `sent` ✅

#### Other TS Files
| File | EN | BN | Status |
|------|----|----|--------|
| `admin.ts` | ✅ | ✅ | COMPLETE |
| `chat.ts` | ✅ | ✅ | COMPLETE |
| `onboarding.ts` | ✅ | ✅ | COMPLETE |
| `landing.ts` | ✅ | ✅ | COMPLETE |
| `store.ts` | ✅ | ✅ | COMPLETE |

---

## 🔴 Hardcoded Strings Report

The following files contain hardcoded strings that should be migrated to the translation system. These are high-priority targets for internationalization:

### Top Priority Files (Most Hardcoded Strings)

| File | Hardcoded Strings | Priority |
|------|-------------------|----------|
| `app/routes/admin.billing.tsx` | ~46 | 🔴 HIGH |
| `app/routes/admin.analytics.tsx` | ~26 | 🔴 HIGH |
| `app/routes/admin.domains.tsx` | ~16 | 🟠 MEDIUM |
| `app/routes/app.pages.tsx` | ~15 | 🟠 MEDIUM |
| `app/routes/admin.ai-requests.tsx` | ~13 | 🟠 MEDIUM |

### Examples of Hardcoded Strings

```tsx
// ❌ BAD - Hardcoded
<h1>Welcome to Billing</h1>
<p>Choose a plan that fits your needs</p>

// ✅ GOOD - Using translations
import { useTranslation } from '~/contexts/LanguageContext';

function MyComponent() {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t('welcomeToBilling')}</h1>
      <p>{t('choosePlanBasedNeeds')}</p>
    </>
  );
}
```

---

## 🛠️ Developer Guidelines

### How to Use Translations in Code

#### 1. Importing the Translation Hook

```tsx
import { useTranslation } from '~/contexts/LanguageContext';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('pageTitle')}</h1>
      <p>{t('pageDescription')}</p>
    </div>
  );
}
```

#### 2. Dynamic Values in Translations

```tsx
// Translation file
{
  orderCount: 'You have {{count}} orders',
  totalRevenue: 'Total Revenue: {{currency}}{{amount}}'
}

// Usage
const { t } = useTranslation();
<p>{t('orderCount', { count: 5 })}</p>
<p>{t('totalRevenue', { currency: '৳', amount: 1500 })}</p>
```

#### 3. Accessing Specific Translation Modules

```tsx
import { dashboard } from '~/utils/i18n/en/dashboard';

// You can also access sub-modules if needed
const { t } = useTranslation();
// t() automatically handles the routing to correct module
```

### Adding New Translations

#### Step 1: Add to TypeScript Translation Files

**For dashboard-related translations:**

File: `apps/web/app/utils/i18n/en/dashboard.ts`
```typescript
export const dashboard = {
  // ... existing translations
  myNewKey: 'My new English text here',
};
```

File: `apps/web/app/utils/i18n/bn/dashboard.ts`
```typescript
export const dashboard = {
  // ... existing translations
  myNewKey: 'আমার নতুন বাংলা টেক্সট এখানে',
};
```

**For common/global translations:**

File: `apps/web/app/utils/i18n/en/common.ts`
```typescript
export const common = {
  // ... existing translations
  myNewKey: 'My new English text here',
};
```

File: `apps/web/app/utils/i18n/bn/common.ts`
```typescript
export const common = {
  // ... existing translations
  myNewKey: 'আমার নতুন বাংলা টেক্সট এখানে',
};
```

#### Step 2: Add to JSON Files (if public-facing)

File: `apps/web/public/locales/en/common.json`
```json
{
  "myNewKey": "My new English text here"
}
```

File: `apps/web/public/locales/bn/common.json`
```json
{
  "myNewKey": "আমার নতুন বাংলা টেক্সট এখানে"
}
```

#### Step 3: Use in Component

```tsx
import { useTranslation } from '~/contexts/LanguageContext';

function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('myNewKey')}</p>;
}
```

### Best Practices

1. **Always use the translation system** - Never hardcode UI text
2. **Keep keys descriptive** - Use camelCase naming (e.g., `welcomeMessage`, `errorEmptyField`)
3. **Use consistent naming patterns**:
   - Actions: `updateProfile`, `deleteAccount`
   - Status: `pendingStatus`, `activeStatus`
   - Messages: `successMsg`, `errorMsg`
   - Titles: `pageTitle`, `sectionTitle`
4. **Group related translations** - Keep similar keys together in files
5. **Use meaningful variable names** - For dynamic content, use `{{variableName}}` syntax
6. **Test both languages** - Always verify translations in both EN and BN before merging
7. **Add Bengali (Bangla script)** - Not Banglish/Romanized - use actual Bengali script characters

### Translation Key Naming Conventions

```typescript
// Navigation
navProducts, navOrders, navDashboard

// Actions
addProduct, deleteProduct, editSettings, saveChanges

// Status
activeStatus, inactiveStatus, pendingStatus, draftStatus

// Messages
successMsg, errorMsg, warningMsg, infoMsg

// Forms & Labels
emailLabel, passwordLabel, phoneLabel, addressLabel

// Descriptions
productDesc, storeDesc, pageDesc

// Placeholders
emailPlaceholder, passwordPlaceholder, searchPlaceholder
```

---

## 📊 Translation Files Structure

### File Locations

```
apps/web/
├── public/locales/
│   ├── en/
│   │   └── common.json          # Public landing page translations
│   └── bn/
│       └── common.json          # Bengali landing page translations
├── app/utils/i18n/
│   ├── types.ts                 # Type definitions
│   ├── index.ts                 # Main export
│   ├── en/
│   │   ├── common.ts            # Common UI translations
│   │   ├── dashboard.ts         # Dashboard translations
│   │   ├── admin.ts             # Admin panel translations
│   │   ├── chat.ts              # Chat widget translations
│   │   ├── onboarding.ts        # Onboarding flow translations
│   │   ├── landing.ts           # Landing page builder translations
│   │   ├── store.ts             # Store settings translations
│   │   └── index.ts             # Module export
│   └── bn/
│       ├── common.ts            # বাংলা সাধারণ অনুবাদ
│       ├── dashboard.ts         # বাংলা ড্যাশবোর্ড অনুবাদ
│       ├── admin.ts
│       ├── chat.ts
│       ├── onboarding.ts
│       ├── landing.ts
│       ├── store.ts
│       └── index.ts
└── app/
    ├── i18n.ts                  # i18n configuration
    ├── contexts/
    │   └── LanguageContext.tsx   # Language context provider
    └── lib/
        └── i18n.ts              # i18n utilities
```

---

## 🔄 Migration Checklist for Hardcoded Strings

### For Each Hardcoded String:

- [ ] Identify the string and its context
- [ ] Choose appropriate translation file (dashboard, common, admin, etc.)
- [ ] Add key to English translation file
- [ ] Add key to Bengali translation file
- [ ] Update component to use `t('keyName')`
- [ ] Test in both languages
- [ ] Verify spacing and formatting in both languages
- [ ] Check for pluralization needs

### Example Migration

**Before:**
```tsx
<h1>Welcome to {storeName}!</h1>
<p>You have 5 pending orders</p>
```

**After:**
```tsx
const { t } = useTranslation();

<h1>{t('welcomeTo', { storeName })}</h1>
<p>{t('pendingOrdersCount', { count: 5 })}</p>
```

**Translations added:**
```typescript
// en/dashboard.ts
welcomeTo: 'Welcome to {{storeName}}!',
pendingOrdersCount: 'You have {{count}} pending order',
pendingOrdersCount_plural: 'You have {{count}} pending orders',

// bn/dashboard.ts
welcomeTo: '{{storeName}}-এ স্বাগতম!',
pendingOrdersCount: 'আপনার {{count}}টি পেন্ডিং অর্ডার আছে',
pendingOrdersCount_plural: 'আপনার {{count}}টি পেন্ডিং অর্ডার আছে',
```

---

## 🧪 Testing Translations

### Manual Testing Steps

1. **Switch Language:**
   - Open browser DevTools
   - Check language selector in app
   - Verify all UI updates

2. **Check for Missing Keys:**
   - Look for keys in console errors
   - Ensure no `undefined` appears in UI

3. **Verify Formatting:**
   - Check text alignment (RTL support if needed)
   - Verify special characters display correctly
   - Check date/time/number formatting

4. **Test Dynamic Values:**
   - Verify placeholder variables render correctly
   - Test with various data values

### Automated Testing

```typescript
// Example test
import { common } from '~/utils/i18n/en/common';
import { dashboard } from '~/utils/i18n/en/dashboard';

describe('Translations', () => {
  it('should have all required keys', () => {
    expect(common.welcome).toBeDefined();
    expect(dashboard.orderCount).toBeDefined();
  });

  it('should have matching keys between EN and BN', () => {
    const enKeys = Object.keys(common).sort();
    const bnKeys = Object.keys(bnCommon).sort();
    expect(enKeys).toEqual(bnKeys);
  });
});
```

---

## 📝 Translation File Formats

### TypeScript Format (Recommended for UI)

```typescript
export const dashboard = {
  // Navigation
  sidebarHome: 'Home',
  navDashboard: 'Dashboard',
  
  // Status
  pending: 'Pending',
  completed: 'Completed',
  
  // Messages
  successMsg: 'Successfully saved!',
  errorMsg: 'An error occurred',
  
  // Descriptions (longer text)
  welcomeDescription: 'This is a longer description that explains...',
} as const;
```

### JSON Format (for Static Content)

```json
{
  "sidebarHome": "Home",
  "navDashboard": "Dashboard",
  "pending": "Pending",
  "completed": "Completed",
  "successMsg": "Successfully saved!",
  "errorMsg": "An error occurred"
}
```

---

## 🔗 Related Documentation

- [i18n Implementation Details](./I18N_IMPLEMENTATION.md)
- [Language Context Provider](../apps/web/app/contexts/LanguageContext.tsx)
- [Workspace Instructions](../AGENTS.md)

---

## 📞 Support & Contribution

When adding new translations:

1. **Follow naming conventions** consistently
2. **Add both EN and BN** - Never leave one language behind
3. **Use actual Bengali script** - Not Romanized/Banglish
4. **Keep descriptions clear** - Documentation helps future developers
5. **Test thoroughly** - Check both languages before merging

### Common Issues

| Issue | Solution |
|-------|----------|
| Missing key error | Add key to both EN and BN files |
| Text overflows | Check Bengali text length (often longer than English) |
| Variables not rendering | Use `{{variableName}}` syntax, check variable name matches |
| Language not switching | Clear cache, verify LanguageContext provider in app root |

---

## 📅 Last Updated

- **Last Sync:** Translation Audit Complete
- **Status:** All missing keys resolved ✅
- **Next Steps:** Migrate hardcoded strings from route files
