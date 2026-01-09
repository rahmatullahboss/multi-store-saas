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
  Upload, X, Image as ImageIcon, Phone, Undo2, Redo2, Type
} from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { deleteOrphanedImage } from '~/hooks/useUnsavedChanges';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useEditorHistory, useEditorKeyboardShortcuts } from '~/hooks/useEditorHistory';
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
  const storeId = await getStoreId(request, context.cloudflare.env);
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
    // Custom CSS
    customCSS: customCSS || undefined,
    // Font Family
    fontFamily,
    // Landing Language
    landingLanguage,
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

  // Landing Page Language (for visitor default view)
  const [landingLanguage, setLandingLanguage] = useState<'bn' | 'en'>(
    store.landingConfig.landingLanguage || 'bn'
  );

  // Preview device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Accordion state
  const [openSection, setOpenSection] = useState<string>('template');

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
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();

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
  }, [templateId, featuredProductId, headline, subheadline, ctaText, ctaSubtext, urgencyText, videoUrl, guaranteeText, features, sectionOrder, hiddenSections, whatsappEnabled, whatsappNumber, whatsappMessage, callEnabled, callNumber, testimonials, faq, countdownEnabled, countdownEndTime, showStockCounter, lowStockThreshold, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, storeMode, galleryImages, benefits, comparison, socialProof, orderFormVariant, customCSS, fontFamily, landingLanguage]);

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
    // Landing language
    landingLanguage,
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

  // Device height mapping (for iframe)
  const deviceHeights = {
    mobile: 667,
    tablet: 1024,
    desktop: 800,
  };

  // Iframe ref for postMessage communication
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Listen for iframe ready signal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_FRAME_READY') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
            {/* Undo/Redo Buttons (Phase 1) */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2 rounded-md transition ${canUndo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title={language === 'bn' ? 'আনডু (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2 rounded-md transition ${canRedo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title={language === 'bn' ? 'রিডু (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

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

            {/* Landing Page Language Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLandingLanguage('bn')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${landingLanguage === 'bn' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="বাংলা"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLandingLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${landingLanguage === 'en' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="English"
              >
                EN
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
              {/* Extended colors (Phase 1) */}
              <input type="hidden" name="backgroundColor" value={backgroundColor} />
              <input type="hidden" name="textColor" value={textColor} />
              <input type="hidden" name="borderColor" value={borderColor} />
              {/* Typography (Phase 1) */}
              <input type="hidden" name="typography" value={JSON.stringify(typography)} />
              <input type="hidden" name="storeMode" value={storeMode} />
              {/* New sections */}
              <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />
              <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />
              <input type="hidden" name="comparison" value={JSON.stringify(comparison)} />
              <input type="hidden" name="socialProof" value={JSON.stringify(socialProof)} />
              {/* Order form layout */}
              <input type="hidden" name="orderFormVariant" value={orderFormVariant} />
              {/* Custom CSS */}
              <input type="hidden" name="customCSS" value={customCSS} />
              {/* Font Family */}
              <input type="hidden" name="fontFamily" value={fontFamily} />
              {/* Landing Language */}
              <input type="hidden" name="landingLanguage" value={landingLanguage} />
              
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
            title={language === 'bn' ? 'লেখা ও টেক্সট' : 'Text & Copy'}
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
            title={language === 'bn' ? 'পেজ সাজান' : 'Page Sections'}
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
              // Content editing props
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
              // Image upload handlers
              onTestimonialImageUpload={handleTestimonialImageUpload}
              onTestimonialImageRemove={handleRemoveTestimonialImage}
              uploadingIndex={uploadingIndex}
              // New section props
              galleryImages={galleryImages}
              onGalleryImagesChange={setGalleryImages}
              benefits={benefits}
              onBenefitsChange={setBenefits}
              comparison={comparison}
              onComparisonChange={setComparison}
              socialProof={socialProof}
              onSocialProofChange={setSocialProof}
              // Order form layout
              orderFormVariant={orderFormVariant}
              onOrderFormVariantChange={setOrderFormVariant}
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

          {/* Theme & Typography Section (Phase 1 Enhanced) */}
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {language === 'bn' ? 'প্রাইমারি' : 'Primary'}
                  </label>
                  <input
                    type="color"
                    value={primaryColor || '#f97316'}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {language === 'bn' ? 'অ্যাকসেন্ট' : 'Accent'}
                  </label>
                  <input
                    type="color"
                    value={accentColor || '#d4af37'}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>

              {/* Extended Colors (Phase 1) */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'অতিরিক্ত রং' : 'Extended Colors'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      {language === 'bn' ? 'ব্যাকগ্রাউন্ড' : 'Background'}
                    </label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-7 rounded border cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      {language === 'bn' ? 'টেক্সট' : 'Text'}
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-7 rounded border cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">
                      {language === 'bn' ? 'বর্ডার' : 'Border'}
                    </label>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-7 rounded border cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Typography Settings (Phase 1) */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Type className="w-3 h-3" /> {language === 'bn' ? 'টাইপোগ্রাফি' : 'Typography'}
                </p>
                
                {/* Heading Size */}
                <div className="mb-3">
                  <label className="block text-[10px] text-gray-500 mb-1">
                    {language === 'bn' ? 'হেডিং সাইজ' : 'Heading Size'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTypography({ ...typography, headingSize: size })}
                        className={`px-2 py-1.5 text-xs rounded border transition ${
                          typography.headingSize === size ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Size */}
                <div className="mb-3">
                  <label className="block text-[10px] text-gray-500 mb-1">
                    {language === 'bn' ? 'বডি সাইজ' : 'Body Size'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTypography({ ...typography, bodySize: size })}
                        className={`px-2 py-1.5 text-xs rounded border transition ${
                          typography.bodySize === size ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Height */}
                <div className="mb-3">
                  <label className="block text-[10px] text-gray-500 mb-1">
                    {language === 'bn' ? 'লাইন হাইট' : 'Line Height'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['compact', 'normal', 'relaxed'] as const).map((height) => (
                      <button
                        key={height}
                        type="button"
                        onClick={() => setTypography({ ...typography, lineHeight: height })}
                        className={`px-2 py-1.5 text-[10px] rounded border transition ${
                          typography.lineHeight === height ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {height.charAt(0).toUpperCase() + height.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">
                    {language === 'bn' ? 'লেটার স্পেসিং' : 'Letter Spacing'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['tight', 'normal', 'wide'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        type="button"
                        onClick={() => setTypography({ ...typography, letterSpacing: spacing })}
                        className={`px-2 py-1.5 text-[10px] rounded border transition ${
                          typography.letterSpacing === spacing ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                      </button>
                    ))}
                  </div>
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

          {/* Call Button Section */}
          <AccordionSection
            title={language === 'bn' ? 'কল বাটন' : 'Call Button'}
            icon={Phone}
            isOpen={openSection === 'call'}
            onToggle={() => setOpenSection(openSection === 'call' ? '' : 'call')}
          >
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {language === 'bn' ? 'কল বাটন চালু করুন' : 'Enable Call Button'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'bn' ? 'ফ্লোটিং কল বাটন দেখান' : 'Show floating call button'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCallEnabled(!callEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    callEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      callEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Phone Number Input */}
              {callEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    placeholder="01712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'bn' ? 'গ্রাহকরা এই নম্বরে সরাসরি কল করতে পারবে' : 'Customers can directly call this number'}
                  </p>
                </div>
              )}
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

          {/* Font Picker Section */}
          <AccordionSection
            title={language === 'bn' ? 'ফন্ট' : 'Typography'}
            icon={Settings}
            isOpen={openSection === 'font'}
            onToggle={() => setOpenSection(openSection === 'font' ? '' : 'font')}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                // English Fonts
                { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", preview: 'Modern' },
                { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", preview: 'Friendly' },
                { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", preview: 'Classic' },
                { id: 'playfair', name: 'Playfair', family: "'Playfair Display', serif", preview: 'Elegant' },
                { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", preview: 'Bold' },
                // Bengali Fonts
                { id: 'hind-siliguri', name: 'Hind Siliguri', family: "'Hind Siliguri', sans-serif", preview: 'বাংলা UI' },
                { id: 'noto-sans-bengali', name: 'Noto Sans Bengali', family: "'Noto Sans Bengali', sans-serif", preview: 'বাংলা Sans' },
                { id: 'noto-serif-bengali', name: 'Noto Serif Bengali', family: "'Noto Serif Bengali', serif", preview: 'বাংলা Serif' },
                { id: 'baloo-da', name: 'Baloo Da 2', family: "'Baloo Da 2', cursive", preview: 'বাংলা Display' },
                { id: 'tiro-bangla', name: 'Tiro Bangla', family: "'Tiro Bangla', serif", preview: 'বাংলা Literary' },
                { id: 'anek-bangla', name: 'Anek Bangla', family: "'Anek Bangla', sans-serif", preview: 'বাংলা Modern' },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setFontFamily(font.id)}
                  className={`p-2 rounded-lg border text-left transition ${
                    fontFamily === font.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <span className="block text-sm font-medium text-gray-900" style={{ fontFamily: font.family }}>
                    {font.name}
                  </span>
                  <span className="text-xs text-gray-500">{font.preview}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* Custom CSS Section */}
          <AccordionSection
            title={language === 'bn' ? 'কাস্টম CSS' : 'Custom CSS'}
            icon={Settings}
            isOpen={openSection === 'css'}
            onToggle={() => setOpenSection(openSection === 'css' ? '' : 'css')}
          >
            <div className="space-y-3">
              <textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder="/* Your custom CSS */
.hero { background: red; }
.cta-button { border-radius: 20px; }"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
              />
              <p className="text-xs text-gray-500">
                {language === 'bn' 
                  ? '⚠️ ভুল CSS লেআউট ভেঙে দিতে পারে' 
                  : '⚠️ Invalid CSS may break layout'}
              </p>
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
              {previewDevice === 'mobile' && '📱 375 × 667'}
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
                width: previewDevice === 'mobile' ? '375px' : '768px',
                height: previewDevice === 'mobile' ? '667px' : '1024px',
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
