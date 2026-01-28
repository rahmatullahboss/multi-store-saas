# AGENTS.md — Multi Store SaaS

## 🎯 Mission: Shopify of Bangladesh

Build a world-class, multi-tenant e-commerce SaaS on Cloudflare's edge. 🇧🇩🚀
**Standard**: 99.99% Uptime, Sub-100ms TTFB, Infinite Scale.

## 🏗️ Monorepo Structure & Commands

- **Main App**: `apps/web` (Remix SSR on Cloudflare Pages)
- **Page Builder**: `apps/page-builder` (GrapesJS Worker)
- **Packages**: `packages/database` (Drizzle/D1), `packages/ui` (Tailwind/Radix)

| Action          | Root Command          | App-Specific (`apps/web`)               |
| :-------------- | :-------------------- | :-------------------------------------- |
| **Install**     | `npm install`         | -                                       |
| **Dev**         | `npm run turbo:dev`   | `npm run dev` / `npm run dev:wrangler`  |
| **Build**       | `npm run turbo:build` | `npm run build`                         |
| **Lint**        | `npm run turbo:lint`  | `npm run lint`                          |
| **Test**        | `npm run turbo:test`  | `npm run test` (Vitest) / `npm run e2e` |
| **Single Test** | -                     | `npx vitest app/path/to/file.test.ts`   |
| **DB Migrate**  | -                     | `npm run db:migrate:local` / `:prod`    |

## 🛠️ Tech Stack (Cloudflare Native)

- **Runtime**: Workers / Pages (Compatibility: `2025-04-14`)
- **Framework**: Remix (React 19, Vite, Streaming with `defer()`)
- **Storage**: D1 (SQL), R2 (S3-compatible), KV (Cache), Vectorize (AI)
- **ORM**: Drizzle ORM (Type-safe migrations & batching)

---

## 🎨 Shopify OS 2.0 Theme System (CURRENT ARCHITECTURE)

### Overview

The storefront uses a **Shopify OS 2.0 compatible theme system** with:

- **JSON-based section schemas** with settings and blocks
- **ThemeBridge** for loading themes and sections
- **ThemeStoreRenderer** for rendering sections on storefront
- **LiveEditorV2** for visual editing (drag-and-drop)
- **Database-backed draft/publish workflow**

### Key Components

```
apps/web/app/
├── themes/                          # Shopify OS 2.0 themes
│   ├── starter-store/              # Default starter theme
│   ├── daraz/                      # Daraz-style marketplace
│   ├── bdshop/                     # BDShop variant
│   ├── ghorer-bazar/               # Grocery theme
│   ├── luxe-boutique/              # Luxury boutique
│   └── tech-modern/                # Tech/gadget theme
├── lib/theme-engine/               # Core engine
│   ├── ThemeBridge.ts             # Theme loader & section registry
│   ├── types/index.ts             # TypeScript types
│   ├── db-integration.ts          # DB CRUD operations
│   └── utils/page-renderer.tsx    # Dynamic page rendering
└── components/store/
    └── ThemeStoreRenderer.tsx     # Storefront section renderer
```

### Theme Structure (Shopify-like)

```
themes/starter-store/
├── index.ts                 # Theme exports & registration
├── theme.json              # Theme config (colors, typography)
├── templates/
│   └── index.json          # Homepage template (section order)
└── sections/
    ├── header.tsx          # Header section with schema
    ├── footer.tsx          # Footer section with schema
    ├── hero-banner.tsx     # Hero banner section
    ├── featured-collection.tsx
    └── ...
```

### Section Schema Format

```typescript
export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome' },
    { type: 'image', id: 'background_image', label: 'Background' },
    { type: 'color', id: 'text_color', label: 'Text Color', default: '#ffffff' },
  ],
  blocks: [
    {
      type: 'button',
      name: 'Button',
      settings: [
        { type: 'text', id: 'text', label: 'Button Text' },
        { type: 'url', id: 'link', label: 'Link' },
      ],
    },
  ],
  max_blocks: 3,
};
```

### Using ThemeBridge

```typescript
import { getThemeBridge } from '~/lib/theme-engine/ThemeBridge';

const bridge = getThemeBridge('luxe-boutique');
const config = bridge.getConfig();
const registry = bridge.getSectionRegistry();
const SectionComponent = registry['hero-banner'].component;
```

### Using ThemeStoreRenderer

```tsx
<ThemeStoreRenderer
  themeId={storeTemplateId}
  sections={template.sections.map((s) => ({
    id: s.id,
    type: s.type,
    settings: s.props || {},
    blocks: s.blocks || [],
    enabled: s.enabled,
  }))}
  store={{ id: storeId, name: storeName, currency, logo }}
  pageType="index"
  products={products}
  collections={collections}
  skipHeaderFooter={true}
/>
```

### Registered Themes

| Theme ID        | Description           | Sections      |
| --------------- | --------------------- | ------------- |
| `starter-store` | Default minimal store | 8 sections    |
| `daraz`         | Marketplace style     | 6 sections    |
| `bdshop`        | BDShop variant        | Extends daraz |
| `ghorer-bazar`  | Grocery store         | Extends daraz |
| `luxe-boutique` | Luxury boutique       | 5 sections    |
| `tech-modern`   | Tech/gadget store     | 5 sections    |

---

## 📏 Coding Standards & Style

### 1. Naming & Formatting

- **Files**: kebab-case (e.g., `product-card.tsx`, `auth.server.ts`).
- **Components**: PascalCase (e.g., `export function OrderTable()`).
- **Hooks**: camelCase starting with `use` (e.g., `useStoreData`).
- **Types/Interfaces**: PascalCase, prefixed with `T` or `I` if helpful, but usually just `Product`.
- **Formatting**: Prettier is enforced. Run `npm run format`.

