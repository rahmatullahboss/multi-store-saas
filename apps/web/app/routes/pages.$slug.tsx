/**
 * Storefront Custom Pages Route (Shopify-like)
 *
 * Route: /pages/:slug
 *
 * Shopify OS 2.0 Theme System - Uses ThemeStoreRenderer exclusively
 * for dynamic section rendering with the new theme engine.
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { resolveStore, isRouteAllowedForMode } from '~/lib/store.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { ThemeStoreRenderer } from '~/components/store/ThemeStoreRenderer';
import { resolveTemplate } from '~/lib/template-resolver.server';
import { parseThemeConfig, parseSocialLinks, defaultThemeConfig } from '@db/types';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: 'Page Not Found' }];
  return [
    { title: `${data.pageTitle} - ${data.storeName}` },
    { name: 'description', content: data.pageDescription || `${data.pageTitle} page` },
  ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response('Page not found', { status: 404 });
  }

  const storeResolution = await resolveStore(context, request);
  if (!storeResolution) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store, mode } = storeResolution;

  // Check if /pages/:slug is allowed for this mode
  const url = new URL(request.url);
  if (!isRouteAllowedForMode(url.pathname, mode)) {
    throw new Response('Page not available in this mode', { status: 404 });
  }

  const themeConfig = parseThemeConfig(store.themeConfig as string | null) || defaultThemeConfig;
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);

  const storeAny = store as Record<string, unknown>;
  const businessInfo = {
    phone: (storeAny.phone as string) || undefined,
    email: (storeAny.email as string) || undefined,
    address: (storeAny.address as string) || undefined,
  };

  // Resolve template system (Shopify OS 2.0)
  let template = null;
  try {
    template = await resolveTemplate(context.cloudflare.env.DB, storeId, 'page');
  } catch {
    // Continue without template
  }

  // Build page context
  const pageContext = {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    slug,
    content: `This is the ${slug} page. You can customize this content using the theme editor.`,
  };

  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    currency: store.currency || 'BDT',
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    template,
    pageTitle: pageContext.title,
    pageSlug: slug,
    pageContent: pageContext.content,
    pageDescription: `${pageContext.title} page`,
    planType: store.planType || 'free',
  });
}

export default function CustomPageRoute() {
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
    template,
    pageTitle,
    pageSlug,
    pageContent,
    planType,
  } = useLoaderData<typeof loader>();

  const hasTemplateSections = template?.sections && template.sections.length > 0;

  // Render page content
  const renderPageContent = () => {
    // If template has sections, use ThemeStoreRenderer (Shopify OS 2.0)
    if (hasTemplateSections && template?.sections) {
      return (
        <ThemeStoreRenderer
          themeId={storeTemplateId}
          sections={template.sections.map((s) => ({
            id: s.id,
            type: s.type,
            settings: s.props || {},
            blocks:
              s.blocks?.map((b) => ({
                id: b.id,
                type: b.type,
                settings: b.props || {},
              })) || [],
            enabled: s.enabled,
          }))}
          store={{
            id: storeId,
            name: storeName,
            currency,
            logo,
            defaultLanguage: 'en',
          }}
          pageType="page"
          pageHandle={pageSlug}
          skipHeaderFooter={true}
        />
      );
    }

    // Fallback: Default page content
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{pageTitle}</h1>
          <div className="prose prose-lg">
            <p className="text-gray-600">{pageContent}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      templateId={storeTemplateId}
      theme={theme}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      config={themeConfig}
      planType={planType}
    >
      {renderPageContent()}
    </StorePageWrapper>
  );
}
