/**
 * Store Homepage Route - MVP Simple Theme System
 *
 * Uses the old React Component System (1000+ line templates)
 * instead of Shopify OS 2.0 section-based system.
 *
 * Each template provides:
 * - Main component (homepage)
 * - Header component
 * - Footer component
 * - Custom ProductPage, CartPage, CollectionPage (optional)
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function action() {
  // Gracefully handle accidental POST requests to home by returning null
  // This causes a data revalidation (refresh) instead of a 405 error
  return null;
}
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { resolveStore } from '~/lib/store.server';

import {
  getStoreTemplate,
  getStoreTemplateTheme,
  DEFAULT_STORE_TEMPLATE_ID,
  type SerializedProduct,
} from '~/templates/store-registry';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig } from '@db/types';
import { getCustomer } from '~/services/customer-auth.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { eq, desc, and } from 'drizzle-orm';
import { products as productsTable } from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Resolve store (get storeId from context/subdomain)
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);

  // Get theme config from store (fallback to legacy 'theme' field for backward compatibility)
  const themeConfig = parseThemeConfig(store.themeConfig as string | null);
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const storeTemplateId =
    themeConfig?.storeTemplateId || (store.theme as string) || DEFAULT_STORE_TEMPLATE_ID;

  // Get theme colors from themeConfig
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const theme = {
    ...baseTheme,
    primary: themeConfig?.primaryColor || baseTheme.primary,
    accent: themeConfig?.accentColor || baseTheme.accent,
  };

  // Parse businessInfo
  let businessInfo = null;
  try {
    if (store.businessInfo) {
      businessInfo = JSON.parse(store.businessInfo as string);
    }
  } catch {
    // Ignore parse errors
  }

  // Load customer session
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // CACHING STRATEGY: Cache expensive product queries to prevent loader timeouts
  const productsCacheKey = `store:${storeId}:home:products:v1`;
  const categoriesCacheKey = `store:${storeId}:home:categories:v1`;

  let featuredProducts: SerializedProduct[] | null = await cache.get<SerializedProduct[]>(productsCacheKey);
  let categories: string[] | null = await cache.get<string[]>(categoriesCacheKey);

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

      // Cache for 5 minutes (300 seconds)
      await cache.set(productsCacheKey, featuredProducts, 300);
  }

  if (!categories) {
      // Derive categories from products or fetch distinct if needed
      // Ideally we should query distinct categories, but unique from products is a good startup approximation
      // If we want all categories, we should query them. For now, sticking to logic derived from featured.
      // However, to be robust, let's just derive from the (possibly cached) featured products to save a query
      // unless we want *all* categories. The original code derived from featuredProducts.
      
      // Let's stick to original logic: derive from featuredProducts
      categories = [...new Set(featuredProducts.map((p) => p.category).filter(Boolean))] as string[];
      
      // Cache categories too
      await cache.set(categoriesCacheKey, categories, 300);
  }

  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    favicon: store.favicon,
    currency: store.currency || 'BDT',
    storeTemplateId,
    theme,
    themeConfig,
    socialLinks,
    businessInfo,
    planType: store.planType || 'free',
    storeTagline: store.tagline || '',
    storeDescription: store.description || '',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    featuredProducts,
    categories,
  });
}

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
    <div className={`min-h-screen w-full flex flex-col m-0 p-0 ${bgClass} transition-colors duration-300`}>
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
            primaryColor: safeTheme.primary,
            accentColor: safeTheme.accent,
            ...safeThemeConfig,
          } as unknown as ThemeConfig
        }
        currency={currency}
        socialLinks={socialLinks}
        footerConfig={null}
        businessInfo={businessInfo}
        planType={planType}
        isPreview={false}
        collections={[]}
        reviews={[]}
        banners={[]}
      />
    </div>
  );
}
