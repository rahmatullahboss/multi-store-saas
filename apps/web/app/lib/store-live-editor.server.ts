/**
 * Store Live Editor Server - Refactored with ThemeEngineDB
 *
 * This module handles the loader and action for the store live editor route.
 * Uses the new ThemeEngineDB utilities for cleaner database operations.
 */

import { json, redirect } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { stores, products, marketplaceThemes } from '@db/schema';
import {
  themes,
  themeTemplates,
  templateSectionsPublished,
  themeSettingsDraft,
  themeSettingsPublished,
  type TemplateKey,
} from '@db/schema_templates';
import { templateVersions } from '@db/schema_versions';
import {
  parseThemeConfig,
  defaultThemeConfig,
  type ThemeConfig,
  parseSocialLinks,
} from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates } from '~/templates/store-registry';
import { validateForPublish } from '~/lib/theme-validation';
import {
  ThemeEngineDB,
  saveTemplateDraft,
  publishTemplate,
  type SectionInstance,
} from '~/lib/theme-engine';
import { ThemeBridge, getThemeBridge } from '~/lib/theme-engine/ThemeBridge';
import type { TemplateJSON, BlockInstance } from '~/lib/theme-engine/types';
import {
  parseThemeEditorFormData,
  validateSectionSettings,
} from '~/lib/validations/theme-editor.schema';

// ============================================================================
// HELPER: Convert TemplateJSON to SectionInstance[]
// ============================================================================

/**
 * Convert a Shopify OS 2.0 TemplateJSON format to SectionInstance[] array.
 * This is used to load theme defaults when DB has no sections.
 */
