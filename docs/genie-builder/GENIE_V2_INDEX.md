# ✨ Genie - The Quick Builder

> ম্যাজিক্যালি হাই-কনভার্টিং ল্যান্ডিং পেইজ তৈরি করুন

## 🎯 Current Status: v2.2 - Advanced Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Intent Wizard (4-step) | ✅ Complete | Step 1: Intent, Step 2: Product, Step 3: Style, Step 4: Template |
| Intent Engine | ✅ Complete | Auto-generates sections & content based on intent |
| Style Preferences | ✅ Complete | Brand color (6 presets + custom), button style, font family |
| Section Variants | ✅ Complete | Database column added, UI integrated |
| Intent Persistence | ✅ Complete | `intent_json` & `style_tokens_json` in `builder_pages` |
| Multi-Product Support | ✅ Complete | Select 2-3 products with auto combo discount |
| Product Grid Section | ✅ Complete | `ProductGridSectionPreview.tsx` for displaying multiple products |
| Combo/Bundle Discounts | ✅ Complete | 2 products: 10%, 3+ products: 15% auto-applied |
| Best Practices Config | ✅ Complete | Urgency, Social Proof, Free Shipping, Delivery Estimate (all configurable) |
| Real Data Integration | ✅ Complete | Real stock & order counts (no fake numbers) |
| Template Previews | ✅ Complete | Visual gradient + emoji previews |
| New Builder Integration | ✅ Complete | Accessible via `/app/new-builder` |

### Latest Changes (2026-01-21):
- Added multi-product selection in Step 2 (IntentWizard)
- Added `ProductGridSectionPreview.tsx` for product display
- Implemented combo discount system (2-3 products, auto-calculated)
- Added `StyleTokens` type with 6 brand color presets
- Database: `builder_sections.variant`, `builder_pages.intent_json`, `builder_pages.style_tokens_json`
- Real data integration: stock from `products.stock`, order count from `orders` table (last 24h)
- Configurable best practices: urgency banner, social proof, free shipping progress, delivery estimates
- Migration: `db/migrations/0064_genie_builder_enhancements.sql`

---

Welcome! This is your central hub for Genie (Quick Builder v2) implementation documentation. Below you'll find all resources organized by type.

---

## 📚 Core Documentation (6 Main Documents)

### 1. **GENIE_V2_SPEC.md** - System Specification
**Purpose:** Complete overview of the Quick Builder v2 system  
**Read this if:** You want to understand what we're building and why

**Contents:**
- System overview and goals
- Target users (5 personas)
- Core principles
- Complete feature list (P0, P1, P2 priorities)
- Data model specifications
- API endpoints (8 endpoints defined)
- User flows (4 main flows)
- Success metrics
- Dependencies & tech stack

