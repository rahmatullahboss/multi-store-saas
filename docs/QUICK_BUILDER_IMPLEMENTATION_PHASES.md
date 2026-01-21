# Quick Builder v2 - Phased Implementation Plan

## 📅 Overview

**Total Duration:** 4 weeks  
**Sprint Format:** 1 week per phase  
**Team Size:** 2-3 developers + 1 designer

---

## Phase 1: Intent-Based Quick Builder (Week 1) - ✅ COMPLETED

### Goal
Enable users to quickly create landing pages through an intent-driven wizard that auto-generates optimal sections and templates.

### Deliverables

#### Day 1-2: Intent Selection UI
- [x] Create route: `/app/quick-builder/new`
- [x] Build `IntentWizard.tsx` component with 3 steps:
  - **Step 1:** Product Type (single | multiple)
  - **Step 2:** Goal (direct_sales | lead_whatsapp)
  - **Step 3:** Traffic Source (facebook | tiktok | organic)
- [x] Mobile-responsive wizard UI
- [x] Store intent in session state
- [x] Add progress indicator

**Files Created:**
```
app/routes/app.quick-builder.new.tsx ✅
app/components/landing-builder/IntentWizard.tsx ✅
app/utils/landing-builder/intentEngine.ts ✅
```

**TypeScript Interface:**
```typescript
interface Intent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
}
```

#### Day 3: Product Connection
- [x] Build `QuickProductForm.tsx` component
- [x] Allow: select existing product OR create inline
- [x] Support for product variants
- [x] Image upload to Cloudflare R2
- [x] Price validation (must be > 0)
- [x] Inline product creation without modal

**Features:**
- Product name, price, compare-at-price
- Upload product image
- Add variants (e.g., "1kg", "2kg")
- Auto-generate product slug
- Save to `stores.products` table

#### Day 4: Smart Auto-Generation Engine
- [x] Create `intentEngine.ts` utility
- [x] Function: `generateOptimalSections(intent: Intent): string[]`
  - Facebook + direct_sales → ['hero', 'trust', 'features', 'testimonials', 'cta']
  - TikTok + direct_sales → ['hero', 'urgency', 'social-proof', 'testimonials', 'cta', 'faq']
  - Organic + lead_whatsapp → ['hero', 'benefits', 'faq', 'cta', 'footer-cta']

- [x] Function: `selectOptimalTemplate(intent: Intent): string`
  - Return template ID based on intent
  - Facebook → 'premium-bd' | 'flash-sale'
  - TikTok → 'flash-sale' | 'modern-dark' | 'video-focus'
  - Organic → 'minimal-light' | 'organic' | 'trust-first'
  
**Available Templates (12 total):**
- premium-bd, flash-sale, mobile-first, luxe
- organic, modern-dark, minimal-light, video-focus
- showcase, minimal-clean, story-driven, trust-first

- [x] Generate default section content (headlines, FAQs, etc.)

- [x] Create landing page with auto-populated config

**Testing:**
- [x] Unit tests for `generateOptimalSections()`
- [x] Unit tests for `selectOptimalTemplate()`
- [x] Test all 6 combinations (3 goals × 2 traffic sources)

### Success Criteria
- ✅ Intent wizard completes in < 2 minutes
- ✅ Auto-generated page is immediately usable
- ✅ Product created successfully
- ✅ Mobile responsive (tested on iPhone 12, Android)
- ✅ Page publishes without errors

---

## Phase 2: Section Variants System (Week 2) - ✅ COMPLETED

### Goal
Allow users to choose different styles for sections (hero, testimonials, CTA, etc.) without requiring code knowledge.

### Deliverables

#### Day 1: Variant Data Model
- [x] Create `variantRegistry.ts`:
  ```typescript
  interface SectionVariantDef {
    id: string;
    sectionId: string;
    name: string;
    description: string;
    component: React.ComponentType;
    defaultConfig: Record<string, any>;
    tags: string[];
  }
  ```

- [x] Define variants for: hero, testimonials, features, cta, social-proof
- [x] Add to `LandingConfig`:
  ```typescript
  sectionVariants?: { [sectionId: string]: string }
  ```

- [x] Update database schema (if needed) - likely just JSON field update

**Hero Variants:**
- `hero-product-focused` - Large product image
- `hero-offer-focused` - Big discount/price display
- `hero-video-focused` - Video hero
- `hero-text-focused` - Bold headline only

**Testimonials Variants:**
- `testimonials-cards` - Grid layout
- `testimonials-carousel` - Horizontal scroll
- `testimonials-avatars` - Just images

**CTA Variants:**
- `cta-button-only` - Minimal button
- `cta-with-trust` - Button + badges below
- `cta-urgency` - Button + countdown timer

#### Day 2-3: Variant Components
- [x] Create `app/components/landing-builder/variants/` folder
- [x] Build variant components:
  ```
  HeroProductFocused.tsx ✅
  HeroOfferFocused.tsx ✅
  HeroVideoFocused.tsx ✅
  TestimonialsCarousel.tsx ✅
  CTAWithTrust.tsx ✅
  CTAUrgency.tsx ✅
  FeaturesList.tsx ✅
  FeaturesGrid.tsx ✅
  ```

