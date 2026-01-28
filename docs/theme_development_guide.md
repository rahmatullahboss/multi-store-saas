# Theme Development Guide

**Version**: 1.0.0
**Last Updated**: January 27, 2026

This guide explains how to create new themes for Multi Store SaaS.

---

## Quick Start

### 1. Create Theme Folder

```bash
mkdir -p apps/web/app/themes/my-theme/sections
mkdir -p apps/web/app/themes/my-theme/templates
```

### 2. Create theme.json

```json
{
  "name": "My Theme",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A beautiful theme for your store",
  "colors": {
    "primary": "#3b82f6",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "surface": "#f9fafb",
    "text": "#1f2937",
    "textMuted": "#6b7280",
    "border": "#e5e7eb"
  },
  "typography": {
    "fontFamily": "'Inter', sans-serif",
    "headingFontFamily": "'Inter', sans-serif",
    "baseFontSize": 16,
    "lineHeight": 1.5
  },
  "spacing": {
    "unit": 4,
    "containerMaxWidth": "1280px",
    "containerPadding": "1rem"
  },
  "borders": {
    "radius": "0.5rem",
    "radiusLarge": "1rem",
    "width": "1px"
  }
}
```

### 3. Create Sections

Create section files in `sections/` folder:

```typescript
// sections/hero-banner.tsx
import React from 'react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome' },
    { type: 'text', id: 'subheading', label: 'Subheading', default: 'Shop now' },
    { type: 'image', id: 'background', label: 'Background Image' },
    { type: 'color', id: 'text_color', label: 'Text Color', default: '#ffffff' },
  ],
  blocks: [
    {
      type: 'button',
      name: 'Button',
      settings: [
        { type: 'text', id: 'text', label: 'Text', default: 'Shop Now' },
        { type: 'url', id: 'link', label: 'Link', default: '/products' },
      ],
    },
  ],
  max_blocks: 2,
};

export function HeroBanner({ settings, blocks, context }: SectionComponentProps) {
  const heading = settings.heading as string;
  const subheading = settings.subheading as string;
  const background = settings.background as string;
  const textColor = settings.text_color as string;

  return (
    <section
      className="min-h-[500px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundColor: background ? undefined : '#1a1a1a',
        color: textColor,
      }}
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">{heading}</h1>
        <p className="text-xl mb-8 opacity-80">{subheading}</p>

        <div className="flex gap-4 justify-center">
          {blocks?.map((block) => (
            <a
              key={block.id}
              href={block.settings?.link as string || '/products'}
              className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {block.settings?.text as string || 'Shop Now'}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
```

### 4. Create index.ts

```typescript
// index.ts
import themeConfig from './theme.json';

// Import all sections
import { HeroBanner, schema as heroBannerSchema } from './sections/hero-banner';
import {
  FeaturedCollection,
  schema as featuredCollectionSchema,
} from './sections/featured-collection';
import { Header, schema as headerSchema } from './sections/header';
import { Footer, schema as footerSchema } from './sections/footer';

export const theme = {
  id: 'my-theme',
  config: themeConfig,
  sections: {
    header: { component: Header, schema: headerSchema },
    footer: { component: Footer, schema: footerSchema },
    'hero-banner': { component: HeroBanner, schema: heroBannerSchema },
    'featured-collection': { component: FeaturedCollection, schema: featuredCollectionSchema },
  },
};

export default theme;
```

### 5. Register in ThemeBridge

Edit `~/lib/theme-engine/ThemeBridge.ts`:

```typescript
// Add import
import myTheme from '~/themes/my-theme';

// Add to THEME_REGISTRY
const THEME_REGISTRY: Record<string, Theme> = {
  'starter-store': starterStore,
  daraz: daraz,
  // ... other themes
  'my-theme': myTheme, // Add your theme
};
```

### 6. Add to store-registry.ts (Optional)

If you want theme colors available in StorePageWrapper:

```typescript
// ~/templates/store-registry.ts
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  // ... other themes
  'my-theme': {
    primary: '#3b82f6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1f2937',
    footerText: '#ffffff',
  },
};
```

---

## Section Development

### Section Component Props

```typescript
interface SectionComponentProps {
  section: {
    id: string;
    type: string;
    settings: Record<string, unknown>;
    blocks: BlockInstance[];
  };
  context: SectionContext;
  settings: Record<string, unknown>;
  blocks?: BlockInstance[];
}

interface SectionContext {
  store: { id; name; currency; logo; defaultLanguage };
  page: { type; handle };
  theme: ThemeConfig;
  products?: SerializedProduct[];
  collections?: SerializedCollection[];
  product?: SerializedProduct;
  collection?: SerializedCollection;
  cart?: CartData;
  isPreview?: boolean;
  getLink: (path: string) => string;
  onNavigate?: (path: string) => void;
}
```

### Common Patterns

#### Accessing Theme Colors

```typescript
export function MySection({ context }: SectionComponentProps) {
  const { theme } = context;

  return (
    <section style={{
      backgroundColor: theme.colors?.background,
      color: theme.colors?.text,
    }}>
      <button style={{ backgroundColor: theme.colors?.primary }}>
        Click me
      </button>
    </section>
  );
}
```

#### Rendering Products

