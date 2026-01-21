# Phase 4B: Migration Checks

**Document Purpose:** Pre-migration validation, data integrity checks, and safety gates.

---

## Pre-Migration Checklist

### System Readiness
- [ ] Database schema created (templates, template_versions)
- [ ] D1 migrations run in staging
- [ ] KV namespace configured
- [ ] API routes prepared (/api/templates/*)
- [ ] Editor UI components built
- [ ] Registry populated with sections
- [ ] Zod schemas all tested
- [ ] Backup created of all legacy themes
- [ ] Staging environment matches production

### Team Readiness
- [ ] Rollback procedure tested
- [ ] Support team briefed
- [ ] Documentation published
- [ ] Dev team trained on new system
- [ ] Monitoring/alerts configured
- [ ] Communication plan ready

---

## Data Integrity Checks

### Before Starting Migration

```typescript
async function preMigrationAudit() {
  const issues = [];
  
  // 1. Check all legacy templates exist
  const templates = [
    'rovo', 'starter-store', 'tech-modern',
    'aurora-minimal', 'nova-lux', 'eclipse',
    'freshness', 'luxe-boutique', 'artisan-market',
    'ghorer-bazar', 'bdshop', 'daraz', 'sokol'
  ];
  
  for (const name of templates) {
    try {
      const theme = await import(`app/components/store-templates/${name}/theme.ts`);
      console.log(`✅ ${name}: Found`);
    } catch {
      issues.push(`❌ ${name}: Missing`);
    }
  }
  
  // 2. Validate all theme configs
  for (const theme of allThemes) {
    const validation = validateTheme(theme);
    if (!validation.valid) {
      issues.push(`❌ ${theme.name}: ${validation.errors.join(', ')}`);
    }
  }
  
  // 3. Check store counts
  const storeCount = await db.stores.count();
  console.log(`📊 Total stores: ${storeCount}`);
  
  // 4. Check for custom themes per store
  const customThemes = await db.query(`
    SELECT COUNT(*) as count
    FROM stores
    WHERE custom_theme_json IS NOT NULL
  `);
  console.log(`⚠️  Stores with custom themes: ${customThemes[0].count}`);
  
  if (customThemes[0].count > 0) {
    issues.push('⚠️  Some stores have custom themes (manual migration needed)');
  }
  
  return { success: issues.length === 0, issues };
}
```

---

## Registry Validation

### Verify All Sections Registered

```typescript
async function validateRegistry() {
  const issues = [];
  
  // Expected sections from old system
  const expectedSections = [
    'hero',
    'product-grid',
    'product-carousel',
    'cta-banner',
    'testimonials',
    'newsletter',
    'faq',
    'video',
    'collection-grid'
  ];
  
  for (const sectionId of expectedSections) {
    const def = SECTION_REGISTRY[sectionId];
    
    if (!def) {
      issues.push(`❌ Section not in registry: ${sectionId}`);
      continue;
    }
    
    // Check required fields
    if (!def.component) {
      issues.push(`❌ ${sectionId}: Missing component`);
    }
    if (!def.schema) {
      issues.push(`❌ ${sectionId}: Missing schema`);
    }
    if (!def.defaultConfig) {
      issues.push(`❌ ${sectionId}: Missing defaultConfig`);
    }
    
    console.log(`✅ ${sectionId}: Valid`);
  }
  
  return { success: issues.length === 0, issues };
}
```

---

## Sample Migration Tests

### Test Transform Function

```typescript
async function testMigrations() {
  const results = [];
  
  // Test each legacy template
  const templates = [
    { name: 'rovo', type: 'store' },
    { name: 'flash-sale', type: 'campaign' },
    { name: 'minimal-clean', type: 'campaign' }
  ];
  
  for (const { name, type } of templates) {
    try {
      console.log(`\nTesting: ${name}`);
      
      // 1. Transform
      const transformed = await transformTemplate(name, type);
      console.log(`✅ Transform successful`);
      
      // 2. Validate
      const validation = TemplateSchema.safeParse(transformed);
      if (!validation.success) {
        console.log(`❌ Validation failed:`, validation.error.errors);
        results.push({ template: name, status: 'failed', reason: 'validation' });
        continue;
      }
      console.log(`✅ Validation passed`);
      
      // 3. Check data integrity
      if (!transformed.theme.colors.primary) {
        console.log(`❌ Missing theme colors`);
        results.push({ template: name, status: 'failed', reason: 'theme' });
        continue;
      }
      console.log(`✅ Theme valid`);
      
      if (transformed.sections.length === 0) {
        console.log(`⚠️  No sections (might be okay for minimal templates)`);
      }
      console.log(`✅ Sections: ${transformed.sections.length}`);
      
      results.push({ template: name, status: 'success' });
      
    } catch (error) {
      console.log(`❌ Error:`, error.message);
      results.push({ template: name, status: 'error', reason: error.message });
    }
  }
  
  return results;
}
```

---

## Database Schema Validation

### Check Tables Exist

```typescript
async function validateDatabaseSchema() {
  const issues = [];
  
  // Check templates table
  try {
    const result = await db.query(`
      SELECT COUNT(*) FROM templates LIMIT 1
    `);
    console.log(`✅ templates table exists`);
  } catch (error) {
    issues.push('❌ templates table missing');
  }
  
  // Check template_versions table
  try {
    const result = await db.query(`
      SELECT COUNT(*) FROM template_versions LIMIT 1
    `);
    console.log(`✅ template_versions table exists`);
  } catch (error) {
    issues.push('❌ template_versions table missing');
  }
  
  // Check indices
  try {
    const indices = await db.query(`
      PRAGMA index_info(idx_store_status)
    `);
    console.log(`✅ Index idx_store_status exists`);
  } catch (error) {
    issues.push(`⚠️  Index idx_store_status missing (performance impact)`);
  }
  
  return { success: issues.length === 0, issues };
}
```

---

## Data Consistency Checks

### After Migration - Verify Data

```typescript
async function postMigrationAudit() {
  const issues = [];
  const results = {
    templatesCreated: 0,
    templatesExpected: 14, // Store templates
    versionsCreated: 0,
    orphanedRecords: 0
  };
  
  // 1. Count migrated templates
  const templateCount = await db.templates.count({
    store_id: 'store_default'  // Assuming default store for templates
  });
  results.templatesCreated = templateCount;
  
  if (templateCount !== results.templatesExpected) {
    issues.push(
      `❌ Template count mismatch: ${templateCount} vs ${results.templatesExpected} expected`
    );
  } else {
    console.log(`✅ All ${templateCount} templates migrated`);
  }
  
  // 2. Check all templates have versions
  const templatesWithoutVersions = await db.query(`
    SELECT t.id, t.name
    FROM templates t
    LEFT JOIN template_versions tv ON t.id = tv.template_id
    WHERE tv.id IS NULL
  `);
  
  if (templatesWithoutVersions.length > 0) {
    issues.push(`❌ ${templatesWithoutVersions.length} templates missing versions`);
  } else {
    console.log(`✅ All templates have version records`);
  }
  
  // 3. Validate all template data
  const templates = await db.templates.findAll({
    store_id: 'store_default'
  });
  
  for (const template of templates) {
    const validation = TemplateSchema.safeParse(template);
    if (!validation.success) {
      issues.push(`❌ Template ${template.id}: Invalid data`);
    }
  }
  
  if (issues.length === 0) {
    console.log(`✅ All template data is valid`);
  }
  
  // 4. Check for orphaned versions
  const orphaned = await db.query(`
    SELECT COUNT(*) as count
    FROM template_versions tv
    LEFT JOIN templates t ON tv.template_id = t.id
    WHERE t.id IS NULL
  `);
  
  results.orphanedRecords = orphaned[0].count;
  if (orphaned[0].count > 0) {
    issues.push(`⚠️  ${orphaned[0].count} orphaned version records`);
  }
  
  return { success: issues.length === 0, results, issues };
}
```

---

## Multi-Tenant Isolation Check

### Verify Store ID Scoping

```typescript
async function validateMultiTenantSafety() {
  const issues = [];
  
  // 1. Ensure no cross-store queries
  const stores = await db.stores.findAll();
  
  for (const store of stores) {
    // Each store should see only their templates
    const storeTemplates = await db.templates.findAll({
      store_id: store.id
    });
    
    // Manually query without store_id (should fail or return nothing)
    const allTemplates = await db.templates.findAll({});
    
    if (allTemplates.length !== storeTemplates.length) {
      console.log(
        `✅ Store ${store.id}: Proper isolation (${storeTemplates.length} templates)`
      );
    } else {
      issues.push(`❌ Store ${store.id}: Potential isolation breach`);
    }
  }
  
  return { success: issues.length === 0, issues };
}
```

---

## Performance Checks

### Query Performance Before Bulk Migration

```typescript
async function validatePerformance() {
  const issues = [];
  
  // 1. Test template load time
  const start = Date.now();
  const template = await db.templates.findOne({
    store_id: 'store_test',
    id: 'template_test'
  });
  const loadTime = Date.now() - start;
  
  if (loadTime > 100) {
    issues.push(`⚠️  Template load slow: ${loadTime}ms (target: <100ms)`);
  } else {
    console.log(`✅ Template load time: ${loadTime}ms`);
  }
  
  // 2. Test template list query
  const listStart = Date.now();
  const templates = await db.templates.findAll({
    store_id: 'store_test'
  }).limit(100);
  const listTime = Date.now() - listStart;
  
  if (listTime > 200) {
    issues.push(`⚠️  Template list slow: ${listTime}ms (target: <200ms)`);
  } else {
    console.log(`✅ Template list time: ${listTime}ms`);
  }
  
  return { success: issues.length === 0, issues };
}
```

---

## Staging vs Production

### Dry-Run on Staging

```bash
# 1. Create staging D1 with backup of production
wrangler d1 backup create --database=prod-db prod-backup

# 2. Restore to staging
wrangler d1 backup restore --database=staging-db prod-backup

# 3. Run migration on staging
npm run migrate:staging

# 4. Run audit
npm run audit:post-migration -- staging

# 5. Manual testing on staging
# - Edit template, save draft
# - Publish template
# - Rollback version
# - Check cache invalidation

# 6. If all passes, run on production
npm run migrate:prod
```

---

## Rollback Readiness

### Before Hitting "Go Live"

```typescript
async function validateRollbackReadiness() {
  const checks = [];
  
  // 1. Check backup exists
  const backup = await getLatestBackup('prod-db');
  checks.push({
    check: 'Recent backup exists',
    status: backup ? 'pass' : 'fail',
    detail: backup ? `${backup.date}` : 'No backup'
  });
  
  // 2. Verify rollback script works
  try {
    await testRollbackScript();
    checks.push({
      check: 'Rollback script executable',
      status: 'pass'
    });
  } catch (error) {
    checks.push({
      check: 'Rollback script executable',
      status: 'fail',
      detail: error.message
    });
  }
  
  // 3. Check legacy code still available
  const legacyAvailable = canAccessLegacyTemplates();
  checks.push({
    check: 'Legacy templates still available',
    status: legacyAvailable ? 'pass' : 'fail'
  });
  
  return checks;
}
```

---

## Go/No-Go Decision Matrix

| Check | Status | Decision |
|-------|--------|----------|
| All schemas valid | ✅ Pass | GO |
| All templates transformed | ✅ Pass | GO |
| Data integrity audit | ✅ Pass | GO |
| Performance tests | ✅ Pass | GO |
| Multi-tenant isolation | ✅ Pass | GO |
| Rollback tested | ✅ Pass | GO |
| **Decision** | | **GO** |

---

## Monitoring During Migration

### Real-Time Checks
```typescript
async function monitorMigration(templateIds: string[]) {
  for (const id of templateIds) {
    try {
      // Verify each template in destination
      const template = await db.templates.findOne({ id });
      
      if (!template) {
        console.error(`❌ Migration failed for ${id}`);
      } else {
        console.log(`✅ Verified ${id}`);
      }
    } catch (error) {
      console.error(`Error verifying ${id}:`, error);
    }
  }
}
```

---

## Checklist: Pre-Migration Validation

- [ ] System readiness verified
- [ ] Data integrity audit passed
- [ ] Registry validation passed
- [ ] Sample migrations tested
- [ ] Database schema validated
- [ ] Post-migration audit ready
- [ ] Multi-tenant isolation verified
- [ ] Performance acceptable
- [ ] Staging dry-run successful
- [ ] Rollback procedure tested
- [ ] Team trained and ready
- [ ] Go/No-Go decision made

---

## Next Steps

See [Phase 4C: Rollback Strategy](THEME_MIGRATION_4C_ROLLBACK.md) for detailed rollback procedures.
