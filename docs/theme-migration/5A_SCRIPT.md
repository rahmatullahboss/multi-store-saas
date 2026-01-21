# Phase 5A: Migration Script

**Document Purpose:** Concise Drizzle ORM script to migrate stores.themeConfig → draft tables (idempotent).

---

## What This Script Does

1. **Get all stores** from database
2. **For each store**: Parse `themeConfig` JSON
3. **Extract sections** → Upsert into `templateSectionsDraft`
4. **Extract settings** (colors, typography) → Upsert into `themeSettingsDraft`
5. **Log progress** and handle errors gracefully

**Idempotent:** Can run multiple times safely (upsert operations).

---

## Migration Script (One File)

```typescript
// scripts/migrate-theme-config.ts
import { db } from '~/lib/db';
import { eq } from 'drizzle-orm';
import { stores, templateSectionsDraft, themeSettingsDraft } from '~/db/schema';

interface ThemeConfig {
  sections?: Record<string, any>;
  colors?: Record<string, string>;
  typography?: Record<string, any>;
}

async function migrateThemeConfig() {
  console.log('🚀 Starting theme migration...\n');
  
  try {
    // 1. Get all stores
    const allStores = await db.select().from(stores);
    console.log(`Found ${allStores.length} stores\n`);
    
    let successCount = 0;
    let skippedCount = 0;
    
    // 2. Process each store
    for (const store of allStores) {
      try {
        const themeConfigStr = store.themeConfig as string | null;
        
        if (!themeConfigStr) {
          console.log(`⊘ Store ${store.id}: No themeConfig`);
          skippedCount++;
          continue;
        }
        
        const themeConfig: ThemeConfig = JSON.parse(themeConfigStr);
        
        // 3. Insert sections into templateSectionsDraft (upsert)
        if (themeConfig.sections && typeof themeConfig.sections === 'object') {
          for (const [sectionId, sectionData] of Object.entries(themeConfig.sections)) {
            await db
              .insert(templateSectionsDraft)
              .values({
                id: `${store.id}_${sectionId}`,
                shopId: store.id,
                templateId: store.id,
                type: (sectionData as any).type || 'custom',
                enabled: 1,
                sortOrder: (sectionData as any).sortOrder || 0,
                propsJson: JSON.stringify((sectionData as any).props || {}),
                blocksJson: JSON.stringify((sectionData as any).blocks || []),
                version: 1,
                updatedAt: new Date()
              })
              .onConflictDoUpdate({
                target: templateSectionsDraft.id,
                set: {
                  propsJson: JSON.stringify((sectionData as any).props || {}),
                  blocksJson: JSON.stringify((sectionData as any).blocks || []),
                  version: (sql) => sql`version + 1`,
                  updatedAt: new Date()
                }
              });
          }
        }
        
        // 4. Insert settings into themeSettingsDraft (upsert)
        const settingsData = {
          colors: themeConfig.colors || {},
          typography: themeConfig.typography || {}
        };
        
        await db
          .insert(themeSettingsDraft)
          .values({
            id: `theme_${store.id}`,
            shopId: store.id,
            themeId: store.id,
            settingsJson: JSON.stringify(settingsData),
            version: 1,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: themeSettingsDraft.id,
            set: {
              settingsJson: JSON.stringify(settingsData),
              version: (sql) => sql`version + 1`,
              updatedAt: new Date()
            }
          });
        
        console.log(`✅ Store ${store.id}: Migrated`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Store ${store.id}: ${(error as Error).message}`);
      }
    }
    
    // 5. Log summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Complete:');
    console.log(`  ✅ Migrated: ${successCount}`);
    console.log(`  ⊘ Skipped: ${skippedCount}`);
    console.log(`  Total: ${allStores.length}`);
    console.log('='.repeat(50));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateThemeConfig();
```

---

## Usage

```bash
# Run the migration
tsx scripts/migrate-theme-config.ts

# Or add to package.json and run
npm run migrate:theme-config
```

### package.json
```json
{
  "scripts": {
    "migrate:theme-config": "tsx scripts/migrate-theme-config.ts"
  }
}
```

---

## How It Works

| Step | What Happens |
|------|-------------|
| 1 | Query all `stores` from DB |
| 2 | For each store, parse `themeConfig` JSON |
| 3 | Upsert each section into `templateSectionsDraft` |
| 4 | Upsert theme settings into `themeSettingsDraft` |
| 5 | Log progress and errors |

**Upsert = Safe to re-run:** If row exists, update it; if not, insert.

---

## Key Features

✅ **Idempotent**: Run multiple times without duplication  
✅ **Multi-tenant safe**: Scoped by `shopId`  
✅ **Error handling**: Logs failures but continues  
✅ **Progress visibility**: Shows each store's status  
✅ **Version tracking**: Auto-increments version on updates  
✅ **Drizzle ORM**: Uses `onConflictDoUpdate` for upserts  

---

## Database Tables (Required)

```typescript
// templateSectionsDraft: Holds editable sections
{
  id, shopId, templateId, type, enabled, sortOrder,
  propsJson, blocksJson, version, updatedAt
}

// themeSettingsDraft: Holds global theme settings
{
  id, shopId, themeId, settingsJson, version, updatedAt
}
```

See [Phase 3A: Draft System](THEME_MIGRATION_3A_DRAFT_SYSTEM.md) for full schema.

---

## Next Steps

1. Run the migration: `npm run migrate:theme-config`
2. Verify data: Check `templateSectionsDraft` and `themeSettingsDraft` tables
3. Test editor: Load draft sections in theme editor
4. Publish: Test publish workflow to `*Published` tables
5. See [Phase 5B: Testing](THEME_MIGRATION_5B_TESTING.md)
