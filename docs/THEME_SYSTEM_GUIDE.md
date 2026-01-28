# Theme System Guide - Shopify OS 2.0 Architecture

**Version**: 1.0.0
**Last Updated**: January 27, 2026

---

## Overview

Multi Store SaaS uses a **Shopify OS 2.0 compatible theme system** that provides:

- JSON-based section schemas with settings and blocks
- Visual drag-and-drop editor (LiveEditorV2)
- Database-backed draft/publish workflow
- Theme-specific section components
- Full storefront rendering via ThemeStoreRenderer

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         THEME SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐    │
│  │   Themes    │────▶│ ThemeBridge │────▶│ Section Registry│    │
│  │ ~/themes/*  │     │             │     │                 │    │
│  └─────────────┘     └─────────────┘     └─────────────────┘    │
│         │                   │                     │              │
│         ▼                   ▼                     ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐    │
│  │ theme.json  │     │  Sections   │     │ Section Schemas │    │
│  │   Config    │     │ Components  │     │  (settings)     │    │
│  └─────────────┘     └─────────────┘     └─────────────────┘    │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         RENDERING                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  ThemeStoreRenderer                      │    │
│  │  - Loads theme via ThemeBridge                          │    │
│  │  - Resolves sections from DB template                   │    │
│  │  - Renders section components with settings             │    │
│  │  - Provides context (products, collections, cart)       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │ store.home  │     │products.$id │     │   cart.tsx  │        │
│  │    .tsx     │     │    .tsx     │     │             │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                          EDITOR                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   LiveEditorV2                           │    │
│  │  - Visual drag-and-drop section editor                  │    │
│  │  - Settings panel for each section                      │    │
│  │  - Block management within sections                     │    │
│  │  - Save to draft / Publish workflow                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Database                              │    │
│  │  - template_sections_draft                              │    │
│  │  - template_sections_published                          │    │
│  │  - template_versions (history)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. ThemeBridge (`~/lib/theme-engine/ThemeBridge.ts`)

Central theme loader that:

- Registers all available themes
- Loads theme configuration (colors, typography)
- Provides section registry for each theme
- Returns section components and schemas

```typescript
import { getThemeBridge } from '~/lib/theme-engine/ThemeBridge';

// Get theme bridge for a specific theme
const bridge = getThemeBridge('luxe-boutique');

// Get theme configuration
const config = bridge.getConfig();
// Returns: { name, version, colors, typography, spacing, ... }

// Get section registry
const registry = bridge.getSectionRegistry();
// Returns: { 'hero-banner': { component, schema }, ... }

// Get specific section
const heroSection = registry['hero-banner'];
const HeroComponent = heroSection.component;
const heroSchema = heroSection.schema;
```

### 2. ThemeStoreRenderer (`~/components/store/ThemeStoreRenderer.tsx`)

Main storefront renderer that:

- Takes sections from database template
- Resolves settings with defaults from schema
- Renders section components with proper context
- Handles header/footer/body separation

```tsx
<ThemeStoreRenderer
  themeId="luxe-boutique"
  sections={[
    { id: 'hero-1', type: 'hero-banner', settings: {...}, blocks: [...] },
    { id: 'feat-1', type: 'featured-collection', settings: {...} },
  ]}
  store={{ id: 123, name: 'My Store', currency: 'BDT' }}
  pageType="index"
  products={products}
  collections={collections}
  skipHeaderFooter={true}
/>
```

### 3. LiveEditorV2 (`~/components/store-builder/LiveEditorV2.client.tsx`)

Visual theme editor that:

- Displays live preview of storefront
- Allows drag-and-drop section reordering
- Provides settings panel for each section
- Manages blocks within sections
- Saves drafts and publishes changes

---

## Theme Structure

Each theme follows this folder structure:

```
themes/{theme-name}/
├── index.ts              # Main exports (theme config + sections)
├── theme.json            # Theme configuration
├── templates/
│   └── index.json        # Default template for homepage
└── sections/
    ├── header.tsx        # Header section
    ├── footer.tsx        # Footer section
    ├── hero-banner.tsx   # Hero section
    ├── featured-collection.tsx
    └── ...
```

### theme.json

```json
{
  "name": "Luxe Boutique",
  "version": "1.0.0",
  "colors": {
    "primary": "#1a1a1a",
    "accent": "#c9a961",
    "background": "#faf9f7",
    "surface": "#ffffff",
    "text": "#1a1a1a",
    "textMuted": "#6b6b6b",
    "border": "#e5e7eb"
  },
  "typography": {
    "fontFamily": "'Playfair Display', serif",
    "baseFontSize": 16,
    "lineHeight": 1.6
  },
  "spacing": {
    "unit": 4,
    "containerMaxWidth": "1280px",
    "containerPadding": "1rem"
  }
}
```

### index.ts

```typescript
import themeConfig from './theme.json';

// Import sections
import { HeroBanner, schema as heroBannerSchema } from './sections/hero-banner';
import {
  FeaturedCollection,
  schema as featuredCollectionSchema,
} from './sections/featured-collection';
import { Header, schema as headerSchema } from './sections/header';
import { Footer, schema as footerSchema } from './sections/footer';

export const theme = {
  id: 'luxe-boutique',
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

---

## Section Schema Format

Sections use Shopify OS 2.0 compatible schemas:

```typescript
import type { SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',

  // Section-level settings
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Welcome to our store',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'Discover amazing products',
    },
    {
      type: 'image',
      id: 'background_image',
      label: 'Background Image',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text Color',
      default: '#ffffff',
    },
    {
      type: 'select',
      id: 'text_alignment',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
    },
    {
      type: 'range',
      id: 'overlay_opacity',
      label: 'Overlay Opacity',
      min: 0,
      max: 100,
      step: 5,
      default: 40,
      unit: '%',
    },
  ],

  // Blocks (repeatable sub-components)
  blocks: [
    {
      type: 'button',
      name: 'Button',
      limit: 3,
      settings: [
        {
          type: 'text',
          id: 'text',
          label: 'Button Text',
          default: 'Shop Now',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
          default: '/products',
        },
        {
          type: 'select',
          id: 'style',
          label: 'Style',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline', label: 'Outline' },
          ],
          default: 'primary',
        },
      ],
    },
  ],

  max_blocks: 3,

  // Presets (optional - for editor)
  presets: [
    {
      name: 'Default Hero',
      settings: {
        heading: 'Welcome',
        text_alignment: 'center',
      },
      blocks: [{ type: 'button', settings: { text: 'Shop Now', link: '/products' } }],
    },
  ],
};
```

### Setting Types

| Type         | Description       | Properties                              |
| ------------ | ----------------- | --------------------------------------- |
| `text`       | Single line text  | `default`, `placeholder`                |
| `textarea`   | Multi-line text   | `default`, `placeholder`                |
| `richtext`   | Rich text editor  | `default`                               |
| `number`     | Numeric input     | `default`, `min`, `max`, `step`         |
| `range`      | Slider input      | `default`, `min`, `max`, `step`, `unit` |
| `checkbox`   | Boolean toggle    | `default`                               |
| `select`     | Dropdown          | `options[]`, `default`                  |
| `radio`      | Radio buttons     | `options[]`, `default`                  |
| `color`      | Color picker      | `default`                               |
| `image`      | Image picker      | -                                       |
| `url`        | URL input         | `default`                               |
| `product`    | Product picker    | -                                       |
| `collection` | Collection picker | -                                       |

---

## Section Component Structure

```typescript
import React from 'react';
import type { SectionComponentProps } from '~/lib/theme-engine/types';

export const schema: SectionSchema = { /* ... */ };

