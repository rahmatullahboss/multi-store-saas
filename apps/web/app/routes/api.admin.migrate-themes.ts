/**
 * API Route: Migrate Theme Configs
 * 
 * POST /api/admin/migrate-themes
 * 
 * Migrates existing stores' themeConfig to the new draft/publish system.
 * Only accessible by super admins.
 * 
 * Body options:
 *   - autoPublish: boolean (default: true) - Also publish after migration
 *   - dryRun: boolean (default: false) - Preview only, no changes
 *   - storeIds: number[] (optional) - Specific stores to migrate
 */

import { json, type ActionFunction, type LoaderFunction } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '~/services/auth.server';
import { stores } from '@db/schema';
import { 
  themes, 
  themeTemplates, 
  templateSectionsDraft, 
  templateSectionsPublished,
  themeSettingsDraft,
  themeSettingsPublished 
} from '@db/schema_templates';

// Loader - GET request (status check)
export const loader: LoaderFunction = async ({ request, context }) => {
  const db = drizzle(context.cloudflare.env.DB);
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  
  // Get migration status
  const allStores = await db.select({ id: stores.id, name: stores.name }).from(stores);
  const migratedThemes = await db.select({ shopId: themes.shopId }).from(themes);
  
  const migratedIds = new Set(migratedThemes.map(t => t.shopId));
  
  return json({
    total: allStores.length,
    migrated: migratedIds.size,
    pending: allStores.length - migratedIds.size,
    stores: allStores.map(s => ({
      id: s.id,
      name: s.name,
      migrated: migratedIds.has(s.id)
    }))
  });
};

// Action - POST request (run migration)
export const action: ActionFunction = async ({ request, context }) => {
  const db = drizzle(context.cloudflare.env.DB);
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  const body = await request.json().catch(() => ({}));
  
  const { 
    autoPublish = true, 
    dryRun = false, 
    storeIds = [] 
  } = body as { 
    autoPublish?: boolean; 
    dryRun?: boolean; 
    storeIds?: number[] 
  };

  const results: Array<{
    storeId: number;
    storeName: string;
    status: 'success' | 'skipped' | 'error';
    message: string;
  }> = [];

  try {
    // Get stores to migrate
    const allStores = await db.select().from(stores);
    const storesToMigrate = storeIds.length 
      ? allStores.filter(s => storeIds.includes(s.id))
      : allStores;

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

        const themeConfig = typeof themeConfigRaw === 'string'
          ? JSON.parse(themeConfigRaw)
          : themeConfigRaw;

        if (dryRun) {
          results.push({
            storeId: store.id,
            storeName: store.name,
            status: 'success',
            message: `Dry run - would migrate ${themeConfig.sections?.length || 0} sections`
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
        } else {
          themeId = existingTheme[0].id;
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
        } else {
          templateId = existingTemplate[0].id;
        }

        // Step 3: Migrate sections to draft
        const sections = themeConfig.sections || [];
        
        await db.delete(templateSectionsDraft)
          .where(eq(templateSectionsDraft.templateId, templateId));
        
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

        // Step 5: Auto-publish if enabled
        if (autoPublish) {
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
        }

        results.push({
          storeId: store.id,
          storeName: store.name,
          status: 'success',
          message: `Migrated ${sections.length} sections${autoPublish ? ' + published' : ''}`
        });

      } catch (error) {
        results.push({
          storeId: store.id,
          storeName: store.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = {
      success: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    return json({ 
      success: true, 
      summary,
      results,
      message: `Migration complete: ${summary.success} success, ${summary.skipped} skipped, ${summary.errors} errors`
    });

  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed' 
    }, { status: 500 });
  }
};


export default function() {}
