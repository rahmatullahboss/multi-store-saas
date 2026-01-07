/**
 * Landing Page Live Editor Route (Elementor-Style)
 * 
 * Route: /landing-live-editor (standalone - no app sidebar)
 * 
 * Split-pane layout with:
 * - Left sidebar: Compact editing controls in accordion style
 * - Right panel: Full-size live preview
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { 
  Loader2, CheckCircle, ArrowLeft, Save, 
  Layout, Settings, Palette, MessageCircle, ExternalLink, Star, Plus, Trash2, HelpCircle, 
  TrendingUp, Paintbrush, Smartphone, Tablet, Monitor, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { 
  LandingTemplateGallery, 
  SectionManager, 
  WhatsAppConfig,
  DEFAULT_SECTION_ORDER,
  LANDING_TEMPLATES 
} from '~/components/landing-builder';
import { getTemplateComponent } from '~/templates/registry';

// Default features
const DEFAULT_FEATURES_EN = [
  { icon: '✅', title: 'Premium Quality', description: 'Made with the finest materials' },
  { icon: '🚚', title: 'Fast Delivery', description: 'Delivered within 2-3 business days' },
  { icon: '💯', title: 'Satisfaction Guaranteed', description: 'Full refund if not satisfied' },
  { icon: '🔒', title: 'Secure Payment', description: 'Your payment is 100% secure' },
];

const DEFAULT_FEATURES_BN = [
  { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের উপাদান দিয়ে তৈরি' },
  { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ কার্যদিবসের মধ্যে ডেলিভারি' },
  { icon: '💯', title: 'সন্তুষ্টির গ্যারান্টি', description: 'পছন্দ না হলে সম্পূর্ণ টাকা ফেরত' },
  { icon: '🔒', title: 'নিরাপদ পেমেন্ট', description: 'আপনার পেমেন্ট ১০০% নিরাপদ' },
];

const DEFAULT_GUARANTEE_TEXT = '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।';

export const meta: MetaFunction = () => {
  return [{ title: 'Live Editor - Landing Page Builder' }];
};

// ============================================================================
// LOADER
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
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'digitalcare.site';

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      mode: store.mode || 'landing',
      featuredProductId: store.featuredProductId,
      landingConfig,
    },
    products: storeProducts,
    saasDomain,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const db = drizzle(context.cloudflare.env.DB);

  function safeJSONParse<T>(str: string | null, fallback: T): T {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  const templateId = formData.get('templateId') as string;
  const featuredProductId = formData.get('featuredProductId') as string;
  const headline = formData.get('headline') as string;
  const subheadline = formData.get('subheadline') as string;
  const ctaText = formData.get('ctaText') as string;
  const ctaSubtext = formData.get('ctaSubtext') as string;
  const urgencyText = formData.get('urgencyText') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const guaranteeText = formData.get('guaranteeText') as string || '';
  
  const sectionOrder = safeJSONParse(formData.get('sectionOrder') as string, DEFAULT_SECTION_ORDER);
  const hiddenSections = safeJSONParse(formData.get('hiddenSections') as string, []);
  const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
  const whatsappNumber = formData.get('whatsappNumber') as string || '';
  const whatsappMessage = formData.get('whatsappMessage') as string || '';
  const testimonials = safeJSONParse(formData.get('testimonials') as string, []);
  const faq = safeJSONParse(formData.get('faq') as string, []);
  const features = safeJSONParse(formData.get('features') as string, []);
  
  const countdownEnabled = formData.get('countdownEnabled') === 'true';
  const countdownEndTime = formData.get('countdownEndTime') as string || '';
  const showStockCounter = formData.get('showStockCounter') === 'true';
  const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 10;
  const showSocialProof = formData.get('showSocialProof') === 'true';
  const socialProofInterval = parseInt(formData.get('socialProofInterval') as string) || 15;

  const primaryColor = formData.get('primaryColor') as string || '';
  const accentColor = formData.get('accentColor') as string || '';
  const storeMode = formData.get('storeMode') as 'landing' | 'store' || 'landing';

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
    guaranteeText: guaranteeText || '',
    testimonials: testimonials.filter((t: {name?: string; imageUrl?: string}) => t.imageUrl),
    faq: faq.filter((f: {question: string; answer: string}) => f.question && f.answer),
    features: features.filter((f: {icon: string; title: string}) => f.icon && f.title),
    countdownEnabled,
    countdownEndTime,
    showStockCounter,
    lowStockThreshold,
    showSocialProof,
    socialProofInterval,
    primaryColor: primaryColor || undefined,
    accentColor: accentColor || undefined,
  };

  await db
    .update(stores)
    .set({
      mode: storeMode,
      featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
      landingConfig: JSON.stringify(newConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true, message: 'Saved!' });
}

// ============================================================================
// Accordion Section Component
// ============================================================================
function AccordionSection({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LiveEditorPage() {
  const { store, products: storeProducts, saasDomain } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { lang: language } = useTranslation();
  
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
  
  const [headline, setHeadline] = useState(store.landingConfig.headline);
  const [subheadline, setSubheadline] = useState(store.landingConfig.subheadline || '');
  const [ctaText, setCtaText] = useState(store.landingConfig.ctaText);
  const [ctaSubtext, setCtaSubtext] = useState(store.landingConfig.ctaSubtext || '');
  const [urgencyText, setUrgencyText] = useState(store.landingConfig.urgencyText || '');
  const [videoUrl, setVideoUrl] = useState(store.landingConfig.videoUrl || '');
  
  const [testimonials, setTestimonials] = useState<Array<{name: string; text?: string; imageUrl?: string}>>(store.landingConfig.testimonials || []);
  const [faq, setFaq] = useState<Array<{question: string; answer: string}>>(store.landingConfig.faq || []);
  
  const defaultFeatures = language === 'bn' ? DEFAULT_FEATURES_BN : DEFAULT_FEATURES_EN;
  const [guaranteeText, setGuaranteeText] = useState(store.landingConfig.guaranteeText || DEFAULT_GUARANTEE_TEXT);
  const [features, setFeatures] = useState<Array<{icon: string; title: string; description: string}>>(
    store.landingConfig.features?.length ? store.landingConfig.features : defaultFeatures
  );

  const [countdownEnabled, setCountdownEnabled] = useState(store.landingConfig.countdownEnabled || false);
  const [countdownEndTime, setCountdownEndTime] = useState(store.landingConfig.countdownEndTime || '');
  const [showStockCounter, setShowStockCounter] = useState(store.landingConfig.showStockCounter || false);
  const [lowStockThreshold, setLowStockThreshold] = useState(store.landingConfig.lowStockThreshold || 10);
  const [showSocialProof, setShowSocialProof] = useState(store.landingConfig.showSocialProof || false);
  const [socialProofInterval, setSocialProofInterval] = useState(store.landingConfig.socialProofInterval || 15);

  const [primaryColor, setPrimaryColor] = useState(store.landingConfig.primaryColor || '');
  const [accentColor, setAccentColor] = useState(store.landingConfig.accentColor || '');
  const [storeMode, setStoreMode] = useState<'landing' | 'store'>(store.mode || 'landing');

  // Preview device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Accordion state
  const [openSection, setOpenSection] = useState<string>('template');

  // Track unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const initialLoadRef = useRef(true);
  
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setHasChanges(true);
  }, [templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText, features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, primaryColor, accentColor, storeMode]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      setHasChanges(false);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateBeforeSave = useCallback(() => {
    const errors: string[] = [];
    if (storeMode === 'landing' && !featuredProductId) {
      errors.push(language === 'bn' ? 'ল্যান্ডিং মোডে একটি প্রোডাক্ট সিলেক্ট করতে হবে' : 'Landing mode requires a featured product');
    }
    if (!headline?.trim()) {
      errors.push(language === 'bn' ? 'হেডলাইন দিতে হবে' : 'Headline is required');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  }, [storeMode, featuredProductId, headline, language]);

  // Preview URL
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  // Get selected template info
  const selectedTemplate = LANDING_TEMPLATES.find(t => t.id === templateId);

  // Build live preview config
  const previewConfig: LandingConfig = {
    templateId,
    headline: headline || 'Your Amazing Headline',
    subheadline: subheadline || '',
    ctaText: ctaText || 'Order Now',
    ctaSubtext: ctaSubtext || '',
    urgencyText: urgencyText || '',
    videoUrl: videoUrl || '',
    guaranteeText: guaranteeText || '',
    features,
    sectionOrder: sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER,
    hiddenSections,
    whatsappEnabled,
    whatsappNumber,
    whatsappMessage,
    testimonials,
    faq,
    countdownEnabled,
    countdownEndTime,
    showStockCounter,
    lowStockThreshold,
    showSocialProof,
    socialProofInterval,
    primaryColor: primaryColor || undefined,
    accentColor: accentColor || undefined,
  };

  // Mock product for preview
  const selectedProduct = storeProducts.find(p => p.id === parseInt(featuredProductId));
  const previewProduct = selectedProduct || {
    id: 0,
    storeId: store.id,
    title: 'Demo Product',
    description: 'This is a demo product for preview purposes.',
    price: 1999,
    compareAtPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  };

  const TemplateComponent = getTemplateComponent(templateId);

  // Device width mapping
  const deviceWidths = {
    mobile: 375,
    tablet: 768,
    desktop: 1200,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-20">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app/landing-builder"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'লাইভ এডিটর' : 'Live Editor'}
              </h1>
              <p className="text-xs text-gray-500">{store.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-md transition ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded-md transition ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-md transition ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Desktop (1200px)"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Open in New Tab */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title={language === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in new tab'}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            {/* Save Button */}
            <Form 
              method="post"
              onSubmit={(e) => {
                if (!validateBeforeSave()) {
                  e.preventDefault();
                }
              }}
            >
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
              <input type="hidden" name="guaranteeText" value={guaranteeText} />
              <input type="hidden" name="features" value={JSON.stringify(features)} />
              <input type="hidden" name="countdownEnabled" value={countdownEnabled.toString()} />
              <input type="hidden" name="countdownEndTime" value={countdownEndTime} />
              <input type="hidden" name="showStockCounter" value={showStockCounter.toString()} />
              <input type="hidden" name="lowStockThreshold" value={lowStockThreshold.toString()} />
              <input type="hidden" name="showSocialProof" value={showSocialProof.toString()} />
              <input type="hidden" name="socialProofInterval" value={socialProofInterval.toString()} />
              <input type="hidden" name="primaryColor" value={primaryColor} />
              <input type="hidden" name="accentColor" value={accentColor} />
              <input type="hidden" name="storeMode" value={storeMode} />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition ${
                  hasChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-gray-200 text-gray-600'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : showSuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {showSuccess ? (language === 'bn' ? 'সেভড!' : 'Saved!') : (language === 'bn' ? 'সেভ করুন' : 'Save')}
                {hasChanges && !showSuccess && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-sm text-red-700">
            {validationErrors.join(' • ')}
          </p>
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Editing Controls (Hidden on mobile) */}
        <aside className="hidden md:block w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {/* Template Section */}
          <AccordionSection
            title={language === 'bn' ? 'টেমপ্লেট' : 'Template'}
            icon={Palette}
            isOpen={openSection === 'template'}
            onToggle={() => setOpenSection(openSection === 'template' ? '' : 'template')}
          >
            <div className="space-y-2">
              {LANDING_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
                    templateId === template.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{template.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {language === 'bn' ? template.name : template.nameEn}
                    </p>
                  </div>
                  {templateId === template.id && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* Content Section */}
          <AccordionSection
            title={language === 'bn' ? 'কন্টেন্ট' : 'Content'}
            icon={Settings}
            isOpen={openSection === 'content'}
            onToggle={() => setOpenSection(openSection === 'content' ? '' : 'content')}
          >
            <div className="space-y-4">
              {/* Featured Product */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'ফিচার্ড প্রোডাক্ট' : 'Featured Product'}
                </label>
                <select
                  value={featuredProductId}
                  onChange={(e) => setFeaturedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{language === 'bn' ? 'প্রোডাক্ট সিলেক্ট করুন' : 'Select a product'}</option>
                  {storeProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} - ৳{product.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'হেডলাইন' : 'Headline'}
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={language === 'bn' ? 'আপনার হেডলাইন লিখুন' : 'Enter your headline'}
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'সাবহেডলাইন' : 'Subheadline'}
                </label>
                <textarea
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={language === 'bn' ? 'সাবহেডলাইন লিখুন' : 'Enter subheadline'}
                />
              </div>

              {/* CTA Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'CTA বাটন টেক্সট' : 'CTA Button Text'}
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                />
              </div>

              {/* Urgency Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'আর্জেন্সি টেক্সট' : 'Urgency Text'}
                </label>
                <input
                  type="text"
                  value={urgencyText}
                  onChange={(e) => setUrgencyText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={language === 'bn' ? 'সীমিত সময়ের অফার!' : 'Limited time offer!'}
                />
              </div>
            </div>
          </AccordionSection>

          {/* Sections Section */}
          <AccordionSection
            title={language === 'bn' ? 'সেকশন' : 'Sections'}
            icon={Layout}
            isOpen={openSection === 'sections'}
            onToggle={() => setOpenSection(openSection === 'sections' ? '' : 'sections')}
          >
            <SectionManager
              sectionOrder={sectionOrder}
              hiddenSections={hiddenSections}
              onOrderChange={setSectionOrder}
              onVisibilityChange={(sectionId, visible) => {
                if (visible) {
                  setHiddenSections(hiddenSections.filter(id => id !== sectionId));
                } else {
                  setHiddenSections([...hiddenSections, sectionId]);
                }
              }}
              onEditSection={(sectionId) => {
                // Map section IDs to their accordion section names
                const accordionMap: Record<string, string> = {
                  'features': 'features',
                  'video': 'content', // Video URL is in content section
                  'testimonials': 'testimonials',
                  'faq': 'faq',
                };
                const accordionName = accordionMap[sectionId];
                if (accordionName) {
                  setOpenSection(accordionName);
                }
              }}
            />

          </AccordionSection>

          {/* Conversion Section */}
          <AccordionSection
            title={language === 'bn' ? 'কনভার্শন' : 'Conversion'}
            icon={TrendingUp}
            isOpen={openSection === 'conversion'}
            onToggle={() => setOpenSection(openSection === 'conversion' ? '' : 'conversion')}
          >
            <div className="space-y-4">
              {/* Countdown */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={countdownEnabled}
                  onChange={(e) => setCountdownEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' ? '⏱️ কাউন্টডাউন টাইমার' : '⏱️ Countdown Timer'}
                </span>
              </label>

              {countdownEnabled && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {language === 'bn' ? 'শেষ সময়' : 'End Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownEndTime}
                    onChange={(e) => setCountdownEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              {/* Stock Counter */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStockCounter}
                  onChange={(e) => setShowStockCounter(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' ? '📦 স্টক কাউন্টার' : '📦 Stock Counter'}
                </span>
              </label>

              {showStockCounter && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {language === 'bn' ? 'লো স্টক থ্রেশহোল্ড' : 'Low Stock Threshold'}
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </AccordionSection>

          {/* Features Section */}
          <AccordionSection
            title={language === 'bn' ? 'ফিচার্স' : 'Features'}
            icon={Star}
            isOpen={openSection === 'features'}
            onToggle={() => setOpenSection(openSection === 'features' ? '' : 'features')}
          >
            <div className="space-y-3">
              {/* Guarantee Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'গ্যারান্টি টেক্সট' : 'Guarantee Text'}
                </label>
                <textarea
                  value={guaranteeText}
                  onChange={(e) => setGuaranteeText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder={language === 'bn' ? '১০০% গ্যারান্টি...' : '100% Guarantee...'}
                />
              </div>
              
              {/* Feature Items */}
              <p className="text-xs font-medium text-gray-700">
                {language === 'bn' ? 'ফিচার আইটেম' : 'Feature Items'}
              </p>
              {features.map((feature, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feature.icon}
                      onChange={(e) => {
                        const newFeatures = [...features];
                        newFeatures[index].icon = e.target.value;
                        setFeatures(newFeatures);
                      }}
                      placeholder="✅"
                      className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                    />
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...features];
                        newFeatures[index].title = e.target.value;
                        setFeatures(newFeatures);
                      }}
                      placeholder={language === 'bn' ? 'টাইটেল' : 'Title'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].description = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    placeholder={language === 'bn' ? 'বর্ণনা' : 'Description'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFeatures([...features, { icon: '✅', title: '', description: '' }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ফিচার যোগ করুন' : 'Add Feature'}
              </button>
            </div>
          </AccordionSection>

          {/* Colors Section */}
          <AccordionSection
            title={language === 'bn' ? 'রং' : 'Colors'}
            icon={Paintbrush}
            isOpen={openSection === 'colors'}
            onToggle={() => setOpenSection(openSection === 'colors' ? '' : 'colors')}
          >
            <div className="space-y-4">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'প্রাইমারি কালার' : 'Primary Color'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor || '#f97316'}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#f97316"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'অ্যাকসেন্ট কালার' : 'Accent Color'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor || '#d4af37'}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#d4af37"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* WhatsApp Section */}
          <AccordionSection
            title="WhatsApp"
            icon={MessageCircle}
            isOpen={openSection === 'whatsapp'}
            onToggle={() => setOpenSection(openSection === 'whatsapp' ? '' : 'whatsapp')}
          >
            <WhatsAppConfig
              enabled={whatsappEnabled}
              phoneNumber={whatsappNumber}
              messageTemplate={whatsappMessage}
              onEnabledChange={setWhatsappEnabled}
              onPhoneChange={setWhatsappNumber}
              onMessageChange={setWhatsappMessage}
            />
          </AccordionSection>

          {/* FAQ Section */}
          <AccordionSection
            title="FAQ"
            icon={HelpCircle}
            isOpen={openSection === 'faq'}
            onToggle={() => setOpenSection(openSection === 'faq' ? '' : 'faq')}
          >
            <div className="space-y-3">
              {faq.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const newFaq = [...faq];
                      newFaq[index].question = e.target.value;
                      setFaq(newFaq);
                    }}
                    placeholder={language === 'bn' ? 'প্রশ্ন' : 'Question'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const newFaq = [...faq];
                      newFaq[index].answer = e.target.value;
                      setFaq(newFaq);
                    }}
                    placeholder={language === 'bn' ? 'উত্তর' : 'Answer'}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFaq(faq.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaq([...faq, { question: '', answer: '' }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'FAQ যোগ করুন' : 'Add FAQ'}
              </button>
            </div>
          </AccordionSection>

          {/* Testimonials Section */}
          <AccordionSection
            title={language === 'bn' ? 'রিভিউ' : 'Reviews'}
            icon={Star}
            isOpen={openSection === 'testimonials'}
            onToggle={() => setOpenSection(openSection === 'testimonials' ? '' : 'testimonials')}
          >
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                {language === 'bn' 
                  ? 'স্ক্রিনশট আপলোড করুন (প্রস্তাবিত সাইজ: 400x300px)'
                  : 'Upload screenshots (Recommended: 400x300px)'}
              </p>
              {testimonials.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={item.imageUrl || ''}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials];
                      newTestimonials[index].imageUrl = e.target.value;
                      setTestimonials(newTestimonials);
                    }}
                    placeholder="Image URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt="Preview" 
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTestimonials([...testimonials, { name: '', imageUrl: '' }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'রিভিউ যোগ করুন' : 'Add Review'}
              </button>
            </div>
          </AccordionSection>

          {/* Mode Section */}
          <AccordionSection
            title={language === 'bn' ? 'মোড' : 'Mode'}
            icon={Settings}
            isOpen={openSection === 'mode'}
            onToggle={() => setOpenSection(openSection === 'mode' ? '' : 'mode')}
          >
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStoreMode('landing')}
                className={`w-full p-3 rounded-lg border-2 text-left transition ${
                  storeMode === 'landing'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium text-sm">
                    {language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Page'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'bn' ? 'একটি প্রোডাক্টে ফোকাস' : 'Single product focus'}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setStoreMode('store')}
                className={`w-full p-3 rounded-lg border-2 text-left transition ${
                  storeMode === 'store'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  <span className="font-medium text-sm">
                    {language === 'bn' ? 'ফুল স্টোর' : 'Full Store'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'bn' ? 'প্রোডাক্ট ক্যাটালগ সহ' : 'With product catalog'}
                </p>
              </button>
            </div>
          </AccordionSection>
        </aside>

        {/* Right Panel - Live Preview */}
        <main className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-gray-300 text-sm font-medium">
              {language === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
            </span>
            <span className="text-gray-500 text-xs">
              {previewDevice === 'mobile' && '📱 375px'}
              {previewDevice === 'tablet' && '📱 768px'}
              {previewDevice === 'desktop' && '🖥️ 1200px'}
            </span>
          </div>
          
          {/* Preview Container */}
          <div className="flex-1 flex items-start justify-center overflow-auto p-2 md:p-4">
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 w-full relative"
              style={{
                maxWidth: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '1200px',
                contain: 'layout paint',
              }}
            >
              <div className="overflow-hidden relative" style={{ transform: 'translateZ(0)' }}>
                <TemplateComponent 
                  storeName={store.name}
                  storeId={store.id}
                  product={previewProduct as any}
                  config={previewConfig}
                  currency="৳"
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
