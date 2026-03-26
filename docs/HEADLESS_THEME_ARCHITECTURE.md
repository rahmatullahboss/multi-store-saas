# Headless Theme Architecture

> **Last Updated**: 2026-03-26
> **Status**: ✅ Production Ready
> **Commit**: `c102bebe`

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Architecture Diagram](#-architecture-diagram)
3. [Data Flow](#-data-flow)
4. [File Structure](#-file-structure)
5. [Storefront Data Contract](#-storefront-data-contract)
6. [Template System](#-template-system)
7. [Unified Settings API](#-unified-settings-api)
8. [Store Design Dashboard](#-store-design-dashboard)
9. [What Was Removed](#-what-was-removed)
10. [Adding a New Template](#-adding-a-new-template)
11. [FAQ](#-faq)

---

## 🎯 Overview

Ozzyl Multi-Store SaaS একটি **Headless Theme Architecture** ব্যবহার করে যেখানে:

- **Backend** শুধু JSON ডেটা সার্ভ করে (কোনো HTML rendering নয়)
- **Frontend** React templates ডেটা গ্রহণ করে এবং UI render করে
- **কোনো Visual Editor নেই** — templates developer-coded এবং "Theme Store" হিসাবে কাজ করে
- **Single Source of Truth** — সব settings একটি JSON column (`stores.storefront_settings`) থেকে আসে

### মূল নীতি

| নীতি | বর্ণনা |
|------|--------|
| **No Editor** | কোনো drag-and-drop, GrapesJS, বা live editor নেই |
| **Registry Pattern** | `store-registry.ts` → `templateId` → `React.lazy(Component)` |
| **Unified Settings** | সব config একটি JSON API (`getUnifiedStorefrontSettings`) থেকে আসে |
| **Type Safety** | `StorefrontData` interface সব route এর data shape নিয়ন্ত্রণ করে |
| **Lazy Loading** | সব template `React.lazy()` দিয়ে code-split হয় |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                               │
│                     https://store.ozzyl.com/                        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER (SSR)                          │
│                                                                     │
│  ┌──────────────┐   ┌────────────────────┐   ┌──────────────────┐  │
│  │  Middleware   │──▶│  Route Loader      │──▶│  JSON Response   │  │
│  │ (storeId     │   │  (_index.tsx)       │   │  (StorefrontData)│  │
│  │  resolution) │   │                    │   │                  │  │
│  └──────────────┘   └────────┬───────────┘   └──────────────────┘  │
│                              │                                      │
│                    ┌─────────▼─────────┐                           │
│                    │  buildStorefront   │                           │
│                    │  Data()            │                           │
│                    │                    │                           │
│                    │  ┌──────────────┐  │                           │
│                    │  │ Unified      │  │                           │
│                    │  │ Settings API │  │                           │
│                    │  └──────┬───────┘  │                           │
│                    │         │          │                           │
│                    │  ┌──────▼───────┐  │                           │
│                    │  │    D1 DB     │  │                           │
│                    │  │  (SQLite)    │  │                           │
│                    │  └──────────────┘  │                           │
│                    └───────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT RENDERING                                │
│                                                                     │
│  ┌──────────────┐   ┌────────────────────┐   ┌──────────────────┐  │
│  │ store-       │──▶│  Template           │──▶│  Hydrated HTML   │  │
│  │ registry.ts  │   │  Component          │   │  (SSR + Client)  │  │
│  │              │   │  (React.lazy)       │   │                  │  │
│  │ templateId   │   │                    │   │                  │  │
│  │ → component  │   │  dc-store          │   │                  │  │
│  │              │   │  luxe-boutique     │   │                  │  │
│  │              │   │  nova-lux          │   │                  │  │
│  │              │   │  ... (18 themes)   │   │                  │  │
│  └──────────────┘   └────────────────────┘   └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Request → Response Pipeline

```
1. Browser Request (GET /)
        │
2. Cloudflare Worker receives request
        │
3. Middleware resolves storeId (from hostname/subdomain)
        │
4. Route Loader (_index.tsx) executes:
   ├── getUnifiedStorefrontSettings(db, storeId)  ← Single Source of Truth
   ├── Fetch products from D1
   ├── Fetch categories from collections/products
   ├── Fetch review stats
   └── Assemble StorefrontData object
        │
5. JSON response sent to client
        │
6. React hydrates:
   ├── store-registry.ts resolves templateId → React.lazy(Component)
   ├── StorePageWrapper wraps with Header + Footer
   └── TemplateComponent renders the homepage
        │
7. User sees the storefront ✨
```

### Data Sources

| Data | Source | API |
|------|--------|-----|
| Theme colors | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Store name, logo | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Social links | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Business info | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Hero banner | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Announcement | `stores.storefront_settings` | `getUnifiedStorefrontSettings()` |
| Products | `products` table | Direct D1 query |
| Categories | `collections` table | Direct D1 query |
| Reviews | `product_reviews` table | `getProductReviewStats()` |

---

## 📂 File Structure

```
apps/web/app/
├── lib/
│   ├── storefront-types.ts          # 📋 Canonical type definitions
│   ├── storefront-data.server.ts    # 🔧 Server-side data builder
│   └── hero-slides.ts               # 🎠 Hero carousel logic
│
├── templates/
│   ├── store-registry.ts            # 📦 Template registry (18 templates)
│   └── types.ts                     # 📋 Template interface definitions
│
├── components/store-templates/
│   ├── dc-store/                    # 🎨 DC Store template
│   │   ├── index.tsx                #    Homepage component
│   │   ├── theme.ts                 #    Theme colors/fonts
│   │   ├── sections/
│   │   │   ├── Header.tsx           #    Template header
│   │   │   ├── Footer.tsx           #    Template footer
│   │   │   └── ProductCard.tsx      #    Product card component
│   │   └── pages/
│   │       └── ProductPage.tsx      #    Product detail page
│   ├── luxe-boutique/               # 🎨 Luxe Boutique template
│   ├── nova-lux/                    # 🎨 Nova Lux template
│   ├── starter-store/               # 🎨 Starter Store template
│   ├── daraz/                       # 🎨 Daraz template
│   ├── eclipse/                     # 🎨 Eclipse template
│   ├── rovo/                        # 🎨 Rovo template
│   ├── sokol/                       # 🎨 Sokol template
│   ├── ghorer-bazar/                # 🎨 Ghorer Bazar template
│   ├── tech-modern/                 # 🎨 Tech Modern template
│   ├── aurora-minimal/              # 🎨 Aurora Minimal template
│   ├── artisan-market/              # 🎨 Artisan Market template
│   ├── freshness/                   # 🎨 Freshness template
│   ├── turbo-sale/                  # 🎨 Turbo Sale template
│   ├── zenith-rise/                 # 🎨 Zenith Rise template
│   ├── bdshop/                      # 🎨 BDShop template
│   ├── nova-lux-ultra/              # 🎨 Nova Lux Ultra template
│   ├── ozzyl-premium/               # 🎨 Ozzyl Premium template
│   └── shared/                      # 🔗 Shared pages (Cart, Checkout, Collection)
│
├── components/store-layouts/
│   └── StorePageWrapper.tsx          # 🔲 Layout wrapper (Header + Footer shell)
│
├── services/
│   └── unified-storefront-settings.server.ts  # 🔑 THE single source of truth
│
├── routes/
│   ├── _index.tsx                    # 🏠 Store homepage route
│   ├── products.$handle.tsx          # 📦 Product detail route
│   ├── cart.tsx                      # 🛒 Cart route
│   ├── checkout.tsx                  # 💳 Checkout route
│   ├── category.$slug.tsx            # 📁 Category/Collection route
│   ├── p.$slug.tsx                   # 📄 Custom static pages
│   ├── app.store-design.tsx          # ⚙️ Admin: Store Design dashboard
│   └── app.pages.tsx                 # 📄 Admin: Pages management
│
└── components/store-sections/        # ⚠️ Compatibility shims (deprecated)
    ├── registry.ts                   #    Empty SECTION_REGISTRY
    ├── SectionRenderer.tsx           #    No-op component
    └── AnnouncementBar.tsx           #    No-op component
```

---

## 📋 Storefront Data Contract

### `StorefrontData` — The canonical data shape

প্রতিটি storefront route loader এই exact shape এ data return করে:

```typescript
interface StorefrontData {
  // Store identity
  storeId: number;
  storeName: string;
  logo: string | null;
  favicon: string | null;
  fontFamily: string;
  currency: string;
  planType: string;

  // Theme
  templateId: string;             // e.g., 'dc-store', 'luxe-boutique'
  theme: StorefrontTheme;         // Colors: primary, accent, background, etc.

  // Content
  products: StorefrontProduct[];  // Serialized products array
  categories: StorefrontCategory[];
  currentCategory: string | null;

  // Settings (from Unified Settings API)
  socialLinks: StorefrontSocialLinks;
  businessInfo: StorefrontBusinessInfo;
  footerConfig: StorefrontFooterConfig | null;
  heroBanner: StorefrontHeroBanner | null;
  announcement: StorefrontAnnouncement | null;
  trustBadges: StorefrontTrustBadges | null;

  // AI Features
  aiCredits: number;
  isCustomerAiEnabled: boolean;

  // Floating Buttons
  floatingWhatsapp?: { enabled: boolean; number?: string; message?: string };
  floatingCall?: { enabled: boolean; number?: string };
}
```

### Builder Function

```typescript
import { buildStorefrontData } from '~/lib/storefront-data.server';

// In any storefront route loader:
const data = await buildStorefrontData({
  db,
  storeId,
  store: validatedStore,
  env: context.cloudflare.env,
  category: searchParams.get('category'),
});

return json(data);
```

---

## 🎨 Template System

### Template Registry (`store-registry.ts`)

```typescript
// Each template is registered with:
{
  id: 'dc-store',                        // Unique ID (stored in storefront_settings)
  name: 'DC Store',                       // Display name
  description: 'Golden gradient theme',   // Description
  thumbnail: 'https://...',               // Preview image
  category: 'general',                    // Category for filtering
  theme: DC_STORE_THEME,                  // Default color palette
  component: React.lazy(() => import('./dc-store')),   // Homepage
  Header: React.lazy(() => import('./dc-store/Header')), // Header
  Footer: React.lazy(() => import('./dc-store/Footer')), // Footer
  ProductPage: React.lazy(() => import('./dc-store/ProductPage')), // Product
  CartPage: SharedCartPage,               // Cart (shared or custom)
  CheckoutPage: SharedCheckoutPage,       // Checkout (shared or custom)
  CollectionPage: SharedCollectionPage,   // Collection (shared or custom)
  fonts: { heading: 'Inter', body: 'Inter' },
}
```

### Available Templates (18)

| # | Template | ID | Category |
|---|----------|----|----------|
| 1 | Starter Store | `starter-store` | general |
| 2 | Luxe Boutique | `luxe-boutique` | fashion |
| 3 | Nova Lux | `nova-lux` | premium |
| 4 | Ozzyl Premium | `ozzyl-premium` | premium |
| 5 | DC Store | `dc-store` | general |
| 6 | Daraz | `daraz` | marketplace |
| 7 | Eclipse | `eclipse` | dark |
| 8 | Rovo | `rovo` | tech |
| 9 | Sokol | `sokol` | minimal |
| 10 | Ghorer Bazar | `ghorer-bazar` | grocery |
| 11 | Tech Modern | `tech-modern` | tech |
| 12 | Aurora Minimal | `aurora-minimal` | minimal |
| 13 | Artisan Market | `artisan-market` | handmade |
| 14 | Freshness | `freshness` | organic |
| 15 | Turbo Sale | `turbo-sale` | sales |
| 16 | Zenith Rise | `zenith-rise` | saas |
| 17 | BDShop | `bdshop` | local |
| 18 | Nova Lux Ultra | `nova-lux-ultra` | premium |

### Template Props Interface

```typescript
interface StoreTemplateProps {
  storeName?: string;
  storeId?: string;
  logo?: string | null;
  products?: SerializedProduct[];
  categories?: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  config?: ThemeConfig;          // Hero banner, announcement, trust badges
  currency?: string;
  socialLinks?: StorefrontSocialLinks;
  footerConfig?: any;
  businessInfo?: StorefrontBusinessInfo;
  planType?: string;
  isPreview?: boolean;
  aiCredits?: number;
  isCustomerAiEnabled?: boolean;
}
```

---

## 🔑 Unified Settings API

### Read Settings

```typescript
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

const settings = await getUnifiedStorefrontSettings(db, storeId, {
  env: context.cloudflare.env,
});

// settings.theme.templateId      → 'dc-store'
// settings.theme.primary         → '#D97706'
// settings.branding.storeName    → 'My Store'
// settings.social.facebook       → 'https://facebook.com/mystore'
// settings.business.phone        → '+8801712345678'
// settings.heroBanner            → { slides: [...], mode: 'carousel' }
```

### Write Settings

```typescript
import { saveUnifiedStorefrontSettingsWithCacheInvalidation } from '~/services/unified-storefront-settings.server';

await saveUnifiedStorefrontSettingsWithCacheInvalidation(
  db,
  storeId,
  updatedSettings,
  context.cloudflare.env
);
```

### ⚠️ Rules

1. **NEVER** read from legacy columns (`themeConfig`, `businessInfo`, `socialLinks`)
2. **ALWAYS** use `getUnifiedStorefrontSettings()` for reading
3. **ALWAYS** use `saveUnifiedStorefrontSettingsWithCacheInvalidation()` for writing
4. **ALWAYS** pass `env` for KV cache support

---

## ⚙️ Store Design Dashboard

`/app/store-design` — The only UI for merchants to customize their store.

### Available Tabs

| Tab | What It Controls |
|-----|-----------------|
| **Template** | Choose from 18 templates (dc-store, luxe-boutique, etc.) |
| **Theme** | Primary color, accent color |
| **Banner** | Hero image, heading, subheading, CTA button, carousel slides |
| **Info** | Store name, logo, business info, social links |

### What It Does NOT Have

- ❌ No drag-and-drop sections
- ❌ No visual editor / live editing
- ❌ No custom HTML/CSS editing
- ❌ No block/section system

---

## ❌ What Was Removed

### Editor Systems Deleted (2026-03-26)

| System | Lines Removed | Route |
|--------|--------------|-------|
| Store Live Editor | 3,384 | `store-live-editor.tsx` |
| Page Builder v2 | ~4,000 | `app.new-builder.*` |
| GrapesJS | ~400 | `app.page-builder.*` |
| Quick Builder | ~300 | `app.quick-builder.new.tsx` |
| Template Preview | ~600 | `store-template-preview.*` |
| Editor APIs | ~500 | `api.editor-state.*`, `api.builder.*` |

### Directories Deleted

| Directory | Files | Purpose |
|-----------|-------|---------|
| `components/builder/` | 25 | Section components (Hero, FAQ, CTA, etc.) |
| `components/page-builder/` | 5 | BuilderLayout, SectionRenderer, FloatingActions |
| `components/store-builder/` | 1 | StoreAIAssistant |
| `lib/page-builder/` | 11 | Actions, cache, schemas, templates, types |
| `lib/template-builder/` | 1 | Template builder actions |

### Total Impact

- **117 files changed**
- **30,830 lines deleted**
- **253 lines added** (compatibility shims)

---

## 🆕 Adding a New Template

### Step 1: Create Template Directory

```bash
mkdir -p apps/web/app/components/store-templates/my-theme/{sections,pages}
```

### Step 2: Create Theme File

```typescript
// my-theme/theme.ts
import type { StoreTemplateTheme } from '~/templates/types';

export const MY_THEME: StoreTemplateTheme = {
  primary: '#6366F1',
  accent: '#EC4899',
  background: '#FFFFFF',
  text: '#1F2937',
  muted: '#9CA3AF',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  headerBg: '#FFFFFF',
  footerBg: '#111827',
  footerText: '#D1D5DB',
};
```

### Step 3: Create Components

```typescript
// my-theme/index.tsx
import type { StoreTemplateProps } from '~/templates/store-registry';

export function MyThemeTemplate(props: StoreTemplateProps) {
  const { storeName, products, categories, config, ...rest } = props;

  return (
    <div>
      <MyHeader storeName={storeName} />
      <MyHero config={config} />
      <MyProductGrid products={products} />
      <MyFooter />
    </div>
  );
}

// my-theme/sections/Header.tsx
// my-theme/sections/Footer.tsx
// my-theme/pages/ProductPage.tsx
```

### Step 4: Register in `store-registry.ts`

```typescript
// 1. Import theme
import { MY_THEME } from '../components/store-templates/my-theme/theme';

// 2. Lazy load components
const MyThemeTemplate = React.lazy(() =>
  import('../components/store-templates/my-theme').then((m) => ({
    default: m.MyThemeTemplate,
  }))
);
// ... Header, Footer, ProductPage

// 3. Add to STORE_TEMPLATE_THEMES
'my-theme': MY_THEME,

// 4. Add to STORE_TEMPLATES array
{
  id: 'my-theme',
  name: 'My Theme',
  description: 'A beautiful custom theme',
  thumbnail: 'https://...',
  category: 'custom',
  theme: STORE_TEMPLATE_THEMES['my-theme'],
  component: MyThemeTemplate,
  Header: MyThemeHeader,
  Footer: MyThemeFooter,
  ProductPage: MyThemeProductPage,
  CartPage: SharedCartPage,
  CheckoutPage: SharedCheckoutPage,
  CollectionPage: SharedCollectionPage,
  fonts: { heading: 'Inter', body: 'Inter' },
}
```

### Step 5: Build & Test

```bash
npm run build    # Verify no errors
npm run dev      # Test locally
```

---

## ❓ FAQ

### Q: template গুলো headless system এ কাজ করবে?

**হ্যাঁ।** ১৮টি template ইতিমধ্যেই headless। তারা কখনো সরাসরি database access করে না — সব ডেটা props হিসাবে পায়।

### Q: কোনো visual editor আবার যোগ করা যাবে?

হ্যাঁ, কিন্তু recommend করা হয় না। বর্তমান architecture এ developer-coded templates অনেক বেশি performant এবং maintainable।

### Q: কিভাবে merchant তার store customize করবে?

**Store Design Dashboard** (`/app/store-design`) দিয়ে:
- Template বেছে নেওয়া (১৮টি থেকে)
- Theme colors পরিবর্তন
- Hero banner setup
- Store info (name, logo, social links)

### Q: নতুন client এর জন্য custom theme কিভাবে বানাবো?

[Adding a New Template](#-adding-a-new-template) section অনুসরণ করুন। Template তৈরি করে `store-registry.ts` এ register করলেই হবে।

### Q: `store-sections/` directory কেন আছে?

এটি **compatibility shim** — পুরানো কিছু template (daraz, eclipse, rovo) এই directory থেকে import করে। Shim গুলো empty/no-op, তাই কোনো কার্যকরী প্রভাব নেই। ভবিষ্যতে individual template cleanup করতে হবে।

### Q: Legacy columns (themeConfig, businessInfo, socialLinks) কি ডিলিট করবো?

না, DB থেকে column delete করার দরকার নেই। কিন্তু কোডে কখনো সেগুলো read/write করা যাবে না — শুধু `storefront_settings` JSON column ব্যবহার করতে হবে।

---

## 📊 Performance Impact

| Metric | Before (with editors) | After (headless) |
|--------|----------------------|-----------------|
| Route files | ~200 + 15 editor routes | ~200 routes |
| Bundle size | Includes dnd-kit, GrapesJS refs | ~30KB lighter |
| Cold start | Loads editor code paths | Only loads template |
| Complexity | Draft/publish, undo/redo, blocks | Simple template render |
