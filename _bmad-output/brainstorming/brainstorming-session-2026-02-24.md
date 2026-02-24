# 🧠 Brainstorming Session — World-Class Landing Page Builder for Ozzyl
**Date:** 2026-02-24  
**Topic:** Build a world-class landing page builder by studying the best companies  
**Status:** ✅ Complete  

---

## 📊 CURRENT STATE AUDIT

### What Already Exists (Apps/Page-Builder)

**Two parallel systems currently co-exist — this is the root of the "hijibiji" problem:**

| System | Location | Tech | Status |
|--------|----------|------|--------|
| **GrapesJS Editor** | `apps/page-builder/` | GrapesJS + Remix Worker | Active but messy |
| **Section Builder (v2)** | `apps/web/app/new-builder/` | Custom React + D1 | Partially built |
| **Quick Builder (Genie)** | `apps/web/app/quick-builder/` | Wizard-based | Active |

### What GrapesJS System Has
- ✅ 23 section types (hero, faq, testimonials, gallery, video, cta, etc.)
- ✅ Multiple visual variants per section (Glassmorphism, Neubrutalist, Urgency, Social Proof etc.)
- ✅ 6 theme presets (Quick Start, Flash Sale, Premium BD, Modern Dark, Organic, Minimal)
- ✅ Draft/Publish split (propsJson vs publishedPropsJson)
- ✅ Page revisions / version history
- ✅ Saved blocks per store
- ✅ Auto-save
- ✅ AI sidebar (AISidebar.tsx)
- ✅ Image upload to R2
- ✅ Floating buttons (WhatsApp, Call, Order)
- ✅ SEO fields (title, description, ogImage, canonical, noIndex)
- ✅ Multi-language (EN/BN toggle)

### What's MISSING / Broken
- ❌ No real-time visual preview in editor (GrapesJS canvas is slow/buggy)
- ❌ No proper mobile preview mode
- ❌ No drag-and-drop section reordering with live preview
- ❌ No template gallery with actual previews (screenshots)
- ❌ No conversion analytics per page (which sections get most clicks)
- ❌ No A/B testing at page level
- ❌ No inline text editing (click text → edit directly on canvas)
- ❌ Custom domain per landing page (not store subdomain)
- ❌ No "duplicate page" feature
- ❌ Inconsistent data: Two DB systems (landingPages table vs builderPages table)
- ❌ GrapesJS is heavy — 800KB+ bundle, slow load on mobile
- ❌ No section-level analytics (heatmap, scroll depth)

---

## 🏆 COMPETITIVE INTELLIGENCE — What the Best Got Right

### 1. Webflow — "Clean Code Output"
**Key insight:** Visual = Actual. No garbage HTML.  
**Steal:** Our sections should always output clean, semantic, fast HTML. GrapesJS generates messy HTML — this is our #1 problem.

### 2. Framer — "Component Variants + Motion"
**Key insight:** Every component has variants. Designer picks style, not writes code.  
**Steal:** Our section variant picker (Glassmorphism, Neubrutalist etc.) is already this concept — but the UI for picking variants is buried. Bring it front and center.

### 3. Carrd — "Ship in 5 minutes"
**Key insight:** Brutally simple. No overwhelm. Template → customize 2-3 things → publish.  
**Steal:** Quick Builder / Genie mode should be the DEFAULT entry point, not the advanced editor.

### 4. Unbounce — "Conversion-first templates"
**Key insight:** Every template is designed around a specific conversion goal. Hero → Trust → CTA → FAQ → CTA again.  
**Steal:** Our templates should have a conversion score system. "This page layout converts at X% average."

### 5. Shopify — "Section drag-reorder"
**Key insight:** Left sidebar shows all sections as cards. Drag to reorder. Click to expand settings.  
**Steal:** This exact pattern. Sidebar = section list. Right panel = section settings. Center = live preview.

### 6. Leadpages — "Real-time conversion coach"
**Key insight:** As you build, it tells you "Your page is missing a guarantee section — add one to increase conversions by 23%."  
**Steal:** AI sidebar should suggest missing sections based on page goal.

