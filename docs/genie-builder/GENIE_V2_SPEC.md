# Quick Builder v2 Comprehensive Specification

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Target Users](#target-users)
3. [Core Principles](#core-principles)
4. [Feature List](#feature-list)
5. [Data Model](#data-model)
6. [API Endpoints](#api-endpoints)
7. [User Flows](#user-flows)

---

## System Overview

### What is Quick Builder v2?

Quick Builder v2 is an **intent-driven, zero-code landing page builder** for merchants who want to sell products **WITHOUT needing a full store**. It's designed for:

- Facebook/TikTok ad sellers
- Single-product dropshippers
- Beginners launching their first product
- Seasonal/promotional campaigns
- Lead generation funnels

### Why v2?

**Current v1 Issues:**
- ❌ Same default layout for everyone (no optimization)
- ❌ Must create product separately before building page
- ❌ No way to choose between similar sections (e.g., hero variants)
- ❌ No guided wizard - users overwhelmed by choices
- ❌ Checkout redirects to `/checkout` instead of modal
- ❌ Color/font selection buried in settings

**v2 Solutions:**
- ✅ Intent-based wizard (What are you selling? What's your goal?)
- ✅ Smart auto-generation (system suggests optimal sections/order)
- ✅ Section variants (multiple styles for each section)
- ✅ Quick product creation (inline product generator)
- ✅ Embedded checkout modal (no page redirects)
- ✅ Style wizard (quick brand customization)

---

## Target Users

### 1. Facebook Ad Sellers (Primary)
- Selling single product via Facebook ads
- Minimal technical knowledge
- Wants high-converting page in < 5 minutes
- **Goal:** Direct sales with instant checkout
- **Traffic Source:** Facebook/Instagram

### 2. TikTok Shop Competitors
- Selling trending products
- Multiple variants (sizes, colors)
- Wants urgency features (countdown, stock counter)
- **Goal:** Capture impulse buyers
- **Traffic Source:** TikTok, Instagram Reels

### 3. Single-Product Dropshippers
- Testing new products
- Want analytics before investing in full store
- Needs COD-focused checkout
- **Goal:** Sales with minimal overhead
- **Traffic Source:** Organic, Email

### 4. Lead Generation Funnels
- Collecting emails/WhatsApp numbers
- Building customer database
- Wants sequential pages (Product → Lead Form → Thank You)
- **Goal:** Leads + WhatsApp connections
- **Traffic Source:** Facebook Lead Ads

### 5. Local Business Promoters
- Single seasonal product (e.g., Pohela Boishakh gift)
- Local BD market
- Wants trust badges + testimonials
- **Goal:** Sales within region
- **Traffic Source:** Organic, WhatsApp

---

## Core Principles

### 1. **Users Make Decisions, System Designs**
- Don't overwhelm with options
- Ask intent → suggest optimal layout
- Users can customize, but start with smart defaults

### 2. **No Drag-Drop Complexity**
- Simple list: add/remove sections, drag to reorder
- Click to edit each section
- Pre-designed section templates (no custom CSS for beginners)

### 3. **Locked Layouts (Constrained Design)**
- Fixed width, centered content
- Mobile-first responsive
- No pixel-perfect positioning
- Ensures consistent look across templates

### 4. **Speed + Conversion Focus**
- Sections optimized for each traffic source
- Trust badges, testimonials, urgency built-in
- Minimalist CTA design
- Fast load time (< 2s target)

### 5. **Mobile-First Design**
- All designs tested on mobile
- Touch-friendly buttons
- Stacked layout on small screens
- One-thumb scrolling supported

### 6. **Favor Safety Over Flexibility**
- Impossible to break layouts visually
- No arbitrary CSS injection
- Constrained color/font choices
- Validated inputs only

---

## System Constraints

> **IMPORTANT:** These constraints ensure consistent, professional landing pages.

### What Users CANNOT Do:
| Constraint | Reason |
|-----------|--------|
| ❌ No drag & drop widget placement | Prevents broken layouts |
| ❌ No pixel-level positioning | Ensures mobile compatibility |
| ❌ No custom CSS injection | Security + consistency |
| ❌ No arbitrary HTML | XSS prevention |
| ❌ No layout-breaking options | Professional output guaranteed |

### What Users CAN Do:
| Allowed | How |
|---------|-----|
| ✅ Reorder sections | Drag to reorder in list |
| ✅ Choose section variants | Click variant thumbnail |
| ✅ Edit text content | Inline editing |
| ✅ Upload images | Image uploader with compression |
| ✅ Select brand colors | From preset palette or color picker |
| ✅ Choose fonts | From 3-5 curated font families |
| ✅ Toggle sections on/off | Visibility toggle |

---

## Rendering Strategy

### Single Source of Truth
The same `LandingConfig` JSON renders both:
1. **Editor Preview** - Live preview while editing
2. **Public Landing Page** - Published customer-facing page

### Rendering Rules

```typescript
// Rendering flow
LandingConfig JSON
    ↓
TemplateRenderer (selects template)
    ↓
SectionRenderer (loops through sections)
    ↓
VariantRenderer (selects variant component)
    ↓
Final HTML Output
```

### Editor vs Production

| Aspect | Editor Mode | Production Mode |
|--------|-------------|-----------------|
| Interactivity | Edit buttons, hover states | No edit UI |
| Data source | Draft config (unsaved) | Published config |
| Checkout | Preview only | Real orders |
| Analytics | Disabled | Enabled |
| Cache | No cache | KV cache enabled |

### SEO Requirements
- Server-side rendered (SSR) via Remix
- Valid meta tags (title, description, og:image)
- JSON-LD structured data for products
- Canonical URL for each landing page
- Mobile-friendly viewport

### Performance Targets
| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Total Page Size | < 500KB |

---

## Extensibility Roadmap

### Future Intent Types (Post-MVP)

| Intent Type | Description | Timeline |
|-------------|-------------|----------|
| `webinar` | Event registration landing | Q2 2026 |
| `ebook` | Digital product + download | Q2 2026 |
| `service` | Service booking page | Q3 2026 |
| `appointment` | Calendar booking integration | Q3 2026 |
| `waitlist` | Pre-launch signup | Q2 2026 |

### Future Section Types

| Section | Description | Timeline |
|---------|-------------|----------|
| `countdown-hero` | Full-screen countdown timer | Phase 2 |
| `video-testimonials` | Video review embeds | Phase 3 |
| `comparison-table` | Us vs competitors | Phase 2 |
| `instagram-feed` | Live IG feed embed | Phase 4 |
| `calculator` | Price/savings calculator | Phase 4 |

### AI-Powered Features (Future)

| Feature | Description | Timeline |
|---------|-------------|----------|
| AI Headline Generator | Generate 5 headline options | Phase 2 |
| AI Product Description | Auto-write product copy | Phase 2 |
| AI Image Enhancement | Auto-crop, background remove | Phase 3 |
| AI A/B Suggestions | Suggest variants to test | Phase 4 |
| Smart Analytics Insights | AI-powered conversion tips | Phase 4 |

### A/B Testing Support

```typescript
// Future A/B test structure
interface ABTest {
  id: string;
  originalPageId: string;
  variantPageId: string;
  trafficSplit: number; // 0-100
  metric: 'conversion' | 'clicks' | 'time_on_page';
  status: 'draft' | 'running' | 'completed';
  startedAt?: string;
  completedAt?: string;
  winner?: 'original' | 'variant' | 'tie';
}
```

### Plugin System (Long-term)

Future support for:
- Custom section plugins (verified only)
- Third-party integrations (Mailchimp, Klaviyo)
- Custom analytics providers
- Payment gateway plugins

---

## Feature List

### Phase 0: Core (Already Done ✅)
- [ ] **17 predefined sections** (hero, trust, features, testimonials, FAQ, CTA, etc.)
- [ ] **12 visual templates** (premium-bd, flash-sale, mobile-first, luxe, organic, modern-dark, minimal-light, video-focus, showcase, minimal-clean, story-driven, trust-first)
- [ ] Section ordering & visibility controls
- [ ] Basic content editing for each section
- [ ] COD-priority checkout integration
- [ ] LandingConfig type with 100+ fields

### Phase 1: Intent-Based Quick Builder (Week 1)
**Priority: P0 (Critical)**

- [ ] **Intent Selection UI** (`/app/quick-builder/new`)
  - Product Type: `single` | `multiple`
  - Goal: `direct_sales` | `lead_whatsapp`
  - Traffic Source: `facebook` | `tiktok` | `organic`
  - Expected Result: Initial product info

- [ ] **Smart Auto-Generation**
  - `generateOptimalSections(intent)` function
  - Traffic-source-based section ordering
  - Goal-specific default content

- [ ] **Quick Product Creation**
  - Inline product form (no modal redirect)
  - Support for variants
  - Image upload
  - Price & compare-at-price

- [ ] **Template Selection**
  - Suggest template based on intent
  - Allow override choice
  - Show preview before confirming

### Phase 2: Section Variants System (Week 2)
**Priority: P0 (Critical)**

- [ ] **Variant Data Model**
  - `SectionConfig` with `variant` field
  - Store in `landingConfig.sectionVariants`
  - Variants for: hero, testimonials, CTA, features, social-proof

- [ ] **SECTION_VARIANTS Registry**
  ```
  Hero variants:
    - product-focused (big product image)
    - offer-focused (big discount)
    - video-focused (video embed)
    - text-focused (bold headline)
  
  Testimonials variants:
    - cards (grid layout)
    - carousel (horizontal scroll)
    - avatars (just images)
    - screenshots (FB/WhatsApp review screenshots)
    - star-rating (with star ratings display)
  
  CTA variants:
    - button-only (minimal)
    - with-trust (badges below)
    - urgency-focused (countdown)
  
  Features variants:
    - 3-column grid
    - 4-column grid
    - vertical list
    - card layout
  ```

- [ ] **Variant Selector UI**
  - Show 2-3 variant previews
  - Click to switch variant
  - Real-time preview update

- [ ] **Template Variant Components**
  - `HeroSection` component accepts `variant` prop
  - `TestimonialsSection` component accepts `variant` prop
  - etc.

### Phase 3: Embedded Checkout Modal (Week 3)
**Priority: P0 (Critical)**

- [ ] **CheckoutModal Component**
  - Overlay modal, not full-page redirect
  - Trigger from CTA button
  - Close button + ESC key support
  - Mobile-optimized

- [ ] **CompactCheckoutForm**
  - Minimal form (name, phone, address only)
  - COD by default
  - No multi-step
  - Express mode: pre-fill from intent wizard

- [ ] **Integration**
  - CTA button: `onClick={() => openModal()}`
  - Pass product ID to modal
  - Return to landing page after order placed
  - Show success message with order number

- [ ] **Mobile Responsiveness**
  - Full-screen modal on mobile
  - Keyboard visible + scroll
  - Bottom sheet on iOS

### Phase 4: Style Wizard & Polish (Week 4)
**Priority: P1 (High)**

- [ ] **Quick Style Wizard**
  - Brand color picker (5 quick presets + custom)
  - Button style (rounded | sharp | pill)
  - Font choice (system | serif | sans-serif)
  - Light/Dark mode toggle

- [ ] **Multi-Product Landing Support**
  - Select 1-3 products instead of just 1
  - Product switcher UI
  - Variant selector per product

- [ ] **Performance**
  - Critical CSS inlining
  - Lazy load images
  - Minify JSON config
  - Target: < 2s load time

- [ ] **Analytics Integration**
  - Track: page views, CTA clicks, checkout opens, conversions
  - Simple dashboard in merchant settings
  - Export CSV report

### Additional P1 Features
- [ ] **A/B Testing Variants**
  - Create landing page variant
  - Split traffic 50/50
  - Compare conversion rates
  
- [ ] **Countdown Timer**
  - Auto-generate ending time (24h from now)
  - Display in hero + CTA
  - Urgency text customization

- [ ] **Social Proof Widget**
  - Recent order notifications (toast)
  - Live visitor counter
  - Sales counter

- [ ] **WhatsApp Integration**
  - WhatsApp order button
  - Pre-filled message
  - Track WhatsApp clicks

### P2 Features (Future)
- [ ] AI content generation (product description, FAQ)
- [ ] Influencer templates (custom for influencer partnerships)
- [ ] Pre-order pages
- [ ] Webinar landing pages
- [ ] Waitlist pages
- [ ] Email capture for lead generation

---

## Data Model

### LandingConfig Extensions (v2)

```typescript
interface LandingConfig {
  // === NEW v2 FIELDS ===
  
  // Intent Metadata
  intent?: {
    productType: 'single' | 'multiple';
    goal: 'direct_sales' | 'lead_whatsapp';
    trafficSource: 'facebook' | 'tiktok' | 'organic';
    createdAt: string;
  };
  
  // Section Variants (Maps section ID to chosen variant)
  sectionVariants?: {
    [sectionId: string]: string; // e.g., { hero: 'product-focused', testimonials: 'carousel' }
  };
  
  // Section Visibility Rules (NEW - conditional display)
  sectionVisibility?: {
    [sectionId: string]: VisibilityRule;
  };
  
  // Quick Product (linked product ID)
  quickProductId?: string;
  
  // Connected Products (for multi-product landing)
  connectedProducts?: string[]; // Array of product IDs
  
  // Checkout Configuration (NEW)
  checkoutConfig?: CheckoutConfig;
  
  // Checkout Modal Settings
  checkoutModalEnabled?: boolean;
  checkoutExpressMode?: boolean; // Pre-fill from intent
  
  // Style Wizard
  styleWizard?: {
    brandColor?: string;
    buttonStyle?: 'rounded' | 'sharp' | 'pill';
    fontFamily?: string;
    darkMode?: boolean;
  };
  
  // Analytics
  analyticsEnabled?: boolean;
  analyticsStartDate?: string;
  
  // Multi-product (legacy - use connectedProducts instead)
  productsIds?: string[]; // For multiple products
  productSwitcherEnabled?: boolean;
  
  // A/B Testing
  abtestVariantId?: string; // Links to variant instance
  abtestOriginalId?: string; // Links to original if this is variant
  
  // ... (all existing v1 fields remain)
}
```

### Visibility Rules Interface

```typescript
/**
 * VisibilityRule - Controls when a section is displayed
 * Enables conditional showing/hiding based on device, product, or custom logic
 */
interface VisibilityRule {
  // Basic visibility
  isVisible: boolean;
  
  // Device-based rules
  showOnMobile?: boolean;      // Show only on mobile (< 768px)
  showOnDesktop?: boolean;     // Show only on desktop (>= 768px)
  
  // Content-based rules
  showIfProductHasVideo?: boolean;     // Show only if product has video
  showIfProductHasVariants?: boolean;  // Show only if product has variants
  showIfProductOnSale?: boolean;       // Show only if product has discount
  
  // Time-based rules (for urgency)
  showAfterDate?: string;      // ISO date string
  hideAfterDate?: string;      // ISO date string
  
  // Stock-based rules
  showIfInStock?: boolean;     // Show only if product is in stock
  hideIfLowStock?: boolean;    // Hide if stock < threshold
  lowStockThreshold?: number;  // Default: 5
  
  // Custom conditions (advanced)
  customCondition?: {
    field: string;             // e.g., 'product.price'
    operator: 'eq' | 'gt' | 'lt' | 'contains';
    value: any;
  };
}

// Example usage:
const sectionVisibility = {
  'video-section': {
    isVisible: true,
    showIfProductHasVideo: true,  // Only show if product has video
  },
  'urgency-section': {
    isVisible: true,
    showOnMobile: true,           // Only show on mobile
    hideAfterDate: '2026-02-01',  // Hide after this date
  },
  'variant-selector': {
    isVisible: true,
    showIfProductHasVariants: true,
  },
};
```

### Checkout Configuration Interface

```typescript
/**
 * CheckoutConfig - Full checkout customization for landing pages
 * Supports COD, online payments, and hybrid modes
 */
interface CheckoutConfig {
  // Checkout mode
  mode: 'modal' | 'redirect' | 'inline';  // Default: 'modal'
  
  // Payment methods
  paymentMethods: {
    cod: {
      enabled: boolean;         // Default: true (BD market)
      codFee?: number;          // Additional COD charge
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
      // Stripe config from store settings
    };
  };
  
  // Form fields configuration
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
  
  // Shipping configuration
  shipping: {
    insideDhaka: number;        // Default: 60 BDT
    outsideDhaka: number;       // Default: 120 BDT
    freeShippingThreshold?: number;  // Free shipping above this amount
  };
  
  // UI customization
  ui: {
    submitButtonText?: string;  // Default: 'অর্ডার করুন'
    successMessage?: string;    // Default: 'অর্ডার সফল হয়েছে!'
    showOrderSummary: boolean;  // Default: true
    showTrustBadges: boolean;   // Default: true
  };
  
  // Express checkout (pre-fill from previous orders)
  expressCheckout?: {
    enabled: boolean;
    rememberCustomer: boolean;  // Save phone for returning customers
  };
}

// Default checkout config
const defaultCheckoutConfig: CheckoutConfig = {
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
    note: { showField: true, placeholder: 'অতিরিক্ত তথ্য (ঐচ্ছিক)' },
  },
  shipping: {
    insideDhaka: 60,
    outsideDhaka: 120,
  },
  ui: {
    submitButtonText: 'অর্ডার কনফার্ম করুন',
    successMessage: 'অর্ডার সফল হয়েছে! শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।',
    showOrderSummary: true,
    showTrustBadges: true,
  },
};
```

### Intent Wizard Payload

```typescript
interface IntentWizardPayload {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
  
  // Quick Product
  productName: string;
  productPrice: number;
  productImage: File; // Uploaded image
  productVariants?: { name: string; price?: number }[];
  
  // Optional
  targetAudience?: string;
  urgencyText?: string;
}
```

### Section Variant Registry

```typescript
interface SectionVariantDef {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  thumbnail: string; // Preview image
  component: React.ComponentType<any>;
  defaultConfig: Record<string, any>;
  tags: string[]; // ['mobile-friendly', 'urgency', 'trust']
}

// Example
const SECTION_VARIANTS: SectionVariantDef[] = [
  {
    id: 'hero-product-focused',
    sectionId: 'hero',
    name: 'Product-Focused',
    description: 'Large product image with headline',
    thumbnail: '/variants/hero-product.png',
    component: HeroProductFocused,
    defaultConfig: {
      imagePosition: 'left',
      imageSize: 'large',
    },
    tags: ['product', 'mobile-friendly'],
  },
  // ... more variants
];
```

---

## API Endpoints

### Landing Builder

#### 1. Create Landing Page with Intent
```
POST /api/landing-pages
Content-Type: application/json

{
  "storeId": "store_123",
  "intent": {
    "productType": "single",
    "goal": "direct_sales",
    "trafficSource": "facebook"
  },
  "productName": "Premium Tea",
  "productPrice": 500,
  "productImage": "<base64 or file upload>",
  "templateId": "premium-bd"
}

Response:
{
  "landingPageId": "lp_abc123",
  "config": { /* auto-generated config */ },
  "suggestedSections": ["hero", "trust", "features", "testimonials", "cta"],
  "suggestedTemplate": "premium-bd",
  "checkoutUrl": "/checkout/modal"
}
```

#### 2. Get Intent-Based Recommendations
```
GET /api/landing-pages/recommendations?intent=facebook&goal=direct_sales

Response:
{
  "suggestedTemplate": "premium-bd",
  "suggestedSections": ["hero", "trust", "features", "testimonials", "cta"],
  "suggestedSectionVariants": {
    "hero": "product-focused",
    "testimonials": "carousel",
    "cta": "urgency-focused"
  }
}
```

#### 3. Generate Optimal Sections
```
POST /api/landing-pages/:id/generate-sections

{
  "intent": {
    "productType": "single",
    "goal": "direct_sales",
    "trafficSource": "facebook"
  }
}

Response:
{
  "sectionOrder": ["hero", "trust", "features", "testimonials", "cta", "faq"],
  "sectionVariants": {
    "hero": "product-focused",
    "testimonials": "carousel"
  }
}
```

#### 4. Quick Product Upload
```
POST /api/products/quick-create

{
  "storeId": "store_123",
  "name": "Premium Tea",
  "price": 500,
  "compareAtPrice": 750,
  "description": "High-quality assam tea",
  "image": <File>,
  "variants": [
    { "name": "250g", "price": 500 },
    { "name": "500g", "price": 900 }
  ]
}

Response:
{
  "productId": "prod_123",
  "variantIds": ["var_1", "var_2"]
}
```

#### 5. Update Section Variant
```
PATCH /api/landing-pages/:id/sections/:sectionId/variant

{
  "variantId": "hero-product-focused"
}

Response:
{
  "success": true,
  "section": { /* updated section config */ }
}
```

#### 6. Save Style Wizard Settings
```
PATCH /api/landing-pages/:id/style

{
  "brandColor": "#10b981",
  "buttonStyle": "rounded",
  "fontFamily": "inter",
  "darkMode": false
}

Response:
{
  "success": true,
  "appliedCSS": "/* generated CSS */"
}
```

#### 7. Open Checkout Modal
```
POST /api/landing-pages/:id/checkout/open

{
  "productId": "prod_123",
  "variantId": "var_1"
}

Response:
{
  "checkoutSessionId": "chk_xyz",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

#### 8. Get Landing Page Analytics
```
GET /api/landing-pages/:id/analytics?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "pageViews": 1250,
  "ctaClicks": 150,
  "checkoutOpened": 45,
  "ordersPlaced": 32,
  "conversionRate": 0.0256,
  "events": [
    { "timestamp": "2024-01-15T10:00:00Z", "event": "page_view" },
    { "timestamp": "2024-01-15T10:05:00Z", "event": "cta_click" },
    { "timestamp": "2024-01-15T10:07:00Z", "event": "checkout_opened" }
  ]
}
```

---

## User Flows

### Flow 1: First-Time User (Intent Wizard)

```
[New Landing Page] 
  ↓
[Intent Wizard Step 1: Product Type]
  - Single Product / Multiple Products
  ↓
[Intent Wizard Step 2: Goal]
  - Direct Sales / Lead Generation (WhatsApp)
  ↓
[Intent Wizard Step 3: Traffic Source]
  - Facebook / TikTok / Organic
  ↓
[Quick Product Upload]
  - Product name, price, image, variants
  ↓
[Auto-Generate Layout]
  - System suggests: template, sections, variants
  ↓
[Template Selection]
  - Show 3 templates matching intent
  ↓
[Landing Page Created] ✅
  - Editable, can customize sections
  ↓
[Edit Mode]
  - Click section to customize
  - Change section variant
  - Reorder sections
  - Set colors/fonts
  ↓
[Publish & Share] ✅
```

### Flow 2: Existing User (Quick Reuse)

```
[Dashboard] 
  ↓
[Quick Builder Button] 
  ↓
[Use Template] 
  - Pick from last 3 landing pages OR
  - Start from template
  ↓
[Quick Product Swap]
  - Change product (auto-update prices, images)
  ↓
[Publish] ✅
```

### Flow 3: Merchant Customization

```
[Edit Landing Page]
  ↓
[Click Section]
  ↓
[Edit Inline]
  - Add/edit content
  - Change variant (if available)
  ↓
[Save Section]
  ↓
[Change Colors]
  - Open Style Wizard
  - Pick brand color
  - Change button style
  ↓
[Preview on Mobile]
  ↓
[Publish] ✅
```

### Flow 4: Customer Checkout

```
[View Landing Page]
  ↓
[Read Content]
  ↓
[Click CTA Button]
  ↓
[Checkout Modal Opens] (No page redirect!)
  ↓
[Enter Details]
  - Name, Phone, Address
  - Select variant (if applicable)
  ↓
[Place Order] ✅
  ↓
[Success Message]
  - Order number, delivery info
  - Return to landing page
```

---

## Success Metrics

### Primary KPIs
- **Time to publish:** < 3 minutes (from intent wizard → live page)
- **Conversion rate:** > 2.5% (vs. v1: 1.8%)
- **Mobile conversion:** > 3% (mobile-first designs)
- **Bounce rate:** < 40% (optimization by traffic source)

### Secondary Metrics
- **Merchant satisfaction:** > 4.5/5 rating
- **Feature adoption:** > 60% use intent wizard
- **Template usage:** Top 3 templates account for > 50% of pages
- **Variant preference:** > 40% customize section variants

### Technical Metrics
- **Page load time:** < 2 seconds (P75)
- **API response time:** < 500ms (P95)
- **Uptime:** 99.9%
- **Error rate:** < 0.1%

---

## Dependencies & Tech Stack

### Frontend
- **React 18** (Remix framework)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)
- **Framer Motion** (animations)
- **React Hook Form** (forms)
- **Zod** (validation)

### Backend
- **Hono** (API)
- **Cloudflare D1** (database)
- **Zod** (validation)

### AI/ML (Optional)
- **OpenRouter API** (content generation)
- **Claude** (for smart suggestions)

### Performance
- **Image optimization:** Cloudflare R2 + WebP conversion
- **Caching:** CloudFlare KV (cache templates, recommendations)
- **CDN:** Cloudflare Pages

---

## File Structure

```
app/
├── components/
│   ├── landing-builder/
│   │   ├── SectionManager.tsx ✅ (existing)
│   │   ├── LandingTemplateGallery.tsx ✅ (existing)
│   │   ├── IntentWizard.tsx (NEW)
│   │   ├── SectionVariantSelector.tsx (NEW)
│   │   ├── StyleWizard.tsx (NEW)
│   │   ├── CheckoutModal.tsx (NEW)
│   │   ├── QuickProductForm.tsx (NEW)
│   │   └── variants/
│   │       ├── HeroProductFocused.tsx (NEW)
│   │       ├── HeroOfferFocused.tsx (NEW)
│   │       ├── TestimonialsCarousel.tsx (NEW)
│   │       └── ... (more variants)
│   └── ...
├── routes/
│   ├── app.quick-builder.new.tsx (NEW - Intent Wizard)
│   ├── app.quick-builder.$id.tsx (NEW - Edit Landing)
│   ├── app.quick-builder.$id.preview.tsx (NEW - Preview)
│   └── ...
└── utils/
    ├── landing-builder/
    │   ├── intentEngine.ts (NEW)
    │   ├── variantRegistry.ts (NEW)
    │   ├── autoGenerator.ts (NEW)
    │   └── analytics.ts (NEW)
    └── ...
```

---

## Glossary

- **Intent:** User's goal (What they're selling, who they're selling to)
- **Section:** Building block (Hero, Features, CTA, etc.)
- **Variant:** Alternative style for a section
- **Template:** Pre-designed layout with color scheme
- **Quick Product:** Product created inline during landing page builder
- **Checkout Modal:** Overlay form instead of page redirect
- **Style Wizard:** Quick customization flow for colors/fonts

---

## Next Steps

1. ✅ Review & approve specification
2. 📋 Break down into implementation tasks
3. 🎨 Design Intent Wizard UI mockups
4. 💻 Begin Phase 1 development (Intent-Based Quick Builder)
5. 🧪 A/B test new vs. old flow
6. 📊 Measure adoption & conversion metrics

