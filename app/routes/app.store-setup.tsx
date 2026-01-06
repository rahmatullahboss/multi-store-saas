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
import { Form, Link, useLoaderData, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllTemplates, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { 
  Loader2, CheckCircle, ExternalLink, Palette, Zap, 
  MessageSquare, Video, Users, Plus, Trash2, Eye,
  ChevronDown, ChevronUp, Globe, EyeOff, Upload, X, Image as ImageIcon
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
// AI features temporarily disabled for MVP
// import { AIEnhanceButton } from '~/components/AIEnhanceButton';

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
    isStorePublished: store[0].isActive ?? true,
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

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Handle publish/unpublish toggle
  if (intent === 'togglePublish') {
    const isPublished = formData.get('isPublished') === 'true';
    await db.update(stores).set({ isActive: isPublished, updatedAt: new Date() }).where(eq(stores.id, storeId));
    return json({ success: true, published: isPublished });
  }

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
  const featuresJson = formData.get('features') as string;
  const faqJson = formData.get('faq') as string;
  
  // WhatsApp settings
  const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const whatsappMessage = formData.get('whatsappMessage') as string;
  
  // Countdown Timer settings
  const countdownEnabled = formData.get('countdownEnabled') === 'true';
  const countdownText = formData.get('countdownText') as string;
  
  // Stock Counter settings
  const showStockCounter = formData.get('showStockCounter') === 'true';
  
  // Social Proof settings
  const showSocialProof = formData.get('showSocialProof') === 'true';
  const socialProofInterval = parseInt(formData.get('socialProofInterval') as string) || 15;

  let testimonials: LandingConfig['testimonials'] = [];
  let features: LandingConfig['features'] = [];
  let faq: LandingConfig['faq'] = [];
  
  try {
    if (testimonialsJson) testimonials = JSON.parse(testimonialsJson);
  } catch { /* ignore */ }
  try {
    if (featuresJson) features = JSON.parse(featuresJson);
  } catch { /* ignore */ }
  try {
    if (faqJson) faq = JSON.parse(faqJson);
  } catch { /* ignore */ }

  // Get current config to preserve existing values
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const currentConfig = parseLandingConfig(store[0]?.landingConfig as string | null) || defaultLandingConfig;

  // Build new config - use submitted values, fallback to current saved values
  // This ensures merchant's saved data is never overwritten by hardcoded defaults
  const landingConfig: LandingConfig = {
    ...currentConfig,
    templateId: templateId || currentConfig.templateId || DEFAULT_TEMPLATE_ID,
    headline: headline !== null ? headline : currentConfig.headline,
    subheadline: subheadline !== null ? subheadline : (currentConfig.subheadline || ''),
    videoUrl: videoUrl !== null ? videoUrl : (currentConfig.videoUrl || ''),
    ctaText: ctaText || currentConfig.ctaText || 'Buy Now',
    ctaSubtext: ctaSubtext !== null ? ctaSubtext : (currentConfig.ctaSubtext || ''),
    urgencyText: urgencyText !== null ? urgencyText : (currentConfig.urgencyText || ''),
    guaranteeText: guaranteeText !== null ? guaranteeText : (currentConfig.guaranteeText || ''),
    testimonials,
    features: (features?.length ?? 0) > 0 ? features : currentConfig.features,
    faq: (faq?.length ?? 0) > 0 ? faq : currentConfig.faq,
    whatsappEnabled,
    whatsappNumber: whatsappNumber || currentConfig.whatsappNumber,
    whatsappMessage: whatsappMessage || currentConfig.whatsappMessage,
    // New settings
    countdownEnabled,
    countdownText: countdownText || currentConfig.countdownText || '🔥 অফার শেষ হতে বাকি',
    showStockCounter,
    showSocialProof,
    socialProofInterval,
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
    featuredProductId, isStorePublished, landingConfig, products: storeProducts, currency
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [testimonials, setTestimonials] = useState<LandingConfig['testimonials']>(landingConfig.testimonials || []);
  const [features, setFeatures] = useState<LandingConfig['features']>(landingConfig.features || []);
  const [faq, setFaq] = useState<LandingConfig['faq']>(landingConfig.faq || []);
  
  // WhatsApp settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(landingConfig.whatsappEnabled || false);
  const [whatsappNumber, setWhatsappNumber] = useState(landingConfig.whatsappNumber || '');
  const [whatsappMessage, setWhatsappMessage] = useState(landingConfig.whatsappMessage || '');
  
  // Controlled text fields for AI enhancement
  const [headline, setHeadline] = useState(landingConfig.headline || '');
  const [subheadline, setSubheadline] = useState(landingConfig.subheadline || '');
  const [urgencyText, setUrgencyText] = useState(landingConfig.urgencyText || '');
  const [guaranteeText, setGuaranteeText] = useState(landingConfig.guaranteeText || '');
  const [ctaText, setCtaText] = useState(landingConfig.ctaText || 'Buy Now');
  const [ctaSubtext, setCtaSubtext] = useState(landingConfig.ctaSubtext || '');
  const [storePublished, setStorePublished] = useState(isStorePublished);
  
  // Countdown Timer settings
  const [countdownEnabled, setCountdownEnabled] = useState(landingConfig.countdownEnabled || false);
  const [countdownText, setCountdownText] = useState(landingConfig.countdownText || '🔥 অফার শেষ হতে বাকি');
  
  // Stock Counter settings
  const [showStockCounter, setShowStockCounter] = useState(landingConfig.showStockCounter || false);
  
  // Social Proof Popup settings
  const [showSocialProof, setShowSocialProof] = useState(landingConfig.showSocialProof || false);
  const [socialProofInterval, setSocialProofInterval] = useState(landingConfig.socialProofInterval || 15);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    publish: true,
    templates: true,
    product: true,
    headlines: true,
    video: false,
    cta: false,
    testimonials: false,
    features: false,
    faq: false,
    whatsapp: false,
    countdown: false,
    stock: false,
    socialProof: false,
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

  // File input refs for testimonial photos
  const testimonialFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Image upload fetcher
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Handle testimonial image upload response
  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url && uploadingIndex !== null) {
      const updated = [...(testimonials || [])];
      updated[uploadingIndex] = { ...updated[uploadingIndex], imageUrl: imageFetcher.data.url };
      setTestimonials(updated);
      setUploadingIndex(null);
    }
  }, [imageFetcher.data]);

  const addTestimonial = () => {
    setTestimonials([...(testimonials || []), { name: '', text: '', imageUrl: '' }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials?.filter((_, i) => i !== index) || []);
  };

  const updateTestimonial = (index: number, field: 'name' | 'text', value: string) => {
    const updated = [...(testimonials || [])];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const handleTestimonialImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    
    // Compress image before upload (saves bandwidth & storage)
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        format,
      });
      fileToUpload = new File([compressedBlob], `testimonial.${format}`, { type: `image/${format}` });
      console.log(`Testimonial image compressed: ${file.size} -> ${compressedBlob.size} bytes`);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'testimonials');
    
    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeTestimonialImage = (index: number) => {
    // Delete from R2 bucket if image exists
    const imageUrl = testimonials?.[index]?.imageUrl;
    if (imageUrl) {
      const deleteFormData = new FormData();
      deleteFormData.append('imageUrl', imageUrl);
      fetch('/api/delete-image', {
        method: 'POST',
        body: deleteFormData,
      }).catch(err => console.warn('Failed to delete testimonial image from R2:', err));
    }
    
    const updated = [...(testimonials || [])];
    updated[index] = { ...updated[index], imageUrl: '' };
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

      {/* Section 0: Store Status (Publish/Unpublish) */}
      <div className={`rounded-xl border-2 overflow-hidden transition ${
        storePublished 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              storePublished ? 'bg-emerald-100' : 'bg-gray-200'
            }`}>
              {storePublished ? (
                <Globe className="w-5 h-5 text-emerald-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Store Status</h2>
              <p className="text-sm text-gray-500">
                {storePublished 
                  ? 'Your store is live and accepting orders' 
                  : 'Your store is hidden from customers'
                }
              </p>
            </div>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="togglePublish" />
            <input type="hidden" name="isPublished" value={storePublished ? 'false' : 'true'} />
            <button
              type="submit"
              onClick={() => setStorePublished(!storePublished)}
              className={`px-4 py-2 font-medium rounded-lg transition flex items-center gap-2 ${
                storePublished 
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {storePublished ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish Store
                </>
              )}
            </button>
          </Form>
        </div>
        {!storePublished && (
          <div className="px-4 pb-4">
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ Your store is currently unpublished. Customers cannot see your products or place orders.
            </div>
          </div>
        )}
      </div>

      <Form method="post" className="space-y-4">
        <input type="hidden" name="templateId" value={selectedTemplateId} />
        <input type="hidden" name="testimonials" value={JSON.stringify(testimonials)} />
        <input type="hidden" name="features" value={JSON.stringify(features)} />
        <input type="hidden" name="faq" value={JSON.stringify(faq)} />
        <input type="hidden" name="whatsappEnabled" value={whatsappEnabled ? 'true' : 'false'} />
        <input type="hidden" name="whatsappNumber" value={whatsappNumber} />
        <input type="hidden" name="whatsappMessage" value={whatsappMessage} />
        <input type="hidden" name="countdownEnabled" value={countdownEnabled ? 'true' : 'false'} />
        <input type="hidden" name="countdownText" value={countdownText} />
        <input type="hidden" name="showStockCounter" value={showStockCounter ? 'true' : 'false'} />
        <input type="hidden" name="showSocialProof" value={showSocialProof ? 'true' : 'false'} />
        <input type="hidden" name="socialProofInterval" value={socialProofInterval.toString()} />

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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Main Headline *</label>
                </div>
                <input
                  type="text"
                  name="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="আপনার জীবন বদলে দিন"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Subheadline</label>
                </div>
                <input
                  type="text"
                  name="subheadline"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="সেরা পণ্য, সেরা দাম"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Urgency Text (Top Banner)</label>
                </div>
                <input
                  type="text"
                  name="urgencyText"
                  value={urgencyText}
                  onChange={(e) => setUrgencyText(e.target.value)}
                  placeholder="🔥 সীমিত সময়ের অফার!"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Guarantee Text</label>
                </div>
                <input
                  type="text"
                  name="guaranteeText"
                  value={guaranteeText}
                  onChange={(e) => setGuaranteeText(e.target.value)}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Button Text</label>
                </div>
                <input
                  type="text"
                  name="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="এখনই অর্ডার করুন"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Button Subtext</label>
                </div>
                <input
                  type="text"
                  name="ctaSubtext"
                  value={ctaSubtext}
                  onChange={(e) => setCtaSubtext(e.target.value)}
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
                      {/* Photo Upload Section */}
                      <div className="flex-shrink-0">
                        {testimonial.imageUrl ? (
                          <div className="relative w-20 h-20">
                            <img
                              src={testimonial.imageUrl}
                              alt={`${testimonial.name}'s photo`}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeTestimonialImage(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => testimonialFileRefs.current[index]?.click()}
                            disabled={uploadingIndex === index}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition cursor-pointer"
                          >
                            {uploadingIndex === index ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-5 h-5 mb-1" />
                                <span className="text-xs">Photo</span>
                              </>
                            )}
                          </button>
                        )}
                        <input
                          ref={(el) => { testimonialFileRefs.current[index] = el; }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleTestimonialImageUpload(index, file);
                          }}
                          className="hidden"
                        />
                      </div>
                      {/* Text Fields */}
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          placeholder="Customer name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <textarea
                          value={testimonial.text || ''}
                          onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                          placeholder="Their review... (optional if photo added)"
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

        {/* Section 7: Features */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('features')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">7. Features</h2>
                <p className="text-sm text-gray-500">{features?.length || 0} features added</p>
              </div>
            </div>
            {expandedSections.features ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.features && (
            <div className="p-4 pt-0 space-y-4">
              {features && features.length > 0 ? (
                features.map((feature, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-start gap-4">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => {
                          const updated = [...(features || [])];
                          updated[index] = { ...updated[index], icon: e.target.value };
                          setFeatures(updated);
                        }}
                        placeholder="Icon (emoji)"
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const updated = [...(features || [])];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="Feature title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => {
                            const updated = [...(features || [])];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="Feature description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeatures(features?.filter((_, i) => i !== index) || [])}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No features yet</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setFeatures([...(features || []), { icon: '✨', title: '', description: '' }])}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          )}
        </div>

        {/* Section 8: FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('faq')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">8. FAQ</h2>
                <p className="text-sm text-gray-500">{faq?.length || 0} questions added</p>
              </div>
            </div>
            {expandedSections.faq ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.faq && (
            <div className="p-4 pt-0 space-y-4">
              {faq && faq.length > 0 ? (
                faq.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const updated = [...(faq || [])];
                            updated[index] = { ...updated[index], question: e.target.value };
                            setFaq(updated);
                          }}
                          placeholder="Question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <textarea
                          value={item.answer}
                          onChange={(e) => {
                            const updated = [...(faq || [])];
                            updated[index] = { ...updated[index], answer: e.target.value };
                            setFaq(updated);
                          }}
                          placeholder="Answer"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFaq(faq?.filter((_, i) => i !== index) || [])}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No FAQ items yet</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setFaq([...(faq || []), { question: '', answer: '' }])}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          )}
        </div>

        {/* Section 9: WhatsApp / Contact */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('whatsapp')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">9. WhatsApp / Contact</h2>
                <p className="text-sm text-gray-500">{whatsappEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            {expandedSections.whatsapp ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.whatsapp && (
            <div className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Enable WhatsApp Button</span>
                <button
                  type="button"
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {whatsappEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="8801XXXXXXXXX"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: Country code + number (no + sign)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pre-filled Message (Optional)</label>
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="আমি আপনার পণ্য সম্পর্কে জানতে চাই..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Section 10: Countdown Timer */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('countdown')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">10. Countdown Timer</h2>
                <p className="text-sm text-gray-500">{countdownEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            {expandedSections.countdown ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.countdown && (
            <div className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Enable Countdown Timer</span>
                <button
                  type="button"
                  onClick={() => setCountdownEnabled(!countdownEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    countdownEnabled ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    countdownEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {countdownEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Countdown Text</label>
                  <input
                    type="text"
                    value={countdownText}
                    onChange={(e) => setCountdownText(e.target.value)}
                    placeholder="🔥 অফার শেষ হতে বাকি"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 11: Stock Counter */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('stock')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">11. Stock Counter</h2>
                <p className="text-sm text-gray-500">{showStockCounter ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            {expandedSections.stock ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.stock && (
            <div className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Show "Only X left!" Counter</span>
                  <p className="text-xs text-gray-500">Based on product inventory</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStockCounter(!showStockCounter)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    showStockCounter ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showStockCounter ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 12: Social Proof Popup */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('socialProof')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">12. Social Proof Popup</h2>
                <p className="text-sm text-gray-500">{showSocialProof ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            {expandedSections.socialProof ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.socialProof && (
            <div className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">"Someone just ordered" Popups</span>
                  <p className="text-xs text-gray-500">Random names from Dhaka, Chittagong, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSocialProof(!showSocialProof)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    showSocialProof ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showSocialProof ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {showSocialProof && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popup Interval (seconds)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={socialProofInterval}
                    onChange={(e) => setSocialProofInterval(parseInt(e.target.value) || 15)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 15 seconds between popups</p>
                </div>
              )}
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
