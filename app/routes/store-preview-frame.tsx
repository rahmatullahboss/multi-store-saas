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
  const storeId = await getStoreId(request, context.cloudflare.env);
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
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    typography?: any;
    fontFamily?: string;
    bannerUrl?: string;
    bannerText?: string;
    announcement?: { text: string; link?: string };
    customCSS?: string;
    storeTemplateId?: string;
    sections?: any[];
    productSections?: any[];
    logo?: string;
    businessInfo?: any;
    socialLinks?: any;
    headerLayout?: string;
    headerShowSearch?: boolean;
    headerShowCart?: boolean;
    footerDescription?: string;
    copyrightText?: string;
    footerColumns?: any[];
    floatingWhatsappEnabled?: boolean;
    floatingWhatsappNumber?: string;
    floatingWhatsappMessage?: string;
    floatingCallEnabled?: boolean;
    floatingCallNumber?: string;
    checkoutStyle?: string;
    flashSale?: any;
    trustBadges?: any;
    marketingPopup?: any;
  }>({
    primaryColor: data.themeConfig.primaryColor,
    accentColor: data.themeConfig.accentColor,
    backgroundColor: data.themeConfig.backgroundColor,
    textColor: data.themeConfig.textColor,
    borderColor: data.themeConfig.borderColor,
    typography: data.themeConfig.typography,
    fontFamily: data.fontFamily,
    bannerUrl: data.themeConfig.bannerUrl,
    bannerText: data.themeConfig.bannerText,
    announcement: data.themeConfig.announcement,
    customCSS: data.themeConfig.customCSS,
    storeTemplateId: data.themeConfig.storeTemplateId,
    sections: data.themeConfig.sections,
    productSections: data.themeConfig.productSections,
    logo: data.logo ?? undefined,
    businessInfo: data.businessInfo,
    socialLinks: data.socialLinks,
    headerLayout: data.themeConfig.headerLayout,
    headerShowSearch: data.themeConfig.headerShowSearch,
    headerShowCart: data.themeConfig.headerShowCart,
    footerDescription: data.themeConfig.footerDescription,
    copyrightText: data.themeConfig.copyrightText,
    footerColumns: data.themeConfig.footerColumns,
    floatingWhatsappEnabled: data.themeConfig.floatingWhatsappEnabled,
    floatingWhatsappNumber: data.themeConfig.floatingWhatsappNumber,
    floatingWhatsappMessage: data.themeConfig.floatingWhatsappMessage,
    floatingCallEnabled: data.themeConfig.floatingCallEnabled,
    floatingCallNumber: data.themeConfig.floatingCallNumber,
    checkoutStyle: data.themeConfig.checkoutStyle,
    flashSale: data.themeConfig.flashSale,
    trustBadges: data.themeConfig.trustBadges,
    marketingPopup: data.themeConfig.marketingPopup,
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
    backgroundColor: liveConfig.backgroundColor || data.themeConfig.backgroundColor,
    textColor: liveConfig.textColor || data.themeConfig.textColor,
    borderColor: liveConfig.borderColor || data.themeConfig.borderColor,
    typography: liveConfig.typography || data.themeConfig.typography,
    bannerUrl: liveConfig.bannerUrl ?? data.themeConfig.bannerUrl,
    bannerText: liveConfig.bannerText ?? data.themeConfig.bannerText,
    announcement: liveConfig.announcement || (data.themeConfig.announcement ? { 
      text: data.themeConfig.announcement.text, 
      link: data.themeConfig.announcement.link || undefined 
    } : undefined),
    customCSS: liveConfig.customCSS ?? data.themeConfig.customCSS,
    storeTemplateId: liveConfig.storeTemplateId || data.themeConfig.storeTemplateId,
    sections: liveConfig.sections || data.themeConfig.sections,
    productSections: liveConfig.productSections || data.themeConfig.productSections,
    headerLayout: (liveConfig.headerLayout as any) || data.themeConfig.headerLayout,
    headerShowSearch: liveConfig.headerShowSearch ?? data.themeConfig.headerShowSearch,
    headerShowCart: liveConfig.headerShowCart ?? data.themeConfig.headerShowCart,
    footerDescription: liveConfig.footerDescription ?? data.themeConfig.footerDescription,
    copyrightText: liveConfig.copyrightText ?? data.themeConfig.copyrightText,
    footerColumns: liveConfig.footerColumns ?? data.themeConfig.footerColumns,
    floatingWhatsappEnabled: liveConfig.floatingWhatsappEnabled ?? data.themeConfig.floatingWhatsappEnabled,
    floatingWhatsappNumber: liveConfig.floatingWhatsappNumber ?? data.themeConfig.floatingWhatsappNumber,
    floatingWhatsappMessage: liveConfig.floatingWhatsappMessage ?? data.themeConfig.floatingWhatsappMessage,
    floatingCallEnabled: liveConfig.floatingCallEnabled ?? data.themeConfig.floatingCallEnabled,
    floatingCallNumber: liveConfig.floatingCallNumber ?? data.themeConfig.floatingCallNumber,
    checkoutStyle: (liveConfig.checkoutStyle as any) ?? data.themeConfig.checkoutStyle,
    flashSale: liveConfig.flashSale ?? data.themeConfig.flashSale,
    trustBadges: liveConfig.trustBadges ?? data.themeConfig.trustBadges,
    marketingPopup: liveConfig.marketingPopup ?? data.themeConfig.marketingPopup,
  };

  // Get template component
  const templateId = mergedConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const { component: StoreTemplateComponent } = getStoreTemplate(templateId);

  return (
    <>
      {/* Viewport Meta for Mobile Responsiveness */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

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
          logo={liveConfig.logo || data.logo}
          products={data.products}
          categories={data.categories}
          currentCategory={null}
          config={mergedConfig}
          currency={data.currency}
          socialLinks={liveConfig.socialLinks || data.socialLinks}
          businessInfo={liveConfig.businessInfo || data.businessInfo}
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
