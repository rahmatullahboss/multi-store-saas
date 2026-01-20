# Quick Builder v2 - Technical Implementation Guide

## 📋 Table of Contents
1. [File Structure](#file-structure)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Utility Functions](#utility-functions)
8. [Testing Strategy](#testing-strategy)

---

## File Structure

### New Files to Create

```
app/
├── components/
│   └── landing-builder/
│       ├── IntentWizard.tsx (NEW)
│       │   - 3-step wizard UI
│       │   - Product type, goal, traffic source selection
│       │   - Next/Previous navigation
│       │   - Form validation
│       │
│       ├── QuickProductForm.tsx (NEW)
│       │   - Inline product creation
│       │   - Image upload
│       │   - Variant management
│       │   - Price validation
│       │
│       ├── SectionVariantSelector.tsx (NEW)
│       │   - Show 2-3 variant previews
│       │   - Clickable variant cards
│       │   - Real-time preview update
│       │   - Variant descriptions
│       │
│       ├── StyleWizard.tsx (NEW)
│       │   - Color picker (presets + custom)
│       │   - Button style selector
│       │   - Font family selector
│       │   - Dark mode toggle
│       │
│       ├── CheckoutModal.tsx (NEW)
│       │   - Modal wrapper
│       │   - Overlay, close button, animations
│       │   - Mobile full-screen support
│       │
│       ├── CompactCheckoutForm.tsx (NEW)
│       │   - Form with name, phone, address
│       │   - Variant selector (if applicable)
│       │   - Delivery area selector
│       │   - Order summary
│       │
│       └── variants/ (NEW FOLDER)
│           ├── HeroProductFocused.tsx
│           ├── HeroOfferFocused.tsx
│           ├── HeroVideoFocused.tsx
│           ├── HeroTextFocused.tsx
│           ├── TestimonialsCarousel.tsx
│           ├── TestimonialsCards.tsx
│           ├── TestimonialsAvatars.tsx
│           ├── CTAButtonOnly.tsx
│           ├── CTAWithTrust.tsx
│           ├── CTAUrgency.tsx
│           ├── FeaturesGrid.tsx
│           ├── FeaturesList.tsx
│           └── index.ts (variant exports)
│
├── routes/
│   ├── app.quick-builder.new.tsx (NEW)
│   │   - Intent wizard page
│   │   - POST handler for wizard completion
│   │   - Redirect to edit page
│   │
│   ├── app.quick-builder.$id.tsx (NEW)
│   │   - Edit landing page
│   │   - Load landing config
│   │   - Section manager UI
│   │
│   ├── app.quick-builder.$id.preview.tsx (NEW)
│   │   - Full-screen landing page preview
│   │   - Modal modal enabled
│   │
│   └── app.quick-builder.$id.analytics.tsx (NEW)
│       - Simple analytics dashboard
│       - Views, clicks, conversions
│
└── utils/
    └── landing-builder/
        ├── intentEngine.ts (NEW)
        │   - generateOptimalSections()
        │   - selectOptimalTemplate()
        │   - generateDefaultContent()
        │
        ├── variantRegistry.ts (NEW)
        │   - SECTION_VARIANTS constant
        │   - Variant definitions
        │   - Variant lookup functions
        │
        ├── autoGenerator.ts (NEW)
        │   - Auto-generate landing config from intent
        │   - Create default sections
        │
        └── analytics.ts (NEW)
            - Track events
            - Calculate metrics
            - Query analytics data
```

### Modified Files

```
db/types.ts
- Add Intent interface
- Add sectionVariants field to LandingConfig
- Add styleWizard field to LandingConfig
- Add checkoutModalEnabled field

app/components/landing-builder/SectionManager.tsx
- Import SectionVariantSelector
- Add variant selection UI to section editors
- Update section editors to show variant options

app/routes/app.settings.landing.tsx
- Add link to new quick builder
- Show quick builder CTA
```

---

## TypeScript Interfaces

### Core Intent Interface

```typescript
// app/utils/landing-builder/intentEngine.ts

export interface Intent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
}

export interface IntentWithProduct extends Intent {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  createdAt: string;
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
  thumbnail: string; // Image URL or data URL
  defaultConfig: Record<string, any>;
  tags: string[]; // e.g., ['mobile-friendly', 'urgency', 'trust']
  compatibleWith: string[]; // Intents this variant is suggested for
}

export interface SectionVariantProps {
  config: Record<string, any>;
  isEditing?: boolean;
  onUpdate?: (newConfig: Record<string, any>) => void;
}
```

### Checkout Modal Interface

```typescript
// app/components/landing-builder/CheckoutModal.tsx

export interface CheckoutModalContextValue {
  isOpen: boolean;
  productId: string | null;
  variantId: string | null;
  openModal: (productId: string, variantId?: string) => void;
  closeModal: () => void;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  variantId?: string;
  quantity: number;
  deliveryArea: 'inside-dhaka' | 'outside-dhaka';
}
```

### Visibility Rules Interface

```typescript
// app/utils/landing-builder/visibilityEngine.ts

/**
 * VisibilityRule - Controls when a section is displayed
 * Supports device, content, time, and stock-based conditions
 */
export interface VisibilityRule {
  // Basic visibility
  isVisible: boolean;
  
  // Device-based rules
  showOnMobile?: boolean;      // Show only on mobile (< 768px)
  showOnDesktop?: boolean;     // Show only on desktop (>= 768px)
  
  // Content-based rules
  showIfProductHasVideo?: boolean;
  showIfProductHasVariants?: boolean;
  showIfProductOnSale?: boolean;
  
  // Time-based rules
  showAfterDate?: string;      // ISO date string
  hideAfterDate?: string;      // ISO date string
  
  // Stock-based rules
  showIfInStock?: boolean;
  hideIfLowStock?: boolean;
  lowStockThreshold?: number;  // Default: 5
}

/**
 * Evaluates visibility rules for a section
 */
export function evaluateVisibility(
  rule: VisibilityRule,
  context: {
    isMobile: boolean;
    product: { hasVideo?: boolean; hasVariants?: boolean; onSale?: boolean; stock?: number };
    currentDate: Date;
  }
): boolean {
  if (!rule.isVisible) return false;
  
  // Device check
  if (rule.showOnMobile !== undefined && rule.showOnMobile !== context.isMobile) return false;
  if (rule.showOnDesktop !== undefined && rule.showOnDesktop === context.isMobile) return false;
  
  // Content check
  if (rule.showIfProductHasVideo && !context.product.hasVideo) return false;
  if (rule.showIfProductHasVariants && !context.product.hasVariants) return false;
  if (rule.showIfProductOnSale && !context.product.onSale) return false;
  
  // Time check
  if (rule.showAfterDate && new Date(rule.showAfterDate) > context.currentDate) return false;
  if (rule.hideAfterDate && new Date(rule.hideAfterDate) < context.currentDate) return false;
  
  // Stock check
  if (rule.showIfInStock && (context.product.stock ?? 0) <= 0) return false;
  if (rule.hideIfLowStock && (context.product.stock ?? 0) < (rule.lowStockThreshold ?? 5)) return false;
  
  return true;
}
```

### Checkout Configuration Interface

```typescript
// app/utils/landing-builder/checkoutConfig.ts

/**
 * CheckoutConfig - Full checkout customization
 * Supports COD, bKash, Nagad, and Stripe payments
 */
export interface CheckoutConfig {
  // Checkout mode
  mode: 'modal' | 'redirect' | 'inline';
  
  // Payment methods
  paymentMethods: {
    cod: {
      enabled: boolean;
      codFee?: number;
      codFeeType?: 'fixed' | 'percentage';
    };
    bkash?: {
      enabled: boolean;
      merchantNumber?: string;
    };
    nagad?: {
      enabled: boolean;
      merchantNumber?: string;
    };
    stripe?: {
      enabled: boolean;
    };
  };
  
  // Form fields
  formFields: {
    name: { required: boolean; placeholder?: string };
    phone: { required: boolean; format?: 'bd' | 'international' };
    email: { required: boolean; showField: boolean };
    address: { required: boolean; minLength?: number };
    deliveryArea: {
      required: boolean;
      options: Array<{ id: string; name: string; shippingFee: number }>;
    };
    note: { showField: boolean; placeholder?: string };
  };
  
  // Shipping
  shipping: {
    insideDhaka: number;
    outsideDhaka: number;
    freeShippingThreshold?: number;
  };
  
  // UI customization
  ui: {
    submitButtonText?: string;
    successMessage?: string;
    showOrderSummary: boolean;
    showTrustBadges: boolean;
  };
  
  // Express checkout
  expressCheckout?: {
    enabled: boolean;
    rememberCustomer: boolean;
  };
}

// Default config for BD market
export const DEFAULT_CHECKOUT_CONFIG: CheckoutConfig = {
  mode: 'modal',
  paymentMethods: {
    cod: { enabled: true, codFee: 0 },
  },
  formFields: {
    name: { required: true, placeholder: 'আপনার নাম' },
    phone: { required: true, format: 'bd' },
    email: { required: false, showField: false },
    address: { required: true, minLength: 10 },
    deliveryArea: {
      required: true,
      options: [
        { id: 'dhaka', name: 'ঢাকার ভিতরে', shippingFee: 60 },
        { id: 'outside', name: 'ঢাকার বাইরে', shippingFee: 120 },
      ],
    },
    note: { showField: true, placeholder: 'অতিরিক্ত তথ্য' },
  },
  shipping: { insideDhaka: 60, outsideDhaka: 120 },
  ui: {
    submitButtonText: 'অর্ডার কনফার্ম করুন',
    successMessage: 'অর্ডার সফল!',
    showOrderSummary: true,
    showTrustBadges: true,
  },
};
```

### Style Wizard Interface

```typescript
// db/types.ts - Add to LandingConfig

export interface StyleWizardSettings {
  brandColor?: string; // e.g., '#10b981'
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  fontFamily?: 'system' | 'serif' | 'sans-serif';
  darkMode?: boolean;
}

// In LandingConfig:
styleWizard?: StyleWizardSettings;
```

---

## Component Architecture

### IntentWizard Component Structure

```typescript
// app/components/landing-builder/IntentWizard.tsx

export interface IntentWizardProps {
  onComplete: (intent: Intent, product: QuickProduct) => void;
  initialIntent?: Intent;
}

export function IntentWizard({ onComplete, initialIntent }: IntentWizardProps) {
  const [step, setStep] = useState(1); // 1-3
  const [intent, setIntent] = useState<Partial<Intent>>(initialIntent || {});
  const [product, setProduct] = useState<Partial<QuickProduct> | null>(null);
  
  // Step 1: Product type + goal + traffic source (radio buttons)
  // Step 2: Quick product form
  // Step 3: Template selection with preview
  
  return (
    <div className="wizard-container">
      {step === 1 && <Step1ProductType />}
      {step === 2 && <Step2QuickProduct />}
      {step === 3 && <Step3TemplateSelect />}
      {/* Navigation buttons */}
    </div>
  );
}
```

### Variant Selector Component

```typescript
// app/components/landing-builder/SectionVariantSelector.tsx

export interface SectionVariantSelectorProps {
  sectionId: string;
  currentVariant: string;
  availableVariants: SectionVariantDef[];
  onSelectVariant: (variantId: string) => void;
}

export function SectionVariantSelector({
  sectionId,
  currentVariant,
  availableVariants,
  onSelectVariant,
}: SectionVariantSelectorProps) {
  return (
    <div className="variant-selector">
      <h4>Section Style</h4>
      <div className="variant-cards">
        {availableVariants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isSelected={currentVariant === variant.id}
            onClick={() => onSelectVariant(variant.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### CheckoutModal Context Hook

```typescript
// app/components/landing-builder/CheckoutModal.tsx

export const CheckoutModalContext = createContext<CheckoutModalContextValue | null>(null);

export function useCheckoutModal() {
  const context = useContext(CheckoutModalContext);
  if (!context) {
    throw new Error('useCheckoutModal must be used within CheckoutModalProvider');
  }
  return context;
}

export function CheckoutModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);

  const openModal = (pId: string, vId?: string) => {
    setProductId(pId);
    setVariantId(vId || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <CheckoutModalContext.Provider value={{ isOpen, productId, variantId, openModal, closeModal }}>
      {children}
      <CheckoutModal />
    </CheckoutModalContext.Provider>
  );
}
```

---

## State Management

### Landing Page State (Server + Client)

```typescript
// Server state (D1 database)
interface LandingPage {
  id: string;
  storeId: string;
  config: LandingConfig; // Serialized JSON
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Client state (form inputs + preview)
interface LandingPageEditState {
  config: LandingConfig;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: string;
}
```

### Intent Wizard State

```typescript
// Session/Storage-based state
interface IntentWizardState {
  step: 1 | 2 | 3;
  intent: Intent;
  product: QuickProduct;
  selectedTemplate: string;
  isComplete: boolean;
}
```

---

## Rendering Architecture

### Overview

The Quick Builder uses a **Single Source of Truth** rendering approach where the same `LandingConfig` JSON renders both the editor preview and the public landing page.

```
┌─────────────────────────────────────────────────────────────┐
│                    LandingConfig JSON                        │
│  (stores.landingConfig or landing_pages.config)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TemplateRenderer                          │
│  - Selects template component based on templateId            │
│  - Applies global styles (colors, fonts)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SectionRenderer                           │
│  - Iterates through sectionOrder[]                          │
│  - Evaluates visibility rules                                │
│  - Passes section config to variant component                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VariantRenderer                           │
│  - Selects variant component (e.g., HeroProductFocused)      │
│  - Renders with section-specific props                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Final HTML Output                         │
│  - SSR via Remix                                             │
│  - SEO meta tags                                             │
│  - JSON-LD structured data                                   │
└─────────────────────────────────────────────────────────────┘
```

### Rendering Modes

```typescript
// app/utils/landing-builder/renderEngine.ts

export type RenderMode = 'editor' | 'preview' | 'production';

export interface RenderContext {
  mode: RenderMode;
  config: LandingConfig;
  product: Product;
  storeId: string;
  isMobile: boolean;
}

export function renderLandingPage(ctx: RenderContext): React.ReactNode {
  const { mode, config, product, isMobile } = ctx;
  
  // Get template component
  const Template = getTemplateComponent(config.templateId);
  
  // Filter visible sections
  const visibleSections = config.sectionOrder.filter((sectionId) => {
    const rule = config.sectionVisibility?.[sectionId];
    if (!rule) return true;
    return evaluateVisibility(rule, { isMobile, product, currentDate: new Date() });
  });
  
  return (
    <Template
      config={config}
      sections={visibleSections}
      renderMode={mode}
      product={product}
    />
  );
}
```

### Editor vs Production Mode

| Aspect | Editor Mode | Preview Mode | Production Mode |
|--------|-------------|--------------|-----------------|
| Data Source | Unsaved draft | Saved draft | Published config |
| Edit Controls | Visible | Hidden | Hidden |
| Checkout | Disabled | Preview only | Fully functional |
| Analytics | Disabled | Disabled | Enabled |
| Cache | No cache | No cache | KV cache enabled |
| SSR | Client-side | SSR | SSR |

### Template Component Structure

```typescript
// app/components/templates/[template]/index.tsx

interface TemplateProps {
  config: LandingConfig;
  sections: string[];
  renderMode: RenderMode;
  product: Product;
}

export function PremiumBDTemplate({ config, sections, renderMode, product }: TemplateProps) {
  return (
    <div className={cn('template-premium-bd', config.styleWizard?.darkMode && 'dark')}>
      {sections.map((sectionId) => (
        <SectionRenderer
          key={sectionId}
          sectionId={sectionId}
          variantId={config.sectionVariants?.[sectionId]}
          config={config}
          product={product}
          renderMode={renderMode}
        />
      ))}
      
      {/* Checkout Modal - only in production */}
      {renderMode === 'production' && config.checkoutConfig?.mode === 'modal' && (
        <CheckoutModalProvider>
          <CheckoutModal config={config.checkoutConfig} product={product} />
        </CheckoutModalProvider>
      )}
    </div>
  );
}
```

### SEO & Performance

```typescript
// app/routes/o.$slug.tsx (Public landing page route)

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.config) return [];
  
  return [
    { title: data.config.seoTitle || data.config.headline },
    { name: 'description', content: data.config.seoDescription || data.config.subheadline },
    { property: 'og:title', content: data.config.headline },
    { property: 'og:description', content: data.config.subheadline },
    { property: 'og:image', content: data.product?.images?.[0] },
    { property: 'og:type', content: 'product' },
  ];
};

