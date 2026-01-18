/**
 * Page Builder v2 - Page List (Index)
 * 
 * Lists all builder pages for the store and allows creating new pages from templates.
 */

import { useState } from 'react';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate, useFetcher } from '@remix-run/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { Plus, Edit, Trash2, Eye, FileText, ExternalLink } from 'lucide-react';

import { requireAuth } from '~/lib/auth.server';
import { listPages, createPageFromTemplate, deletePage } from '~/lib/page-builder/actions.server';
import { getAllTemplates } from '~/lib/page-builder/templates';
import { TemplateGallery } from '~/components/page-builder/TemplateGallery';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  
  const pages = await listPages(db, store.id);
  const templates = getAllTemplates();
  
  return json({ 
    pages, 
    templates,
    storeSlug: store.slug,
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  switch (intent) {
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
  const { pages, templates, storeSlug } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreatePage = (templateId: string, slug: string, title: string) => {
    fetcher.submit(
      { intent: 'create', templateId, slug, title },
      { method: 'POST' }
    );
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
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={20} />
              নতুন পেজ তৈরি করুন
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
              onClick={() => setShowTemplateGallery(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus size={20} />
              প্রথম পেজ তৈরি করুন
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

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          templates={templates}
          onSelect={handleCreatePage}
          onClose={() => setShowTemplateGallery(false)}
          isSubmitting={fetcher.state === 'submitting'}
        />
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
