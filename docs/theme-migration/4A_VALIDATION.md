# Phase 4A: Validation Schema

**Purpose:** Validate section settings against SECTION_REGISTRY definitions and theme colors using Zod.

---

## Registry-Based Validation

Each section in `SECTION_REGISTRY` defines:
- `type`: Section identifier
- `defaultSettings`: Default values for section
- `component`: React component to render

**Validation uses registry definitions as source of truth.**

```typescript
// From app/components/store-sections/registry.ts
export interface SectionDefinition {
  type: SectionType;
  name: string;
  description: string;
  defaultSettings: SectionSettings;  // ← Defines valid settings
  component: ComponentType<any>;
}
```

---

## Zod Schemas

### Color Validation
```typescript
const ColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color (e.g., #FF6B35)');
```

### Theme Schema
```typescript
const ThemeSchema = z.object({
  colors: z.object({
    primary: ColorSchema,
    secondary: ColorSchema,
    accent: ColorSchema.optional(),
    textLight: ColorSchema,
    textDark: ColorSchema,
    background: ColorSchema.optional(),
    border: ColorSchema.optional()
  }),
  typography: z.object({
    fontFamily: z.string().min(1, 'Font required'),
    headingSize: z.string().regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/),
    bodySize: z.string().regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/),
    smallSize: z.string().regex(/^\d+(?:\.\d+)?(?:rem|px|em)$/),
  }),
  spacing: z.object({
    unit: z.string().regex(/^\d+(?:\.\d+)?(?:rem|px)$/),
    scale: z.array(z.number().positive()).min(3)
  })
}).strict();
```

### Section Settings Validation
```typescript
const SectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  settings: z.record(z.any()),
  order: z.number().positive().optional(),
  enabled: z.boolean().default(true)
}).superRefine((section, ctx) => {
  // Validate against SECTION_REGISTRY
  const def = SECTION_REGISTRY[section.type];
  
  if (!def) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unknown section type: ${section.type}`
    });
    return;
  }
  
  // Settings must match registry structure
  const settingsKeys = Object.keys(section.settings);
  const validKeys = Object.keys(def.defaultSettings);
  
  for (const key of settingsKeys) {
    if (!validKeys.includes(key) && key !== 'id') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['settings', key],
        message: `Invalid setting for ${section.type}: ${key}`
      });
    }
  }
});
```

---

## Validation Points

### On Editor Save (Draft)
```typescript
export async function saveDraft(req: Request) {
  const { templateId } = req.params;
  const payload = await req.json();
  
  // Partial validation (theme/sections optional)
  const validation = z.object({
    name: z.string().optional(),
    theme: ThemeSchema.optional(),
    sections: z.array(SectionSchema).optional()
  }).safeParse(payload);
  
  if (!validation.success) {
    return json({
      error: 'Invalid data',
      issues: validation.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    }, { status: 400 });
  }
  
  // Save to DB (draft)
  await db.templates.update(templateId, validation.data);
  return json({ success: true });
}
```

### On Publish
```typescript
export async function publish(req: Request) {
  const template = await loadTemplate(req.params.templateId);
  
  // Full strict validation
  const TemplateSchema = z.object({
    id: z.string(),
    store_id: z.string(),
    name: z.string().min(1),
    theme: ThemeSchema,
    sections: z.array(SectionSchema).min(1),
    status: z.enum(['draft', 'published'])
  });
  
  const validation = TemplateSchema.safeParse(template);
  
  if (!validation.success) {
    return json({
      error: 'Cannot publish: validation failed',
      issues: validation.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    }, { status: 400 });
  }
  
  // Mark as published, invalidate cache
  await db.templates.publish(template.id);
  await invalidateKVCache(template.store_id, template.id);
  
  return json({ published: true });
}
```

---

## Error Messages

Clear, user-facing errors:

| Error | Message |
|-------|---------|
| Invalid hex | "Color must be #RRGGBB format (e.g., #FF6B35)" |
| Unknown section | "Section type 'xyz' not found in registry" |
| Invalid setting | "Setting 'abc' is not valid for hero section" |
| Missing required | "Section requires at least 1 section" |
| Bad theme | "Theme colors are invalid" |

---

## Multi-Tenant Scoping

Always validate `store_id` matches:
```typescript
const template = await db.templates.get(id);
if (template.store_id !== req.user.store_id) {
  return json({ error: 'Unauthorized' }, { status: 403 });
}
```

---

## Next Steps

See [Phase 4B: Migration Checks](THEME_MIGRATION_4B_CHECKS.md) for pre-migration validation.
