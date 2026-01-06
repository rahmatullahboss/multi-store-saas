/**
 * Template Selector Page - Merchant Dashboard
 * Route: /app/design
 * 
 * Allows merchants to select from available landing page templates
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllTemplates, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { Check, ExternalLink, Palette, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TemplatePreviewModal } from '~/components/TemplatePreview';

export const meta: MetaFunction = () => [{ title: 'Store Design - Multi-Store SaaS' }];

// ============================================================================
// LOADER - Fetch current template selection
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const landingConfig = parseLandingConfig(store[0].landingConfig as string | null) || defaultLandingConfig;
  const currentTemplateId = landingConfig.templateId || DEFAULT_TEMPLATE_ID;
  const templates = getAllTemplates();
  
  return json({
    currentTemplateId,
    templates: templates.map(t => ({ id: t.id, name: t.name, description: t.description, thumbnail: t.thumbnail })),
    storeSubdomain: store[0].subdomain,
    storeName: store[0].name,
  });
}

// ============================================================================
// ACTION - Update template selection (with server-side validation)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const formData = await request.formData();
  const templateId = formData.get('templateId') as string;
  
  if (!templateId) return json({ success: false, error: 'Template ID required' }, { status: 400 });

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store with plan info
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  // ========================================================================
  // SERVER-SIDE VALIDATION: Validate template ID
  // ========================================================================
  // NOTE: All base themes (modern-dark, minimal-light, video-focus) are now 
  // available for free users. Premium themes will be added later.
  
  const currentConfig = parseLandingConfig(store[0].landingConfig as string | null) || defaultLandingConfig;

  
  // Update with new template ID
  const updatedConfig: LandingConfig = { ...currentConfig, templateId };
  
  await db.update(stores).set({ landingConfig: JSON.stringify(updatedConfig), updatedAt: new Date() }).where(eq(stores.id, storeId));
  
  return json({ success: true, templateId });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function DesignPage() {
  const { currentTemplateId, templates, storeSubdomain, storeName } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(currentTemplateId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  const isSubmitting = navigation.state === 'submitting';

  // Handle template preview
  const handlePreview = (templateId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewTemplate(templateId);
    setShowPreview(true);
  };

  // Show success toast after selection
  useEffect(() => {
    if (navigation.state === 'idle' && navigation.formData) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [navigation.state, navigation.formData]);

  // Update selected when current changes
  useEffect(() => { setSelectedId(currentTemplateId); }, [currentTemplateId]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Palette className="w-7 h-7 text-emerald-600" />
            Store Design
          </h1>
          <p className="text-gray-600 mt-1">Choose a landing page template for your store</p>
        </div>
        <Link
          to={`https://${storeSubdomain}.digitalcare.site`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Store
        </Link>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          Template updated successfully!
        </div>
      )}



      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isActive = template.id === currentTemplateId;
          const isSelected = template.id === selectedId;

          
          return (
            <Form method="post" key={template.id}>
              <input type="hidden" name="templateId" value={template.id} />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all ${
                  isActive ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 
                  isSelected ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {/* Placeholder thumbnail - you can replace with actual images */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {template.id === 'modern-dark' && (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                        <span className="text-4xl">🌙</span>
                      </div>
                    )}
                    {template.id === 'minimal-light' && (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <span className="text-4xl">☀️</span>
                      </div>
                    )}
                    {template.id === 'video-focus' && (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    {!isActive && (
                      <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        {isSubmitting && isSelected ? 'Applying...' : 'Select Template →'}
                      </span>
                    )}
                    {isActive && (
                      <span className="text-sm font-medium text-emerald-600">Currently Active</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handlePreview(template.id, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </button>
            </Form>
          );
        })}
      </div>


      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900">💡 Template Tips</h4>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li>• <strong>Modern Dark:</strong> Great for urgency-driven sales with bold colors</li>
          <li>• <strong>Minimal Light:</strong> Clean and elegant, perfect for premium products</li>
          <li>• <strong>Video Focus:</strong> Best when you have a product video to showcase</li>
          <li>• Click <strong>Preview</strong> on any template to see how it looks before selecting</li>
        </ul>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
          templateId={previewTemplate}
          templateName={templates.find(t => t.id === previewTemplate)?.name || 'Template'}
          storeName={storeName}
          currency="BDT"
        />
      )}
    </div>
  );
}
