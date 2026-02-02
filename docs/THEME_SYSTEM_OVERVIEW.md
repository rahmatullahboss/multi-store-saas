# 🎨 Theme System Overview - Definitive Guide

> **⚠️ CRITICAL**: This document eliminates confusion between our two theme systems.
>
> **🟢 ACTIVE SYSTEM**: MVP Simple Theme System (legacy React components)
> **🔴 FROZEN SYSTEM**: Shopify OS 2.0 (section-based, stored in `themes/` folder)
>
> **Version**: 2.0.0 | **Last Updated**: February 2, 2026

---

## 📋 Quick Reference

| Question                          | Answer                                              |
| --------------------------------- | --------------------------------------------------- |
| **Which system is running?**      | MVP Simple Theme System (React components)          |
| **Which system is frozen?**       | Shopify OS 2.0 (section-based, in `themes/` folder) |
| **How do I create a new theme?**  | Use `store-templates/` folder, NOT `themes/` folder |
| **Where are themes registered?**  | `apps/web/app/templates/store-registry.ts`          |
| **Where is the admin settings?**  | `/app/store-design` or `/app/store/settings`        |
| **Can I use Shopify 2.0 system?** | ❌ NO - It's frozen for post-MVP                    |
| **Migration timeline?**           | After MVP launch, in v2.0 release                   |

---

## 🎯 Understanding Our Two Systems

### System 1: MVP Simple Theme System (🟢 ACTIVE)

This is the **production system** currently serving all stores.

**Architecture**:

- **Components**: Large React components (1000+ lines each)
- **Customization**: 5 simple settings (theme, logo, primary/accent colors, announcement)
- **Storage**: Single `themeConfig` JSON column in `stores` table
- **Rendering**: Direct React component rendering (fast, no runtime overhead)
- **Consistency**: Same header/footer across all pages

**File Locations**:

```
apps/web/app/components/store-templates/     ← Template components (ACTIVE)
apps/web/app/templates/store-registry.ts     ← Theme registry (ACTIVE)
```

**Available Themes**:

1. `starter-store` - Clean, minimal (default)
2. `ghorer-bazar` - Bangladeshi grocery style
3. `luxe-boutique` - Luxury black/gold
4. `nova-lux` - Premium charcoal/rose gold
5. `tech-modern` - Electronics dark theme

---

### System 2: Shopify OS 2.0 (🔴 FROZEN)

This system is **NOT ACTIVE**. It's frozen for post-MVP v2.0 release.

**Architecture**:

- **Components**: Small, reusable section components
- **Customization**: Unlimited sections, blocks, and settings
- **Storage**: Database tables (template_sections_draft, template_sections_published)
- **Rendering**: Dynamic section loading and rendering (slower, more queries)
- **Editor**: Visual drag-and-drop editor

**File Locations**:

```
apps/web/app/themes/                         ← Section components (FROZEN)
apps/web/app/lib/theme-engine/              ← Theme engine (FROZEN)
```

**Why Frozen?**

1. ✅ MVP Simple system is proven and stable
2. ⚠️ Shopify 2.0 system has bugs and needs extensive testing
3. 🚀 We need to launch MVP quickly
4. 📅 Full system planned for v2.0 release

---

## 🏗️ System Architecture Comparison

### MVP Simple System (ACTIVE)

```
┌─────────────────────────────────────────────────────────────┐
│  MVP SIMPLE THEME SYSTEM (Production)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database                                                    │
│  ┌─────────────────────────────────────┐                    │
│  │ stores table                        │                    │
│  │  • themeConfig (JSON)               │                    │
│  │  • logo                             │                    │
│  │  • favicon                          │                    │
│  └──────────────┬──────────────────────┘                    │
│                 ↓                                            │
│  ┌─────────────────────────────────────┐                    │
│  │ Loader (store.home.tsx)             │                    │
│  │  1. Parse themeConfig               │                    │
│  │  2. Get base theme colors           │                    │
│  │  3. Merge with user settings        │                    │
│  └──────────────┬──────────────────────┘                    │
│                 ↓                                            │
│  ┌─────────────────────────────────────┐                    │
│  │ Template Component                  │                    │
│  │  (1000+ lines React component)      │                    │
│  │                                     │                    │
│  │  <GhorerBazarTemplate               │                    │
│  │    theme={mergedTheme}              │                    │
│  │    products={products}              │                    │
│  │  />                                 │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  ✅ Simple  │  ✅ Fast  │  ✅ Stable  │  ✅ Consistent       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Shopify 2.0 System (FROZEN)

```
┌─────────────────────────────────────────────────────────────┐
│  SHOPIFY OS 2.0 SYSTEM (Frozen for v2.0)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database                                                    │
│  ┌─────────────────────────────────────┐                    │
│  │ template_sections_published         │                    │
│  │ template_sections_draft             │                    │
│  │ theme_settings_published            │                    │
│  └──────────────┬──────────────────────┘                    │
│                 ↓                                            │
│  ┌─────────────────────────────────────┐                    │
│  │ Loader                              │                    │
│  │  1. Query sections from DB          │                    │
│  │  2. Load section schemas            │                    │
│  │  3. Resolve settings                │                    │
│  └──────────────┬──────────────────────┘                    │
│                 ↓                                            │
│  ┌─────────────────────────────────────┐                    │
│  │ ThemeStoreRenderer                  │                    │
│  │                                     │                    │
│  │  sections.map(section =>           │                    │
│  │    <SectionComponent               │                    │
│  │      settings={resolved}           │                    │
│  │    />                               │                    │
│  │  )                                  │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  🔵 Complex  │  🔵 Many Queries  │  🟡 Needs Testing        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

