
/**
 * Collection Page
 * 
 * Displays a collection of products.
 * Uses SectionRenderer for dynamic layout.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { eq, and, desc, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, stores, type Store } from '@db/schema';
import { parseThemeConfig, parseSocialLinks, type ThemeConfig } from '@db/types';
import { resolveStore } from '~/lib/store.server';
import { SectionRenderer } from '~/components/store-sections/SectionRenderer';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { DarazPageWrapper, DARAZ_THEME } from '~/components/store-layouts/DarazPageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { getCustomer } from '~/services/customer-auth.server';

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response('Collection slug required', { status: 404 });
  }

  // Resolve store
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const { storeId, store } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);
  
  // Fetch store data for config
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  const storeData = storeResult[0] as Store | undefined;
  const themeConfig = parseThemeConfig(storeData?.themeConfig as string | null);
  const socialLinks = parseSocialLinks(storeData?.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);

  // Parse businessInfo
  let businessInfo: { phone?: string; email?: string; address?: string } | null = null;
  try {
    if (storeData?.businessInfo) {
      businessInfo = JSON.parse(storeData.businessInfo as string);
    }
  } catch {}

  // Load customer session for Google Sign-In header
  const customer = await getCustomer(request, context.cloudflare.env, context.cloudflare.env.DB);

  // Fetch products in this collection (category)
  let collectionProducts = [];
  
  // "all" slug means show everything
  if (slug === 'all') {
    collectionProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isPublished, true)
        )
      )
      .limit(50)
      .orderBy(desc(products.createdAt));
  } else {
    // Basic category matching - in future this could be a real "Collection" or "Category" table join
    collectionProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isPublished, true),
          // Simple case-insensitive match for category name
          like(products.category, slug) 
        )
      )
      .limit(50)
      .orderBy(desc(products.createdAt));
  }
  
  // Mock collection object for header
  const collection = {
    title: slug === 'all' ? 'All Products' : slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Browse our ${slug === 'all' ? 'latest' : slug} collection.`,
    slug
  };

  return json({
    storeId,
    storeName: storeData?.name || 'Store',
    logo: storeData?.logo || null,
    currency: storeData?.currency || 'BDT',
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    collection,
    products: collectionProducts,
    planType: storeData?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
  });
}

export default function CollectionPage() {
  const {
    storeId,
    storeName,
    logo,
    currency,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    collection,
    products,
    planType,
    customer
  } = useLoaderData<typeof loader>();

  const isDaraz = storeTemplateId === 'daraz';
  
  // 1. Get sections from themeConfig or use default
  const collectionSections = themeConfig?.collectionSections || [
    {
       id: 'header',
       type: 'collection-header',
       settings: { 
         alignment: 'center',
         paddingTop: 'medium',
         paddingBottom: 'medium'
       }
    },
    {
       id: 'grid',
       type: 'product-grid',
       settings: {
         heading: '', // No heading needed since header is separate
         productCount: 12,
         paddingTop: 'small'
       }
    }
  ];

  // 2. Prepare props
  const sectionProps = {
    theme: isDaraz ? DARAZ_THEME : (theme || {}),
    storeId,
    currency,
    storeName,
    businessInfo,
    socialLinks,
    // IMPORTANT: Pass collection-specific data
    collection,
    products, // The product grid needs this
    store: {
      name: storeName,
      currency: currency,
      email: businessInfo?.email,
      phone: businessInfo?.phone,
      address: businessInfo?.address
    }
  };

  const content = (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme?.background || '#ffffff' }}>
        <SectionRenderer 
          sections={collectionSections}
          {...sectionProps}
        />
      </div>
  );

  // 3. Render Wrapper
  if (isDaraz) {
    return (
      <DarazPageWrapper 
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        currency={currency}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      >
        {content}
      </DarazPageWrapper>
    );
  }
  
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
    >
        {content}
    </StorePageWrapper>
  );
}
