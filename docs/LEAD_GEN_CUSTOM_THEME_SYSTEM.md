# Lead Gen Custom Theme System

ক্লায়েন্টের জন্য কাস্টম Lead Generation থিম তৈরি ও ইন্টিগ্রেশনের সম্পূর্ণ গাইড।

## Architecture Overview

```
lead-gen/
├── LeadGenRenderer.tsx              # themeId দিয়ে সঠিক theme render করে
├── lead-gen-registry.ts             # Theme registry (core + custom)
└── themes/
    ├── shared.tsx                    # LeadCaptureForm, ServiceCard, TestimonialCard
    ├── core/                        # ৬টা ফ্রি থিম (সব user পায়)
    │   ├── professional-services.tsx
    │   ├── consulting-firm.tsx
    │   ├── law-firm.tsx
    │   ├── healthcare.tsx
    │   ├── agency.tsx
    │   └── study-abroad.tsx
    └── custom/                      # Paid client দের কাস্টম থিম
        ├── _scaffold.tsx            # কপি করো নতুন ক্লায়েন্টের জন্য
        └── README.md               # Step-by-step instructions
```

### Config Files

| File                                   | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `lead-gen-registry.ts`                 | Theme component registration (core + custom)       |
| `config/lead-gen-theme-settings.ts`    | Default settings per theme (colors, text, toggles) |
| `services/lead-gen-settings.server.ts` | DB CRUD for per-store settings                     |

---

## End-to-End Flow: নতুন Paid Client এর জন্য

### ধাপ ১: ক্লায়েন্ট Account তৈরি করে

- ক্লায়েন্ট `app.ozzyl.com` এ সাইন আপ করে
- একটা **Store** তৈরি হয় (ধরো store ID: `42`)
- **Business Mode** সেটিংসে (`/app/settings/business-mode`) → **"Lead Generation"** সিলেক্ট করে
- DB-তে: `homeEntry = 'lead_gen'`, `leadGenConfig = { "enabled": true, "themeId": "professional-services" }`

### ধাপ ২: Custom Theme তৈরি করো (Developer)

```bash
cp apps/web/app/components/lead-gen/themes/custom/_scaffold.tsx \
   apps/web/app/components/lead-gen/themes/custom/client-rahim-fashion.tsx
```

ফাইল এডিট করে customize করো:

- **Hero** — ব্র্যান্ড কালার, ব্যাকগ্রাউন্ড, heading
- **Services** — ক্লায়েন্টের সার্ভিস/প্রোডাক্ট categories
- **Testimonials** — real customer reviews
- **Footer** — contact info, social links
- Component rename: `ScaffoldRenderer` → `ClientRahimFashionRenderer`

### ধাপ ৩: Registry-তে Register করো

**`lead-gen-registry.ts`**:

```typescript
// Import
import ClientRahimFashionRenderer from './themes/custom/client-rahim-fashion';

// CUSTOM_TEMPLATES array-তে add:
{
  id: 'client-rahim-fashion',
  name: 'Rahim Fashion House',
  description: 'Custom luxury fashion theme.',
  component: ClientRahimFashionRenderer,
  isPaid: true,
  category: 'custom',
  clientName: 'Rahim Fashion House',
},
```

### ধাপ ৪: Default Settings যোগ করো

**`config/lead-gen-theme-settings.ts`** → `CUSTOM_LEAD_GEN_SETTINGS`:

```typescript
'client-rahim-fashion': {
  storeName: 'Rahim Fashion House',
  logo: null,
  favicon: null,
  primaryColor: '#1a1a1a',
  accentColor: '#c9a961',
  heroHeading: 'Exclusive Fashion Collection',
  heroDescription: 'Discover our premium collection',
  ctaButtonText: 'Get Style Consultation',
  showAnnouncement: false,
  announcementText: null,
  showTestimonials: true,
  showServices: true,
  phone: null,
  email: null,
  address: null,
},
```

### ধাপ ৫: Client Store-এ Theme Assign করো

Client এর store DB-তে `leadGenConfig` update:

```json
{ "enabled": true, "themeId": "client-rahim-fashion" }
```

অথবা client নিজে `/app/settings/lead-gen` থেকে theme বদলাতে পারে।

### ধাপ ৬: Deploy

```bash
git add -A && git commit -m "feat: add custom theme for Rahim Fashion House"
npm run deploy
```

---

## Runtime Flow: ভিজিটর সাইটে আসলে কী হয়

```
ভিজিটর → rahim-fashion.ozzyl.com
         ↓
    _index.tsx loader()
         ↓
    Store resolve → (store ID: 42)
         ↓
    leadGenConfig parse → { enabled: true, themeId: "client-rahim-fashion" }
         ↓
    isLeadGenSite = true
         ↓
    getLeadGenSettings(db, 42, "client-rahim-fashion")
         ↓
    Response: { mode: 'lead_gen', themeId, settings }
         ↓
    <LeadGenRenderer themeId="client-rahim-fashion" />
         ↓
    Registry lookup → CUSTOM_TEMPLATES → ClientRahimFashionRenderer
         ↓
    🎨 Custom page renders!
         ↓
    ভিজিটর Form submit → /api/submit-lead → DB-তে lead সেভ
         ↓
    ক্লায়েন্ট /app/leads এ lead দেখতে পায়
```

## Key Code References

| File                                       | Role                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| `routes/_index.tsx` (line ~438)            | Lead gen mode detection & data loading                   |
| `components/lead-gen/LeadGenRenderer.tsx`  | Registry-based renderer                                  |
| `components/lead-gen/lead-gen-registry.ts` | `CORE_TEMPLATES` + `CUSTOM_TEMPLATES`                    |
| `config/lead-gen-theme-settings.ts`        | `DEFAULT_LEAD_GEN_SETTINGS` + `CUSTOM_LEAD_GEN_SETTINGS` |
| `services/lead-gen-settings.server.ts`     | DB read/write for per-store settings                     |
| `routes/api.submit-lead.tsx`               | Lead form submission handler                             |
| `routes/app.settings.lead-gen.tsx`         | Merchant settings UI                                     |
| `routes/app.leads._index.tsx`              | Lead management dashboard                                |

## Summary

| কাজ                      | File                            | সময়           |
| ------------------------ | ------------------------------- | -------------- |
| Scaffold কপি + customize | `themes/custom/client-name.tsx` | ১-২ ঘন্টা      |
| Registry-তে add          | `lead-gen-registry.ts`          | ২ মিনিট        |
| Settings add             | `lead-gen-theme-settings.ts`    | ২ মিনিট        |
| Theme assign             | DB / Settings UI                | ১ মিনিট        |
| Deploy                   | CLI                             | ৫ মিনিট        |
| **মোট**                  |                                 | **~১-২ ঘন্টা** |
