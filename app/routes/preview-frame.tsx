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
import { useState, useEffect } from 'react';
import { getTemplateComponent } from '~/templates/registry';

export const meta: MetaFunction = () => {
  return [{ title: 'Preview Frame' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
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

export default function PreviewFrame() {
  const { store, products: storeProducts } = useLoaderData<typeof loader>();
  
  // Live config state - initialized from store but can be updated via postMessage
  const [liveConfig, setLiveConfig] = useState<LandingConfig>(store.landingConfig);
  const [liveTemplateId, setLiveTemplateId] = useState(store.landingConfig.templateId || 'modern-dark');
  const [liveFeaturedProductId, setLiveFeaturedProductId] = useState<number | null>(store.featuredProductId);

  // Listen for config updates from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message structure
      if (event.data && event.data.type === 'PREVIEW_CONFIG_UPDATE') {
        const { config, templateId, featuredProductId } = event.data;
        
        if (config) {
          setLiveConfig(config);
        }
        if (templateId) {
          setLiveTemplateId(templateId);
        }
        if (featuredProductId !== undefined) {
          setLiveFeaturedProductId(featuredProductId ? parseInt(featuredProductId) : null);
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
    <div className="min-h-screen">
      <TemplateComponent 
        storeName={store.name}
        storeId={store.id}
        product={previewProduct as any}
        config={liveConfig}
        currency="৳"
        isPreview={true}
      />
    </div>
  );
}
