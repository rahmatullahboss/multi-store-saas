# Phase 4A: Validation Schema

**Document Purpose:** Define Zod schemas for validating templates, configs, and sections.

---

## Validation Strategy

### Three Layers
1. **Client-Side:** Real-time feedback in editor (quick)
2. **Server-Side:** Pre-save validation (prevents invalid data)
3. **Database:** Type checking (enforcement)

### Principle: Server is Source of Truth
```
Client validation → UX helper (not trusted)
Server validation → Real validation (must pass)
Database constraints → Last defense
```

---

## Base Schemas

### Color Schema
```typescript
import { z } from 'zod';

const ColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color (e.g., #FF6B35)')
  .describe('Hex color code');

const ColorsSchema = z.object({
  primary: ColorSchema,
  secondary: ColorSchema,
  accent: ColorSchema.optional(),
  textLight: ColorSchema,
  textDark: ColorSchema,
  background: ColorSchema.optional(),
  border: ColorSchema.optional()
}, { description: 'Color palette' });
```

### Typography Schema
```typescript
const TypographySchema = z.object({
  fontFamily: z
    .string()
    .min(1, 'Font family required')
    .describe('Font name (e.g., Inter, Georgia)'),
  
  headingSize: z
    .string()
    .regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/, 'Invalid size format')
    .describe('Heading size (e.g., 1.5rem)'),
  
  bodySize: z
    .string()
    .regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/, 'Invalid size format')
    .describe('Body text size'),
  
  smallSize: z
    .string()
    .regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/, 'Invalid size format')
    .describe('Small text size'),
  
  lineHeight: z
    .number()
    .min(1)
    .max(2.5)
    .optional()
    .describe('Line height ratio (1-2.5)')
}, { description: 'Typography config' });
```

### Spacing Schema
```typescript
const SpacingSchema = z.object({
  unit: z
    .string()
    .regex(/^\d+(?:\.\d+)?(?:rem|px)$/, 'Invalid spacing unit')
    .describe('Base spacing unit (e.g., 8px)'),
  
  scale: z
    .array(z.number().positive())
    .min(3)
    .describe('Spacing scale multipliers'),
}, { description: 'Spacing system' });
```

### Theme Schema
```typescript
const ThemeSchema = z.object({
  colors: ColorsSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
}, {
  description: 'Theme configuration'
}).strict(); // Reject unknown properties
```

---

## Section Schemas

### Base Section Config
```typescript
const SectionConfigSchema = z
  .record(z.any())
  .refine(
    (config) => Object.keys(config).length > 0,
    'Section config cannot be empty'
  );
```

### Hero Section Schema
```typescript
const HeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title required')
    .max(200, 'Title too long')
    .describe('Headline text'),
  
  image: z
    .string()
    .url('Invalid image URL')
    .describe('Background image URL'),
  
  ctaText: z
    .string()
    .min(1)
    .max(50)
    .describe('Button text'),
  
  ctaLink: z
    .string()
    .url('Invalid URL')
    .describe('Button link'),
  
  bgColor: ColorSchema.optional(),
  textColor: ColorSchema.optional(),
  height: z.string().optional(),
}, { description: 'Hero banner section' });
```

### Product Grid Schema
```typescript
const ProductGridSchema = z.object({
  columns: z
    .number()
    .min(1)
    .max(6)
    .describe('Number of columns'),
  
  limit: z
    .number()
    .min(1)
    .max(100)
    .describe('Number of products'),
  
  category: z
    .string()
    .optional()
    .describe('Filter by category'),
  
  showPrice: z
    .boolean()
    .default(true)
    .describe('Show price labels'),
  
  showRating: z
    .boolean()
    .default(true)
    .describe('Show star ratings'),
  
  spacing: z
    .enum(['compact', 'normal', 'spacious'])
    .default('normal')
    .describe('Grid spacing'),
}, { description: 'Product grid section' });
```

