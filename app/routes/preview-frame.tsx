/**
 * Preview Frame Route
 * 
 * This route loads inside an iframe in the Live Editor
 * and receives config updates via postMessage for live preview.
 * 
 * Route: /preview-frame
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { useState, useEffect, useRef } from 'react';
import { getTemplateComponent } from '~/templates/registry';
import { ClientOnly } from 'remix-utils/client-only';

export const meta: MetaFunction = () => {
  return [{ title: 'Preview Frame' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const storeProducts = await db
    .select({ 
      id: products.id, 
      title: products.title, 
      description: products.description,
      imageUrl: products.imageUrl, 
      price: products.price,
      compareAtPrice: products.compareAtPrice 
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .limit(50);

  const landingConfig = parseLandingConfig(store.landingConfig as string | null) || defaultLandingConfig;

  return json({
    store: {
      id: store.id,
      name: store.name,
      featuredProductId: store.featuredProductId,
      landingConfig,
    },
    products: storeProducts,
  });
}

// Skeleton loader for initial render
function PreviewSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-4xl mx-auto p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="aspect-video bg-gray-200 rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewFrame() {
  const { store, products: storeProducts } = useLoaderData<typeof loader>();
  
  // Live config state - initialized from store but can be updated via postMessage
  const [liveConfig, setLiveConfig] = useState<LandingConfig>(store.landingConfig);
  const [liveTemplateId, setLiveTemplateId] = useState(store.landingConfig.templateId || 'modern-dark');
  const [liveFeaturedProductId, setLiveFeaturedProductId] = useState<number | null>(store.featuredProductId);

  // Track previous config string to avoid unnecessary re-renders
  const prevConfigRef = useRef<string>('');

  // Listen for config updates from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message structure
      if (event.data && event.data.type === 'PREVIEW_CONFIG_UPDATE') {
        const { config, templateId, featuredProductId } = event.data;
        
        // Only update if config actually changed (compare by JSON string)
        if (config) {
          const configStr = JSON.stringify(config);
          if (configStr !== prevConfigRef.current) {
            prevConfigRef.current = configStr;
            setLiveConfig(config);
          }
        }
        if (templateId) {
          setLiveTemplateId(prev => prev === templateId ? prev : templateId);
        }
        if (featuredProductId !== undefined) {
          const newId = featuredProductId ? parseInt(featuredProductId) : null;
          setLiveFeaturedProductId(prev => prev === newId ? prev : newId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Signal to parent that iframe is ready
    window.parent.postMessage({ type: 'PREVIEW_FRAME_READY' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Get the template component
  const TemplateComponent = getTemplateComponent(liveTemplateId);

  // Get featured product
  const selectedProduct = storeProducts.find(p => p.id === liveFeaturedProductId);
  const previewProduct = selectedProduct || {
    id: 0,
    storeId: store.id,
    title: 'Demo Product',
    description: 'This is a demo product for preview purposes.',
    price: 1999,
    compareAtPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  };

  return (
    <ClientOnly fallback={<PreviewSkeleton />}>
      {() => (
        <div className="min-h-screen">
          {/* Custom CSS injection */}
          {liveConfig.customCSS && (
            <style dangerouslySetInnerHTML={{ __html: liveConfig.customCSS }} />
          )}
          
          {/* Custom Head Code injection (scripts, meta tags) */}
          {liveConfig.customHeadCode && (
            <div 
              dangerouslySetInnerHTML={{ __html: liveConfig.customHeadCode }} 
              style={{ display: 'none' }}
            />
          )}
          
          <TemplateComponent 
            storeName={store.name}
            storeId={store.id}
            product={previewProduct as any}
            config={liveConfig}
            currency="৳"
            isPreview={true}
          />
          
          {/* Custom HTML Sections (imported designs) - CSS Isolated */}
          {(liveConfig as any).customSections?.map((section: { id: string; html: string; css?: string }) => (
            <div 
              key={section.id} 
              className="custom-html-section"
              style={{
                all: 'revert',
                display: 'block',
                isolation: 'isolate',
              }}
            >
              {/* Scoped styles for this section only */}
              <style dangerouslySetInnerHTML={{ __html: `
                .custom-html-section-${section.id} * {
                  all: revert;
                }
                ${section.css || ''}
              ` }} />
              <div 
                className={`custom-html-section-${section.id}`}
                dangerouslySetInnerHTML={{ __html: section.html }} 
              />
            </div>
          ))}
          
          {/* Custom Body Code injection (chat widgets, etc.) */}
          {liveConfig.customBodyCode && (
            <div 
              dangerouslySetInnerHTML={{ __html: liveConfig.customBodyCode }} 
            />
          )}
        </div>
      )}
    </ClientOnly>
  );
}
