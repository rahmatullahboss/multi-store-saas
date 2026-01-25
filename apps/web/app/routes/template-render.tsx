/**
 * Template Render Route
 * 
 * /template-render
 * 
 * Iframe target for the Theme Editor.
 * Renders the StoreSectionRenderer with dynamic data from postMessage.
 * This enables real-time preview of the drag-and-drop editor.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { StoreSectionRenderer } from '~/components/store/StoreSectionRenderer';
import type { RenderContext, ResolvedSection, ThemeSettings } from '~/lib/template-resolver.server';
import { getStoreId } from '~/services/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { parseThemeConfig } from '@db/types';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  // Need store context even for preview
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store info
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Get some real products for the preview context
  const storeProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      category: products.category,
      handle: products.id, // Using ID as handle for now
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);

  // Get unique categories
  const categories = [...new Set(storeProducts.map(p => p.category).filter(Boolean))];

  return json({
    storeName: store.name,
    currency: store.currency || 'BDT',
    products: storeProducts.map(p => ({
      ...p,
      handle: String(p.id),
      id: String(p.id),
    })),
    categories,
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TemplateRender() {
  const data = useLoaderData<typeof loader>();
  
  // State for live preview data
  const [sections, setSections] = useState<ResolvedSection[]>([]);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [ready, setReady] = useState(false);

  // Listen for updates from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure origin matches if possible, or trust the token structure
      // For now, accepting messages as this is an internal app route
      
      if (event.data?.type === 'TEMPLATE_UPDATE') {
        const { sections: newSections, themeSettings: newSettings } = event.data;
        if (newSections) setSections(newSections);
        if (newSettings) setThemeSettings(newSettings);
        if (!ready) setReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent we are ready
    window.parent.postMessage({ type: 'TEMPLATE_RENDER_READY' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, [ready]);

  if ('error' in data) {
    return <div className="p-4 text-red-500">{data.error}</div>;
  }

  // Build RenderContext with real store data + live theme settings
  const renderContext: RenderContext = {
    kind: 'home', // Default to home, but sections can override behavior
    shop: {
      name: data.storeName,
      currency: data.currency,
      domain: '',
    },
    theme: themeSettings || {
      // Default fallback
      primaryColor: '#000000',
      accentColor: '#6366F1',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    currency: data.currency,
    featuredProducts: data.products,
    collections: data.categories.map((cat, i) => ({
      id: String(i + 1),
      title: cat as string,
      handle: (cat as string).toLowerCase().replace(/\s+/g, '-'),
      productCount: data.products.filter(p => p.category === cat).length,
    })),
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Initializing preview...</p>
        </div>
      </div>
    );
  }

  // Inject Google Fonts
  const fonts = [
    themeSettings?.headingFont,
    themeSettings?.bodyFont
  ].filter(Boolean).map(f => f?.replace(' ', '+'));
  
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;

  return (
    <div className="min-h-screen bg-white">
      {fonts.length > 0 && (
        <link href={fontUrl} rel="stylesheet" />
      )}
      
      <style>{`
        body {
          font-family: ${themeSettings?.bodyFont || 'Inter'}, sans-serif;
          color: ${themeSettings?.textColor || '#1F2937'};
          background-color: ${themeSettings?.backgroundColor || '#FFFFFF'};
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: ${themeSettings?.headingFont || 'Inter'}, sans-serif;
        }
      `}</style>

      <StoreSectionRenderer
        sections={sections}
        context={renderContext}
      />
    </div>
  );
}
