# MVP System Implementation - Complete Documentation

> **Project**: Multi Store SaaS - The Shopify of Bangladesh  
> **Date**: February 2026  
> **Status**: MVP System Active, Shopify OS 2.0 Frozen  
> **Last Updated**: 2026-02-01

---

## 📋 Executive Summary

This document provides complete technical documentation of the MVP Simple Theme System implementation, including how the previous Shopify OS 2.0 system was disabled and how to re-enable it in the future.

### Current State

- **Active System**: MVP Simple Theme System (Legacy React Components)
- **Disabled System**: Shopify OS 2.0 (Section-based Templates)
- **Storefront Routes**: 6 routes fully converted to MVP
- **Admin Dashboard**: New unified settings page with 5 tabs
- **Themes**: 5 MVP themes active (starter-store, ghorer-bazar, luxe-boutique, nova-lux, tech-modern)

---

## 🏗️ Architecture Overview

### Current MVP System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVP SIMPLE THEME SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Database   │──────│  MVP Config  │──────│   Templates  │  │
│  │   (D1)       │      │  (5 settings)│      │  (React      │  │
│  │              │      │              │      │   Components)│  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                       │                       │       │
│         └───────────────────────┼───────────────────────┘       │
│                                 ▼                                │
│                    ┌─────────────────────┐                      │
│                    │   StorePageWrapper  │                      │
│                    │   (Layout + Header  │                      │
│                    │    + Footer)        │                      │
│                    └─────────────────────┘                      │
│                                 │                                │
│                    ┌────────────┴────────────┐                  │
│                    ▼                         ▼                  │
│           ┌─────────────────┐   ┌─────────────────┐            │
│           │  Template.Home  │   │  Template.Page  │            │
│           │  Template.Product│   │  Template.Cart  │            │
│           └─────────────────┘   └─────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Frozen Shopify OS 2.0 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   SHOPIFY OS 2.0 (FROZEN)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Database   │──────│  Templates   │──────│   Sections   │  │
│  │   Sections   │      │   (JSON      │      │   (React     │  │
│  │   Table      │      │    Schema)   │      │   Components)│  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                       │                       │       │
│         └───────────────────────┼───────────────────────┘       │
│                                 ▼                                │
│                    ┌─────────────────────┐                      │
│                    │  ThemeStoreRenderer │     ⚠️ NOT IMPORTED  │
│                    │  (Section Registry) │         IN ROUTES    │
│                    └─────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

### MVP System Files (ACTIVE)

```
apps/web/app/
├── routes/                           # All storefront routes use MVP
│   ├── _index.tsx                    # Homepage - uses template.component
│   ├── products.$id.tsx              # Product page - uses template.ProductPage
│   ├── cart.tsx                      # Cart page - uses template.CartPage
│   ├── collections.$slug.tsx         # Collection page - uses template.CollectionPage
│   ├── pages.$slug.tsx               # Custom pages - SimplePage fallback
│   ├── search.tsx                    # Search page - SimpleSearchPage fallback
│   └── app.store.settings._index.tsx # Unified settings (5 tabs)
│
├── config/
│   └── mvp-theme-settings.ts         # MVP settings schema & defaults
│
├── services/
│   └── mvp-settings.server.ts        # CRUD operations for MVP settings
│
├── templates/
│   └── store-registry.ts             # All 15 templates (5 MVP + 10 others)
│
├── components/
│   └── store-layouts/
│       └── StorePageWrapper.tsx      # Layout wrapper (Header + Footer)
│
└── routes/
    └── onboarding.tsx                # 4-step onboarding with delivery settings
```

### Frozen Shopify OS 2.0 Files (NOT IMPORTED)

```
apps/web/app/
├── components/
│   └── store/
│       └── ThemeStoreRenderer.tsx    # ⚠️ FROZEN - Not imported in routes
│
├── lib/
│   ├── theme-engine/
│   │   ├── ThemeBridge.ts            # ⚠️ FROZEN
│   │   ├── db-integration.ts         # ⚠️ FROZEN
│   │   └── utils/
│   │       └── page-renderer.tsx     # ⚠️ FROZEN
│   │
│   └── template-resolver.server.ts   # ⚠️ FROZEN - Not imported
│
├── themes/                           # ⚠️ FROZEN - Section-based themes
│   ├── starter-store/sections/       # Still exist but not used
│   ├── luxe-boutique/sections/       # Still exist but not used
│   └── ... (all theme sections)
│
└── components/
    └── store-builder/
        └── LiveEditorV2.client.tsx   # ⚠️ FROZEN - Visual editor not used
```

---

## 🔧 How Shopify OS 2.0 Was Disabled

### Step 1: Removed Imports from Routes

**Before (Shopify OS 2.0):**

```typescript
// In products.$id.tsx, cart.tsx, etc.
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { resolveTemplate } from '~/lib/template-resolver.server';
```

