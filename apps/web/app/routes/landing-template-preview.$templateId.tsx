/**
 * Landing Page Template Preview Route
 * 
 * Route: /landing-template-preview/:templateId
 * 
 * Renders static listing of landing page templates (presets) from the Intent Wizard.
 * This allows users to preview "Genie Builder" templates before creating a page.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products } from '@db/schema';
import { requireAuth } from '~/lib/auth.server';
import { TEMPLATE_PRESETS } from '~/lib/page-builder/templates';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { SectionType } from '~/lib/page-builder/types';

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { templateId } = params;

  if (!templateId || !TEMPLATE_PRESETS[templateId]) {
    throw new Response('Template not found', { status: 404 });
  }

  // We require auth to get the store context (products, currency, etc.)
  // even for previewing a generic template, so we can show REAL data from their store.
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);

  const preset = TEMPLATE_PRESETS[templateId];

  // Fetch a few products to populate the template with real data
  const storeProducts = await drizzleDb
    .select()
    .from(products)
    .where(eq(products.storeId, store.id))
    .limit(8);

  // Map to format expected by SectionRenderer
  const mappedProducts = storeProducts.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: (p.images ? JSON.parse(p.images as string) : (p.imageUrl ? [p.imageUrl] : [])) as string[],
    imageUrl: p.imageUrl,
    description: p.description,
  }));

  // Construct a "theme" object from the preset's colors
  const theme = {
    primaryColor: preset.colors.primary,
    accentColor: preset.colors.accent,
    backgroundColor: preset.colors.bg,
    // Defaults
    textColor: preset.colors.bg.includes('black') || preset.colors.bg.includes('#0') ? '#FFFFFF' : '#1F2937', 
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headerStyle: 'solid',
    footerStyle: 'minimal',
    borderRadius: '8px',
  };

  return json({
    preset,
    theme,
    store: {
      id: store.id,
      name: store.name,
      currency: 'BDT', // Only BDT for now as per previous context
      logo: store.logo,
    },
    products: mappedProducts,
    // Use first product as the "main" product if available
    product: mappedProducts[0] || null, 
    categories: ['Electronics', 'Fashion', 'Home'], // Dummy categories
  });
}

export default function LandingTemplatePreview() {
  const { preset, theme, store, products, product } = useLoaderData<typeof loader>();

  // CSS variables for theme
  const themeStyle: React.CSSProperties = {
    '--theme-primary': theme.primaryColor,
    '--theme-accent': theme.accentColor,
    '--theme-background': theme.backgroundColor,
    '--theme-text': theme.textColor,
    '--theme-heading-font': theme.headingFont,
    '--theme-body-font': theme.bodyFont,
    '--theme-radius': theme.borderRadius,
  } as React.CSSProperties;

  // Convert preset sections to the format expected by Page Builder SectionRenderer
  // The Page Builder SectionRenderer expects { id, type, props, sortOrder }
  const sections = preset.sections.map((section, index) => ({
    id: `preview-section-${index}`,
    type: section.type as SectionType,
    props: section.props,
    sortOrder: index,
    enabled: true,
    version: 1,
    pageId: 'preview' as string, // Required by BuilderSection type
  }));

  return (
    <div 
      className="min-h-screen"
      style={{
        ...themeStyle,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: `${theme.bodyFont}, sans-serif`,
      }}
    >
      <SectionRenderer
        sections={sections}
        storeId={store.id}
        // Pass products for product-grid
        selectedProducts={products.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          imageUrl: p.imageUrl
        }))}
        // Pass main product for single-product sections
        product={product}
        productId={product?.id}
        // Mock realData just for preview
        realData={{
            stockCount: 50,
            recentOrderCount: 12
        }}
        activeSectionId={null}
      />

      {/* Preview Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3">
        <div className="bg-gray-900/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-white/10">
          <span className="text-xl">{preset.emoji}</span>
          <span>{preset.name}</span>
          <span className="mx-1 opacity-50">|</span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live Preview</span>
        </div>
      </div>
    </div>
  );
}