### Generic Section Schema
```typescript
const SectionSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('Unique section ID'),
  
  type: z
    .string()
    .min(1)
    .describe('Section type (must exist in registry)'),
  
  order: z
    .number()
    .positive()
    .describe('Display order'),
  
  enabled: z
    .boolean()
    .default(true)
    .describe('Is section visible'),
  
  config: SectionConfigSchema,
}, { description: 'Template section' }).superRefine((section, ctx) => {
  // Validate against registry
  const def = SECTION_REGISTRY[section.type];
  
  if (!def) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unknown section type: ${section.type}`
    });
    return;
  }
  
  // Validate config against section schema
  const configValidation = def.schema.safeParse(section.config);
  if (!configValidation.success) {
    configValidation.error.errors.forEach(err => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['config', ...err.path],
        message: err.message
      });
    });
  }
});
```

---

## Template Schema

### Complete Template Validation
```typescript
const TemplateSchema = z.object({
  // Identity
  id: z
    .string()
    .min(1)
    .describe('Template ID'),
  
  store_id: z
    .string()
    .min(1)
    .describe('Store ID (multi-tenant)'),
  
  name: z
    .string()
    .min(1, 'Template name required')
    .max(100, 'Name too long')
    .describe('Display name'),
  
  type: z
    .enum(['store', 'campaign'])
    .describe('Template type'),
  
  // Content
  theme: ThemeSchema,
  sections: z
    .array(SectionSchema)
    .min(1, 'At least one section required')
    .describe('Page sections'),
  
  // State
  status: z
    .enum(['draft', 'published'])
    .describe('Current status'),
  
  version: z
    .number()
    .nonnegative()
    .describe('Version number'),
  
  // Metadata
  created_at: z
    .date()
    .describe('Creation date'),
  
  updated_at: z
    .date()
    .describe('Last update date'),
  
  published_at: z
    .date()
    .optional()
    .describe('Publish date'),
  
  created_by: z
    .string()
    .min(1)
    .describe('User ID who created'),
  
  updated_by: z
    .string()
    .optional()
    .describe('User ID who last updated'),
}, {
  description: 'Complete template',
  strict: true
}).refine(
  (template) => {
    // If published, must have published_at
    return template.status === 'draft' || template.published_at;
  },
  {
    message: 'Published template must have published_at date',
    path: ['status']
  }
);
```

---

## Validation Utilities

### Validate Template
```typescript
export function validateTemplate(
  data: unknown
): { valid: boolean; errors: string[] } {
  const result = TemplateSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  
  return { valid: false, errors };
}
```

### Validate Section Only
```typescript
export function validateSection(
  section: unknown
): { valid: boolean; errors: string[] } {
  const result = SectionSchema.safeParse(section);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  const errors = result.error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return { valid: false, errors };
}
```

### Validate Theme Only
```typescript
export function validateTheme(
  theme: unknown
): { valid: boolean; errors: string[] } {
  const result = ThemeSchema.safeParse(theme);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  const errors = result.error.errors.map(err => ({
    color: err.path[0],
    message: err.message
  }));
  
  return { valid: false, errors };
}
```

---

## Server Middleware

### Validation on Save
```typescript
export async function saveDraftHandler(req: Request) {
  const { templateId } = req.params;
  const payload = await req.json();
  
  // Partial validation (sections optional)
  const PartialSchema = TemplateSchema.partial();
  const validation = PartialSchema.safeParse(payload);
  
  if (!validation.success) {
    return json({
      error: 'Validation failed',
      errors: validation.error.errors
    }, { status: 400 });
  }
  
  // Save to DB
  // ...
}
```

### Validation on Publish
```typescript
export async function publishHandler(req: Request) {
  const template = await loadTemplate();
  
  // Full strict validation
  const validation = TemplateSchema.safeParse(template);
  
  if (!validation.success) {
    return json({
      error: 'Cannot publish: validation failed',
      errors: validation.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    }, { status: 400 });
  }
  
  // Publish to DB
  // ...
}
```

---

## Client-Side Real-Time Validation

### Hook for Form Validation
```typescript
export function useFieldValidation(fieldName: string, value: any) {
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Debounce validation
    const timeout = setTimeout(() => {
      const fieldSchema = getSchemaForField(fieldName);
      const result = fieldSchema.safeParse(value);
      
      if (!result.success) {
        setError(result.error.errors[0].message);
      } else {
        setError('');
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [fieldName, value]);
  
  return error;
}
```

### Color Picker with Validation
```typescript
function ColorPickerField({ label, value, onChange }) {
  const error = useFieldValidation('color', value);
  
  return (
    <div>
      <label>{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#FF6B35"
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

---

## Custom Validation Rules

### No Duplicate Section IDs
```typescript
const NoDuplicateSectionIds = z.object({
  sections: z.array(z.any())
}).refine(
  (template) => {
    const ids = template.sections.map(s => s.id);
    return ids.length === new Set(ids).size;
  },
  { message: 'Duplicate section IDs detected' }
);
```

### Required Sections
```typescript
const MustHaveHeroSection = z.object({
  sections: z.array(z.any())
}).refine(
  (template) => {
    return template.sections.some(s => s.type === 'hero');
  },
  { message: 'Template must have a hero section' }
);
```

---

## Validation Checklist

- [ ] All schemas use Zod
- [ ] Color validation (hex format)
- [ ] URL validation (image, links)
- [ ] String length limits
- [ ] Number ranges (columns, limit)
- [ ] Enum validation (status, type)
- [ ] Custom cross-field validation
- [ ] Registry lookup validation
- [ ] Multi-tenant scoping validation
- [ ] Error messages are user-friendly

---

## Next Steps

See [Phase 4B: Migration Checks](THEME_MIGRATION_4B_CHECKS.md) for pre-migration validation.