- [x] Each variant accepts `config` prop
- [x] Each variant renders based on `landingConfig` data
- [x] Variant preview thumbnails (static images)

#### Day 4: Variant Selector UI
- [x] Build `VariantSelector.tsx` component
- [x] Show 2-3 variant preview cards
- [x] Click to switch variant
- [x] Update `landingConfig.sectionVariants` on change
- [x] Real-time preview in editor
- [x] Add to `SectionManager.tsx` editor with Palette icon

**UI:**
- Show variant name, description, thumbnail
- Selected variant has checkmark
- Hover shows "Switch to this variant" button
- Mobile: vertical card layout

### Success Criteria
- ✅ All 12+ variants defined and working
- ✅ Variant switching updates preview instantly
- ✅ UI clear and non-confusing
- ✅ No visual glitches when switching
- ✅ Mobile responsive

---

## Phase 3: Embedded Checkout Modal (Week 3) - ✅ COMPLETED

### Goal
Allow customers to checkout without leaving the landing page.

### Deliverables

#### Day 1: CheckoutModal Component
- [x] Create `CheckoutModal.tsx`
- [x] Modal features:
  - Overlay with close button
  - ESC key closes modal
  - Backdrop click closes (optional)
  - Smooth animations
  - Mobile: full-screen modal
  - Desktop: centered modal (60% width)

- [x] State management:
  - `isOpen` state
  - `productId` passed to modal
  - `variantId` (if multiple variants)

- [x] Mobile responsiveness:
  - Full viewport height on mobile
  - Keyboard visible + scroll support
  - Bottom sheet style on mobile (implemented)

#### Day 2: CompactCheckoutForm
- [x] Build `CompactCheckoutForm.tsx`
- [x] Form fields:
  - Name (required)
  - Phone (required, BD format)
  - Address (required)
  - Variant selector (if product has variants)
  - Quantity (1-10)
  - Delivery area (Inside/Outside Dhaka)

- [x] Features:
  - Auto-calculate shipping
  - Show order summary (price + shipping + total)
  - COD by default (no payment required)
  - WhatsApp order option
  - Trust badges displayed
  - Loading state while submitting
  - Success/error messages

- [x] Validation:
  - Name: min 3 chars
  - Phone: 11 digits, starts with 0
  - Address: min 10 chars
  - Zod validation on submit

#### Day 3: Modal Integration
- [x] Add `useCheckoutModal()` hook to CTA sections
- [x] Update CTA button click handler:
  ```typescript
  onClick={() => openCheckoutModal(productId)}
  ```

- [x] Pass product details to modal
- [x] Handle order submission
- [x] Show success message with order number
- [x] Return focus to CTA button after close

- [x] Add to landing page editor:
  - Option to enable/disable modal
  - Option for "express mode" (pre-fill from intent)

#### Day 4: Testing & Polish
- [x] End-to-end testing:
  - Click CTA → Modal opens ✅
  - Fill form → Submit ✅
  - Order created in database ✅
  - Success message shows ✅
  - Close modal → Return to page ✅

- [x] Mobile testing on:
  - iPhone 12
  - Android Samsung S21
  - iPad mini

- [x] Performance:
  - Modal load < 500ms
  - Form submit < 1s
  - No layout shift

### Success Criteria
- ✅ Checkout completes without page redirect
- ✅ Mobile UX is smooth
- ✅ Form validation works correctly
- ✅ Orders save to database
- ✅ No broken styling

---

## Phase 4: Style Wizard & Polish (Week 4) - 🔄 IN PROGRESS

### Goal
Enable users to quickly customize brand colors, fonts, and button styles. Finalize all v2 features.

### Deliverables

#### Day 1: Style Wizard Component
- [ ] Create `StyleWizard.tsx` with:
  - Brand color picker (5 presets + custom)
  - Button style selector (rounded | sharp | pill)
  - Font family picker (system | serif | sans-serif)
  - Light/Dark mode toggle
  - Checkout toggle (new)

- [ ] Features:
  - Color preview swatches
  - Real-time preview of changes
  - Save settings to `landingConfig.styleWizard`
  - Reset to defaults button

- [ ] Presets:
  - Emerald (green, premium)
  - Indigo (blue, professional)
  - Rose (pink, luxury)
  - Amber (orange, urgency)
  - Gray (neutral, minimal)

**UI:**
- 5 preset color boxes
- "Custom color" option with color picker
- Button style: 3 toggle buttons
- Font: dropdown selector
- Dark mode: toggle switch
- Checkout toggle: enable/disable modal
- Live preview in background

#### Day 2: Multi-Product Landing Support
- [ ] Extend landing page for 1-3 products
- [ ] Add product switcher in hero section
- [ ] When user switches product:
  - Update hero image & headline
  - Update CTA price
  - Keep all other sections same
  - Update variants

- [ ] UI:
  - Product tabs in hero
  - "Choose product variant" in CTA

- [ ] Testing:
  - Create landing with 2 products
  - Switch products
  - Verify all details update

