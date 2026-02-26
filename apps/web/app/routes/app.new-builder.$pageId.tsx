/**
 * Page Builder v2 - Main Route
 *
 * /app/new-builder/:pageId
 *
 * Handles:
 * - Loading page with sections
 * - All section mutations (add, toggle, update, delete, reorder)
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate } from '@remix-run/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { requireAuth } from '~/lib/auth.server';
import { createDb } from '~/lib/db.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { products, productVariants } from '@db/schema';
import {
  getPageWithSections,
  listSections,
  addSection,
  toggleSection,
  updateSectionProps,
  deleteSection,
  reorderSections,
  duplicateSection,
  updatePageSettings,
  publishPage,
  createPage,
  initializePageWithDefaults,
} from '~/lib/page-builder/actions.server';
import { invalidatePageCache } from '~/lib/page-builder/cache.server';
import {
  isValidSectionType,
  getSectionMeta,
  AVAILABLE_SECTIONS,
} from '~/lib/page-builder/registry';
import type { BuilderSection, SectionType } from '~/lib/page-builder/types';
import { BuilderLayout } from '~/components/page-builder/BuilderLayout';
import { useEditorHistory } from '~/hooks/useEditorHistory';
import { useBuilderKeyboardShortcuts } from '~/hooks/useBuilderKeyboardShortcuts';
import { useBuilderClipboard } from '~/hooks/useBuilderClipboard';

// Action response type
interface ActionData {
  success: boolean;
  error?: string;
  pageId?: string;
  section?: BuilderSection;
  newVersion?: number;
}

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { user, store } = await requireAuth(request, context);
  const pageId = params.pageId;

  if (!pageId) {
    throw new Response('Page ID required', { status: 400 });
  }

  const db = context.cloudflare.env.DB;

  // Load products for product selector
  const odb = drizzle(db);
  const rawProducts = await odb
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
      bundlePricing: products.bundlePricing,
    })
    .from(products)
    .where(eq(products.storeId, store.id));

  // Get unified settings for branding
  const unifiedDb = createDb(db);
  const unifiedSettings = await getUnifiedStorefrontSettings(unifiedDb, store.id, {
    env: context.cloudflare.env,
  });

  // Format products with name field and parse bundlePricing for UI
  const storeProducts = rawProducts.map((p) => {
    let bundleTiers = [];
    try {
      bundleTiers = JSON.parse(p.bundlePricing || '[]');
    } catch {
      /* ignore */
    }
    return {
      id: p.id,
      name: p.title,
      price: p.price,
      imageUrl: p.imageUrl,
      bundlePricing: bundleTiers,
    };
  });

  // Special case: "new" page
  if (pageId === 'new') {
    return json({
      page: null,
      sections: [],
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        // Analytics
        facebookPixelId: store.facebookPixelId,
        googleAnalyticsId: store.googleAnalyticsId,
        // Branding
        logo: unifiedSettings.branding.logo || store.logo,
        favicon: unifiedSettings.branding.favicon || store.favicon,
        fontFamily: store.fontFamily,
        // Using unified settings - no legacy themeConfig/businessInfo needed
        themeConfig: null,
        businessInfo: null,
      },
      products: storeProducts,
      product: null,
      isNew: true,
    });
  }

  const page = await getPageWithSections(db, pageId, store.id);

  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }

  // Fetch selected product details if productId is set
  let selectedProduct: {
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    variants?: Array<{ id: number; name: string; price: number }>;
  } | null = null;

  // Fetch multiple selected products from intent.productIds (for multi-product landing pages)
  let selectedProducts: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
  }> = [];

  // Get productIds from intent
  const intentProductIds = page.intent?.productIds || [];

  if (page.productId) {
    const [productRow] = await odb
      .select()
      .from(products)
      .where(and(eq(products.id, page.productId), eq(products.storeId, store.id)))
      .limit(1);
    if (productRow) {
      // Fetch variants
      const variantRows = await odb
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, page.productId));

      // Parse images
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

      selectedProduct = {
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
    }
  }

  // Fetch multiple products if intent has productIds
  // ✅ FIX N+1: Use inArray to fetch only needed products in one query (not all then filter)
  if (intentProductIds.length > 0) {
    const { inArray: inArr } = await import('drizzle-orm');
    const multipleProductRows = await odb
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(
        and(
          eq(products.storeId, store.id),
          inArr(products.id, intentProductIds) // ← fetch only needed IDs
        )
      );

    // Maintain intentProductIds order (DB returns in arbitrary order)
    selectedProducts = intentProductIds
      .map((id) => multipleProductRows.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }

  return json({
    page,
    sections: page.sections,
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      // Analytics
      facebookPixelId: store.facebookPixelId,
      googleAnalyticsId: store.googleAnalyticsId,
      // Branding
      logo: unifiedSettings.branding.logo || store.logo,
      favicon: unifiedSettings.branding.favicon || store.favicon,
      fontFamily: store.fontFamily,
      // Using unified settings - no legacy themeConfig/businessInfo needed
      themeConfig: null,
      businessInfo: null,
    },
    products: storeProducts,
    product: selectedProduct,
    selectedProducts, // Multiple products for product-grid section
    isNew: false,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const { user, store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    switch (intent) {
      // Create new page
      case 'create-page': {
        const slug = formData.get('slug') as string;
        const title = formData.get('title') as string;
        const productId = formData.get('productId');

        if (!slug) {
          return json({ success: false, error: 'Slug is required' }, { status: 400 });
        }

        const result = await createPage(db, store.id, {
          slug,
          title: title || undefined,
          productId: productId ? Number(productId) : undefined,
        });

        // Initialize with default sections
        await initializePageWithDefaults(db, result.id, store.id);

        return json({ success: true, pageId: result.id });
      }

      // Add section
      case 'add-section': {
        const pageId = params.pageId as string;
        const type = formData.get('type') as string;

        if (!isValidSectionType(type)) {
          return json({ success: false, error: 'Invalid section type' }, { status: 400 });
        }

        const result = await addSection(db, pageId, store.id, type);

        if ('error' in result) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, section: result });
      }

      // Toggle section visibility
      case 'toggle-section': {
        const sectionId = formData.get('sectionId') as string;
        const enabled = formData.get('enabled') === 'true';

        const result = await toggleSection(db, store.id, sectionId, enabled);
        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }
        return json({ success: true });
      }

      // Update section props
      case 'update-props': {
        const sectionId = formData.get('sectionId') as string;
        const type = formData.get('type') as string;
        const propsJson = formData.get('props') as string;
        const version = formData.get('version');

        let props: unknown;
        try {
          props = JSON.parse(propsJson);
        } catch {
          return json({ success: false, error: 'Invalid props JSON' }, { status: 400 });
        }

        const result = await updateSectionProps(
          db,
          store.id,
          sectionId,
          type,
          props,
          version ? Number(version) : undefined
        );

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, newVersion: result.newVersion });
      }

      // Delete section
      case 'delete-section': {
        const sectionId = formData.get('sectionId') as string;
        const result = await deleteSection(db, store.id, sectionId);
        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }
        return json({ success: true });
      }

      // Reorder sections
      case 'reorder-sections': {
        const pageId = params.pageId as string;
        const orderedIdsJson = formData.get('orderedIds') as string;

        let orderedIds: string[];
        try {
          orderedIds = JSON.parse(orderedIdsJson);
        } catch {
          return json({ success: false, error: 'Invalid orderedIds' }, { status: 400 });
        }

        const result = await reorderSections(db, pageId, store.id, orderedIds);

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true });
      }

      // Duplicate section
      case 'duplicate-section': {
        const sectionId = formData.get('sectionId') as string;
        const result = await duplicateSection(db, store.id, sectionId);

        if ('error' in result) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, section: result });
      }

      // Update page settings
      case 'update-settings': {
        const pageId = params.pageId as string;
        const title = formData.get('title') as string;
        const seoTitle = formData.get('seoTitle') as string;
        const seoDescription = formData.get('seoDescription') as string;
        // Floating button settings - WhatsApp & Call
        const whatsappEnabled = formData.get('whatsappEnabled');
        const whatsappNumber = formData.get('whatsappNumber') as string;
        const whatsappMessage = formData.get('whatsappMessage') as string;
        const callEnabled = formData.get('callEnabled');
        const callNumber = formData.get('callNumber') as string;
        // Order button settings
        const orderEnabled = formData.get('orderEnabled');
        const orderText = formData.get('orderText') as string;
        const orderBgColor = formData.get('orderBgColor') as string;
        const orderTextColor = formData.get('orderTextColor') as string;
        const buttonPosition = formData.get('buttonPosition') as
          | 'bottom-right'
          | 'bottom-left'
          | 'bottom-center';
        // Product - handle empty string as null, otherwise convert to number
        const productId = formData.get('productId') as string | null;
        const productIdParsed = productId && productId.trim() !== '' ? Number(productId) : null;

        // Log productId for troubleshooting
        console.log('[update-settings] productId:', productId, '->', productIdParsed);

        if (productId !== null && productIdParsed !== null && Number.isNaN(productIdParsed)) {
          return json({ success: false, error: 'Invalid product ID' }, { status: 400 });
        }

        if (productId !== null && productIdParsed !== null) {
          const [ownedProduct] = await drizzle(db)
            .select({ id: products.id })
            .from(products)
            .where(and(eq(products.id, productIdParsed), eq(products.storeId, store.id)))
            .limit(1);
          if (!ownedProduct) {
            return json({ success: false, error: 'Product not found' }, { status: 404 });
          }
        }

        await updatePageSettings(db, pageId, store.id, {
          title: title || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          whatsappEnabled: whatsappEnabled !== null ? whatsappEnabled === 'true' : undefined,
          whatsappNumber: whatsappNumber || undefined,
          whatsappMessage: whatsappMessage || undefined,
          callEnabled: callEnabled !== null ? callEnabled === 'true' : undefined,
          callNumber: callNumber || undefined,
          orderEnabled: orderEnabled !== null ? orderEnabled === 'true' : undefined,
          orderText: orderText || undefined,
          orderBgColor: orderBgColor || undefined,
          orderTextColor: orderTextColor || undefined,
          buttonPosition: buttonPosition || undefined,
          // Only update productId if it was explicitly provided in the form
          ...(productId !== null ? { productId: productIdParsed } : {}),
        });

        // AUTO-REPUBLISH: If productId changed and page is published, republish to sync
        if (productId !== null) {
          const currentPage = await getPageWithSections(db, pageId, store.id);
          if (currentPage?.status === 'published') {
            await publishPage(db, pageId, store.id);
          }
        }

        // CACHE INVALIDATION: Clear cached page when settings change
        const kv = (context.cloudflare.env as any).STORE_CACHE as KVNamespace | undefined;
        const updatedPage = await getPageWithSections(db, pageId, store.id);
        if (updatedPage && kv) {
          await invalidatePageCache(kv, store.id, updatedPage.slug);
        }

        return json({ success: true });
      }

      // Publish page
      case 'publish': {
        const pageId = params.pageId as string;
        await publishPage(db, pageId, store.id);

        // CACHE INVALIDATION: Clear cached page when published (new content)
        const kv = (context.cloudflare.env as any).STORE_CACHE as KVNamespace | undefined;
        const publishedPage = await getPageWithSections(db, pageId, store.id);
        if (publishedPage && kv) {
          await invalidatePageCache(kv, store.id, publishedPage.slug);
        }

        return json({ success: true });
      }

      default:
        return json({ success: false, error: 'Unknown intent' }, { status: 400 });
    }
  } catch (error) {
    console.error('Builder action error:', error);
    return json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function NewBuilderPage() {
  const loaderData = useLoaderData<typeof loader>() as any;
  const { page, sections: initialSections, store, products, product, isNew } = loaderData;
  const selectedProducts = loaderData.selectedProducts || [];
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();

  // Undo/redo history for sections
  const {
    state: sections,
    setState: setSections,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorHistory<BuilderSection[]>(initialSections as BuilderSection[], {
    maxHistory: 30,
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track when saves complete to update lastSaved
  const wasSubmittingRef = useRef(fetcher.state !== 'idle');
  useEffect(() => {
    const isSubmitting = fetcher.state !== 'idle';
    if (wasSubmittingRef.current && !isSubmitting && fetcher.data?.success) {
      setLastSaved(new Date());
    }
    wasSubmittingRef.current = isSubmitting;
  }, [fetcher.state, fetcher.data]);

  // Get active section
  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) || null,
    [sections, activeSectionId]
  );

  // Handle reorder
  const handleReorder = useCallback(
    (orderedIds: string[]) => {
      // Save to history before change
      pushHistory();

      // Optimistic update
      const reordered = orderedIds
        .map((id, index) => {
          const section = sections.find((s) => s.id === id);
          return section ? { ...section, sortOrder: index } : null;
        })
        .filter(Boolean) as BuilderSection[];

      setSections(reordered);

      // Submit to server
      fetcher.submit(
        { intent: 'reorder-sections', orderedIds: JSON.stringify(orderedIds) },
        { method: 'post' }
      );
    },
    [sections, fetcher, pushHistory]
  );

  // Handle toggle
  const handleToggle = useCallback(
    (sectionId: string, enabled: boolean) => {
      // Save to history before change
      pushHistory();

      // Optimistic update
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, enabled } : s)));

      // Submit to server
      fetcher.submit(
        { intent: 'toggle-section', sectionId, enabled: String(enabled) },
        { method: 'post' }
      );
    },
    [fetcher, pushHistory]
  );

  // Handle add section
  const handleAddSection = useCallback(
    (type: SectionType) => {
      fetcher.submit({ intent: 'add-section', type }, { method: 'post' });
      setShowAddModal(false);
    },
    [fetcher]
  );

  // Handle delete section
  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      // Save to history before change
      pushHistory();

      // Optimistic update
      setSections((prev) => prev.filter((s) => s.id !== sectionId));

      // Submit to server
      fetcher.submit({ intent: 'delete-section', sectionId }, { method: 'post' });

      // Clear selection if deleted
      if (activeSectionId === sectionId) {
        setActiveSectionId(null);
      }
    },
    [fetcher, activeSectionId, pushHistory]
  );

  // Handle update props
  const handleUpdateProps = useCallback(
    (sectionId: string, type: string, props: Record<string, unknown>, version: number) => {
      // Save to history before change
      pushHistory();

      // Optimistic update
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, props } : s)));

      // Submit to server
      fetcher.submit(
        {
          intent: 'update-props',
          sectionId,
          type,
          props: JSON.stringify(props),
          version: String(version),
        },
        { method: 'post' }
      );
    },
    [fetcher, pushHistory]
  );

  // Handle duplicate
  const handleDuplicate = useCallback(
    (sectionId: string) => {
      fetcher.submit({ intent: 'duplicate-section', sectionId }, { method: 'post' });
    },
    [fetcher]
  );

  // Handle create new page
  const handleCreatePage = useCallback(
    (slug: string, title: string) => {
      fetcher.submit({ intent: 'create-page', slug, title }, { method: 'post' });
    },
    [fetcher]
  );

  // Handle publish
  const handlePublish = useCallback(() => {
    fetcher.submit({ intent: 'publish' }, { method: 'post' });
  }, [fetcher]);

  // Handle save settings (floating buttons, etc.)
  const handleSaveSettings = useCallback(
    (settings: Record<string, unknown>) => {
      fetcher.submit(
        {
          intent: 'update-settings',
          // WhatsApp settings
          whatsappEnabled: String(settings.whatsappEnabled),
          whatsappNumber: (settings.whatsappNumber as string) || '',
          whatsappMessage: (settings.whatsappMessage as string) || '',
          // Call settings
          callEnabled: String(settings.callEnabled),
          callNumber: (settings.callNumber as string) || '',
          // Order button settings
          orderEnabled: String(settings.orderEnabled),
          orderText: (settings.orderText as string) || '',
          orderBgColor: (settings.orderBgColor as string) || '',
          orderTextColor: (settings.orderTextColor as string) || '',
          buttonPosition: (settings.buttonPosition as string) || '',
        },
        { method: 'post' }
      );
    },
    [fetcher]
  );

  // Handle product ID change (page-level) - persists productId when product is selected in CTA
  const handleProductIdChange = useCallback(
    (productId: number | null) => {
      fetcher.submit(
        {
          intent: 'update-settings',
          productId: productId !== null ? String(productId) : '',
        },
        { method: 'post' }
      );
    },
    [fetcher]
  );

  // Get selected section name for toast notifications
  const selectedSectionName = activeSection
    ? getSectionMeta(activeSection.type)?.name || activeSection.type
    : undefined;

  // Find current section index for navigation
  const currentSectionIndex = activeSectionId
    ? sections.findIndex((s) => s.id === activeSectionId)
    : -1;

  // Navigation handlers for keyboard shortcuts
  const handleSelectPrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setActiveSectionId(sections[currentSectionIndex - 1].id);
    }
  }, [currentSectionIndex, sections]);

  const handleSelectNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setActiveSectionId(sections[currentSectionIndex + 1].id);
    }
  }, [currentSectionIndex, sections]);

  // Comprehensive keyboard shortcuts (Undo, Redo, Delete, Duplicate, Save, Navigate)
  useBuilderKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
    onDeleteSection: activeSectionId ? () => handleDeleteSection(activeSectionId) : undefined,
    onDuplicateSection: activeSectionId ? () => handleDuplicate(activeSectionId) : undefined,
    onDeselectSection: () => setActiveSectionId(null),
    onSelectPrevSection: handleSelectPrevSection,
    onSelectNextSection: handleSelectNextSection,
    onSave: async () => {
      // Trigger publish action for save
      if (page) {
        handlePublish();
      }
    },
    hasSelectedSection: !!activeSectionId,
    selectedSectionName,
    enabled: !isNew, // Disable shortcuts on new page modal
    showToasts: true,
  });

  // Section copy/paste (Ctrl+C/V)
  useBuilderClipboard({
    selectedSection: activeSection,
    onPasteSection: (type, props) => {
      // Add the section with copied props
      fetcher.submit({ intent: 'add-section', type }, { method: 'post' });
      // Note: Props will be applied after section is created
      // This is a simplified implementation
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.pageId && isNew) {
      navigate(`/app/new-builder/${fetcher.data.pageId}`, { replace: true });
    }
  }, [fetcher.data, isNew, navigate]);

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.section) {
      const newSection = fetcher.data.section as BuilderSection;
      setSections((prev) =>
        prev.find((s) => s.id === newSection.id) ? prev : [...prev, newSection]
      );
    }
  }, [fetcher.data, setSections]);

  return (
    <BuilderLayout
      page={page}
      sections={sections}
      activeSectionId={activeSectionId}
      isNew={isNew}
      isSaving={fetcher.state !== 'idle'}
      onSelectSection={setActiveSectionId}
      onReorder={handleReorder}
      onToggle={handleToggle}
      onAddSection={handleAddSection}
      onDeleteSection={handleDeleteSection}
      onUpdateProps={handleUpdateProps}
      onDuplicate={handleDuplicate}
      onCreatePage={handleCreatePage}
      onPublish={handlePublish}
      showAddModal={showAddModal}
      setShowAddModal={setShowAddModal}
      availableSections={AVAILABLE_SECTIONS}
      products={products}
      selectedProduct={product}
      selectedProducts={selectedProducts || []}
      lastSaved={lastSaved}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      onSaveSettings={handleSaveSettings}
      onProductIdChange={handleProductIdChange}
    />
  );
}