**After (MVP System):**

```typescript
// Removed ThemeStoreRenderer import
// Removed resolveTemplate import
// Added MVP imports instead
import { getStoreTemplate } from '~/templates/store-registry';
import { getMVPSettings } from '~/services/mvp-settings.server';
```

### Step 2: Replaced Template Resolution Logic

**Before (Shopify OS 2.0):**

```typescript
// In loader functions
const template = await resolveTemplate(env.DB, storeId, 'product');
const homeTemplate = await resolveTemplate(env.DB, storeId, 'home');

return json({ template, homeTemplate, ... });
```

**After (MVP System):**

```typescript
// In loader functions - NO template resolution
const mvpSettings = await getMVPSettings(db, storeId, storeTemplateId);
const template = getStoreTemplate(storeTemplateId);

return json({ mvpSettings, template, ... });
```

### Step 3: Replaced Rendering Logic

**Before (Shopify OS 2.0):**

```typescript
// In component
if (template?.sections) {
  return (
    <ThemeStoreRenderer
      themeId={storeTemplateId}
      sections={template.sections}
      store={store}
      pageType="product"
      product={product}
    />
  );
}
```

**After (MVP System):**

```typescript
// In component - Direct template component
const template = getStoreTemplate(storeTemplateId);
return (
  <StorePageWrapper ...>
    <template.ProductPage
      product={product}
      theme={mergedTheme}
      storeName={mvpSettings.storeName}
    />
  </StorePageWrapper>
);
```

### Step 4: CSS Variables Instead of Section Props

**Before (Shopify OS 2.0):**

```typescript
// Sections received props
<HeaderSection settings={{ primaryColor: '#4F46E5' }} />
```

**After (MVP System):**

```typescript
// CSS variables injected globally
<style dangerouslySetInnerHTML={{
  __html: `
    :root {
      --color-primary: ${theme.primary};
      --color-accent: ${theme.accent};
    }
  `
}} />
```

---

## 🚀 How to Re-enable Shopify OS 2.0 (Future Development)

### Phase 1: Restore Template Resolution (Week 1)

#### 1.1 Re-enable Imports

Add back to all storefront routes:

```typescript
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { resolveTemplate } from '~/lib/template-resolver.server';
```

#### 1.2 Restore Template Resolution in Loaders

Update loader functions in all 6 routes:

```typescript
export async function loader({ params, context }: LoaderFunctionArgs) {
  // ... existing code ...

  // Add back template resolution
  let template = null;
  let homeTemplate = null;
  try {
    template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'product');
    if (!template || !template.sections || template.sections.length === 0) {
      homeTemplate = await resolveTemplate(context.cloudflare.env.DB, storeId, 'home');
    }
  } catch (templateError) {
    console.error('Template resolution failed:', templateError);
  }

  return json({
    // ... existing data ...
    template,
    homeTemplate,
  });
}
```

### Phase 2: Create Hybrid Rendering (Week 2)

#### 2.1 Implement Conditional Rendering Logic

Create a hybrid system that checks for sections:

```typescript
export default function ProductPage() {
  const { template, homeTemplate, mvpSettings, ... } = useLoaderData();

  // Check if Shopify sections exist
  const hasShopifySections = template?.sections && template.sections.length > 0;

  if (hasShopifySections) {
    // Use Shopify OS 2.0
    return (
      <ThemeStoreRenderer
        themeId={storeTemplateId}
        sections={template.sections}
        store={store}
        pageType="product"
        product={product}
      />
    );
  }

  // Fallback to MVP system
  const template = getStoreTemplate(storeTemplateId);
  return (
    <StorePageWrapper ...>
      <template.ProductPage ... />
    </StorePageWrapper>
  );
}
```

#### 2.2 Create Database Migration

Add sections table for Shopify OS 2.0:

```sql
CREATE TABLE IF NOT EXISTS store_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  page_type TEXT NOT NULL, -- 'home', 'product', 'cart', etc.
  sections_json TEXT NOT NULL, -- JSON array of sections
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX idx_store_sections_store ON store_sections(store_id);
CREATE INDEX idx_store_sections_page ON store_sections(page_type);
```

### Phase 3: Enable Visual Editor (Week 3-4)

#### 3.1 Restore LiveEditorV2

Re-enable the visual editor in admin:

```typescript
// In admin routes
import { LiveEditorV2 } from '~/components/store-builder/LiveEditorV2.client';

export default function ThemeEditorPage() {
  return (
    <LiveEditorV2
      storeId={storeId}
      themeId={currentThemeId}
      onSave={handleSaveSections}
    />
  );
}
```

#### 3.2 Add Section Registry

Ensure all sections are registered:

```typescript
// In ThemeBridge.ts or section registry
const SECTION_REGISTRY = {
  header: HeaderSection,
  'hero-banner': HeroBannerSection,
  'product-grid': ProductGridSection,
  footer: FooterSection,
  // ... all sections
};
```