### 7. Wix ADI — "Answer questions → Full page"
**Key insight:** User answers 5 questions → Wix generates a complete page automatically.  
**Steal:** Our Genie/Quick Builder is 80% this already. Make it better with actual section generation, not just template selection.

### 8. Notion/Super — "No-code page from existing content"
**Key insight:** Connect your data → page is generated.  
**Steal:** Connect to product → Hero, Gallery, Showcase auto-populated from product data.

---

## 🎯 THE MASTER PLAN — World-Class Ozzyl Landing Page Builder

### Core Philosophy (Stolen from the Best)
> **"Carrd's simplicity + Shopify's section model + Unbounce's conversion focus + Framer's variants + Wix ADI's AI generation"**

Three modes for three types of users:
1. **🚀 Genie Mode** (5 min) — Answer questions → AI generates complete page → Done
2. **🎨 Section Mode** (30 min) — Shopify-style section editor with live preview  
3. **💻 Pro Mode** (Power users) — Full GrapesJS canvas for pixel-perfect control

---

## 📐 ARCHITECTURE DECISION

### ❌ Kill GrapesJS as Primary Editor
GrapesJS is the root of all problems:
- 800KB+ bundle
- Generates messy HTML
- Mobile-unfriendly canvas
- Complex plugin system that breaks
- Hard to maintain custom sections

### ✅ Build Custom Section Editor (Already 60% Done in v2)
The Section Builder v2 (`apps/web/app/new-builder/`) is the RIGHT approach.  
**Keep:** Section registry, schemas, Zod validation, draft/publish split  
**Build:** Proper left sidebar + live preview iframe + right settings panel

### Single DB Source of Truth
**Keep `builderPages` + `builderSections` tables** (the v2 schema is correct)  
**Kill `landingPages` table** (old GrapesJS table — migrate data then drop)

---

## 🗂️ PHASE-BY-PHASE BUILD PLAN

---

### PHASE 1 — Foundation Cleanup (Week 1)
**Goal:** One clean system, no duplicate code, no confusing architecture

#### Tasks:
1. **Migrate all `landingPages` data → `builderPages`** (write migration script)
2. **Delete GrapesJS editor** (`apps/page-builder/` — entire folder — except templates/schemas that can be reused)
3. **Promote Section Builder v2** as the single page builder
4. **Update all routes** that referenced GrapesJS to point to new editor
5. **Single DB table:** `builder_pages` + `builder_sections` is the canonical truth

#### Deliverable: One clean, working page builder entry point at `/app/new-builder`

---

### PHASE 2 — Editor UI Overhaul (Week 2-3)
**Goal:** Shopify-quality 3-panel editor with live preview

#### Layout (Steal from Shopify Theme Editor):
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: [← Back] [Page Name] [Mobile/Desktop] [Save] [Publish] │
├──────────────┬──────────────────────────────┬───────────────┤
│  LEFT PANEL  │     CENTER — LIVE PREVIEW    │  RIGHT PANEL  │
│  (Sections)  │     (iframe of actual page)  │  (Settings)   │
│              │                              │               │
│ ┌──────────┐ │  ┌────────────────────────┐ │ Section Props │
│ │ + Add    │ │  │                        │ │ Color picker  │
│ └──────────┘ │  │   LIVE PREVIEW         │ │ Text editor   │
│              │  │   (renders actual      │ │ Image upload  │
│ ≡ Hero       │  │    React components)   │ │ Toggle        │
│ ≡ Benefits   │  │                        │ │               │
│ ≡ FAQ        │  └────────────────────────┘ │               │
│ ≡ CTA        │                              │               │
│ [drag-sort]  │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

#### Key Features to Build:
- **Live Preview iframe** — renders actual React components (not GrapesJS canvas)
- **Left sidebar** — section list with drag-to-reorder (react-dnd or @dnd-kit)
- **Right panel** — dynamic form based on section schema (auto-generated from Zod schema)
- **Section variant picker** — visual thumbnails of each variant (Glassmorphism, Neubrutalist etc.)
- **Mobile/Desktop preview toggle** — iframe width changes
- **Click section in preview → auto-select in sidebar**

