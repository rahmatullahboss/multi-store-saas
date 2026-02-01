# 🎨 MVP Theme System - Complete Guide

> **Status**: ✅ Active System (Legacy/Simple Theme System)  
> **Last Updated**: February 1, 2026  
> **Version**: 1.0 (MVP Launch Ready)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Customization Options](#customization-options)
5. [Available Themes](#available-themes)
6. [Adding New Themes](#adding-new-themes)
7. [Developer Guide](#developer-guide)
8. [Migration Path](#migration-path)

---

## 🎯 Overview

The **MVP Theme System** is a simplified, production-ready theme system for the Ozzyl multi-store SaaS platform. It uses **pre-built React component templates** (1000+ lines each) instead of the complex Shopify OS 2.0 section-based system.

### Why This System?

**Decision**: After attempting to implement Shopify OS 2.0 theme system, we rolled back to this proven system for MVP because:

✅ **Proven & Stable** - Already working in production  
✅ **Fast Performance** - No runtime section parsing  
✅ **Simple Maintenance** - Single template component per theme  
✅ **Easy Customization** - Just 2 colors + logo + fonts  
✅ **Consistent** - Same header/footer across all pages  

### What's Frozen (For Future)

🔵 **Shopify OS 2.0 System** - Located in `apps/web/app/themes/` and `ThemeBridge.ts`  
- Full section-based customization  
- Visual drag-and-drop editor  
- Database-driven templates  
- **Status**: Frozen for post-MVP v2.0 release

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP THEME SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DATABASE (stores table)                                  │
│     ┌──────────────────────────────────────┐                │
│     │ themeConfig: JSON {                  │                │
│     │   storeTemplateId: 'ghorer-bazar',   │                │
│     │   primaryColor: '#fc8934',           │                │
│     │   accentColor: '#e53935'             │                │
│     │ }                                    │                │
│     │ logo: 'https://...'                  │                │
│     │ favicon: 'https://...'               │                │
│     └──────────────────────────────────────┘                │
│                          ↓                                   │
│  2. STORE REGISTRY (store-registry.ts)                      │
│     ┌──────────────────────────────────────┐                │
│     │ STORE_TEMPLATES = [                  │                │
│     │   {                                  │                │
│     │     id: 'ghorer-bazar',              │                │
│     │     component: GhorerBazarTemplate,  │                │
│     │     theme: { primary, accent, ... }  │                │
│     │     fonts: { heading, body }         │                │
│     │   }                                  │                │
│     │ ]                                    │                │
│     └──────────────────────────────────────┘                │
│                          ↓                                   │
│  3. ROUTE LOADERS (store.home.tsx, products.$id.tsx)       │
│     ┌──────────────────────────────────────┐                │
│     │ • Get themeConfig from DB            │                │
│     │ • Merge with base theme colors       │                │
│     │ • Pass to template component         │                │
│     └──────────────────────────────────────┘                │
│                          ↓                                   │
│  4. TEMPLATE COMPONENTS (React - 1000+ lines)               │
│     ┌──────────────────────────────────────┐                │
│     │ <GhorerBazarTemplate                 │                │
│     │   storeName={storeName}              │                │
│     │   theme={theme}                      │                │
│     │   products={products}                │                │
│     │ />                                   │                │
│     └──────────────────────────────────────┘                │
│                          ↓                                   │
│  5. CSS VARIABLES (StorePageWrapper)                        │
│     ┌──────────────────────────────────────┐                │
│     │ :root {                              │                │
│     │   --color-primary: #fc8934;          │                │
│     │   --color-accent: #e53935;           │                │
│     │   --font-heading: 'Noto Sans';       │                │
│     │   --font-body: 'Noto Sans';          │                │
│     │ }                                    │                │
│     └──────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 How It Works

### Step-by-Step Flow

#### 1. Store Request Arrives

```
User visits: mystore.ozzyl.com/
           ↓
    Cloudflare Edge
           ↓
   resolveStore() → storeId
```

#### 2. Loader Fetches Data

```typescript
// apps/web/app/routes/store.home.tsx

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  const { storeId, store } = storeContext;
  
  // Parse theme config
  const themeConfig = parseThemeConfig(store.themeConfig);
  const storeTemplateId = themeConfig?.storeTemplateId || 'starter-store';
  
  // Get base theme colors
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  
  // Merge with user customizations
  const theme = {
    ...baseTheme,
    primary: themeConfig?.primaryColor || baseTheme.primary,
    accent: themeConfig?.accentColor || baseTheme.accent,
  };
  
  return json({ storeName, logo, theme, products, ... });
}
```

#### 3. Template Renders

```typescript
export default function StoreHomePage() {
  const { storeName, theme, products } = useLoaderData<typeof loader>();
  
  // Get template component
  const template = getStoreTemplate(storeTemplateId);
  const TemplateComponent = template.component;
  
  return (
    <StorePageWrapper theme={theme}>
      <TemplateComponent
        storeName={storeName}
        products={products}
        theme={storeTemplateId}
        config={{ primaryColor: theme.primary }}
      />
    </StorePageWrapper>
  );
}
```

#### 4. CSS Variables Applied

```typescript
// apps/web/app/components/store-layouts/StorePageWrapper.tsx

const cssVariables = `
  :root {
    --color-primary: ${resolvedTheme.primary};
    --color-accent: ${resolvedTheme.accent};
    --font-heading: ${template.fonts?.heading};
    --font-body: ${template.fonts?.body};
  }
`;

return (
  <>
    <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
    <div>{children}</div>
  </>
);
```

---

## 🎨 Customization Options

### For Merchants (Simple Settings)

Merchants can customize **5 settings** via the admin dashboard:

| Setting | Description | Example |
|---------|-------------|---------|
| **Theme** | Select from 5 MVP themes | `ghorer-bazar` |
| **Logo** | Store logo image | Upload .png/.jpg |
| **Favicon** | Browser tab icon | Upload .ico/.png |
| **Primary Color** | Brand color (buttons, links) | `#fc8934` |
| **Accent Color** | Highlight color (badges, CTAs) | `#e53935` |

### Settings Page Location

```
Admin Dashboard → Store Settings → Appearance
Route: /app/store/settings
File: apps/web/app/routes/app.store.settings.tsx
```

### How Settings are Stored

```sql
-- stores table
CREATE TABLE stores (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  favicon TEXT,
  themeConfig TEXT, -- JSON: { storeTemplateId, primaryColor, accentColor }
  ...
);
```

Example `themeConfig`:
```json
{
  "storeTemplateId": "ghorer-bazar",
  "primaryColor": "#fc8934",
  "accentColor": "#e53935"
}
```

---

## 🎭 Available Themes

### MVP Themes (Launch Ready)

| Theme ID | Name | Best For | Colors |
|----------|------|----------|--------|
| `starter-store` | Starter Store | General purpose | Indigo + Amber |
| `ghorer-bazar` | ঘরের বাজার | Grocery/Food | Orange + Red |
| `luxe-boutique` | Luxe Boutique | Fashion/Luxury | Black + Gold |
| `nova-lux` | NovaLux Premium | Premium Lifestyle | Charcoal + Rose Gold |
| `tech-modern` | Tech Modern | Electronics | Dark Slate + Blue |

### Theme Details

#### 1. Starter Store (Default)

```typescript
{
  id: 'starter-store',
  primaryColor: '#4F46E5', // Indigo
  accentColor: '#F59E0B',  // Amber
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  }
}
```

**Use Case**: Clean, modern design for any product type  
**Target**: New merchants who want a simple, professional look

#### 2. Ghorer Bazar (Bangladeshi Grocery)

```typescript
{
  id: 'ghorer-bazar',
  primaryColor: '#fc8934', // Orange (exact from ghorerbazar.com)
  accentColor: '#e53935',  // Red
  fonts: {
    heading: 'Noto Sans Bengali',
    body: 'Noto Sans Bengali'
  }
}
```

**Use Case**: Grocery, food delivery, local markets  
**Target**: Bangladeshi grocery stores  
**Special**: Bengali fonts, COD-focused checkout

#### 3. Luxe Boutique

```typescript
{
  id: 'luxe-boutique',
  primaryColor: '#1a1a1a', // Black
  accentColor: '#c9a961',  // Gold
  fonts: {
    heading: 'Playfair Display',
    body: 'Inter'
  }
}
```

**Use Case**: High-end fashion, jewelry, luxury goods  
**Target**: Premium brands  
**Special**: Elegant serif headings, minimalist design

#### 4. NovaLux Premium

```typescript
{
  id: 'nova-lux',
  primaryColor: '#1C1C1E', // Charcoal
  accentColor: '#C4A35A',  // Rose Gold
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'DM Sans'
  }
}
```

**Use Case**: Luxury lifestyle, premium fashion  
**Target**: World-class brands  
**Special**: Transparent header, elegant animations

#### 5. Tech Modern

```typescript
{
  id: 'tech-modern',
  primaryColor: '#0f172a', // Dark Slate
  accentColor: '#3b82f6',  // Blue
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  }
}
```

**Use Case**: Electronics, gadgets, tech products  
**Target**: Tech retailers  
**Special**: Clean, bold design with blue accents

---

## 🛠️ Adding New Themes

### Step 1: Create Template Component

Create a new file in `apps/web/app/components/store-templates/`:

```typescript
// apps/web/app/components/store-templates/my-new-theme/index.tsx

import type { StoreTemplateProps } from '~/templates/store-registry';

export function MyNewThemeTemplate({
  storeName,
  logo,
  products,
  theme,
  currency,
  config,
}: StoreTemplateProps) {
  return (
    <div className="my-theme">
      <header style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1>{storeName}</h1>
      </header>
      
      <main>
        <section className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.title} />
              <h3>{product.title}</h3>
              <p style={{ color: 'var(--color-accent)' }}>
                {formatPrice(product.price, currency)}
              </p>
            </div>
          ))}
        </section>
      </main>
      
      <footer>
        <p>© {storeName}</p>
      </footer>
    </div>
  );
}
```

### Step 2: Create Header & Footer Components

```typescript
// apps/web/app/components/store-templates/my-new-theme/sections/Header.tsx

export function MyNewThemeHeader({ storeName, logo, categories }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Header content */}
    </header>
  );
}

// apps/web/app/components/store-templates/my-new-theme/sections/Footer.tsx

export function MyNewThemeFooter({ storeName, socialLinks }) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      {/* Footer content */}
    </footer>
  );
}
```

### Step 3: Register in Store Registry

Add to `apps/web/app/templates/store-registry.ts`:

```typescript
// Import components
import { MyNewThemeTemplate } from '~/components/store-templates/my-new-theme';
import { MyNewThemeHeader } from '~/components/store-templates/my-new-theme/sections/Header';
import { MyNewThemeFooter } from '~/components/store-templates/my-new-theme/sections/Footer';

// Add theme colors
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  // ... existing themes
  'my-new-theme': {
    primary: '#6366f1',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#111827',
    footerText: '#ffffff',
  },
};

// Add to templates array
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  // ... existing templates
  {
    id: 'my-new-theme',
    name: 'My New Theme',
    description: 'A beautiful new theme for ...',
    thumbnail: '/templates/my-new-theme.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['my-new-theme'],
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    component: MyNewThemeTemplate,
    Header: MyNewThemeHeader,
    Footer: MyNewThemeFooter,
  },
];

// Add to MVP themes (if for MVP)
export const MVP_THEME_IDS = [
  'starter-store',
  'ghorer-bazar',
  'luxe-boutique',
  'nova-lux',
  'tech-modern',
  'my-new-theme', // <-- Add here
] as const;
```

### Step 4: Test the Theme

```bash
# 1. Run dev server
npm run dev

# 2. Go to admin dashboard
http://localhost:5173/app/store/settings

# 3. Select your new theme
# 4. Customize colors
# 5. View storefront
```

---

## 👨‍💻 Developer Guide

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/app/templates/store-registry.ts` | Theme registry & definitions |
| `apps/web/app/components/store-templates/` | Template components |
| `apps/web/app/components/store-layouts/StorePageWrapper.tsx` | CSS variables injection |
| `apps/web/app/routes/store.home.tsx` | Homepage route |
| `apps/web/app/routes/products.$id.tsx` | Product detail route |
| `apps/web/app/routes/cart.tsx` | Cart route |
| `apps/web/app/routes/collections.$slug.tsx` | Collection route |
| `apps/web/app/routes/app.store.settings.tsx` | Admin settings page |

### Using CSS Variables

All themes use CSS variables for consistency:

```css
/* Available CSS variables */
:root {
  --color-primary: #fc8934;
  --color-accent: #e53935;
  --color-background: #ffffff;
  --color-text: #111827;
  --color-muted: #6b7280;
  --color-card-bg: #ffffff;
  --color-header-bg: #ffffff;
  --color-footer-bg: #1a1a1a;
  --color-footer-text: #ffffff;
  --font-heading: 'Noto Sans Bengali', sans-serif;
  --font-body: 'Noto Sans Bengali', sans-serif;
}

/* Usage in components */
.button {
  background-color: var(--color-primary);
  color: white;
}

.badge {
  background-color: var(--color-accent);
}

h1, h2, h3 {
  font-family: var(--font-heading);
}

body {
  font-family: var(--font-body);
}
```

### Template Props Interface

```typescript
export interface StoreTemplateProps {
  storeName: string;
  storeId: number;
  logo?: string | null;
  theme?: string | null;
  fontFamily?: string | null;
  products: SerializedProduct[];
  categories: (string | null)[];
  currentCategory?: string | null;
  config: ThemeConfig | null;
  currency: string;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  planType?: string;
  isPreview?: boolean;
}
```

### Best Practices

1. **Always use CSS variables** - Never hardcode colors
2. **Support both light and dark modes** - Check `config` prop
3. **Make responsive** - Mobile-first design
4. **Optimize images** - Use lazy loading
5. **SEO-friendly** - Proper heading hierarchy
6. **Accessible** - ARIA labels, keyboard navigation
7. **Performance** - Code split heavy components

---

## 🚀 Migration Path

### Future: Migrating to Shopify OS 2.0 System

When ready to upgrade to the full section-based system:

#### Phase 1: Enable Both Systems

```typescript
// Allow stores to choose between systems
if (store.useNewThemeSystem) {
  return <ThemeStoreRenderer themeId={themeId} sections={sections} />;
} else {
  return <LegacyTemplateComponent {...props} />;
}
```

#### Phase 2: Migrate MVP Settings

```typescript
// Convert MVP settings to Shopify 2.0 format
const migratedTemplate = {
  sections: {
    'header-1': {
      type: 'header',
      settings: {
        logo: mvpSettings.logo,
        backgroundColor: mvpSettings.primaryColor,
      }
    },
    'hero-1': {
      type: 'hero-banner',
      settings: {
        headingColor: mvpSettings.primaryColor,
        buttonColor: mvpSettings.accentColor,
      }
    }
  }
};
```

#### Phase 3: Gradual Rollout

1. New stores → Shopify 2.0 system
2. Existing stores → Keep MVP system (stable)
3. Offer opt-in migration tool
4. Eventually deprecate MVP system (1-2 years)

---

## 📊 System Comparison

| Feature | MVP System | Shopify 2.0 System |
|---------|------------|-------------------|
| **Complexity** | Low ⭐ | High ⭐⭐⭐⭐⭐ |
| **Customization** | 5 settings | Unlimited |
| **Performance** | Very Fast 🚀 | Fast |
| **Development Time** | Days | Weeks |
| **Maintenance** | Easy ✅ | Complex |
| **Visual Editor** | ❌ No | ✅ Yes |
| **Section Reordering** | ❌ No | ✅ Yes |
| **Database Queries** | 1 query | Multiple queries |
| **Consistency** | ✅ Guaranteed | Requires testing |
| **Production Ready** | ✅ Yes | 🟡 Needs work |

---

## 🎯 Summary

The **MVP Theme System** is the proven, stable choice for launch:

✅ **5 beautiful themes** ready for Bangladesh market  
✅ **Simple customization** (logo + 2 colors)  
✅ **Fast performance** (no runtime parsing)  
✅ **Consistent design** (same header/footer everywhere)  
✅ **Production tested** (already running in production)  

**Next Steps**:
1. ✅ MVP Launch with this system
2. 📈 Gather merchant feedback
3. 🔄 Iterate on Shopify 2.0 system
4. 🚀 Launch visual editor in v2.0

---

**Questions?** Check the main [AGENTS.md](../AGENTS.md) file for system architecture details.
