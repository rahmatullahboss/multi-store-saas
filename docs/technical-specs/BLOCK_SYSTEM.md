# Block System Technical Specification

## Implementation Status: COMPLETED ✅

**Files:**
- `app/lib/block-registry.ts` - Block definitions + Zod schemas
- `app/lib/theme-validation.ts` - Validation helpers
- `app/routes/store-live-editor.tsx` - Block Editor UI
- `app/components/store-sections/BlockRenderer.tsx` - Block rendering

**9 Block Types Implemented:**
button, text, image, slide, feature, testimonial, faq, product, collection

---

## Overview
Blocks are reusable content modules inside sections (like Shopify OS 2.0).
Each section can contain multiple blocks that merchants can add, remove, and reorder.

## Data Structure (Shopify-aligned)
```typescript
interface Block {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

interface Section {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  blocks: Block[];
}
```

## Block Definition Schema (Shopify-style)
```typescript
interface BlockDefinition {
  type: string;           // Unique identifier
  name: string;           // Display name in editor
  limit?: number;         // Max instances of this block type per section
  settings: SettingDefinition[];  // Block-level settings
}

// Example: Slide block for Slideshow section
const SlideBlock: BlockDefinition = {
  type: 'slide',
  name: 'Slide',
  limit: 10,
  settings: [
    { type: 'image_picker', id: 'image', label: 'Image' },
    { type: 'text', id: 'heading', label: 'Heading', default: '' },
    { type: 'url', id: 'link', label: 'Link' },
  ]
};
```

## Section Schema with Blocks
```typescript
interface SectionDefinition {
  type: string;
  name: string;
  max_blocks?: number;    // Total blocks allowed
  settings: SettingDefinition[];
  blocks: BlockDefinition[];
  presets?: SectionPreset[];  // Pre-configured variants
}

// Example: Slideshow section (matches Shopify pattern)
const SlideshowSection: SectionDefinition = {
  type: 'slideshow',
  name: 'Slideshow',
  max_blocks: 5,
  settings: [
    { type: 'text', id: 'title', label: 'Title', default: 'Slideshow' }
  ],
  blocks: [SlideBlock],
  presets: [{
    name: 'Default Slideshow',
    settings: { title: 'Featured' },
    blocks: [{ type: 'slide' }, { type: 'slide' }]
  }]
};
```

## Database
- Uses existing `blocksJson` column in `templateSectionsDraft/Published`
- Format: `JSON.stringify(blocks)` where blocks is `Block[]`

## Block Registry
```typescript
const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  'button': {
    type: 'button',
    name: 'Button',
    settings: [
      { type: 'text', id: 'text', label: 'Button Text', default: 'Click Me' },
      { type: 'url', id: 'link', label: 'Link' },
      { type: 'select', id: 'style', label: 'Style', options: ['primary', 'secondary'], default: 'primary' }
    ]
  },
  'text': {
    type: 'text',
    name: 'Text Block',
    settings: [
      { type: 'richtext', id: 'content', label: 'Content' }
    ]
  },
  'image': {
    type: 'image',
    name: 'Image',
    settings: [
      { type: 'image_picker', id: 'image', label: 'Image' },
      { type: 'text', id: 'alt', label: 'Alt Text' }
    ]
  },
  'slide': {
    type: 'slide',
    name: 'Slide',
    limit: 10,
    settings: [
      { type: 'image_picker', id: 'image', label: 'Slide Image' },
      { type: 'text', id: 'heading', label: 'Heading' },
      { type: 'textarea', id: 'description', label: 'Description' }
    ]
  }
};
```

## Editor UI Changes
1. **Block List Panel** - Show blocks inside selected section
2. **Add Block Button** - Dropdown with allowed block types
3. **Block Reordering** - Drag-drop blocks within section
4. **Block Settings** - Side panel for selected block
5. **Block Limit Indicator** - Show "3/5 blocks" count
6. **Remove Block** - Delete with confirmation

## Files to Modify
- `app/components/store-sections/registry.ts` - Add block definitions
- `app/routes/store-live-editor.tsx` - Block editor UI
- `app/lib/block-registry.ts` (NEW) - Centralized block definitions
- `db/schema_templates.ts` - Already has `blocksJson` column ✓