export function HeroBanner({ section, context, settings, blocks }: SectionComponentProps) {
  // Access settings
  const heading = settings.heading as string;
  const backgroundImage = settings.background_image as string;
  const textColor = settings.text_color as string;

  // Access context
  const { store, products, collections, cart } = context;

  // Access blocks
  const buttons = blocks?.filter(b => b.type === 'button') || [];

  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        color: textColor,
      }}
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4">{heading}</h1>

        {/* Render blocks */}
        <div className="flex gap-4 justify-center mt-8">
          {buttons.map((block) => (
            <a
              key={block.id}
              href={block.settings?.link as string}
              className="px-6 py-3 bg-white text-black rounded-lg"
            >
              {block.settings?.text as string}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
```

---

## Database Schema

### Tables

| Table                         | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `themes`                      | Theme container (one active per store)          |
| `theme_templates`             | Page-type templates (home, product, cart, etc.) |
| `template_sections_draft`     | Editable sections (not live)                    |
| `template_sections_published` | Published snapshot (live)                       |
| `theme_settings_draft`        | Theme settings draft                            |
| `theme_settings_published`    | Published settings                              |
| `template_versions`           | Version history (last 50)                       |

### Workflow

```
1. User edits in LiveEditorV2
        ↓
2. Changes saved to template_sections_draft
        ↓
3. User clicks "Publish"
        ↓
4. Draft copied to template_sections_published
        ↓
5. Version saved to template_versions
        ↓
6. KV cache invalidated
        ↓
7. Storefront shows new content
```

---

## Store Routes

All store routes use ThemeStoreRenderer:

| Route                | File                    | Page Type    |
| -------------------- | ----------------------- | ------------ |
| `/`                  | `store.home.tsx`        | `index`      |
| `/products/:id`      | `products.$id.tsx`      | `product`    |
| `/cart`              | `cart.tsx`              | `cart`       |
| `/collections/:slug` | `collections.$slug.tsx` | `collection` |
| `/pages/:slug`       | `pages.$slug.tsx`       | `page`       |
| `/checkout`          | `checkout.tsx`          | Custom       |

### Route Pattern

```typescript
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStoreWithTemplate(context, request, 'home');
  const { storeId, store, template } = storeContext;

  // Load products, collections, etc.
  const products = await db.select().from(products).where(...);

  return json({
    storeId,
    storeName: store.name,
    storeTemplateId: themeConfig?.storeTemplateId || 'starter-store',
    template,
    products,
  });
}

export default function StorePage() {
  const { storeTemplateId, template, products } = useLoaderData<typeof loader>();

  return (
    <ThemeStoreRenderer
      themeId={storeTemplateId}
      sections={template?.sections || []}
      store={{ id: storeId, name: storeName, currency }}
      pageType="index"
      products={products}
    />
  );
}
```

---

## Registered Themes

| Theme ID        | Description           | Status      |
| --------------- | --------------------- | ----------- |
| `starter-store` | Default minimal store | ✅ Complete |
| `daraz`         | Marketplace style     | ✅ Complete |
| `bdshop`        | BDShop variant        | ✅ Complete |
| `ghorer-bazar`  | Grocery store         | ✅ Complete |
| `luxe-boutique` | Luxury boutique       | ✅ Complete |
| `tech-modern`   | Tech/gadget store     | ✅ Complete |

---

## API Reference

### ThemeBridge

```typescript
// Get bridge for theme
const bridge = getThemeBridge(themeId: string);

// Methods
bridge.getConfig(): ThemeConfig
bridge.getSectionRegistry(): Record<string, { component, schema }>
bridge.getSection(type: string): { component, schema } | undefined
bridge.getDefaultTemplate(pageType: string): SectionInstance[]
```

### ThemeStoreRenderer Props

```typescript
interface ThemeStoreRendererProps {
  themeId: string;
  sections: SectionInstance[];
  store: { id: number; name: string; currency: string; logo?: string };
  pageType: 'index' | 'product' | 'collection' | 'cart' | 'checkout' | 'page';
  pageHandle?: string;
  products?: SerializedProduct[];
  collections?: SerializedCollection[];
  product?: SerializedProduct;
  collection?: SerializedCollection;
  cart?: CartData;
  skipHeaderFooter?: boolean;
}
```

### SectionContext

```typescript
interface SectionContext {
  store: {
    id: number;
    name: string;
    currency: string;
    logo?: string;
    defaultLanguage: 'en' | 'bn';
  };
  page: {
    type: PageType;
    handle?: string;
  };
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

---

## See Also

- [THEME_DEVELOPMENT_GUIDE.md](THEME_DEVELOPMENT_GUIDE.md) - How to create new themes
- [FUTURE_FEATURES.md](FUTURE_FEATURES.md) - Theme marketplace & external themes
- [NEXT_STEPS.md](../NEXT_STEPS.md) - Development roadmap
