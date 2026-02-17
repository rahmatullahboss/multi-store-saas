/**
 * Page Builder v2 - Preview Route (for iframe embedding)
 * MVP_FROZEN_ARCHIVE_CANDIDATE: 2026-02-17
 *
 * ⚠️ DEPRECATED - This route is frozen for MVP.
 * Use /app/page-builder/preview/:pageId for page previews.
 *
 * Renders page sections in isolation for accurate mobile preview.
 * Used by the builder's iframe preview.
 *
 * This route renders ONLY the section content (no <html> wrapper)
 * because Remix's root.tsx Layout already provides the document structure.
 *
 * For iframe isolation, the parent should use sandbox attributes
 * or consider a dedicated preview domain in production.
 *
 * @see docs/MVP_DUAL_SYSTEM_ARCHIVE_UNIFY_CHECKLIST_2026-02-16.md
 */

import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, sql } from 'drizzle-orm';
import { products, productVariants, orders } from '@db/schema';

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
  // Get real stock count for the product (captured during product fetch)
  let realStockCount: number | null = null;

  // Check page-level productId first, then fallback to CTA section props
  let effectiveProductId = page.productId;
  if (!effectiveProductId) {
    const ctaSection = page.sections?.find((s) => s.type === 'cta' || s.type === 'order-form');
    if (ctaSection && ctaSection.props && typeof ctaSection.props.productId === 'number') {
      effectiveProductId = ctaSection.props.productId;
    }
  }

  if (effectiveProductId) {
    const odb = drizzle(db);
    const [productRow] = await odb
      .select()
      .from(products)
      .where(and(eq(products.id, effectiveProductId), eq(products.storeId, auth.store.id)))
      .limit(1);

    if (productRow) {
      const variantRows = await odb
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, effectiveProductId));

      let parsedImages: string[] = [];
      try {
        if (productRow.images) {
          parsedImages =
            typeof productRow.images === 'string'
              ? JSON.parse(productRow.images)
              : Array.isArray(productRow.images)
                ? productRow.images
                : [];
        }
      } catch {
        parsedImages = [];
      }

      // Fallback: use imageUrl if images array is empty
      if (parsedImages.length === 0 && productRow.imageUrl) {
        parsedImages = [productRow.imageUrl];
      }

      productData = {
        id: productRow.id,
        title: productRow.title,
        price: productRow.price,
        compareAtPrice: productRow.compareAtPrice,
        images: parsedImages,
        variants: variantRows.map((v) => ({
          id: v.id,
          name:
            [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' / ') ||
            `Variant ${v.id}`,
          price: v.price ?? productRow.price,
        })),
      };
      // Capture inventory from the same query to avoid double-fetching
      realStockCount = productRow.inventory ?? null;
    }
  }

  // Fetch multiple products for product-grid section from intent.productIds
  let selectedProducts: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
  }> = [];

  const intentProductIds = page.intent?.productIds || [];
  if (intentProductIds.length > 0) {
    const odb = drizzle(db);
    const allProducts = await odb
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(eq(products.storeId, auth.store.id));

    // Filter and maintain order from intentProductIds
    selectedProducts = intentProductIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }

  // ============================================================================
  // REAL DATA FOR URGENCY/SOCIAL PROOF - No fake numbers!
  // ============================================================================
  const odb = drizzle(db);

  // Get real order count for last 24 hours (for social proof)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrdersResult = await odb
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(eq(orders.storeId, auth.store.id), gte(orders.createdAt, twentyFourHoursAgo)));
  const recentOrderCount = recentOrdersResult[0]?.count || 0;

  return json({
    sections: page.sections.filter((s) => s.enabled),
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
    // Multiple products for product-grid section
    selectedProducts,
    // Store and product IDs for CTA section order form
    storeId: auth.store.id,
    productId: effectiveProductId || null,
    // REAL DATA for urgency/social proof
    realData: {
      stockCount: realStockCount, // Real stock from products table
      recentOrderCount: recentOrderCount, // Real orders in last 24h
    },
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

  // Multiple products for product-grid section
  const [liveProducts, setLiveProducts] = useState<
    Array<{
      id: number;
      title: string;
      price: number;
      compareAtPrice?: number | null;
      imageUrl?: string | null;
    }>
  >(loaderData.selectedProducts || []);

  // Real data for urgency/social proof
  const realData = loaderData.realData || { stockCount: null, recentOrderCount: 0 };

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
      // Handle product update for real-time preview (single product)
      if (event.data?.type === 'PRODUCT_UPDATE') {
        setLiveProduct(event.data.product || null);
      }
      // Handle multiple products update for product-grid section
      if (event.data?.type === 'PRODUCTS_UPDATE') {
        setLiveProducts(event.data.products || []);
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
        selectedProducts={liveProducts}
        realData={realData}
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