```typescript
export function ProductGrid({ context }: SectionComponentProps) {
  const { products, store } = context;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products?.map((product) => (
        <a key={product.id} href={`/products/${product.id}`}>
          <img src={product.imageUrl || ''} alt={product.title} />
          <h3>{product.title}</h3>
          <p>{store.currency} {product.price}</p>
        </a>
      ))}
    </div>
  );
}
```

#### Using Blocks

```typescript
export function IconList({ blocks }: SectionComponentProps) {
  return (
    <div className="flex gap-8">
      {blocks?.map((block) => {
        if (block.type === 'icon-item') {
          return (
            <div key={block.id} className="text-center">
              <span className="text-4xl">{block.settings?.icon as string}</span>
              <p>{block.settings?.label as string}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
```

---

## Essential Sections

Every theme should have these sections:

### 1. Header

```typescript
export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  settings: [
    { type: 'image', id: 'logo', label: 'Logo' },
    { type: 'checkbox', id: 'show_search', label: 'Show Search', default: true },
    { type: 'checkbox', id: 'show_cart', label: 'Show Cart', default: true },
    { type: 'checkbox', id: 'sticky', label: 'Sticky Header', default: true },
  ],
  blocks: [
    {
      type: 'nav_item',
      name: 'Navigation Item',
      settings: [
        { type: 'text', id: 'label', label: 'Label', default: 'Link' },
        { type: 'url', id: 'url', label: 'URL', default: '/' },
      ],
    },
  ],
};
```

### 2. Footer

```typescript
export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  settings: [
    { type: 'text', id: 'copyright', label: 'Copyright Text' },
    { type: 'checkbox', id: 'show_social', label: 'Show Social Links', default: true },
    { type: 'checkbox', id: 'show_newsletter', label: 'Show Newsletter', default: true },
  ],
  blocks: [
    {
      type: 'link_group',
      name: 'Link Group',
      settings: [{ type: 'text', id: 'title', label: 'Group Title' }],
    },
  ],
};
```

### 3. Hero Banner

For homepage hero sections.

### 4. Featured Collection / Products

For displaying products on homepage.

### 5. Product Main (for product pages)

```typescript
export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main',
  settings: [
    { type: 'checkbox', id: 'show_gallery', label: 'Show Gallery', default: true },
    { type: 'checkbox', id: 'show_reviews', label: 'Show Reviews', default: true },
  ],
};

export function ProductMain({ context }: SectionComponentProps) {
  const { product, store } = context;

  if (!product) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8 p-8">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img src={product.imageUrl || ''} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="text-2xl mt-4">{store.currency} {product.price}</p>
        <button className="mt-8 w-full py-3 bg-black text-white rounded-lg">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### 6. Cart Items (for cart page)

```typescript
export function CartItems({ context }: SectionComponentProps) {
  const { cart, store } = context;

  return (
    <div className="space-y-4">
      {cart?.items.map((item) => (
        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
          <img src={item.image || ''} alt={item.title} className="w-20 h-20 object-cover" />
          <div className="flex-1">
            <h3>{item.title}</h3>
            <p>{store.currency} {item.price} x {item.quantity}</p>
          </div>
        </div>
      ))}
      <div className="text-right text-xl font-bold">
        Total: {store.currency} {cart?.total}
      </div>
    </div>
  );
}
```

---

## Testing Your Theme

### 1. Run Development Server

```bash
cd apps/web
npm run dev
```

### 2. Set Theme for a Store

In the store's `themeConfig` (database or admin panel):

```json
{
  "storeTemplateId": "my-theme"
}
```

### 3. Open Live Editor

Go to: `/app/store-design` → "Open Live Editor"

### 4. Test All Page Types

- Homepage (`/`)
- Product page (`/products/{id}`)
- Collection page (`/collections/{slug}`)
- Cart page (`/cart`)
- Custom pages (`/pages/{slug}`)

---

## Best Practices

### 1. Use Theme Colors

Always reference `context.theme.colors` instead of hardcoding:

```typescript
// Good
style={{ color: context.theme.colors?.primary }}

// Bad
style={{ color: '#3b82f6' }}
```

### 2. Handle Missing Data

```typescript
// Good
{products?.length > 0 && (
  <div>...</div>
)}

// Bad - will crash if products is undefined
{products.map(...)}
```

### 3. Provide Sensible Defaults

```typescript
const heading = (settings.heading as string) || 'Welcome';
const buttonText = (block.settings?.text as string) || 'Learn More';
```

### 4. Mobile Responsive

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### 5. Accessibility

```typescript
<button aria-label="Add to cart">
  <ShoppingCart />
</button>

<img alt={product.title} /> // Always have alt text
```

---

## Checklist for New Theme

- [ ] `theme.json` with colors, typography, spacing
- [ ] `index.ts` exporting theme config and sections
- [ ] Header section
- [ ] Footer section
- [ ] Hero banner section
- [ ] Featured products/collection section
- [ ] Product main section (for product pages)
- [ ] Cart items section (for cart page)
- [ ] Collection grid section (for collection pages)
- [ ] Registered in ThemeBridge.ts
- [ ] Added to store-registry.ts (optional)
- [ ] Tested on all page types
- [ ] Mobile responsive
- [ ] Handles missing data gracefully

---

## See Also

- [THEME_SYSTEM_GUIDE.md](THEME_SYSTEM_GUIDE.md) - System architecture
- [FUTURE_FEATURES.md](FUTURE_FEATURES.md) - Theme marketplace & external themes
