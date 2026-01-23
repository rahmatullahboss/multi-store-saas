/**
 * Store Homepage Route
 * 
 * Template-aware homepage that renders sections from the published theme template.
 * Uses StoreSectionRenderer for dynamic section rendering.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { resolveStoreWithTemplate } from '~/lib/store.server';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { parseThemeConfig, parseSocialLinks } from '@db/types';
import { getCustomer } from '~/services/customer-auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { products } from '@db/schema';
import type { RenderContext } from '~/lib/template-resolver.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Store' }];
  }
  
  return [
    { title: `${data.storeName} - Home` },
    { name: 'description', content: `Welcome to ${data.storeName}` },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Try to resolve store with home template
  const storeContext = await resolveStoreWithTemplate(context, request, 'home');
  
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const { storeId, store, template, theme: themeSettings } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);
  
  // Get theme config from store for backward compatibility
  const themeConfig = parseThemeConfig(store.themeConfig as string | null);
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  
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
  
  // Fetch featured products for RenderContext
  const featuredProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      category: products.category,
    })
    .from(products)
    .where(and(
      eq(products.storeId, storeId),
      eq(products.isPublished, true)
    ))
    .orderBy(desc(products.createdAt))
    .limit(12);
  
  // Get unique categories
  const categories = [...new Set(featuredProducts.map(p => p.category).filter(Boolean))];
  
  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    currency: store.currency || 'BDT',
    storeTemplateId,
    theme,
    themeSettings, // From new template system
    socialLinks,
    businessInfo,
    themeConfig,
    planType: store.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
    // Template data
    template,
    featuredProducts: featuredProducts.map(p => ({
      ...p,
      handle: String(p.id),
    })),
    categories,
  });
}

export default function StoreHomePage() {
  const {
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    themeSettings,
    socialLinks,
    businessInfo,
    themeConfig,
    planType,
    customer,
    template,
    featuredProducts,
    categories,
  } = useLoaderData<typeof loader>();
  
  // Build RenderContext for sections (HomeContext type)
  const renderContext: RenderContext = {
    kind: 'home',
    shop: {
      name: storeName,
      currency,
      domain: '', // Will be set from window.location on client
    },
    theme: themeSettings || {
      primaryColor: theme.primary,
      accentColor: theme.accent,
      backgroundColor: theme.background,
      textColor: theme.text,
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    currency,
    featuredProducts: featuredProducts.map(p => ({
      id: String(p.id),
      handle: p.handle,
      title: p.title,
      price: p.price,
      compareAtPrice: p.compareAtPrice || undefined,
      imageUrl: p.imageUrl || undefined,
      category: p.category || undefined,
    })),
    collections: categories.map((cat, i) => ({
      id: String(i + 1),
      title: cat as string,
      handle: (cat as string).toLowerCase().replace(/\s+/g, '-'),
      productCount: featuredProducts.filter(p => p.category === cat).length,
    })),
  };
  
  // Check if we have published template sections
  const hasTemplateSections = template?.sections && template.sections.length > 0;
  
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
      customer={customer}
      categories={categories as string[]}
      config={themeConfig}
    >
      {hasTemplateSections ? (
        // Use new template system
        <StoreSectionRenderer
          sections={template!.sections}
          context={renderContext}
        />
      ) : (
        // Fallback: Default home content
        <div className="min-h-screen">
          {/* Hero Section Fallback */}
          <section 
            className="relative py-20 px-4 text-center"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome to {storeName}
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Discover our amazing products
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Shop Now
              </a>
            </div>
          </section>
          
          {/* Featured Products Fallback */}
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Featured Products
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 8).map((product) => (
                  <a
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <p className="text-lg font-bold mt-1" style={{ color: theme.primary }}>
                        {currency} {product.price}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </StorePageWrapper>
  );
}
