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
import { useState, useCallback, useMemo } from 'react';
import { requireAuth } from '~/lib/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products } from '@db/schema';
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
import { isValidSectionType, getSectionMeta, AVAILABLE_SECTIONS } from '~/lib/page-builder/registry';
import type { BuilderSection, SectionType } from '~/lib/page-builder/types';
import { BuilderLayout } from '~/components/page-builder/BuilderLayout';

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
  const rawProducts = await odb.select({
    id: products.id,
    title: products.title,
    price: products.price,
    imageUrl: products.imageUrl,
    bundlePricing: products.bundlePricing,
  }).from(products).where(eq(products.storeId, store.id));
  
  // Format products with name field and parse bundlePricing for UI
  const storeProducts = rawProducts.map(p => {
    let bundleTiers = [];
    try {
      bundleTiers = JSON.parse(p.bundlePricing || '[]');
    } catch { /* ignore */ }
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
      store: { id: store.id, name: store.name, subdomain: store.subdomain },
      products: storeProducts,
      isNew: true,
    });
  }
  
  const page = await getPageWithSections(db, pageId, store.id);
  
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  
  return json({
    page,
    sections: page.sections,
    store: { id: store.id, name: store.name, subdomain: store.subdomain },
    products: storeProducts,
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
        await initializePageWithDefaults(db, result.id);
        
        return json({ success: true, pageId: result.id });
      }
      
      // Add section
      case 'add-section': {
        const pageId = params.pageId as string;
        const type = formData.get('type') as string;
        
        if (!isValidSectionType(type)) {
          return json({ success: false, error: 'Invalid section type' }, { status: 400 });
        }
        
        const result = await addSection(db, pageId, type);
        
        if ('error' in result) {
          return json({ success: false, error: result.error }, { status: 400 });
        }
        
        return json({ success: true, section: result });
      }
      
      // Toggle section visibility
      case 'toggle-section': {
        const sectionId = formData.get('sectionId') as string;
        const enabled = formData.get('enabled') === 'true';
        
        await toggleSection(db, sectionId, enabled);
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
        await deleteSection(db, sectionId);
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
        
        const result = await reorderSections(db, pageId, orderedIds);
        
        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }
        
        return json({ success: true });
      }
      
      // Duplicate section
      case 'duplicate-section': {
        const sectionId = formData.get('sectionId') as string;
        const result = await duplicateSection(db, sectionId);
        
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
        
        await updatePageSettings(db, pageId, store.id, {
          title: title || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        });
        
        return json({ success: true });
      }
      
      // Publish page
      case 'publish': {
        const pageId = params.pageId as string;
        await publishPage(db, pageId, store.id);
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
  const { page, sections: initialSections, store, products, isNew } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  
  // Local state for optimistic updates
  const [sections, setSections] = useState<BuilderSection[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Get active section
  const activeSection = useMemo(() => 
    sections.find(s => s.id === activeSectionId) || null,
    [sections, activeSectionId]
  );
  
  // Handle reorder
  const handleReorder = useCallback((orderedIds: string[]) => {
    // Optimistic update
    const reordered = orderedIds.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, sortOrder: index } : null;
    }).filter(Boolean) as BuilderSection[];
    
    setSections(reordered);
    
    // Submit to server
    fetcher.submit(
      { intent: 'reorder-sections', orderedIds: JSON.stringify(orderedIds) },
      { method: 'post' }
    );
  }, [sections, fetcher]);
  
  // Handle toggle
  const handleToggle = useCallback((sectionId: string, enabled: boolean) => {
    // Optimistic update
    setSections(prev => 
      prev.map(s => s.id === sectionId ? { ...s, enabled } : s)
    );
    
    // Submit to server
    fetcher.submit(
      { intent: 'toggle-section', sectionId, enabled: String(enabled) },
      { method: 'post' }
    );
  }, [fetcher]);
  
  // Handle add section
  const handleAddSection = useCallback((type: SectionType) => {
    fetcher.submit(
      { intent: 'add-section', type },
      { method: 'post' }
    );
    setShowAddModal(false);
  }, [fetcher]);
  
  // Handle delete section
  const handleDeleteSection = useCallback((sectionId: string) => {
    // Optimistic update
    setSections(prev => prev.filter(s => s.id !== sectionId));
    
    // Submit to server
    fetcher.submit(
      { intent: 'delete-section', sectionId },
      { method: 'post' }
    );
    
    // Clear selection if deleted
    if (activeSectionId === sectionId) {
      setActiveSectionId(null);
    }
  }, [fetcher, activeSectionId]);
  
  // Handle update props
  const handleUpdateProps = useCallback((sectionId: string, type: string, props: Record<string, unknown>, version: number) => {
    // Optimistic update
    setSections(prev => 
      prev.map(s => s.id === sectionId ? { ...s, props } : s)
    );
    
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
  }, [fetcher]);
  
  // Handle duplicate
  const handleDuplicate = useCallback((sectionId: string) => {
    fetcher.submit(
      { intent: 'duplicate-section', sectionId },
      { method: 'post' }
    );
  }, [fetcher]);
  
  // Handle create new page
  const handleCreatePage = useCallback((slug: string, title: string) => {
    fetcher.submit(
      { intent: 'create-page', slug, title },
      { method: 'post' }
    );
  }, [fetcher]);
  
  // Redirect after page creation
  if (fetcher.data?.success && fetcher.data?.pageId && isNew) {
    navigate(`/app/new-builder/${fetcher.data.pageId}`, { replace: true });
  }
  
  // Update sections when fetcher returns new data
  if (fetcher.data?.success && fetcher.data?.section) {
    const newSection = fetcher.data.section as BuilderSection;
    if (!sections.find(s => s.id === newSection.id)) {
      setSections(prev => [...prev, newSection]);
    }
  }
  
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
      showAddModal={showAddModal}
      setShowAddModal={setShowAddModal}
      availableSections={AVAILABLE_SECTIONS}
      products={products}
    />
  );
}
