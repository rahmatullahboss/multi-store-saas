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
import { Form, useLoaderData, useActionData, useNavigation, Link, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig, type TypographySettings } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { 
  Loader2, CheckCircle, ArrowLeft, Save, 
  Layout, Settings, Palette, MessageCircle, ExternalLink, Star, Plus, Trash2, HelpCircle, 
  TrendingUp, Paintbrush, Smartphone, Tablet, Monitor, ChevronDown, ChevronRight, Sparkles,
  Upload, X, Image as ImageIcon, Phone, Undo2, Redo2, Type, Menu, PanelLeft, AlertCircle, Code
} from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { deleteOrphanedImage } from '~/hooks/useUnsavedChanges';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useEditorHistory, useEditorKeyboardShortcuts } from '~/hooks/useEditorHistory';
import { 
  LandingTemplateGallery, 
  SectionManager, 
  WhatsAppConfig,
  DEFAULT_SECTION_ORDER,
  LANDING_TEMPLATES 
} from '~/components/landing-builder';
import AIGeneratorModal from '~/components/landing-builder/AIGeneratorModal';
import { getTemplateComponent } from '~/templates/registry';
import { designCustomSection, callAIWithSystemPrompt } from '~/services/ai.server';

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
  const storeId = await getStoreId(request, context.cloudflare.env);
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
    .where(eq(products.storeId, storeId))
    .limit(50);

  // Load draft config if exists, otherwise fall back to published config
  const draftConfig = parseLandingConfig(store.landingConfigDraft as string | null);
  const publishedConfig = parseLandingConfig(store.landingConfig as string | null);
  const landingConfig = draftConfig || publishedConfig || defaultLandingConfig;
  
  // Check if there are unpublished changes
  const hasUnpublishedChanges = !!draftConfig && JSON.stringify(draftConfig) !== JSON.stringify(publishedConfig);
  
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      mode: store.mode || 'landing',
      featuredProductId: store.featuredProductId,
      landingConfig,
      hasUnpublishedChanges,
    },
    products: storeProducts,
    saasDomain,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const db = drizzle(context.cloudflare.env.DB);
  
  // Check intent: 'save_draft' (auto-save) or 'publish' (go live)
  const intent = formData.get('intent') as string || 'save_draft';

  // ==========================================================================
  // INTENT: AI GENERATION
  // ==========================================================================
  if (intent === 'GENERATE_CUSTOM_SECTION') {
    const prompt = formData.get('prompt') as string;
    const sectionIndex = parseInt(formData.get('sectionIndex') as string);
    const currentHtml = formData.get('currentHtml') as string || '';
    
    if (!prompt) return json({ error: 'Prompt is required' }, { status: 400 });

    try {
      const apiKey = context.cloudflare.env.OPENROUTER_API_KEY;
      if (!apiKey) return json({ error: 'AI API Key not configured' }, { status: 500 });

      // Fetch product info if featuredProductId is available
      const featuredProductId = formData.get('featuredProductId') as string;
      let productInfo = null;
      if (featuredProductId) {
        const productResult = await db
          .select()
          .from(products)
          .where(eq(products.id, parseInt(featuredProductId)))
          .limit(1);
        
        if (productResult[0]) {
          productInfo = {
            title: productResult[0].title,
            description: productResult[0].description || undefined,
            price: productResult[0].price
          };
        }
      }

      const result = await designCustomSection(apiKey, prompt, currentHtml, productInfo);
      return json({ success: true, data: result, sectionIndex });
    } catch (error: any) {
      console.error('[AI] Custom Section Generation Error:', error);
      return json({ error: error.message || 'AI generation failed' }, { status: 500 });
    }
  }

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
  const callEnabled = formData.get('callEnabled') === 'true';
  const callNumber = formData.get('callNumber') as string || '';
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
  // Extended colors (Phase 1)
  const backgroundColor = formData.get('backgroundColor') as string || '';
  const textColor = formData.get('textColor') as string || '';
  const borderColor = formData.get('borderColor') as string || '';
  // Typography (Phase 1)
  const typographyJson = formData.get('typography') as string || '{}';
  let typography: TypographySettings = {};
  try {
    typography = JSON.parse(typographyJson);
  } catch { /* ignore */ }
  
  const storeMode = formData.get('storeMode') as 'landing' | 'store' || 'landing';

  // New sections
  const galleryImages = JSON.parse(formData.get('galleryImages') as string || '[]');
  const benefits = JSON.parse(formData.get('benefits') as string || '[]');
  const comparison = JSON.parse(formData.get('comparison') as string || '{}');
  const socialProofData = JSON.parse(formData.get('socialProof') as string || '{"count":0,"text":""}');
  
  // Order form layout
  const orderFormVariant = formData.get('orderFormVariant') as 'full-width' | 'compact' || 'full-width';
  const customCSS = formData.get('customCSS') as string || '';
  const fontFamily = formData.get('fontFamily') as string || 'inter';
  const landingLanguage = formData.get('landingLanguage') as 'bn' | 'en' || 'bn';
  
  // New section data
  const trustBadges = JSON.parse(formData.get('trustBadges') as string || '[]');
  const deliveryInfo = JSON.parse(formData.get('deliveryInfo') as string || '{"title":"","description":"","areas":[]}');
  const customSections = JSON.parse(formData.get('customSections') as string || '[]');
  
  // Custom code injection (for FB Pixel, Google Analytics, etc.)
  const customHeadCode = formData.get('customHeadCode') as string || '';
  const customBodyCode = formData.get('customBodyCode') as string || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newConfig: LandingConfig & Record<string, any> = {
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
    callEnabled,
    callNumber,
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
    // Extended colors (Phase 1)
    backgroundColor: backgroundColor || undefined,
    textColor: textColor || undefined,
    borderColor: borderColor || undefined,
    // Typography (Phase 1)
    typography: Object.keys(typography).length > 0 ? typography : undefined,
    // New sections
    galleryImages: galleryImages.filter((url: string) => url),
    benefits: benefits.filter((b: {icon: string; title: string}) => b.icon && b.title),
    comparison: comparison.beforeImage || comparison.afterImage ? comparison : undefined,
    socialProof: socialProofData.count > 0 || socialProofData.text ? socialProofData : undefined,
    // Order form layout
    orderFormVariant,
    // Trust badges, delivery, custom sections
    trustBadges: trustBadges.filter((b: {icon: string; text: string}) => b.icon || b.text),
    deliveryInfo: deliveryInfo.title || deliveryInfo.description ? deliveryInfo : undefined,
    customSections: customSections.filter((s: {id: string; html: string}) => s.html),
    // Custom CSS
    customCSS: customCSS || undefined,
    // Custom code injection
    customHeadCode: customHeadCode || undefined,
    customBodyCode: customBodyCode || undefined,
    // Font Family
    fontFamily,
    // Landing Language
    landingLanguage,
  };

  const configJson = JSON.stringify(newConfig);

  if (intent === 'publish') {
    // PUBLISH: Save to both landingConfigDraft AND landingConfig (go live)
    await db
      .update(stores)
      .set({
        mode: storeMode,
        featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
        landingConfig: configJson,
        landingConfigDraft: configJson,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Published!', published: true });
  } else {
    // SAVE DRAFT: Only save to landingConfigDraft (not visible to public)
    await db
      .update(stores)
      .set({
        mode: storeMode,
        featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
        landingConfigDraft: configJson,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Draft saved', published: false });
  }
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
  
  // Auto-save fetcher
  const autoSaveFetcher = useFetcher<{ success?: boolean; message?: string; published?: boolean }>();
  const isAutoSaving = autoSaveFetcher.state !== 'idle';
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(store.hasUnpublishedChanges || false);


  // State for landing config
  const [templateId, setTemplateId] = useState(store.landingConfig.templateId || 'modern-dark');
  const [featuredProductId, setFeaturedProductId] = useState(store.featuredProductId?.toString() || '');
  const [sectionOrder, setSectionOrder] = useState(store.landingConfig.sectionOrder || DEFAULT_SECTION_ORDER);
  const [hiddenSections, setHiddenSections] = useState<string[]>(store.landingConfig.hiddenSections || []);
  const [whatsappEnabled, setWhatsappEnabled] = useState(store.landingConfig.whatsappEnabled || false);
  const [whatsappNumber, setWhatsappNumber] = useState(store.landingConfig.whatsappNumber || '');
  const [whatsappMessage, setWhatsappMessage] = useState(store.landingConfig.whatsappMessage || '');
  const [callEnabled, setCallEnabled] = useState(store.landingConfig.callEnabled || false);
  const [callNumber, setCallNumber] = useState(store.landingConfig.callNumber || '');
  
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

  const [primaryColor, setPrimaryColor] = useState(store.landingConfig.primaryColor || '#6366f1');
  const [accentColor, setAccentColor] = useState(store.landingConfig.accentColor || '#f59e0b');
  // Extended colors (Phase 1)
  const [backgroundColor, setBackgroundColor] = useState(store.landingConfig.backgroundColor || '#ffffff');
  const [textColor, setTextColor] = useState(store.landingConfig.textColor || '#111827');
  const [borderColor, setBorderColor] = useState(store.landingConfig.borderColor || '#e5e7eb');
  // Typography settings (Phase 1)
  const [typography, setTypography] = useState<TypographySettings>(store.landingConfig.typography || {
    headingSize: 'medium',
    bodySize: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  });
  
  const [storeMode, setStoreMode] = useState<'landing' | 'store'>(store.mode || 'landing');
  const [customCSS, setCustomCSS] = useState(store.landingConfig.customCSS || '');
  const [fontFamily, setFontFamily] = useState(store.landingConfig.fontFamily || 'inter');

  // New section states
  const [galleryImages, setGalleryImages] = useState<string[]>(store.landingConfig.galleryImages || []);
  const [benefits, setBenefits] = useState<Array<{icon: string; title: string; description: string}>>(
    store.landingConfig.benefits || []
  );
  const [comparison, setComparison] = useState<{
    beforeImage?: string;
    afterImage?: string;
    beforeLabel?: string;
    afterLabel?: string;
    description?: string;
  }>(store.landingConfig.comparison || {});
  const [socialProof, setSocialProof] = useState<{count: number; text: string}>(
    store.landingConfig.socialProof || { count: 0, text: '' }
  );
  
  // Order Form Layout Variant
  const [orderFormVariant, setOrderFormVariant] = useState<'full-width' | 'compact'>(
    store.landingConfig.orderFormVariant || 'full-width'
  );

  // Trust Badges (new)
  const [trustBadges, setTrustBadges] = useState<Array<{ icon: string; text: string }>>(
    (store.landingConfig as any).trustBadges || []
  );

  // Delivery Info (new)
  const [deliveryInfo, setDeliveryInfo] = useState<{ title: string; description: string; areas?: string[] }>(
    (store.landingConfig as any).deliveryInfo || { title: '', description: '', areas: [] }
  );

  // Custom Sections (with position support)
  const [customSections, setCustomSections] = useState<Array<{ id: string; name: string; html: string; css?: string; position?: string }>>(
    ((store.landingConfig as any).customSections || []).map((s: any) => ({
      ...s,
      position: s.position || 'after-hero'
    }))
  );

  // Custom Code Injection (FB Pixel, Google Analytics, etc.)
  const [customHeadCode, setCustomHeadCode] = useState<string>(
    (store.landingConfig as any).customHeadCode || ''
  );
  const [customBodyCode, setCustomBodyCode] = useState<string>(
    (store.landingConfig as any).customBodyCode || ''
  );

  // Landing Page Language (for visitor default view)
  const [landingLanguage, setLandingLanguage] = useState<'bn' | 'en'>(
    store.landingConfig.landingLanguage || 'bn'
  );

  // Preview device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Accordion state
  const [openSection, setOpenSection] = useState<string>('template');
  
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ============================================================================
  // IMAGE UPLOAD STATE FOR TESTIMONIALS
  // ============================================================================
  // Track original testimonial images (from database) for cleanup comparison
  const [originalTestimonialImages] = useState<string[]>(() => 
    (store.landingConfig.testimonials || []).map((t: {imageUrl?: string}) => t.imageUrl).filter(Boolean) as string[]
  );
  
  // Track newly uploaded images (for cleanup on abandon)
  const [pendingUploads, setPendingUploads] = useState<string[]>([]);
  
  // Track which testimonial index is currently uploading
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  
  // Image upload fetcher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();

  // ============================================================================
  // AI GENERATOR MODAL STATE
  // ============================================================================
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // AI Custom Section Generation
  const [aiPromptIndex, setAiPromptIndex] = useState<number | null>(null);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const aiSectionFetcher = useFetcher<{ success?: boolean; data?: { html: string; css?: string }; sectionIndex?: number; error?: string }>();
  
  // Handle AI section generation response
  useEffect(() => {
    if (aiSectionFetcher.state === 'idle' && aiSectionFetcher.data?.success && aiSectionFetcher.data.data) {
      const { html, css } = aiSectionFetcher.data.data;
      const sectionIndex = aiSectionFetcher.data.sectionIndex;
      if (typeof sectionIndex === 'number') {
        const newSections = [...customSections];
        newSections[sectionIndex].html = html;
        newSections[sectionIndex].css = css || '';
        setCustomSections(newSections);
      }
      setAiPromptIndex(null);
      setAiPromptText('');
      setIsAiGenerating(false);
    } else if (aiSectionFetcher.state === 'idle' && aiSectionFetcher.data?.error) {
      setIsAiGenerating(false);
      // Optionally show toast
    }
  }, [aiSectionFetcher.state, aiSectionFetcher.data, customSections]);
  
  const handleAiGenerate = (index: number) => {
    if (!aiPromptText.trim()) return;
    setIsAiGenerating(true);
    const formData = new FormData();
    formData.append('intent', 'GENERATE_CUSTOM_SECTION');
    formData.append('prompt', aiPromptText);
    formData.append('sectionIndex', String(index));
    formData.append('currentHtml', customSections[index]?.html || '');
    formData.append('featuredProductId', featuredProductId);
    aiSectionFetcher.submit(formData, { method: 'post' });
  };
  
  // Handle AI generation response
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = actionData as any;
    if (data?.success && data?.data?.aiGeneratedConfig) {
      const aiConfig = data.data.aiGeneratedConfig;
      
      // Update all states with AI generated data
      if (aiConfig.headline) setHeadline(aiConfig.headline);
      if (aiConfig.subheadline) setSubheadline(aiConfig.subheadline);
      if (aiConfig.ctaText) setCtaText(aiConfig.ctaText);
      if (aiConfig.features) setFeatures(aiConfig.features);
      if (aiConfig.testimonials) setTestimonials(aiConfig.testimonials);
      if (aiConfig.primaryColor) setPrimaryColor(aiConfig.primaryColor);
      if (aiConfig.accentColor) setAccentColor(aiConfig.accentColor);
      
      setIsAIModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [actionData]);

  // ============================================================================
  // UNDO/REDO FUNCTIONALITY (Phase 1)
  // ============================================================================
  const createStateSnapshot = useCallback(() => ({
    templateId,
    featuredProductId,
    headline,
    subheadline,
    ctaText,
    ctaSubtext,
    urgencyText,
    videoUrl,
    guaranteeText,
    features,
    sectionOrder,
    hiddenSections,
    whatsappEnabled,
    whatsappNumber,
    whatsappMessage,
    callEnabled,
    callNumber,
    testimonials,
    faq,
    countdownEnabled,
    countdownEndTime,
    showStockCounter,
    lowStockThreshold,
    showSocialProof,
    socialProofInterval,
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    borderColor,
    typography,
    storeMode,
    customCSS,
    fontFamily,
    galleryImages,
    benefits,
    comparison,
    socialProof,
    orderFormVariant,
    landingLanguage,
  }), [templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText, features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, callEnabled, callNumber, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, showSocialProof, socialProofInterval, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, storeMode, customCSS, fontFamily, galleryImages, benefits, comparison, socialProof, orderFormVariant, landingLanguage]);

  const initialSnapshot = useRef(createStateSnapshot());
  
  const {
    state: historyState,
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorHistory(initialSnapshot.current, { maxHistory: 20, debounceMs: 500 });

  // Track state changes for history
  const prevSnapshotRef = useRef<string>(JSON.stringify(initialSnapshot.current));
  useEffect(() => {
    const currentSnapshot = createStateSnapshot();
    const currentSnapshotStr = JSON.stringify(currentSnapshot);
    if (currentSnapshotStr !== prevSnapshotRef.current) {
      prevSnapshotRef.current = currentSnapshotStr;
      setHistoryState(currentSnapshot);
    }
  }, [createStateSnapshot, setHistoryState]);

  // Restore states from historyState when undo/redo happens
  const isRestoringRef = useRef(false);
  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }
    // Sync historyState to individual states
    if (historyState) {
      setTemplateId(historyState.templateId ?? templateId);
      setFeaturedProductId(historyState.featuredProductId ?? featuredProductId);
      setHeadline(historyState.headline ?? headline);
      setSubheadline(historyState.subheadline ?? subheadline);
      setCtaText(historyState.ctaText ?? ctaText);
      setCtaSubtext(historyState.ctaSubtext ?? ctaSubtext);
      setUrgencyText(historyState.urgencyText ?? urgencyText);
      setVideoUrl(historyState.videoUrl ?? videoUrl);
      setGuaranteeText(historyState.guaranteeText ?? guaranteeText);
      setFeatures(historyState.features ?? features);
      setSectionOrder(historyState.sectionOrder ?? sectionOrder);
      setHiddenSections(historyState.hiddenSections ?? hiddenSections);
      setWhatsappEnabled(historyState.whatsappEnabled ?? whatsappEnabled);
      setWhatsappNumber(historyState.whatsappNumber ?? whatsappNumber);
      setWhatsappMessage(historyState.whatsappMessage ?? whatsappMessage);
      setCallEnabled(historyState.callEnabled ?? callEnabled);
      setCallNumber(historyState.callNumber ?? callNumber);
      setTestimonials(historyState.testimonials ?? testimonials);
      setFaq(historyState.faq ?? faq);
      setCountdownEnabled(historyState.countdownEnabled ?? countdownEnabled);
      setCountdownEndTime(historyState.countdownEndTime ?? countdownEndTime);
      setShowStockCounter(historyState.showStockCounter ?? showStockCounter);
      setLowStockThreshold(historyState.lowStockThreshold ?? lowStockThreshold);
      setShowSocialProof(historyState.showSocialProof ?? showSocialProof);
      setSocialProofInterval(historyState.socialProofInterval ?? socialProofInterval);
      setPrimaryColor(historyState.primaryColor ?? primaryColor);
      setAccentColor(historyState.accentColor ?? accentColor);
      setBackgroundColor(historyState.backgroundColor ?? backgroundColor);
      setTextColor(historyState.textColor ?? textColor);
      setBorderColor(historyState.borderColor ?? borderColor);
      setTypography(historyState.typography ?? typography);
      setStoreMode(historyState.storeMode ?? storeMode);
      setCustomCSS(historyState.customCSS ?? customCSS);
      setFontFamily(historyState.fontFamily ?? fontFamily);
      setGalleryImages(historyState.galleryImages ?? galleryImages);
      setBenefits(historyState.benefits ?? benefits);
      setComparison(historyState.comparison ?? comparison);
      setSocialProof(historyState.socialProof ?? socialProof);
      setOrderFormVariant(historyState.orderFormVariant ?? orderFormVariant);
      setLandingLanguage(historyState.landingLanguage ?? landingLanguage);
    }
  // Only run when historyState reference changes (undo/redo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyState]);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // Keyboard shortcuts for undo/redo
  useEditorKeyboardShortcuts(handleUndo, handleRedo, canUndo, canRedo);

  // Track unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const initialLoadRef = useRef(true);
  
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setHasChanges(true);
    setHasUnpublishedChanges(true);
  }, [templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText, features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, callEnabled, callNumber, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, storeMode, galleryImages, benefits, comparison, socialProof, orderFormVariant, customCSS, fontFamily, landingLanguage]);

  // Auto-populate data when product changes
  useEffect(() => {
    if (!featuredProductId || !storeProducts.length) return;
    
    const product = storeProducts.find(p => p.id === parseInt(featuredProductId));
    if (!product) return;

    // Only update if fields are empty or user explicitly wants to reset (could add a button for "Reset to Product Data" later)
    // For now, we update if it looks like the user just switched products and fields are generic or empty
    
    // We use a ref to track if this is the initial load vs a user change
    // But since we want "Smart" behavior:
    
    if (!headline || headline === 'Transform Your Life Today') {
      setHeadline(product.title);
    }
    
    if (!galleryImages || galleryImages.length === 0) {
      if (product.imageUrl) {
        setGalleryImages([product.imageUrl]);
      }
    }
    
    // Optional: Set subheadline to description if empty
    /*
    if (!subheadline && product.description) {
       // Strip HTML if needed, or just take first 100 chars
       const plainText = product.description.replace(/<[^>]+>/g, '');
       setSubheadline(plainText.substring(0, 150) + (plainText.length > 150 ? '...' : ''));
    }
    */
    
  }, [featuredProductId, storeProducts]);

  // ============================================================================
  // DEBOUNCED AUTO-SAVE (2 seconds after last change)
  // ============================================================================
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Don't auto-save on initial load
    if (initialLoadRef.current) return;
    if (!hasChanges) return;
    
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      
      const formData = new FormData();
      formData.append('intent', 'save_draft');
      formData.append('templateId', templateId);
      formData.append('featuredProductId', featuredProductId);
      formData.append('headline', headline);
      formData.append('subheadline', subheadline);
      formData.append('ctaText', ctaText);
      formData.append('ctaSubtext', ctaSubtext);
      formData.append('urgencyText', urgencyText);
      formData.append('videoUrl', videoUrl);
      formData.append('guaranteeText', guaranteeText);
      formData.append('sectionOrder', JSON.stringify(sectionOrder));
      formData.append('hiddenSections', JSON.stringify(hiddenSections));
      formData.append('whatsappEnabled', whatsappEnabled.toString());
      formData.append('whatsappNumber', whatsappNumber);
      formData.append('whatsappMessage', whatsappMessage);
      formData.append('callEnabled', callEnabled.toString());
      formData.append('callNumber', callNumber);
      formData.append('testimonials', JSON.stringify(testimonials));
      formData.append('faq', JSON.stringify(faq));
      formData.append('features', JSON.stringify(features));
      formData.append('countdownEnabled', countdownEnabled.toString());
      formData.append('countdownEndTime', countdownEndTime);
      formData.append('showStockCounter', showStockCounter.toString());
      formData.append('lowStockThreshold', lowStockThreshold.toString());
      formData.append('showSocialProof', showSocialProof.toString());
      formData.append('socialProofInterval', socialProofInterval.toString());
      formData.append('primaryColor', primaryColor);
      formData.append('accentColor', accentColor);
      formData.append('backgroundColor', backgroundColor);
      formData.append('textColor', textColor);
      formData.append('borderColor', borderColor);
      formData.append('typography', JSON.stringify(typography));
      formData.append('storeMode', storeMode);
      formData.append('galleryImages', JSON.stringify(galleryImages));
      formData.append('benefits', JSON.stringify(benefits));
      formData.append('comparison', JSON.stringify(comparison));
      formData.append('socialProof', JSON.stringify(socialProof));
      formData.append('orderFormVariant', orderFormVariant);
      formData.append('customCSS', customCSS);
      formData.append('fontFamily', fontFamily);
      formData.append('landingLanguage', landingLanguage);
      // New section data
      formData.append('trustBadges', JSON.stringify(trustBadges));
      formData.append('deliveryInfo', JSON.stringify(deliveryInfo));
      formData.append('customSections', JSON.stringify(customSections));
      // Custom code injection
      formData.append('customHeadCode', customHeadCode);
      formData.append('customBodyCode', customBodyCode);
      
      autoSaveFetcher.submit(formData, { method: 'post' });
    }, 2000); // 2 seconds debounce
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText, features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, callEnabled, callNumber, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, showSocialProof, socialProofInterval, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, storeMode, galleryImages, benefits, comparison, socialProof, orderFormVariant, customCSS, fontFamily, landingLanguage, trustBadges, deliveryInfo, customSections, customHeadCode, customBodyCode, autoSaveFetcher]);

  // Handle auto-save response
  useEffect(() => {
    if (autoSaveFetcher.data?.success && !autoSaveFetcher.data?.published) {
      setAutoSaveStatus('saved');
      setHasChanges(false);
      // Reset status after 3 seconds
      const timer = setTimeout(() => setAutoSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveFetcher.data]);

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

  // Show success message (for publish action)
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      setHasChanges(false);
      if ('published' in actionData && actionData.published) {
        setHasUnpublishedChanges(false);
      }
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

  // ============================================================================
  // IMAGE UPLOAD HANDLERS FOR TESTIMONIALS
  // ============================================================================
  
  // Handle testimonial image upload
  const handleTestimonialImageUpload = useCallback(async (file: File, index: number) => {
    setUploadingIndex(index);
    
    // Compress image before upload
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        format,
      });
      fileToUpload = new File([compressedBlob], `testimonial.${format}`, { type: `image/${format}` });
      console.log(`Testimonial image compressed: ${file.size} -> ${compressedBlob.size} bytes`);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    // Upload to R2
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'testimonials');

    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  }, [imageFetcher]);

  // Handle fetcher response for image upload
  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url && uploadingIndex !== null) {
      const url = imageFetcher.data.url;
      
      // Update testimonial with new image URL
      const newTestimonials = [...testimonials];
      if (newTestimonials[uploadingIndex]) {
        // If replacing an existing uploaded image (not original), delete the old one
        const oldUrl = newTestimonials[uploadingIndex].imageUrl;
        if (oldUrl && pendingUploads.includes(oldUrl)) {
          deleteOrphanedImage(oldUrl);
          setPendingUploads(prev => prev.filter(u => u !== oldUrl));
        }
        
        newTestimonials[uploadingIndex].imageUrl = url;
        setTestimonials(newTestimonials);
      }
      
      // Track this upload for potential cleanup
      setPendingUploads(prev => [...prev, url]);
      setUploadingIndex(null);
    } else if (imageFetcher.data?.error) {
      setUploadingIndex(null);
    }
  }, [imageFetcher.data, uploadingIndex, testimonials, pendingUploads]);

  // Handle removing a testimonial image
  const handleRemoveTestimonialImage = useCallback((index: number) => {
    const url = testimonials[index]?.imageUrl;
    if (url) {
      // If it's a newly uploaded image (not from original), delete from R2
      if (pendingUploads.includes(url)) {
        deleteOrphanedImage(url);
        setPendingUploads(prev => prev.filter(u => u !== url));
      }
      
      // Clear the image URL
      const newTestimonials = [...testimonials];
      newTestimonials[index].imageUrl = '';
      setTestimonials(newTestimonials);
    }
  }, [testimonials, pendingUploads]);

  // Cleanup orphaned images when leaving without saving
  const handleAbandonCleanup = useCallback(() => {
    // Delete all pending uploads that are not in originalTestimonialImages
    pendingUploads.forEach(url => {
      if (!originalTestimonialImages.includes(url)) {
        deleteOrphanedImage(url);
      }
    });
  }, [pendingUploads, originalTestimonialImages]);

  // Cleanup on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (hasChanges && pendingUploads.length > 0) {
        handleAbandonCleanup();
      }
    };
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [hasChanges, pendingUploads, handleAbandonCleanup]);

  // Clear pending uploads on successful save
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setPendingUploads([]);
    }
  }, [actionData]);

  // Preview URL
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  // Get selected template info
  const selectedTemplate = LANDING_TEMPLATES.find(t => t.id === templateId);

  // Build live preview config - MEMOIZED to prevent flickering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewConfig: LandingConfig & Record<string, any> = useMemo(() => ({
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
    callEnabled,
    callNumber,
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
    // New sections
    galleryImages,
    benefits,
    comparison,
    socialProof,
    // Order form layout
    orderFormVariant,
    // Trust badges, delivery, custom sections
    trustBadges,
    deliveryInfo,
    customSections: customSections as any,
    // Custom code injection
    customHeadCode,
    customBodyCode,
    // Landing language
    landingLanguage,
  }), [
    templateId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText,
    features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage,
    callEnabled, callNumber, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter,
    lowStockThreshold, showSocialProof, socialProofInterval, primaryColor, accentColor,
    galleryImages, benefits, comparison, socialProof, orderFormVariant, trustBadges, deliveryInfo,
    customSections, customHeadCode, customBodyCode, landingLanguage
  ]);

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
    mobile: 414,
    tablet: 768,
    desktop: 1200,
  };

  // Device height mapping (for iframe)
  const deviceHeights = {
    mobile: 896,
    tablet: 1024,
    desktop: 800,
  };

  // Iframe ref for postMessage communication
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Listen for iframe ready signal and ADD_CUSTOM_SECTION messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_FRAME_READY') {
        setIframeReady(true);
      }
      
      // Handle add custom section from canvas
      if (event.data && event.data.type === 'ADD_CUSTOM_SECTION') {
        const position = event.data.position || 'after-hero';
        // Create a new custom section with the specified position
        const newSection = {
          id: `custom-${Date.now()}`,
          name: language === 'bn' ? 'নতুন কাস্টম সেকশন' : 'New Custom Section',
          html: '',
          css: '',
          position,
        };
        setCustomSections([...customSections, newSection]);
        // Open the custom design accordion
        setOpenSection('customhtml');
        // Auto-focus the new section's prompt
        setAiPromptIndex(customSections.length);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [customSections, language]);

  // Send config updates to iframe whenever config changes
  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'PREVIEW_CONFIG_UPDATE',
        config: previewConfig,
        templateId,
        featuredProductId,
      }, '*');
    }
  }, [iframeReady, previewConfig, templateId, featuredProductId]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-20">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              title={language === 'bn' ? 'এডিটর প্যানেল' : 'Editor Panel'}
            >
              <PanelLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <Link
              to="/app/landing-builder"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'লাইভ এডিটর' : 'Live Editor'}
              </h1>
              <p className="text-xs text-gray-500">{store.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-1.5 sm:p-2 rounded-md transition ${canUndo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title={language === 'bn' ? 'আনডু (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-1.5 sm:p-2 rounded-md transition ${canRedo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title={language === 'bn' ? 'রিডু (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Device Toggle - Hidden on mobile since they can't see the preview anyway */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-md transition ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile (414px)"
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

            {/* Open in New Tab - Hidden on mobile */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title={language === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in new tab'}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            {/* Auto-Save Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {isAutoSaving || autoSaveStatus === 'saving' ? (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'}
                </span>
              ) : autoSaveStatus === 'saved' ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'ড্রাফট সেভড' : 'Draft saved'}
                </span>
              ) : hasUnpublishedChanges ? (
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  {language === 'bn' ? 'অপ্রকাশিত' : 'Unpublished'}
                </span>
              ) : null}
            </div>
            
            {/* Publish Button */}
            <Form 
              method="post"
              onSubmit={(e) => {
                if (!validateBeforeSave()) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="intent" value="publish" />
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
              <input type="hidden" name="callEnabled" value={callEnabled.toString()} />
              <input type="hidden" name="callNumber" value={callNumber} />
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
              <input type="hidden" name="backgroundColor" value={backgroundColor} />
              <input type="hidden" name="textColor" value={textColor} />
              <input type="hidden" name="borderColor" value={borderColor} />
              <input type="hidden" name="typography" value={JSON.stringify(typography)} />
              <input type="hidden" name="storeMode" value={storeMode} />
              <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />
              <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />
              <input type="hidden" name="comparison" value={JSON.stringify(comparison)} />
              <input type="hidden" name="socialProof" value={JSON.stringify(socialProof)} />
              <input type="hidden" name="orderFormVariant" value={orderFormVariant} />
              <input type="hidden" name="customCSS" value={customCSS} />
              <input type="hidden" name="fontFamily" value={fontFamily} />
              <input type="hidden" name="landingLanguage" value={landingLanguage} />
              
              <button
                type="submit"
                disabled={isSubmitting || !hasUnpublishedChanges}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 font-medium rounded-lg transition ${
                  hasUnpublishedChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50`}
                title={hasUnpublishedChanges 
                  ? (language === 'bn' ? 'লাইভ সাইটে প্রকাশ করুন' : 'Publish to live site')
                  : (language === 'bn' ? 'সব পরিবর্তন প্রকাশিত' : 'All changes published')
                }
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : showSuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {showSuccess 
                    ? (language === 'bn' ? 'প্রকাশিত!' : 'Published!') 
                    : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish')
                  }
                </span>
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* AI Generator Modal */}
        <AIGeneratorModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)}
          language={language as 'en' | 'bn'}
        />
        
        {/* Left Sidebar - Editing Controls (Slide-out on mobile) */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-[75%] sm:w-72 md:w-80 bg-white border-r border-gray-200 
          overflow-y-auto flex-shrink-0
          transform transition-transform duration-300 ease-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block
        `}>
          {/* Mobile Sidebar Header */}
          <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'এডিটর' : 'Editor'}
            </h2>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {/* Group 1: Design & Template */}
          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 uppercase tracking-wider text-[10px] font-bold text-gray-500">
            {language === 'bn' ? 'ডিজাইন ও স্টাইল' : 'Design & Style'}
          </div>

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

          <AccordionSection
            title={language === 'bn' ? 'রং ও স্টাইল' : 'Colors & Style'}
            icon={Paintbrush}
            isOpen={openSection === 'colors'}
            onToggle={() => setOpenSection(openSection === 'colors' ? '' : 'colors')}
          >
            <div className="space-y-4">
              {/* Primary Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    {language === 'bn' ? 'প্রাইমারি' : 'Primary'}
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    {language === 'bn' ? 'এক্সেন্ট' : 'Accent'}
                  </label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Advanced Colors */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  {language === 'bn' ? 'ব্যাকগ্রাউন্ড' : 'Background'}
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-8 rounded-lg cursor-pointer"
                />
              </div>

              {/* Typography */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'ফন্ট' : 'Font'}
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <optgroup label={language === 'bn' ? 'বাংলা ফন্ট' : 'Bengali Fonts'}>
                    <option value="hind-siliguri">Hind Siliguri</option>
                    <option value="noto-sans-bengali">Noto Sans Bengali</option>
                    <option value="noto-serif-bengali">Noto Serif Bengali</option>
                    <option value="baloo-da">Baloo Da 2</option>
                    <option value="tiro-bangla">Tiro Bangla</option>
                    <option value="anek-bangla">Anek Bangla</option>
                  </optgroup>
                  <optgroup label={language === 'bn' ? 'ইংরেজি ফন্ট' : 'English Fonts'}>
                    <option value="inter">Inter (Modern)</option>
                    <option value="roboto">Roboto (Clean)</option>
                    <option value="poppins">Poppins</option>
                    <option value="montserrat">Montserrat</option>
                    <option value="playfair">Playfair Display</option>
                    <option value="lato">Lato</option>
                    <option value="open-sans">Open Sans</option>
                    <option value="nunito">Nunito</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </AccordionSection>

          {/* Group 2: Content */}
          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 uppercase tracking-wider text-[10px] font-bold text-gray-500 mt-2">
            {language === 'bn' ? 'পেজ কন্টেন্ট' : 'Page Content'}
          </div>

          <AccordionSection
            title={language === 'bn' ? 'প্রধান লেখা' : 'Main Text'}
            icon={Settings}
            isOpen={openSection === 'content'}
            onToggle={() => setOpenSection(openSection === 'content' ? '' : 'content')}
          >
            <div className="space-y-4">
              {/* Featured Product */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'প্রোডাক্ট' : 'Product'}
                </label>
                <select
                  value={featuredProductId}
                  onChange={(e) => setFeaturedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">{language === 'bn' ? 'সিলেক্ট করুন' : 'Select product'}</option>
                  {storeProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'হেডলাইন' : 'Headline'}
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'বাটন টেক্সট' : 'Button Text'}
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title={language === 'bn' ? 'সেকশন ও তথ্য' : 'Sections & Info'}
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
              // Hero section
              headline={headline}
              onHeadlineChange={setHeadline}
              subheadline={subheadline}
              onSubheadlineChange={setSubheadline}
              ctaText={ctaText}
              onCtaTextChange={setCtaText}
              // Trust badges
              trustBadges={trustBadges}
              onTrustBadgesChange={setTrustBadges}
              // Delivery info
              deliveryInfo={deliveryInfo}
              onDeliveryInfoChange={setDeliveryInfo}
              // Features
              features={features}
              onFeaturesChange={setFeatures}
              faq={faq}
              onFaqChange={setFaq}
              testimonials={testimonials}
              onTestimonialsChange={setTestimonials}
              videoUrl={videoUrl}
              onVideoUrlChange={setVideoUrl}
              guaranteeText={guaranteeText}
              onGuaranteeTextChange={setGuaranteeText}
              onTestimonialImageUpload={handleTestimonialImageUpload}
              onTestimonialImageRemove={handleRemoveTestimonialImage}
              uploadingIndex={uploadingIndex}
              galleryImages={galleryImages}
              onGalleryImagesChange={setGalleryImages}
              benefits={benefits}
              onBenefitsChange={setBenefits}
              comparison={comparison}
              onComparisonChange={setComparison}
              socialProof={socialProof}
              onSocialProofChange={setSocialProof}
              orderFormVariant={orderFormVariant}
              onOrderFormVariantChange={setOrderFormVariant}
              // Custom code sections
              customSections={customSections}
              onCustomSectionsChange={setCustomSections}
            />
          </AccordionSection>

          {/* Group 3: Power-ups */}
          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 uppercase tracking-wider text-[10px] font-bold text-gray-500 mt-2">
            {language === 'bn' ? 'পাওয়ার-আপস' : 'Power-ups'}
          </div>

          <AccordionSection
            title={language === 'bn' ? 'হোয়াটসঅ্যাপ ও কল' : 'WhatsApp & Call'}
            icon={MessageCircle}
            isOpen={openSection === 'contact'}
            onToggle={() => setOpenSection(openSection === 'contact' ? '' : 'contact')}
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">WhatsApp Button</span>
              </label>

              {whatsappEnabled && (
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={callEnabled}
                  onChange={(e) => setCallEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">Call Button</span>
              </label>

              {callEnabled && (
                <input
                  type="text"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            </div>
          </AccordionSection>

          <AccordionSection
            title={language === 'bn' ? 'মার্কেটিং ও সেলস' : 'Marketing & Sales'}
            icon={TrendingUp}
            isOpen={openSection === 'conversion'}
            onToggle={() => setOpenSection(openSection === 'conversion' ? '' : 'conversion')}
          >
            <div className="space-y-4">
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
                <input
                  type="datetime-local"
                  value={countdownEndTime}
                  onChange={(e) => setCountdownEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}

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

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSocialProof}
                  onChange={(e) => setShowSocialProof(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' ? '👥 সোশ্যাল প্রুফ' : '👥 Social Proof'}
                </span>
              </label>
            </div>
          </AccordionSection>

          {/* Custom HTML/CSS Section - Outside Section Manager */}
          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 uppercase tracking-wider text-[10px] font-bold text-gray-500 mt-2">
            {language === 'bn' ? 'কাস্টম ডিজাইন' : 'Custom Design'}
          </div>

          <AccordionSection
            title={language === 'bn' ? 'কাস্টম HTML/CSS' : 'Custom HTML/CSS'}
            icon={Code}
            isOpen={openSection === 'customhtml'}
            onToggle={() => setOpenSection(openSection === 'customhtml' ? '' : 'customhtml')}
          >
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                {language === 'bn' 
                  ? 'কাস্টম HTML ও CSS একসাথে পেস্ট করুন। এটি সঠিক পজিশনে দেখাবে।' 
                  : 'Paste HTML and CSS together. It will render at the selected position.'}
              </p>
              
              {customSections.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="mb-1">
                    {language === 'bn' ? 'কোনো কাস্টম ডিজাইন নেই' : 'No custom designs yet'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'bn' ? 'নিচের বাটনে ক্লিক করে যোগ করুন' : 'Click the button below to add'}
                  </p>
                </div>
              )}

              {customSections.map((section, index) => (
                <div key={section.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => {
                        const newSections = [...customSections];
                        newSections[index].name = e.target.value;
                        setCustomSections(newSections);
                      }}
                      placeholder={language === 'bn' ? 'সেকশনের নাম' : 'Section name'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomSections(customSections.filter((_, i) => i !== index))}
                      className="ml-2 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Position Selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {language === 'bn' ? 'পজিশন (কোথায় দেখাবে)' : 'Position'}
                    </label>
                    <select
                      value={(section as any).position || 'after-hero'}
                      onChange={(e) => {
                        const newSections = [...customSections];
                        (newSections[index] as any).position = e.target.value;
                        setCustomSections(newSections);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="before-hero">{language === 'bn' ? 'Hero এর আগে' : 'Before Hero'}</option>
                      <option value="after-hero">{language === 'bn' ? 'Hero এর পরে' : 'After Hero'}</option>
                      <option value="before-features">{language === 'bn' ? 'Features এর আগে' : 'Before Features'}</option>
                      <option value="after-features">{language === 'bn' ? 'Features এর পরে' : 'After Features'}</option>
                      <option value="before-testimonials">{language === 'bn' ? 'Testimonials এর আগে' : 'Before Testimonials'}</option>
                      <option value="after-testimonials">{language === 'bn' ? 'Testimonials এর পরে' : 'After Testimonials'}</option>
                      <option value="before-form">{language === 'bn' ? 'অর্ডার ফর্ম এর আগে' : 'Before Order Form'}</option>
                      <option value="after-form">{language === 'bn' ? 'অর্ডার ফর্ম এর পরে' : 'After Order Form'}</option>
                      <option value="before-footer">{language === 'bn' ? 'Footer এর আগে' : 'Before Footer'}</option>
                    </select>
                  </div>
                  
                  {/* Combined HTML+CSS Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-700">
                        {language === 'bn' ? 'HTML + CSS কোড' : 'HTML + CSS Code'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (aiPromptIndex === index) setAiPromptIndex(null);
                          else { setAiPromptIndex(index); setAiPromptText(''); }
                        }}
                        className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-3 h-3" />
                        {language === 'bn' ? 'AI দিয়ে তৈরি করুন' : 'Generate with AI'}
                      </button>
                    </div>
                    
                    {/* AI Prompt Input (inline, collapsible) */}
                    {aiPromptIndex === index && (
                      <div className="mb-2 p-3 bg-violet-50 rounded-lg border border-violet-200 space-y-2">
                        <input
                          type="text"
                          value={aiPromptText}
                          onChange={(e) => setAiPromptText(e.target.value)}
                          placeholder={language === 'bn' ? 'বর্ণনা দিন (যেমন: ডেলিভারি টাইমলাইন সেকশন)' : 'Describe the section (e.g., delivery timeline section)'}
                          className="w-full px-3 py-2 border border-violet-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-400 outline-none"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAiGenerate(index); }}
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setAiPromptIndex(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                          <button
                            type="button"
                            onClick={() => handleAiGenerate(index)}
                            disabled={isAiGenerating || !aiPromptText.trim()}
                            className="px-4 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {language === 'bn' ? 'জেনারেট' : 'Generate'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <textarea
                      value={section.css ? `<style>${section.css}</style>\n${section.html}` : section.html}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newSections = [...customSections];
                        // Parse style tag if present
                        const styleMatch = value.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                        if (styleMatch) {
                          newSections[index].css = styleMatch[1].trim();
                          newSections[index].html = value.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();
                        } else {
                          newSections[index].css = '';
                          newSections[index].html = value;
                        }
                        setCustomSections(newSections);
                      }}
                      placeholder={language === 'bn' 
                        ? '<style>\n  .my-class { color: red; }\n</style>\n\n<div class="my-class">আপনার কোড</div>' 
                        : '<style>\n  .my-class { color: red; }\n</style>\n\n<div class="my-class">Your code</div>'}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newSection = {
                    id: `custom-${Date.now()}`,
                    name: language === 'bn' ? 'নতুন কাস্টম ডিজাইন' : 'New Custom Design',
                    html: '',
                    css: '',
                    position: 'after-hero',
                  };
                  setCustomSections([...customSections, newSection]);
                }}
                className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-lg text-sm text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? '+ কাস্টম ডিজাইন যোগ করুন' : '+ Add Custom Design'}
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
              {previewDevice === 'mobile' && '📱 414 × 896'}
              {previewDevice === 'tablet' && '📱 768 × 1024'}
              {previewDevice === 'desktop' && '🖥️ Full Width'}
            </span>
          </div>
          
          {/* Preview Container - Chrome DevTools style responsive preview */}
          <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-800 p-2 md:p-4">
            {/* 
              Chrome DevTools-like responsive preview:
              - Mobile/Tablet: Fixed device frame with centered view
              - Desktop: Full available width without restrictions
            */}
            <div 
              className={`bg-white rounded-lg overflow-hidden transition-all duration-300 relative ${
                previewDevice === 'desktop' 
                  ? 'w-full h-full shadow-none rounded-none' 
                  : 'shadow-2xl'
              }`}
              style={previewDevice !== 'desktop' ? {
                width: previewDevice === 'mobile' ? '414px' : '768px',
                height: previewDevice === 'mobile' ? '896px' : '1024px',
                maxHeight: 'calc(100vh - 150px)',
              } : undefined}
            >
              <iframe
                ref={iframeRef}
                src="/preview-frame"
                className="w-full h-full border-0"
                title="Live Preview"
              />
              {/* Loading overlay while iframe initializes */}
              {!iframeReady && (
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