#### Tech Stack for Editor:
```typescript
// Left panel: @dnd-kit/sortable for drag-reorder
// Right panel: react-hook-form + auto-generate fields from Zod schema
// Preview: <iframe> pointing to /preview-frame/:pageId with polling or SSE for updates
// Save: Optimistic updates with TanStack Query mutations
// Mobile preview: iframe width constrained to 390px
```

---

### PHASE 3 — Section Variants UI (Week 3)
**Goal:** Make variant selection beautiful and obvious (Framer-style)

#### Current State:
Variants exist in code (GlassmorphismHero, NeubrutalistHero etc.) but the picker is poor.

#### Build:
- **Variant Thumbnail Gallery** — pre-rendered screenshots of each variant
- **One-click variant switch** — changes visual style without losing content
- **Style tokens propagation** — when user picks "Flash Sale" theme, all section variants auto-update their colors

```typescript
// Variant picker component
<VariantPicker
  sectionType="hero"
  currentVariant="default"
  onSelect={(variant) => updateSection({ variant })}
/>
// Shows 4-6 visual thumbnails for each variant
```

---

### PHASE 4 — Genie Mode 2.0 (Week 4)
**Goal:** World-class AI-powered page generation (Wix ADI-level)

#### Current Quick Builder issues:
- Generates page skeleton but sections have placeholder content
- No actual product data integration
- AI doesn't write real copy

#### Build Genie Mode 2.0:
```
Step 1: What are you selling? (connect to product OR type manually)
Step 2: Who are you selling to? (audience selector)
Step 3: What's your main goal? (direct order / WhatsApp lead / email collect)
Step 4: Pick a visual style (6 theme presets with live thumbnail)
Step 5: AI generates COMPLETE page with:
        - Real headline from product name/description
        - Real benefits from product features
        - Real FAQ from product details
        - Real CTA text based on goal
        - Correctly ordered sections based on goal
```

#### AI Prompting Strategy:
```typescript
// For each section, generate real content using Workers AI
const heroContent = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  prompt: `Generate a compelling hero section for a Bangladesh e-commerce landing page.
  Product: ${product.name}
  Description: ${product.description}
  Goal: ${intent.goal}
  Audience: ${intent.audience}
  Language: Bengali/Banglish
  
  Return JSON: { headline, subheadline, ctaText, badge }`
});
```

---

### PHASE 5 — Template Gallery (Week 4-5)
**Goal:** Unbounce-quality template gallery with real previews

#### Build:
- **20+ pre-built templates** organized by industry (Fashion, Food, Tech, Health etc.)
- **Real screenshot thumbnails** (generated at build time or via Puppeteer)
- **Conversion score label** on each template ("High converter for fashion")
- **One-click apply** — template applies to current page, keeps product/store data
- **Filter by:** Industry, Goal (Sales/Leads), Style (Minimal/Bold/Dark)

#### Template Data Structure:
```typescript
interface PageTemplate {
  id: string;
  name: string;
  industry: 'fashion' | 'food' | 'tech' | 'health' | 'general';
  goal: 'direct_sales' | 'lead_gen' | 'whatsapp';
  style: 'minimal' | 'bold' | 'dark' | 'colorful';
  conversionTier: 'high' | 'medium' | 'standard';
  thumbnail: string; // R2 URL
  sections: SectionType[]; // Section order
  defaultContent: Record<SectionType, Record<string, unknown>>; // Pre-filled content
}
```

---

### PHASE 6 — Analytics + Conversion Intelligence (Week 5-6)
**Goal:** Leadpages-style conversion coaching

#### Build:
- **Page-level analytics dashboard:**
  - Views, Orders, Conversion Rate per page
  - Traffic source breakdown (FB, TikTok, Organic)
  - Revenue generated per landing page

- **Section-level analytics:**
  - Click tracking on CTA buttons
  - Scroll depth (how far users scroll)
  - "Rage click" detection

- **AI Conversion Coach:**
  - Analyzes current page structure
  - Suggests: "Add a guarantee section after testimonials — this increases conversion by 18%"
  - "Your hero CTA button text is weak. Try 'এখনই অর্ডার করুন' instead of 'Buy'"

#### Implementation:
```typescript
// Track events via existing api.track-events.ts
// Store in D1: page_analytics table
// Dashboard: /app/page-builder/:pageId/analytics
```

---