### 2. Imports & Exports

- Use path aliases: `~/` (app), `@db/` (database), `@server/` (server-only).
- **Group imports**: React/Remix first, then external libs, then internal aliases.
- **Server logic**: Keep in `.server.ts` files to prevent client-side leakage.

### 3. TypeScript & Types

- **Strict Mode**: Enabled and mandatory. No `any`.
- **Zod**: Use for all runtime validation (API inputs, environment variables).
- **Inference**: Use `typeof loader` for `useLoaderData` typing.

### 4. Data Safety (Multi-Tenant)

- 🔴 **CRITICAL**: Every query MUST be scoped by `store_id`.
- **Consistency**: Use D1 Sessions API for read-after-write consistency.

```typescript
const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-primary';
const session = env.DB.withSession(bookmark);
const data = await session.prepare('SELECT * FROM products WHERE store_id = ?').bind(storeId).all();
```

### 5. D1 Batching

Use `.batch()` for multiple operations to minimize round-trips:

```typescript
await db.batch([
  db.insert(products).values(p1),
  db.update(stores).set({ lastUpdated: new Date() }).where(eq(stores.id, storeId)),
]);
```

### 6. Error Handling & Validation

- **Zod**: Required for `action` data and `env` validation.
- **Remix Boundary**: Every route should have an `ErrorBoundary`.
- **Toasts**: Use `sonner` for non-blocking feedback.
- **Banglish**: Communicate with users in Banglish (English letters, Bangla words).

---

## 🏪 Store Routes (Shopify OS 2.0)

All storefront routes use `ThemeStoreRenderer`:

| Route        | File                    | Renderer                   |
| ------------ | ----------------------- | -------------------------- |
| Homepage     | `store.home.tsx`        | ThemeStoreRenderer         |
| Product      | `products.$id.tsx`      | ThemeStoreRenderer         |
| Cart         | `cart.tsx`              | ThemeStoreRenderer         |
| Collection   | `collections.$slug.tsx` | ThemeStoreRenderer         |
| Custom Pages | `pages.$slug.tsx`       | ThemeStoreRenderer         |
| Checkout     | `checkout.tsx`          | Custom (not section-based) |

### Route Pattern

```typescript
// Load template from DB
const template = await resolveTemplate(env.DB, storeId, 'home');

// Render with ThemeStoreRenderer
<ThemeStoreRenderer
  themeId={storeTemplateId}
  sections={template?.sections || []}
  store={{ id, name, currency }}
  pageType="index"
  products={products}
/>
```

---

## ☁️ Cloudflare Edge Patterns

### 1. KV Caching

Cache store configuration and published pages. Invalidate on publish.

```typescript
const cacheKey = `store:${storeId}:config`;
const cached = await env.KV.get(cacheKey, 'json');
```

### 2. R2 Storage

Use for product images and builder assets.

- Prefer signed URLs for private assets.
- Use `<OptimizedImage />` component for automatic resizing.

### 3. Durable Objects (Order Queue)

Used for background tasks like sending emails and updating inventory.

- Isolation: One DO per store (or per task type).
- Reliability: Built-in retries with exponential backoff.

---

## 🎨 UI/UX Standards

- **Styling**: Tailwind CSS 4.0. Use `cn()` utility for conditional classes.
- **Icons**: `lucide-react`.
- **Components**: Use Radix UI primitives via `@ozzyl/ui`.
- **Loading**: Use Remix `Pending` states or Skeleton loaders for streamed data.

---

## 🤖 Agent Rules (Cursor/Copilot)

### Theme System Guidelines

1. **New sections** should be added to `~/themes/{theme-name}/sections/`
2. **Section schemas** must follow Shopify OS 2.0 format
3. **Always use ThemeStoreRenderer** for storefront rendering
4. **Use LiveEditorV2** for the theme editor (not old LiveEditor)

### DO NOT USE (Legacy - Removed)

- ❌ `StoreSectionRenderer` (deleted)
- ❌ `~/lib/unified-sections/` (deleted)
- ❌ `~/components/store/sections/` (deleted)
- ❌ `LiveEditor.client.tsx` (deleted - use LiveEditorV2)
- ❌ `template-render.tsx` route (deleted)

### File Locations

- **Theme sections**: `~/themes/{theme}/sections/*.tsx`
- **Theme config**: `~/themes/{theme}/theme.json`
- **Theme bridge**: `~/lib/theme-engine/ThemeBridge.ts`
- **Store renderer**: `~/components/store/ThemeStoreRenderer.tsx`
- **Live editor**: `~/components/store-builder/LiveEditorV2.client.tsx`

---

## 🛠️ Troubleshooting & Debugging

- **Logs**: Use `wrangler tail` to see live logs in production.
- **D1 Local**: Check `.wrangler/state/v3/d1` for local SQLite files.
- **Types**: If types are missing, run `npm run turbo:typecheck`.
- **Theme not loading**: Check ThemeBridge registration in `ThemeBridge.ts`
- **Sections not rendering**: Verify section type exists in theme's section registry

---

## 🚀 Deployment & Ops

- **Main App**: `wrangler pages deploy` (from `apps/web`)
- **Builder**: `wrangler deploy` (from `apps/page-builder`)
- **Secrets**: Set via Cloudflare Dashboard, NEVER in `wrangler.toml`.
- **Compatibility**: Always use `compatibility_date = "2025-04-14"` or later.

---

**Remember**: We are building the **Shopify of Bangladesh**. High performance, multi-tenant security, and edge-native efficiency are non-negotiable. 🇧🇩🚀
