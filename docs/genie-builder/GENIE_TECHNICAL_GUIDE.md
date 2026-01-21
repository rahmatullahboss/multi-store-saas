# Quick Builder v2 - Technical Implementation Guide

## 📋 Table of Contents
1. [File Structure](#file-structure)
2. [Integration Architecture](#integration-architecture)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [API Routes](#api-routes)
5. [Utility Functions](#utility-functions)

---

## File Structure

### Quick Builder v2 Files

#### Core Utilities
- `app/utils/landing-builder/intentEngine.ts` - Intent mapping, auto-generation, style tokens
- `app/utils/landing-builder/variantRegistry.ts` - 18+ section variants
- `app/lib/page-builder/schemas.ts` - Zod schemas for validation (CTAPropsSchema with new fields)

#### Components - Product Grid & Multi-Product
- `app/components/page-builder/sections/ProductGridSectionPreview.tsx` - Multi-product grid display
- `app/components/page-builder/sections/order-form/DefaultOrderForm.tsx` - Multi-select with combo discounts

#### Components - Intent & Style Wizard
- `app/components/landing-builder/IntentWizard.tsx` - 4-step wizard (Intent → Product → Style → Template)
- `app/components/landing-builder/VariantSelector.tsx` - Variant picker
- `app/components/landing-builder/StyleWizard.tsx` - Style controls
- `app/components/checkout/CheckoutModal.tsx` - Embedded checkout

#### Integration Points
- `app/routes/app.new-builder._index.tsx` - Main entry (popup)
- `app/routes/app.settings.landing.tsx` - Style & checkout settings
- `app/routes/builder-preview.$pageId.tsx` - Preview with real data (realData prop)
- `app/routes/api.create-order.ts` - Order creation with combo discount validation
- `app/lib/page-builder/actions.server.ts` - Page creation logic
- `app/components/page-builder/SortableItem.tsx` - Variant button

#### Types & Schemas
- `db/schema_page_builder.ts` - Database schema with variant, intentJson, styleTokensJson columns
- `app/lib/page-builder/types.ts` - PageIntent, StyleTokens, SectionVariant types
- `db/types.ts` - LandingIntent, StyleWizardSettings, SectionVisibilityRule

---

## Integration Architecture

Quick Builder v2 is integrated into existing page builder, not a separate system.

### Creation Flow

```
/app/new-builder (click button)
    ↓
IntentWizard popup (3 steps)
    ↓
action: create-from-intent
    ↓
generateOptimalSections(intent)
    ↓
createPageFromTemplate(db, storeId, template, slug, title, intentData)
    ↓
Redirect to /app/new-builder/{pageId}
```

### Section Variants in Editor

```
SortableItem component
    ↓
hasVariants(section.type) check
    ↓
Palette button visible
    ↓
onVariantClick callback
```

---

## TypeScript Interfaces

### Intent Interface

```typescript
// app/utils/landing-builder/intentEngine.ts

export interface Intent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
}

export interface LandingIntent extends Intent {
  headline?: string;
  createdAt?: string;
}
```

### Variant Interface

```typescript
// app/utils/landing-builder/variantRegistry.ts

export interface SectionVariantDef {
  id: string;
  sectionId: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  component: React.ComponentType<SectionVariantProps>;
  thumbnail: string;
  defaultConfig: Record<string, any>;
  tags: string[];
  compatibleWith: string[];
}
```

### StyleTokens (Brand Customization)

```typescript
// app/utils/landing-builder/intentEngine.ts

export interface StyleTokens {
  brandColor: string; // hex color or preset name
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  fontFamily: 'default' | 'bengali' | 'modern' | 'classic';
  darkMode?: boolean;
}

export const BRAND_COLOR_PRESETS = {
  orange: '#ff8c42',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  red: '#ef4444',
  pink: '#ec4899',
};

export const DEFAULT_STYLE_TOKENS: StyleTokens = {
  brandColor: 'blue',
  buttonStyle: 'rounded',
  fontFamily: 'default',
  darkMode: false,
};
```

### PageIntent Type

```typescript
// app/lib/page-builder/types.ts

export interface PageIntent {
  productType: 'single' | 'multiple'; // single or 2-3 products
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
  selectedProducts: string[]; // product IDs (1 for single, 2-3 for multiple)
  headline?: string;
}

export interface SectionVariant {
  sectionId: string;
  variantId: string; // e.g., 'hero-product-focused'
}
```

### Real Data Props

```typescript
// Data passed to components for real metrics

export interface RealData {
  stock: Record<string, number>; // productId -> stock count
  orderCount: number; // last 24h orders
  recentOrders: {
    customername: string;
    createdAt: string;
  }[];
}
```

### Visibility Rules

```typescript
export interface SectionVisibilityRule {
  isVisible: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  showIfProductHasVideo?: boolean;
  showIfProductHasVariants?: boolean;
  showIfProductOnSale?: boolean;
  showAfterDate?: string;
  hideAfterDate?: string;
  showIfInStock?: boolean;
  hideIfLowStock?: boolean;
  lowStockThreshold?: number;
}

export function evaluateVisibility(
  rule: SectionVisibilityRule,
  context: {
    isMobile: boolean;
    product: { hasVideo?: boolean; hasVariants?: boolean; onSale?: boolean; stock?: number };
    currentDate: Date;
  }
): boolean {
  if (!rule.isVisible) return false;
  
  if (rule.showOnMobile !== undefined && rule.showOnMobile !== context.isMobile) return false;
  if (rule.showOnDesktop !== undefined && rule.showOnDesktop === context.isMobile) return false;
  
  if (rule.showIfProductHasVideo && !context.product.hasVideo) return false;
  if (rule.showIfProductHasVariants && !context.product.hasVariants) return false;
  if (rule.showIfProductOnSale && !context.product.onSale) return false;
  
  if (rule.showAfterDate && new Date(rule.showAfterDate) > context.currentDate) return false;
  if (rule.hideAfterDate && new Date(rule.hideAfterDate) < context.currentDate) return false;
  
  if (rule.showIfInStock && (context.product.stock ?? 0) <= 0) return false;
  if (rule.hideIfLowStock && (context.product.stock ?? 0) < (rule.lowStockThreshold ?? 5)) return false;
  
  return true;
}
```

---

## API Routes

### Create Landing Page from Intent

```typescript
// POST /app/new-builder
// Handler: app/routes/app.new-builder._index.tsx

export async function action({ request, context }: ActionFunction) {
  if (request.method !== 'POST') return new Response('Not found', { status: 404 });
  
  const data = await request.formData();
  const actionType = data.get('_action');
  
  if (actionType === 'create-from-intent') {
    const intent: PageIntent = JSON.parse(data.get('intent') as string);
    const styleTokens: StyleTokens = JSON.parse(data.get('styleTokens') as string);
    const storeId = data.get('storeId') as string;
    
    // Validate
    if (!intent.selectedProducts?.length) {
      return json({ error: 'No products selected' }, { status: 400 });
    }
    
    // 1. Generate optimal sections based on intent & product count
    const sections = generateOptimalSections(intent);
    const template = selectOptimalTemplate(intent);
    
    // 2. If multi-product, add ProductGrid section
    if (intent.productType === 'multiple' && intent.selectedProducts.length > 1) {
      sections.splice(1, 0, 'product-grid'); // Insert after hero
    }
    
    // 3. Create landing config
    const config = {
      templateId: template,
      headline: intent.headline || 'New Landing Page',
      sectionOrder: sections,
      intent, // Store full intent
      styleTokens, // Store style preferences
    };
    
    // 4. Save to database
    const pageId = await createPageFromTemplate(context.db, {
      storeId,
      template,
      slug: generateSlug(),
      title: intent.headline,
      intentJson: intent, // New column
      styleTokensJson: styleTokens, // New column
      intentData: config,
    });
    
    return redirect(`/app/new-builder/${pageId}`);
  }
}
```

### Combo Discount Calculation in Order Creation

```typescript
// app/routes/api.create-order.ts
// Backend validation & auto-discount

export async function action({ request, context }: ActionFunction) {
  if (request.method !== 'POST') return json({ error: 'Not found' }, { status: 404 });
  
  const { pageId, selectedProducts, ...orderData } = await request.json();
  
  // Get page intent to check if it's multi-product
  const page = await db.query.builder_pages.findFirst({
    where: eq(builder_pages.id, pageId),
  });
  
  if (!page) return json({ error: 'Page not found' }, { status: 404 });
  
  const intent: PageIntent = JSON.parse(page.intentJson || '{}');
  
  // Calculate combo discount
  let discountPercent = 0;
  if (intent.productType === 'multiple' && selectedProducts?.length > 1) {
    discountPercent = selectedProducts.length >= 3 ? 15 : 10;
  }
  
  // Calculate pricing
  let subtotal = 0;
  for (const productId of selectedProducts || []) {
    const product = await getProduct(context.db, productId);
    subtotal += product.price;
  }
  
  const discount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discount;
  
  // Store pricing breakdown
  const pricingJson = {
    subtotal,
    discountPercent,
    discount,
    total,
    products: selectedProducts,
  };
  
  // Create order with pricing breakdown
  const order = await db.insert(orders).values({
    storeId: context.user.storeId,
    landingPageId: pageId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,
    productIds: selectedProducts.join(','),
    pricingJson: JSON.stringify(pricingJson),
    total,
    status: 'pending',
  });
  
  return json({ success: true, orderId: order.id });
}
```

### Update Section Variant

```typescript
// PATCH /api/landing-pages/:id/sections/:sectionId/variant

export async function action({ request, context, params }: ActionFunction) {
  if (request.method !== 'PATCH') return new Response('Not found', { status: 404 });
  
  const { id, sectionId } = params;
  const { variantId } = await request.json();
  
  const page = await getLandingPage(context.db, id);
  
  if (!page.config.sectionVariants) {
    page.config.sectionVariants = {};
  }
  page.config.sectionVariants[sectionId] = variantId;
  
  await updateLandingPage(context.db, id, page.config);
  
  return json({ success: true });
}
```

### Save Style Settings

```typescript
// PATCH /api/landing-pages/:id/style

export async function action({ request, context, params }: ActionFunction) {
  if (request.method !== 'PATCH') return new Response('Not found', { status: 404 });
  
  const { id } = params;
  const styleSettings = await request.json();
  
  const page = await getLandingPage(context.db, id);
  page.config.styleWizard = styleSettings;
  await updateLandingPage(context.db, id, page.config);
  
  return json({ success: true });
}
```

---

## API Response Examples

### Create Landing Page from Intent

**Endpoint:** `POST /app/new-builder` with `_action=create-from-intent`

**Request (Form Data):**
```
_action: create-from-intent
storeId: store_123
intent: {"productType":"single","goal":"direct_sales","trafficSource":"facebook","headline":"প্রিমিয়াম গ্রিন টি"}
```

**Success Response (Redirect):**
```
Location: /app/new-builder/page_abc123
Status: 302
```

**Error Response (400 - Validation):**
```json
{
  "error": "Invalid intent data",
  "details": {
    "intent.trafficSource": ["Must be one of: facebook, tiktok, organic"]
  }
}
```

### Get Section Variants

**Endpoint:** `GET /api/landing-builder/variants`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "hero": [
      {
        "id": "product-focused",
        "name": "প্রোডাক্ট ফোকাস",
        "nameEn": "Product Focused",
        "description": "বড় প্রোডাক্ট ইমেজ সহ",
        "thumbnail": "/thumbnails/hero-product.png",
        "tags": ["mobile-friendly", "conversion"]
      },
      {
        "id": "offer-focused",
        "name": "অফার ফোকাস",
        "nameEn": "Offer Focused",
        "description": "ডিসকাউন্ট ও প্রাইস হাইলাইট",
        "thumbnail": "/thumbnails/hero-offer.png",
        "tags": ["urgency", "facebook-ads"]
      }
    ],
    "testimonials": [
      {
        "id": "cards",
        "name": "কার্ড গ্রিড",
        "nameEn": "Card Grid",
        "description": "৩ কলাম কার্ড লেআউট",
        "thumbnail": "/thumbnails/testimonials-cards.png"
      }
    ]
  }
}
```

---

## Utility Functions

### Intent Engine

```typescript
// app/utils/landing-builder/intentEngine.ts

export function generateOptimalSections(intent: Intent): string[] {
  const base = ['hero', 'cta'];
  
  if (intent.goal === 'direct_sales') {
    if (intent.trafficSource === 'facebook') {
      return ['hero', 'trust', 'features', 'testimonials', 'cta', 'faq'];
    } else if (intent.trafficSource === 'tiktok') {
      return ['hero', 'social', 'testimonials', 'urgency', 'cta'];
    } else {
      // organic
      return ['hero', 'benefits', 'features', 'testimonials', 'cta', 'faq'];
    }
  } else {
    // lead_whatsapp
    return ['hero', 'benefits', 'faq', 'cta', 'delivery'];
  }
}

export function selectOptimalTemplate(intent: Intent): string {
  if (intent.trafficSource === 'facebook' && intent.goal === 'direct_sales') {
    return 'premium-bd';
  } else if (intent.trafficSource === 'tiktok') {
    return 'flash-sale';
  } else if (intent.goal === 'lead_whatsapp') {
    return 'minimal-light';
  }
  return 'premium-bd';
}
```

### Variant Registry

```typescript
// app/utils/landing-builder/variantRegistry.ts

export const SECTION_VARIANTS: SectionVariantDef[] = [
  {
    id: 'hero-product-focused',
    sectionId: 'hero',
    name: 'Product-Focused',
    nameEn: 'Product-Focused',
    description: 'বড় প্রোডাক্ট ইমেজ সহ',
    descriptionEn: 'Large product image',
    component: HeroProductFocused,
    thumbnail: '/variants/hero-product.jpg',
    defaultConfig: { imagePosition: 'left', imageSize: 'large' },
    tags: ['product', 'mobile-friendly'],
    compatibleWith: ['direct_sales'],
  },
  // ... 17 more variants
];

export function getVariantsForSection(sectionId: string): SectionVariantDef[] {
  return SECTION_VARIANTS.filter((v) => v.sectionId === sectionId);
}

export function getVariantComponent(variantId: string): React.ComponentType<any> | null {
  const variant = SECTION_VARIANTS.find((v) => v.id === variantId);
  return variant?.component || null;
}
```

---

## Database Schema Updates

### builder_pages Table (Migration 0064)

```sql
ALTER TABLE builder_pages ADD COLUMN variant TEXT; -- Section variant JSON
ALTER TABLE builder_pages ADD COLUMN intent_json TEXT; -- PageIntent
ALTER TABLE builder_pages ADD COLUMN style_tokens_json TEXT; -- StyleTokens
```

### Drizzle Schema

```typescript
// db/schema_page_builder.ts

export const builderPages = sqliteTable('builder_pages', {
  // ... existing columns
  variant: text('variant'), // JSON: Map<sectionId, variantId>
  intentJson: text('intent_json'), // JSON: PageIntent
  styleTokensJson: text('style_tokens_json'), // JSON: StyleTokens
});

export const builderSections = sqliteTable('builder_sections', {
  // ... existing columns
  variant: text('variant'), // Stored variant ID for this section
});
```

### stores Table (Existing, No Changes)

```typescript
// db/schema.ts - already exists
export const stores = sqliteTable('stores', {
  // ... existing columns
  landingIntent: text('landing_intent'), // JSON: LandingIntent
  sectionVariants: text('section_variants'), // JSON
  checkoutModalEnabled: integer('checkout_modal_enabled').default(0),
  styleWizard: text('style_wizard'), // JSON: StyleTokens
});
```

---

## Real Data Integration

### Data Flow Architecture

```
Database
├── products.stock (inventory)
├── orders (last 24h)
└── customers (names)
       ↓
loader: builder-preview.$pageId
       ↓
getRealData() function
       ↓
RealData object {
  stock: { productId: count },
  orderCount: 24,
  recentOrders: [...]
}
       ↓
Passed to components via props
       ↓
UrgencyBanner: "Only X left in stock!"
SocialProof: "24 people bought today"
```

### Implementation in Loader

```typescript
// app/routes/builder-preview.$pageId.tsx

export async function loader({ params, context }: LoaderFunction) {
  const page = await getBuilderPage(context.db, params.pageId);
  const intent: PageIntent = JSON.parse(page.intentJson || '{}');
  
  // Fetch real data
  const realData = await getRealData(context.db, {
    storeId: page.storeId,
    productIds: intent.selectedProducts,
  });
  
  return json({ page, realData });
}

async function getRealData(db: Database, { storeId, productIds }: any) {
  // Get stock counts
  const products = await db.query.products.findMany({
    where: and(
      eq(products.storeId, storeId),
      inArray(products.id, productIds)
    ),
    columns: { id: true, stock: true },
  });
  
  const stock = Object.fromEntries(
    products.map(p => [p.id, p.stock])
  );
  
  // Get 24-hour order count
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.storeId, storeId),
      gte(orders.createdAt, twentyFourHoursAgo),
      eq(orders.status, 'completed')
    ),
    columns: { id: true, customername: true, createdAt: true },
    limit: 5,
  });
  
  return {
    stock,
    orderCount: recentOrders.length,
    recentOrders: recentOrders.map(o => ({
      customername: o.customername,
      createdAt: o.createdAt,
    })),
  };
}
```

### Best Practices Configuration

Each best practice feature is configurable via `CTAProps` in the landing config:

```typescript
// app/lib/page-builder/schemas.ts

