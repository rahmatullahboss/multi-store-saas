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

import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';

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
  type StoreCategory,
} from '~/templates/store-registry';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig } from '@db/types';
import { getCustomer } from '~/services/customer-auth.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { eq, desc, and } from 'drizzle-orm';
import { products as productsTable, collections as collectionsTable } from '@db/schema';

interface Badge {
  icon?: string;
  title?: string;
  description?: string;
}

interface SectionSettings {
  heading?: string;
  headline?: string;
  subheading?: string;
  subheadline?: string;
  image?: string;
  backgroundImage?: string;
  primaryAction?: { label: string; url: string };
  buttonText?: string;
  buttonLink?: string;
  title?: string;
  subtitle?: string;
  layout?: string;
  limit?: number;
  columns?: number;
  badges?: Badge[];
  [key: string]: unknown;
}

function normalizeLegacySections(sections: Array<{ id?: string; type?: string; settings?: SectionSettings }>) {
  const badgeIconMap: Record<string, string> = {
    truck: 'Truck',
    shield: 'Shield',
    refresh: 'RotateCcw',
    phone: 'Headphones',
    delivery: 'Truck',
    secure: 'Shield',
    support: 'Headphones',
  };

  return (sections || []).map((section) => {
    if (!section?.type) return section;
    const settings = section.settings || {};

    if (section.type === 'hero') {
      return {
        ...section,
        settings: {
          ...settings,
          heading: settings.heading ?? settings.headline,
          subheading: settings.subheading ?? settings.subheadline,
          image: settings.image ?? settings.backgroundImage,
          primaryAction:
            settings.primaryAction ??
            (settings.buttonText
              ? { label: settings.buttonText, url: settings.buttonLink || '/products' }
              : undefined),
        },
      };
    }

    if (section.type === 'featured-products') {
      return {
        ...section,
        type: 'product-grid',
        settings: {
          ...settings,
          heading: settings.heading ?? settings.title,
          subheading: settings.subheading ?? settings.subtitle,
        },
      };
    }

    if (section.type === 'collection-list') {
      return {
        ...section,
        type: 'category-list',
        settings: {
          ...settings,
          heading: settings.heading ?? settings.title,
          layout: settings.layout || 'grid',
          limit: settings.limit ?? (settings.columns ? settings.columns * 2 : undefined),
        },
      };
    }

    if (section.type === 'trust-badges') {
      const badges = Array.isArray(settings.badges) ? settings.badges : [];
      return {
        ...section,
        type: 'features',
        settings: {
          heading: settings.heading ?? settings.title ?? 'Why Shop With Us',
          subheading: settings.subheading ?? settings.subtitle,
          features: badges.map((badge: Badge) => ({
            icon: badgeIconMap[(badge.icon || '').toLowerCase()] || 'Truck',
            title: badge.title,
            description: badge.description,
          })),
        },
      };
    }

    return section;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeThemeConfigForMvp(themeConfig: any) {
  if (!themeConfig || typeof themeConfig !== 'object') return themeConfig;

  // If an editor saved empty arrays, treat them as unset so templates can fall back.
  if (Array.isArray(themeConfig.sections) && themeConfig.sections.length === 0) {
    delete themeConfig.sections;
  }

  // Backward-compat: old configs defaulted enabled flags to false even when merchant
  // only set socialLinks/businessInfo. If no explicit floating number is set, treat false as unset.
  if (themeConfig.floatingWhatsappEnabled === false && !themeConfig.floatingWhatsappNumber) {
    delete themeConfig.floatingWhatsappEnabled;
  }
  if (themeConfig.floatingCallEnabled === false && !themeConfig.floatingCallNumber) {
    delete themeConfig.floatingCallEnabled;
  }

  return themeConfig;
}

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
  const themeConfigRaw = normalizeThemeConfigForMvp(
    parseThemeConfig(store.themeConfig as string | null)
  );
  // Cast to any to avoid strict type checks on intermediate transformations of legacy config
  const themeConfig = (themeConfigRaw
    ? {
        ...themeConfigRaw,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sections: normalizeLegacySections((themeConfigRaw as any).sections || []),
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : themeConfigRaw) as any;
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

  let featuredProducts: SerializedProduct[] | null =
    await cache.get<SerializedProduct[]>(productsCacheKey);
  let categories: (string | StoreCategory)[] | null = await cache.get<(string | StoreCategory)[]>(categoriesCacheKey);

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
        .where(
          and(eq(collectionsTable.storeId, storeId), eq(collectionsTable.isActive, true))
        )
        .orderBy(collectionsTable.sortOrder);

      if (dbCollections.length > 0) {
        categories = dbCollections.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          imageUrl: c.imageUrl,
        }));
      } else {
        // Fallback: derive from products (legacy behavior)
        const uniqueCategories = [
          ...new Set(featuredProducts.map((p) => p.category).filter(Boolean)),
        ] as string[];
        
        // Map strings to objects for consistency, or keep as strings? 
        // StoreTemplateProps now accepts (string | StoreCategory | null)[]
        // Let's keep as strings for backward compat with other templates if needed, 
        // but prefer objects for new templates.
        categories = uniqueCategories;
      }

      await cache.set(categoriesCacheKey, categories, 3600);
    }

  // EDGE CACHING STRATEGY
  // If no customer is logged in, we can cache the HTML at the edge (Cloudflare CDN)
  // This prevents the Worker from running on every visit, significantly reducing costs/invocations.
  const headers = new Headers();
  if (!customer) {
    // Keep HTML TTL short so new deploy chunk hashes propagate quickly.
    // "public" allows the CDN to store it.
    headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
  } else {
    // Logged In: Private cache only (Browser), potentially for a short time or 0
    // We MUST NOT cache shared (CDN) because it contains user-specific data (Name)
    headers.set('Cache-Control', 'private, max-age=60');
  }

  return json(
    {
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
    },
    { headers }
  );
}

export const links: LinksFunction = () => {
  // Route-level `links` does not receive loader `data` in this Remix setup,
  // so we keep this minimal and safe.
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
        customer={customer}
      />
    </div>
  );
}