### Active System (What You Should Use)

```
apps/web/app/
├── components/store-templates/           ← TEMPLATE COMPONENTS (ACTIVE)
│   ├── starter-store/
│   │   ├── index.tsx                     ← Main template component
│   │   ├── sections/
│   │   │   ├── Header.tsx                ← Header section
│   │   │   └── Footer.tsx                ← Footer section
│   │   └── pages/
│   │       ├── ProductPage.tsx           ← Product page
│   │       └── CartPage.tsx              ← Cart page
│   ├── ghorer-bazar/
│   ├── luxe-boutique/
│   ├── nova-lux/
│   └── tech-modern/
│
├── templates/
│   └── store-registry.ts                 ← THEME REGISTRY (ACTIVE)
│
├── components/store-layouts/
│   └── StorePageWrapper.tsx              ← CSS variables injection
│
└── routes/
    ├── store.home.tsx                    ← Homepage route
    ├── products.$id.tsx                  ← Product route
    ├── cart.tsx                          ← Cart route
    ├── app.store-design.tsx              ← Admin theme page
    └── app.store.settings.tsx            ← Admin settings page
```

### Frozen System (Do NOT Use)

```
apps/web/app/
├── themes/                               ← ❌ FROZEN - DO NOT USE
│   ├── starter-store/
│   │   ├── index.ts                      ← Theme exports
│   │   ├── theme.json                    ← Theme config
│   │   └── sections/
│   │       ├── header.tsx                ← Section components
│   │       └── hero-banner.tsx
│   └── ... (other themes)
│
└── lib/theme-engine/                     ← ❌ FROZEN - DO NOT USE
    ├── ThemeBridge.ts                    ← Theme loader
    ├── types/index.ts                    ← TypeScript types
    └── utils/
        ├── theme-config-converter.ts     ← Config converter
        └── template-factory.ts           ← Template factory
```

---

## 🎨 Theme Building Guide (For MVP System)

### Step 1: Create Template Folder Structure

```bash
mkdir -p apps/web/app/components/store-templates/my-theme/sections
mkdir -p apps/web/app/components/store-templates/my-theme/pages
```

### Step 2: Create Main Template Component

Create `apps/web/app/components/store-templates/my-theme/index.tsx`:

```typescript
import type { StoreTemplateProps } from '~/templates/store-registry';
import { MyThemeHeader } from './sections/Header';
import { MyThemeFooter } from './sections/Footer';

export function MyThemeTemplate({
  storeName,
  logo,
  products,
  theme,
  currency,
  config,
}: StoreTemplateProps) {
  return (
    <div className="my-theme">
      {/* Use CSS variables for theme colors */}
      <header style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1 style={{ color: 'var(--color-header-text)' }}>{storeName}</h1>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero" style={{ backgroundColor: 'var(--color-accent)' }}>
          <h2>Welcome to {storeName}</h2>
        </section>

        {/* Products Grid */}
        <section className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.title} />
              <h3>{product.title}</h3>
              <p style={{ color: 'var(--color-accent)' }}>
                {currency} {product.price}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer style={{ backgroundColor: 'var(--color-footer-bg)' }}>
        <p style={{ color: 'var(--color-footer-text)' }}>© {storeName}</p>
      </footer>
    </div>
  );
}

export { MyThemeHeader } from './sections/Header';
export { MyThemeFooter } from './sections/Footer';
```