export const CTAPropsSchema = z.object({
  // ... existing fields
  
  // Urgency Banner (OFF by default)
  showUrgencyBanner: z.boolean().default(false),
  urgencyText: z.string().default('Limited stock available!'),
  useRealStockCount: z.boolean().default(true), // Uses real stock from DB
  
  // Social Proof (OFF by default)
  showSocialProof: z.boolean().default(false),
  socialProofText: z.string().default('people bought in last 24h'),
  useRealOrderCount: z.boolean().default(true), // Uses real orders from DB
  
  // Free Shipping Progress (Optional)
  showFreeShippingProgress: z.boolean().default(false),
  freeShippingThreshold: z.number().default(500), // BDT
  
  // Delivery Estimate (Optional)
  showDeliveryEstimate: z.boolean().default(false),
  deliveryEstimateDhaka: z.string().default('2-3 days'),
  deliveryEstimateOutside: z.string().default('4-5 days'),
  
  // Trust Badges (always visible)
  showTrustBadges: z.boolean().default(true),
});
```

### Component Usage with Real Data

```typescript
// app/components/page-builder/sections/order-form/DefaultOrderForm.tsx

export function DefaultOrderForm({
  config,
  realData, // Real stock & order counts passed from loader
  products,
}: {
  config: LandingConfig;
  realData?: RealData;
  products: Product[];
}) {
  const ctaProps = config.sections.find(s => s.type === 'cta')?.props;
  
  return (
    <div>
      {/* Urgency Banner with REAL stock */}
      {ctaProps?.showUrgencyBanner && (
        <UrgencyBanner
          text={ctaProps.urgencyText}
          stockCount={ctaProps.useRealStockCount ? realData?.stock[products[0].id] : undefined}
        />
      )}
      
      {/* Social Proof with REAL order count */}
      {ctaProps?.showSocialProof && (
        <SocialProof
          text={ctaProps.socialProofText}
          orderCount={ctaProps.useRealOrderCount ? realData?.orderCount : undefined}
        />
      )}
      
      {/* Free Shipping Progress */}
      {ctaProps?.showFreeShippingProgress && (
        <FreeShippingProgress
          threshold={ctaProps.freeShippingThreshold}
          currentAmount={calculateCartTotal()}
        />
      )}
      
      {/* Delivery Estimate */}
      {ctaProps?.showDeliveryEstimate && (
        <DeliveryEstimate
          dhaka={ctaProps.deliveryEstimateDhaka}
          outside={ctaProps.deliveryEstimateOutside}
        />
      )}
      
      {/* Product Grid with Multi-Select (for multi-product) */}
      {config.intent?.productType === 'multiple' && (
        <ProductGridMultiSelect
          products={products}
          onSelectionChange={setSelectedProducts}
        />
      )}
      
      {/* Checkout Form */}
      <CompactCheckoutForm
        onSubmit={handleCheckout}
      />
    </div>
  );
}
```

---

## Component Architecture

### IntentWizard (3 Steps)

```typescript
// app/components/landing-builder/IntentWizard.tsx

export function IntentWizard({ onComplete }: IntentWizardProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<Partial<Intent>>({});
  
  // Step 1: Product type + goal + traffic source (radio buttons)
  // Step 2: Headline input
  // Step 3: Template preview
  
  return (
    <div className="wizard-container">
      {step === 1 && <Step1ProductType />}
      {step === 2 && <Step2Goal />}
      {step === 3 && <Step3TrafficSource />}
      {/* Navigation */}
    </div>
  );
}
```

### Variant Selector in Editor

```typescript
// SortableItem calls this when palette button clicked
export function VariantSelector({
  sectionId,
  currentVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  const variants = getVariantsForSection(sectionId);
  
  return (
    <div className="variant-cards">
      {variants.map((variant) => (
        <VariantCard
          key={variant.id}
          variant={variant}
          isSelected={currentVariant === variant.id}
          onClick={() => onSelectVariant(variant.id)}
        />
      ))}
    </div>
  );
}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Page load (P75) | < 2 seconds |
| API response (P95) | < 500ms |
| Mobile Lighthouse | > 85 |
