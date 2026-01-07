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
  Layout, Settings, Palette, MessageCircle, ExternalLink, Star, Plus, Trash2, Image, HelpCircle, Timer, TrendingUp, Paintbrush, Smartphone, Monitor, Rocket
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
import { getTemplateComponent, type TemplateProps } from '~/templates/registry';

// Default features for new stores (English)
const DEFAULT_FEATURES_EN = [
  { icon: '✅', title: 'Premium Quality', description: 'Made with the finest materials' },
  { icon: '🚚', title: 'Fast Delivery', description: 'Delivered within 2-3 business days' },
  { icon: '💯', title: 'Satisfaction Guaranteed', description: 'Full refund if not satisfied' },
  { icon: '🔒', title: 'Secure Payment', description: 'Your payment is 100% secure' },
];

// Default features for new stores (Bengali)
const DEFAULT_FEATURES_BN = [
  { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের উপাদান দিয়ে তৈরি' },
  { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ কার্যদিবসের মধ্যে ডেলিভারি' },
  { icon: '💯', title: 'সন্তুষ্টির গ্যারান্টি', description: 'পছন্দ না হলে সম্পূর্ণ টাকা ফেরত' },
  { icon: '🔒', title: 'নিরাপদ পেমেন্ট', description: 'আপনার পেমেন্ট ১০০% নিরাপদ' },
];

// Default guarantee text (Bengali)
const DEFAULT_GUARANTEE_TEXT = '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।';


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
  
  // Get SAAS_DOMAIN for preview URL
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'digitalcare.site';

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
    saasDomain,
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

  // Safe JSON parse helper - prevents server crashes from malformed JSON
  function safeJSONParse<T>(str: string | null, fallback: T): T {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

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
    const sectionOrder = safeJSONParse(formData.get('sectionOrder') as string, DEFAULT_SECTION_ORDER);
    const hiddenSections = safeJSONParse(formData.get('hiddenSections') as string, []);

    
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
    const guaranteeText = formData.get('guaranteeText') as string || '';
    
    // Safe JSON parsing for arrays
    const sectionOrder = safeJSONParse(formData.get('sectionOrder') as string, DEFAULT_SECTION_ORDER);
    const hiddenSections = safeJSONParse(formData.get('hiddenSections') as string, []);
    const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
    const whatsappNumber = formData.get('whatsappNumber') as string || '';
    const whatsappMessage = formData.get('whatsappMessage') as string || '';
    const testimonials = safeJSONParse(formData.get('testimonials') as string, []);
    const faq = safeJSONParse(formData.get('faq') as string, []);
    const features = safeJSONParse(formData.get('features') as string, []);
    
    // Conversion features
    const countdownEnabled = formData.get('countdownEnabled') === 'true';
    const countdownEndTime = formData.get('countdownEndTime') as string || '';
    const showStockCounter = formData.get('showStockCounter') === 'true';
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 10;
    const showSocialProof = formData.get('showSocialProof') === 'true';
    const socialProofInterval = parseInt(formData.get('socialProofInterval') as string) || 15;

    // Color theme
    const primaryColor = formData.get('primaryColor') as string || '';
    const accentColor = formData.get('accentColor') as string || '';
    
    // Store Mode (landing or store)
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
      // Filter testimonials - keep if has image (image-only mode)
      testimonials: testimonials.filter((t: {name?: string; imageUrl?: string}) => t.imageUrl),
      faq: faq.filter((f: {question: string; answer: string}) => f.question && f.answer),
      // Features array
      features: features.filter((f: {icon: string; title: string}) => f.icon && f.title),
      // Conversion features
      countdownEnabled,
      countdownEndTime,
      showStockCounter,
      lowStockThreshold,
      showSocialProof,
      socialProofInterval,
      // Color theme
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

    return json({ success: true, message: 'Landing page saved!' });
  }

  return json({ error: 'Unknown action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LandingBuilderPage() {
  const { store, products: storeProducts, saasDomain } = useLoaderData<typeof loader>();
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
  
  // Guarantee and Features (use defaults for new stores, language-aware)
  const defaultFeatures = language === 'bn' ? DEFAULT_FEATURES_BN : DEFAULT_FEATURES_EN;
  const [guaranteeText, setGuaranteeText] = useState(store.landingConfig.guaranteeText || DEFAULT_GUARANTEE_TEXT);
  const [features, setFeatures] = useState<Array<{icon: string; title: string; description: string}>>(
    store.landingConfig.features?.length ? store.landingConfig.features : defaultFeatures
  );


  // Conversion features state (MVP)
  const [countdownEnabled, setCountdownEnabled] = useState(store.landingConfig.countdownEnabled || false);
  const [countdownEndTime, setCountdownEndTime] = useState(store.landingConfig.countdownEndTime || '');
  const [showStockCounter, setShowStockCounter] = useState(store.landingConfig.showStockCounter || false);
  const [lowStockThreshold, setLowStockThreshold] = useState(store.landingConfig.lowStockThreshold || 10);
  const [showSocialProof, setShowSocialProof] = useState(store.landingConfig.showSocialProof || false);
  const [socialProofInterval, setSocialProofInterval] = useState(store.landingConfig.socialProofInterval || 15);

  // Color theme state
  const [primaryColor, setPrimaryColor] = useState(store.landingConfig.primaryColor || '');
  const [accentColor, setAccentColor] = useState(store.landingConfig.accentColor || '');
  
  // Store Mode state (landing or store)
  const [storeMode, setStoreMode] = useState<'landing' | 'store'>(store.mode || 'landing');

  // Preview panel state
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');

  // Current tab
  const [activeTab, setActiveTab] = useState<'template' | 'content' | 'sections' | 'conversion' | 'testimonials' | 'faq' | 'whatsapp' | 'colors' | 'settings'>('template');

  // Show success message and reset dirty state
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      setHasChanges(false); // Reset dirty state on save
      setValidationErrors([]); // Clear any validation errors
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);


  // Track unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const initialLoadRef = useRef(true);
  
  // Mark as dirty when any field changes (skip initial load)
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

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate before save
  const validateBeforeSave = useCallback(() => {
    const errors: string[] = [];
    
    // Landing mode requires a featured product
    if (storeMode === 'landing' && !featuredProductId) {
      errors.push(language === 'bn' ? 'ল্যান্ডিং মোডে একটি প্রোডাক্ট সিলেক্ট করতে হবে' : 'Landing mode requires a featured product');
    }
    
    // Headline is required
    if (!headline?.trim()) {
      errors.push(language === 'bn' ? 'হেডলাইন দিতে হবে' : 'Headline is required');
    }
    
    // WhatsApp validation (if enabled)
    if (whatsappEnabled && whatsappNumber) {
      const digits = whatsappNumber.replace(/\D/g, '');
      const isValid = (digits.startsWith('01') && digits.length === 11) || 
                      (digits.startsWith('880') && digits.length === 13);
      if (!isValid) {
        errors.push(language === 'bn' ? 'সঠিক WhatsApp নম্বর দিন' : 'Invalid WhatsApp number');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [storeMode, featuredProductId, headline, whatsappEnabled, whatsappNumber, language]);

  // Auto-save functionality
  const autoSaveFetcher = useFetcher();
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save effect - runs every 30 seconds if there are unsaved changes
  useEffect(() => {
    // Only auto-save if there are unsaved changes
    if (!hasChanges) return;
    
    const autoSaveInterval = setInterval(() => {
      // Validate before auto-save
      if (!validateBeforeSave()) {
        return; // Skip auto-save if validation fails
      }

      // Build form data for auto-save
      const formData = new FormData();
      formData.append('intent', 'save-all');
      formData.append('templateId', templateId);
      formData.append('featuredProductId', featuredProductId);
      formData.append('headline', headline);
      formData.append('subheadline', subheadline);
      formData.append('ctaText', ctaText);
      formData.append('ctaSubtext', ctaSubtext);
      formData.append('urgencyText', urgencyText);
      formData.append('videoUrl', videoUrl);
      formData.append('sectionOrder', JSON.stringify(sectionOrder));
      formData.append('hiddenSections', JSON.stringify(hiddenSections));
      formData.append('whatsappEnabled', whatsappEnabled.toString());
      formData.append('whatsappNumber', whatsappNumber);
      formData.append('whatsappMessage', whatsappMessage);
      formData.append('testimonials', JSON.stringify(testimonials));
      formData.append('faq', JSON.stringify(faq));
      formData.append('guaranteeText', guaranteeText);
      formData.append('features', JSON.stringify(features));
      formData.append('countdownEnabled', countdownEnabled.toString());
      formData.append('countdownEndTime', countdownEndTime);
      formData.append('showStockCounter', showStockCounter.toString());
      formData.append('lowStockThreshold', lowStockThreshold.toString());
      formData.append('primaryColor', primaryColor);
      formData.append('accentColor', accentColor);
      formData.append('storeMode', storeMode);

      setAutoSaveStatus('saving');
      autoSaveFetcher.submit(formData, { method: 'post' });
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, validateBeforeSave, templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, testimonials, faq, guaranteeText, features, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, primaryColor, accentColor, storeMode, autoSaveFetcher]);

  // Update auto-save status when fetcher completes
  useEffect(() => {
    if (autoSaveFetcher.state === 'idle' && autoSaveFetcher.data) {
      const data = autoSaveFetcher.data as { success?: boolean };
      if (data && typeof data === 'object' && 'success' in data && data.success) {
        setAutoSaveStatus('saved');
        setLastAutoSave(new Date());
        setHasChanges(false);
        // Reset status after 3 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } else {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }
  }, [autoSaveFetcher.state, autoSaveFetcher.data]);



  // Handlers

  const handleVisibilityChange = (sectionId: string, visible: boolean) => {
    if (visible) {
      setHiddenSections(hiddenSections.filter(id => id !== sectionId));
    } else {
      setHiddenSections([...hiddenSections, sectionId]);
    }
  };


  // Preview URL - use saasDomain from loader
  const previewUrl = `https://${store.subdomain}.${saasDomain}`;

  // Get selected template info
  const selectedTemplate = LANDING_TEMPLATES.find(t => t.id === templateId);

  // Build live preview config from current editor state
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


  // Mock product for preview (use selected product or demo)
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

  // Get template component for live preview
  const TemplateComponent = getTemplateComponent(templateId);

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
              {/* Device Toggle for Preview */}
              <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-md transition ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-md transition ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Toggle Button - Navigate to Live Editor */}
              <Link
                to="/app/landing-live-editor"
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition font-medium"
              >
                <Eye className="w-4 h-4" />
                {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
              </Link>

              {/* Open in New Tab */}
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <ExternalLink className="w-4 h-4" />
                {language === 'bn' ? 'নতুন ট্যাব' : 'Open'}
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
                <input type="hidden" name="guaranteeText" value={guaranteeText} />
                <input type="hidden" name="features" value={JSON.stringify(features)} />

                {/* Conversion features */}
                <input type="hidden" name="countdownEnabled" value={countdownEnabled.toString()} />
                <input type="hidden" name="countdownEndTime" value={countdownEndTime} />
                <input type="hidden" name="showStockCounter" value={showStockCounter.toString()} />
                <input type="hidden" name="lowStockThreshold" value={lowStockThreshold.toString()} />
                <input type="hidden" name="showSocialProof" value={showSocialProof.toString()} />
                <input type="hidden" name="socialProofInterval" value={socialProofInterval.toString()} />
                {/* Color theme */}
                <input type="hidden" name="primaryColor" value={primaryColor} />
                <input type="hidden" name="accentColor" value={accentColor} />
                {/* Store Mode */}
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
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {language === 'bn' ? 'সেভ করুন' : 'Save'}
                  {hasChanges && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
                </button>
                
                {/* Auto-save status indicator */}
                {autoSaveStatus !== 'idle' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-600' :
                    autoSaveStatus === 'saved' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {autoSaveStatus === 'saving' && (language === 'bn' ? 'অটো-সেভ হচ্ছে...' : 'Auto-saving...')}
                    {autoSaveStatus === 'saved' && (language === 'bn' ? 'অটো-সেভড ✓' : 'Auto-saved ✓')}
                    {autoSaveStatus === 'error' && (language === 'bn' ? 'অটো-সেভ ব্যর্থ' : 'Auto-save failed')}
                  </span>
                )}
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

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium mb-2">{language === 'bn' ? 'সেভ করতে সমস্যা:' : 'Please fix the following:'}</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px - 56px)' }}>
        {/* Left Panel - Settings */}
        <div className={`${showPreview ? 'w-full lg:w-1/2 xl:w-2/5' : 'w-full'} overflow-y-auto bg-gray-50 p-4 lg:p-6 pb-24 lg:pb-6`}>
          {/* Tabs - Compact on mobile */}
          <div className="flex gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2">
          {[
            { id: 'template', icon: Palette, label: 'টেমপ্লেট', labelEn: 'Template' },
            { id: 'content', icon: Settings, label: 'কন্টেন্ট', labelEn: 'Content' },
            { id: 'sections', icon: Layout, label: 'সেকশন', labelEn: 'Sections' },
            { id: 'conversion', icon: TrendingUp, label: 'কনভার্শন', labelEn: 'Conversion' },
            { id: 'testimonials', icon: Star, label: 'টেস্টি', labelEn: 'Reviews' },
            { id: 'faq', icon: HelpCircle, label: 'FAQ', labelEn: 'FAQ' },
            { id: 'whatsapp', icon: MessageCircle, label: 'WA', labelEn: 'WA' },
            { id: 'colors', icon: Paintbrush, label: 'রং', labelEn: 'Color' },
            { id: 'settings', icon: Settings, label: 'সেটিং', labelEn: 'Mode' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-xs sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {language === 'bn' ? tab.label : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Main Panel - Full Width */}
          <div className="space-y-6">
            {activeTab === 'template' && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'টেমপ্লেট সিলেক্ট করুন' : 'Select Template'}
                  </h2>
                  <LandingTemplateGallery
                    selectedTemplateId={templateId}
                    onSelect={setTemplateId}
                    onPreview={(previewTemplateId) => {
                      // Open the template preview with demo content
                      const previewUrl = `https://${store.subdomain}.${saasDomain}?preview_template=${previewTemplateId}`;
                      window.open(previewUrl, '_blank');
                    }}
                  />
                </div>

                {/* Selected Template & Tips - Below Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selected Template Info */}
                  {selectedTemplate && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {language === 'bn' ? 'সিলেক্টেড টেমপ্লেট' : 'Selected Template'}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: selectedTemplate.colors.bg }}
                        >
                          <span className="text-2xl">{selectedTemplate.emoji}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {language === 'bn' ? selectedTemplate.name : selectedTemplate.nameEn}
                          </p>
                          <p className="text-sm text-gray-500">
                            {language === 'bn' ? selectedTemplate.description : selectedTemplate.descriptionEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Tips */}
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <h3 className="font-semibold text-amber-800 mb-2">
                      💡 {language === 'bn' ? 'টিপস' : 'Tips'}
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• {language === 'bn' ? 'শর্ট হেডলাইন বেশি কনভার্ট করে' : 'Short headlines convert better'}</li>
                      <li>• {language === 'bn' ? 'ভিডিও যোগ করলে ৮০% বেশি সেল হয়' : 'Adding video increases sales by 80%'}</li>
                      <li>• {language === 'bn' ? 'WhatsApp বাটন ২০%+ লিড আনে' : 'WhatsApp button brings 20%+ leads'}</li>
                    </ul>
                  </div>
                </div>
              </>
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

                {/* Guarantee Text */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'গ্যারান্টি' : 'Guarantee'}
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'bn' ? 'গ্যারান্টি টেক্সট' : 'Guarantee Text'}
                    </label>
                    <textarea
                      value={guaranteeText}
                      onChange={(e) => setGuaranteeText(e.target.value)}
                      placeholder={language === 'bn' ? '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।' : '100% satisfaction guarantee. Full refund within 7 days if not satisfied.'}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'bn' ? 'এই টেক্সট "গ্যারান্টি" সেকশনে দেখাবে' : 'This text will appear in the "Guarantee" section'}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'bn' ? 'প্রোডাক্ট ফিচার্স' : 'Product Features'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setFeatures([...features, { icon: '✨', title: '', description: '' }])}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'bn' ? 'যোগ করুন' : 'Add Feature'}
                    </button>
                  </div>
                  
                  {features.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>{language === 'bn' ? 'কোনো ফিচার নেই' : 'No features added'}</p>
                      <p className="text-xs mt-1">{language === 'bn' ? 'প্রোডাক্টের বৈশিষ্ট্য যোগ করুন' : 'Add product features to display'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                          <button
                            type="button"
                            onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-[60px_1fr] gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'আইকন' : 'Icon'}
                              </label>
                              <input
                                type="text"
                                value={feature.icon}
                                onChange={(e) => {
                                  const newFeatures = [...features];
                                  newFeatures[index].icon = e.target.value;
                                  setFeatures(newFeatures);
                                }}
                                placeholder="✨"
                                className="w-full px-2 py-2 text-center text-xl border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                {language === 'bn' ? 'শিরোনাম' : 'Title'}
                              </label>
                              <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => {
                                  const newFeatures = [...features];
                                  newFeatures[index].title = e.target.value;
                                  setFeatures(newFeatures);
                                }}
                                placeholder={language === 'bn' ? 'প্রিমিয়াম কোয়ালিটি' : 'Premium Quality'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              {language === 'bn' ? 'বিবরণ' : 'Description'}
                            </label>
                            <input
                              type="text"
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...features];
                                newFeatures[index].description = e.target.value;
                                setFeatures(newFeatures);
                              }}
                              placeholder={language === 'bn' ? 'সেরা মানের উপাদান দিয়ে তৈরি' : 'Made with best quality materials'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

            {/* Conversion Features Tab */}
            {activeTab === 'conversion' && (
              <div className="space-y-6">
                {/* Countdown Timer */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Timer className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {language === 'bn' ? 'কাউন্টডাউন টাইমার' : 'Countdown Timer'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {language === 'bn' ? 'আর্জেন্সি তৈরি করুন' : 'Create urgency for sales'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={countdownEnabled} 
                        onChange={(e) => setCountdownEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  {countdownEnabled && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'bn' ? 'অফার শেষ হওয়ার তারিখ ও সময়' : 'Offer End Date & Time'}
                      </label>
                      
                      {/* Quick Preset Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setHours(date.getHours() + 24);
                            setCountdownEndTime(date.toISOString().slice(0, 16));
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        >
                          {language === 'bn' ? '২৪ ঘণ্টা' : '24 Hours'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setHours(date.getHours() + 48);
                            setCountdownEndTime(date.toISOString().slice(0, 16));
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        >
                          {language === 'bn' ? '৪৮ ঘণ্টা' : '48 Hours'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            setCountdownEndTime(date.toISOString().slice(0, 16));
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        >
                          {language === 'bn' ? '৭ দিন' : '7 Days'}
                        </button>
                      </div>
                      
                      <input
                        type="datetime-local"
                        value={countdownEndTime}
                        onChange={(e) => setCountdownEndTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      
                      {countdownEndTime && new Date(countdownEndTime) < new Date() && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <span>⚠️</span>
                          {language === 'bn' ? 'সতর্কতা: তারিখটি অতীতে আছে' : 'Warning: Date is in the past'}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {language === 'bn' ? 'এই সময়ের পর টাইমার "শেষ" দেখাবে' : 'Timer will show "Expired" after this time'}
                      </p>
                    </div>
                  )}

                </div>

                {/* Stock Counter */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {language === 'bn' ? 'স্টক কাউন্টার' : 'Stock Counter'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {language === 'bn' ? '"মাত্র X টি বাকি!" দেখান' : 'Show "Only X left!" warning'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showStockCounter} 
                        onChange={(e) => setShowStockCounter(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  {showStockCounter && (
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bn' ? 'লো স্টক থ্রেশহোল্ড' : 'Low Stock Threshold'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {language === 'bn' ? 'এই সংখ্যার নিচে স্টক থাকলে ওয়ার্নিং দেখাবে' : 'Show warning when stock is below this number'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">💡 {language === 'bn' ? 'কনভার্শন টিপস' : 'Conversion Tips'}</h4>
                  <ul className="text-sm text-orange-800 space-y-2">
                    <li>• {language === 'bn' ? 'কাউন্টডাউন টাইমার ৩০%+ কনভার্শন বাড়ায়' : 'Countdown timers increase conversions by 30%+'}</li>
                    <li>• {language === 'bn' ? 'স্টক কাউন্টার FOMO তৈরি করে' : 'Stock counters create FOMO (Fear Of Missing Out)'}</li>
                    <li>• {language === 'bn' ? 'সোশাল প্রুফ ট্রাস্ট বাড়ায়' : 'Social proof builds trust with new visitors'}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'bn' ? 'গ্রাহক রিভিউ স্ক্রিনশট' : 'Customer Review Screenshots'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {language === 'bn' ? 'সর্বোচ্চ ২-৩টি স্ক্রিনশট যোগ করুন' : 'Add 2-3 screenshots maximum'}
                    </p>
                  </div>
                  {testimonials.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setTestimonials([...testimonials, { name: 'Customer Review', imageUrl: '' }])}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'bn' ? 'যোগ করুন' : 'Add'}
                    </button>
                  )}
                </div>

                {/* Photo Size Recommendation */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    📐 {language === 'bn' ? 'ফটো সাইজ গাইড' : 'Photo Size Guide'}
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {language === 'bn' ? 'রেকমেন্ডেড সাইজ: 400x600 পিক্সেল (Portrait)' : 'Recommended: 400x600 pixels (Portrait)'}</li>
                    <li>• {language === 'bn' ? 'ফাইল ফরম্যাট: JPG, PNG, বা WebP' : 'Format: JPG, PNG, or WebP'}</li>
                    <li>• {language === 'bn' ? 'ফাইল সাইজ: সর্বোচ্চ 500KB' : 'Max file size: 500KB'}</li>
                  </ul>
                </div>

                {testimonials.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      {language === 'bn' ? 'কোনো রিভিউ স্ক্রিনশট নেই' : 'No review screenshots yet'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {language === 'bn' 
                        ? 'Facebook, Messenger বা WhatsApp থেকে গ্রাহকের রিভিউ স্ক্রিনশট নিন' 
                        : 'Take screenshots from Facebook, Messenger or WhatsApp reviews'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTestimonials([{ name: 'Customer Review', imageUrl: '' }])}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'bn' ? 'প্রথম স্ক্রিনশট যোগ করুন' : 'Add First Screenshot'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="relative group">
                        {/* Screenshot Card */}
                        <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition">
                          {testimonial.imageUrl ? (
                            <img 
                              src={testimonial.imageUrl} 
                              alt={`Review ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                              <Image className="w-12 h-12 mb-3" />
                              <p className="text-sm text-center">
                                {language === 'bn' ? 'স্ক্রিনশট URL দিন' : 'Add screenshot URL'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* URL Input */}
                        <div className="mt-2">
                          <input
                            type="url"
                            value={testimonial.imageUrl || ''}
                            onChange={(e) => {
                              const updated = [...testimonials];
                              updated[index].imageUrl = e.target.value;
                              setTestimonials(updated);
                            }}
                            placeholder={language === 'bn' ? 'স্ক্রিনশট URL...' : 'Screenshot URL...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = testimonials.filter((_, i) => i !== index);
                            setTestimonials(updated);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Important Warning */}
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex gap-2">
                    <span className="text-red-600 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        {language === 'bn' ? 'গুরুত্বপূর্ণ নোটিশ' : 'Important Notice'}
                      </p>
                      <p className="text-sm text-red-700">
                        {language === 'bn' 
                          ? 'শুধুমাত্র আসল গ্রাহকের রিভিউ স্ক্রিনশট আপলোড করুন। ভুয়া রিভিউ ব্র্যান্ডের বিশ্বাসযোগ্যতা নষ্ট করে।' 
                          : 'Only upload real customer review screenshots. Fake reviews destroy brand credibility.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    💡 <strong>{language === 'bn' ? 'প্রো টিপ:' : 'Pro Tip:'}</strong> {language === 'bn' 
                      ? 'Facebook Page রিভিউ, Messenger চ্যাট বা WhatsApp থেকে স্ক্রিনশট নিন। ২-৩টি ভালো রিভিউই যথেষ্ট!' 
                      : 'Take screenshots from Facebook Page reviews, Messenger chats or WhatsApp. 2-3 good reviews are enough!'}
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

            {activeTab === 'colors' && (
              <div className="space-y-6">
                {/* Primary Color */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'bn' ? 'প্রাইমারি কালার' : 'Primary Color'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'bn' ? 'বাটন এবং মেইন হাইলাইটের জন্য' : 'For buttons and main highlights'}
                  </p>
                  
                  {/* Preset Colors */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[
                      { name: 'Orange', value: '#f97316' },
                      { name: 'Red', value: '#ef4444' },
                      { name: 'Emerald', value: '#10b981' },
                      { name: 'Blue', value: '#3b82f6' },
                      { name: 'Purple', value: '#8b5cf6' },
                      { name: 'Pink', value: '#ec4899' },
                      { name: 'Amber', value: '#f59e0b' },
                      { name: 'Teal', value: '#14b8a6' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setPrimaryColor(color.value)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          primaryColor === color.value 
                            ? 'ring-2 ring-offset-2 ring-gray-400 border-gray-400' 
                            : 'border-gray-200 hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">
                      {language === 'bn' ? 'কাস্টম:' : 'Custom:'}
                    </label>
                    <input
                      type="color"
                      value={primaryColor || '#f97316'}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#f97316"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    {primaryColor && (
                      <button
                        type="button"
                        onClick={() => setPrimaryColor('')}
                        className="text-sm text-gray-500 hover:text-red-500"
                      >
                        {language === 'bn' ? 'রিসেট' : 'Reset'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'bn' ? 'অ্যাকসেন্ট কালার' : 'Accent Color'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'bn' ? 'সেকেন্ডারি হাইলাইট ও ব্যাজের জন্য' : 'For secondary highlights and badges'}
                  </p>
                  
                  {/* Preset Colors */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[
                      { name: 'Gold', value: '#d4af37' },
                      { name: 'Yellow', value: '#facc15' },
                      { name: 'Lime', value: '#84cc16' },
                      { name: 'Cyan', value: '#06b6d4' },
                      { name: 'Indigo', value: '#6366f1' },
                      { name: 'Rose', value: '#f43f5e' },
                      { name: 'Black', value: '#18181b' },
                      { name: 'White', value: '#ffffff' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAccentColor(color.value)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          accentColor === color.value 
                            ? 'ring-2 ring-offset-2 ring-gray-400 border-gray-400' 
                            : 'border-gray-200 hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">
                      {language === 'bn' ? 'কাস্টম:' : 'Custom:'}
                    </label>
                    <input
                      type="color"
                      value={accentColor || '#d4af37'}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#d4af37"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    {accentColor && (
                      <button
                        type="button"
                        onClick={() => setAccentColor('')}
                        className="text-sm text-gray-500 hover:text-red-500"
                      >
                        {language === 'bn' ? 'রিসেট' : 'Reset'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                  </h3>
                  <div className="space-y-4">
                    {/* Button Preview */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        {language === 'bn' ? 'বাটন প্রিভিউ' : 'Button Preview'}
                      </p>
                      <button
                        type="button"
                        className="px-6 py-3 text-white font-bold rounded-xl shadow-lg transition"
                        style={{ backgroundColor: primaryColor || '#f97316' }}
                      >
                        🛒 {language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                      </button>
                    </div>
                    
                    {/* Badge Preview */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        {language === 'bn' ? 'ব্যাজ প্রিভিউ' : 'Badge Preview'}
                      </p>
                      <span
                        className="inline-block px-4 py-2 text-white font-bold rounded-full text-sm"
                        style={{ backgroundColor: accentColor || '#d4af37' }}
                      >
                        ⚡ {language === 'bn' ? '৫০% ছাড়!' : '50% OFF!'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    💡 {language === 'bn' 
                      ? 'নোট: সব টেমপ্লেট কাস্টম কালার সাপোর্ট করে না। Modern Dark, Minimal Light, ও Video Focus টেমপ্লেটে এই কালার প্রযোজ্য হবে।' 
                      : 'Note: Not all templates support custom colors. Colors will apply to Modern Dark, Minimal Light, and Video Focus templates.'}
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Store Mode Toggle */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'bn' ? 'স্টোর মোড' : 'Store Mode'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'bn' 
                      ? 'আপনার স্টোর কীভাবে দেখাবে সেট করুন'
                      : 'Choose how your store appears to customers'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Landing Mode */}
                    <button
                      type="button"
                      onClick={() => setStoreMode('landing')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        storeMode === 'landing'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className={`font-semibold ${storeMode === 'landing' ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Page'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {language === 'bn' 
                          ? 'একটি প্রোডাক্টে ফোকাস - অর্ডার ফর্ম সহ'
                          : 'Single product focus with order form'}
                      </p>
                      {storeMode === 'landing' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">
                          ✓ {language === 'bn' ? 'সিলেক্টেড' : 'Selected'}
                        </span>
                      )}
                    </button>

                    {/* Full Store Mode */}
                    <button
                      type="button"
                      onClick={() => setStoreMode('store')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        storeMode === 'store'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏪</span>
                        <span className={`font-semibold ${storeMode === 'store' ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {language === 'bn' ? 'ফুল স্টোর' : 'Full Store'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {language === 'bn' 
                          ? 'প্রোডাক্ট ক্যাটালগ সহ পূর্ণাঙ্গ স্টোর'
                          : 'Complete store with product catalog'}
                      </p>
                      {storeMode === 'store' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">
                          ✓ {language === 'bn' ? 'সিলেক্টেড' : 'Selected'}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Premium Note */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚡ {language === 'bn' 
                        ? 'ফুল স্টোর মোড Starter/Premium প্ল্যানে পাওয়া যায়'
                        : 'Full Store mode available on Starter/Premium plans'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          </div>
        </div>

        {/* Right Panel - Live Preview (Desktop only when showPreview is true) */}
        {showPreview && (
          <div className="hidden lg:flex lg:flex-1 bg-gray-900 flex-col">
            {/* Preview Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">
                {language === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
              </span>
              <span className="text-gray-500 text-xs">
                {previewDevice === 'mobile' ? '📱 375px' : '🖥️ Full'}
              </span>
            </div>
            
            {/* Preview Container */}
            <div className="flex-1 flex items-start justify-center overflow-auto p-4">
              <div 
                className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                  previewDevice === 'mobile' 
                    ? 'w-[375px]' 
                    : 'w-full max-w-4xl'
                }`}
                style={{
                  transform: previewDevice === 'mobile' ? 'scale(0.85)' : 'scale(0.75)',
                  transformOrigin: 'top center',
                  maxHeight: previewDevice === 'mobile' ? '800px' : '1200px',
                }}
              >
                {/* Render Template with Preview Props */}
                <div className="overflow-hidden">
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
          </div>
        )}
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 z-50 shadow-lg">
        {/* Preview Button - Navigate to Live Editor */}
        <Link
          to="/app/landing-live-editor"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg"
        >
          <Eye className="w-4 h-4" />
          {language === 'bn' ? 'লাইভ এডিটর' : 'Live Editor'}
        </Link>
        
        {/* Save Button */}
        <Form 
          method="post" 
          className="flex-1"
          onSubmit={(e) => {
            if (!validateBeforeSave()) {
              e.preventDefault();
            }
          }}
        >
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
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg disabled:opacity-50 ${
              hasChanges ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {language === 'bn' ? 'সেভ করুন' : 'Save'}
            {hasChanges && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
          </button>

        </Form>
      </div>
    </div>
  );
}