### Step 3: Create Header Component

Create `apps/web/app/components/store-templates/my-theme/sections/Header.tsx`:

```typescript
import { Link } from '@remix-run/react';

interface HeaderProps {
  storeName: string;
  logo?: string | null;
  categories?: string[];
  cartCount?: number;
}

export function MyThemeHeader({ storeName, logo, categories, cartCount }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: 'var(--color-header-bg)' }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={storeName} className="h-10" />
          ) : (
            <h1 style={{ color: 'var(--color-primary)' }} className="text-xl font-bold">
              {storeName}
            </h1>
          )}
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat}
              to={`/collections/${cat}`}
              style={{ color: 'var(--color-text)' }}
              className="hover:opacity-80"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link to="/cart" className="relative">
          <span style={{ color: 'var(--color-primary)' }}>Cart</span>
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
```

### Step 4: Create Footer Component

Create `apps/web/app/components/store-templates/my-theme/sections/Footer.tsx`:

```typescript
interface FooterProps {
  storeName: string;
  socialLinks?: { facebook?: string; instagram?: string };
}

export function MyThemeFooter({ storeName, socialLinks }: FooterProps) {
  return (
    <footer
      className="py-12 mt-16"
      style={{ backgroundColor: 'var(--color-footer-bg)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 style={{ color: 'var(--color-footer-text)' }} className="font-bold mb-4">
              {storeName}
            </h3>
            <p style={{ color: 'var(--color-footer-text)', opacity: 0.8 }}>
              Your trusted store for quality products.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ color: 'var(--color-footer-text)' }} className="font-bold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" style={{ color: 'var(--color-footer-text)', opacity: 0.8 }}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" style={{ color: 'var(--color-footer-text)', opacity: 0.8 }}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 style={{ color: 'var(--color-footer-text)' }} className="font-bold mb-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener">
                  <span style={{ color: 'var(--color-footer-text)' }}>Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p style={{ color: 'var(--color-footer-text)', opacity: 0.6 }} className="text-center">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Step 5: Register in Store Registry

Edit `apps/web/app/templates/store-registry.ts`:

```typescript
// 1. Import your components
import {
  MyThemeTemplate,
  MyThemeHeader,
  MyThemeFooter,
} from '~/components/store-templates/my-theme';

// 2. Add theme colors
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  // ... existing themes

  'my-theme': {
    primary: '#3b82f6', // Blue
    accent: '#f59e0b', // Amber
    background: '#ffffff', // White
    text: '#1f2937', // Dark gray
    muted: '#6b7280', // Gray
    cardBg: '#ffffff', // White
    headerBg: '#ffffff', // White
    footerBg: '#1f2937', // Dark
    footerText: '#ffffff', // White
  },
};

// 3. Add to templates array
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  // ... existing templates

  {
    id: 'my-theme',
    name: 'My Custom Theme',
    description: 'A beautiful custom theme for your store',
    thumbnail: '/templates/my-theme.png',
    category: 'custom',
    theme: STORE_TEMPLATE_THEMES['my-theme'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: MyThemeTemplate,
    Header: MyThemeHeader,
    Footer: MyThemeFooter,
  },
];

// 4. Export types
export interface StoreTemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  theme: StoreTemplateTheme;
  fonts: {
    heading: string;
    body: string;
  };
  component: ComponentType<StoreTemplateProps>;
  Header?: ComponentType<StoreHeaderProps>;
  Footer?: ComponentType<StoreFooterProps>;
  ProductCard?: ComponentType<ProductCardProps>;
}
```

### Step 6: Test Your Theme

```bash
# 1. Start development server
cd apps/web
npm run dev

# 2. Go to admin panel
open http://localhost:5173/app/store-design

# 3. Select your new theme from the dropdown

# 4. Customize colors and view the preview

# 5. Visit storefront to see it live
open http://localhost:5173/
```

---

## 🎨 CSS Variables Reference

All themes must use these CSS variables for consistency:

```css
/* Core Colors */
--color-primary: #3b82f6; /* Buttons, links, headings */
--color-accent: #f59e0b; /* Badges, highlights, CTAs */
--color-background: #ffffff; /* Page background */
--color-text: #1f2937; /* Body text */
--color-muted: #6b7280; /* Secondary text */

/* Component Colors */
--color-card-bg: #ffffff; /* Product cards */
--color-header-bg: #ffffff; /* Header background */
--color-footer-bg: #1f2937; /* Footer background */
--color-footer-text: #ffffff; /* Footer text */
--color-border: #e5e7eb; /* Borders */

