# Phase 2B: Data Structure Transformation

**Document Purpose:** Define transformation rules for migrating legacy data to new format.

---

## Transformation Overview

```
Legacy Data (TypeScript files + JSX)
    ↓
Parse & Extract
    ↓
Transform to JSON structure
    ↓
Validate against Zod schemas
    ↓
New Format (Database records)
```

---

## Theme Config Transformation

### Input (Legacy)
```typescript
// app/components/store-templates/rovo/theme.ts
export const themeConfig = {
  colors: {
    primary: "#FF6B35",
    secondary: "#004E89",
    accent: "#FFD166",
    textLight: "#FFFFFF",
    textDark: "#1A1A1A"
  },
  typography: {
    fontFamily: "Inter",
    sizes: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "1.5rem"
    }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  }
};
```

### Output (New)
```json
{
  "theme": {
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#004E89",
      "accent": "#FFD166",
      "textLight": "#FFFFFF",
      "textDark": "#1A1A1A"
    },
    "typography": {
      "fontFamily": "Inter",
      "headingSize": "1.5rem",
      "bodySize": "1rem",
      "smallSize": "0.875rem"
    },
    "spacing": {
      "unit": "8px",
      "scale": [4, 8, 16, 24, 32]
    }
  }
}
```

### Transformation Rules
```typescript
function transformTheme(legacyTheme): NewTheme {
  return {
    colors: legacyTheme.colors,  // 1:1 pass-through
    typography: {
      fontFamily: legacyTheme.typography.fontFamily,
      headingSize: legacyTheme.typography.sizes.xl,
      bodySize: legacyTheme.typography.sizes.md,
      smallSize: legacyTheme.typography.sizes.sm
    },
    spacing: {
      unit: legacyTheme.spacing.sm,
      scale: Object.values(legacyTheme.spacing)
    }
  };
}
```

---

## Section Extraction Transformation

### Input (Legacy JSX)
```typescript
// app/components/templates/flash-sale/index.tsx
import { Hero } from '../sections/Hero';
import { ProductGrid } from '../sections/ProductGrid';
import { Footer } from '../sections/Footer';

export function FlashSaleTemplate() {
  return (
    <>
      <Hero
        title="Mega Sale"
        image="https://cdn.../hero.jpg"
        ctaText="Start Shopping"
        ctaLink="/products?sale=true"
        bgColor="#FF6B35"
      />
      <ProductGrid
        category="sale"
        limit={12}
        columns={3}
        showPrice={true}
      />
      <Footer
        text="© 2025 Store"
        socialLinks={[...]}
      />
    </>
  );
}
```

### Output (New)
```json
{
  "sections": [
    {
      "id": "hero_flash_1",
      "type": "hero",
      "order": 1,
      "enabled": true,
      "config": {
        "title": "Mega Sale",
        "image": "https://cdn.../hero.jpg",
        "ctaText": "Start Shopping",
        "ctaLink": "/products?sale=true",
        "bgColor": "#FF6B35"
      }
    },
    {
      "id": "grid_flash_1",
      "type": "product-grid",
      "order": 2,
      "enabled": true,
      "config": {
        "category": "sale",
        "limit": 12,
        "columns": 3,
        "showPrice": true
      }
    },
    {
      "id": "footer_flash_1",
      "type": "footer",
      "order": 3,
      "enabled": true,
      "config": {
        "text": "© 2025 Store",
        "socialLinks": []
      }
    }
  ]
}
```

### Transformation Rules
```typescript
function transformSections(jsxAST): Section[] {
  // Parse JSX component tree
  const components = parseJSX(jsxAST);
  
  // Convert to section array
  return components.map((comp, index) => ({
    id: `${mapComponentToType(comp)}_${index}`,
    type: mapComponentToType(comp),  // Hero → 'hero'
    order: index + 1,
    enabled: true,
    config: extractProps(comp)
  }));
}

function mapComponentToType(component): string {
  const mapping = {
    'Hero': 'hero',
    'ProductGrid': 'product-grid',
    'ProductCarousel': 'product-carousel',
    'Footer': 'footer',
    'CTABanner': 'cta-banner'
  };
  return mapping[component.name];
}

function extractProps(component): object {
  // Extract JSX props as object
  return Object.fromEntries(
    component.attributes.map(attr => [
      attr.name,
      evaluateValue(attr.value)
    ])
  );
}
```