// JSON-LD for product
export function ProductJsonLd({ product, config }: { product: Product; config: LandingConfig }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BDT',
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    },
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Performance Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| First Contentful Paint (FCP) | < 1.5s | SSR, critical CSS inline |
| Largest Contentful Paint (LCP) | < 2.5s | Optimized images (WebP), lazy load |
| Time to Interactive (TTI) | < 3s | Code splitting, defer non-critical JS |
| Cumulative Layout Shift (CLS) | < 0.1 | Fixed image dimensions, font-display: swap |
| Total Page Size | < 500KB | Image compression, tree shaking |

---

## Database Schema

### New/Modified Tables

```sql
-- Landing pages table (already exists, add new columns)
ALTER TABLE landing_pages ADD COLUMN intent JSON;
-- Example: {"productType": "single", "goal": "direct_sales", "trafficSource": "facebook"}

ALTER TABLE landing_pages ADD COLUMN analytics_enabled BOOLEAN DEFAULT true;
ALTER TABLE landing_pages ADD COLUMN ab_test_variant_id TEXT;
ALTER TABLE landing_pages ADD COLUMN ab_test_original_id TEXT;

-- New: Landing page events table
CREATE TABLE landing_page_events (
  id TEXT PRIMARY KEY,
  landing_page_id TEXT NOT NULL REFERENCES landing_pages(id),
  event_type TEXT NOT NULL, -- 'page_view', 'cta_click', 'checkout_opened', 'order_placed'
  data JSON, -- Additional event data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landing_page_events_page_id ON landing_page_events(landing_page_id);
CREATE INDEX idx_landing_page_events_created_at ON landing_page_events(created_at);

-- Variant definitions (cache table)
CREATE TABLE section_variants (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL,
  name TEXT NOT NULL,
  component_name TEXT NOT NULL,
  thumbnail TEXT,
  tags JSON, -- Array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Routes

### 1. Create Landing Page with Intent

```typescript
// POST /api/landing-pages/quick-create
// Handler: app/routes/api.landing-pages.quick-create.ts

