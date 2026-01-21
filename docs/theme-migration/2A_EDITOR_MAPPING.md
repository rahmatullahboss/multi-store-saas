# Phase 2A: Editor Mapping — Store Live Editor Architecture

**Purpose:** Document the actual store-live-editor.tsx architecture and SECTION_REGISTRY integration.

---

## CRITICAL CLARIFICATIONS

1. **GrapesJS is NOT used for store themes** — only for `apps/page-builder/` (landing page builder)
2. **Store theme editor** = `store-live-editor.tsx` (Elementor-style split pane)
3. **SECTION_REGISTRY already exists** at `app/components/store-sections/registry.ts`
4. No new components need to be proposed — they exist in the registry

---

## Store Live Editor Architecture

**Route:** `/store-live-editor` (standalone, no sidebar)

**Layout:**
- **Left Panel:** Accordion-style control sections
- **Right Panel:** Full-size iframe preview (postMessage communication)

**Features:**
- Split-pane Elementor-style UI
- Drag-drop section reordering (dnd-kit)
- Section settings editor with dynamic form fields
- Theme color/typography controls
- Saves to `stores.themeConfig` (needs migration to draft tables)

---

## Current Editor Components

### Main Editor Component
**File:** `app/routes/store-live-editor.tsx`

**Key Responsibilities:**
- Load store theme config from `stores.themeConfig`
- Render left accordion panel with controls
- Render right iframe for preview
- Handle postMessage between editor + preview
- Persist changes back to database

**Current Sections State:**
```typescript
const [homeSections, setHomeSections] = useState<StoreSection[]>(
  (themeConfig as any).sections || DEFAULT_SECTIONS
);
```

### Sortable Section List (dnd-kit)
**Component:** `SortableSectionItem` (lines 41–67)

**Features:**
- Drag handle with visual feedback
- Delete button
- Selection highlight
- Icon from SECTION_REGISTRY

---

## SECTION_REGISTRY Structure

**File:** `app/components/store-sections/registry.ts`

**Entry Example:**
```typescript
{
  id: 'hero',
  name: 'Hero Section',
  icon: 'Layout',
  description: 'Hero banner with image + CTA',
  defaultConfig: { title: '', image: '', ctaText: 'Shop Now' },
  fields: [
    { name: 'title', label: 'Headline', type: 'text' },
    { name: 'image', label: 'Background Image', type: 'image' }
  ]
}
```

**Available Sections:**
- HeroSection, ProductGridSection, FeaturesSection
- FAQSection, NewsletterSection, RichTextSection
- And many others (see registry.ts for full list)

---

## Editor State Management

**State Variables in Editor:**
```typescript
const [homeSections, setHomeSections] = useState<StoreSection[]>(...);
const [selectedSectionId, setSelectedSectionId] = useState('');
const [primaryColor, setPrimaryColor] = useState(...);
const [typography, setTypography] = useState<TypographySettings>(...);
```

**Section Operations:**
- `addSection(type)` — Create new section with default config
- `updateSection(id, settings)` — Update section settings
- `deleteSection(id)` — Remove section
- `reorderSections(from, to)` — Drag-drop reorder (dnd-kit)

---

## Data Flow: Edit → Preview → Save

```
1. User edits in Left Accordion Panel
   ↓ onChange updates local state
2. SectionForm generates fields from SECTION_REGISTRY[type].fields
   ↓ User changes value
3. postMessage → iframe preview
   ↓ Preview iframe re-renders section
4. User clicks "Save"
   ↓ Validation against schema
5. POST → action handler
   ↓ Persists to stores.themeConfig (currently)
6. Should migrate → draft tables (Phase 2B)
```

---

## FormField Types in Registry

```typescript
type: 'text' | 'number' | 'select' | 'color' | 'image' | 'toggle'
```

**Dynamic Form Generator:**
- Reads `fields` array from SECTION_REGISTRY entry
- Auto-generates form inputs based on field types
- Binds to `section.settings[fieldName]`

---

## PostMessage Pattern (Editor ↔ Preview)

**Editor → Preview (update preview):**
```typescript
iframe.contentWindow.postMessage({
  type: 'update_section',
  sectionId: id,
  config: newConfig
}, '*');
```

**Preview → Editor (section selected):**
```typescript
window.parent.postMessage({
  type: 'section_selected',
  sectionId: id
}, '*');
```

---

## Migration Tasks (Phase 2)

1. **Rename storage:** Move theme config from `stores.themeConfig` → draft tables
2. **Add versioning:** Draft → Preview → Published states
3. **Preserve registry:** SECTION_REGISTRY is stable; no refactoring needed
4. **Update action handler:** Persist to new draft schema instead of stores table

---

## Next Steps

- See [Phase 2B: Data Transformation](THEME_MIGRATION_2B_DATA_TRANSFORM.md)
- See [SECTION_REGISTRY](../app/components/store-sections/registry.ts) for full definitions
