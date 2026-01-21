# Phase 2A: Editor Component Mapping

**Document Purpose:** Map legacy editor components to new registry-driven system.

---

## Editor Architecture (New)

### Component Hierarchy
```
Editor (GrapesJS Canvas)
  → TemplateEditor (wrapper)
    → ThemePanel (left sidebar)
      - Color picker
      - Font selector
      - Spacing controls
    → SectionList (canvas)
      - DragDrop sections
      - Add/remove sections
    → SectionEditor (right panel)
      - Section config form
      - Validation feedback
```

---

## Section Registry Components

### Registry Entry Template
```typescript
// app/lib/section-registry.ts

export type SectionDefinition = {
  // Identity
  id: string;                    // 'hero', 'product-grid'
  name: string;                  // "Hero Banner"
  category: 'header' | 'content' | 'footer' | 'sidebar';
  
  // Component & Schema
  component: React.ComponentType<any>;
  defaultConfig: object;
  schema: z.ZodSchema;           // Validation
  
  // Editor UI
  thumbnail?: string;            // Preview image
  description?: string;
  fields?: FormField[];          // Custom editor fields
};
```

### FormField Definition
```typescript
type FormField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'image' | 'toggle';
  validation?: string;           // Zod rule
  options?: { label, value }[];
  placeholder?: string;
};
```

---

## Current Editor Components → Registry

### Legacy Components to Map

| Component | Registry ID | Category | Status |
|-----------|------------|----------|--------|
| HeroSection.tsx | hero | header | New |
| ProductGrid.tsx | product-grid | content | New |
| ProductCarousel.tsx | product-carousel | content | New |
| TestimonialSection.tsx | testimonials | content | New |
| CTABanner.tsx | cta-banner | footer | New |
| NewsletterSignup.tsx | newsletter | footer | New |
| FAQSection.tsx | faq | content | New |
| VideoSection.tsx | video | content | New |
| CollectionGrid.tsx | collection-grid | content | New |

### Mapping Example: Hero Section

**Legacy:**
```typescript
// app/components/templates/sections/Hero.tsx
export function Hero({ title, image, ctaText, ctaLink }) {
  return (
    <div className="hero">
      <h1>{title}</h1>
      <img src={image} />
      <a href={ctaLink}>{ctaText}</a>
    </div>
  );
}
```

**New Registry Entry:**
```typescript
{
  id: 'hero',
  name: 'Hero Banner',
  category: 'header',
  component: Hero,
  defaultConfig: {
    title: 'Welcome',
    image: '',
    ctaText: 'Shop Now',
    ctaLink: '/'
  },
  schema: z.object({
    title: z.string().min(1),
    image: z.string().url(),
    ctaText: z.string(),
    ctaLink: z.string()
  }),
  fields: [
    {
      name: 'title',
      label: 'Headline',
      type: 'text',
      placeholder: 'Enter headline'
    },
    {
      name: 'image',
      label: 'Background Image',
      type: 'image'
    },
    {
      name: 'ctaText',
      label: 'Button Text',
      type: 'text'
    },
    {
      name: 'ctaLink',
      label: 'Button Link',
      type: 'text'
    }
  ]
}
```

---

## Editor UI Components (New)

### 1. SectionRegistry Display
```typescript
// app/components/editor/SectionLibrary.tsx
// Shows all available sections from registry
// Allows drag-drop to canvas

export function SectionLibrary() {
  const registry = useSectionRegistry();
  return (
    <div className="library">
      {Object.entries(registry).map(([id, def]) => (
        <SectionCard
          key={id}
          section={def}
          onDragStart={() => /* ... */}
        />
      ))}
    </div>
  );
}
```

### 2. Dynamic Form Generator
```typescript
// app/components/editor/SectionForm.tsx
// Auto-generates form from schema

export function SectionForm({ sectionDef, config, onChange }) {
  return (
    <Form>
      {sectionDef.fields.map(field => (
        <FormField
          key={field.name}
          field={field}
          value={config[field.name]}
          onChange={(val) => onChange(field.name, val)}
        />
      ))}
    </Form>
  );
}
```

### 3. Canvas Renderer
```typescript
// app/components/editor/CanvasRenderer.tsx
// Renders sections from registry

export function CanvasRenderer({ sections, theme }) {
  return (
    <div className="canvas">
      {sections.map(section => {
        const def = SECTION_REGISTRY[section.type];
        return (
          <div key={section.id} className="section-wrapper">
            <def.component {...section.config} theme={theme} />
          </div>
        );
      })}
    </div>
  );
}
```

---

## Theme Panel Components (New)

### Color Picker
```typescript
export function ColorEditor({ theme, onChange }) {
  return (
    <div className="color-editor">
      {Object.entries(theme.colors).map(([key, value]) => (
        <ColorInput
          label={key}
          value={value}
          onChange={(color) => onChange('colors', key, color)}
        />
      ))}
    </div>
  );
}
```

### Typography Editor
```typescript
export function TypographyEditor({ theme, onChange }) {
  return (
    <div className="typography-editor">
      <SelectInput
        label="Font Family"
        value={theme.typography.fontFamily}
        options={FONT_OPTIONS}
        onChange={(font) => onChange('typography', 'fontFamily', font)}
      />
      {/* Heading size, body size, etc. */}
    </div>
  );
}
```

---

## Editor State Management

### State Structure
```typescript
type EditorState = {
  templateId: string;
  template: TemplateData;
  sections: SectionConfig[];
  theme: ThemeConfig;
  activeSection?: string;
  isDirty: boolean;
  errors: ValidationError[];
};
```

### Store Integration (Zustand/Jotai)
```typescript
export const useEditorStore = create((set) => ({
  state: initialState,
  
  updateSection: (id, config) => set((state) => ({
    sections: state.sections.map(s =>
      s.id === id ? { ...s, ...config } : s
    ),
    isDirty: true
  })),
  
  updateTheme: (themeUpdate) => set((state) => ({
    theme: { ...state.theme, ...themeUpdate },
    isDirty: true
  })),
  
  addSection: (type, position) => set((state) => ({
    sections: insertAt(state.sections, position, {
      id: generateId(),
      type,
      config: SECTION_REGISTRY[type].defaultConfig
    }),
    isDirty: true
  }))
}));
```

---

## Data Flow: Editing to Save

```
1. User edits in SectionForm
   → onChange event
   
2. Store updates section config
   → EditorState.isDirty = true
   
3. CanvasRenderer re-renders with new config
   → User sees live preview
   
4. User clicks "Save Draft"
   → Validate all sections against schemas
   → POST /api/templates/:id/save
   → Server updates DB
   → EditorState.isDirty = false
```

---

## Migration Path for Existing Editors

### Option A: Keep Legacy + Run New in Parallel
- Pro: No disruption to current editing
- Con: Maintain two systems temporarily

### Option B: Migrate Existing Editors
- Pro: Single system immediately
- Con: Requires editor retraining

**Recommendation:** Option A for safety (2-week parallel period)

---

## Next Steps

1. Create section registry from existing components (2-3 days)
2. Build dynamic form generator (1-2 days)
3. Build canvas renderer (2 days)
4. Test with sample template (1 day)

See [Phase 2B: Data Transformation](THEME_MIGRATION_2B_DATA_TRANSFORM.md) for data format conversion.
