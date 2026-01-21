# Schema Validation Technical Specification

## Implementation Status: COMPLETED ✅

**Files:**
- `app/lib/section-schemas.ts` - 9 section Zod schemas
- `app/lib/block-registry.ts` - Block Zod schemas
- `app/lib/theme-validation.ts` - Unified validation
- `app/routes/store-live-editor.tsx` - Validation on publish

**Features:**
- Zod validation for all section types
- Block settings validation
- Theme settings validation
- Validation on publish action
- Field-level error messages

## Overview
Zod-based validation for section and block settings in the Store Live Editor.
Follows Shopify's setting types pattern adapted for React/TypeScript.

## Shopify Setting Types (Supported)
```typescript
// Input settings (like Shopify)
type SettingType = 
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'richtext'       // HTML content
  | 'image_picker'   // Image URL
  | 'url'            // Link URL
  | 'checkbox'       // Boolean toggle
  | 'number'         // Numeric input
  | 'range'          // Slider (min/max)
  | 'select'         // Dropdown
  | 'radio'          // Radio buttons
  | 'color'          // Color picker
  | 'font_picker'    // Font selection
  | 'collection'     // Collection reference
  | 'product'        // Product reference
  | 'header'         // UI grouping (no value)
  | 'paragraph';     // Help text (no value)
```

## Setting Definition Schema
```typescript
interface SettingDefinition {
  type: SettingType;
  id: string;
  label: string;
  default?: unknown;
  info?: string;        // Help text
  placeholder?: string;
  // Type-specific options
  min?: number;         // For number/range
  max?: number;         // For number/range
  step?: number;        // For range
  unit?: string;        // For number (e.g., 'px')
  options?: Array<{ value: string; label: string }>;  // For select/radio
}
```

## Zod Schema Structure
```typescript
import { z } from 'zod';

// Reusable validators matching Shopify types
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/i).or(z.literal(''));
const urlSchema = z.string().url().or(z.literal(''));
const imageSchema = z.string().url().or(z.literal(''));

// Hero Section Schema Example
const HeroSectionSchema = z.object({
  heading: z.string().max(100).default('Welcome'),
  subheading: z.string().max(200).default(''),
  buttonText: z.string().max(30).default('Shop Now'),
  buttonLink: urlSchema.default(''),
  backgroundImage: imageSchema.default(''),
  textColor: colorSchema.default('#ffffff'),
  overlayOpacity: z.number().min(0).max(100).default(50),
  textAlignment: z.enum(['left', 'center', 'right']).default('center'),
});

// Slideshow Section with Blocks
const SlideshowSectionSchema = z.object({
  title: z.string().max(100).default('Slideshow'),
  autoplay: z.boolean().default(true),
  interval: z.number().min(1).max(10).default(5),
});

const SlideBlockSchema = z.object({
  image: imageSchema,
  heading: z.string().max(100).default(''),
  link: urlSchema.default(''),
});
```

## Registry Integration
```typescript
const SECTION_REGISTRY = {
  'hero': {
    component: HeroSection,
    schema: HeroSectionSchema,
    defaultSettings: HeroSectionSchema.parse({}),
    blocks: [],
  },
  'slideshow': {
    component: SlideshowSection,
    schema: SlideshowSectionSchema,
    defaultSettings: SlideshowSectionSchema.parse({}),
    blocks: [{
      type: 'slide',
      schema: SlideBlockSchema,
      defaultSettings: SlideBlockSchema.parse({}),
    }],
    max_blocks: 10,
  }
};
```

## Validation Points
1. **Editor save (draft)** - Validate before saving to D1
2. **Publish action** - Validate before copying to published tables
3. **API endpoints** - Server-side Zod validation on all inputs

## Error Handling
```typescript
// Validation result structure
interface ValidationResult {
  success: boolean;
  errors?: Array<{
    path: string;      // e.g., 'heading' or 'blocks.0.image'
    message: string;   // User-friendly error
  }>;
  data?: unknown;      // Validated data if success
}

// Usage in editor
const result = validateSection(sectionType, settings, blocks);
if (!result.success) {
  showFieldErrors(result.errors);  // Highlight invalid fields
  return;
}
```

## Implementation Files
- `app/lib/section-schemas.ts` (NEW) - All section/block Zod schemas
- `app/lib/setting-validators.ts` (NEW) - Reusable validators
- `app/components/store-sections/registry.ts` - Add schema property
- `app/routes/store-live-editor.tsx` - Validation on save/publish
