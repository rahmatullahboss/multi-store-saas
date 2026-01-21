# Phase 5B: Testing Plan

**Document Purpose:** Testing strategy to validate migration correctness and editor/storefront functionality.

---

## Test Coverage (4 Key Areas)

1. **Migration Data Transformation** – Verify migration script moves data correctly from old to new schema
2. **Store-Live-Editor (Draft)** – Verify editor can read/write draft theme tables
3. **Storefront Rendering** – Verify storefront renders correctly from published theme tables
4. **Fallback to themeConfig** – Verify storefront falls back to themeConfig when draft is empty

---

## Unit Tests: Data Transformation

```typescript
// tests/migration.test.ts
import { describe, it, expect } from 'vitest';
import { transformOldThemeToNew } from '~/lib/migration';

describe('Migration: Data Transformation', () => {
  it('should transform old theme schema to new format', () => {
    const oldTheme = {
      colors: { primary: '#FF6B35' },
      typography: { fontFamily: 'Inter' }
    };
    
    const result = transformOldThemeToNew(oldTheme);
    
    expect(result.id).toBeDefined();
    expect(result.store_id).toBeDefined();
    expect(result.config.colors.primary).toBe('#FF6B35');
    expect(result.status).toBe('published');
  });
  
  it('should preserve all required fields during transformation', () => {
    const oldTheme = { /* ... */ };
    const result = transformOldThemeToNew(oldTheme);
    
    expect(result.id).toBeDefined();
    expect(result.store_id).toBeDefined();
    expect(result.config).toBeDefined();
    expect(result.published_at).toBeDefined();
  });
});
```

---

## Integration Test: Migration Workflow

```typescript
// tests/migration.integration.test.ts
import { describe, it, expect } from 'vitest';
import { runMigration } from '~/lib/migration-runner';
import { db } from '~/lib/db';

describe('Migration: Full Workflow', () => {
  it('should migrate test store successfully', async () => {
    const testStoreId = 'store_' + Date.now();
    
    // Insert old schema data
    const oldTheme = {
      id: 'theme_old_1',
      store_id: testStoreId,
      colors: { primary: '#FF6B35' }
    };
    await db.old_themes.insert(oldTheme);
    
    // Run migration
    const result = await runMigration(testStoreId);
    
    expect(result.success).toBe(true);
    expect(result.recordsMigrated).toBeGreaterThan(0);
    
    // Verify new table has data
    const newTheme = await db.themes_published.findOne({ store_id: testStoreId });
    expect(newTheme).toBeDefined();
    expect(newTheme.config.colors.primary).toBe('#FF6B35');
  });
});
```

---

## Integration Test: Editor Draft Operations

```typescript
// tests/editor-draft.integration.test.ts
describe('Store-Live-Editor: Draft Table Read/Write', () => {
  it('should save draft theme to themes_draft table', async () => {
    const storeId = 'store_' + Date.now();
    
    const draftTheme = {
      store_id: storeId,
      config: { colors: { primary: '#FF6B35' } },
      status: 'draft'
    };
    
    await db.themes_draft.upsert(draftTheme);
    
    const saved = await db.themes_draft.findOne({ store_id: storeId });
    expect(saved.config.colors.primary).toBe('#FF6B35');
  });
  
  it('should retrieve draft for editor preview', async () => {
    const storeId = 'store_' + Date.now();
    
    const draft = { store_id: storeId, config: { /* ... */ } };
    await db.themes_draft.upsert(draft);
    
    const retrieved = await db.themes_draft.findOne({ store_id: storeId });
    expect(retrieved).toBeDefined();
  });
});
```

---

## Integration Test: Storefront Rendering

```typescript
// tests/storefront-rendering.integration.test.ts
describe('Storefront: Publish & Render', () => {
  it('should render storefront from published table', async () => {
    const storeId = 'store_' + Date.now();
    
    // Publish theme
    const publishedTheme = {
      store_id: storeId,
      config: { colors: { primary: '#FF6B35' } },
      status: 'published'
    };
    await db.themes_published.upsert(publishedTheme);
    
    // Fetch for storefront
    const theme = await db.themes_published.findOne({ store_id: storeId });
    
    expect(theme.config.colors.primary).toBe('#FF6B35');
  });
  
  it('should use published theme in storefront CSS', async () => {
    const storeId = 'store_' + Date.now();
    
    const theme = {
      store_id: storeId,
      config: { colors: { primary: '#FF6B35' } }
    };
    await db.themes_published.upsert(theme);
    
    const css = await generateStorefrontCSS(storeId);
    expect(css).toContain('#FF6B35');
  });
});
```

---

## Integration Test: Fallback Logic

```typescript
// tests/fallback.integration.test.ts
describe('Storefront: Fallback to themeConfig', () => {
  it('should use published table when draft is empty', async () => {
    const storeId = 'store_' + Date.now();
    
    // No draft table entry
    const draftTheme = await db.themes_draft.findOne({ store_id: storeId });
    expect(draftTheme).toBeUndefined();
    
    // Published table has data
    const publishedTheme = {
      store_id: storeId,
      config: { colors: { primary: '#FF6B35' } }
    };
    await db.themes_published.upsert(publishedTheme);
    
    // Get theme (should use published as fallback)
    const theme = await getStoreTheme(storeId);
    expect(theme.config.colors.primary).toBe('#FF6B35');
  });
  
  it('should fallback to themeConfig when both tables are empty', async () => {
    const storeId = 'store_' + Date.now();
    
    // No entries in either table
    const draftTheme = await db.themes_draft.findOne({ store_id: storeId });
    const publishedTheme = await db.themes_published.findOne({ store_id: storeId });
    
    expect(draftTheme).toBeUndefined();
    expect(publishedTheme).toBeUndefined();
    
    // Should use default themeConfig
    const theme = await getStoreTheme(storeId);
    expect(theme).toEqual(DEFAULT_THEME_CONFIG);
  });
});
```

---

## E2E Test: Full Workflow

```typescript
// tests/e2e/migration-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E: Migration & Editor Workflow', () => {
  test('should create draft, preview, publish, render on storefront', async ({ page, context }) => {
    const storeId = 'store_' + Date.now();
    
    // 1. Editor: Open draft editor
    await page.goto(`/editor?store=${storeId}`);
    
    // 2. Edit and save draft
    await page.fill('[data-testid="color-primary"]', '#FF6B35');
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text=Draft saved')).toBeVisible();
    
    // 3. Preview (should show draft)
    await page.click('button:has-text("Preview")');
    const previewPage = await context.waitForEvent('page');
    await expect(previewPage.locator('body')).toHaveCSS('--color-primary', '#FF6B35');
    await previewPage.close();
    
    // 4. Publish
    await page.click('button:has-text("Publish")');
    await expect(page.locator('text=Published')).toBeVisible();
    
    // 5. Storefront: Verify live store renders with published theme
    await page.goto(`/store/${storeId}`);
    await expect(page.locator('body')).toHaveCSS('--color-primary', '#FF6B35');
  });
});
```

---

## Run All Tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## Next Steps

See [Phase 5C: Deployment Checklist](THEME_MIGRATION_5C_DEPLOYMENT.md).
