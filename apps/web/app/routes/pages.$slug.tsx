/**
 * Storefront Custom Pages Route - MVP Simple Theme System
 *
 * Route: /pages/:slug
 *
 * Uses unified storefront settings (single source of truth)
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useRouteError, isRouteErrorResponse } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  getStoreTemplateTheme,
  DEFAULT_STORE_TEMPLATE_ID,
} from '~/templates/store-registry';
import type { StoreTemplateTheme } from '~/templates/types';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import { createDb } from '~/lib/db.server';

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

  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response('Store not found', { status: 404 });
  }

  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);

  // Get unified storefront settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Get template ID from unified settings
  const storeTemplateId = unifiedSettings.theme.templateId || DEFAULT_STORE_TEMPLATE_ID;
  const baseTheme = getStoreTemplateTheme(storeTemplateId);

  // Merge unified settings colors with template theme
  const mergedTheme = {
    ...baseTheme,
    primary: unifiedSettings.theme.primary,
    accent: unifiedSettings.theme.accent,
  };

  // Social links from unified settings
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? undefined,
    instagram: unifiedSettings.social.instagram ?? undefined,
    whatsapp: unifiedSettings.social.whatsapp ?? undefined,
    twitter: unifiedSettings.social.twitter ?? undefined,
    youtube: unifiedSettings.social.youtube ?? undefined,
    linkedin: unifiedSettings.social.linkedin ?? undefined,
  };

  // Business info from unified settings
  const businessInfo = {
    phone: unifiedSettings.business.phone ?? undefined,
    email: unifiedSettings.business.email ?? undefined,
    address: unifiedSettings.business.address ?? undefined,
  };

  // Theme config for StorePageWrapper
  const themeConfig = {
    primaryColor: unifiedSettings.theme.primary,
    accentColor: unifiedSettings.theme.accent,
    backgroundColor: unifiedSettings.theme.background,
    textColor: unifiedSettings.theme.text,
    storeName: unifiedSettings.branding.storeName,
    logo: unifiedSettings.branding.logo,
    tagline: unifiedSettings.branding.tagline,
  };

  // Fetch page content from database if available
  // This is a placeholder - you may have a pages table or store pages in another way
  const pageContent = `This is the ${slug} page. You can customize this content in your store settings.`;
  const pageTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const pageDescription = `${pageTitle} page`;

  // TODO: Fetch actual page content from database if you have a pages table
  // Example:
  // const page = await db
  //   .select()
  //   .from(pagesTable)
  //   .where(and(eq(pagesTable.storeId, storeId), eq(pagesTable.slug, slug)))
  //   .get();
  // if (page) {
  //   pageContent = page.content;
  //   pageTitle = page.title;
  //   pageDescription = page.description || pageDescription;
  // }

  return json({
    storeId,
    storeName: unifiedSettings.branding.storeName || store.name,
    logo: unifiedSettings.branding.logo || store.logo,
    currency: store.currency || 'BDT',
    storeTemplateId,
    theme: mergedTheme,
    socialLinks,
    businessInfo,
    themeConfig,
    planType: store.planType || 'free',
    pageTitle,
    pageSlug: slug,
    pageContent,
    pageDescription,
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
    planType,
    pageTitle,
    pageSlug,
    pageContent,
  } = useLoaderData<typeof loader>();

  // Generate CSS variables for MVP colors
  const cssVariables = `
    :root {
      --color-primary: ${theme.primary};
      --color-accent: ${theme.accent};
      --color-text: ${theme.text};
      --color-muted: ${theme.muted};
      --color-background: ${theme.background};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <StorePageWrapper
        storeName={storeName}
        storeId={storeId}
        logo={logo}
        templateId={storeTemplateId}
        theme={theme}
        currency={currency}
        socialLinks={socialLinks || undefined}
        businessInfo={businessInfo || undefined}
        config={null}
        planType={planType}
      >
        <SimplePage title={pageTitle} content={pageContent} slug={pageSlug} theme={theme} />
      </StorePageWrapper>
    </>
  );
}

// ============================================================================
// SIMPLE PAGE (Fallback)
// ============================================================================
function SimplePage({
  title,
  content,
  slug,
  theme,
}: {
  title: string;
  content: string;
  slug: string;
  theme: StoreTemplateTheme;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: theme.text }}>
          {title}
        </h1>
        <div className="leading-relaxed" style={{ color: theme.muted }}>
          <p>{content}</p>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Page: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-2">{error.statusText}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
