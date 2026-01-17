/**
 * Theme Seeding Service
 * 
 * Creates default theme, templates, and sections for a store.
 * Called when:
 * - Store enables "store mode" for the first time
 * - User installs a new theme from the theme gallery
 * 
 * This follows Shopify's pattern where templates are pre-seeded
 * and users customize rather than create from scratch.
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import {
  themes,
  themeTemplates,
  templateSectionsDraft,
  templateSectionsPublished,
  themeSettingsDraft,
  themeSettingsPublished,
  type TemplateKey,
} from '@db/schema';
import { getThemePreset, ROVO_PRESET, type ThemePresetDefinition } from './theme-presets';

// ============================================================================
// TYPES
// ============================================================================

interface SectionDefinition {
  type: string;
  enabled: boolean;
  props: Record<string, unknown>;
  blocks?: Array<{
    type: string;
    props: Record<string, unknown>;
  }>;
}

interface TemplateDefinition {
  key: TemplateKey;
  title: string;
  sections: SectionDefinition[];
}

interface ThemePresetConfig {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  templates: TemplateDefinition[];
}

/**
 * Convert ThemePresetDefinition to ThemePresetConfig format
 */
function convertPresetToConfig(preset: ThemePresetDefinition): ThemePresetConfig {
  return {
    id: preset.id,
    name: preset.name,
    settings: preset.settings,
    templates: preset.templates.map(t => ({
      key: t.key,
      title: t.title,
      sections: t.sections.map(s => ({
        type: s.type,
        enabled: s.enabled,
        props: s.props,
        blocks: s.blocks,
      })),
    })),
  };
}

// ============================================================================
// DEFAULT THEME PRESET - Bangladesh E-commerce Optimized
// ============================================================================

const DEFAULT_THEME_PRESET: ThemePresetConfig = {
  id: 'default',
  name: 'Default Store Theme',
  settings: {
    primaryColor: '#000000',
    accentColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headerStyle: 'sticky',
    showAnnouncement: true,
    announcementText: 'Free shipping on orders above ৳1000!',
    footerStyle: 'detailed',
    showNewsletter: true,
    borderRadius: 'md',
    buttonStyle: 'solid',
  },
  templates: [
    // ============================================================================
    // HOME TEMPLATE
    // ============================================================================
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'hero',
          enabled: true,
          props: {
            headline: 'Welcome to Our Store',
            subheadline: 'Discover amazing products at great prices',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            backgroundImage: '',
            alignment: 'center',
          },
        },
        {
          type: 'featured-products',
          enabled: true,
          props: {
            title: 'Featured Products',
            subtitle: 'Our best sellers',
            productCount: 8,
            columns: 4,
            showPrice: true,
            showAddToCart: true,
          },
        },
        {
          type: 'collection-list',
          enabled: true,
          props: {
            title: 'Shop by Category',
            layout: 'grid',
            columns: 3,
          },
        },
        {
          type: 'trust-badges',
          enabled: true,
          props: {
            badges: [
              { icon: 'truck', title: 'Free Delivery', description: 'On orders above ৳1000' },
              { icon: 'shield', title: 'Secure Payment', description: 'COD & Online' },
              { icon: 'refresh', title: 'Easy Returns', description: '7 days return policy' },
              { icon: 'phone', title: '24/7 Support', description: 'Call us anytime' },
            ],
          },
        },
        {
          type: 'newsletter',
          enabled: true,
          props: {
            title: 'Subscribe to Our Newsletter',
            description: 'Get updates on new products and special offers',
            buttonText: 'Subscribe',
          },
        },
      ],
    },
    
    // ============================================================================
    // PRODUCT TEMPLATE
    // ============================================================================
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'product-main',
          enabled: true,
          props: {
            showGallery: true,
            galleryPosition: 'left',
            showVariants: true,
            showQuantity: true,
            showAddToCart: true,
            showBuyNow: true,
            showTrustBadges: true,
          },
        },
        {
          type: 'product-description',
          enabled: true,
          props: {
            showTabs: true,
            tabs: ['description', 'specifications', 'shipping'],
          },
        },
        {
          type: 'product-reviews',
          enabled: true,
          props: {
            showRating: true,
            showForm: true,
            reviewsPerPage: 5,
          },
        },
        {
          type: 'related-products',
          enabled: true,
          props: {
            title: 'You May Also Like',
            productCount: 4,
            columns: 4,
          },
        },
      ],
    },
    
    // ============================================================================
    // COLLECTION TEMPLATE
    // ============================================================================
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {
            showImage: true,
            showDescription: true,
            showProductCount: true,
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 4,
            productsPerPage: 12,
            showFilters: true,
            showSort: true,
            showPrice: true,
            showAddToCart: true,
          },
        },
        {
          type: 'pagination',
          enabled: true,
          props: {
            style: 'numbered',
          },
        },
      ],
    },
    
    // ============================================================================
    // CART TEMPLATE
    // ============================================================================
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {
            showImage: true,
            showQuantitySelector: true,
            showRemoveButton: true,
            showVariantInfo: true,
          },
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {
            showSubtotal: true,
            showShipping: true,
            showDiscount: true,
            showTotal: true,
            checkoutButtonText: 'Proceed to Checkout',
          },
        },
        {
          type: 'cart-upsell',
          enabled: true,
          props: {
            title: 'You might also like',
            productCount: 4,
          },
        },
      ],
    },
    
    // ============================================================================
    // CHECKOUT TEMPLATE (Limited customization for security)
    // ============================================================================
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {
            // Bangladesh-specific checkout
            showPhoneField: true,
            phoneRequired: true,
            showDistrictSelector: true,
            showUpazilaSelector: true,
            defaultPaymentMethod: 'cod',
            showCodOption: true,
            showOnlinePayment: true,
          },
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {
            showItems: true,
            showShipping: true,
            showDiscount: true,
            showTotal: true,
          },
        },
      ],
    },
    
    // ============================================================================
    // CUSTOM PAGE TEMPLATE
    // ============================================================================
    {
      key: 'page',
      title: 'Custom Page',
      sections: [
        {
          type: 'page-header',
          enabled: true,
          props: {
            showTitle: true,
            showBreadcrumb: true,
          },
        },
        {
          type: 'page-content',
          enabled: true,
          props: {
            contentWidth: 'narrow',
          },
        },
      ],
    },
  ],
};

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Generate a UUID for IDs
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Seed default theme and templates for a store
 */