export async function action({ request, context }: ActionFunction) {
  if (request.method !== 'POST') return new Response('Not found', { status: 404 });
  
  const data = await request.json();
  const intent: Intent = data.intent;
  const product = data.product;
  
  // 1. Create product
  const productId = await createQuickProduct(context.db, product);
  
  // 2. Generate optimal sections
  const sections = generateOptimalSections(intent);
  const template = selectOptimalTemplate(intent);
  
  // 3. Create landing config
  const config: LandingConfig = {
    templateId: template,
    headline: `Sell ${product.name}`,
    ctaText: 'Order Now',
    sectionOrder: sections,
    intent: {
      ...intent,
      createdAt: new Date().toISOString(),
    },
    // ... other defaults
  };
  
  // 4. Save to database
  const landingPageId = await saveLandingPage(context.db, {
    storeId: data.storeId,
    config,
    status: 'draft',
  });
  
  return json({ success: true, landingPageId });
}
```

### 2. Update Section Variant

```typescript
// PATCH /api/landing-pages/:id/sections/:sectionId/variant
// Handler: app/routes/api.landing-pages.$id.sections.$sectionId.variant.ts

export async function action({ request, context, params }: ActionFunction) {
  if (request.method !== 'PATCH') return new Response('Not found', { status: 404 });
  
  const { id, sectionId } = params;
  const { variantId } = await request.json();
  
  // 1. Load landing page
  const page = await getLandingPage(context.db, id);
  
  // 2. Update section variant
  if (!page.config.sectionVariants) {
    page.config.sectionVariants = {};
  }
  page.config.sectionVariants[sectionId] = variantId;
  
  // 3. Save
  await updateLandingPage(context.db, id, page.config);
  
  return json({ success: true });
}
```

### 3. Save Style Settings

```typescript
// PATCH /api/landing-pages/:id/style
// Handler: app/routes/api.landing-pages.$id.style.ts

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

