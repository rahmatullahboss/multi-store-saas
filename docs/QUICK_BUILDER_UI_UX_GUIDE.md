# Quick Builder v2 — UI/UX Design Guide

Jai, eta Quick Builder v2 er jonno comprehensive UI/UX design guide. Ekhane amar sab design principles, component specifications, aar color/typography guidelines ache.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Intent Wizard UI](#intent-wizard-ui)
3. [Section Variant Selector](#section-variant-selector)
4. [Checkout Modal UI](#checkout-modal-ui)
5. [Style Wizard UI](#style-wizard-ui)
6. [Component Library](#component-library)
7. [Color Palette](#color-palette)
8. [Typography](#typography)
9. [Spacing & Layout](#spacing--layout)
10. [Animations & Transitions](#animations--transitions)
11. [Accessibility Guidelines](#accessibility-guidelines)
12. [Figma Reference](#figma-reference)

---

## Design Principles

Quick Builder v2 er design kore mobile-first, conversion-focused, aar accessibility-first approach follow kore.

### 1. Mobile-First Design Approach

- Sab design mobile screen (320px - 479px) theke start kore
- Desktop features progressively add hoy larger screens e
- Touch targets minimum 44x44px (WCAG standard)
- One-thumb scrolling supported
- Tap-friendly buttons aar form inputs

**Responsive Breakpoints:**

| Breakpoint | Width | Device |
|-----------|-------|--------|
| `xs` | 320px | Mobile (small) |
| `sm` | 640px | Mobile (large) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop (large) |

**Mobile-First Rules:**
- Default: Stack vertically
- At `md` (768px+): Side-by-side layouts allowed
- All CTAs must fit within thumb zone (bottom 200px on mobile)
- Image aspect ratios: maintain 16:9 or 4:3

### 2. Conversion-Focused Layouts

Amar primary goal: maximize conversion rate.

**Key Principles:**
- **F-pattern for scanning:** Hero + CTA + Social Proof + Checkout (top to bottom)
- **Minimalist design:** Only essential elements visible
- **Clear hierarchy:** CTA buttons 40-50% larger than secondary buttons
- **Urgency signals:** Countdown timers, stock counters, limited-time badges
- **Trust elements:** Testimonials, reviews, security badges
- **Zero friction:** Minimal form fields, auto-fill where possible

**Above-the-fold Requirements:**
- Product image/video (60% of viewport)
- Headline (max 10 words)
- Primary CTA button
- Social proof (1-2 reviews or testimonial)

### 3. Accessibility (WCAG 2.1 AA)

Sab component WCAG 2.1 AA level support kore.

**Color Contrast:**
- Text: minimum 4.5:1 (normal text), 3:1 (large text)
- UI components: minimum 3:1
- Dark mode: same ratio maintained

**Keyboard Navigation:**
- Tab order logical aar visible
- Focus indicators (minimum 2px outline or background change)
- Skip to main content link
- All interactive elements keyboard accessible

**Screen Reader Support:**
- ARIA labels for all buttons
- Semantic HTML (nav, main, section, article)
- Alt text for all images
- Form labels associated with inputs
- Live regions for dynamic updates

**Focus Management:**
```css
/* Tailwind focus classes */
focus:outline-2
focus:outline-offset-2
focus:outline-blue-500
```

### 4. Consistency Across Templates

Sab templates er look and feel consistent hote hobe.

**Unified Element System:**
- Single button component for all CTAs
- Standardized card layouts
- Consistent spacing between sections
- Shared color palette
- Unified typography scale

### 5. Speed & Performance Impact on UX

Performance direct affect kore user experience.

**Performance Targets:**
| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Total Page Size | < 500KB |

**UX Implications:**
- Skeleton loaders for delayed content
- Progressive image loading (LQIP)
- Optimized font loading (system fonts first)
- Lazy-loaded sections below fold
- WebP images with fallbacks

---

## Intent Wizard UI Specifications

Intent Wizard ta step-by-step flow, jeta user k product type, goal, aar traffic source select korte help kore.

### Overview

Wizard er 3 main steps ache:
1. **Product Type Selection** — Single vs Multiple products
2. **Goal Selection** — Direct sales vs Lead generation
3. **Traffic Source Selection** — Facebook, TikTok, Organic

**Navigation Flow:**

```
┌─────────────────────────────────────────┐
│      Step 1: Product Type               │
│  ┌──────────────┐  ┌──────────────┐     │
│  │   SINGLE     │  │   MULTIPLE   │     │
│  │   PRODUCT    │  │   PRODUCTS   │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  [Previous]                   [Next]    │
└─────────────────────────────────────────┘
         ↓ (Click Next)
┌─────────────────────────────────────────┐
│      Step 2: What's Your Goal?          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │   DIRECT     │  │     LEAD     │     │
│  │   SALES      │  │   GENERATION │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  [Previous]                   [Next]    │
└─────────────────────────────────────────┘
         ↓ (Click Next)
┌─────────────────────────────────────────┐
│   Step 3: Where's Your Traffic From?    │
│  ┌──────────┐  ┌──────────┐  ┌────┐    │
│  │ FACEBOOK │  │  TIKTOK  │  │ORG│    │
│  └──────────┘  └──────────┘  └────┘    │
│                                         │
│  [Previous]                   [Finish]  │
└─────────────────────────────────────────┘
```

### Step 1: Product Type Selection

User select kore ekta or multiple products sell korbe kina.

**Card Design:**

```
┌─────────────────────────┐
│  📦 SINGLE PRODUCT      │
│                         │
│  Sell one main product  │
│  with variants (colors, │
│  sizes, etc.)           │
│                         │
│  Best for:              │
│  • Dropshipping         │
│  • Trending products    │
│  • First-time sellers   │
└─────────────────────────┘
```

**Desktop Layout:** Side-by-side cards, each 45% width
**Mobile Layout:** Stacked vertically, 100% width

**Component Structure:**

```tsx
<CardButton 
  icon={<Package />}
  title="Single Product"
  description="Sell one main product with variants..."
  selected={selected === 'single'}
  onClick={() => setSelected('single')}
/>
```

**Styling (Tailwind):**

```tailwind
/* Default state */
border-2 border-gray-200
bg-white
cursor-pointer
transition-all duration-200

/* Hover state */
border-blue-500
bg-blue-50
shadow-lg

/* Selected state */
border-2 border-blue-600
bg-blue-50
ring-2 ring-blue-300
```

**Icons to Use (Lucide React):**
- Single Product: `<Package size={32} />`
- Multiple Products: `<Boxes size={32} />`

### Step 2: Goal Selection

User select kore target goal — direct sales naki lead generation.

**Goal Cards:**

| Goal | Icon | Description | Best For |
|------|------|-------------|----------|
| Direct Sales | `<ShoppingCart />` | Sell products & collect payment immediately | E-commerce, dropshipping |
| Lead Generation | `<MessageSquare />` (+ WhatsApp) | Collect emails/WhatsApp numbers | Lead funnels, consultancy |

**Component:**

```tsx
<CardButton 
  icon={<ShoppingCart />}
  title="Direct Sales"
  description="Accept orders & payments on your landing page"
  selected={selected === 'direct_sales'}
  onClick={() => setSelected('direct_sales')}
/>

<CardButton 
  icon={<MessageCircle />}
  badge="WhatsApp"
  title="Lead Generation"
  description="Collect customer info & follow up via WhatsApp"
  selected={selected === 'lead_whatsapp'}
  onClick={() => setSelected('lead_whatsapp')}
/>
```

**Lead Gen Badge:**
- Position: top-right corner
- Color: green (#22c55e)
- Icon: WhatsApp logo
- Text: "WhatsApp"

### Step 3: Traffic Source Selection

User select kore traffic source — platform-specific optimization apply hobe.

**Traffic Source Options:**

| Source | Icon | Platform Logo | Optimization |
|--------|------|---------------|--------------|
| Facebook | `<Facebook />` | FB Logo | Ad-copy focused, urgency |
| TikTok | `<Music />` or custom | TikTok Logo | Trendy, social proof |
| Organic | `<Globe />` | Google/Magnifying glass | SEO-friendly, detailed |

**Grid Layout:**

```
Desktop (3 columns):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FACEBOOK   │  │    TIKTOK    │  │   ORGANIC    │
└──────────────┘  └──────────────┘  └──────────────┘

Mobile (1 column, horizontal scroll):
┌──────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │   FACEBOOK   │  │    TIKTOK    │  │ ORGANIC│ │
│  └──────────────┘  └──────────────┘  └────────┘ │
│  ← scroll right →                                 │
└──────────────────────────────────────────────────┘
```

**Component:**

```tsx
<CardButton 
  icon={<Facebook size={32} />}
  title="Facebook"
  description="Optimize for Facebook & Instagram ads"
  selected={selected === 'facebook'}
  onClick={() => setSelected('facebook')}
/>
```

### Progress Indicator Design

Step indicator show kore user ta kota step e ache.

**Stepper Component:**

```
Desktop:
1 ──●── 2 ──●── 3
  Product    Goal   Traffic
  Type             Source

Mobile (vertical):
●  Product Type
   ↓
○  Goal Selection
   ↓
○  Traffic Source
```

**Styling:**

```tailwind
/* Active step */
bg-blue-600 text-white ring-2 ring-blue-300

/* Completed step */
bg-green-600 text-white

/* Inactive step */
bg-gray-300 text-gray-600

/* Connector line */
border-t-2 border-blue-600 (if completed)
border-t-2 border-gray-300 (if not completed)
```

### Navigation Buttons

**Button Group at Bottom:**

```
┌─────────────────────────────────────────┐
│                                         │
│  [Previous Button]   [Next/Finish Button]
│                                         │
└─────────────────────────────────────────┘
```

**Button Specifications:**

| Button | Style | State |
|--------|-------|-------|
| Previous | Secondary (ghost) | Disabled on Step 1 |
| Next | Primary (filled) | Enabled if selection made |
| Finish | Primary (filled, green) | Step 3 only |

**Tailwind Classes:**

```tailwind
/* Primary Button */
bg-blue-600 hover:bg-blue-700 text-white
px-6 py-3 rounded-lg font-semibold
transition-colors duration-200
disabled:bg-gray-400 disabled:cursor-not-allowed

/* Secondary Button */
bg-white border-2 border-gray-300 text-gray-700
px-6 py-3 rounded-lg font-semibold
hover:bg-gray-50 hover:border-gray-400
transition-all duration-200
```

### Mobile Responsive Behavior

**Mobile Adjustments:**

1. **Card sizing:** Full width with 16px padding on each side
2. **Font sizes:** Slightly larger for readability on small screens
   - Title: 18px (mobile) → 20px (desktop)
   - Description: 14px (mobile) → 16px (desktop)
3. **Spacing:** Increased vertical spacing for touch comfort
   - Card padding: 20px (mobile) → 24px (desktop)
   - Card margin-bottom: 16px (mobile) → 20px (desktop)
4. **Icons:** Larger on mobile (32px → 36px)
5. **Step indicator:** Vertical stacking instead of horizontal

**Mobile CSS:**

```css
@media (max-width: 640px) {
  .wizard-card {
    width: 100%;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .wizard-card-title {
    font-size: 18px;
    line-height: 1.4;
  }
  
  .wizard-card-description {
    font-size: 14px;
    line-height: 1.5;
  }
  
  .step-indicator {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
```

### Animation & Transitions

**Card Hover Animation:**

```tsx
// Using Framer Motion
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  {/* Card content */}
</motion.div>
```

**Step Transition:**

```tsx
// Fade in/slide up on step change
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Step content */}
</motion.div>
```

---

## Section Variant Selector UI

Section Variant Selector UI te user a section er different styles choose korte pare.

### Overview

Variants ta thumbnail cards e show hoy, jeta user click korte pare switch korte.

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  Select a Hero Variant                           │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Variant 1  │  │  Variant 2  │  │Variant 3 │ │
│  │ (Product    │  │   (Offer    │  │(Text)    │ │
│  │  Focused)   │  │  Focused)   │  │          │ │
│  │ ✓ Selected  │  │             │  │          │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
│                                                  │
│  Mobile: Horizontal scroll carousel              │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Thumbnail Preview Cards

**Card Dimensions:**
- Desktop: 200px wide × 150px tall
- Mobile: 160px wide × 120px tall
- Border radius: 8px
- Background: Light gray (#f3f4f6)

**Component:**

```tsx
<div className="grid grid-cols-3 gap-4 md:gap-6">
  {variants.map(variant => (
    <VariantCard
      key={variant.id}
      variant={variant}
      isSelected={selectedVariant === variant.id}
      onClick={() => setSelectedVariant(variant.id)}
    />
  ))}
</div>
```

### States

| State | Border | Background | Shadow | Icon |
|-------|--------|------------|--------|------|
| Default | 2px gray-300 | white | none | - |
| Hover | 2px blue-400 | blue-50 | md | - |
| Selected | 2px blue-600 | blue-50 | lg | ✓ |

**Tailwind Classes:**

```tailwind
/* Default */
border-2 border-gray-300 bg-white cursor-pointer

/* Hover */
border-2 border-blue-400 bg-blue-50 shadow-md

/* Selected */
border-2 border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200
```

### Select Button (Hover State)

On hover, "Select" button display hoy card er center e.

**Button:**
- Text: "Select"
- Background: blue with opacity 0.9
- Padding: 8px 16px
- Border radius: 6px
- Font: bold, white

**Animation:**

```tsx
<motion.button
  initial={{ opacity: 0 }}
  whileHover={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
  className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-90"
>
  Select
</motion.button>
```

### Selected State with Checkmark

Selected variant e green checkmark show hoy top-right corner e.

**Checkmark:**
- Icon: `<Check size={20} />` from lucide-react
- Background: green (#22c55e) circle
- Position: top-right, 8px from edge
- Size: 28px × 28px

**Component:**

```tsx
{isSelected && (
  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
    <Check size={20} className="text-white" />
  </div>
)}
```

### Variant Name & Description

Card e bottom e variant name aar description show hoy.

**Layout:**

```
┌─────────────────────┐
│                     │
│   [Thumbnail img]   │
│                     │
├─────────────────────┤
│ Product-Focused     │  ← name (14px, bold)
│ Large image left    │  ← desc (12px, gray)
└─────────────────────┘
```

**Typography:**
- Name: 14px, bold (font-semibold), gray-900
- Description: 12px, regular, gray-600

### Mobile: Horizontal Scroll Carousel

Mobile e variants ta horizontal scroll hoy, fixed height container e.

**Container:**

```tsx
<div className="overflow-x-auto pb-4 scrollbar-hide">
  <div className="flex gap-3 w-max">
    {variants.map(variant => (
      <VariantCard key={variant.id} variant={variant} />
    ))}
  </div>
</div>
```

**CSS:**

```css
/* Hide scrollbar but allow scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## Checkout Modal UI

Checkout modal ta embedded form jeta product page e overlay hoy.

### Desktop Modal Design

**Layout:**

```
┌────────────────────────────────────────────┐
│ X                                          │
├────────────────────────────────────────────┤
│                                            │
│   Order Confirmation                       │
│                                            │
│   Product Image  [Qty] [Price]            │
│   ─────────────────────────────────────   │
│   Subtotal                      500 BDT   │
│   Shipping                       60 BDT   │
│   ─────────────────────────────────────   │
│   Total                         560 BDT   │
│                                            │
│   ─────────────────────────────────────   │
│                                            │
│   Full Name                                │
│   [_____________________________]          │
│                                            │
│   Phone Number                             │
│   [_____________________________]          │
│                                            │
│   Address                                  │
│   [_____________________________]          │
│                                            │
│   Delivery Area                            │
│   [Select ↓              ]                │
│                                            │
│   Payment Method                           │
│   ● Cash on Delivery (COD)                │
│                                            │
│   [  অর্ডার করুন  ]                       │
│                                            │
└────────────────────────────────────────────┘
```

**Modal Specifications:**
- Width: 500px (max-width: 90vw on mobile)
- Background: white
- Border radius: 12px
- Shadow: shadow-xl (Tailwind)
- Position: centered, fixed overlay

**Tailwind Classes:**

```tailwind
/* Modal container */
fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50

/* Modal panel */
bg-white rounded-lg shadow-xl max-w-md w-full mx-4
```

### Mobile: Full-Screen Bottom Sheet

Mobile e checkout modal bottom sheet e open hoy, full-width.

**Behavior:**
- Slides up from bottom
- Draggable handle at top
- Can swipe down to close
- Covers 90% of viewport height

**Animation:**

```tsx
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50"
>
  {/* Content */}
</motion.div>
```

**Drag Handle:**

```tsx
<div className="flex justify-center pt-2 pb-4">
  <div className="w-12 h-1 bg-gray-300 rounded-full" />
</div>
```

### Form Field Styling

**Input Fields:**

```tailwind
/* Base input */
w-full px-4 py-3 border-2 border-gray-200 rounded-lg
focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
transition-all duration-200

/* Label */
block text-sm font-semibold text-gray-700 mb-2
```

**Select Dropdown:**

```tsx
<select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white">
  <option>ঢাকার ভিতরে (60 BDT)</option>
  <option>ঢাকার বাইরে (120 BDT)</option>
</select>
```

### Order Summary Section

Order summary show kore product details, quantity, price.

**Layout:**

```
┌─────────────────────────────┐
│ Product Image               │
│ ┌───────────────────────┐   │
│ │                       │   │
│ │    [Image Here]       │   │
│ │                       │   │
│ └───────────────────────┘   │
│                             │
│ Product Name                │
│ Size: Large | Color: Blue   │
│ Qty: 2 | Price: 500 BDT     │
│                             │
│ ─────────────────────────── │
│ Subtotal      500 BDT       │
│ Shipping       60 BDT       │
│ ─────────────────────────── │
│ Total         560 BDT       │
└─────────────────────────────┘
```

**Components:**

```tsx
<div className="bg-gray-50 p-4 rounded-lg mb-4">
  <div className="flex gap-3 mb-3">
    <img src={product.image} className="w-16 h-16 rounded object-cover" />
    <div>
      <h4 className="font-semibold">{product.name}</h4>
      <p className="text-sm text-gray-600">Qty: {quantity}</p>
    </div>
  </div>
  
  <div className="border-t pt-3 space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span className="font-semibold">{subtotal} BDT</span>
    </div>
    <div className="flex justify-between">
      <span>Shipping</span>
      <span className="font-semibold">{shipping} BDT</span>
    </div>
    <div className="border-t pt-2 flex justify-between font-bold">
      <span>Total</span>
      <span className="text-blue-600">{total} BDT</span>
    </div>
  </div>
</div>
```

### Trust Badges Placement

Trust badges show hoy form er niche, checkout er age.

**Badges:**
- Secure payment icon (lock icon)
- 100% Money back guarantee
- Free returns
- 24/7 customer support

**Layout:**

```
┌───────────────────────────────┐
│ 🔒 Secure Payment             │
│ 💰 Money Back Guarantee       │
│ 🚚 Free Returns               │
│ 💬 24/7 Support               │
└───────────────────────────────┘
```

**Component:**

```tsx
<div className="grid grid-cols-2 gap-2 my-4 text-xs text-center">
  <div className="flex items-center justify-center gap-1">
    <Lock size={16} />
    <span>Secure Payment</span>
  </div>
  <div className="flex items-center justify-center gap-1">
    <CheckCircle size={16} />
    <span>Money Back</span>
  </div>
  <div className="flex items-center justify-center gap-1">
    <Truck size={16} />
    <span>Free Returns</span>
  </div>
  <div className="flex items-center justify-center gap-1">
    <MessageCircle size={16} />
    <span>24/7 Support</span>
  </div>
</div>
```

### Loading States

Jokhn order submit hoy, loading state show hoy.

**Loading Button:**

```tsx
<button disabled className="w-full bg-blue-600 text-white py-3 rounded-lg">
  <div className="flex items-center justify-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    Processing...
  </div>
</button>
```

**Form Disabled:**
- All input fields disabled (opacity-50, pointer-events-none)
- Close button disabled

### Success/Error States

**Success State:**

```
┌──────────────────────────────┐
│                              │
│         ✓ Success!           │
│                              │
│  Your order has been placed  │
│  Order ID: #123456           │
│                              │
│  We'll contact you soon on   │
│  +88 017XX-XXXXXX            │
│                              │
│  [Close Modal]               │
│                              │
└──────────────────────────────┘
```

**Error State:**

```
┌──────────────────────────────┐
│                              │
│    ⚠ Error                   │
│                              │
│  Please fill all required    │
│  fields correctly.           │
│                              │
│  [Try Again]                 │
│                              │
└──────────────────────────────┘
```

**Component:**

```tsx
{status === 'success' && (
  <div className="text-center py-8">
    <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
    <h3 className="font-bold text-lg">Success!</h3>
    <p className="text-gray-600 mt-2">Your order has been placed</p>
  </div>
)}

{status === 'error' && (
  <div className="text-center py-8 bg-red-50 rounded-lg">
    <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
    <h3 className="font-bold text-lg">Error</h3>
    <p className="text-gray-600 mt-2">{errorMessage}</p>
  </div>
)}
```

---

## Style Wizard UI

Style Wizard ta quick customization flow jeta color, button style, aar font select kore.

### Overview

Style Wizard 4 steps e divided:
1. Brand Color Selection
2. Button Style Preference
3. Font Family Choice
4. Dark Mode Toggle

**Layout:**

```
┌──────────────────────────────┐
│   Customize Your Design       │
├──────────────────────────────┤
│                              │
│   Brand Colors               │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │
│   │◯ │ │◯ │ │◯ │ │◯ │ │+ │ │
│   │  │ │  │ │  │ │  │ │CM│ │
│   └──┘ └──┘ └──┘ └──┘ └──┘ │
│                              │
│   Button Style               │
│   ○ Rounded  ○ Sharp  ○ Pill │
│                              │
│   Font Family                │
│   [System ↓]                 │
│                              │
│   Dark Mode                  │
│   [Toggle]                   │
│                              │
└──────────────────────────────┘
```

### Color Picker with Presets

**Preset Colors (6 colors):**

```
Blue     #3b82f6
Green    #10b981
Red      #ef4444
Purple   #8b5cf6
Orange   #f97316
Pink     #ec4899
```

**Plus (+) Button for Custom Color:**

```tsx
<div className="flex gap-3 flex-wrap">
  {PRESET_COLORS.map(color => (
    <button
      key={color}
      className={`w-12 h-12 rounded-full border-2 transition-all ${
        selectedColor === color
          ? 'border-gray-900 ring-2 ring-offset-2'
          : 'border-gray-300'
      }`}
      style={{ backgroundColor: color }}
      onClick={() => setSelectedColor(color)}
    />
  ))}
  
  <button className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-gray-400">
    +
  </button>
</div>
```

**Custom Color Modal:**

On '+' click, color picker modal show hoy.

```tsx
<input 
  type="color" 
  value={customColor} 
  onChange={e => setCustomColor(e.target.value)}
  className="w-full h-12 cursor-pointer rounded-lg border-2 border-gray-300"
/>
```

### Button Style Preview

Button style e 3 options: rounded, sharp, pill.

**Visual Preview:**

```
Rounded         Sharp           Pill
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Submit │    │ Submit  │    │ Submit  │
└─────────┘    └─────────┘    └─────────┘
  border-lg      border-none    border-full
```

**Component:**

```tsx
<div className="space-y-3">
  {[
    { value: 'rounded', label: 'Rounded', class: 'rounded-lg' },
    { value: 'sharp', label: 'Sharp', class: 'rounded-none' },
    { value: 'pill', label: 'Pill', class: 'rounded-full' }
  ].map(style => (
    <button
      key={style.value}
      onClick={() => setButtonStyle(style.value)}
      className={`w-full px-4 py-2 border-2 font-semibold transition-all ${
        selectedStyle === style.value
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300'
      }`}
      style={{
        borderRadius: style.value === 'pill' ? '999px' : style.value === 'rounded' ? '8px' : '0'
      }}
    >
      {style.label}
    </button>
  ))}
</div>
```

### Font Family Dropdown with Preview

Font family dropdown show kore system fonts, serif, sans-serif options.

**Fonts:**
- System (default)
- Serif (Georgia, serif)
- Sans-serif (Arial, sans-serif)
- Monospace (Courier New, monospace)

**Component with Preview:**

```tsx
<div className="space-y-3">
  <select 
    value={fontFamily}
    onChange={e => setFontFamily(e.target.value)}
    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
  >
    <option value="system">System (Default)</option>
    <option value="serif">Serif</option>
    <option value="sans-serif">Sans-serif</option>
    <option value="monospace">Monospace</option>
  </select>
  
  <div 
    style={{ fontFamily }}
    className="p-4 bg-gray-50 rounded-lg text-sm"
  >
    This is a preview of your selected font family.
  </div>
</div>
```

### Dark Mode Toggle

Dark mode toggle te checkbox or switch use hoy.

**Switch Component:**

```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
  <span>Dark Mode</span>
  <button
    onClick={() => setDarkMode(!darkMode)}
    className={`relative w-14 h-8 rounded-full transition-colors ${
      darkMode ? 'bg-blue-600' : 'bg-gray-300'
    }`}
  >
    <div
      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
        darkMode ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </button>
</div>
```

### Real-Time Preview Updates

Style wizard change hole immediately preview update hoy.

**Preview Component:**

```tsx
<div className={`p-6 rounded-lg border-2 ${
  darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
}`}>
  <div style={{ fontFamily }}>
    <h2 className="text-2xl font-bold mb-3">Preview</h2>
    
    <button
      style={{ backgroundColor: selectedColor }}
      className={`text-white font-semibold px-6 py-3 ${
        buttonStyle === 'pill' ? 'rounded-full' : 
        buttonStyle === 'sharp' ? 'rounded-none' : 
        'rounded-lg'
      }`}
    >
      Order Now
    </button>
  </div>
</div>
```

---

## Component Library

Quick Builder v2 er core component library jeta consistent design ensure kore.

### Button Variants

**Primary Button** (Main CTA):
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
  Order Now
</button>
```

**Secondary Button** (Alternative action):
```tsx
<button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-gray-300">
  Learn More
</button>
```

**Ghost Button** (Minimal):
```tsx
<button className="bg-transparent text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
  Skip
</button>
```

### Form Inputs

**Text Input:**
```tsx
<input 
  type="text"
  placeholder="Full Name"
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
/>
```

**Select Dropdown:**
```tsx
<select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500">
  <option>Select Option</option>
</select>
```

**Textarea:**
```tsx
<textarea 
  placeholder="Message"
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
/>
```

### Card Components

**Section Card:**
```tsx
<div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200">
  <h3 className="text-xl md:text-2xl font-bold mb-3">Section Title</h3>
  <p className="text-gray-600">Section content goes here</p>
</div>
```

**Variant Card:**
```tsx
<div className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all">
  <img src="/variant.png" className="w-full h-40 object-cover" />
  <div className="p-3">
    <h4 className="font-semibold text-sm">Variant Name</h4>
    <p className="text-xs text-gray-600">Description</p>
  </div>
</div>
```

**Product Card:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <img src="/product.png" className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="font-semibold mb-2">Product Name</h3>
    <p className="text-sm text-gray-600 mb-3">Description</p>
    <div className="flex justify-between items-center">
      <span className="font-bold text-blue-600">500 BDT</span>
      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add</button>
    </div>
  </div>
</div>
```

### Badge Components

**Trust Badge:**
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
  <CheckCircle size={14} />
  100% Secure
</div>
```

**Discount Badge:**
```tsx
<div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
  -20%
</div>
```

**Stock Badge:**
```tsx
<div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
  Only 3 left
</div>
```

### Icons (Lucide React)

**Common Icons:**
- `<Package />` - Product
- `<ShoppingCart />` - Cart
- `<Heart />` - Favorite
- `<Star />` - Rating
- `<CheckCircle />` - Success
- `<AlertCircle />` - Warning
- `<Lock />` - Security
- `<Truck />` - Shipping
- `<MessageCircle />` - Chat
- `<Phone />` - Contact

### Loading Spinners

**Spinner:**
```tsx
<div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
```

**Pulse:**
```tsx
<div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />
```

**Skeleton Loader:**
```tsx
<div className="bg-gray-200 rounded-lg animate-pulse h-40 w-full" />
```

### Toast Notifications

**Toast Component:**
```tsx
<div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
  <CheckCircle size={20} />
  <span>Order placed successfully!</span>
</div>
```

---

## Color Palette

Quick Builder v2 er color system mobile-first aar accessible.

### Primary Colors (Brand Customizable)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #3b82f6 | Buttons, links, highlights |
| Primary Hover | #2563eb | Hover state |
| Primary Dark | #1d4ed8 | Active state |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Secondary | #10b981 | Success, positive actions |
| Warning | #f59e0b | Caution, alerts |
| Error | #ef4444 | Errors, destructive actions |
| Info | #3b82f6 | Information, neutral |

### Neutral Grays

| Color | Hex | Usage |
|-------|-----|-------|
| Gray-50 | #f9fafb | Backgrounds, very light |
| Gray-100 | #f3f4f6 | Subtle background |
| Gray-200 | #e5e7eb | Borders, dividers |
| Gray-300 | #d1d5db | Secondary borders |
| Gray-400 | #9ca3af | Disabled text |
| Gray-500 | #6b7280 | Secondary text |
| Gray-600 | #4b5563 | Body text |
| Gray-700 | #374151 | Primary text |
| Gray-800 | #1f2937 | Headings |
| Gray-900 | #111827 | Dark text |

### Dark Mode Palette

| Component | Light | Dark |
|-----------|-------|------|
| Background | white (#fff) | gray-900 (#111827) |
| Text | gray-900 (#111827) | white (#fff) |
| Border | gray-200 (#e5e7eb) | gray-700 (#374151) |
| Card | white (#fff) | gray-800 (#1f2937) |

---

## Typography

Quick Builder v2 er typography system clear, readable, aar mobile-optimized.

### Font Families

**System Font Stack (default):**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

**Serif Option:**
```css
font-family: 'Georgia', 'Garamond', serif;
```

**Bangla Font Support:**
```css
/* Hind Siliguri - for Bangla text */
font-family: 'Hind Siliguri', sans-serif;

/* Noto Sans Bengali - alternative */
font-family: 'Noto Sans Bengali', sans-serif;
```

### Heading Sizes

| Level | Mobile | Desktop | Font Weight | Line Height |
|-------|--------|---------|-------------|-------------|
| H1 | 28px | 36px | 700 (bold) | 1.2 |
| H2 | 24px | 32px | 700 (bold) | 1.2 |
| H3 | 20px | 28px | 600 (semibold) | 1.3 |
| H4 | 18px | 24px | 600 (semibold) | 1.3 |
| H5 | 16px | 20px | 600 (semibold) | 1.4 |
| H6 | 14px | 18px | 600 (semibold) | 1.5 |

### Body Text Sizes

| Type | Mobile | Desktop | Font Weight | Line Height |
|------|--------|---------|-------------|-------------|
| Large | 16px | 18px | 400 (regular) | 1.6 |
| Base | 14px | 16px | 400 (regular) | 1.6 |
| Small | 12px | 14px | 400 (regular) | 1.5 |
| Tiny | 11px | 12px | 400 (regular) | 1.4 |

### Tailwind Font Classes

```tailwind
/* Headings */
text-2xl md:text-3xl font-bold

/* Body text */
text-base md:text-lg text-gray-600

/* Small text */
text-sm text-gray-500

/* Emphasis */
font-semibold
font-bold
```

---

## Spacing & Layout

Quick Builder v2 uses 8px-based spacing system.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal gaps |
| sm | 8px | Small spacing |
| md | 16px | Default spacing |
| lg | 24px | Section padding |
| xl | 32px | Large sections |
| 2xl | 48px | Hero sections |
| 3xl | 64px | Page sections |

### Grid System

**12-Column Grid:**
```css
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 16px; /* md */
```

### Container Max-Widths

| Breakpoint | Width | Tailwind |
|-----------|-------|----------|
| xs | 100% | w-full |
| sm | 640px | max-w-sm |
| md | 768px | max-w-md |
| lg | 1024px | max-w-lg |
| xl | 1280px | max-w-xl |

### Section Padding

```tailwind
/* Mobile */
px-4 py-8 (16px horizontal, 32px vertical)

/* Desktop */
md:px-8 md:py-16 (32px horizontal, 64px vertical)
```

### Mobile Breakpoints

```css
xs    320px   (very small phone)
sm    640px   (phone)
md    768px   (tablet)
lg    1024px  (desktop)
xl    1280px  (desktop large)
```

**Tailwind Breakpoint Usage:**
```tailwind
/* Default mobile */
grid-cols-1

/* Tablet and up */
md:grid-cols-2

/* Desktop and up */
lg:grid-cols-3
```

---

## Animations & Transitions

Animations ta smooth, purposeful, aar performance-optimized.

### Page Transitions

**Fade + Slide:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {/* Content */}
</motion.div>
```

### Modal Animations

**Fade + Scale:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 bg-black bg-opacity-50"
>
  {/* Modal */}
</motion.div>
```

### Button Hover Effects

**Scale + Shadow:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
>
  Order Now
</motion.button>
```

### Loading Animations

**Spin:**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Skeleton Loaders

**Shimmer Effect:**
```tsx
<div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-200 animate-shimmer h-20 rounded" />
```

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: calc(200% + 20px) 0; }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background-size: 200%;
}
```

### Transition Defaults

```tailwind
/* All transitions */
transition-all duration-200

/* Color transitions */
transition-colors duration-300

/* Specific properties */
transition-transform duration-300
```

---

## Accessibility Guidelines

Quick Builder v2 WCAG 2.1 AA level accessibility ensure kore.

### Color Contrast

**Minimum Ratios:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1
- Graphical elements: 3:1

**Testing Tool:** Use WebAIM Contrast Checker or browser DevTools

### Focus States

**Visible Focus Indicator:**
```tailwind
focus:outline-2 focus:outline-offset-2 focus:outline-blue-500
```

**Component:**
```tsx
<button className="px-4 py-2 rounded focus:outline-2 focus:outline-offset-2 focus:outline-blue-500">
  Action
</button>
```

### Screen Reader Support

**ARIA Labels:**
```tsx
<button aria-label="Close modal">
  <X size={24} />
</button>
```

**Semantic HTML:**
```tsx
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>

<main>
  {/* Main content */}
</main>

<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
</section>
```

**Form Labels:**
```tsx
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
```

### Keyboard Navigation

**Tab Order:**
- Natural reading order
- Visible focus indicator on all interactive elements
- Logical flow through form fields
- Skip link to main content

**Component:**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### ARIA Best Practices

| Component | ARIA | Purpose |
|-----------|------|---------|
| Modal | `role="dialog"` | Identify dialog |
| | `aria-modal="true"` | Prevent background interaction |
| Modal Title | `aria-labelledby="title"` | Label dialog |
| Close Button | `aria-label="Close"` | Describe action |
| Loading | `aria-busy="true"` | Indicate loading |
| Form Error | `aria-describedby="error"` | Link error message |
| Button | `aria-pressed` | Toggle state |
| Tab | `role="tablist"` | Tab container |

### Mobile Accessibility

- Minimum touch target: 44x44px
- No hover-only interactions
- Readable text (minimum 16px)
- Sufficient color contrast
- Support text zoom (up to 200%)

---

## Figma Reference

Quick Builder v2 design system Figma e organized.

### Component Structure

```
Quick Builder v2
├── Buttons
│   ├── Primary
│   ├── Secondary
│   └── Ghost
├── Inputs
│   ├── Text
│   ├── Select
│   └── Textarea
├── Cards
│   ├── Section Card
│   ├── Variant Card
│   └── Product Card
├── Badges
│   ├── Trust Badge
│   ├── Discount Badge
│   └── Stock Badge
├── Modals
│   ├── Checkout Modal (Desktop)
│   ├── Checkout Modal (Mobile)
│   └── Style Wizard
└── Layouts
    ├── Desktop Grid
    ├── Mobile Grid
    └── Responsive Spacing
```

### Spacing Tokens

```
Spacing Scale (8px base):
xs:   4px
sm:   8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### Typography Scale

```
H1: 36px (desktop) / 28px (mobile)
H2: 32px (desktop) / 24px (mobile)
H3: 28px (desktop) / 20px (mobile)
H4: 24px (desktop) / 18px (mobile)
Body: 16px (desktop) / 14px (mobile)
Small: 14px (desktop) / 12px (mobile)
```

### Color Tokens

```
Primary:     #3b82f6
Primary-700: #1d4ed8
Success:     #10b981
Error:       #ef4444
Warning:     #f59e0b
Gray-50:     #f9fafb
Gray-900:    #111827
```

### Design Mockup Descriptions

**Intent Wizard Page:**
- Full-width container (1280px max)
- Centered card (600px width on desktop, full on mobile)
- Step indicator at top (horizontal desktop, vertical mobile)
- 3 card buttons for selection
- Navigation buttons at bottom
- 40px gap between sections

**Section Variant Selector:**
- 3-column grid (desktop), horizontal scroll (mobile)
- 200x150px cards with rounded corners
- Thumbnail image, name, and description
- Hover overlay with "Select" button
- Green checkmark on selected state

**Checkout Modal:**
- Max-width 500px, centered on desktop
- Full-screen bottom sheet on mobile
- Product summary at top
- Form fields with 16px spacing
- Trust badges below form
- Submit button (full width) at bottom
- Close button (X) at top

---

## Example Usage

### Creating a New Section

```tsx
// components/landing-builder/sections/NewSection.tsx

export function NewSection({ config, isEditing }) {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section content following design system */}
      </div>
    </section>
  );
}
```

### Using Component Library

```tsx
// pages/landing/[id]/edit.tsx

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LandingEditor() {
  return (
    <div className="space-y-4">
      <Card>
        <Button variant="primary">Save Changes</Button>
        <Button variant="secondary">Preview</Button>
      </Card>
      
      <Badge variant="trust">Secure Payment</Badge>
    </div>
  );
}
```

---

## Migration Guide (v1 → v2)

### Key Changes

1. **Intent Wizard:** New 3-step onboarding flow added
2. **Variants:** Sections now support multiple design variants
3. **Checkout:** Modal instead of page redirect
4. **Style Wizard:** Quick color/font customization
5. **Mobile-First:** All components designed for mobile first

### Component Updates

| Old | New | Notes |
|-----|-----|-------|
| `<Button>` | `<Button variant="primary">` | Now supports variants |
| `<CheckoutPage>` | `<CheckoutModal>` | Modal instead of page |
| `<HeroSection>` | `<HeroSection variant="product-focused">` | Variants support |

---

## Performance Checklist

- [ ] All images optimized (WebP with fallback)
- [ ] Font loading optimized (system fonts first)
- [ ] Lazy-loading for below-fold sections
- [ ] CSS animations use GPU acceleration (transform, opacity)
- [ ] No layout-shifting elements
- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] Bundle size < 500KB gzipped

---

