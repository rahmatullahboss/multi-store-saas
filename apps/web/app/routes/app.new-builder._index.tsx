/**
 * Page Builder v2 - Page List (Index)
 * 
 * Lists all builder pages for the store and allows creating new pages from templates.
 * 
 * UPGRADED: Now uses Intent Wizard for smart, conversion-optimized page creation.
 */

import { useState } from 'react';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { Plus, Edit, Trash2, Eye, FileText, ExternalLink, X, Sparkles } from 'lucide-react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';

import { requireAuth } from '~/lib/auth.server';
import { listPages, createPageFromTemplate, deletePage } from '~/lib/page-builder/actions.server';
import { getAllTemplates } from '~/lib/page-builder/templates';
import { IntentWizard } from '~/components/landing-builder/IntentWizard';
import { 
  generateOptimalSections, 
  generateDefaultContent,
  type Intent,
  type QuickProduct,
  type StyleTokens,
} from '~/utils/landing-builder/intentEngine';
import { products } from '@db/schema';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);
  
  const pages = await listPages(db, store.id);
  const templates = getAllTemplates();
  
  // Fetch existing products for Intent Wizard
  const existingProducts = await drizzleDb
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.storeId, store.id))
    .limit(50);
  
  return json({ 
    pages, 
    templates,
    storeSlug: store.slug,
    storeId: store.id,
    existingProducts: existingProducts.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      imageUrl: p.imageUrl || undefined,
    })),
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);
  
  const formData = await request.formData();
  const actionIntent = formData.get('intent');
  
  switch (actionIntent) {
    case 'create': {
      const templateId = formData.get('templateId') as string;
      const slug = formData.get('slug') as string;
      const title = formData.get('title') as string;
      
      if (!templateId || !slug) {
        return json({ error: 'Template and slug are required' }, { status: 400 });
      }
      
      const result = await createPageFromTemplate(db, store.id, templateId, slug, title);
      
      if ('error' in result) {
        return json({ error: result.error }, { status: 400 });
      }
      
      return redirect(`/app/new-builder/${result.pageId}`);
    }

    // NEW: Intent-based page creation from Quick Builder v2 (Genie Builder)
    case 'create-from-intent': {
      const intentDataStr = formData.get('intentData') as string;
      const productStr = formData.get('product') as string;
      const productIdStr = formData.get('productId') as string;
      const productIdsStr = formData.get('productIds') as string; // NEW: Multiple products
      const templateId = formData.get('templateId') as string;
      const styleTokensStr = formData.get('styleTokens') as string;

      if (!intentDataStr || !templateId) {
        return json({ error: 'Intent data and template are required' }, { status: 400 });
      }

      try {
        const intentData: Intent = JSON.parse(intentDataStr);
        const styleTokens: StyleTokens | undefined = styleTokensStr ? JSON.parse(styleTokensStr) : undefined;
        const productIds: number[] = productIdsStr ? JSON.parse(productIdsStr) : []; // NEW: Parse multiple products
        let product: QuickProduct | null = null;
        let linkedProductId: number | null = null;

        // Get product info - handle multiple products first
        if (productIds.length > 0) {
          // Multiple products selected - use first one as primary
          linkedProductId = productIds[0];
          const productResult = await drizzleDb
            .select()
            .from(products)
            .where(eq(products.id, linkedProductId))
            .limit(1);

          if (productResult[0]) {
            const p = productResult[0];
            product = {
              name: p.title,
              price: p.price,
              compareAtPrice: p.compareAtPrice || undefined,
              image: p.imageUrl || undefined,
            };
          }
          
          // TODO: Store all productIds in page metadata for multi-product landing pages
          // This can be used later to render multiple product showcases
        } else if (productIdStr) {
          // Single product selected
          linkedProductId = Number(productIdStr);
          const productResult = await drizzleDb
            .select()
            .from(products)
            .where(eq(products.id, linkedProductId))
            .limit(1);

          if (productResult[0]) {
            const p = productResult[0];
            product = {
              name: p.title,
              price: p.price,
              compareAtPrice: p.compareAtPrice || undefined,
              image: p.imageUrl || undefined,
            };
          }
        } else if (productStr) {
          product = JSON.parse(productStr);
          
          // Create quick product in database
          if (product) {
            const slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 50);

            const newProduct = await drizzleDb
              .insert(products)
              .values({
                storeId: store.id,
                title: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice || null,
                imageUrl: product.image || null,
                slug: slug + '-' + Date.now(),
                description: '',
                inventory: 100,
                isPublished: true,
              } as any)
              .returning({ id: products.id });

            linkedProductId = newProduct[0]?.id || null;
          }
        }

        if (!product) {
          return json({ error: 'Product is required' }, { status: 400 });
        }

        // Generate optimized sections based on intent
        const optimizedSections = generateOptimalSections(intentData);
        const defaultContent = generateDefaultContent(intentData, product);

        // Generate page title and slug
        const pageTitle = product.name || 'Landing Page';
        const pageSlug = product.name
          ? product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 30) + '-' + Date.now()
          : 'landing-' + Date.now();

        // Create page with intent-optimized template
        // Include productIds in intent for multi-product pages
        const intentWithProducts = {
          ...intentData,
          productIds: productIds.length > 0 ? productIds : (linkedProductId ? [linkedProductId] : []),
        };
        
        const result = await createPageFromTemplate(
          db, 
          store.id, 
          templateId, 
          pageSlug, 
          pageTitle,
          {
            intent: intentWithProducts,
            styleTokens,
            optimizedSections,
            defaultContent,
            linkedProductId,
          }
        );

        if ('error' in result) {
          return json({ error: result.error }, { status: 400 });
        }

        return json({
          success: true,
          pageId: result.pageId,
          redirectTo: `/app/new-builder/${result.pageId}`,
        });
      } catch (error) {
        console.error('Intent-based creation error:', error);
        return json({ error: 'Failed to create page' }, { status: 500 });
      }
    }
    
    case 'delete': {
      const pageId = formData.get('pageId') as string;
      if (!pageId) {
        return json({ error: 'Page ID required' }, { status: 400 });
      }
      
      await deletePage(db, pageId, store.id);
      return json({ success: true });
    }
    
    default:
      return json({ error: 'Invalid intent' }, { status: 400 });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function NewBuilderIndex() {
  const { pages, templates, storeSlug, storeId, existingProducts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher<{ success?: boolean; redirectTo?: string; error?: string }>();
  const [showIntentWizard, setShowIntentWizard] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Handle Intent Wizard completion
  const handleIntentComplete = (data: {
    intent: Intent;
    product: QuickProduct | null;
    productId: number | null;
    productIds: number[];
    templateId: string;
    styleTokens: StyleTokens;
  }) => {
    const formData = new FormData();
    formData.append('intent', 'create-from-intent');
    formData.append('intentData', JSON.stringify(data.intent));
    formData.append('templateId', data.templateId);
    formData.append('styleTokens', JSON.stringify(data.styleTokens));
    
    // Handle multiple products
    if (data.productIds.length > 0) {
      formData.append('productIds', JSON.stringify(data.productIds));
    } else if (data.productId) {
      formData.append('productId', String(data.productId));
    } else if (data.product) {
      formData.append('product', JSON.stringify(data.product));
    }

    fetcher.submit(formData, { method: 'POST' });
  };

  // Handle redirect after successful creation
  if (fetcher.data?.success && fetcher.data.redirectTo) {
    navigate(fetcher.data.redirectTo);
  }

  // Legacy handler for old template gallery (kept for backwards compatibility)
  const handleCreatePage = (templateId: string, slug: string, title: string) => {
    fetcher.submit(
      { intent: 'create', templateId, slug, title },
      { method: 'POST' }
    );
  };

  // Image upload handler for Intent Wizard
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', String(storeId));

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json() as { success?: boolean; url?: string };
    if (result.success && result.url) {
      return result.url;
    }
    throw new Error('Upload failed');
  };

  const handleDeletePage = (pageId: string) => {
    fetcher.submit(
      { intent: 'delete', pageId },
      { method: 'POST' }
    );
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
              <p className="text-gray-500 mt-1">আপনার ল্যান্ডিং পেজ তৈরি ও ম্যানেজ করুন</p>
            </div>
            <button
              onClick={() => setShowIntentWizard(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Sparkles size={20} />
              ✨ Genie দিয়ে তৈরি করুন
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pages.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">এখনো কোনো পেজ নেই</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              আপনার প্রথম ল্যান্ডিং পেজ তৈরি করুন এবং আপনার পণ্য বা সেবা প্রচার করুন
            </p>
            <button
              onClick={() => setShowIntentWizard(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium"
            >
              <Sparkles size={20} />
              ✨ Genie দিয়ে শুরু করুন
            </button>
          </div>
        ) : (
          /* Page Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map(page => (
              <div 
                key={page.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Preview Area */}
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative">
                  <FileText className="w-12 h-12 text-gray-300" />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => navigate(`/app/new-builder/${page.id}`)}
                      className="p-3 bg-white rounded-full text-gray-700 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <a
                      href={`https://${storeSlug}.ozzyl.com/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-full text-gray-700 hover:bg-green-600 hover:text-white transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </a>
                    <button
                      onClick={() => setDeleteConfirm(page.id)}
                      className="p-3 bg-white rounded-full text-gray-700 hover:bg-red-600 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {page.title || 'Untitled Page'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">/p/{page.slug}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                    <span>
                      Created {new Date(page.createdAt ?? Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                    <a
                      href={`https://${storeSlug}.ozzyl.com/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intent Wizard Modal (Quick Builder v2) */}
      {showIntentWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowIntentWizard(false)} 
          />
          
          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setShowIntentWizard(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              {/* Wizard Header */}
              <div className="text-center pt-8 pb-4 px-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">✨ Genie</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  ম্যাজিক্যালি ল্যান্ডিং পেইজ তৈরি করুন
                </h2>
                <p className="text-gray-500">
                  ৩টি সহজ ধাপে হাই-কনভার্টিং ল্যান্ডিং পেজ
                </p>
              </div>
              
              {/* Intent Wizard */}
              <div className="px-6 pb-8">
                <IntentWizard
                  existingProducts={existingProducts}
                  onComplete={handleIntentComplete}
                  onImageUpload={handleImageUpload}
                  isSubmitting={fetcher.state === 'submitting'}
                />
              </div>
              
              {/* Error message */}
              {fetcher.data?.error && (
                <div className="mx-6 mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {fetcher.data.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              পেজ ডিলিট করবেন?
            </h3>
            <p className="text-gray-500 mb-6">
              এই পেজ এবং এর সমস্ত সেকশন স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleDeletePage(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
