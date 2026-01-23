/**
 * Migration Script: themeConfig → Draft Tables
 * 
 * This script migrates existing stores' themeConfig data to the new
 * draft/publish template system (Shopify-like architecture).
 * 
 * Usage:
 *   npx tsx db/seeds/migrate-theme-config.ts
 * 
 * What it does:
 *   1. Reads all stores with themeConfig
 *   2. Creates theme record if missing
 *   3. Creates themeTemplate record if missing  
 *   4. Migrates sections to templateSectionsDraft
 *   5. Migrates settings to themeSettingsDraft
 *   6. Optionally publishes to Published tables
 * 
 * Safe to run multiple times (idempotent via upsert logic)
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '../schema';
import { 
  themes, 
  themeTemplates, 
  templateSectionsDraft, 
  templateSectionsPublished,
  themeSettingsDraft,
  themeSettingsPublished 
} from '../schema_templates';

// Types
interface ThemeConfig {
  templateId?: string;
  sections?: Array<{
    id: string;
    type: string;
    settings?: Record<string, unknown>;
  }>;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  typography?: Record<string, unknown>;
  bannerUrl?: string;
  bannerText?: string;
  customCSS?: string;
  headerLayout?: string;
  headerShowSearch?: boolean;
  headerShowCart?: boolean;
  footerDescription?: string;
  copyrightText?: string;
  footerColumns?: unknown[];
  floatingWhatsappEnabled?: boolean;
  floatingWhatsappNumber?: string;
  floatingWhatsappMessage?: string;
  floatingCallEnabled?: boolean;
  floatingCallNumber?: string;
  checkoutStyle?: string;
  flashSale?: unknown;
  trustBadges?: unknown;
  marketingPopup?: unknown;
  seo?: unknown;
}

interface MigrationResult {
  storeId: number;
  storeName: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
}

/**
 * Main migration function
 */
