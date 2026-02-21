/**
 * Store Homepage Route - MVP Simple Theme System (Refactored)
 *
 * This version exclusively supports the 'starter-store' MVP theme.
 * Dynamic section rendering and legacy theme configuration normalization
 * have been removed to simplify the codebase and ensure stability.
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function action() {
  return null;
}
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { resolveStore } from '~/lib/store.server';

import {
  getStoreTemplate,
  getStoreTemplateTheme,
  type SerializedProduct,
  type StoreCategory,
} from '~/templates/store-registry';
import type { ThemeConfig } from '@db/types';
import { getCustomer } from '~/services/customer-auth.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { eq, desc, and } from 'drizzle-orm';
import { products as productsTable, collections as collectionsTable } from '@db/schema';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Extract settings from unified (previously from toLegacyFormat)
  const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const mergedTheme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary || baseTheme.primary,
    accent: unifiedSettings.theme.accent || baseTheme.accent,
  };
  const legacyCompat = {
    storeTemplateId,
    storeName: unifiedSettings.branding.storeName || store?.name || 'Store',
    logo: unifiedSettings.branding.logo || store?.logo || null,
    favicon: unifiedSettings.branding.favicon || store?.favicon || null,
    theme: mergedTheme,
    themeConfig: null, // Using mergedTheme instead
    mvpSettings: null,
  };

  // Use socialLinks from unified settings
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };

  // Use businessInfo from unified settings
  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // CACHING STRATEGY: Cache expensive product queries to prevent loader timeouts
  const productsCacheKey = `store:${storeId}:home:products:v1`;
  const categoriesCacheKey = `store:${storeId}:home:categories:v1`;

  let featuredProducts: SerializedProduct[] | null =
    await cache.get<SerializedProduct[]>(productsCacheKey);
  let categories: (string | StoreCategory)[] | null =
    await cache.get<(string | StoreCategory)[]>(categoriesCacheKey);

  // If cache miss, fetch from DB
  if (!featuredProducts) {
    const dbProducts = await db
      .select({
        id: productsTable.id,
        title: productsTable.title,
        price: productsTable.price,
        compareAtPrice: productsTable.compareAtPrice,
        imageUrl: productsTable.imageUrl,
        category: productsTable.category,
        inventory: productsTable.inventory,
      })
      .from(productsTable)
      .where(and(eq(productsTable.storeId, storeId), eq(productsTable.isPublished, true)))
      .orderBy(desc(productsTable.createdAt))
      .limit(12);

    featuredProducts = dbProducts.map((p) => ({
      ...p,
      handle: String(p.id),
      storeId,
      description: null,
    })) as unknown as SerializedProduct[];

    // Cache for 1 hour (3600 seconds) - Best practice for Storefront Home
    await cache.set(productsCacheKey, featuredProducts, 3600);
  }

  // If no featured products in cache, we still want categories
  if (!categories) {
    // Try to fetch from collections table first (Rich Categories with images)
    const dbCollections = await db
      .select({
        id: collectionsTable.id,
        title: collectionsTable.title,
        slug: collectionsTable.slug,
        imageUrl: collectionsTable.imageUrl,
      })
      .from(collectionsTable)
      .where(and(eq(collectionsTable.storeId, storeId), eq(collectionsTable.isActive, true)))
      .orderBy(collectionsTable.sortOrder);

    if (dbCollections.length > 0) {
      categories = dbCollections.map((c) => ({
        id: String(c.id),
        title: c.title,
        slug: c.slug,
        imageUrl: c.imageUrl || undefined,
      }));
    } else {
      // Fallback: derive from products (legacy behavior)
      const uniqueCategories = [
        ...new Set(featuredProducts.map((p) => p.category).filter(Boolean)),
      ] as string[];

      categories = uniqueCategories;
    }

    await cache.set(categoriesCacheKey, categories, 3600);
  }

  // EDGE CACHING STRATEGY
  const headers = new Headers();
  if (!customer) {
    headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
  } else {
    headers.set('Cache-Control', 'private, max-age=60');
  }

  return json(
    {
      storeId,
      storeName: legacyCompat.storeName,
      logo: legacyCompat.logo,
      favicon: legacyCompat.favicon,
      currency: store.currency || 'BDT',
      storeTemplateId: legacyCompat.storeTemplateId,
      theme: legacyCompat.theme,
      themeConfig: legacyCompat.themeConfig,
      mvpSettings: legacyCompat.mvpSettings,
      socialLinks,
      businessInfo,
      planType: store.planType || 'free',
      storeTagline: store.tagline || '',
      storeDescription: store.description || '',
      customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
      featuredProducts,
      categories,
    },
    { headers }
  );
}

export const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
  ];
};

export const headers = ({ loaderHeaders }: { loaderHeaders: Headers }) => {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control') || 'private, max-age=60',
  };
};

export default function StoreHomePage() {
  const {
    storeId,
    storeName,
    logo,
    favicon,
    currency,
    storeTemplateId,
    theme,
    themeConfig,
    socialLinks,
    businessInfo,
    planType,
    featuredProducts,
    categories,
    customer,
    mvpSettings,
  } = useLoaderData<typeof loader>();

  // Get the template from registry (OLD SYSTEM - 1000+ line components)
  const template = getStoreTemplate(storeTemplateId);
  const TemplateComponent = template.component;

  // Load cart from localStorage on client side
  const [, setCart] = useState<{
    items: Array<{
      id: number;
      productId: number;
      title: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }>;
    itemCount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart) as Array<{
          productId: number;
          title: string;
          price: number;
          quantity: number;
          imageUrl: string | null;
        }>;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCart({
          items: items.map((item) => ({
            id: item.productId,
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || undefined,
          })),
          itemCount,
          total,
        });
      } catch {
        // Ignore parse errors
      }
    }

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        try {
          const items = JSON.parse(updatedCart) as Array<{
            productId: number;
            title: string;
            price: number;
            quantity: number;
            imageUrl: string | null;
          }>;
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setCart({
            items: items.map((item) => ({
              id: item.productId,
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || undefined,
            })),
            itemCount,
            total,
          });
        } catch {
          // Ignore parse errors
        }
      } else {
        setCart(null);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  // Determine background class based on theme (same logic as StorePageWrapper)
  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';
  const bgClass = isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  // Defensive check for theme to prevent "Cannot read properties of undefined (reading 'primary')"
  // This can happen during client-side transitions if data isn't fully ready or cached incorrectly
  const safeTheme = theme || { primary: '#000000', accent: '#000000', background: '#ffffff' };
  const safeThemeConfig = themeConfig || {};

  return (
    <div
      className={`min-h-screen w-full flex flex-col m-0 p-0 ${bgClass} transition-colors duration-300`}
    >
      {favicon && (
        <>
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
        </>
      )}
      {/* Inject CSS variables globally for consistent theming */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${safeTheme.primary};
              --color-accent: ${safeTheme.accent};
              --font-heading: ${template.fonts?.heading || 'Inter, sans-serif'};
              --font-body: ${template.fonts?.body || 'Inter, sans-serif'};
            }
          `,
        }}
      />

      {/* Template Component */}
      {/* Template has its own Header/Footer */}
      <TemplateComponent
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        theme={storeTemplateId}
        fontFamily={template.fonts.body}
        products={featuredProducts}
        categories={categories as string[]}
        currentCategory={null}
        config={
          {
            ...safeThemeConfig,
            primaryColor: safeTheme.primary,
            accentColor: safeTheme.accent,
          } as unknown as ThemeConfig
        }
        mvpSettings={mvpSettings}
        currency={currency}
        socialLinks={socialLinks}
        footerConfig={null}
        businessInfo={businessInfo}
        planType={planType}
        isPreview={false}
        collections={[]}
        reviews={[]}
        banners={[]}
        customer={customer}
      />
    </div>
  );
}
