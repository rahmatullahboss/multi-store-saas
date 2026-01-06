/**
 * Unified Store Setup Page - All Landing Page Settings in One Place
 * Route: /app/store-setup
 * 
 * Combines:
 * - Template selection
 * - Featured product selection
 * - Headlines & copy
 * - Video & CTA
 * - Testimonials
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllTemplates, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { 
  Loader2, CheckCircle, ExternalLink, Palette, Zap, 
  MessageSquare, Video, Users, Plus, Trash2, Eye,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { OptimizedImage } from '~/components/OptimizedImage';

export const meta: MetaFunction = () => [{ title: 'Store Setup - Multi-Store SaaS' }];

// ============================================================================
// LOADER - Fetch all store setup data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  // Get published products for featured product selector
  const storeProducts = await db
    .select({ id: products.id, title: products.title, imageUrl: products.imageUrl, price: products.price })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .limit(50);

  const landingConfig = parseLandingConfig(store[0].landingConfig as string | null) || defaultLandingConfig;
  const templates = getAllTemplates();
  
  return json({
    currentTemplateId: landingConfig.templateId || DEFAULT_TEMPLATE_ID,
    templates: templates.map(t => ({ id: t.id, name: t.name, description: t.description })),
    storeSubdomain: store[0].subdomain,
    storeName: store[0].name,
    featuredProductId: store[0].featuredProductId,
    landingConfig,
    products: storeProducts,
    currency: store[0].currency || 'BDT',
  });
}

// ============================================================================
// ACTION - Save all store setup data
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request);
  const storeId = await getStoreId(request);
  if (!storeId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const templateId = formData.get('templateId') as string;
  const featuredProductId = formData.get('featuredProductId') as string;
  const headline = formData.get('headline') as string;
  const subheadline = formData.get('subheadline') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const ctaText = formData.get('ctaText') as string;
  const ctaSubtext = formData.get('ctaSubtext') as string;
  const urgencyText = formData.get('urgencyText') as string;
  const guaranteeText = formData.get('guaranteeText') as string;
  const testimonialsJson = formData.get('testimonials') as string;

  let testimonials: LandingConfig['testimonials'] = [];
  try {
    if (testimonialsJson) {
      testimonials = JSON.parse(testimonialsJson);
    }
  } catch {
    // Invalid JSON, ignore
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get current config to preserve existing values
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const currentConfig = parseLandingConfig(store[0]?.landingConfig as string | null) || defaultLandingConfig;

  const landingConfig: LandingConfig = {
    ...currentConfig,
    templateId: templateId || currentConfig.templateId || DEFAULT_TEMPLATE_ID,
    headline: headline || 'Transform Your Life Today',
    subheadline: subheadline || '',
    videoUrl: videoUrl || '',
    ctaText: ctaText || 'Buy Now',
    ctaSubtext: ctaSubtext || '',
    urgencyText: urgencyText || '',
    guaranteeText: guaranteeText || '',
    testimonials,
  };

  await db
    .update(stores)
    .set({
      featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
      landingConfig: JSON.stringify(landingConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function StoreSetupPage() {
  const { 
    currentTemplateId, templates, storeSubdomain, storeName,
    featuredProductId, landingConfig, products: storeProducts, currency
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [testimonials, setTestimonials] = useState<LandingConfig['testimonials']>(landingConfig.testimonials || []);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    templates: true,
    product: true,
    headlines: true,
    video: false,
    cta: false,
    testimonials: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const addTestimonial = () => {
    setTestimonials([...(testimonials || []), { name: '', text: '' }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials?.filter((_, i) => i !== index) || []);
  };

  const updateTestimonial = (index: number, field: 'name' | 'text', value: string) => {
    const updated = [...(testimonials || [])];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const selectedProduct = storeProducts.find(p => p.id === featuredProductId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Palette className="w-7 h-7 text-emerald-600" />
            Store Setup
          </h1>
          <p className="text-gray-600 mt-1">Configure your landing page in one place</p>
        </div>
        <Link
          to={`https://${storeSubdomain}.digitalcare.site`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Live
        </Link>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          Store setup saved successfully!
        </div>
      )}

      <Form method="post" className="space-y-4">
        <input type="hidden" name="templateId" value={selectedTemplateId} />
        <input type="hidden" name="testimonials" value={JSON.stringify(testimonials)} />

        {/* Section 1: Template Selection */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('templates')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">1. Choose Template</h2>
                <p className="text-sm text-gray-500">Select your landing page design</p>
              </div>
            </div>
            {expandedSections.templates ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.templates && (
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-4 rounded-xl border-2 transition text-left ${
                    selectedTemplateId === template.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {template.id === 'modern-dark' && '🌙'}
                      {template.id === 'minimal-light' && '☀️'}
                      {template.id === 'video-focus' && '🎬'}
                    </span>
                    {selectedTemplateId === template.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Featured Product */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('product')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">2. Featured Product</h2>
                <p className="text-sm text-gray-500">
                  {selectedProduct ? selectedProduct.title : 'Select the main product to display'}
                </p>
              </div>
            </div>
            {expandedSections.product ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.product && (
            <div className="p-4 pt-0">
              {storeProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {storeProducts.map((product) => (
                    <label
                      key={product.id}
                      className={`relative p-3 rounded-xl border-2 cursor-pointer transition ${
                        featuredProductId === product.id 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="featuredProductId"
                        value={product.id}
                        defaultChecked={featuredProductId === product.id}
                        className="sr-only"
                      />
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                        {product.imageUrl ? (
                          <OptimizedImage src={product.imageUrl} alt={product.title} width={120} height={120} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
                        )}
                      </div>
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{product.title}</p>
                      <p className="text-sm text-emerald-600 font-bold">{currency} {product.price}</p>
                      {featuredProductId === product.id && (
                        <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-600" />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No products yet.</p>
                  <Link to="/app/products/new" className="inline-flex items-center gap-2 mt-2 text-emerald-600 hover:text-emerald-700">
                    <Plus className="w-4 h-4" /> Add Product
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Headlines */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('headlines')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">3. Headlines & Copy</h2>
                <p className="text-sm text-gray-500">Your landing page text</p>
              </div>
            </div>
            {expandedSections.headlines ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.headlines && (
            <div className="p-4 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Headline *</label>
                <input
                  type="text"
                  name="headline"
                  defaultValue={landingConfig.headline}
                  placeholder="আপনার জীবন বদলে দিন"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                <input
                  type="text"
                  name="subheadline"
                  defaultValue={landingConfig.subheadline || ''}
                  placeholder="সেরা পণ্য, সেরা দাম"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Text (Top Banner)</label>
                <input
                  type="text"
                  name="urgencyText"
                  defaultValue={landingConfig.urgencyText || ''}
                  placeholder="🔥 সীমিত সময়ের অফার!"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Text</label>
                <input
                  type="text"
                  name="guaranteeText"
                  defaultValue={landingConfig.guaranteeText || ''}
                  placeholder="৭ দিনের মানি ব্যাক গ্যারান্টি"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Video */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('video')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">4. Video (Optional)</h2>
                <p className="text-sm text-gray-500">Add YouTube or Vimeo video</p>
              </div>
            </div>
            {expandedSections.video ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.video && (
            <div className="p-4 pt-0">
              <input
                type="url"
                name="videoUrl"
                defaultValue={landingConfig.videoUrl || ''}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Section 5: CTA */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('cta')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">5. CTA Button</h2>
                <p className="text-sm text-gray-500">Customize your order button</p>
              </div>
            </div>
            {expandedSections.cta ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.cta && (
            <div className="p-4 pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  name="ctaText"
                  defaultValue={landingConfig.ctaText}
                  placeholder="এখনই অর্ডার করুন"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Subtext</label>
                <input
                  type="text"
                  name="ctaSubtext"
                  defaultValue={landingConfig.ctaSubtext || ''}
                  placeholder="ক্যাশ অন ডেলিভারি"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Testimonials */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('testimonials')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">6. Testimonials</h2>
                <p className="text-sm text-gray-500">{testimonials?.length || 0} reviews added</p>
              </div>
            </div>
            {expandedSections.testimonials ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.testimonials && (
            <div className="p-4 pt-0 space-y-4">
              {testimonials && testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          placeholder="Customer name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <textarea
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                          placeholder="Their review..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTestimonial(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No testimonials yet</p>
                </div>
              )}
              <button
                type="button"
                onClick={addTestimonial}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Testimonial
              </button>
            </div>
          )}
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:left-64">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to={`https://${storeSubdomain}.digitalcare.site`}
              target="_blank"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Store Setup
                </>
              )}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
