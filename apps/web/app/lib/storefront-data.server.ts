/**
 * Storefront Data Builder — Server-Side Data Assembly
 * 
 * Extracts the common storefront data loading pattern into a reusable function.
 * All storefront routes (home, products, cart, checkout, collection) should use
 * this to get consistent, typed data.
 * 
 * Architecture:
 *   Route Loader → buildStorefrontData() → StorefrontData → Template Component
 * 
 * Single Source of Truth:
 *   All settings come from `getUnifiedStorefrontSettings()` (the storefront_settings column)
 *   No legacy columns (themeConfig, businessInfo, socialLinks) are ever read.
 * 
 * @see storefront-types.ts for type definitions
 */

import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { products, collections, type Store } from '@db/schema';
import { parseFooterConfig } from '@db/types';
import { getProductReviewStats, addReviewStatsToProducts } from '~/lib/reviews.server';
import {
  getStoreTemplateTheme,
  resolveStoreTemplateId,
} from '~/templates/store-registry';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import type {
  StorefrontData,
  StorefrontProduct,
  StorefrontCategory,
} from './storefront-types';

// ============================================================================
// Options
// ============================================================================
interface BuildStorefrontDataOptions {
  /** D1 database instance */
  db: DrizzleD1Database;
  /** Validated store ID */
  storeId: number;
  /** Validated store row from DB */
  store: Store;
  /** Cloudflare env for KV cache */
  env: Record<string, unknown>;
  /** Optional category filter */
  category?: string | null;
  /** Product fetch limit (default: 50) */
  productLimit?: number;
}

// ============================================================================
// Main Builder
// ============================================================================
export async function buildStorefrontData(
  options: BuildStorefrontDataOptions
): Promise<StorefrontData> {
  const { db, storeId, store, env, category = null, productLimit = 50 } = options;

  // 1. Get unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env });

  // 2. Resolve template & theme
  const storeTemplateId = unifiedSettings.theme.templateId
    || resolveStoreTemplateId(null, (store.theme as string) || null);

  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const theme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary || baseTheme.primary,
    accent: unifiedSettings.theme.accent || baseTheme.accent,
  };

  // 3. Fetch products
  const storeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined
      )
    )
    .limit(productLimit);

  // 4. Fetch categories (from collections first, fallback to product categories)
  const storeCollections = await db
    .select({
      title: collections.title,
      slug: collections.slug,
      imageUrl: collections.imageUrl,
      sortOrder: collections.sortOrder,
    })
    .from(collections)
    .where(and(eq(collections.storeId, storeId), eq(collections.isActive, true)));

  const sortedCollections = [...storeCollections].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  let categories: StorefrontCategory[];

  if (sortedCollections.length > 0) {
    categories = sortedCollections
      .filter((c) => Boolean(c.title))
      .map((c) => ({
        title: c.title!,
        slug: c.slug || c.title!.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: c.imageUrl || undefined,
      }));
  } else {
    // Fallback: extract unique categories from products
    const allProducts = await db
      .select({ category: products.category })
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)));

    const uniqueCategories = [
      ...new Set(allProducts.map((p) => p.category).filter((c): c is string => Boolean(c))),
    ];

    categories = uniqueCategories.map((c) => ({
      title: c,
      slug: c.toLowerCase().replace(/\s+/g, '-'),
    }));
  }

  // 5. Fetch review stats
  const productIds = storeProducts.map((p) => p.id);
  const reviewStats = await getProductReviewStats(db, storeId, productIds);

  // 6. Serialize products
  const serializedProducts: StorefrontProduct[] = addReviewStatsToProducts(
    storeProducts,
    reviewStats
  ).map((p) => ({
    id: p.id,
    title: p.title,
    slug: (p as Record<string, unknown>).slug as string | null || null,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.imageUrl,
    images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [],
    description: p.description,
    category: p.category,
    stock: p.inventory,
    isActive: p.isPublished ?? true,
    avgRating: p.avgRating ?? null,
    reviewCount: p.reviewCount ?? null,
  }));

  // 7. Parse footer config
  const footerConfig = parseFooterConfig(store.footerConfig as string | null);

  // 8. Branding
  const storeName = unifiedSettings.branding.storeName || store.name || 'Store';
  const logo = unifiedSettings.branding.logo || store.logo || null;

  // 9. Assemble the canonical StorefrontData
  const data: StorefrontData = {
    storeId,
    storeName,
    logo,
    favicon: unifiedSettings.branding.favicon || store.favicon || null,
    fontFamily: store.fontFamily || 'inter',
    currency: store.currency || 'BDT',
    planType: store.planType || 'free',

    templateId: storeTemplateId,
    theme,

    products: serializedProducts,
    categories,
    currentCategory: category || null,

    socialLinks: {
      facebook: unifiedSettings.social.facebook ?? null,
      instagram: unifiedSettings.social.instagram ?? null,
      whatsapp: unifiedSettings.social.whatsapp ?? null,
      twitter: unifiedSettings.social.twitter ?? null,
    },
    businessInfo: {
      phone: unifiedSettings.business.phone ?? null,
      email: unifiedSettings.business.email ?? null,
      address: unifiedSettings.business.address ?? null,
    },
    footerConfig: footerConfig || null,
    heroBanner: unifiedSettings.heroBanner || null,
    announcement: unifiedSettings.announcement || null,
    trustBadges: {
      showPaymentIcons: false,
      showGuaranteeSeals: false,
      ...unifiedSettings.trustBadges,
    },

    aiCredits: (store as Store & { aiCredits?: number }).aiCredits ?? 0,
    isCustomerAiEnabled:
      (store as Store & { isCustomerAiEnabled?: boolean }).isCustomerAiEnabled ?? false,

    floatingWhatsapp: {
      enabled: Boolean((unifiedSettings as Record<string, unknown>).floatingWhatsappEnabled),
      number: (unifiedSettings as Record<string, unknown>).floatingWhatsappNumber as string ?? null,
      message: (unifiedSettings as Record<string, unknown>).floatingWhatsappMessage as string ?? null,
    },
    floatingCall: {
      enabled: Boolean((unifiedSettings as Record<string, unknown>).floatingCallEnabled),
      number: (unifiedSettings as Record<string, unknown>).floatingCallNumber as string ?? null,
    },
  };

  return data;
}

// ============================================================================
// Re-export types for convenience
// ============================================================================
export type { StorefrontData, StorefrontProduct, StorefrontCategory } from './storefront-types';
