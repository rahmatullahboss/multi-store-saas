# Phase 2B: Data Structure Transformation

**Purpose:** Transform theme config from `stores.themeConfig` JSON to `templateSectionsDraft/Published` and `themeSettingsDraft/Published` tables.

---

## Data Mapping Overview

```
stores.themeConfig (current)
    ├─ .sections → templateSectionsDraft.sectionsJson
    └─ .primaryColor, .accentColor, etc. → themeSettingsDraft.settingsJson
```

---

## Section Transformation

### Source Structure
```typescript
// Current: stores.themeConfig.sections
[
  {
    id: "hero_1",
    type: "hero",
    settings: {
      title: "Welcome",
      image: "https://...",
      ctaText: "Shop Now"
    }
  },
  {
    id: "grid_1",
    type: "product-grid",
    settings: {
      columns: 3,
      limit: 12
    }
  }
]
```

### Target Structure
```json
{
  "sectionsJson": [
    {
      "id": "hero_1",
      "type": "hero",
      "settings": {
        "title": "Welcome",
        "image": "https://...",
        "ctaText": "Shop Now"
      }
    },
    {
      "id": "grid_1",
      "type": "product-grid",
      "settings": {
        "columns": 3,
        "limit": 12
      }
    }
  ]
}
```

### Transformation Code
```typescript
async function transformSections(store_id: string) {
  // 1. Read from stores table
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, store_id)
  });
  
  const themeConfig = store.themeConfig as any;
  
  // 2. Transform: sections → sectionsJson
  const sectionsJson = themeConfig.sections || [];
  
  // 3. Insert into templateSectionsDraft
  await db.insert(templateSectionsDraft).values({
    id: crypto.randomUUID(),
    store_id,
    sectionsJson,
    created_at: new Date(),
    updated_at: new Date()
  });
}
```

---

## Theme Settings Transformation

### Source Structure
```typescript
// Current: stores.themeConfig
{
  primaryColor: "#FF6B35",
  accentColor: "#FFD166",
  fontFamily: "Inter",
  fontSize: "16px"
}
```

### Target Structure
```json
{
  "settingsJson": {
    "colors": {
      "primary": "#FF6B35",
      "accent": "#FFD166"
    },
    "typography": {
      "fontFamily": "Inter",
      "fontSize": "16px"
    }
  }
}
```

### Transformation Code
```typescript
async function transformThemeSettings(store_id: string) {
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, store_id)
  });
  
  const themeConfig = store.themeConfig as any;
  
  // Extract colors and typography
  const settingsJson = {
    colors: {
      primary: themeConfig.primaryColor,
      accent: themeConfig.accentColor
    },
    typography: {
      fontFamily: themeConfig.fontFamily,
      fontSize: themeConfig.fontSize
    }
  };
  
  await db.insert(themeSettingsDraft).values({
    id: crypto.randomUUID(),
    store_id,
    settingsJson,
    created_at: new Date(),
    updated_at: new Date()
  });
}
```

---

## Migration Script

```typescript
export async function migrateThemeConfig() {
  const stores = await db.query.stores.findMany();
  
  for (const store of stores) {
    await transformSections(store.id);
    await transformThemeSettings(store.id);
  }
  
  console.log(`✓ Migrated ${stores.length} stores`);
}
```

---

## Validation Checklist

- [ ] All sections copied to `templateSectionsDraft.sectionsJson`
- [ ] All theme colors/typography in `themeSettingsDraft.settingsJson`
- [ ] No data loss in transformation
- [ ] Store IDs correctly set (multi-tenant)
- [ ] Timestamps initialized

---

See [Phase 2C: GrapesJS Integration](THEME_MIGRATION_2C_GRAPESJS.md).
