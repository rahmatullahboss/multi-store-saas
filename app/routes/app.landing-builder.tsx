/**
 * Landing Page Builder Route
 * 
 * Route: /app/landing-builder
 * 
 * Main dashboard for creating and editing landing pages with:
 * - Template gallery selection
 * - Section management
 * - WhatsApp integration
 * - Live preview
 * - AI-powered generation
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { 
  Loader2, CheckCircle, ArrowLeft, Eye, Sparkles, Save, 
  Layout, Settings, Palette, MessageCircle, ExternalLink, Star, Plus, Trash2, Image, HelpCircle, Timer, TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { 
  LandingTemplateGallery, 
  SectionManager, 
  WhatsAppConfig,
  DEFAULT_SECTION_ORDER,
  LANDING_TEMPLATES 
} from '~/components/landing-builder';

export const meta: MetaFunction = () => {
  return [{ title: 'Landing Page Builder - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER - Fetch store data and products
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  // Get published products for featured product selector
  const storeProducts = await db
    .select({ 
      id: products.id, 
      title: products.title, 
      imageUrl: products.imageUrl, 
      price: products.price 
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .limit(50);

  const landingConfig = parseLandingConfig(store.landingConfig as string | null) || defaultLandingConfig;

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      mode: store.mode || 'store',
      featuredProductId: store.featuredProductId,
      landingConfig,
    },
    products: storeProducts,
  });
}

// ============================================================================
// ACTION - Save landing page configuration
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  const db = drizzle(context.cloudflare.env.DB);

  // Handle different actions
  if (intent === 'save-template') {
    const templateId = formData.get('templateId') as string;
    
    // Get current config
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    const currentConfig = parseLandingConfig(storeResult[0]?.landingConfig as string | null) || defaultLandingConfig;
    
    const newConfig: LandingConfig = {
      ...currentConfig,
      templateId,
    };

    await db
      .update(stores)
      .set({
        mode: 'landing',
        landingConfig: JSON.stringify(newConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Template saved!' });
  }

  if (intent === 'save-sections') {
    const sectionOrder = JSON.parse(formData.get('sectionOrder') as string || '[]');
    const hiddenSections = JSON.parse(formData.get('hiddenSections') as string || '[]');
    
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    const currentConfig = parseLandingConfig(storeResult[0]?.landingConfig as string | null) || defaultLandingConfig;
    
    const newConfig: LandingConfig = {
      ...currentConfig,
      sectionOrder,
      hiddenSections,
    };

    await db
      .update(stores)
      .set({
        landingConfig: JSON.stringify(newConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Sections saved!' });
  }

  if (intent === 'save-whatsapp') {
    const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
    const whatsappNumber = formData.get('whatsappNumber') as string || '';
    const whatsappMessage = formData.get('whatsappMessage') as string || '';
    
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    const currentConfig = parseLandingConfig(storeResult[0]?.landingConfig as string | null) || defaultLandingConfig;
    
    const newConfig: LandingConfig = {
      ...currentConfig,
      whatsappEnabled,
      whatsappNumber,
      whatsappMessage,
    };

    await db
      .update(stores)
      .set({
        landingConfig: JSON.stringify(newConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'WhatsApp settings saved!' });
  }

  if (intent === 'save-all') {
    const templateId = formData.get('templateId') as string;
    const featuredProductId = formData.get('featuredProductId') as string;
    const headline = formData.get('headline') as string;
    const subheadline = formData.get('subheadline') as string;
    const ctaText = formData.get('ctaText') as string;
    const ctaSubtext = formData.get('ctaSubtext') as string;
    const urgencyText = formData.get('urgencyText') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const sectionOrder = JSON.parse(formData.get('sectionOrder') as string || '[]');
    const hiddenSections = JSON.parse(formData.get('hiddenSections') as string || '[]');
    const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
    const whatsappNumber = formData.get('whatsappNumber') as string || '';
    const whatsappMessage = formData.get('whatsappMessage') as string || '';
    const testimonials = JSON.parse(formData.get('testimonials') as string || '[]');
    const faq = JSON.parse(formData.get('faq') as string || '[]');

    const newConfig: LandingConfig = {
      templateId,
      headline: headline || 'Transform Your Life Today',
      subheadline: subheadline || '',
      ctaText: ctaText || 'Buy Now',
      ctaSubtext: ctaSubtext || '',
      urgencyText: urgencyText || '',
      videoUrl: videoUrl || '',
      sectionOrder: sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER,
      hiddenSections,
      whatsappEnabled,
      whatsappNumber,
      whatsappMessage,
      testimonials: testimonials.filter((t: {name: string; imageUrl?: string}) => t.name && t.imageUrl), // Only save testimonials with photo
      faq: faq.filter((f: {question: string; answer: string}) => f.question && f.answer), // Only save complete FAQs
    };

    await db
      .update(stores)
      .set({
        mode: 'landing',
        featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
        landingConfig: JSON.stringify(newConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Landing page saved!' });
  }

  return json({ error: 'Unknown action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LandingBuilderPage() {
  const { store, products: storeProducts } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t, lang: language } = useTranslation();
  
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);

  // State for landing config
  const [templateId, setTemplateId] = useState(store.landingConfig.templateId || 'modern-dark');
  const [featuredProductId, setFeaturedProductId] = useState(store.featuredProductId?.toString() || '');
  const [sectionOrder, setSectionOrder] = useState(store.landingConfig.sectionOrder || DEFAULT_SECTION_ORDER);
  const [hiddenSections, setHiddenSections] = useState<string[]>(store.landingConfig.hiddenSections || []);
  const [whatsappEnabled, setWhatsappEnabled] = useState(store.landingConfig.whatsappEnabled || false);
  const [whatsappNumber, setWhatsappNumber] = useState(store.landingConfig.whatsappNumber || '');
  const [whatsappMessage, setWhatsappMessage] = useState(store.landingConfig.whatsappMessage || '');
  
  // Content fields
  const [headline, setHeadline] = useState(store.landingConfig.headline);
  const [subheadline, setSubheadline] = useState(store.landingConfig.subheadline || '');
  const [ctaText, setCtaText] = useState(store.landingConfig.ctaText);
  const [ctaSubtext, setCtaSubtext] = useState(store.landingConfig.ctaSubtext || '');
  const [urgencyText, setUrgencyText] = useState(store.landingConfig.urgencyText || '');
  const [videoUrl, setVideoUrl] = useState(store.landingConfig.videoUrl || '');
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Array<{name: string; text?: string; imageUrl?: string}>>(store.landingConfig.testimonials || []);
  const [faq, setFaq] = useState<Array<{question: string; answer: string}>>(store.landingConfig.faq || []);

  // Conversion features state (MVP)
  const [countdownEnabled, setCountdownEnabled] = useState(store.landingConfig.countdownEnabled || false);
  const [countdownEndTime, setCountdownEndTime] = useState(store.landingConfig.countdownEndTime || '');
  const [showStockCounter, setShowStockCounter] = useState(store.landingConfig.showStockCounter || false);
  const [lowStockThreshold, setLowStockThreshold] = useState(store.landingConfig.lowStockThreshold || 10);
  const [showSocialProof, setShowSocialProof] = useState(store.landingConfig.showSocialProof || false);
  const [socialProofInterval, setSocialProofInterval] = useState(store.landingConfig.socialProofInterval || 15);

  // Current tab
  const [activeTab, setActiveTab] = useState<'template' | 'content' | 'sections' | 'conversion' | 'testimonials' | 'faq' | 'whatsapp'>('template');

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // Handlers
  const handleVisibilityChange = (sectionId: string, visible: boolean) => {
    if (visible) {
      setHiddenSections(hiddenSections.filter(id => id !== sectionId));
    } else {
      setHiddenSections([...hiddenSections, sectionId]);
    }
  };

  // Preview URL
  const previewUrl = `https://${store.subdomain}.${typeof window !== 'undefined' ? window.location.host.replace('app.', '') : 'example.com'}`;

  // Get selected template info
  const selectedTemplate = LANDING_TEMPLATES.find(t => t.id === templateId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/app"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {language === 'bn' ? 'ল্যান্ডিং পেজ বিল্ডার' : 'Landing Page Builder'}
                </h1>
                <p className="text-sm text-gray-500">
                  {store.name} • {selectedTemplate?.emoji} {language === 'bn' ? selectedTemplate?.name : selectedTemplate?.nameEn}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Visual Editor Button */}
              <Link
                to="/app/landing-editor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'bn' ? 'ভিজ্যুয়াল এডিটর' : 'Visual Editor'}
              </Link>

              {/* Preview Button */}
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Eye className="w-4 h-4" />
                {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {/* Save Button */}
              <Form method="post">
                <input type="hidden" name="intent" value="save-all" />
                <input type="hidden" name="templateId" value={templateId} />
                <input type="hidden" name="featuredProductId" value={featuredProductId} />
                <input type="hidden" name="headline" value={headline} />
                <input type="hidden" name="subheadline" value={subheadline} />
                <input type="hidden" name="ctaText" value={ctaText} />
                <input type="hidden" name="ctaSubtext" value={ctaSubtext} />
                <input type="hidden" name="urgencyText" value={urgencyText} />
                <input type="hidden" name="videoUrl" value={videoUrl} />
                <input type="hidden" name="sectionOrder" value={JSON.stringify(sectionOrder)} />
                <input type="hidden" name="hiddenSections" value={JSON.stringify(hiddenSections)} />
                <input type="hidden" name="whatsappEnabled" value={whatsappEnabled.toString()} />
                <input type="hidden" name="whatsappNumber" value={whatsappNumber} />
                <input type="hidden" name="whatsappMessage" value={whatsappMessage} />
                <input type="hidden" name="testimonials" value={JSON.stringify(testimonials)} />
                <input type="hidden" name="faq" value={JSON.stringify(faq)} />
                {/* Conversion features */}
                <input type="hidden" name="countdownEnabled" value={countdownEnabled.toString()} />
                <input type="hidden" name="countdownEndTime" value={countdownEndTime} />
                <input type="hidden" name="showStockCounter" value={showStockCounter.toString()} />
                <input type="hidden" name="lowStockThreshold" value={lowStockThreshold.toString()} />
                <input type="hidden" name="showSocialProof" value={showSocialProof.toString()} />
                <input type="hidden" name="socialProofInterval" value={socialProofInterval.toString()} />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {language === 'bn' ? 'সেভ করুন' : 'Save'}
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {language === 'bn' ? 'সেভ হয়েছে!' : 'Saved successfully!'}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'template', icon: Palette, label: 'টেমপ্লেট', labelEn: 'Template' },
            { id: 'content', icon: Settings, label: 'কন্টেন্ট', labelEn: 'Content' },
            { id: 'sections', icon: Layout, label: 'সেকশন', labelEn: 'Sections' },
            { id: 'conversion', icon: TrendingUp, label: 'কনভার্শন', labelEn: 'Conversion' },
            { id: 'testimonials', icon: Star, label: 'টেস্টিমোনিয়াল', labelEn: 'Testimonials' },
            { id: 'faq', icon: HelpCircle, label: 'FAQ', labelEn: 'FAQ' },
            { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', labelEn: 'WhatsApp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {language === 'bn' ? tab.label : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'template' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'bn' ? 'টেমপ্লেট সিলেক্ট করুন' : 'Select Template'}
                </h2>
                <LandingTemplateGallery
                  selectedTemplateId={templateId}
                  onSelect={setTemplateId}
                />
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Featured Product */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'ফিচার্ড প্রোডাক্ট' : 'Featured Product'}
                  </h2>
                  {storeProducts.length > 0 ? (
                    <select
                      value={featuredProductId}
                      onChange={(e) => setFeaturedProductId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">{language === 'bn' ? 'প্রোডাক্ট সিলেক্ট করুন...' : 'Select a product...'}</option>
                      {storeProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title} - ৳{product.price}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>{language === 'bn' ? 'কোনো প্রোডাক্ট নেই। আগে প্রোডাক্ট যোগ করুন।' : 'No products. Add products first.'}</p>
                      <Link
                        to="/app/products/new"
                        className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700"
                      >
                        + {language === 'bn' ? 'প্রোডাক্ট যোগ করুন' : 'Add Product'}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Headlines */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'হেডলাইন ও কপি' : 'Headlines & Copy'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'মেইন হেডলাইন *' : 'Main Headline *'}
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder={language === 'bn' ? 'আপনার জীবন বদলে দিন আজই' : 'Transform Your Life Today'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'সাব-হেডলাইন' : 'Subheadline'}
                      </label>
                      <input
                        type="text"
                        value={subheadline}
                        onChange={(e) => setSubheadline(e.target.value)}
                        placeholder={language === 'bn' ? 'যা আপনার দরকার সব এখানে' : "The only solution you'll ever need"}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'আর্জেন্সি টেক্সট' : 'Urgency Text'}
                      </label>
                      <input
                        type="text"
                        value={urgencyText}
                        onChange={(e) => setUrgencyText(e.target.value)}
                        placeholder={language === 'bn' ? '🔥 সীমিত সময়ের অফার - ৫০% ছাড়!' : '🔥 Limited time offer - 50% OFF!'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'ভিডিও URL' : 'Video URL'}
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'কল টু অ্যাকশন' : 'Call to Action'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'বাটন টেক্সট' : 'Button Text'}
                      </label>
                      <input
                        type="text"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder={language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'bn' ? 'বাটন সাব-টেক্সট' : 'Button Subtext'}
                      </label>
                      <input
                        type="text"
                        value={ctaSubtext}
                        onChange={(e) => setCtaSubtext(e.target.value)}
                        placeholder={language === 'bn' ? '৩০ দিনের মানি-ব্যাক গ্যারান্টি' : '30-day money back guarantee'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    {/* Preview */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">{language === 'bn' ? 'প্রিভিউ:' : 'Preview:'}</p>
                      <button
                        type="button"
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg"
                      >
                        🛒 {ctaText || (language === 'bn' ? 'এখনই কিনুন' : 'Buy Now')}
                      </button>
                      {ctaSubtext && (
                        <p className="text-sm text-gray-500 mt-2">✓ {ctaSubtext}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <SectionManager
                sectionOrder={sectionOrder}
                hiddenSections={hiddenSections}
                onOrderChange={setSectionOrder}
                onVisibilityChange={handleVisibilityChange}
              />
            )}

            {activeTab === 'testimonials' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'bn' ? 'কাস্টমার টেস্টিমোনিয়াল' : 'Customer Testimonials'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {language === 'bn' ? 'ফটো দিন - সেরা কনভার্শন!' : 'Add photos - best for conversions!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestimonials([...testimonials, { name: '', imageUrl: '' }])}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'bn' ? 'যোগ করুন' : 'Add'}
                  </button>
                </div>

                {testimonials.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      {language === 'bn' ? 'কোনো টেস্টিমোনিয়াল নেই। উপরের বাটনে ক্লিক করুন।' : 'No testimonials. Click the button above.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-4">
                          {/* Photo Preview */}
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {testimonial.imageUrl ? (
                              <img 
                                src={testimonial.imageUrl} 
                                alt="Customer" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Image className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          
                          {/* Fields */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                              </label>
                              <input
                                type="text"
                                value={testimonial.name}
                                onChange={(e) => {
                                  const updated = [...testimonials];
                                  updated[index].name = e.target.value;
                                  setTestimonials(updated);
                                }}
                                placeholder="রহমান সাহেব"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'ফটো URL' : 'Photo URL'}
                              </label>
                              <input
                                type="url"
                                value={testimonial.imageUrl || ''}
                                onChange={(e) => {
                                  const updated = [...testimonials];
                                  updated[index].imageUrl = e.target.value;
                                  setTestimonials(updated);
                                }}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              />
                              <p className="text-xs text-gray-400 mt-1">
                                {language === 'bn' ? 'Cloudinary বা অন্য হোস্ট থেকে URL দিন' : 'Use Cloudinary or another image host'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = testimonials.filter((_, i) => i !== index);
                              setTestimonials(updated);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tip */}
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    💡 {language === 'bn' 
                      ? 'টিপ: গ্রাহকের স্ক্রিনশট বা প্রোডাক্ট সাথে ছবি দিলে ৩০%+ বেশি কনভার্ট হয়!' 
                      : 'Tip: Screenshots or photos with product convert 30%+ better!'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'bn' ? 'প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {language === 'bn' ? 'কাস্টম প্রশ্ন ও উত্তর যোগ করুন' : 'Add custom questions and answers'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaq([...faq, { question: '', answer: '' }])}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'bn' ? 'যোগ করুন' : 'Add'}
                  </button>
                </div>

                {faq.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      {language === 'bn' ? 'কোনো কাস্টম FAQ নেই। ডিফল্ট FAQ দেখাবে।' : 'No custom FAQ. Default FAQ will show.'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {language === 'bn' ? 'উপরের বাটনে ক্লিক করে যোগ করুন।' : 'Click button above to add.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faq.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'প্রশ্ন' : 'Question'}
                              </label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => {
                                  const updated = [...faq];
                                  updated[index].question = e.target.value;
                                  setFaq(updated);
                                }}
                                placeholder={language === 'bn' ? 'প্রোডাক্ট কি অরিজিনাল?' : 'Is the product original?'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'উত্তর' : 'Answer'}
                              </label>
                              <textarea
                                value={item.answer}
                                onChange={(e) => {
                                  const updated = [...faq];
                                  updated[index].answer = e.target.value;
                                  setFaq(updated);
                                }}
                                rows={2}
                                placeholder={language === 'bn' ? 'হ্যাঁ, ১০০% অরিজিনাল প্রোডাক্ট।' : 'Yes, 100% original product.'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updated = faq.filter((_, i) => i !== index);
                              setFaq(updated);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 {language === 'bn' 
                      ? 'টিপ: কাস্টম FAQ না থাকলে ডিফল্ট ডেলিভারি, পেমেন্ট সংক্রান্ত প্রশ্ন দেখাবে।' 
                      : 'Tip: Without custom FAQ, default delivery/payment questions will show.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppConfig
                enabled={whatsappEnabled}
                phoneNumber={whatsappNumber}
                messageTemplate={whatsappMessage}
                onEnabledChange={setWhatsappEnabled}
                onPhoneChange={setWhatsappNumber}
                onMessageChange={setWhatsappMessage}
              />
            )}
          </div>

          {/* Sidebar - Quick Stats & Preview */}
          <div className="space-y-6">
            {/* AI Generate Button */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-semibold">
                  {language === 'bn' ? 'AI দিয়ে জেনারেট করুন' : 'Generate with AI'}
                </h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                {language === 'bn' 
                  ? 'আপনার প্রোডাক্ট বর্ণনা করুন, AI পুরো ল্যান্ডিং পেজ তৈরি করে দেবে।' 
                  : 'Describe your product,  AI will generate the entire landing page.'}
              </p>
              <Link
                to="/app/settings/landing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition"
              >
                <Sparkles className="w-4 h-4" />
                {language === 'bn' ? 'AI দিয়ে শুরু করুন' : 'Start with AI'}
              </Link>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === 'bn' ? 'সিলেক্টেড টেমপ্লেট' : 'Selected Template'}
                </h3>
                <div
                  className="h-24 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: selectedTemplate.colors.bg }}
                >
                  <span className="text-4xl">{selectedTemplate.emoji}</span>
                </div>
                <p className="font-medium text-gray-900">
                  {language === 'bn' ? selectedTemplate.name : selectedTemplate.nameEn}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'bn' ? selectedTemplate.description : selectedTemplate.descriptionEn}
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="font-semibold text-amber-800 mb-3">
                💡 {language === 'bn' ? 'টিপস' : 'Tips'}
              </h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li>• {language === 'bn' ? 'শর্ট হেডলাইন বেশি কনভার্ট করে' : 'Short headlines convert better'}</li>
                <li>• {language === 'bn' ? 'ভিডিও যোগ করলে ৮০% বেশি সেল হয়' : 'Adding video increases sales by 80%'}</li>
                <li>• {language === 'bn' ? 'WhatsApp বাটন ২০%+ লিড আনে' : 'WhatsApp button brings 20%+ leads'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