**Key Sections:**
- [System Overview](#system-overview)
- [Target Users](#target-users)
- [Core Principles](#core-principles)
- [Feature List](#feature-list) (organized by priority)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)

**Time to Read:** 30-40 minutes

---

### 2. **GENIE_IMPLEMENTATION_PHASES.md** - Implementation Plan
**Purpose:** Detailed 4-week phased implementation breakdown  
**Read this if:** You're planning development sprints or assigning work

**Contents:**
- 4-phase breakdown (1 week each)
- Day-by-day deliverables
- Specific files to create/modify
- TypeScript interfaces for each phase
- Testing criteria for each phase
- Risk management
- Success metrics

**Phases:**
- **Phase 1 (Week 1):** Intent-Based Quick Builder
- **Phase 2 (Week 2):** Section Variants System
- **Phase 3 (Week 3):** Embedded Checkout Modal
- **Phase 4 (Week 4):** Style Wizard & Polish

**Time to Read:** 25-30 minutes

---

### 3. **GENIE_USER_GUIDE.md** - User Guide (NEW!)
**Purpose:** Step-by-step guide for using Quick Builder v2  
**Read this if:** You want to learn how to use the system

**Contents:**
- How to access Quick Builder
- 3-step creation flow
- Section variants explanation
- Style and checkout settings
- Best practices per traffic source

**Time to Read:** 10 minutes

---

### 4. **GENIE_TECHNICAL_GUIDE.md** - Implementation Details
**Purpose:** Code-level technical specifications  
**Read this if:** You're starting to code or need architecture details

**Contents:**
- File structure (what to create/modify)
- TypeScript interfaces (complete type definitions)
- Component architecture (component structure)
- State management approach
- Database schema (new/modified tables)
- API route handlers (with code examples)
- Utility functions (with example implementations)
- Testing strategy (unit, integration, E2E)
- Performance checklist

**Key Sections:**
- [File Structure](#file-structure) (65+ files mapped)
- [TypeScript Interfaces](#typescript-interfaces)
- [Component Architecture](#component-architecture)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Testing Strategy](#testing-strategy)

**Time to Read:** 45-60 minutes (reference document)

---

### 4. **GENIE_MULTIPRODUCT_COMBOS.md** - Multi-Product & Discounts
**Purpose:** Multi-product selection, bundle discounts, and best practices  
**Read this if:** You're implementing multi-product features or need to understand combo discounts

**Contents:**
- Multi-product selection (2-3 products)
- ProductGrid section component
- Combo discount system (10% for 2, 15% for 3+)
- Urgency banner (real stock)
- Social proof (real 24h orders)
- Free shipping progress
- Delivery estimates
- Real data integration
- Backend validation

**Key Sections:**
- Multi-product selection logic
- Combo discount tiers & validation
- Best practices configuration
- Real data sources (stock, orders)
- Testing scenarios
- Troubleshooting

**Time to Read:** 25-30 minutes

---

### 5. **GENIE_STYLE_CUSTOMIZATION.md** - Brand Customization
**Purpose:** Style tokens, brand colors, button styles, and fonts  
**Read this if:** You're building the style wizard or need to understand customization

**Contents:**
- Brand color system (6 presets + custom)
- Button styles (rounded, sharp, pill)
- Font families (default, bengali, modern, classic)
- StyleTokens data structure
- CSS implementation
- Editor integration
- Performance considerations

**Key Sections:**
- Brand color presets & picker
- Button style options
- Font family options
- StyleTokens storage & validation
- Dynamic style injection
- Settings panel integration

**Time to Read:** 20-25 minutes

---

### 6. **GENIE_V2_TESTING_CHECKLIST.md** - QA & Testing
**Purpose:** Comprehensive testing requirements for all phases  
**Read this if:** You're responsible for QA or testing

**Contents:**
- Unit test specifications (by component)
- Integration test scenarios
- E2E test cases
- Performance benchmarks
- Mobile & accessibility testing
- Browser compatibility matrix
- Visual regression testing
- Bug tracking template
- Test report template

**Testing By Phase:**
- **Phase 1:** Intent wizard + product creation (25+ test cases)
- **Phase 2:** Section variants (30+ test cases)
- **Phase 3:** Checkout modal (35+ test cases)
- **Phase 4:** Style wizard & analytics (25+ test cases)

**Cross-Phase:**
- Full E2E user journey (15 steps)
- Browser & device testing matrix
- Performance benchmarks
- Regression testing

**Time to Read:** 40-50 minutes (reference document)

---

## 🎯 Quick Reference & Implementation

### **GENIE_IMPLEMENTATION_REFERENCE.md** - Implementation Checklist & Quick Reference
**Purpose:** Quick lookup guide for implementing and debugging features  
**Read this if:** You need to quickly find where things are or how to implement a task

**Contents:**
- Complete feature checklist (all items ✅)
- Files reference (organized by purpose)
- Common implementation tasks (with code examples)
- Configuration reference
- Debugging guide (troubleshooting)
- Data flow diagrams
- Deployment checklist
- Performance targets
- Quick test cases
- Tips & best practices

**Time to Read:** 15-20 minutes (reference document)

---

## 👨‍💻 Developer Quick Start Guides (NEW!)

These focused guides get developers productive fast:

### 5. **GENIE_DEV_SETUP.md** - Setup & Environment
**Purpose:** Get up and running in 5 minutes  
**Read this if:** You're a new developer starting on this project

**Contents:**
- Prerequisites (Node.js, VS Code extensions)
- Environment setup (`npm install`, `.env` config)
- D1 local database setup
- Key file structure overview
- Quick commands reference

**Time to Read:** 10 minutes

---

### 6. **GENIE_DEV_IMPLEMENTATION.md** - Implementation Patterns
**Purpose:** Code examples for common tasks  
**Read this if:** You're implementing features and need code patterns

**Contents:**
- Adding Intent Wizard steps (multi-step form pattern)
- Adding Section Variants (component + registry)
- Checkout Modal implementation (modal + form + API)
- Working with LandingConfig (interfaces, defaults, type safety)

**Time to Read:** 20 minutes (heavy code examples)

---

### 7. **GENIE_DEV_TESTING_DEPLOY.md** - Testing & Deployment
**Purpose:** Testing, debugging, and deployment workflows  
**Read this if:** You need to test, debug, or deploy changes

**Contents:**
- Unit tests (Vitest) & E2E tests (Playwright)
- Debugging tips (wrangler tail, common errors)
- Deployment (local, preview, production)
- Code style guidelines

**Time to Read:** 15 minutes

---

### 8. **GENIE_UI_UX_GUIDE.md** - UI/UX Design Guide
**Purpose:** Design specifications and component library  
**Read this if:** You're building UI components or need design reference

**Contents:**
- Design principles (mobile-first, conversion-focused)
- Intent wizard UI specifications
- Section variant selector UI
- Checkout modal UI (desktop + mobile)
- Style wizard UI
- Component library (buttons, forms, cards)
- Color palette & typography
- Animations & accessibility

**Time to Read:** 30 minutes

---

## 🔗 Related Existing Documentation

Before diving into v2, review these existing guides:

1. **docs/GENIE_MVP_GUIDE.md**
   - Existing v1 features
   - Current section architecture
   - Template system
   - Deployment notes

2. **docs/GENIE_GAP_ANALYSIS.md**
   - Analysis of what's missing in v1
   - Completed features tracker
   - Feature status matrix

3. **docs/GENIE_TEMPLATE_GUIDE.md**
   - Template building instructions
   - 10 predefined templates
   - Template metadata
   - Component registry

4. **docs/GENIE_TESTING.md**
   - Current v1 testing approach
   - E2E test structure

---

## 🎯 Quick Reference by Role

### For Different Roles

#### **Product Manager**
Start with: **GENIE_V2_SPEC.md**
- Read: System Overview + Target Users + Feature List
- Then: **GENIE_USER_GUIDE.md** for user experience
- Time: 20 minutes

#### **Engineering Lead**
Start with: **GENIE_IMPLEMENTATION_PHASES.md**
- Read: All 4 phases with daily breakdowns
- Cross-ref: **GENIE_TECHNICAL_GUIDE.md** for architecture
- Reference: **GENIE_IMPLEMENTATION_REFERENCE.md** for details
- Time: 50 minutes

#### **Frontend Developer (Features)**
Start with: **GENIE_TECHNICAL_GUIDE.md**
- Read: File Structure + Component Architecture + Interfaces
- Deep-dive: **GENIE_MULTIPRODUCT_COMBOS.md** or **GENIE_STYLE_CUSTOMIZATION.md**
- Reference: **GENIE_IMPLEMENTATION_REFERENCE.md** for implementation tasks
- Time: 90 minutes

#### **Frontend Developer (Multi-Product/Discounts)**
Start with: **GENIE_MULTIPRODUCT_COMBOS.md**
- Read: All sections (Product Grid, Combo Discount, Best Practices)
- Reference: **GENIE_TECHNICAL_GUIDE.md** for backend integration
- Time: 30 minutes

#### **Frontend Developer (Style System)**
Start with: **GENIE_STYLE_CUSTOMIZATION.md**
- Read: All sections (Brand Colors, Button Styles, Fonts)
- Reference: **GENIE_TECHNICAL_GUIDE.md** for integration
- Time: 25 minutes

#### **Backend Developer**
Start with: **GENIE_TECHNICAL_GUIDE.md**
- Read: API Routes + Database Schema + Real Data Integration
- Deep-dive: **GENIE_MULTIPRODUCT_COMBOS.md** → Combo Discount section
- Time: 50 minutes

#### **QA / Tester**
Start with: **GENIE_V2_TESTING_CHECKLIST.md**
- Read: All sections
- Cross-ref: **GENIE_MULTIPRODUCT_COMBOS.md** → Testing Scenarios
- Reference: **GENIE_IMPLEMENTATION_REFERENCE.md** → Quick Test Cases
- Time: 60 minutes

#### **Designer**
Start with: **GENIE_V2_SPEC.md**
- Read: Core Principles + Section Variants
- Deep-dive: **GENIE_STYLE_CUSTOMIZATION.md** for design specs
- Time: 30 minutes

#### **Debugger (Bug Fixing)**
Start with: **GENIE_IMPLEMENTATION_REFERENCE.md**
- Read: Debugging Guide section
- Reference relevant deep-dive docs as needed
- Time: 10-20 minutes

---

## 📊 Key Statistics

| Metric | Count |
|--------|-------|
| Total Documentation | 6 core + 4 supporting docs |
| Total Words | ~28,000+ |
| Files Modified/Created | 75+ |
| New API Endpoints | 9 |
| New Components | 35+ |
| Section Variants | 18+ |
| Test Cases | 120+ |
| Phases | 4 weeks (all complete) |
| Target Page Load | < 2 seconds |
| Multi-Product Support | ✅ Yes (2-3 products) |
| Combo Discount Tiers | 2 (10%, 15%) |
| Brand Color Presets | 6 + custom picker |
| Button Style Options | 3 |
| Font Family Options | 4 |
| Best Practices Features | 5 (all configurable) |
| Real Data Sources | 2 (stock, orders) |

---

## 📈 Implementation Progress Tracker

| Phase | Status | Week | Key Deliverables |
|-------|--------|------|-----------------|
| **Phase 1** | ✅ Complete | Week 1 | IntentWizard, intentEngine, 5 files created |
| **Phase 2** | ✅ Complete | Week 2 | VariantSelector, 18 variant components |
| **Phase 3** | ✅ Complete | Week 3 | CheckoutModal, useCheckoutModal hook, 5 files |
| **Phase 4** | ✅ Complete | Week 4 | StyleWizard, CheckoutToggle, 3 files |
| **Integration** | ✅ Complete | - | Merged into /app/new-builder |

**Overall Progress:** 100% Complete ✅ (All phases + Integration done - January 2026)

---

## 🆕 Recently Implemented Files (30 files total)

**Phase 1 (5 files):**
- ✅ `app/routes/app.quick-builder.new.tsx` • `IntentWizard.tsx` • `QuickProductForm.tsx` • `intentEngine.ts` • `db/types.ts`

**Phase 2 (18 files):**
- ✅ `variantRegistry.ts` • `VariantSelector.tsx` • `VariantSelectorModal.tsx`
- ✅ Variants: Hero (3) • Testimonials (3) • CTA (3) • Features (2) • SocialProof (3)
- ✅ `SectionManager.tsx` (updated with Palette icon)

**Phase 3 (5 files):**
- ✅ `CheckoutModal.tsx` • `CompactCheckoutForm.tsx` • `useCheckoutModal.ts` • `api.checkout.create.ts` • `LandingPageTemplate.tsx`

**Phase 4 (2 files - pending):**
- ⏳ `StyleWizard.tsx` • `styleWizardEngine.ts`

---

## 🚀 Getting Started Checklist

### Week 0: Preparation & Alignment

**Monday:**
- [x] Product team: Review GENIE_V2_SPEC.md
- [x] Engineering team: Review GENIE_IMPLEMENTATION_PHASES.md
- [x] Design team: Review variant components section
- [x] QA team: Review GENIE_V2_TESTING_CHECKLIST.md

**Tuesday:**
- [x] Team alignment meeting (30 min)
- [x] Clarify scope & priorities
- [x] Confirm target launch date
- [x] Identify blockers

**Wednesday:**
- [x] Architecture review (engineering)
- [x] API contract review
- [x] Database schema review

**Thursday:**
- [x] Setup development environment
- [x] Create feature branches
- [x] Setup CI/CD for new routes

**Friday:**
- [x] Sprint planning (Phases 1-3 complete)
- [ ] Phase 4 task assignment
- [ ] Begin Phase 4 development

---

## 📖 How to Use This Documentation

### If you're starting development:
1. Read **GENIE_V2_SPEC.md** (system overview)
2. Read **GENIE_TECHNICAL_GUIDE.md** (architecture)
3. Read **GENIE_IMPLEMENTATION_PHASES.md** (your phase breakdown)
4. Start coding with your phase checklist

### If you're joining mid-project:
1. Read **GENIE_V2_SPEC.md** (quick overview)
2. Ask engineering lead: "Which phase are we in?"
3. Read that phase in **GENIE_IMPLEMENTATION_PHASES.md**
4. Read **GENIE_TECHNICAL_GUIDE.md** (reference)

### If you're testing:
1. Read **GENIE_V2_TESTING_CHECKLIST.md** (full checklist)
2. Read **GENIE_V2_SPEC.md** (feature details)
3. Create test cases from checklist
4. Test each phase as it completes

### If you're reviewing code:
1. Read **GENIE_TECHNICAL_GUIDE.md** (architecture)
2. Check: File structure matches
3. Check: TypeScript interfaces match
4. Check: API routes follow spec
5. Check: Tests pass all criteria

---

## 💬 Key Terminology

**Intent:** User's goal (what they're selling, who they're selling to)

**Section:** Building block (Hero, Features, CTA, etc.)

**Variant:** Alternative style for a section (e.g., hero-product-focused vs. hero-offer-focused)

**Template:** Pre-designed layout with color scheme (e.g., premium-bd, flash-sale)

**Quick Product:** Product created inline during landing page builder (not in full product management)

**Checkout Modal:** Overlay form instead of page redirect

**Style Wizard:** Quick customization flow for colors/fonts

**Mobile-First:** Designed for mobile first, then scaled up

**COD:** Cash on Delivery (primary payment method for Bangladesh)

---

## 🎯 Success Criteria (Final)

By end of Phase 4 (Week 4), we should have:

✅ **Users can:**
- Create landing page in < 3 minutes (intent wizard)
- Publish without editing (auto-generated)
- Customize sections with variants
- Change colors/fonts easily
- See analytics dashboard
- Checkout without page redirect

✅ **Technical:**
- Page load < 2 seconds
- Zero critical bugs
- 99.9% uptime
- All tests passing
- Mobile-responsive on all phones

✅ **Business:**
- > 2.5% conversion rate (vs. v1: 1.8%)
- > 60% merchant adoption of intent wizard
- > 4.5/5 satisfaction rating
- Launch ready

---

## 📞 Questions?

| Question | Answer Location |
|----------|-----------------|
| What are we building? | GENIE_V2_SPEC.md → System Overview |
| When is launch? | GENIE_IMPLEMENTATION_PHASES.md → Week 4 |
| What files do I create? | GENIE_TECHNICAL_GUIDE.md → File Structure |
| What do I test? | GENIE_V2_TESTING_CHECKLIST.md |
| What's the timeline? | GENIE_IMPLEMENTATION_PHASES.md → 4-week plan |
| What are the APIs? | GENIE_V2_SPEC.md → API Endpoints |

---

## 📝 Document Versions

| Document | Version | Date | Status |
|----------|---------|------|--------|
| GENIE_V2_SPEC.md | 1.0 | 2024-01-20 | ✅ Ready |
| GENIE_IMPLEMENTATION_PHASES.md | 1.0 | 2024-01-20 | ✅ Ready |
| GENIE_TECHNICAL_GUIDE.md | 1.0 | 2024-01-20 | ✅ Ready |
| GENIE_V2_TESTING_CHECKLIST.md | 1.0 | 2024-01-20 | ✅ Ready |

---

## 🔄 Document Updates

If you find issues or need clarifications:

1. **For spec issues:** Create issue in GENIE_V2_SPEC.md
2. **For implementation:** Update GENIE_IMPLEMENTATION_PHASES.md
3. **For technical:** Update GENIE_TECHNICAL_GUIDE.md
4. **For testing:** Update GENIE_V2_TESTING_CHECKLIST.md

---

**Happy building! 🚀**

Start with your role above, then dive into the detailed documentation.