#### Day 3: Performance & Analytics
- [ ] Performance optimizations:
  - Critical CSS inlining
  - Lazy load images (intersection observer)
  - Minify JSON config
  - Target: < 2s load time (P75)

- [ ] Simple analytics:
  - Track: page views, CTA clicks, checkout opens, orders
  - Store events in `landing_page_events` table
  - Create basic dashboard query

- [ ] Dashboard UI:
  - Show: Views, Clicks, Conversions
  - Simple line chart (last 7 days)
  - Conversion rate %
  - Export CSV button

#### Day 4: Testing & Launch
- [ ] Full E2E testing:
  - Create page with intent wizard ✅
  - Customize sections ✅
  - Switch variants ✅
  - Open checkout modal ✅
  - Place order ✅
  - View analytics ✅

- [ ] Mobile testing (all phases)
- [ ] Performance testing (WebPageTest, Lighthouse)
- [ ] Security review (no XSS vulnerabilities)
- [ ] Browser compatibility (Chrome, Safari, Firefox, Edge)

- [ ] Documentation:
  - User guide for merchants
  - API documentation
  - Troubleshooting guide

### Success Criteria
- ✅ All Phase 4 features working
- ✅ Page load < 2 seconds
- ✅ 100+ landing pages created & published
- ✅ No critical bugs
- ✅ Analytics dashboard showing data

---

## Implementation Checklist

### Phase 1 Checklist - ✅ COMPLETED
- [x] `app/routes/app.quick-builder.new.tsx` created
- [x] `IntentWizard.tsx` component built
- [x] `QuickProductForm.tsx` component built
- [x] `intentEngine.ts` with auto-generation logic
- [x] Landing page created from intent
- [x] Template auto-selected
- [x] Sections auto-ordered
- [x] Unit tests passing
- [x] E2E test: Wizard → Landing Page

### Phase 2 Checklist - ✅ COMPLETED
- [x] `variantRegistry.ts` with all variants defined
- [x] 18 total variant components built
- [x] `VariantSelector.tsx` component
- [x] Integrated into `SectionManager.tsx` with Palette icon
- [x] Real-time preview working
- [x] Mobile responsive
- [x] Unit tests for variants
- [x] E2E test: Select variant → Preview updates

### Phase 3 Checklist - ✅ COMPLETED
- [x] `CheckoutModal.tsx` built
- [x] `CompactCheckoutForm.tsx` built
- [x] Modal integration complete
- [x] Form validation working
- [x] Order saved to database
- [x] Success message shows
- [x] Mobile full-screen modal / bottom sheet
- [x] E2E test: CTA → Modal → Order placed

### Phase 4 Checklist
- [ ] `StyleWizard.tsx` built
- [ ] Color/font presets working
- [ ] Real-time preview
- [ ] Multi-product support
- [ ] Analytics dashboard
- [ ] Performance < 2s
- [ ] All E2E tests passing
- [ ] Documentation complete
- [ ] Launch ready

---

## Daily Standup Template

```
📅 Date: [DAY]
📊 Phase: [PHASE] - [TITLE]

✅ Completed Yesterday:
- [ ] Item 1
- [ ] Item 2

🚀 Today's Goals:
- [ ] Item 1
- [ ] Item 2

🚧 Blockers:
- [ ] Blocker 1 (impact: HIGH/MEDIUM/LOW)

📈 Metrics:
- Lines of code: [#]
- Tests passing: [#]
- Build time: [#]s
```

---

## Risk Management

### Risk 1: Checkout Modal Complexity
**Risk:** Modal implementation takes longer than expected  
**Mitigation:** Start with simple version, add refinements iteratively  
**Fallback:** Keep redirect-based checkout as backup

### Risk 2: Database Migration
**Risk:** Storing new intent/variant fields breaks existing pages  
**Mitigation:** Use JSON fields, backwards compatible  
**Fallback:** Add migration script

### Risk 3: Performance Regression
**Risk:** Adding features makes pages slower  
**Mitigation:** Monitor Lighthouse scores daily  
**Fallback:** Feature flag to disable non-critical features

### Risk 4: Mobile Responsiveness Issues
**Risk:** Modal/wizard broken on various phones  
**Mitigation:** Test on 5+ devices daily  
**Fallback:** Simplified mobile version

---

## Success Metrics (End of Week 4)

| Metric | Target | Actual |
|--------|--------|--------|
| Time to publish landing page | < 3 min | ? |
| Page load time (P75) | < 2 sec | ? |
| Mobile conversion rate | > 3% | ? |
| Merchant satisfaction | > 4.5/5 | ? |
| Feature adoption | > 60% | ? |
| Uptime | 99.9% | ? |
| Critical bugs | 0 | ? |

---

## Next Steps Post-Phase 4

### P1 Features (After v2 Launch)
- A/B testing interface
- Countdown timer section
- Social proof notifications
- WhatsApp order integration
- Email capture forms
- AI content generation

### P2 Features (Q2 2024)
- Influencer templates
- Pre-order pages
- Webinar landing pages
- Waitlist pages
- Advanced analytics

---

