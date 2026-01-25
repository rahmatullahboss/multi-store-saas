# Translation System - Quick Start Guide

> **TL;DR** - Use `t('keyName')` for all text in UI. Add keys to both EN and BN files. Done!

---

## 🚀 30-Second Setup

```tsx
import { useTranslation } from '~/contexts/LanguageContext';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('myTitle')}</h1>;
}
```

---

## ✅ Checklist for New Text

- [ ] **Never hardcode text** - Always use `t('key')`
- [ ] **Add to EN first** - Then add to BN
- [ ] **Use Bangla script** - Not Banglish (ব not b)
- [ ] **Test both languages** - Switch and verify
- [ ] **Descriptive names** - `welcomeTitle` not `s1`

---

## 📝 Adding a Translation Key

### Step 1: Add to English File

```typescript
// apps/web/app/utils/i18n/en/dashboard.ts
export const dashboard = {
  // ... existing keys
  myNewKey: 'My English text here',
};
```

### Step 2: Add to Bengali File

```typescript
// apps/web/app/utils/i18n/bn/dashboard.ts
export const dashboard = {
  // ... existing keys
  myNewKey: 'আমার বাংলা টেক্সট এখানে',
};
```

### Step 3: Use in Component

```tsx
const { t } = useTranslation();
return <p>{t('myNewKey')}</p>;
```

---

## 🔄 Translation File Locations

| Type | Location | Use For |
|------|----------|---------|
| **Common** | `app/utils/i18n/{en,bn}/common.ts` | Global UI text |
| **Dashboard** | `app/utils/i18n/{en,bn}/dashboard.ts` | Dashboard specific |
| **Admin** | `app/utils/i18n/{en,bn}/admin.ts` | Admin panel |
| **Chat** | `app/utils/i18n/{en,bn}/chat.ts` | Chat widget |
| **Public** | `public/locales/{en,bn}/common.json` | Landing pages |

---

## 💡 Common Patterns

### Simple Text
```typescript
// File
greeting: 'Hello',

// Usage
{t('greeting')}
// Output: "Hello"
```

### Dynamic Values
```typescript
// File
orderCount: 'You have {{count}} orders',

// Usage
{t('orderCount', { count: 5 })}
// Output: "You have 5 orders"
```

### Multiple Variables
```typescript
// File
welcome: 'Welcome {{name}} to {{storeName}}!',

// Usage
{t('welcome', { name: 'Ali', storeName: 'MyStore' })}
// Output: "Welcome Ali to MyStore!"
```

### Plurals
```typescript
// File
orderSingle: 'You have 1 order',
orderPlural: 'You have {{count}} orders',

// Usage
{t(count === 1 ? 'orderSingle' : 'orderPlural', { count })}
```

---

## 🇧🇩 Bengali Translation Tips

| ✅ DO | ❌ DON'T |
|------|----------|
| Use Bangla script: আমার | Use Banglish: amar |
| Use proper Bengali words | Use English + random Bengali |
| Review with native speakers | Google Translate only |
| Keep meaning clear | Literal word-for-word |
| Add context in comments | Ambiguous keys |

### Bengali Examples

```typescript
// ✅ GOOD
myNewKey: 'আমি একটি নতুন পণ্য যোগ করেছি',

// ❌ BAD
myNewKey: 'ami ek notun ponno jogai chi',
myNewKey: 'I ek new product add korechi',
```

---

## 🧪 Testing Your Translation

1. **Set language to Bengali:** Look for language switcher in app
2. **Verify text appears:** Should show Bangla script
3. **Check console:** No undefined key warnings
4. **Check alignment:** Text should display correctly

---

## ⚠️ Common Mistakes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| Key only in EN | Add to both EN and BN |
| Using Banglish | Use Bangla script |
| Hardcoding text | Use `t()` hook |
| Wrong variable syntax | Use `{{varName}}` |
| Typo in key name | Double-check spelling |

---

## 🔍 Debugging

### Text shows as "undefined"
```
Problem: Key doesn't exist
Fix: Add key to both translation files
```

### Text doesn't change when switching language
```
Problem: Not using t() hook or cached data
Fix: Use t() hook, clear browser cache
```

### Bangla text looks wrong
```
Problem: Not using Bangla script
Fix: Use proper Bangla characters, not Banglish
```

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| **TRANSLATION_AUDIT.md** | Complete system overview |
| **HARDCODED_STRINGS_MIGRATION.md** | How to remove hardcoded strings |
| **TRANSLATION_FIX_SUMMARY.md** | What was fixed |
| **TRANSLATION_QUICK_START.md** | This file - quick reference |

---

## 🎓 Key Naming Convention

```typescript
// Navigation
nav{Name}: 'Label',
sidebar{Name}: 'Label',

// Actions
add{Name}: 'Add {Name}',
delete{Name}: 'Delete {Name}',
edit{Name}: 'Edit {Name}',
update{Name}: 'Update {Name}',

// Status
{name}Status: 'Status label',
pending: 'Pending',
active: 'Active',

// Messages
{action}Success: 'Success message',
{action}Error: 'Error message',
{action}Warning: 'Warning message',

// Titles & Labels
{name}Title: 'Title text',
{name}Label: 'Label text',
{name}Description: 'Description text',
{name}Placeholder: 'Placeholder text',

// Forms
required: 'Required',
optional: 'Optional (optional)',
submit: 'Submit',
cancel: 'Cancel',
```

---

## 🤝 Team Guidelines

1. **Before coding:** Plan what text you need
2. **Add translations:** Add to both EN and BN files
3. **Use in code:** Replace hardcoded text with `t()`
4. **Test:** Verify both languages work
5. **Review:** Get Bengali review for translations

---

## 📞 Need Help?

- **How to use:** Check examples above
- **Which file:** See "Translation File Locations" table
- **Best practices:** Read TRANSLATION_AUDIT.md
- **Migration:** See HARDCODED_STRINGS_MIGRATION.md

---

## ✨ That's It!

Translation system is simple:
1. Add key to both files ✅
2. Use `t('key')` in code ✅
3. Test both languages ✅

**You're set!** 🚀