### PHASE 7 — Performance & Publishing (Week 6)
**Goal:** Carrd-level instant publishing with sub-100ms TTFB

#### Current Problem:
Landing pages load slowly because they're SSR'd through Remix on each request.

#### Build:
- **Static HTML generation on publish** — When merchant publishes, generate static HTML and store in KV
- **Edge-cached serving** — Serve from KV, not D1 query on every visit
- **Critical CSS inlining** — Inline above-the-fold CSS into HTML
- **Image optimization** — Auto-compress on upload, serve via R2 with width/quality params

```typescript
// On publish:
async function publishPage(pageId: string, storeId: number, env: Env) {
  // 1. Fetch all sections from D1
  const sections = await getSections(pageId);
  
  // 2. Render to static HTML via React renderToString
  const html = renderToString(<LandingPage sections={sections} />);
  
  // 3. Store in KV with 5-min TTL
  await env.KV.put(`page:${storeId}:${pageId}`, html, { expirationTtl: 300 });
  
  // 4. Update publishedPropsJson for all sections
  await publishSections(pageId);
}
```

---

## 📦 FINAL TECH STACK DECISION

| Layer | Technology | Why |
|-------|-----------|-----|
| **Editor Framework** | Remix (existing) | Already set up, SSR |
| **Drag & Drop** | `@dnd-kit/sortable` | Best accessibility, lightweight |
| **Form Generation** | `react-hook-form` + auto from Zod | Schema-driven settings panel |
| **Live Preview** | iframe + postMessage | Clean separation, actual React render |
| **AI Generation** | Workers AI (Llama 3.1) | Already configured in wrangler.toml |
| **Storage** | D1 (builder_pages + builder_sections) | Already correct schema |
| **Media** | R2 (existing) | Image uploads |
| **Cache** | KV (published pages) | Sub-100ms serve |
| **Analytics** | D1 events table | Track clicks/scroll |
| **Sections** | Custom React components | Clean output, no GrapesJS |

---

## 🔢 PRIORITY ORDER (What to Build First)

```
P0 — Must have before any new features:
  [ ] Consolidate DB (one table, not two)
  [ ] Retire GrapesJS editor
  [ ] Make new-builder the default entry point

P1 — Core editor (makes it usable):
  [ ] 3-panel editor layout (sidebar + preview + settings)
  [ ] Live preview iframe
  [ ] Drag-to-reorder sections
  [ ] Auto-generated settings panel from Zod schema
  [ ] Mobile/desktop preview toggle

P2 — Makes it world-class:
  [ ] Section variant picker with thumbnails
  [ ] Genie Mode 2.0 with real AI content generation
  [ ] Template gallery with screenshots + conversion tiers
  [ ] Static HTML publishing with KV caching

P3 — Makes it sticky:
  [ ] Page analytics dashboard
  [ ] AI conversion coach
  [ ] A/B testing (two versions of a page)
  [ ] Section-level heatmap
```

---

## ⚠️ THINGS TO AVOID (Lessons from Current Mess)

1. **Don't run two parallel systems** — one builder, one DB schema, one truth
2. **Don't use GrapesJS** for core editing — it's uncontrollable and heavy
3. **Don't build features before fixing foundation** — P0 first
4. **Don't skip the preview iframe** — editing blind causes bad UX
5. **Don't hardcode section content** — everything must come from Zod schema defaults
6. **Don't skip mobile optimization** — 90% of BD traffic is mobile
7. **Don't over-engineer AI** — start with simple prompt → JSON → populate fields

---

## 📋 IMMEDIATE NEXT ACTIONS

**This week (P0 blockers):**
1. Decide: Fully retire GrapesJS now or keep for power users?
2. Write DB migration: `landingPages` → `builderPages`
3. Make `/app/new-builder` the default entry from page-builder dashboard
4. Test existing section components render correctly in new editor

**Boss Decisions (2026-02-24):**
- [x] GrapesJS → Keep as "Pro Mode" for power users (not default)
- [x] Templates → Launch with 6 templates
- [x] Genie Mode 2.0 → AI generates Bengali copy
- [x] Analytics → Custom built in D1

---

*Session completed: 2026-02-24*  
*Next step: Get Boss approval → Start Phase 1 implementation*
