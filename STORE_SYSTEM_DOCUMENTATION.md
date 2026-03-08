# 🏪 Multi Store SaaS - Complete Store System Documentation

> **Comprehensive documentation for the Ozzyl Multi-tenant E-commerce Platform**  
> **Last Updated**: 2026-03-07  
> **Version**: 2.0 (Unified JSON Settings System)

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture](#-architecture)
3. [Store System](#-store-system)
4. [Theme JSON System](#-theme-json-system)
5. [React Component Bindings](#-react-component-bindings)
6. [API Connections](#-api-connections)
7. [Database Schema](#-database-schema)
8. [Common Errors & Prevention](#-common-errors--prevention)
9. [Best Practices](#-best-practices)

---

## 🎯 System Overview

### What is Ozzyl?

Ozzyl is a **Shopify-like multi-tenant e-commerce SaaS** platform that allows merchants to:
- Create and customize their own online stores
- Manage products, orders, and customers
- Accept payments (COD, bKash, Nagad, Stripe)
- Use AI-powered tools for store optimization

### Key Features

- **Multi-Tenancy**: Each store is isolated with its own data, products, and customers
- **Theme System**: 15+ pre-built themes customizable via JSON settings
- **Edge Computing**: Runs on Cloudflare Workers for sub-100ms response times
- **Unified Settings**: Single JSON column controls all storefront configuration

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE EDGE NETWORK                      │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    REMIX SSR APPLICATION                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │  Storefront  │  │    Admin     │  │   Page Builder   │ │  │
│  │  │  (Public)    │  │   Dashboard  │  │  (Visual Editor) │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      DATA LAYER                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │
│  │  │    D1    │  │    KV    │  │    R2    │  │Vectorize │   │  │
│  │  │ (SQL DB) │  │ (Cache)  │  │ (Assets) │  │  (AI)    │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User visits store** → Cloudflare CDN routes to Worker
2. **Hostname resolution** → KV cache → D1 lookup → `store_id`
3. **Load settings** → `stores.storefront_settings` (JSON column)
4. **Select theme** → Based on `theme.templateId`
5. **Render page** → React component + JSON settings
6. **Return HTML** → Streamed to user

---

## 🏪 Store System

### Store Data Model

```typescript
// Database schema: packages/database/src/schema.ts
stores table:
  - id: INTEGER (PRIMARY KEY)
  - name: TEXT
  - subdomain: TEXT (UNIQUE)
  - storefront_settings: TEXT (JSON - CANONICAL)
  - theme: TEXT (template_id for backward compatibility)
  - logo: TEXT (URL)
  - favicon: TEXT (URL)
  - currency: TEXT (default: 'BDT')
  - planType: TEXT ('free' | 'starter' | 'premium' | 'business')
  - isActive: BOOLEAN
  - deletedAt: TIMESTAMP (soft delete)
  - customRefundPolicy: TEXT
  - manualPaymentConfig: TEXT (JSON)
  - shippingConfig: TEXT (JSON)
  - ... (100+ columns for various features)
```

### Store Modes

1. **Landing Mode** (`storeEnabled: false`)
   - Single product landing pages only
   - Routes: `/p/:slug`
   
2. **Store Mode** (`storeEnabled: true`)
   - Full e-commerce functionality
   - Routes: `/products`, `/cart`, `/checkout`, `/collections`

### Store Isolation (CRITICAL)

**EVERY database query MUST filter by `store_id`**:

```typescript
// ✅ CORRECT - Scoped by store
const products = await db
  .select()
  .from(products)
  .where(eq(products.storeId, currentStoreId));

// ❌ WRONG - Data leak vulnerability!
const products = await db.select().from(products);
```

---

## 🎨 Theme JSON System

### Unified Storefront Settings

All store configuration is stored in a **single JSON column**: `stores.storefront_settings`

#### Schema Structure

```typescript
{
  version: "v1",
  theme: {
    templateId: "nova-lux",  // Theme selector
    primary: "#4F46E5",       // Primary color
    accent: "#F59E0B",        // Accent color
    background: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    footerBg: "#1f2937",
    footerText: "#ffffff"
  },
  branding: {
    storeName: "My Store",
    logo: "https://...",
    favicon: "https://...",
    tagline: "Best products",
    description: "Store description",
    fontFamily: "inter"
  },
  business: {
    phone: "+880...",
    email: "hello@store.com",
    address: "Dhaka, Bangladesh"
  },
  social: {
    facebook: "https://facebook.com/...",
    instagram: "https://instagram.com/...",
    whatsapp: "+880...",
    twitter: null,
    youtube: null,
    linkedin: null
  },
  announcement: {
    enabled: true,
    text: "Free shipping on orders over ৳1000",
    link: "/products",
    backgroundColor: "#4F46E5",
    textColor: "#ffffff"
  },
  seo: {
    title: "My Store - Best Products",
    description: "Shop the best products...",
    keywords: ["product", "store"],
    ogImage: "https://..."
  },
  checkout: {
    shippingSummaryText: "Calculated at checkout",
    showStockWarning: true,
    enableGuestCheckout: true
  },
  shippingConfig: {
    deliveryCharge: 60,
    freeDeliveryAbove: null,
    insideDhaka: 60,
    outsideDhaka: 120,
    freeShippingAbove: 1000,
    enabled: true
  },
  heroBanner: {
    mode: "carousel",  // or "single"
    overlayOpacity: 40,
    autoPlayInterval: 5000,
    showAppWidget: true,
    slides: [
      {
        imageUrl: "https://...",
        heading: "Welcome to Our Store",
        subheading: "Discover amazing products",
        ctaText: "Shop Now",
        ctaLink: "/products"
      }
    ]
  },
  trustBadges: {
    badges: [
      { icon: "truck", title: "দ্রুত ডেলিভারি", description: "ঢাকায় ১-২ দিনে" },
      { icon: "shield", title: "নিরাপদ পেমেন্ট", description: "১০০% সিকিউর" },
      { icon: "refresh", title: "ইজি রিটার্ন", description: "৭ দিনের মধ্যে" }
    ]
  },
  typography: {
    fontFamily: "inter"
  },
  layout: {
    home: []  // Future: section ordering
  },
  flags: {
    sourceLocked: false,
    legacyFallbackUsed: false,
    migrationCompleted: true
  },
  updatedAt: "2026-03-07T12:00:00.000Z"
}
```

### Schema Validation

**File**: `apps/web/app/services/storefront-settings.schema.ts`

```typescript
import { z } from 'zod';

const UnifiedStorefrontSettingsV1Schema = z.object({
  version: z.string().default('v1'),
  theme: ThemeSettingsSchema,
  branding: BrandingSettingsSchema,
  business: BusinessSettingsSchema,
  social: SocialSettingsSchema,
  announcement: AnnouncementSettingsSchema,
  seo: SeoSettingsSchema,
  checkout: CheckoutSettingsSchema,
  shippingConfig: ShippingConfigSchema,
  heroBanner: HeroBannerSettingsSchema,
  trustBadges: TrustBadgesSettingsSchema,
  typography: TypographySettingsSchema,
  layout: LayoutSettingsSchema,
  flags: SettingsFlagsSchema,
  updatedAt: z.string().optional().default(() => new Date().toISOString()),
});
```

### Reading Settings

**File**: `apps/web/app/services/unified-storefront-settings.server.ts`

```typescript
export async function getUnifiedStorefrontSettings(
  db: DrizzleD1Database,
  storeId: number,
  options: GetUnifiedSettingsOptions = {}
): Promise<UnifiedStorefrontSettingsV1> {
  // Read from canonical column
  const result = await db
    .select({ storefrontSettings: stores.storefrontSettings })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (result.length > 0 && result[0].storefrontSettings) {
    const parsed = deserializeUnifiedSettings(result[0].storefrontSettings);
    if (parsed) {
      return sanitizeUnifiedSettings(parsed);
    }
  }

  // Return defaults if nothing found
  return DEFAULT_UNIFIED_SETTINGS;
}
```

### Saving Settings

```typescript
export async function saveUnifiedStorefrontSettings(
  db: DrizzleD1Database,
  storeId: number,
  patch: UnifiedStorefrontSettingsPatch,
  options: SaveUnifiedSettingsOptions = {}
): Promise<UnifiedStorefrontSettingsV1> {
  // Get current settings
  const current = await getUnifiedStorefrontSettings(db, storeId);
  
  // Apply patch
  const updated = createUnifiedSettingsFromPatch(current, patch);
  
  // Validate
  const validated = UnifiedStorefrontSettingsV1Schema.parse(updated);
  
  // Save to database
  await db
    .update(stores)
    .set({
      storefrontSettings: serializeUnifiedSettings(validated),
      theme: validated.theme.templateId,  // Keep legacy column aligned
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));
  
  return validated;
}
```

---

## ⚛️ React Component Bindings

### Template Registry

**File**: `apps/web/app/templates/store-registry.ts`

```typescript
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    description: 'Dark, modern, and sleek design',
    category: 'modern',
    theme: NOVALUX_THEME,
    component: NovaLuxTemplate,  // Main layout
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  // ... 15+ more templates
];
```

### Component Props Interface

```typescript
interface StoreTemplateProps {
  storeName: string;
  storeId: string;
  logo?: string | null;
  products?: Product[];
  categories?: (string | StoreCategory)[];
  config?: any;  // Theme config (unified settings)
  currency?: string;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: BusinessInfo | null;
  planType?: string;
  isPreview?: boolean;
  aiCredits?: number;
  isCustomerAiEnabled?: boolean;
  customer?: Customer | null;
}
```

### Using Settings in Components

```typescript
// Example: NovaLux Homepage
export function LiveNovaLuxHomepage(props: StoreTemplateProps) {
  const {
    storeName,
    logo,
    products,
    categories,
    config,  // ← This contains unified settings
    currency,
    socialLinks,
    businessInfo,
    isCustomerAiEnabled,
    aiCredits,
    customer,
  } = props;

  // Access unified settings
  const announcement = config?.announcement;
  const heroSlides = config?.heroBanner?.slides;
  const trustBadges = config?.trustBadges?.badges;
  const shippingConfig = config?.shippingConfig;
  const primaryColor = config?.theme?.primary;
  const accentColor = config?.theme?.accent;

  return (
    <div>
      {/* Announcement Bar */}
      {announcement?.enabled && announcement?.text && (
        <div style={{ backgroundColor: announcement.backgroundColor }}>
          {announcement.text}
        </div>
      )}

      {/* Hero Section */}
      <HeroSection slides={heroSlides} />

      {/* Trust Badges */}
      {trustBadges?.length > 0 && (
        <TrustBadgesSection badges={trustBadges} />
      )}

      {/* Products */}
      <ProductGrid products={products} />
    </div>
  );
}
```

### Product Page Component Structure

```typescript
// File: apps/web/app/components/store-templates/nova-lux/pages/ProductPage.tsx
interface NovaLuxProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  templateId?: string;
  onNavigate?: (path: string) => void;
  config?: any;
  storeName?: string;
  logo?: string | null;
  categories?: string[];
}

export function NovaLuxProductPage({
  product,
  currency,
  theme,
  config,
  storeName,
  logo,
  categories,
}: NovaLuxProductPageProps) {
  const colors = theme || DEFAULT_THEME;
  
  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <NovaLuxHeader
        storeName={storeName}
        logo={logo}
        config={config}
        categories={categories}
      />
      
      {/* Product details */}
      <div className="pt-24 pb-20">
        <ProductGallery images={product.images} />
        <ProductInfo
          title={product.title}
          price={product.price}
          description={product.description}
          variants={product.variants}
        />
      </div>
      
      {/* Footer */}
      <NovaLuxFooter
        storeName={storeName}
        categories={categories}
      />
    </div>
  );
}
```

---

## 🔌 API Connections

### Storefront Settings API

**File**: `apps/web/app/routes/api.storefront-settings.ts`

```typescript
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await getStoreId(request, context.cloudflare.env);
  const db = createDb(context.cloudflare.env.DB);
  
  const settings = await getUnifiedStorefrontSettings(db, storeId);
  
  return json({
    success: true,
    settings,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await getStoreId(request, context.cloudflare.env);
  const db = createDb(context.cloudflare.env.DB);
  
  const patch = await request.json();
  
  const updated = await saveUnifiedStorefrontSettings(db, storeId, patch);
  
  return json({
    success: true,
    settings: updated,
  });
}
```

### Cart API

**File**: `apps/web/app/routes/api.cart.ts`

```typescript
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'add') {
    const productId = Number(formData.get('productId'));
    const quantity = Number(formData.get('quantity'));
    const variantId = formData.get('variantId');
    
    // Add to cart logic
    // ...
    
    return json({
      success: true,
      cart: updatedCart,
    });
  }
}
```

### Checkout API

**File**: `apps/web/app/routes/api.checkout.ts`

```typescript
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await getStoreId(request, context.cloudflare.env);
  const db = createDb(context.cloudflare.env.DB);
  
  const { items, customerInfo, paymentMethod } = await request.json();
  
  // Validate cart
  // Calculate totals
  // Create order
  // Process payment
  
  return json({
    success: true,
    orderId: order.id,
  });
}
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Stores table (multi-tenant root)
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  storefront_settings TEXT,  -- JSON: Unified settings
  theme TEXT,                -- Template ID
  logo TEXT,
  favicon TEXT,
  currency TEXT DEFAULT 'BDT',
  planType TEXT DEFAULT 'free',
  isActive BOOLEAN DEFAULT true,
  deletedAt TIMESTAMP,
  customRefundPolicy TEXT,
  manualPaymentConfig TEXT,  -- JSON: Payment methods
  shippingConfig TEXT,       -- JSON: Shipping rates
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Products table (scoped by store_id)
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,  -- In cents
  compareAtPrice INTEGER,
  sku TEXT,
  inventory INTEGER,
  categoryId INTEGER,
  isPublished BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Orders table (scoped by store_id)
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeId INTEGER NOT NULL,
  customerId INTEGER,
  orderNumber TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  total INTEGER NOT NULL,
  shippingAddress TEXT,
  paymentMethod TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id),
  FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Customers table (scoped by store_id)
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeId INTEGER NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  passwordHash TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id)
);
```

### Indexes (CRITICAL for Performance)

```sql
-- Multi-tenancy isolation
CREATE INDEX idx_products_store_id ON products(storeId);
CREATE INDEX idx_orders_store_id ON orders(storeId);
CREATE INDEX idx_customers_store_id ON customers(storeId);

-- Query optimization
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_published ON products(isPublished);
CREATE INDEX idx_orders_customer ON orders(customerId);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## ⚠️ Common Errors & Prevention

### 1. `unifiedSettings is not defined`

**Error**: ReferenceError in component

**Cause**: Using variable that doesn't exist in component scope

**Prevention**:
```typescript
// ❌ WRONG - unifiedSettings not in scope
accentColor={unifiedSettings.theme.accent}

// ✅ CORRECT - use config prop
accentColor={config?.theme?.accent}

// ✅ CORRECT - destructure from props
function Component({ config }) {
  const unifiedSettings = config;
  // ...
}
```

### 2. `storeName is not defined`

**Error**: ReferenceError in ProductPage

**Cause**: Missing prop in component interface

**Prevention**:
```typescript
// ✅ Define all needed props in interface
interface NovaLuxProductPageProps {
  product: Product;
  currency: string;
  storeName?: string;      // ← Add this
  logo?: string | null;    // ← Add this
  categories?: string[];   // ← Add this
  config?: any;
}

// ✅ Destructure in component signature
export function NovaLuxProductPage({
  product,
  currency,
  storeName,      // ← Destructure
  logo,           // ← Destructure
  categories,     // ← Destructure
}: NovaLuxProductPageProps) {
  // Now you can use them
  return <NovaLuxHeader storeName={storeName} />;
}
```

### 3. `deserializeUnifiedSettings] Failed to parse unified settings: Invalid datetime`

**Error**: Zod validation error for `updatedAt`

**Cause**: Strict `.datetime()` validation rejecting valid dates

**Prevention**:
```typescript
// ❌ WRONG - Too strict
updatedAt: z.string().datetime()

// ✅ CORRECT - Optional with default
updatedAt: z.string().optional().default(() => new Date().toISOString())
```

### 4. Data Leak - Missing `store_id` Filter

**Error**: Security vulnerability - accessing other stores' data

**Cause**: Forgetting to filter by `store_id`

**Prevention**:
```typescript
// ❌ WRONG - Data leak!
const products = await db.select().from(products);

// ✅ CORRECT - Always filter
const products = await db
  .select()
  .from(products)
  .where(eq(products.storeId, currentStoreId));

// ✅ Use tenant guard
const { storeId } = await requireTenant(request, context);
```

### 5. JSX Structure Errors

**Error**: "Unexpected end of file before a closing div tag"

**Cause**: Mismatched opening/closing tags

**Prevention**:
```typescript
// ✅ Use proper indentation
return (
  <div className="outer">
    <div className="inner">
      Content
    </div>
  </div>
);

// ❌ Wrong - Missing closing tag
return (
  <div className="outer">
    <div className="inner">
      Content
  </div>
);
```

---

## ✅ Best Practices

### 1. Always Use Props Interface

```typescript
// ✅ Define interface first
interface MyComponentProps {
  title: string;
  config?: any;
  storeName?: string;
}

// ✅ Use interface in component
export function MyComponent({ title, config, storeName }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### 2. Validate All Inputs

```typescript
// ✅ Use Zod for validation
const ProductSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  storeId: z.number(),
});

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();
  const validated = ProductSchema.parse(data);
  // ...
}
```

### 3. Use Optional Chaining

```typescript
// ✅ Safe access
const primaryColor = config?.theme?.primary || '#000';

// ❌ Unsafe - will crash if config is undefined
const primaryColor = config.theme.primary;
```

### 4. Default Values for Props

```typescript
// ✅ Provide defaults
export function Component({
  isPreview = false,
  categories = [],
  config = {},
}: ComponentProps) {
  // Safe to use
}
```

### 5. Close All JSX Tags

```typescript
// ✅ Check tag matching
<div>           {/* Open 1 */}
  <div>         {/* Open 2 */}
    Content
  </div>        {/* Close 2 */}
</div>          {/* Close 1 */}
```

### 6. Test Before Deploy

```bash
# Always test locally first
npm run dev:wrangler

# Check for TypeScript errors
npm run typecheck

# Build to catch errors
npm run build

# Then deploy
npm run deploy
```

---

## 📚 Additional Resources

- **CLAUDE.md**: Project overview and commands
- **AGENTS.md**: Agent guidelines and subagents
- **AI_ARCHITECTURE_SPEC.md**: AI action layer spec
- **packages/database/src/schema.ts**: Full database schema
- **apps/web/app/services/storefront-settings.schema.ts**: Settings schema
- **apps/web/app/templates/store-registry.ts**: Template registry

---

## 🆘 Getting Help

If you encounter errors:

1. **Read the error message carefully** - It usually tells you what's missing
2. **Check the component props** - Make sure all needed props are defined
3. **Verify JSX structure** - All opening tags need closing tags
4. **Test locally** - Use `npm run dev:wrangler` before deploying
5. **Check TypeScript** - Run `npm run typecheck` to catch type errors

---

**End of Documentation**  
*Last reviewed: 2026-03-07*