function templateJsonToSections(template: TemplateJSON): SectionInstance[] {
  if (!template || !template.order || !template.sections) {
    return [];
  }

  const result: SectionInstance[] = [];

  for (const sectionId of template.order) {
    const sectionData = template.sections[sectionId];
    if (!sectionData) {
      continue;
    }

    // Convert blocks object to array if present
    let blocksArray: BlockInstance[] | undefined;
    if (sectionData.blocks && sectionData.block_order) {
      // blocks is an object, convert using block_order
      const blocksObj = sectionData.blocks as unknown as Record<
        string,
        { type: string; settings?: Record<string, unknown> }
      >;
      blocksArray = sectionData.block_order.map((blockId) => {
        const blockData = blocksObj[blockId];
        return {
          id: blockId,
          type: blockData?.type || 'unknown',
          settings: blockData?.settings || {},
        };
      });
    } else if (sectionData.blocks && Array.isArray(sectionData.blocks)) {
      // Already an array
      blocksArray = sectionData.blocks as BlockInstance[];
    }

    result.push({
      id: sectionId,
      type: sectionData.type,
      settings: sectionData.settings || {},
      blocks: blocksArray,
      block_order: sectionData.block_order,
      disabled: sectionData.disabled,
    });
  }

  return result;
}

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
    columns: { id: true },
  });

  // Load themeConfig from stores table (legacy) or from theme settings (new)
  let themeConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  // Try to load theme settings from new system
  const themeSettings = await ThemeEngineDB.loadThemeSettingsFromDB(
    context.cloudflare.env.DB,
    storeId,
    true // useDraft
  );

  // Merge if new settings exist
  if (themeSettings) {
    themeConfig = {
      ...themeConfig,
      primaryColor: themeSettings.colors?.primary || themeConfig.primaryColor,
      accentColor: themeSettings.colors?.accent || themeConfig.accentColor,
      backgroundColor: themeSettings.colors?.background || themeConfig.backgroundColor,
      textColor: themeSettings.colors?.text || themeConfig.textColor,
      borderColor: themeSettings.colors?.border || themeConfig.borderColor,
      favicon: themeSettings.favicon || themeConfig.favicon,
    };
  }

  // Load sections from DB for each page type - Use Promise.all to avoid N+1
  const pageTypes: TemplateKey[] = ['home', 'product', 'collection', 'cart'];

  const templatePromises = pageTypes.map((pageType) =>
    ThemeEngineDB.loadTemplateFromDB(context.cloudflare.env.DB, {
      storeId,
      templateKey: pageType,
      useDraft: true,
    }).then((template) => ({ pageType, template }))
  );

  const templateResults = await Promise.all(templatePromises);

  const loadedSections: Record<string, SectionInstance[]> = {};
  for (const { pageType, template } of templateResults) {
    if (template && template.order.length > 0) {
      loadedSections[pageType] = template.order.map((id) => template.sections[id]);
    }
  }

  // Merge loaded sections into themeConfig
  // Bug #8 fix: Include blocks, block_order, and disabled properties
  if (loadedSections.home && loadedSections.home.length > 0) {
    themeConfig = {
      ...themeConfig,
      sections: loadedSections.home.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.product && loadedSections.product.length > 0) {
    themeConfig = {
      ...themeConfig,
      productSections: loadedSections.product.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.collection && loadedSections.collection.length > 0) {
    themeConfig = {
      ...themeConfig,
      collectionSections: loadedSections.collection.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.cart && loadedSections.cart.length > 0) {
    themeConfig = {
      ...themeConfig,
      cartSections: loadedSections.cart.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }

  const templates = getAllStoreTemplates();
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';

  // Get active theme's preset ID from themes table, fallback to themeConfig, then default
  let activeThemeId = 'starter-store';

  const activeTheme = await db
    .select({ presetId: themes.presetId })
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (activeTheme[0]?.presetId) {
    activeThemeId = activeTheme[0].presetId;
  } else if (themeConfig.storeTemplateId) {
    activeThemeId = themeConfig.storeTemplateId;
  }

  // ============================================================================
  // FALLBACK: Load theme default sections when DB is empty
  // ============================================================================
  // This fixes the issue where selecting a template in store-design doesn't
  // save sections to DB, so LiveEditor has nothing to render.
  const themeBridge = getThemeBridge(activeThemeId);

  // Map template types to their corresponding TemplateJSON template names
  const templateTypeMap: Record<string, string> = {
    home: 'index',
    product: 'product',
    collection: 'collection',
    cart: 'cart',
  };

  // Load fallback sections from theme for each empty page type
  for (const pageType of pageTypes) {
    if (!loadedSections[pageType] || loadedSections[pageType].length === 0) {
      const templateName = templateTypeMap[pageType] || 'index';
      const themeTemplate = themeBridge.getTemplate(templateName);
      if (themeTemplate) {
        loadedSections[pageType] = templateJsonToSections(themeTemplate);
        console.info(
          `[store-live-editor] Loaded ${loadedSections[pageType].length} default sections for "${pageType}" from theme "${activeThemeId}"`
        );
      }
    }
  }

  // Re-apply loadedSections to themeConfig after fallback
  // IMPORTANT: Always use theme defaults if loadedSections has data
  // This ensures the editor shows the complete theme exactly as designed
  if (loadedSections.home && loadedSections.home.length > 0) {
    themeConfig = {
      ...themeConfig,
      sections: loadedSections.home.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.product && loadedSections.product.length > 0) {
    themeConfig = {
      ...themeConfig,
      productSections: loadedSections.product.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.collection && loadedSections.collection.length > 0) {
    themeConfig = {
      ...themeConfig,
      collectionSections: loadedSections.collection.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }
  if (loadedSections.cart && loadedSections.cart.length > 0) {
    themeConfig = {
      ...themeConfig,
      cartSections: loadedSections.cart.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings as Record<string, unknown>,
        blocks: s.blocks,
        block_order: s.block_order,
        disabled: s.disabled,
      })),
    };
  }

  // Get available OS 2.0 themes from ThemeBridge
  const availableThemes = ThemeBridge.getAvailableThemes();

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
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
    })),
    saasDomain,
    demoProductId: demoProduct?.id,
    // Theme Switcher data
    themeId: activeThemeId,
    availableThemes: availableThemes.map((t) => ({
      id: t.id,
      name: t.name,
      nameBn: t.nameBn,
      description: t.description,
      previewImage: t.previewImage,
    })),
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

  // Use D1 Sessions for read-after-write consistency
  // Note: Drizzle ORM doesn't support D1DatabaseSession directly, so we use raw session for D1 ops
  // and regular drizzle for ORM operations. Write operations go through session.
  // const session = context.cloudflare.env.DB.withSession('first-primary'); // Unused
  const db = drizzle(context.cloudflare.env.DB);
  const rawDb = context.cloudflare.env.DB;

  // Verify store exists AND belongs to this user (authorization check)
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) return json({ error: 'Store not found' }, { status: 404 });

  const currentConfig =
    parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  // ============================================================================
  // VALIDATE FORM DATA WITH ZOD
  // ============================================================================
  const validationResult = parseThemeEditorFormData(formData);

  if (!validationResult.success) {
    console.error('Theme editor validation failed:', validationResult.error.errors);
    return json(
      {
        error: 'Invalid form data',
        details: validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      },
      { status: 400 }
    );
  }

  const validatedData = validationResult.data;

  // Extract validated values (with sanitization already applied)
  const themeId = validatedData.themeId;
  const storeTemplateId = validatedData.storeTemplateId || currentConfig.storeTemplateId;
  const primaryColor = validatedData.primaryColor || currentConfig.primaryColor;
  const accentColor = validatedData.accentColor || currentConfig.accentColor;
  const backgroundColor = validatedData.backgroundColor;
  const textColor = validatedData.textColor;
  const borderColor = validatedData.borderColor;
  const typography = validatedData.typography;
  const fontFamily = validatedData.fontFamily;

  // Sections (already validated and sanitized by Zod)
  const sections: SectionInstance[] = validatedData.sections.map((s) => ({
    id: s.id,
    type: s.type,
    disabled: s.disabled,
    settings: validateSectionSettings(s.settings),
    blocks: s.blocks?.map((b) => ({
      id: b.id,
      type: b.type,
      disabled: b.disabled,
      settings: validateSectionSettings(b.settings),
    })),
    block_order: s.block_order,
  }));

  const productSections: SectionInstance[] = validatedData.productSections.map((s) => ({
    id: s.id,
    type: s.type,
    disabled: s.disabled,
    settings: validateSectionSettings(s.settings),
    blocks: s.blocks?.map((b) => ({
      id: b.id,
      type: b.type,
      disabled: b.disabled,
      settings: validateSectionSettings(b.settings),
    })),
    block_order: s.block_order,
  }));

  const collectionSections: SectionInstance[] = validatedData.collectionSections.map((s) => ({
    id: s.id,
    type: s.type,
    disabled: s.disabled,
    settings: validateSectionSettings(s.settings),
    blocks: s.blocks?.map((b) => ({
      id: b.id,
      type: b.type,
      disabled: b.disabled,
      settings: validateSectionSettings(b.settings),
    })),
    block_order: s.block_order,
  }));

  const cartSections: SectionInstance[] = validatedData.cartSections.map((s) => ({
    id: s.id,
    type: s.type,
    disabled: s.disabled,
    settings: validateSectionSettings(s.settings),
    blocks: s.blocks?.map((b) => ({
      id: b.id,
      type: b.type,
      disabled: b.disabled,
      settings: validateSectionSettings(b.settings),
    })),
    block_order: s.block_order,
  }));

  const checkoutSections: SectionInstance[] = validatedData.checkoutSections.map((s) => ({
    id: s.id,
    type: s.type,
    disabled: s.disabled,
    settings: validateSectionSettings(s.settings),
    blocks: s.blocks?.map((b) => ({
      id: b.id,
      type: b.type,
      disabled: b.disabled,
      settings: validateSectionSettings(b.settings),
    })),
    block_order: s.block_order,
  }));

  // Other validated settings
  const bannerUrl = validatedData.bannerUrl;
  const bannerText = validatedData.bannerText;
  const announcementText = validatedData.announcementText;
  const announcementLink = validatedData.announcementLink;
  const customCSS = validatedData.customCSS;
  const logo = validatedData.logo;
  const favicon = validatedData.favicon;
  const phone = validatedData.phone;
  const email = validatedData.email;
  const address = validatedData.address;
  const facebook = validatedData.facebook;
  const instagram = validatedData.instagram;
  const whatsapp = validatedData.whatsapp;
  const headerLayout = validatedData.headerLayout;
  const headerShowSearch = validatedData.headerShowSearch;
  const headerShowCart = validatedData.headerShowCart;
  const footerDescription = validatedData.footerDescription;
  const copyrightText = validatedData.copyrightText;
  const footerColumns = validatedData.footerColumns;
  const floatingWhatsappEnabled = validatedData.floatingWhatsappEnabled;
  const floatingWhatsappNumber = validatedData.floatingWhatsappNumber;
  const floatingWhatsappMessage = validatedData.floatingWhatsappMessage;
  const floatingCallEnabled = validatedData.floatingCallEnabled;
  const floatingCallNumber = validatedData.floatingCallNumber;
  // checkoutStyle removed (unused)
  const flashSale = validatedData.flashSale;
  const trustBadges = validatedData.trustBadges;
  const marketingPopup = validatedData.marketingPopup;
  const seo = validatedData.seo;
  const actionType = validatedData._action;

  // ============================================================================
  // UPDATE STORE RECORD (Legacy support)
  // ============================================================================
  await db
    .update(stores)
    .set({
      fontFamily,
      logo: logo || null,
      businessInfo: JSON.stringify({ phone, email, address }),
      socialLinks: JSON.stringify({ facebook, instagram, whatsapp }),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  // ============================================================================
  // SAVE TO THEME ENGINE (New system)
  // ============================================================================

  try {
    // Save sections for each page type using ThemeEngineDB
    const pageSectionsMap: Record<TemplateKey, SectionInstance[]> = {
      home: sections,
      product: productSections,
      collection: collectionSections,
      cart: cartSections,
      checkout: checkoutSections,
      page: [],
      search: [],
      account: [],
    };

    // Save all page sections to drafts in parallel
    const savePromises = Object.entries(pageSectionsMap)
      .filter(([_, pageSections]) => pageSections.length > 0)
      .map(([pageType, pageSections]) =>
        saveTemplateDraft(rawDb, {
          storeId,
          templateKey: pageType as TemplateKey,
          sections: pageSections,
        })
      );

    await Promise.all(savePromises);

    // Save theme settings to draft (including the theme preset ID)
    await saveThemeSettingsDraft(rawDb, storeId, {
      presetId: themeId, // The selected theme preset (starter-store, daraz, etc.)
      primaryColor,
      accentColor,
      backgroundColor,
      textColor,
      borderColor,
      typography,
      fontFamily,
      bannerUrl,
      bannerText,
      logo,
      favicon,
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
    });

    // ============================================================================
    // PUBLISH LOGIC
    // ============================================================================
    if (actionType === 'publish') {
      // Validate before publishing
      const allSections = [
        ...sections,
        ...productSections,
        ...collectionSections,
        ...cartSections,
        ...checkoutSections,
      ];

      const sectionsForValidation = allSections.map((s) => ({
        id: s.id,
        type: s.type,
        settings: s.settings || {},
        blocks: s.blocks || [],
      }));

      const themeSettings = {
        primaryColor,
        accentColor,
        backgroundColor,
        textColor,
        borderColor,
      };

      const validationResult = validateForPublish(sectionsForValidation, themeSettings);

      if (!validationResult.valid) {
        const errorMessages = validationResult.errors
          .slice(0, 5)
          .map((e) => e.message)
          .join('; ');
        return json(
          {
            success: false,
            error: `Validation failed: ${errorMessages}`,
            validationErrors: validationResult.errors,
          },
          { status: 400 }
        );
      }

      if (validationResult.warnings.length > 0) {
        console.warn('Publish warnings:', validationResult.warnings);
      }

      // Publish all page types
      const pageTypes: TemplateKey[] = ['home', 'product', 'collection', 'cart', 'checkout'];
      for (const pageType of pageTypes) {
        // Create version backup before publishing
        await createVersionBackup(rawDb, storeId, pageType);

        // Publish template
        const result = await publishTemplate(rawDb, storeId, pageType);
        if (!result.success) {
          console.error(`Failed to publish ${pageType}:`, result.error);
        }
      }

      // Publish theme settings
      await publishThemeSettings(rawDb, storeId);

      // Invalidate KV cache
      await invalidateKVCache(
        context.cloudflare?.env as unknown as Record<string, unknown>,
        storeId
      );

      return json({ success: true, message: 'Theme published successfully!' });
    }
  } catch (error) {
    console.error('Failed to save to theme engine:', error);
    // Non-blocking - fall through to legacy save
  }

  // ============================================================================
  // LEGACY: Update themeConfig in stores table
  // ============================================================================
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
    checkoutStyle: (formData.get('checkoutStyle') as 'standard' | 'minimal') || 'standard',
    sections:
      sections.length > 0
        ? sections.map((s) => ({ id: s.id, type: s.type, settings: s.settings }))
        : undefined,
    productSections:
      productSections.length > 0
        ? productSections.map((s) => ({ id: s.id, type: s.type, settings: s.settings }))
        : undefined,
    flashSale: flashSale?.isActive ? (flashSale as ThemeConfig['flashSale']) : undefined,
    trustBadges:
      trustBadges?.showPaymentIcons || trustBadges?.showGuaranteeSeals
        ? (trustBadges as ThemeConfig['trustBadges'])
        : undefined,
    marketingPopup: marketingPopup?.isActive
      ? (marketingPopup as ThemeConfig['marketingPopup'])
      : undefined,
    seo: seo?.metaTitle || seo?.metaDescription ? seo : undefined,
  };

  await db
    .update(stores)
    .set({
      themeConfig: JSON.stringify(updatedConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  // Marketplace publishing
  const publishToMarketplace = formData.get('publishToMarketplace') === 'true';
  if (publishToMarketplace) {
    try {
      const marketplaceEntry = await db
        .select()
        .from(marketplaceThemes)
        .where(eq(marketplaceThemes.createdBy, storeId))
        .limit(1);

      if (marketplaceEntry.length > 0) {
        await db
          .update(marketplaceThemes)
          .set({
            name: `${store[0].name}'s Custom Theme`,
            config: JSON.stringify(updatedConfig),
            updatedAt: new Date(),
            status: 'approved',
          })
          .where(eq(marketplaceThemes.createdBy, storeId));
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Save theme settings to draft
 */
async function saveThemeSettingsDraft(
  db: D1Database,
  storeId: number,
  settings: Record<string, unknown>
): Promise<void> {
  const drizzleDb = drizzle(db);

  // Extract presetId if provided (for theme switching)
  const presetId = (settings.presetId as string) || null;

  // Get or create theme
  let theme = await drizzleDb
    .select()
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (!theme[0]) {
    const themeId = `theme_${storeId}_${Date.now()}`;
    await drizzleDb.insert(themes).values({
      id: themeId,
      shopId: storeId,
      name: 'Default Theme',
      presetId: presetId,
      isActive: 1,
    });
    theme = [
      {
        id: themeId,
        shopId: storeId,
        name: 'Default Theme',
        presetId,
        isActive: 1,
      } as (typeof theme)[0],
    ];
  } else if (presetId && theme[0].presetId !== presetId) {
    // Update the theme's presetId if it changed
    await drizzleDb
      .update(themes)
      .set({ presetId, updatedAt: new Date() })
      .where(eq(themes.id, theme[0].id));
  }

  // Check for existing draft
  const existingDraft = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(eq(themeSettingsDraft.themeId, theme[0].id))
    .limit(1);

  if (existingDraft.length === 0) {
    await drizzleDb.insert(themeSettingsDraft).values({
      id: `settings_draft_${theme[0].id}_${Date.now()}`,
      shopId: storeId,
      themeId: theme[0].id,
      settingsJson: JSON.stringify(settings),
      version: 1,
    });
  } else {
    await drizzleDb
      .update(themeSettingsDraft)
      .set({
        settingsJson: JSON.stringify(settings),
        version: (existingDraft[0].version || 1) + 1,
        updatedAt: new Date(),
      })
      .where(eq(themeSettingsDraft.themeId, theme[0].id));
  }
}

/**
 * Publish theme settings from draft to published
 */
async function publishThemeSettings(db: D1Database, storeId: number): Promise<void> {
  const drizzleDb = drizzle(db);

  const theme = await drizzleDb
    .select()
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (!theme[0]) return;

  const draftSettings = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(eq(themeSettingsDraft.themeId, theme[0].id))
    .limit(1);

  if (!draftSettings[0]) return;

  // Delete existing published settings
  await drizzleDb
    .delete(themeSettingsPublished)
    .where(eq(themeSettingsPublished.themeId, theme[0].id));

  // Copy draft to published
  await drizzleDb.insert(themeSettingsPublished).values({
    id: `settings_pub_${theme[0].id}_${Date.now()}`,
    shopId: storeId,
    themeId: theme[0].id,
    settingsJson: draftSettings[0].settingsJson,
  });
}

/**
 * Create version backup before publishing
 */
async function createVersionBackup(
  db: D1Database,
  storeId: number,
  templateKey: TemplateKey
): Promise<void> {
  const drizzleDb = drizzle(db);

  // Get theme and template
  const theme = await drizzleDb
    .select()
    .from(themes)
    .where(and(eq(themes.shopId, storeId), eq(themes.isActive, 1)))
    .limit(1);

  if (!theme[0]) return;

  const template = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(
      and(eq(themeTemplates.themeId, theme[0].id), eq(themeTemplates.templateKey, templateKey))
    )
    .limit(1);

  if (!template[0]) return;

  // Get current published sections
  const publishedSections = await drizzleDb
    .select()
    .from(templateSectionsPublished)
    .where(eq(templateSectionsPublished.templateId, template[0].id))
    .orderBy(asc(templateSectionsPublished.sortOrder));

  if (publishedSections.length === 0) return;

  // Get current version number
  const existingVersions = await drizzleDb
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, template[0].id));

  const maxVersion = existingVersions.reduce((max, v) => Math.max(max, v.version), 0);
  const nextVersion = maxVersion + 1;

  // Create snapshot
  const sectionsSnapshot = publishedSections.map((s) => ({
    id: s.id,
    type: s.type,
    settings: s.propsJson ? JSON.parse(s.propsJson) : {},
    blocks: s.blocksJson ? JSON.parse(s.blocksJson) : [],
  }));

  // Get current settings
  const currentSettings = await drizzleDb
    .select()
    .from(themeSettingsPublished)
    .where(eq(themeSettingsPublished.themeId, theme[0].id))
    .limit(1);

  // Save version
  await drizzleDb.insert(templateVersions).values({
    id: `ver_${storeId}_${templateKey}_v${nextVersion}_${Date.now()}`,
    storeId: storeId,
    templateId: template[0].id,
    themeId: theme[0].id,
    version: nextVersion,
    sectionsJson: JSON.stringify(sectionsSnapshot),
    settingsJson: currentSettings.length > 0 ? currentSettings[0].settingsJson : null,
    publishedBy: 'merchant@ozzyl.com', // Placeholder
  });

  // Cleanup old versions (keep last 50)
  const retentionLimit = 50;
  if (existingVersions.length >= retentionLimit) {
    const sorted = existingVersions.sort((a, b) => b.version - a.version);
    const toDelete = sorted.slice(retentionLimit - 1);
    for (const oldVer of toDelete) {
      await drizzleDb
        .delete(templateVersions)
        .where(and(eq(templateVersions.id, oldVer.id), eq(templateVersions.storeId, storeId)));
    }
  }
}

/**
 * Invalidate KV cache after publishing
 */
async function invalidateKVCache(
  env: Record<string, unknown> | undefined,
  storeId: number
): Promise<void> {
  try {
    const KV = env?.KV as KVNamespace | undefined;
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
}

// Type for D1Database
type D1Database = import('@cloudflare/workers-types').D1Database;
