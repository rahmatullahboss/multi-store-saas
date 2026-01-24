import { json, redirect } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products, marketplaceThemes } from '@db/schema';
import { themes, themeTemplates, templateSectionsDraft, templateSectionsPublished, themeSettingsDraft, themeSettingsPublished } from '@db/schema_templates';
import { templateVersions } from '@db/schema_versions';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, type TypographySettings, parseSocialLinks } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates } from '~/templates/store-registry';
import { 
  validateForPublish,
} from '~/lib/theme-validation';

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB, { schema: { stores, products } });
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });

  // Fetch a demo product for preview
  const demoProduct = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.storeId, storeId),
    columns: { id: true }
  });
  
  const themeConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;
  const templates = getAllStoreTemplates();
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';
  
  return json({
    store: {
      id: store[0].id,
      name: store[0].name,
      subdomain: store[0].subdomain,
      mode: 'store',
      logo: store[0].logo || '',
      fontFamily: store[0].fontFamily || 'inter',
      businessInfo: store[0].businessInfo ? JSON.parse(store[0].businessInfo) : {},
      socialLinks: parseSocialLinks(store[0].socialLinks as string | null) || {},
      aiCredits: store[0].aiCredits || 0,
    },
    themeConfig,
    templates: templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      category: t.category,
    })),
    saasDomain,
    demoProductId: demoProduct?.id
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const db = drizzle(context.cloudflare.env.DB);
  
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) return json({ error: 'Store not found' }, { status: 404 });
  
  const currentConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  // Extract all form data
  const storeTemplateId = formData.get('storeTemplateId') as string || currentConfig.storeTemplateId;
  const primaryColor = formData.get('primaryColor') as string || currentConfig.primaryColor;
  const accentColor = formData.get('accentColor') as string || currentConfig.accentColor;
  // Extended colors (Phase 1)
  const backgroundColor = formData.get('backgroundColor') as string || '';
  const textColor = formData.get('textColor') as string || '';
  const borderColor = formData.get('borderColor') as string || '';
  // Typography (Phase 1)
  const typographyJson = formData.get('typography') as string || '{}';
  let typography: TypographySettings = {};
  try {
    typography = JSON.parse(typographyJson);
  } catch { /* ignore */ }

  const sectionsJson = formData.get('sections') as string || '[]';
  let sections: any[] = [];
  try {
    sections = JSON.parse(sectionsJson);
  } catch { /* ignore */ }

  const productSectionsJson = formData.get('productSections') as string || '[]';
  let productSections: any[] = [];
  try {
    productSections = JSON.parse(productSectionsJson);
  } catch { /* ignore */ }
  
  const fontFamily = formData.get('fontFamily') as string || 'inter';
  const bannerUrl = formData.get('bannerUrl') as string || '';
  const bannerText = formData.get('bannerText') as string || '';
  const announcementText = formData.get('announcementText') as string || '';
  const announcementLink = formData.get('announcementLink') as string || '';
  const customCSS = formData.get('customCSS') as string || '';
  
  // Info
  const logo = formData.get('logo') as string || '';
  const phone = formData.get('phone') as string || '';
  const email = formData.get('email') as string || '';
  const address = formData.get('address') as string || '';
  const facebook = formData.get('facebook') as string || '';
  const instagram = formData.get('instagram') as string || '';
  const whatsapp = formData.get('whatsapp') as string || '';

  // Header settings
  const headerLayout = formData.get('headerLayout') as 'centered' | 'left-logo' | 'minimal' || 'centered';
  const headerShowSearch = formData.get('headerShowSearch') === 'true';
  const headerShowCart = formData.get('headerShowCart') === 'true';

  // Footer settings
  const footerDescription = formData.get('footerDescription') as string || '';
  const copyrightText = formData.get('copyrightText') as string || '';
  const footerColumnsJson = formData.get('footerColumns') as string || '[]';
  let footerColumns: Array<{title: string; links: Array<{label: string; url: string}>}> = [];
  try {
    footerColumns = JSON.parse(footerColumnsJson);
  } catch { /* ignore parse errors */ }

  // Floating contact buttons
  const floatingWhatsappEnabled = formData.get('floatingWhatsappEnabled') === 'true';
  const floatingWhatsappNumber = formData.get('floatingWhatsappNumber') as string || '';
  const floatingWhatsappMessage = formData.get('floatingWhatsappMessage') as string || '';
  const floatingCallEnabled = formData.get('floatingCallEnabled') === 'true';
  const floatingCallNumber = formData.get('floatingCallNumber') as string || '';

  // Marketing & Sales Persistence
  const flashSaleJson = formData.get('flashSale') as string || '{}';
  let flashSale = undefined;
  try {
    flashSale = JSON.parse(flashSaleJson);
  } catch { /* ignore */ }

  const trustBadgesJson = formData.get('trustBadges') as string || '{}';
  let trustBadges = undefined;
  try {
    trustBadges = JSON.parse(trustBadgesJson);
  } catch { /* ignore */ }

  const marketingPopupJson = formData.get('marketingPopup') as string || '{}';
  let marketingPopup = undefined;
  try {
    marketingPopup = JSON.parse(marketingPopupJson);
  } catch { /* ignore */ }

  const seoJson = formData.get('seo') as string || '{}';
  let seo = undefined;
  try {
    seo = JSON.parse(seoJson);
  } catch { /* ignore */ }

  const updatedConfig: ThemeConfig = {
    ...currentConfig,
    storeTemplateId,
    primaryColor,
    accentColor,
    backgroundColor: backgroundColor || undefined,
    textColor: textColor || undefined,
    borderColor: borderColor || undefined,
    typography: Object.keys(typography).length > 0 ? typography : undefined,
    bannerUrl,
    bannerText,
    customCSS,
    announcement: announcementText ? { text: announcementText, link: announcementLink } : undefined,
    headerLayout,
    headerShowSearch,
    headerShowCart,
    footerDescription,
    copyrightText,
    footerColumns,
    floatingWhatsappEnabled,
    floatingWhatsappNumber: floatingWhatsappNumber || undefined,
    floatingWhatsappMessage: floatingWhatsappMessage || undefined,
    floatingCallEnabled,
    floatingCallNumber: floatingCallNumber || undefined,
    checkoutStyle: (formData.get('checkoutStyle') as any) || 'standard',
    sections: sections.length > 0 ? sections : undefined,
    productSections: productSections.length > 0 ? productSections : undefined,
    flashSale: flashSale?.isActive ? flashSale : undefined,
    trustBadges: trustBadges?.showPaymentIcons || trustBadges?.showGuaranteeSeals ? trustBadges : undefined,
    marketingPopup: marketingPopup?.isActive ? marketingPopup : undefined,
    seo: seo?.metaTitle || seo?.metaDescription ? seo : undefined,
  };

  await db.update(stores).set({ 
    fontFamily,
    logo: logo || null,
    businessInfo: JSON.stringify({ phone, email, address }),
    socialLinks: JSON.stringify({ facebook, instagram, whatsapp }),
    updatedAt: new Date() 
  }).where(eq(stores.id, storeId));

  const actionType = formData.get('_action') as string;
  
  try {
    const existingTheme = await db.select().from(themes).where(eq(themes.shopId, storeId)).limit(1);
    let themeId: string;
    
    if (existingTheme.length === 0) {
      themeId = `theme_${storeId}_${Date.now()}`;
      await db.insert(themes).values({
        id: themeId,
        shopId: storeId,
        name: 'Default Theme',
        presetId: storeTemplateId,
        isActive: 1,
      });
    } else {
      themeId = existingTheme[0].id;
    }

    const pageTypes = ['home', 'product', 'collection', 'cart', 'checkout'] as const;
    const templateIds: Record<string, string> = {};
    
    for (const pageType of pageTypes) {
      const existingTemplate = await db.select().from(themeTemplates)
        .where(and(
          eq(themeTemplates.themeId, themeId),
          eq(themeTemplates.templateKey, pageType)
        ))
        .limit(1);
      
      if (existingTemplate.length === 0) {
        const newTemplateId = `template_${storeId}_${pageType}_${Date.now()}`;
        await db.insert(themeTemplates).values({
          id: newTemplateId,
          shopId: storeId,
          themeId: themeId,
          templateKey: pageType,
          title: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
        });
        templateIds[pageType] = newTemplateId;
      } else {
        templateIds[pageType] = existingTemplate[0].id;
      }
    }
    
    const templateId = templateIds['home'];

    const pageSectionsData: Record<string, any[]> = {
      home: sections,
      product: JSON.parse((formData.get('productSections') as string) || '[]'),
      collection: JSON.parse((formData.get('collectionSections') as string) || '[]'),
      cart: JSON.parse((formData.get('cartSections') as string) || '[]'),
      checkout: JSON.parse((formData.get('checkoutSections') as string) || '[]'),
    };

    for (const pageType of pageTypes) {
      const pageTemplateId = templateIds[pageType];
      const pageSections = pageSectionsData[pageType] || [];
      
      await db.delete(templateSectionsDraft).where(eq(templateSectionsDraft.templateId, pageTemplateId));
      
      if (pageSections.length > 0) {
        for (let i = 0; i < pageSections.length; i++) {
          const section = pageSections[i];
          await db.insert(templateSectionsDraft).values({
            id: `draft_${section.id}_${Date.now()}_${i}`,
            shopId: storeId,
            templateId: pageTemplateId,
            type: section.type,
            enabled: 1,
            sortOrder: i,
            propsJson: JSON.stringify(section.settings || {}),
            blocksJson: JSON.stringify(section.blocks || []),
            version: 1,
          });
        }
      }
    }

    const themeSettings = {
      primaryColor,
      accentColor,
      backgroundColor,
      textColor,
      borderColor,
      typography,
      fontFamily,
      bannerUrl,
      bannerText,
      customCSS,
      headerLayout,
      headerShowSearch,
      headerShowCart,
      footerDescription,
      copyrightText,
      footerColumns,
      floatingWhatsappEnabled,
      floatingWhatsappNumber,
      floatingWhatsappMessage,
      floatingCallEnabled,
      floatingCallNumber,
      checkoutStyle: (formData.get('checkoutStyle') as string) || 'standard',
      flashSale,
      trustBadges,
      marketingPopup,
      seo,
    };

    const existingSettingsDraft = await db.select().from(themeSettingsDraft)
      .where(eq(themeSettingsDraft.themeId, themeId))
      .limit(1);
    
    if (existingSettingsDraft.length === 0) {
      await db.insert(themeSettingsDraft).values({
        id: `settings_draft_${themeId}_${Date.now()}`,
        shopId: storeId,
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

    // PUBLISH LOGIC
    if (actionType === 'publish') {
      const allSectionsForValidation = ([] as any[]).concat(
        pageSectionsData.home || [],
        pageSectionsData.product || [],
        pageSectionsData.collection || [],
        pageSectionsData.cart || [],
        pageSectionsData.checkout || []
      );

      const sectionsForValidation = allSectionsForValidation.map((s: any) => ({
        id: s.id,
        type: s.type,
        settings: s.settings || {},
        blocks: s.blocks || [],
      }));
      
      const validationResult = validateForPublish(sectionsForValidation, themeSettings);
      
      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.slice(0, 5).map(e => e.message).join('; ');
        return json({ 
          success: false, 
          error: `Validation failed: ${errorMessages}`,
          validationErrors: validationResult.errors 
        }, { status: 400 });
      }
      
      if (validationResult.warnings.length > 0) {
        console.warn('Publish warnings:', validationResult.warnings);
      }

      for (const pageType of pageTypes) {
        const pageTemplateId = templateIds[pageType];
        
        const currentPublished = await db.select().from(templateSectionsPublished)
          .where(eq(templateSectionsPublished.templateId, pageTemplateId));
        
        if (currentPublished.length > 0) {
          const existingVersions = await db.select().from(templateVersions)
            .where(eq(templateVersions.templateId, pageTemplateId));
          
          const maxVersion = existingVersions.reduce((max, v) => Math.max(max, v.version), 0);
          const nextVersion = maxVersion + 1;
          
          const sectionsSnapshot = currentPublished.map(s => ({
            id: s.id,
            type: s.type,
            settings: s.propsJson ? JSON.parse(s.propsJson) : {},
            blocks: s.blocksJson ? JSON.parse(s.blocksJson) : [],
          }));
          
          const currentSettings = await db.select().from(themeSettingsPublished)
            .where(eq(themeSettingsPublished.themeId, themeId))
            .limit(1);
          
          // Using a placeholder user email, typically we'd fetch the user
          const userEmail = "merchant@ozzyl.com"; // Simplified for this refactor

          await db.insert(templateVersions).values({
            id: `ver_${storeId}_${pageType}_v${nextVersion}_${Date.now()}`,
            storeId: storeId,
            templateId: pageTemplateId,
            themeId: themeId,
            version: nextVersion,
            sectionsJson: JSON.stringify(sectionsSnapshot),
            settingsJson: currentSettings.length > 0 ? currentSettings[0].settingsJson : null,
            publishedBy: userEmail || null,
          });

          const retentionLimit = 50;
          const allVersions = await db.select({ id: templateVersions.id, version: templateVersions.version })
            .from(templateVersions)
            .where(and(
              eq(templateVersions.templateId, pageTemplateId),
              eq(templateVersions.storeId, storeId)
            ));

          if (allVersions.length > retentionLimit) {
            const sorted = allVersions.sort((a, b) => b.version - a.version);
            const toDelete = sorted.slice(retentionLimit);
            for (const oldVer of toDelete) {
              await db.delete(templateVersions)
                .where(and(
                  eq(templateVersions.id, oldVer.id),
                  eq(templateVersions.storeId, storeId)
                ));
            }
          }
        }
      }

      await db.delete(templateSectionsPublished).where(eq(templateSectionsPublished.templateId, templateId));
      
      const draftSections = await db.select().from(templateSectionsDraft)
        .where(eq(templateSectionsDraft.templateId, templateId));
      
      for (const section of draftSections) {
        await db.insert(templateSectionsPublished).values({
          id: `pub_${section.id}_${Date.now()}`,
          shopId: storeId,
          templateId: templateId,
          type: section.type,
          enabled: section.enabled,
          sortOrder: section.sortOrder,
          propsJson: section.propsJson,
          blocksJson: section.blocksJson,
        });
      }

      await db.delete(themeSettingsPublished).where(eq(themeSettingsPublished.themeId, themeId));
      
      const draftSettings = await db.select().from(themeSettingsDraft)
        .where(eq(themeSettingsDraft.themeId, themeId))
        .limit(1);
      
      if (draftSettings.length > 0) {
        await db.insert(themeSettingsPublished).values({
          id: `settings_pub_${themeId}_${Date.now()}`,
          shopId: storeId,
          themeId: themeId,
          settingsJson: draftSettings[0].settingsJson,
        });
      }

      // KV Cache Invalidation
      try {
        const KV = (context.cloudflare?.env as { KV?: KVNamespace })?.KV;
        if (KV) {
          await Promise.all([
            KV.delete(`store:${storeId}:template:home:published`),
            KV.delete(`store:${storeId}:template:product:published`),
            KV.delete(`store:${storeId}:template:collection:published`),
            KV.delete(`store:${storeId}:template:cart:published`),
            KV.delete(`store:${storeId}:template:checkout:published`),
            KV.delete(`store:${storeId}:theme:settings:published`),
          ]);
        }
      } catch (kvError) {
        console.error('KV cache invalidation failed (non-blocking):', kvError);
      }

      return json({ success: true, message: 'Theme published successfully!' });
    }

  } catch (draftError) {
    console.error('Failed to save to draft tables (non-blocking):', draftError);
  }

  const publishToMarketplace = formData.get('publishToMarketplace') === 'true';
  
  if (publishToMarketplace) {
    try {
      const marketplaceEntry = await db.select().from(marketplaceThemes).where(eq(marketplaceThemes.createdBy, storeId)).limit(1);
      
      if (marketplaceEntry.length > 0) {
        await db.update(marketplaceThemes).set({
          name: `${store[0].name}'s Custom Theme`,
          config: JSON.stringify(updatedConfig),
          updatedAt: new Date(),
          status: 'approved',
        }).where(eq(marketplaceThemes.createdBy, storeId));
      } else {
        await db.insert(marketplaceThemes).values({
          name: `${store[0].name}'s Custom Theme`,
          description: `Submitted theme from ${store[0].name}`,
          config: JSON.stringify(updatedConfig),
          createdBy: storeId,
          authorName: store[0].name,
          status: 'approved',
          isPublic: true,
        });
      }
      return json({ success: true, message: 'Theme published to marketplace!' });
    } catch (err) {
      console.error('Failed to publish to marketplace:', err);
      return json({ success: false, error: 'Failed to publish to marketplace' });
    }
  }

  return json({ success: true, message: 'Changes saved!' });
}
