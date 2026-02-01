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

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { resolveStore } from '~/lib/store.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplate,
  getStoreTemplateTheme,
  DEFAULT_STORE_TEMPLATE_ID,
  type SerializedProduct,
} from '~/templates/store-registry';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig } from '@db/types';
import { getCustomer } from '~/services/customer-auth.server';
import { getMVPSettings } from '~/services/mvp-settings.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { products as productsTable } from '@db/schema';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Store' }];
  }

  return [
    { title: `${data.storeName} - Home` },
    { name: 'description', content: data.storeDescription || `Welcome to ${data.storeName}` },
    // Favicon support
    ...(data.favicon ? [{ rel: 'icon', href: data.favicon, type: 'image/x-icon' }] : []),
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Resolve store (get storeId from context/subdomain)
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);

  // Get theme config from store
  const themeConfig = parseThemeConfig(store.themeConfig as string | null);
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;

  // Get MVP settings (simple theme settings)
  const mvpSettings = await getMVPSettings(db, storeId, storeTemplateId);

  // Merge MVP settings with theme colors
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const theme = {
    ...baseTheme,
    primary: mvpSettings.primaryColor || baseTheme.primary,
    accent: mvpSettings.accentColor || baseTheme.accent,
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

  // Fetch featured products (with storeId filter for multi-tenancy)
  const featuredProducts = await db
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

  // Get unique categories
  const categories = [...new Set(featuredProducts.map((p) => p.category).filter(Boolean))];

  return json({
    storeId,
    storeName: mvpSettings.storeName || store.name,
    logo: mvpSettings.logo || store.logo,
    favicon: mvpSettings.favicon || store.favicon,
    currency: store.currency || 'BDT',
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    planType: store.planType || 'free',
    storeTagline: store.tagline || '',
    storeDescription: store.description || '',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    featuredProducts: featuredProducts.map((p) => ({
      ...p,
      handle: String(p.id),
      storeId,
      description: null,
    })) as unknown as SerializedProduct[],
    categories,
    mvpSettings,
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
    socialLinks,
    businessInfo,
    planType,
    storeTagline,
    storeDescription,
    customer,
    featuredProducts,
    categories,
    mvpSettings,
  } = useLoaderData<typeof loader>();

  // Get the template from registry (OLD SYSTEM - 1000+ line components)
  const template = getStoreTemplate(storeTemplateId);
  const TemplateComponent = template.component;

  // Load cart from localStorage on client side
  const [cart, setCart] = useState<{
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

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      planType={planType}
      tagline={storeTagline}
      storeDescription={storeDescription}
      customer={customer}
      categories={categories as string[]}
      config={
        {
          ...mvpSettings,
          primaryColor: theme.primary,
          accentColor: theme.accent,
        } as unknown as ThemeConfig
      }
    >
      {/* MVP Simple System: Use old 1000+ line React template component */}
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
            ...mvpSettings,
            primaryColor: theme.primary,
            accentColor: theme.accent,
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
    </StorePageWrapper>
  );
}