/* Typography */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Using CSS Variables in Components

```typescript
// ✅ CORRECT - Use CSS variables
<button style={{ backgroundColor: 'var(--color-primary)' }}>
  Buy Now
</button>

// ❌ WRONG - Hardcoded colors
<button style={{ backgroundColor: '#3b82f6' }}>
  Buy Now
</button>
```

---

## 📊 Feature Comparison

| Feature                | MVP System (Active)                | Shopify 2.0 (Frozen)        |
| ---------------------- | ---------------------------------- | --------------------------- |
| **Status**             | 🟢 Production                      | 🔴 Frozen                   |
| **Components**         | Large React templates              | Small section components    |
| **Customization**      | 5 settings (theme, logo, 2 colors) | Unlimited sections & blocks |
| **Visual Editor**      | ❌ No                              | ✅ LiveEditorV2             |
| **Section Reordering** | ❌ No                              | ✅ Yes                      |
| **Database Queries**   | 1 (fast)                           | 4+ (slower)                 |
| **Performance**        | Excellent                          | Good                        |
| **Consistency**        | ✅ Guaranteed                      | Needs testing               |
| **Development**        | Fast (days)                        | Slow (weeks)                |
| **Maintenance**        | Easy                               | Complex                     |

---

## ❓ FAQ

### Q: I see a `themes/` folder. Should I use it?

**A:** ❌ NO! The `themes/` folder contains the frozen Shopify 2.0 system. Use `components/store-templates/` instead.

### Q: How do I add a new section to a theme?

**A:** Edit the template component directly. For example, to add a testimonial section to ghorer-bazar, edit `components/store-templates/ghorer-bazar/index.tsx`.

### Q: Can I enable the Shopify 2.0 system?

**A:** ❌ NO. It's frozen for post-MVP. All stores use the MVP system.

### Q: Where do I customize colors?

**A:** Go to `/app/store-design` or `/app/store/settings` in the admin panel.

### Q: What if I need more than 2 colors?

**A:** For MVP, we only support primary and accent colors. The full color system will come in v2.0 with the Shopify system.

### Q: How do I create a new theme for MVP?

**A:** Follow the **Theme Building Guide** above. Create components in `store-templates/`, register in `store-registry.ts`.

### Q: When will Shopify 2.0 be available?

**A:** Planned for v2.0 release after MVP launch. Timeline depends on merchant feedback.

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Using the `themes/` folder

```
❌ WRONG: Edit files in apps/web/app/themes/
✅ CORRECT: Edit files in apps/web/app/components/store-templates/
```

### ❌ Mistake 2: Using ThemeBridge

```typescript
❌ WRONG: Using ThemeBridge in new code
import { getThemeBridge } from '~/lib/theme-engine/ThemeBridge';

✅ CORRECT: Use store-registry
import { getStoreTemplate } from '~/templates/store-registry';
```

### ❌ Mistake 3: Hardcoding Colors

```typescript
❌ WRONG: Hardcoded colors
<button className="bg-blue-500 text-white">

✅ CORRECT: CSS variables
<button style={{ backgroundColor: 'var(--color-primary)' }}>
```

### ❌ Mistake 4: Creating Sections in themes/ folder

```
❌ WRONG: Create section in apps/web/app/themes/my-theme/sections/

✅ CORRECT: Create section in apps/web/app/components/store-templates/my-theme/sections/
```

---

## 📚 Related Documentation

- [THEME_SYSTEM_GUIDE.md](./THEME_SYSTEM_GUIDE.md) - Shopify 2.0 system (frozen)
- [THEME_DEVELOPMENT_GUIDE.md](./THEME_DEVELOPMENT_GUIDE.md) - Shopify 2.0 development (frozen)
- [MVP_THEME_SYSTEM.md](./MVP_THEME_SYSTEM.md) - MVP system details
- [AGENTS.md](../AGENTS.md) - Main project documentation

---

## 🎯 Summary

**For MVP Launch**:

1. Use **MVP Simple Theme System** (React components in `store-templates/`)
2. Customize via `/app/store-design` (5 settings only)
3. Create new themes following the guide above
4. **DO NOT** use the `themes/` folder or Shopify 2.0 system

**Post-MVP (v2.0)**:

- Shopify 2.0 system will be re-enabled
- Gradual migration path will be provided
- Visual editor will be available

**Remember**: When in doubt, check this document. The MVP system is simpler but proven and stable. 🇧🇩🚀
