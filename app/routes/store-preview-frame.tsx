/**
 * Store Preview Frame Route
 * 
 * A standalone route used as an iframe source for live preview in the Store Editor.
 * Listens for postMessage updates from parent window to update config in real-time.
 * 
 * Route: /store-preview-frame
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products as productsTable } from '@db/schema';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, parseSocialLinks } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { getStoreTemplate, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// LOADER - Fetch store data for preview
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Get products
  const storeProducts = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.storeId, storeId), eq(productsTable.isPublished, true)))
    .limit(20);

  const themeConfig = parseThemeConfig(store.themeConfig as string | null) || defaultThemeConfig;
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  
  // Get unique categories
  const categories = [...new Set(storeProducts.map(p => p.category).filter(Boolean))] as string[];

  return json({
    storeId,
    storeName: store.name,
    logo: store.logo,
    fontFamily: store.fontFamily || 'inter',
    currency: store.currency || 'USD',
    theme: store.theme || 'default',
    themeConfig,
    socialLinks,
    businessInfo: store.businessInfo ? JSON.parse(store.businessInfo) : null,
    products: storeProducts,
    categories,
  });
}

// ============================================================================
// COMPONENT - Preview Frame
// ============================================================================
export default function StorePreviewFrame() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // Check for error response
  if ('error' in data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">{data.error}</p>
        </div>
      </div>
    );
  }

  // Live config state (updated via postMessage)
  const [liveConfig, setLiveConfig] = useState<{
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    bannerUrl?: string;
    bannerText?: string;
    announcement?: { text: string; link?: string };
    customCSS?: string;
    storeTemplateId?: string;
  }>({
    primaryColor: data.themeConfig.primaryColor,
    accentColor: data.themeConfig.accentColor,
    fontFamily: data.fontFamily,
    bannerUrl: data.themeConfig.bannerUrl,
    bannerText: data.themeConfig.bannerText,
    announcement: data.themeConfig.announcement,
    customCSS: data.themeConfig.customCSS,
    storeTemplateId: data.themeConfig.storeTemplateId,
  });

  // Signal to parent that frame is ready
  useEffect(() => {
    window.parent.postMessage({ type: 'STORE_PREVIEW_READY' }, '*');
  }, []);

  // Listen for config updates from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STORE_PREVIEW_UPDATE') {
        setLiveConfig(prev => ({
          ...prev,
          ...event.data.config,
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Merge live config with data
  const mergedConfig: ThemeConfig = {
    ...data.themeConfig,
    primaryColor: liveConfig.primaryColor || data.themeConfig.primaryColor,
    accentColor: liveConfig.accentColor || data.themeConfig.accentColor,
    bannerUrl: liveConfig.bannerUrl ?? data.themeConfig.bannerUrl,
    bannerText: liveConfig.bannerText ?? data.themeConfig.bannerText,
    announcement: liveConfig.announcement ?? data.themeConfig.announcement,
    customCSS: liveConfig.customCSS ?? data.themeConfig.customCSS,
    storeTemplateId: liveConfig.storeTemplateId || data.themeConfig.storeTemplateId,
  };

  // Get template component
  const templateId = mergedConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const { component: StoreTemplateComponent } = getStoreTemplate(templateId);

  return (
    <>
      {/* Inject custom CSS */}
      {mergedConfig.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: mergedConfig.customCSS }} />
      )}

      {/* Inject Google Fonts - English + Bengali */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Baloo+Da+2:wght@400;500;600;700&family=Tiro+Bangla&family=Anek+Bangla:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Apply font family */}
      <div style={{ fontFamily: getFontFamily(liveConfig.fontFamily || data.fontFamily) }}>
        <StoreTemplateComponent
          storeName={data.storeName}
          storeId={data.storeId}
          logo={data.logo}
          products={data.products}
          categories={data.categories}
          currentCategory={null}
          config={mergedConfig}
          currency={data.currency}
          socialLinks={data.socialLinks}
          businessInfo={data.businessInfo}
          isPreview={true}
        />
      </div>
    </>
  );
}

// Helper to get font family CSS value
function getFontFamily(fontId: string): string {
  const fonts: Record<string, string> = {
    // English
    'inter': "'Inter', sans-serif",
    'poppins': "'Poppins', sans-serif",
    'roboto': "'Roboto', sans-serif",
    'playfair': "'Playfair Display', serif",
    'montserrat': "'Montserrat', sans-serif",
    // Bengali
    'hind-siliguri': "'Hind Siliguri', sans-serif",
    'noto-sans-bengali': "'Noto Sans Bengali', sans-serif",
    'noto-serif-bengali': "'Noto Serif Bengali', serif",
    'baloo-da': "'Baloo Da 2', cursive",
    'tiro-bangla': "'Tiro Bangla', serif",
    'anek-bangla': "'Anek Bangla', sans-serif",
  };
  return fonts[fontId] || fonts.inter;
}
