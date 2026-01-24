/**
 * Storefront Custom Pages Route (Shopify-like)
 * 
 * Route: /pages/:slug
 * 
 * Renders store custom pages using the template system (not landing builder).
 * Examples: /pages/about, /pages/contact, /pages/faq
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { stores } from '@db/schema';
import { resolveStore, isRouteAllowedForMode } from '~/lib/store.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import { resolveTemplate, buildRenderContext } from '~/lib/template-resolver.server';
import { parseThemeConfig, parseSocialLinks, defaultThemeConfig } from '@db/types';

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

  const storeResolution = await resolveStore(context as any, request);
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
  const storeAny = store as Record<string, unknown>;
  const businessInfo = {
    phone: (storeAny.phone as string) || null,
    email: (storeAny.email as string) || null,
    address: (storeAny.address as string) || null,
  };

  // Resolve template system
  const templateResolution = await resolveTemplate(context.cloudflare.env.DB, storeId, 'page');

  // Build page context
  const pageContext = {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slug,
    content: `This is the ${slug} page. You can customize this content using the theme editor.`,
  };

  const renderContext = templateResolution
    ? buildRenderContext('page', store, templateResolution.settings, { page: pageContext })
    : null;

  // If no template system, use default sections
  const sections = templateResolution?.sections || [
    {
      id: 'page-content',
      type: 'rich-text',
      enabled: true,
      sortOrder: 0,
      props: {
        heading: pageContext.title,
        text: pageContext.content,
        alignment: 'left',
        backgroundColor: 'white',
      },
    },
  ];

  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    currency: store.currency || 'BDT',
    storeTemplateId: (storeAny.storeTemplateId as string) || 'default',
    theme: themeConfig,
    socialLinks,
    businessInfo,
    themeConfig,
    sections,
    renderContext,
    pageTitle: pageContext.title,
    pageSlug: slug,
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
    sections,
    pageTitle,
    planType,
  } = useLoaderData<typeof loader>();

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      currency={currency}
      templateId={storeTemplateId}
      theme={theme as any}
      socialLinks={socialLinks as any}
      businessInfo={businessInfo as any}
      config={themeConfig as any}
      planType={planType}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StoreSectionRenderer
          sections={sections as any}
          context={{
            storeName,
            currency,
            theme: theme as any,
          } as any}
        />
      </div>
    </StorePageWrapper>
  );
}
