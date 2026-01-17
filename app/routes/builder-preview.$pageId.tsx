/**
 * Page Builder v2 - Preview Route (for iframe embedding)
 * 
 * Renders page sections in isolation for accurate mobile preview.
 * Used by the builder's iframe preview.
 * 
 * This route renders ONLY the section content (no <html> wrapper)
 * because Remix's root.tsx Layout already provides the document structure.
 * 
 * For iframe isolation, the parent should use sandbox attributes
 * or consider a dedicated preview domain in production.
 */

import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products, productVariants } from '@db/schema';

import { getPageWithSections } from '~/lib/page-builder/actions.server';
import { requireAuth } from '~/lib/auth.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { FloatingActionButtons } from '~/components/page-builder/FloatingActionButtons';
import { OzzylBrandingMini } from '~/components/OzzylBranding';
import { TemplateLayoutRenderer } from '~/components/page-builder/TemplateLayoutRenderer';

// Product type for order form display
interface ProductData {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  variants?: Array<{ id: number; name: string; price: number }>;
}

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { pageId } = params;
  
  if (!pageId) {
    throw new Response('Missing page ID', { status: 400 });
  }
  
  // Auth check (preview is only for logged-in users editing)
  const auth = await requireAuth(request, context);
  
  const db = context.cloudflare.env.DB;
  const page = await getPageWithSections(db, pageId, auth.store.id);
  
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  
  // Fetch product data if productId is set on page
  let productData: ProductData | null = null;
  
  // Check page-level productId first, then fallback to CTA section props
  let effectiveProductId = page.productId;
  if (!effectiveProductId) {
    const ctaSection = page.sections?.find(s => s.type === 'cta');
    if (ctaSection && ctaSection.props && typeof ctaSection.props.productId === 'number') {
      effectiveProductId = ctaSection.props.productId;
    }
  }
  
  if (effectiveProductId) {
    const odb = drizzle(db);
    const [productRow] = await odb.select().from(products).where(eq(products.id, effectiveProductId)).limit(1);
    
    if (productRow) {
      const variantRows = await odb.select().from(productVariants).where(eq(productVariants.productId, effectiveProductId));
      
      let parsedImages: string[] = [];
      try {
        if (productRow.images) {
          parsedImages = typeof productRow.images === 'string' 
            ? JSON.parse(productRow.images) 
            : Array.isArray(productRow.images) ? productRow.images : [];
        }
      } catch { parsedImages = []; }
      
      productData = {
        id: productRow.id,
        title: productRow.title,
        price: productRow.price,
        compareAtPrice: productRow.compareAtPrice,
        images: parsedImages,
        variants: variantRows.map(v => ({
          id: v.id,
          name: [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' / ') || `Variant ${v.id}`,
          price: v.price ?? productRow.price,
        })),
      };
    }
  }
  
  return json({
    sections: page.sections.filter(s => s.enabled),
    pageSettings: {
      // WhatsApp settings
      whatsappEnabled: page.whatsappEnabled ?? true,
      whatsappNumber: page.whatsappNumber || '',
      whatsappMessage: page.whatsappMessage || 'হ্যালো! আমি অর্ডার করতে চাই।',
      // Call settings
      callEnabled: page.callEnabled ?? true,
      callNumber: page.callNumber || '',
      // Order button settings
      orderEnabled: page.orderEnabled ?? true,
      orderText: page.orderText || 'অর্ডার করুন',
      orderBgColor: page.orderBgColor || '#6366F1',
      orderTextColor: page.orderTextColor || '#FFFFFF',
      position: page.buttonPosition || 'bottom-right',
    },
    templateId: page.templateId || 'default',
    // Product data for CTA section
    initialProduct: productData,
    // Store and product IDs for CTA section order form
    storeId: auth.store.id,
    productId: effectiveProductId || null,
  });
}

// ============================================================================
// COMPONENT - Renders section content within Remix's document structure
// ============================================================================

export default function PreviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [liveSections, setLiveSections] = useState(loaderData.sections);
  const [liveSettings, setLiveSettings] = useState(loaderData.pageSettings);
  // Initialize with product from loader (if any) so it shows immediately on page load
  const [liveProduct, setLiveProduct] = useState<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    variants?: Array<{ id: number; name: string; price: number }>;
  } | null>(loaderData.initialProduct || null);
  
  // Listen for live updates from parent window (receives sections data directly)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BUILDER_UPDATE' && event.data.sections) {
        // Receive sections data directly - instant update!
        setLiveSections(event.data.sections);
      }
      if (event.data?.type === 'SETTINGS_UPDATE' && event.data.settings) {
        setLiveSettings({
          ...liveSettings,
          ...event.data.settings,
        });
      }
      // Handle product update for real-time preview
      if (event.data?.type === 'PRODUCT_UPDATE') {
        setLiveProduct(event.data.product || null);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [liveSettings]);

  // Update from loader when navigating/refreshing
  useEffect(() => {
    setLiveSections(loaderData.sections);
  }, [loaderData.sections]);

  useEffect(() => {
    setLiveSettings(loaderData.pageSettings);
  }, [loaderData.pageSettings]);
  
  // Update product from loader when data changes (e.g. page refresh)
  useEffect(() => {
    if (loaderData.initialProduct) {
      setLiveProduct(loaderData.initialProduct);
    }
  }, [loaderData.initialProduct]);
  
  return (
    <TemplateLayoutRenderer templateId={loaderData.templateId}>
      <SectionRenderer
        sections={liveSections}
        activeSectionId={null}
        onSelectSection={() => {}}
        storeId={loaderData.storeId}
        productId={loaderData.productId || undefined}
        product={liveProduct}
      />
      
      {/* Powered by Ozzyl branding */}
      <OzzylBrandingMini />
      
      {/* Floating Action Buttons */}
      <FloatingActionButtons
        whatsappEnabled={Boolean(liveSettings.whatsappEnabled)}
        whatsappNumber={liveSettings.whatsappNumber}
        whatsappMessage={liveSettings.whatsappMessage}
        callEnabled={Boolean(liveSettings.callEnabled)}
        callNumber={liveSettings.callNumber}
        orderEnabled={Boolean(liveSettings.orderEnabled)}
        orderText={liveSettings.orderText}
        orderBgColor={liveSettings.orderBgColor}
        orderTextColor={liveSettings.orderTextColor}
        position={liveSettings.position as 'bottom-right' | 'bottom-left' | 'bottom-center'}
      />
    </TemplateLayoutRenderer>
  );
}