### 4. Track Analytics Event

```typescript
// POST /api/landing-pages/:id/events
// Handler: app/routes/api.landing-pages.$id.events.ts

export async function action({ request, context, params }: ActionFunction) {
  if (request.method !== 'POST') return new Response('Not found', { status: 404 });
  
  const { id } = params;
  const { eventType, data } = await request.json();
  
  await trackEvent(context.db, id, eventType, data);
  
  return json({ success: true });
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

export function generateDefaultContent(intent: Intent, product: any): Partial<LandingConfig> {
  return {
    headline: `Discover ${product.name}`,
    subheadline: 'High-quality product with fast delivery',
    ctaText: 'Order Now',
    // ... more defaults
  };
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
  // ... more variants
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

## Testing Strategy

### Unit Tests

```typescript
// app/utils/landing-builder/intentEngine.test.ts

describe('generateOptimalSections', () => {
  it('returns facebook-optimized sections for direct_sales + facebook', () => {
    const intent: Intent = {
      productType: 'single',
      goal: 'direct_sales',
      trafficSource: 'facebook',
    };
    const result = generateOptimalSections(intent);
    expect(result).toContain('hero');
    expect(result).toContain('testimonials');
    expect(result).toContain('cta');
  });

  it('returns tiktok-optimized sections for direct_sales + tiktok', () => {
    const intent: Intent = {
      productType: 'single',
      goal: 'direct_sales',
      trafficSource: 'tiktok',
    };
    const result = generateOptimalSections(intent);
    expect(result).toContain('social');
    expect(result).toContain('urgency');
  });
});