---

## Complete Template Transformation

### Input Structure
```typescript
// Combination of:
// 1. app/components/templates/flash-sale/theme.ts
// 2. app/components/templates/flash-sale/index.tsx
```

### Output Structure
```json
{
  "id": "template_flash_sale",
  "store_id": "store_default",
  "name": "Flash Sale",
  "type": "campaign",
  "theme": { /* transformed theme */ },
  "sections": [ /* transformed sections */ ],
  "status": "published",
  "version": 1,
  "created_at": "2025-01-20T00:00:00Z",
  "updated_at": "2025-01-20T00:00:00Z",
  "published_at": "2025-01-20T00:00:00Z",
  "created_by": "system"
}
```

### Full Transformation Function
```typescript
async function transformTemplate(
  templateName: string,
  templateType: 'store' | 'campaign'
): Promise<TemplateRecord> {
  // 1. Import legacy files
  const legacyTheme = await import(
    `app/components/templates/${templateName}/theme.ts`
  );
  const legacyComponent = await import(
    `app/components/templates/${templateName}/index.tsx`
  );
  
  // 2. Parse JSX AST
  const jsxAST = parse(legacyComponent.source);
  
  // 3. Transform
  const newTemplate = {
    id: `template_${templateName}`,
    store_id: 'store_default',
    name: templateName,
    type: templateType,
    theme: transformTheme(legacyTheme.themeConfig),
    sections: transformSections(jsxAST),
    status: 'published',
    version: 1,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
    created_by: 'system'
  };
  
  // 4. Validate
  const validated = TemplateSchema.parse(newTemplate);
  
  return validated;
}
```

---

## Validation During Transformation

### Zod Schemas
```typescript
const ThemeSchema = z.object({
  colors: z.record(z.string().regex(/^#[0-9A-F]{6}$/i)),
  typography: z.object({
    fontFamily: z.string(),
    headingSize: z.string(),
    bodySize: z.string()
  }),
  spacing: z.object({
    unit: z.string(),
    scale: z.array(z.number())
  })
});

const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number().positive(),
  enabled: z.boolean(),
  config: z.record(z.any())
});

const TemplateSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  name: z.string(),
  type: z.enum(['store', 'campaign']),
  theme: ThemeSchema,
  sections: z.array(SectionSchema),
  status: z.enum(['draft', 'published']),
  version: z.number().positive(),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
  created_by: z.string()
});
```

### Error Handling
```typescript
function transformWithErrors(legacy) {
  try {
    const transformed = transform(legacy);
    const validated = TemplateSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      legacy: legacy,
      suggestion: suggestFix(error)
    };
  }
}
```

---

## Transformation Checklist

- [ ] All theme colors transformed (validate hex format)
- [ ] All typography properties mapped
- [ ] All sections extracted from JSX
- [ ] All section props converted to config
- [ ] All configs validated against schemas
- [ ] Store_id correctly set (multi-tenant)
- [ ] Version numbers initialized to 1
- [ ] Timestamps set to current date
- [ ] No data loss in transformation

---

## Sample Transformations

### Store Template: rovo
```
Input: app/components/store-templates/rovo/theme.ts
Output: templates table row with type='store'
Status: Ready to transform
```

### Campaign Template: flash-sale
```
Input: app/components/templates/flash-sale/
Output: templates table row with type='campaign'
Status: Ready to transform
```

---

## Next Steps

1. Review transformation rules above
2. Implement `transformTemplate()` function
3. Create test cases for each template
4. Test transformation output validity

See [Phase 2C: GrapesJS Integration](THEME_MIGRATION_2C_GRAPESJS.md).