export async function seedDefaultTheme(
  db: D1Database,
  storeId: number,
  presetConfig: ThemePresetConfig = DEFAULT_THEME_PRESET
): Promise<{ themeId: string; success: boolean; error?: string }> {
  const drizzleDb = drizzle(db);
  const themeId = generateId();
  const now = new Date();
  
  try {
    // 1. Create the theme
    await drizzleDb.insert(themes).values({
      id: themeId,
      shopId: storeId,
      name: presetConfig.name,
      presetId: presetConfig.id,
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    });
    
    // 2. Create theme settings (draft + published)
    const settingsId = generateId();
    const settingsJson = JSON.stringify(presetConfig.settings);
    
    await drizzleDb.insert(themeSettingsDraft).values({
      id: settingsId,
      shopId: storeId,
      themeId: themeId,
      settingsJson,
      version: 1,
      updatedAt: now,
    });
    
    await drizzleDb.insert(themeSettingsPublished).values({
      id: settingsId,
      shopId: storeId,
      themeId: themeId,
      settingsJson,
      publishedAt: now,
    });
    
    // 3. Create templates and sections for each page type
    for (const templateDef of presetConfig.templates) {
      const templateId = generateId();
      
      // Create template
      await drizzleDb.insert(themeTemplates).values({
        id: templateId,
        shopId: storeId,
        themeId: themeId,
        templateKey: templateDef.key,
        title: templateDef.title,
        createdAt: now,
        updatedAt: now,
      });
      
      // Create sections for this template
      for (let i = 0; i < templateDef.sections.length; i++) {
        const sectionDef = templateDef.sections[i];
        const sectionId = generateId();
        const propsJson = JSON.stringify(sectionDef.props);
        const blocksJson = JSON.stringify(sectionDef.blocks || []);
        
        // Draft section
        await drizzleDb.insert(templateSectionsDraft).values({
          id: sectionId,
          shopId: storeId,
          templateId: templateId,
          type: sectionDef.type,
          enabled: sectionDef.enabled ? 1 : 0,
          sortOrder: i,
          propsJson,
          blocksJson,
          version: 1,
          createdAt: now,
          updatedAt: now,
        });
        
        // Published section (same as draft initially)
        await drizzleDb.insert(templateSectionsPublished).values({
          id: sectionId,
          shopId: storeId,
          templateId: templateId,
          type: sectionDef.type,
          enabled: sectionDef.enabled ? 1 : 0,
          sortOrder: i,
          propsJson,
          blocksJson,
          publishedAt: now,
        });
      }
    }
    
    return { themeId, success: true };
  } catch (error) {
    console.error('[seedDefaultTheme] Error:', error);
    return {
      themeId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if store has a theme configured
 */
export async function hasTheme(db: D1Database, storeId: number): Promise<boolean> {
  const drizzleDb = drizzle(db);
  
  const result = await drizzleDb
    .select({ id: themes.id })
    .from(themes)
    .where(eq(themes.shopId, storeId))
    .limit(1);
  
  return result.length > 0;
}

/**
 * Ensure store has a theme (create default if missing)
 */
export async function ensureTheme(
  db: D1Database,
  storeId: number
): Promise<{ themeId: string | null; created: boolean }> {
  const exists = await hasTheme(db, storeId);
  
  if (exists) {
    const drizzleDb = drizzle(db);
    const theme = await drizzleDb
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.shopId, storeId))
      .limit(1);
    
    return { themeId: theme[0]?.id || null, created: false };
  }
  
  const result = await seedDefaultTheme(db, storeId);
  return { themeId: result.success ? result.themeId : null, created: true };
}

/**
 * Install a theme from a preset ID
 */
export async function installThemePreset(
  db: D1Database,
  storeId: number,
  presetId: string
): Promise<{ themeId: string; success: boolean; error?: string }> {
  const preset = getThemePreset(presetId);
  
  if (!preset) {
    return {
      themeId: '',
      success: false,
      error: `Theme preset "${presetId}" not found`,
    };
  }
  
  // Deactivate existing themes
  const drizzleDb = drizzle(db);
  await drizzleDb
    .update(themes)
    .set({ isActive: 0 })
    .where(eq(themes.shopId, storeId));
  
  // Convert preset to config and seed
  const config = convertPresetToConfig(preset);
  return seedDefaultTheme(db, storeId, config);
}

/**
 * Get available theme presets for display in admin UI
 */
export function getAvailablePresets() {
  return [
    { id: 'rovo', name: 'Rovo', description: 'Clean, modern, conversion-focused', category: 'modern' },
    { id: 'daraz', name: 'Daraz Style', description: 'Marketplace-inspired with orange theme', category: 'marketplace' },
    { id: 'nova-lux', name: 'Nova Lux', description: 'Luxury design with rose gold accents', category: 'luxury' },
    { id: 'zenith-rise', name: 'Zenith Rise', description: 'Futuristic dark mode design', category: 'modern' },
    { id: 'turbo-sale', name: 'Turbo Sale', description: 'High urgency BD-optimized template', category: 'modern' },
  ];
}
