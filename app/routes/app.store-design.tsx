/**
 * Store Template Selector Page - Merchant Dashboard
 * Route: /app/store-design
 * 
 * Allows merchants to select from available full store templates.
 * Similar to /app/design but for the full store mode (not landing page).
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates, DEFAULT_STORE_TEMPLATE_ID, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { Check, ExternalLink, Store, Eye, Sparkles, Crown, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => [{ title: 'Store Templates - Multi-Store SaaS' }];

// ============================================================================
// LOADER - Fetch current store template selection
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const themeConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;
  const currentTemplateId = themeConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const templates = getAllStoreTemplates();
  
  return json({
    currentTemplateId,
    templates: templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      description: t.description, 
      thumbnail: t.thumbnail,
      category: t.category,
      theme: t.theme,
      fonts: t.fonts,
    })),
    storeSubdomain: store[0].subdomain,
    storeName: store[0].name,
    storeMode: store[0].mode || 'store',
  });
}

// ============================================================================
// ACTION - Update store template selection
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const formData = await request.formData();
  const templateId = formData.get('templateId') as string;
  
  if (!templateId) return json({ success: false, error: 'Template ID required' }, { status: 400 });

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store with current config
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const currentConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  // Update with new template ID
  const updatedConfig: ThemeConfig = { ...currentConfig, storeTemplateId: templateId };
  
  await db.update(stores).set({ 
    themeConfig: JSON.stringify(updatedConfig), 
    updatedAt: new Date() 
  }).where(eq(stores.id, storeId));
  
  return json({ success: true, templateId });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function StoreDesignPage() {
  const { currentTemplateId, templates, storeSubdomain, storeName, storeMode } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(currentTemplateId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  const isSubmitting = navigation.state === 'submitting';

  // Show success toast after selection
  useEffect(() => {
    if (navigation.state === 'idle' && navigation.formData) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [navigation.state, navigation.formData]);

  // Update selected when current changes
  useEffect(() => { setSelectedId(currentTemplateId); }, [currentTemplateId]);

  // Category icons
  const categoryIcons: Record<string, JSX.Element> = {
    luxury: <Crown className="w-4 h-4" />,
    tech: <Sparkles className="w-4 h-4" />,
    artisan: <Palette className="w-4 h-4" />,
  };

  // Category labels
  const categoryLabels: Record<string, string> = {
    luxury: 'Fashion & Luxury',
    tech: 'Tech & Electronics',
    artisan: 'Handmade & Artisan',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="w-7 h-7 text-purple-600" />
            Store Templates
          </h1>
          <p className="text-gray-600 mt-1">Choose a beautiful template for your online store</p>
        </div>
        <div className="flex items-center gap-3">
          {storeMode === 'store' && (
            <Link
              to={`https://${storeSubdomain}.digitalcare.site`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              <ExternalLink className="w-4 h-4" />
              View Store
            </Link>
          )}
        </div>
      </div>

      {/* Mode Warning */}
      {storeMode !== 'store' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Store Mode Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              Your store is currently in <strong>Landing Page Mode</strong>. To use these store templates, 
              switch to <strong>Store Mode</strong> in your settings.
            </p>
            <Link 
              to="/app/settings" 
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 mt-2"
            >
              Go to Settings →
            </Link>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          Template applied successfully!
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {templates.map((template) => {
          const isActive = template.id === currentTemplateId;
          const isSelected = template.id === selectedId;
          const theme = STORE_TEMPLATE_THEMES[template.id];
          
          return (
            <div 
              key={template.id}
              className={`rounded-2xl overflow-hidden border-2 transition-all ${
                isActive ? 'border-purple-500 ring-4 ring-purple-500/20' : 
                'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Template Preview */}
              <div 
                className="aspect-[4/3] relative overflow-hidden"
                style={{ backgroundColor: theme?.background || '#f8f8f8' }}
              >
                {/* Mini Preview */}
                <div className="absolute inset-0 p-4">
                  {/* Mini Header */}
                  <div 
                    className="h-8 rounded-lg mb-3 flex items-center px-3 gap-2"
                    style={{ backgroundColor: theme?.headerBg || '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  >
                    <div 
                      className="w-12 h-3 rounded"
                      style={{ backgroundColor: theme?.primary || '#333' }}
                    />
                    <div className="flex-1" />
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme?.accent || '#666' }}
                    />
                  </div>
                  
                  {/* Mini Hero */}
                  <div 
                    className="h-20 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: theme?.primary || '#333' }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-20 h-2 rounded mx-auto mb-1"
                        style={{ backgroundColor: theme?.accent || '#fff' }}
                      />
                      <div 
                        className="w-16 h-1.5 rounded mx-auto opacity-50"
                        style={{ backgroundColor: '#fff' }}
                      />
                    </div>
                  </div>
                  
                  {/* Mini Product Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="aspect-square rounded-lg"
                        style={{ backgroundColor: theme?.cardBg || '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Category Badge */}
                <div 
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                  style={{ backgroundColor: theme?.accent || '#666', color: '#fff' }}
                >
                  {categoryIcons[template.category]}
                  {categoryLabels[template.category]}
                </div>
                
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </div>
                )}

                {/* Preview Button Overlay */}
                <button
                  onClick={() => setPreviewTemplate(template.id)}
                  className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                >
                  <span className="bg-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg">
                    <Eye className="w-4 h-4" />
                    Preview
                  </span>
                </button>
              </div>
              
              {/* Info */}
              <div className="p-5 bg-white">
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                
                {/* Color Swatches */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">Colors:</span>
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme?.primary || '#333' }}
                    title="Primary"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme?.accent || '#666' }}
                    title="Accent"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme?.background || '#fff' }}
                    title="Background"
                  />
                </div>
                
                {/* Action */}
                <div className="mt-4">
                  {isActive ? (
                    <div className="w-full py-2.5 text-center font-medium text-purple-600 bg-purple-50 rounded-lg">
                      Currently Active
                    </div>
                  ) : (
                    <Form method="post">
                      <input type="hidden" name="templateId" value={template.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2.5 font-medium rounded-lg transition-colors ${
                          isSubmitting && isSelected
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        onClick={() => setSelectedId(template.id)}
                      >
                        {isSubmitting && isSelected ? 'Applying...' : 'Apply Template'}
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-5">
        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          About Store Templates
        </h4>
        <ul className="mt-3 text-sm text-purple-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span><strong>Luxe Boutique:</strong> Elegant black & gold design perfect for fashion, jewelry, and premium products.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span><strong>Tech Modern:</strong> Clean, bold blue design ideal for electronics, gadgets, and tech products.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span><strong>Artisan Market:</strong> Warm, rustic amber design great for handmade, organic, and artisanal goods.</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-purple-700">
          💡 <strong>Tip:</strong> Templates only affect Store Mode. If you're using Landing Page Mode, 
          check the <Link to="/app/design" className="underline hover:no-underline">Landing Page Templates</Link> instead.
        </p>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {templates.find(t => t.id === previewTemplate)?.name} Preview
              </h3>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">🏪</div>
                <p className="text-gray-600">
                  Apply this template to see it live on your store!
                </p>
                <Form method="post" className="mt-4">
                  <input type="hidden" name="templateId" value={previewTemplate} />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                    onClick={() => {
                      setSelectedId(previewTemplate);
                      setTimeout(() => setPreviewTemplate(null), 100);
                    }}
                  >
                    Apply {templates.find(t => t.id === previewTemplate)?.name}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