describe('selectOptimalTemplate', () => {
  it('returns premium-bd for facebook', () => {
    const intent: Intent = {
      productType: 'single',
      goal: 'direct_sales',
      trafficSource: 'facebook',
    };
    expect(selectOptimalTemplate(intent)).toBe('premium-bd');
  });
});
```

### Integration Tests

```typescript
// app/routes/api.landing-pages.quick-create.test.ts

describe('POST /api/landing-pages/quick-create', () => {
  it('creates landing page from intent', async () => {
    const response = await fetch('/api/landing-pages/quick-create', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store_123',
        intent: {
          productType: 'single',
          goal: 'direct_sales',
          trafficSource: 'facebook',
        },
        product: {
          name: 'Tea',
          price: 500,
          image: 'https://...',
        },
      }),
    });

    const { success, landingPageId } = await response.json();
    expect(success).toBe(true);
    expect(landingPageId).toBeDefined();
  });
});
```

### E2E Tests

```typescript
// tests/quick-builder-e2e.test.ts (Playwright)

test('complete quick builder flow', async ({ page }) => {
  // 1. Navigate to quick builder
  await page.goto('/app/quick-builder/new');
  
  // 2. Step 1: Select product type
  await page.click('button:has-text("Single Product")');
  await page.click('button:has-text("Next")');
  
  // 3. Step 2: Select goal
  await page.click('button:has-text("Direct Sales")');
  await page.click('button:has-text("Next")');
  
  // 4. Step 3: Select traffic source
  await page.click('button:has-text("Facebook")');
  await page.click('button:has-text("Next")');
  
  // 5. Upload product
  await page.fill('input[name="productName"]', 'Premium Tea');
  await page.fill('input[name="productPrice"]', '500');
  // ... upload image
  await page.click('button:has-text("Create Landing Page")');
  
  // 6. Verify landing page created
  await expect(page).toHaveURL(/\/app\/quick-builder\/\w+/);
  await expect(page.locator('text=Premium Tea')).toBeVisible();
});
```

---

## Performance Checklist

- [ ] Page load time < 2 seconds (P75)
- [ ] Critical CSS inlined
- [ ] Images lazy-loaded
- [ ] JSON config minified
- [ ] No layout shift (CLS < 0.1)
- [ ] Mobile Lighthouse score > 85
- [ ] API response time < 500ms (P95)

---

