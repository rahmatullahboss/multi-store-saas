# 🚀 Advanced Page Builder - Implementation Plan

> **Status**: Planning  
> **Priority**: Post-Launch Feature  
> **Estimated Duration**: 6-8 weeks  
> **Branch**: `feature/advanced-page-builder`

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Goals & Success Metrics](#goals--success-metrics)
3. [Architecture Overview](#architecture-overview)
4. [Phase 1: GrapesJS Integration](#phase-1-grapesjs-integration)
5. [Phase 2: Custom BD Blocks](#phase-2-custom-bd-blocks)
6. [Phase 3: Storage & Publishing](#phase-3-storage--publishing)
7. [Phase 4: AI Page Generator](#phase-4-ai-page-generator)
8. [Technical Specifications](#technical-specifications)
9. [Database Schema Changes](#database-schema-changes)
10. [API Endpoints](#api-endpoints)
11. [Testing Strategy](#testing-strategy)
12. [Risk Assessment](#risk-assessment)
13. [Timeline & Milestones](#timeline--milestones)
14. [Branch Strategy](#branch-strategy)

---

## Executive Summary

### What We're Building

A **ClickFunnels/Elementor-style page builder** for Bangladesh e-commerce merchants that allows:

1. **Visual Drag & Drop Editor** - GrapesJS-powered full page builder
2. **BD-Specific Components** - Order forms, bKash buttons, WhatsApp CTAs
3. **AI Page Generation** (Premium) - Describe page in Bangla, AI creates it

### Why This Matters

| Current State                              | Future State          |
| ------------------------------------------ | --------------------- |
| Fixed templates with limited customization | Full creative freedom |
| Tech-savvy users only                      | Anyone can build      |
| One-size-fits-all                          | Unique brand identity |
| No AI assistance                           | AI-powered creation   |

---

## Goals & Success Metrics

### Primary Goals

- [ ] Enable merchants to build custom landing pages without coding
- [ ] Reduce time-to-publish from hours to minutes
- [ ] Increase conversion rates through better designed pages
- [ ] Create premium tier for AI-powered page generation

### Success Metrics

| Metric                  | Target       | Measurement  |
| ----------------------- | ------------ | ------------ |
| Page creation time      | < 15 minutes | Analytics    |
| User satisfaction       | > 4.5/5      | Survey       |
| Premium tier conversion | > 10%        | Billing data |
| Pages created per user  | > 3          | Database     |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │   Page Builder   │    │   AI Chat UI     │    │  Template     │ │
│  │   (GrapesJS)     │    │   (Premium)      │    │  Gallery      │ │
│  └────────┬─────────┘    └────────┬─────────┘    └───────┬───────┘ │
│           │                       │                       │         │
└───────────┼───────────────────────┼───────────────────────┼─────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Remix)                             │
│                                                                       │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐│
│  │ /api/save-page   │    │ /api/ai-generate │    │ /api/templates  ││
│  │ /api/load-page   │    │ (Claude API)     │    │ /api/publish    ││
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬────────┘│
│           │                       │                       │          │
└───────────┼───────────────────────┼───────────────────────┼──────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        DATABASE (D1)                                  │
│                                                                       │
│  ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐│
│  │  landing_pages   │    │  page_templates  │    │  ai_generations ││
│  │  (JSON content)  │    │  (preset designs)│    │  (history)      ││
│  └──────────────────┘    └──────────────────┘    └─────────────────┘│
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      LIVE STORE (Public)                              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  Rendered Landing Page (HTML/CSS from JSON)                      ││
│  │  - SEO optimized                                                 ││
│  │  - Mobile responsive                                             ││
│  │  - Fast loading                                                  ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: GrapesJS Integration

**Duration**: Week 1-2

### Tasks

- [ ] Install GrapesJS and dependencies
- [ ] Create new route: `app/routes/app.page-builder.tsx`
- [ ] Embed GrapesJS canvas in React component
- [ ] Configure basic blocks (text, image, video, button)
- [ ] Set up device preview (Desktop, Tablet, Mobile)
- [ ] Style editor to match app theme
- [ ] Add basic undo/redo functionality

### Dependencies

```json
{
  "grapesjs": "^0.21.x",
  "grapesjs-blocks-basic": "^1.0.x",
  "grapesjs-preset-webpage": "^1.0.x",
  "grapesjs-plugin-forms": "^2.0.x"
}
```

### File Structure

```
app/
├── routes/
│   └── app.page-builder.tsx          # Main editor route
├── components/
│   └── page-builder/
│       ├── Editor.tsx                 # GrapesJS wrapper
│       ├── Toolbar.tsx                # Top toolbar
│       ├── BlocksPanel.tsx            # Left sidebar
│       └── StylePanel.tsx             # Right sidebar
└── lib/
    └── grapesjs/
        ├── config.ts                  # GrapesJS configuration
        └── plugins/                   # Custom plugins
```

### Deliverables

- [ ] Working GrapesJS editor at `/app/page-builder`
- [ ] Basic blocks available for drag & drop
- [ ] Preview in different device sizes
- [ ] Undo/redo working

---

## Phase 2: Custom BD Blocks

**Duration**: Week 3-4

### Custom Blocks to Create

| Block              | Description                        | Priority  |
| ------------------ | ---------------------------------- | --------- |
| `bd-order-form`    | Full order form with BD validation | 🔴 High   |
| `bd-hero`          | Hero section with urgency badge    | 🔴 High   |
| `bd-trust-badges`  | Trust badges (COD, Fast Delivery)  | 🔴 High   |
| `bd-whatsapp-cta`  | WhatsApp floating button           | 🔴 High   |
| `bd-countdown`     | Countdown timer                    | 🟡 Medium |
| `bd-testimonials`  | Review screenshots                 | 🟡 Medium |
| `bd-gallery`       | Product image gallery              | 🟡 Medium |
| `bd-faq`           | FAQ accordion                      | 🟡 Medium |
| `bd-delivery-info` | Dhaka/Outside info                 | 🟡 Medium |
| `bd-bkash-button`  | bKash payment button               | 🟢 Low    |
| `bd-video`         | YouTube/Facebook video             | 🟢 Low    |
| `bd-comparison`    | Before/After                       | 🟢 Low    |

### Block Component Structure

```typescript
// lib/grapesjs/plugins/bd-ecommerce/blocks/order-form.ts

export const orderFormBlock = {
  id: "bd-order-form",
  label: "অর্ডার ফর্ম",
  category: "BD E-commerce",
  media: "<svg>...</svg>",
  content: {
    type: "bd-order-form",
    components: [
      { type: "text", content: "নাম *" },
      { type: "input", attributes: { name: "customer_name", required: true } },
      { type: "text", content: "মোবাইল নম্বর *" },
      { type: "input", attributes: { name: "phone", type: "tel" } },
      // ...
    ],
    traits: [
      { type: "checkbox", name: "showQuantity", label: "Show Quantity" },
      { type: "checkbox", name: "showDivision", label: "Show Division" },
    ],
  },
};
```

### Section Templates (Pre-built)

| Template         | Sections Included                             |
| ---------------- | --------------------------------------------- |
| High-Converting  | Hero + Trust + Features + Order Form          |
| Product Showcase | Hero + Gallery + Video + Reviews + Order Form |
| Minimal          | Hero + Order Form + FAQ                       |
| Full Funnel      | All sections                                  |

### Deliverables

- [ ] 12+ custom BD-specific blocks
- [ ] 4+ pre-built section templates
- [ ] Block traits (settings) for customization
- [ ] Bangla labels for all blocks

---

## Phase 3: Storage & Publishing

**Duration**: Week 5-6

### Storage Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Editor    │────▶│  Save API   │────▶│  D1 (JSON)  │
│  (GrapesJS) │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Auto-save   │
                    │ (30 sec)    │
                    └─────────────┘
```

### API Endpoints

```typescript
// POST /api/page-builder/save
// Save draft page
{
  pageId: number,
  content: GrapesJSProjectData,
  status: 'draft' | 'published'
}

// GET /api/page-builder/load/:pageId
// Load page for editing
{
  pageId: number,
  content: GrapesJSProjectData,
  lastSaved: timestamp
}

// POST /api/page-builder/publish
// Publish page to live store
{
  pageId: number,
  slug?: string
}
```

### Publishing Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Publish   │────▶│  Generate   │────▶│  Store in   │
│   Button    │     │  HTML/CSS   │     │  CDN/D1     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Live at     │
                    │ store.com/  │
                    │ page-slug   │
                    └─────────────┘
```

### Deliverables

- [ ] Save/Load API working
- [ ] Auto-save every 30 seconds
- [ ] Version history (last 5 versions)
- [ ] Publish to live store
- [ ] Preview before publish
- [ ] SEO settings (title, description, OG image)

---

## Phase 4: AI Page Generator

**Duration**: Week 7-8 (Premium Feature)

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User: "আমি একটা skincare product এর landing page চাই।    │
│         ৩০% discount আছে। Testimonial দেখাতে চাই।"        │
│                                                             │
│                        │                                    │
│                        ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Claude AI processes request and generates:        │    │
│  │  - GrapesJS compatible JSON                        │    │
│  │  - Bangla copywriting                              │    │
│  │  - Optimized section order                         │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                    │
│                        ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  GrapesJS loads the AI-generated design            │    │
│  │                                                    │    │
│  │  User can:                                         │    │
│  │  ✓ Edit any element                               │    │
│  │  ✓ Change images                                  │    │
│  │  ✓ Adjust colors                                  │    │
│  │  ✓ Rearrange sections                             │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                    │
│                        ▼                                    │
│                   [ Publish ]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Prompt Engineering

```typescript
const SYSTEM_PROMPT = `
তুমি একজন Bangladesh e-commerce landing page expert।

তোমার কাজ হলো user-এর description থেকে high-converting landing page design করা।

Rules:
1. সব content বাংলায় লিখবে
2. Urgency এবং scarcity messaging use করবে
3. Trust badges include করবে (COD, Fast Delivery, Guarantee)
4. Mobile-first design করবে
5. GrapesJS compatible JSON format-এ output দেবে

Available blocks:
- bd-hero: Hero section
- bd-trust-badges: Trust indicators
- bd-features: Product features grid
- bd-testimonials: Customer reviews
- bd-gallery: Image gallery
- bd-faq: FAQ accordion
- bd-order-form: Order form (always include at end)
- bd-countdown: Urgency timer
- bd-whatsapp-cta: WhatsApp button
`;
```

### Pricing Tiers

| Tier       | AI Generations/Month | Price  |
| ---------- | -------------------- | ------ |
| Starter    | 0 (Manual only)      | ৳৫০০   |
| Pro        | 5 pages              | ৳১৫০০  |
| Business   | 20 pages             | ৳৩০০০  |
| Enterprise | Unlimited            | ৳৫০০০+ |

### Deliverables

- [ ] AI chat interface in editor
- [ ] Claude API integration
- [ ] Prompt engineering for BD e-commerce
- [ ] AI → GrapesJS JSON converter
- [ ] Usage tracking & limits
- [ ] Premium gating

---

## Database Schema Changes

### New Tables

```sql
-- Landing pages created with page builder
CREATE TABLE landing_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  slug TEXT,
  content TEXT NOT NULL,  -- GrapesJS JSON
  html TEXT,              -- Generated HTML (for fast serving)
  css TEXT,               -- Generated CSS
  status TEXT DEFAULT 'draft',  -- draft, published, archived
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

-- Page templates (pre-built)
CREATE TABLE page_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  thumbnail TEXT,
  content TEXT NOT NULL,  -- GrapesJS JSON
  is_premium INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI generation history
CREATE TABLE ai_generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  prompt TEXT NOT NULL,
  result TEXT,  -- Generated JSON
  status TEXT,  -- pending, success, failed
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page versions (for undo/history)
CREATE TABLE page_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES landing_pages(id),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Strategy

### Unit Tests

- [ ] Block rendering
- [ ] JSON serialization/deserialization
- [ ] API endpoint validation

### Integration Tests

- [ ] Save → Load → Edit cycle
- [ ] Publish flow
- [ ] AI generation → Editor load

### E2E Tests

- [ ] Full page creation flow
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

### Performance Tests

- [ ] Editor load time < 3s
- [ ] Auto-save latency < 500ms
- [ ] Published page load < 2s

---

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                   |
| ----------------------- | ---------- | ------ | ---------------------------- |
| GrapesJS learning curve | Medium     | Medium | Documentation, tutorials     |
| AI output quality       | Medium     | High   | Extensive prompt engineering |
| Performance issues      | Low        | High   | Lazy loading, caching        |
| Browser compatibility   | Low        | Medium | Polyfills, testing           |
| Storage costs           | Low        | Low    | Compression, cleanup jobs    |

---

## Timeline & Milestones

```
Week 1-2:  ████████░░░░░░░░░░░░░░░░  Phase 1: GrapesJS Setup
Week 3-4:  ░░░░░░░░████████░░░░░░░░  Phase 2: Custom Blocks
Week 5-6:  ░░░░░░░░░░░░░░░░████████  Phase 3: Storage & Publish
Week 7-8:  ░░░░░░░░░░░░░░░░░░░░░░██  Phase 4: AI Integration

Milestone 1 (Week 2): Basic editor working
Milestone 2 (Week 4): All BD blocks ready
Milestone 3 (Week 6): Full publish flow working
Milestone 4 (Week 8): AI feature complete
```

---

## Branch Strategy

### Recommendation: **Separate Feature Branch**

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     └── feature/advanced-page-builder  ◀── Work here
  │           │
  │           ├── grapes-integration
  │           ├── custom-blocks
  │           ├── storage-system
  │           └── ai-integration
  │
  └── release/v1.0 (first launch)
```

### Why Separate Branch?

| Reason               | Explanation                                       |
| -------------------- | ------------------------------------------------- |
| **Isolation**        | Big feature won't break existing functionality    |
| **Parallel work**    | Can work on bug fixes in main while building this |
| **Clean history**    | Feature can be squash-merged when ready           |
| **Rollback easy**    | If issues, just don't merge                       |
| **Post-launch safe** | Can continue development after launch             |

### Git Commands

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/advanced-page-builder

# Work on sub-features
git checkout -b grapes-integration
# ... work ...
git checkout feature/advanced-page-builder
git merge grapes-integration

# When ready to release
git checkout develop
git merge feature/advanced-page-builder
git checkout main
git merge develop
```

---

## Next Steps

1. **Immediate**: Create feature branch
2. **Week 1**: Start GrapesJS integration
3. **Weekly**: Progress reviews every Friday
4. **Post-launch**: Can continue in parallel with main app

---

## Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS GitHub](https://github.com/GrapesJS/grapesjs)
- [GrapesJS Plugins](https://github.com/GrapesJS)
- [Claude API Docs](https://docs.anthropic.com)

---

> **Last Updated**: 2026-01-10  
> **Author**: Development Team  
> **Status**: Ready for Implementation