### Phase 4: Migration Strategy (Week 5-6)

#### 4.1 Gradual Rollout

1. **Phase A**: Enable Shopify OS 2.0 for specific stores (feature flag)
2. **Phase B**: Auto-convert MVP templates to Shopify sections
3. **Phase C**: Full migration with data preservation

#### 4.2 Data Preservation

MVP settings map to Shopify sections:

```typescript
const convertMVPToShopify = (mvpSettings: MVPSettingsWithTheme) => {
  return {
    sections: [
      {
        type: 'header',
        settings: {
          logo: mvpSettings.logo,
          storeName: mvpSettings.storeName,
        },
      },
      {
        type: 'announcement-bar',
        settings: {
          show: mvpSettings.showAnnouncement,
          text: mvpSettings.announcementText,
        },
      },
      // ... map all MVP settings
    ],
  };
};
```

---

## 📊 Database Schema Comparison

### MVP System Schema (Current)

```sql
-- stores table (existing)
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  themeConfig TEXT, -- JSON: { storeTemplateId: 'starter-store' }
  -- ... other fields
);

-- store_mvp_settings table (current)
CREATE TABLE store_mvp_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  settings_json TEXT, -- JSON: { storeName, logo, primaryColor, accentColor, showAnnouncement, announcementText }
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
```

### Shopify OS 2.0 Schema (Future)

```sql
-- store_templates table (future)
CREATE TABLE store_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  template_id TEXT NOT NULL, -- 'luxe-boutique', 'starter-store'
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- store_sections table (future)
CREATE TABLE store_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  page_type TEXT NOT NULL, -- 'home', 'product', 'cart', 'collection'
  sections_json TEXT NOT NULL, -- Complex JSON with sections, blocks, settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- section_presets table (future - for reusable sections)
CREATE TABLE section_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_type TEXT NOT NULL,
  name TEXT NOT NULL,
  default_settings_json TEXT,
  schema_json TEXT -- Shopify OS 2.0 schema format
);
```

---

## 🎯 Migration Checklist (For Future Development)

### Pre-Migration

- [ ] Backup all MVP settings
- [ ] Create Shopify sections database tables
- [ ] Test ThemeStoreRenderer in staging
- [ ] Prepare visual editor (LiveEditorV2)

### Migration Phase

- [ ] Implement hybrid rendering (MVP + Shopify)
- [ ] Convert MVP templates to Shopify sections
- [ ] Migrate MVP settings to section settings
- [ ] Test all 5 themes in Shopify format
- [ ] Enable for beta stores

### Post-Migration

- [ ] Remove MVP fallback code
- [ ] Archive MVP-specific files
- [ ] Update documentation
- [ ] Train support team on new system

---

## 📝 Key Design Decisions

### Why MVP System Was Chosen

1. **Simplicity**: Single database query vs multiple section queries
2. **Consistency**: Same header/footer across all pages (no template fallback hell)
3. **Performance**: No section resolution overhead
4. **Reliability**: React components vs dynamic section rendering
5. **Speed to Market**: 2 weeks vs 2 months implementation

### Trade-offs

**MVP System:**

- ✅ Fast development
- ✅ Consistent UX
- ✅ Easy to maintain
- ❌ Limited customization (5 settings only)
- ❌ No visual editor
- ❌ No drag-drop sections

**Shopify OS 2.0:**

- ✅ Drag-drop visual editor
- ✅ Per-section customization
- ✅ Block-based layout
- ❌ Complex database queries
- ❌ Higher learning curve
- ❌ Slower initial load (section resolution)

---

## 🔗 Reference Links

### Context7 Documentation

- Remix Error Boundaries: `/websites/v2_remix_run` - error-boundary
- Remix Streaming: `/websites/v2_remix_run` - streaming
- Remix Defer: `/websites/v2_remix_run` - defer

### Internal Documentation

- AGENTS.md - MVP Simple Theme System section
- store-registry.ts - Template definitions
- mvp-theme-settings.ts - Settings schema

### File Locations

- Unified Settings: `apps/web/app/routes/app.store.settings._index.tsx`
- MVP Service: `apps/web/app/services/mvp-settings.server.ts`
- Frozen Shopify: `apps/web/app/components/store/ThemeStoreRenderer.tsx`

---

## 👥 Contact & Maintenance

**Original Implementation**: February 2026  
**Team**: Ozzyl Development Team  
**Status**: Production Ready (MVP), Shopify OS 2.0 Frozen

**Future Shopify OS 2.0 Development**:

- Estimated Effort: 4-6 weeks
- Priority: Medium (post-MVP launch)
- Dependencies: Visual editor completion, section library

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-01  
**Next Review**: When planning Shopify OS 2.0 re-enablement
