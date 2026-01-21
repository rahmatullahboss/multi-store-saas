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
- `app/utils/landing-builder/intentEngine.ts` - Intent mapping, auto-generation
- `app/utils/landing-builder/variantRegistry.ts` - 18 section variants

#### Components
- `app/components/landing-builder/IntentWizard.tsx` - 3-step wizard
- `app/components/landing-builder/VariantSelector.tsx` - Variant picker
- `app/components/landing-builder/StyleWizard.tsx` - Style controls
- `app/components/checkout/CheckoutModal.tsx` - Embedded checkout

#### Integration Points
- `app/routes/app.new-builder._index.tsx` - Main entry (popup)
- `app/routes/app.settings.landing.tsx` - Style & checkout settings
- `app/lib/page-builder/actions.server.ts` - Page creation logic
- `app/components/page-builder/SortableItem.tsx` - Variant button

#### Types
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

### Style Wizard Settings

```typescript
// db/types.ts

export interface StyleWizardSettings {
  brandColor?: string;
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  fontFamily?: 'system' | 'serif' | 'sans-serif';
  darkMode?: boolean;
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
    const intent = JSON.parse(data.get('intent') as string);
    const storeId = data.get('storeId') as string;
    
    // 1. Generate optimal sections
    const sections = generateOptimalSections(intent);
    const template = selectOptimalTemplate(intent);
    
    // 2. Create landing config
    const config = {
      templateId: template,
      headline: intent.headline || 'New Landing Page',
      sectionOrder: sections,
      intent,
    };
    
    // 3. Save to database
    const pageId = await createPageFromTemplate(context.db, {
      storeId,
      template,
      slug: generateSlug(),
      title: intent.headline,
      intentData: config,
    });
    
    return redirect(`/app/new-builder/${pageId}`);
  }
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

### Add to stores table

```sql
ALTER TABLE stores ADD COLUMN landing_intent TEXT; -- JSON
ALTER TABLE stores ADD COLUMN section_variants TEXT; -- JSON
ALTER TABLE stores ADD COLUMN checkout_modal_enabled INTEGER DEFAULT 0;
ALTER TABLE stores ADD COLUMN style_wizard TEXT; -- JSON
```

### Drizzle Schema

```typescript
// db/schema.ts

export const stores = sqliteTable('stores', {
  // ... existing columns
  landingIntent: text('landing_intent'), // JSON: LandingIntent
  sectionVariants: text('section_variants'), // JSON
  checkoutModalEnabled: integer('checkout_modal_enabled').default(0),
  styleWizard: text('style_wizard'), // JSON: StyleWizardSettings
});
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