export async function migrateThemeConfigs(
  db: ReturnType<typeof drizzle>,
  options: {
    autoPublish?: boolean;  // Also copy to published tables
    dryRun?: boolean;       // Log only, don't write
    storeIds?: number[];    // Specific stores to migrate (empty = all)
  } = {}
): Promise<MigrationResult[]> {
  const { autoPublish = true, dryRun = false, storeIds } = options;
  const results: MigrationResult[] = [];

  console.log('🚀 Starting theme config migration...');
  console.log(`   Options: autoPublish=${autoPublish}, dryRun=${dryRun}`);

  // Get all stores (or specific ones)
  const storeQuery = db.select().from(stores);
  const allStores = await storeQuery;
  
  const storesToMigrate = storeIds?.length 
    ? allStores.filter(s => storeIds.includes(s.id))
    : allStores;

  console.log(`📦 Found ${storesToMigrate.length} stores to migrate`);

  for (const store of storesToMigrate) {
    try {
      // Parse themeConfig
      const themeConfigRaw = (store as unknown as { themeConfig?: string }).themeConfig;
      
      if (!themeConfigRaw) {
        results.push({
          storeId: store.id,
          storeName: store.name,
          status: 'skipped',
          message: 'No themeConfig found'
        });
        continue;
      }

      const themeConfig: ThemeConfig = typeof themeConfigRaw === 'string'
        ? JSON.parse(themeConfigRaw)
        : themeConfigRaw;

      if (dryRun) {
        console.log(`[DRY RUN] Would migrate store ${store.id}: ${store.name}`);
        results.push({
          storeId: store.id,
          storeName: store.name,
          status: 'success',
          message: 'Dry run - would migrate'
        });
        continue;
      }

      // Step 1: Ensure theme exists
      const existingTheme = await db.select().from(themes)
        .where(eq(themes.shopId, store.id))
        .limit(1);
      
      let themeId: string;
      if (existingTheme.length === 0) {
        themeId = `theme_${store.id}_${Date.now()}`;
        await db.insert(themes).values({
          id: themeId,
          shopId: store.id,
          name: 'Migrated Theme',
          presetId: themeConfig.templateId || 'starter-store',
          isActive: 1,
        });
        console.log(`   ✅ Created theme: ${themeId}`);
      } else {
        themeId = existingTheme[0].id;
        console.log(`   ℹ️  Using existing theme: ${themeId}`);
      }

      // Step 2: Ensure home template exists
      const existingTemplate = await db.select().from(themeTemplates)
        .where(eq(themeTemplates.themeId, themeId))
        .limit(1);
      
      let templateId: string;
      if (existingTemplate.length === 0) {
        templateId = `template_${store.id}_home_${Date.now()}`;
        await db.insert(themeTemplates).values({
          id: templateId,
          shopId: store.id,
          themeId: themeId,
          templateKey: 'home',
          title: 'Home Page',
        });
        console.log(`   ✅ Created template: ${templateId}`);
      } else {
        templateId = existingTemplate[0].id;
        console.log(`   ℹ️  Using existing template: ${templateId}`);
      }

      // Step 3: Migrate sections to draft
      const sections = themeConfig.sections || [];
      
      // Delete existing draft sections
      await db.delete(templateSectionsDraft)
        .where(eq(templateSectionsDraft.templateId, templateId));
      
      // Insert new sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await db.insert(templateSectionsDraft).values({
          id: `draft_${section.id}_${Date.now()}_${i}`,
          shopId: store.id,
          templateId: templateId,
          type: section.type,
          enabled: 1,
          sortOrder: i,
          propsJson: JSON.stringify(section.settings || {}),
          blocksJson: '[]',
          version: 1,
        });
      }
      console.log(`   ✅ Migrated ${sections.length} sections to draft`);

      // Step 4: Migrate theme settings to draft
      const themeSettings = {
        primaryColor: themeConfig.primaryColor,
        accentColor: themeConfig.accentColor,
        backgroundColor: themeConfig.backgroundColor,
        textColor: themeConfig.textColor,
        borderColor: themeConfig.borderColor,
        typography: themeConfig.typography,
        bannerUrl: themeConfig.bannerUrl,
        bannerText: themeConfig.bannerText,
        customCSS: themeConfig.customCSS,
        headerLayout: themeConfig.headerLayout,
        headerShowSearch: themeConfig.headerShowSearch,
        headerShowCart: themeConfig.headerShowCart,
        footerDescription: themeConfig.footerDescription,
        copyrightText: themeConfig.copyrightText,
        footerColumns: themeConfig.footerColumns,
        floatingWhatsappEnabled: themeConfig.floatingWhatsappEnabled,
        floatingWhatsappNumber: themeConfig.floatingWhatsappNumber,
        floatingWhatsappMessage: themeConfig.floatingWhatsappMessage,
        floatingCallEnabled: themeConfig.floatingCallEnabled,
        floatingCallNumber: themeConfig.floatingCallNumber,
        checkoutStyle: themeConfig.checkoutStyle,
        flashSale: themeConfig.flashSale,
        trustBadges: themeConfig.trustBadges,
        marketingPopup: themeConfig.marketingPopup,
        seo: themeConfig.seo,
      };

      // Upsert theme settings draft
      const existingSettingsDraft = await db.select().from(themeSettingsDraft)
        .where(eq(themeSettingsDraft.themeId, themeId))
        .limit(1);
      
      if (existingSettingsDraft.length === 0) {
        await db.insert(themeSettingsDraft).values({
          id: `settings_draft_${themeId}_${Date.now()}`,
          shopId: store.id,
          themeId: themeId,
          settingsJson: JSON.stringify(themeSettings),
          version: 1,
        });
      } else {
        await db.update(themeSettingsDraft).set({
          settingsJson: JSON.stringify(themeSettings),
          version: (existingSettingsDraft[0].version || 1) + 1,
          updatedAt: new Date(),
        }).where(eq(themeSettingsDraft.themeId, themeId));
      }
      console.log(`   ✅ Migrated theme settings to draft`);

      // Step 5: Auto-publish if enabled
      if (autoPublish) {
        // Copy sections to published
        await db.delete(templateSectionsPublished)
          .where(eq(templateSectionsPublished.templateId, templateId));
        
        const draftSections = await db.select().from(templateSectionsDraft)
          .where(eq(templateSectionsDraft.templateId, templateId));
        
        for (const section of draftSections) {
          await db.insert(templateSectionsPublished).values({
            id: `pub_${section.id}_${Date.now()}`,
            shopId: store.id,
            templateId: templateId,
            type: section.type,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            propsJson: section.propsJson,
            blocksJson: section.blocksJson,
          });
        }

        // Copy settings to published
        await db.delete(themeSettingsPublished)
          .where(eq(themeSettingsPublished.themeId, themeId));
        
        const draftSettings = await db.select().from(themeSettingsDraft)
          .where(eq(themeSettingsDraft.themeId, themeId))
          .limit(1);
        
        if (draftSettings.length > 0) {
          await db.insert(themeSettingsPublished).values({
            id: `settings_pub_${themeId}_${Date.now()}`,
            shopId: store.id,
            themeId: themeId,
            settingsJson: draftSettings[0].settingsJson,
          });
        }
        console.log(`   ✅ Auto-published to production tables`);
      }

      results.push({
        storeId: store.id,
        storeName: store.name,
        status: 'success',
        message: `Migrated ${sections.length} sections${autoPublish ? ' + published' : ''}`
      });

    } catch (error) {
      console.error(`   ❌ Error migrating store ${store.id}:`, error);
      results.push({
        storeId: store.id,
        storeName: store.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Summary
  const success = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  return results;
}

// CLI runner (for direct execution)
// Usage: D1_DATABASE_ID=xxx npx tsx db/seeds/migrate-theme-config.ts
if (require.main === module) {
  console.log('⚠️  This script should be run via Wrangler or with proper D1 bindings.');
  console.log('   Example: wrangler d1 execute DB --local --file=migration-runner.sql');
  console.log('   Or import and call migrateThemeConfigs() from a Remix action.');
}

export default migrateThemeConfigs;
