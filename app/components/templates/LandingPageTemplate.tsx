/**
 * Landing Page Template - High Converting Sales Page
 * 
 * Direct Response style with:
 * - Bold fonts, urgency colors (Red/Orange)
 * - Sticky mobile footer with CTA
 * - Inline order form (Cash on Delivery)
 * - useFetcher for AJAX submission
 * - Video embed support (YouTube/Vimeo)
 * - NO header navigation - clean, focused design
 * - Rich content sections for conversion
 */

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Helper function to convert Vimeo URL to embed URL
function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

// ============================================================================
// TEMPLATE THEME CONFIGURATIONS
// Each template has unique colors, backgrounds, and styling
// ============================================================================
interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgAccent: string;
  textPrimary: string;
  textSecondary: string;
  ctaBg: string;
  ctaText: string;
  urgencyBg: string;
  cardBg: string;
  cardBorder: string;
  footerBg: string;
  footerText: string;
  isDark: boolean;
}

const TEMPLATE_THEMES: Record<string, ThemeColors> = {
  'modern-dark': {
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    bgAccent: 'bg-gradient-to-r from-orange-500 to-red-500',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    ctaBg: 'bg-gradient-to-r from-orange-500 to-red-600',
    ctaText: 'text-white',
    urgencyBg: 'bg-gradient-to-r from-red-600 to-orange-500',
    cardBg: 'bg-gray-800',
    cardBorder: 'border-gray-700',
    footerBg: 'bg-black',
    footerText: 'text-gray-400',
    isDark: true,
  },
  'minimal-light': {
    bgPrimary: 'bg-white',
    bgSecondary: 'bg-gray-50',
    bgAccent: 'bg-gray-900',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    ctaBg: 'bg-gray-900 hover:bg-gray-800',
    ctaText: 'text-white',
    urgencyBg: 'bg-gray-900',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-200',
    footerBg: 'bg-gray-900',
    footerText: 'text-gray-400',
    isDark: false,
  },
  'video-focus': {
    bgPrimary: 'bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900',
    bgSecondary: 'bg-purple-800/50',
    bgAccent: 'bg-gradient-to-r from-pink-500 to-purple-600',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-200',
    ctaBg: 'bg-gradient-to-r from-pink-500 to-purple-600',
    ctaText: 'text-white',
    urgencyBg: 'bg-gradient-to-r from-pink-600 to-purple-600',
    cardBg: 'bg-white/10 backdrop-blur-sm',
    cardBorder: 'border-white/20',
    footerBg: 'bg-black',
    footerText: 'text-gray-400',
    isDark: true,
  },
};

// Get theme or default to minimal-light
function getTheme(templateId?: string): ThemeColors {
  return TEMPLATE_THEMES[templateId || 'minimal-light'] || TEMPLATE_THEMES['minimal-light'];
}

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { MagicSectionWrapper } from '~/components/editor';
import { ChatWidget } from '~/components/ai/ChatWidget';
import { BD_DIVISIONS, calculateShipping, DEFAULT_SHIPPING_CONFIG, type DivisionValue } from '~/utils/shipping';
import { CountdownTimer, StockCounter, SocialProofPopup, WhatsAppOrderButton } from '~/components/landing';
import { WhatsAppButton } from '~/components/WhatsAppButton';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

// Serialized product type (JSON dates become strings)
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
}

interface LandingPageTemplateProps {
  storeName: string;
  storeId?: number;
  product: SerializedProduct;
  config: LandingConfig;
  currency: string;
  isPreview?: boolean; // When true, disables form submission and shows preview mode
  isEditMode?: boolean; // When true, enables Magic Editor hover overlays
  isCustomerAiEnabled?: boolean; // When true, shows AI Sales Agent chatbot
  onConfigChange?: (newConfig: LandingConfig) => void; // Callback when config changes (for editor wrapper)
}

export function LandingPageTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  isEditMode = false,
  isCustomerAiEnabled = false,
  onConfigChange,
}: LandingPageTemplateProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    error?: string;
    details?: Record<string, string[]>;
  }>();
  

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as DivisionValue,
    quantity: 1,
  });

  // Client-side validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data && !fetcher.data.success;

  // Format price using context (responds to language/currency toggle)
  const formatPrice = useFormatPrice();
  
  // Translation function (responds to language toggle)
  const { t } = useTranslation();

  // Local editable config state - for live updates via Magic Editor
  const [editableConfig, setEditableConfig] = useState(config);
  
  // Update when parent config changes
  useEffect(() => {
    setEditableConfig(config);
  }, [config]);

  // Handler for section updates from Magic Editor
  const handleSectionUpdate = (sectionId: string, newData: unknown) => {
    const newConfig = {
      ...editableConfig,
      [sectionId]: newData,
    };
    setEditableConfig(newConfig);
    // Bubble up to parent editor wrapper if callback provided
    onConfigChange?.(newConfig);
  };

  // Get theme based on templateId
  const theme = getTheme(editableConfig.templateId);

  // Calculate discount
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const subtotal = product.price * formData.quantity;
  const shippingCost = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, subtotal).cost;
  const totalPrice = subtotal + shippingCost;

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate customer name
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'নাম দেওয়া আবশ্যক';
    } else if (formData.customer_name.trim().length < 2) {
      errors.customer_name = 'নাম কমপক্ষে ২ অক্ষর হতে হবে';
    }
    
    // Validate phone
    const bdPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
    } else if (!bdPhoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)';
    }
    
    // Validate shipping address - CRITICAL: Must have address to confirm order
    if (!formData.address.trim()) {
      errors.address = '⚠️ শিপিং ঠিকানা ছাড়া অর্ডার কনফার্ম হবে না!';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'সম্পূর্ণ ঠিকানা দিন (বাড়ি নং, রাস্তা, এলাকা, শহর)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit in preview mode or if storeId is missing
    if (isPreview || !storeId) {
      console.log('Preview mode: form submission disabled');
      return;
    }
    
    // Validate before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.field-error');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    fetcher.submit(
      {
        store_id: storeId,
        product_id: product.id,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        division: formData.division,
        quantity: formData.quantity,
      },
      {
        method: 'POST',
        action: '/api/create-order',
        encType: 'application/json',
      }
    );
  };

  // Redirect to thank-you page on success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      window.location.href = `/thank-you/${fetcher.data.orderId}`;
    }
  }, [fetcher.data]);

  return (
    <div className={`min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium rounded-full shadow-lg animate-pulse">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Mode Active
        </div>
      )}

      {/* Urgency Bar */}
      {editableConfig.urgencyText && (
        <div className={`${theme.urgencyBg} text-white text-center py-3 px-4`}>
          <p className="text-sm md:text-base font-bold">
            🔥 {editableConfig.urgencyText} 🔥
          </p>
        </div>
      )}

      {/* Countdown Timer */}
      {editableConfig.countdownEnabled && editableConfig.countdownEndTime && (
        <div className={`py-6 ${theme.bgSecondary}`}>
          <CountdownTimer
            endDate={editableConfig.countdownEndTime}
            variant="banner"
          />
        </div>
      )}

      {/* ============================================ */}
      {/* SECTION 1: Hero Section */}
      {/* ============================================ */}
      <MagicSectionWrapper
        sectionId="hero"
        sectionLabel="Hero & Headlines"
        data={{ headline: editableConfig.headline, subheadline: editableConfig.subheadline, ctaText: editableConfig.ctaText, ctaSubtext: editableConfig.ctaSubtext }}
        onUpdate={(newData) => {
          const heroData = newData as { headline?: string; subheadline?: string; ctaText?: string; ctaSubtext?: string };
          setEditableConfig(prev => ({
            ...prev,
            headline: heroData.headline || prev.headline,
            subheadline: heroData.subheadline || prev.subheadline,
            ctaText: heroData.ctaText || prev.ctaText,
            ctaSubtext: heroData.ctaSubtext || prev.ctaSubtext,
          }));
        }}
        isEditable={isEditMode}
      >
        <section className={`${theme.isDark ? '' : 'bg-gradient-to-b from-gray-50 to-white'} py-12 lg:py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Store Badge */}
            <div className="text-center mb-8">
              <span className={`inline-flex items-center gap-2 px-4 py-2 ${theme.isDark ? 'bg-white/10 text-white' : 'bg-orange-100 text-orange-700'} rounded-full text-sm font-semibold`}>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {storeName}
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black text-center ${theme.textPrimary} mb-6 leading-tight`}>
              {editableConfig.headline}
            </h1>
            
            {editableConfig.subheadline && (
              <p className={`text-xl md:text-2xl ${theme.textSecondary} text-center mb-12 max-w-3xl mx-auto`}>
                {editableConfig.subheadline}
              </p>
            )}

            {/* Product Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
              {/* Product Image */}
              <div className="relative">
                {discount > 0 && (
                  <div className={`absolute top-4 left-4 z-10 ${theme.ctaBg} text-white px-5 py-2 rounded-full font-bold text-lg shadow-lg`}>
                    {discount}% ছাড়!
                  </div>
                )}
                
                <div className={`aspect-square rounded-3xl overflow-hidden ${theme.isDark ? 'bg-gray-800' : 'bg-gray-100'} shadow-2xl border-4 ${theme.isDark ? 'border-gray-700' : 'border-white'}`}>
                  {product.imageUrl ? (
                    <OptimizedImage
                      src={product.imageUrl}
                      alt={product.title}
                      width={700}
                      height={700}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <span className="text-9xl">📦</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <h2 className={`text-3xl md:text-4xl font-bold ${theme.textPrimary}`}>{product.title}</h2>
                
                {product.description && (
                  <p className={`${theme.textSecondary} text-lg leading-relaxed`}>
                    {product.description}
                  </p>
                )}

                {/* Price Display */}
                <div className={`${theme.isDark ? 'bg-white/10' : 'bg-gradient-to-r from-emerald-50 to-green-50'} rounded-2xl p-6 border ${theme.isDark ? 'border-white/20' : 'border-emerald-200'}`}>
                  <div className="flex items-end gap-4 flex-wrap">
                    <span className={`text-5xl md:text-6xl font-black ${theme.isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className={`text-2xl ${theme.isDark ? 'text-gray-400' : 'text-gray-400'} line-through mb-2`}>
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className={`${theme.isDark ? 'text-emerald-400' : 'text-emerald-700'} font-semibold mt-2`}>
                      আপনি সেভ করছেন: {formatPrice(product.compareAtPrice! - product.price)}
                    </p>
                  )}
                </div>

                {/* Social Proof */}
                {editableConfig.socialProof && (
                  <div className={`flex items-center gap-4 ${theme.isDark ? 'bg-white/10 border-white/20' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4`}>
                    <div className="text-yellow-500 text-2xl">{'★'.repeat(5)}</div>
                    <p className={theme.textSecondary}>
                      <strong className={`${theme.textPrimary} text-xl`}>{editableConfig.socialProof.count}+</strong> {editableConfig.socialProof.text}
                    </p>
                  </div>
                )}

                {/* Desktop Order Button - Scroll to Form */}
                <div className="hidden lg:block">
                  <a
                    href="#order-form"
                    className={`block w-full py-5 px-8 ${theme.ctaBg} ${theme.ctaText} text-2xl font-bold rounded-2xl shadow-xl transition transform hover:scale-[1.02] text-center`}
                  >
                    🛒 {editableConfig.ctaText || 'এখনই অর্ডার করুন'} - {formatPrice(product.price)}
                  </a>
                  {editableConfig.ctaSubtext && (
                    <p className={`text-center ${theme.textSecondary} text-sm mt-3`}>
                      ✓ {editableConfig.ctaSubtext}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </MagicSectionWrapper>

      {/* ============================================ */}
      {/* SECTION 2: Trust Badges */}
      {/* ============================================ */}
      <section className={`py-12 ${theme.bgSecondary} border-y ${theme.cardBorder}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
              <div className="text-4xl mb-3">🚚</div>
              <h4 className={`font-bold ${theme.textPrimary}`}>{t('freeDelivery')}</h4>
              <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('freeDeliveryInDhaka')}</p>
            </div>
            <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
              <div className="text-4xl mb-3">💯</div>
              <h4 className={`font-bold ${theme.textPrimary}`}>{t('originalProduct')}</h4>
              <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('originalGuarantee')}</p>
            </div>
            <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
              <div className="text-4xl mb-3">💵</div>
              <h4 className={`font-bold ${theme.textPrimary}`}>{t('cashOnDelivery')}</h4>
              <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('payOnReceive')}</p>
            </div>
            <div className={`text-center p-6 ${theme.cardBg} ${theme.cardBorder} border rounded-2xl`}>
              <div className="text-4xl mb-3">🔄</div>
              <h4 className={`font-bold ${theme.textPrimary}`}>{t('easyReturn')}</h4>
              <p className={`text-sm ${theme.textSecondary} mt-1`}>{t('returnPolicy')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: Why Choose Us */}
      {/* ============================================ */}
      <section className={`py-16 ${theme.isDark ? theme.bgSecondary : 'bg-gradient-to-b from-orange-50 to-white'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} mb-4`}>
              {t('whyChooseUs')}
            </h2>
            <p className={`text-xl ${theme.textSecondary}`}>{t('weEnsureSatisfaction')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${theme.cardBg} rounded-3xl p-8 shadow-lg border ${theme.cardBorder}`}>
              <div className={`w-16 h-16 ${theme.isDark ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                ✨
              </div>
              <h3 className={`text-xl font-bold ${theme.textPrimary} mb-3`}>{t('premiumQuality')}</h3>
              <p className={theme.textSecondary}>
                {t('premiumQualityDesc')}
              </p>
            </div>
            <div className={`${theme.cardBg} rounded-3xl p-8 shadow-lg border ${theme.cardBorder}`}>
              <div className={`w-16 h-16 ${theme.isDark ? 'bg-green-500/20' : 'bg-green-100'} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                ⚡
              </div>
              <h3 className={`text-xl font-bold ${theme.textPrimary} mb-3`}>{t('fastDelivery')}</h3>
              <p className={theme.textSecondary}>
                {t('fastDeliveryDesc')}
              </p>
            </div>
            <div className={`${theme.cardBg} rounded-3xl p-8 shadow-lg border ${theme.cardBorder}`}>
              <div className={`w-16 h-16 ${theme.isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                📞
              </div>
              <h3 className={`text-xl font-bold ${theme.textPrimary} mb-3`}>{t('support247')}</h3>
              <p className={theme.textSecondary}>
                {t('support247Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: Features (from config) */}
      {/* ============================================ */}
      {editableConfig.features && editableConfig.features.length > 0 && 
       isSectionVisible('features', editableConfig.hiddenSections) && (
        <MagicSectionWrapper
          sectionId="features"
          sectionLabel="Product Features"
          data={editableConfig.features}
          onUpdate={(newData) => handleSectionUpdate('features', newData)}
          isEditable={isEditMode}
        >
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  {t('productFeatures')}
                </h2>
                <p className="text-xl text-gray-600">{t('whyThisProductSpecial')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editableConfig.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{feature.title}</h4>
                      {feature.description && (
                        <p className="text-gray-600 mt-1">{feature.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MagicSectionWrapper>
      )}

      {/* ============================================ */}
      {/* SECTION 5: Video Embed */}
      {/* ============================================ */}
      {editableConfig.videoUrl && isSectionVisible('video', editableConfig.hiddenSections) && (
        <MagicSectionWrapper
          sectionId="video"
          sectionLabel="Video Section"
          data={{ videoUrl: editableConfig.videoUrl }}
          onUpdate={(newData) => {
            const videoData = newData as { videoUrl?: string };
            if (videoData.videoUrl) {
              handleSectionUpdate('videoUrl', videoData.videoUrl);
            }
          }}
          isEditable={isEditMode}
        >
          <section className="py-16 bg-gray-900">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  🎬 {t('watchInVideo')}
                </h2>
                <p className="text-xl text-gray-400">{t('watchVideoDetails')}</p>
              </div>
              
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
                {editableConfig.videoUrl.includes('youtube.com') || editableConfig.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={getYouTubeEmbedUrl(editableConfig.videoUrl)}
                    title="Product Video"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : editableConfig.videoUrl.includes('vimeo.com') ? (
                  <iframe
                    src={getVimeoEmbedUrl(editableConfig.videoUrl)}
                    title="Product Video"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={editableConfig.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </section>
        </MagicSectionWrapper>
      )}

      {/* ============================================ */}
      {/* SECTION 6: How to Order */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('howToOrder')}
            </h2>
            <p className="text-xl text-gray-600">{t('justThreeSteps')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                ১
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepOne')}</h3>
              <p className="text-gray-600">
                {t('stepOneDesc')}
              </p>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                ২
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepTwo')}</h3>
              <p className="text-gray-600">
                {t('stepTwoDesc')}
              </p>
            </div>
            <div className="relative text-center">
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                ৩
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepThree')}</h3>
              <p className="text-gray-600">
                {t('stepThreeDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: Testimonials (Photo-focused) */}
      {/* ============================================ */}
      {editableConfig.testimonials && editableConfig.testimonials.length > 0 && 
       editableConfig.testimonials.some(t => t.imageUrl || t.text) &&
       isSectionVisible('testimonials', editableConfig.hiddenSections) && (
        <MagicSectionWrapper
          sectionId="testimonials"
          sectionLabel="Testimonials"
          data={editableConfig.testimonials}
          onUpdate={(newData) => handleSectionUpdate('testimonials', newData)}
          isEditable={isEditMode}
        >
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  {t('customerReviews')}
                </h2>
                <p className="text-xl text-gray-600">{t('seeWhatTheySay')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {editableConfig.testimonials
                  .filter(t => t.imageUrl || t.text) // Only show testimonials with image or text
                  .map((testimonial, i) => (
                  <div key={i} className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                    {/* Customer Photo - Main Focus */}
                    {testimonial.imageUrl && (
                      <div className="aspect-square w-full overflow-hidden">
                        <img 
                          src={testimonial.imageUrl} 
                          alt={`${testimonial.name}'s review`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Customer Info Footer */}
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-yellow-500 text-lg mb-2">
                        {'★'.repeat(5)}
                      </div>
                      {testimonial.text && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">"{testimonial.text}"</p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                          <p className="text-xs text-gray-500">সন্তুষ্ট গ্রাহক ✓</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MagicSectionWrapper>
      )}

      {/* ============================================ */}
      {/* SECTION 8: Delivery Information */}
      {/* ============================================ */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('deliveryInfo')}
            </h2>
            <p className="text-xl text-gray-600">{t('whenWillYouGet')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🏙️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('insideDhaka')}</h3>
                  <p className="text-green-600 font-semibold">{t('within24Hours')}</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t('deliveryCharge')}: ৳৬০
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t('onTimeDelivery')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t('cashOnDelivery')}
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🌍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('outsideDhaka')}</h3>
                  <p className="text-blue-600 font-semibold">{t('twoToThreeDays')}</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> {t('deliveryCharge')}: ৳১২০
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> {t('nationwideDelivery')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> {t('courierService')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 9: FAQ (Custom or Default) */}
      {/* ============================================ */}
      {isSectionVisible('faq', editableConfig.hiddenSections) && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                {t('faq')}
              </h2>
              <p className="text-xl text-gray-600">{t('yourQuestionAnswers')}</p>
            </div>
            
            <div className="space-y-4">
              {/* Use custom FAQs from config if available, otherwise use defaults */}
              {(editableConfig.faq && editableConfig.faq.length > 0 
                ? editableConfig.faq.map(f => ({ q: f.question, a: f.answer }))
                : [
                    { q: t('faqDeliveryQ'), a: t('faqDeliveryA') },
                    { q: t('faqPaymentQ'), a: t('faqPaymentA') },
                    { q: t('faqOriginalQ'), a: t('faqOriginalA') },
                    { q: t('faqReturnQ'), a: t('faqReturnA') },
                    { q: t('faqChargeQ'), a: t('faqChargeA') },
                    { q: t('faqConfirmQ'), a: t('faqConfirmA') },
                  ]
              ).map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 flex items-start gap-3">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      ?
                    </span>
                    {faq.q}
                  </h4>
                  <p className="text-gray-600 mt-3 ml-11">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* SECTION 10: Guarantee */}
      {/* ============================================ */}
      {editableConfig.guaranteeText && (
        <MagicSectionWrapper
          sectionId="guarantee"
          sectionLabel="Guarantee Section"
          data={{ guaranteeText: editableConfig.guaranteeText }}
          onUpdate={(newData) => {
            const guaranteeData = newData as { guaranteeText?: string };
            if (guaranteeData.guaranteeText) {
              handleSectionUpdate('guaranteeText', guaranteeData.guaranteeText);
            }
          }}
          isEditable={isEditMode}
        >
          <section className="py-16 bg-emerald-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500 text-white rounded-full text-5xl mb-6 shadow-lg">
                🛡️
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                {t('ourGuarantee')}
              </h2>
              <p className="text-2xl text-emerald-700 font-semibold mb-4">
                {editableConfig.guaranteeText}
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('guaranteeDesc')}
              </p>
            </div>
          </section>
        </MagicSectionWrapper>
      )}

      {/* ============================================ */}
      {/* SECTION 11: Final CTA */}
      {/* ============================================ */}
      <MagicSectionWrapper
        sectionId="cta"
        sectionLabel="Final CTA"
        data={{ urgencyText: editableConfig.urgencyText }}
        onUpdate={(newData) => {
          const ctaData = newData as { urgencyText?: string };
          if (ctaData.urgencyText) {
            handleSectionUpdate('urgencyText', ctaData.urgencyText);
          }
        }}
        isEditable={isEditMode}
      >
        <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              {t('whyDelay')}
            </h2>
            <p className="text-xl text-orange-100 mb-4">
              {t('limitedTimeOffer')}
            </p>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <p className="text-white text-lg mb-2">{t('specialPrice')}</p>
              <p className="text-5xl font-black text-white">{formatPrice(product.price)}</p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-orange-200 line-through text-xl mt-2">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            </div>
            <div>
              <a
                href="#order-form"
                className="inline-flex items-center gap-3 px-12 py-6 bg-white hover:bg-gray-100 text-orange-600 text-2xl font-black rounded-2xl shadow-2xl transition transform hover:scale-105"
              >
                🛒 {t('orderNowBtn')}
              </a>
            </div>
          </div>
        </section>
      </MagicSectionWrapper>

      {/* ============================================ */}
      {/* SECTION 12: Contact Info */}
      {/* ============================================ */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">📞</div>
              <h4 className="font-bold text-lg mb-2">{t('callUs')}</h4>
              <p className="text-gray-400">{t('callHours')}</p>
            </div>
            <div>
              <div className="text-3xl mb-3">💬</div>
              <h4 className="font-bold text-lg mb-2">{t('messageUs')}</h4>
              <p className="text-gray-400">{t('viaMessenger')}</p>
            </div>
            <div>
              <div className="text-3xl mb-3">📧</div>
              <h4 className="font-bold text-lg mb-2">{t('emailUs')}</h4>
              <p className="text-gray-400">{t('replyIn24Hours')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 13: Order Form Section (Inline) - Full Width 2-Column */}
      {/* ============================================ */}
      <section id="order-form" className="py-16 bg-gradient-to-b from-gray-50 to-white scroll-mt-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              📝 {t('orderFormTitle')}
            </h2>
            <p className="text-xl text-gray-600">{t('fillFormWeContact')}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100">
            {isSuccess ? (
              // Success Message
              <div className="text-center py-12">
                <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-6xl text-white">
                  ✓
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-emerald-600 mb-4">
                  {t('orderComplete')}
                </h3>
                <p className="text-gray-600 mb-6 text-xl">
                  {t('orderNumberLabel')} <strong className="text-gray-900">{fetcher.data?.orderNumber}</strong>
                </p>
                <p className="text-gray-500 mb-8 text-lg">
                  {t('teamWillContact')}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition"
                >
                  {t('newOrder')}
                </button>
              </div>
            ) : (
              // Order Form - 2 Column Layout
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Product Info & Quantity */}
                <div className="space-y-6">
                  {/* Product Summary */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {product.imageUrl ? (
                          <OptimizedImage
                            src={product.imageUrl}
                            alt={product.title}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-xl">{product.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-emerald-600 font-black text-3xl">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-gray-400 line-through text-lg">{formatPrice(product.compareAtPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {discount > 0 && (
                      <div className="bg-red-500 text-white text-center py-2 rounded-lg font-bold">
                        🎉 {discount}% ছাড়ে পাচ্ছেন! সেভ করছেন {formatPrice(product.compareAtPrice! - product.price)}
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">{t('selectQuantity')}</label>
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => setFormData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))}
                        className="w-14 h-14 bg-white hover:bg-gray-100 rounded-xl text-2xl font-bold transition shadow-sm border border-gray-200"
                      >
                        -
                      </button>
                      <span className="text-3xl font-black w-16 text-center text-gray-900">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(d => ({ ...d, quantity: Math.min(10, d.quantity + 1) }))}
                        className="w-14 h-14 bg-white hover:bg-gray-100 rounded-xl text-2xl font-bold transition shadow-sm border border-gray-200"
                      >
                        +
                      </button>
                      <div className="ml-auto text-right">
                        <p className="text-sm text-gray-500">{t('totalPrice')}</p>
                        <span className="text-emerald-600 font-black text-3xl">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">💵</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-lg">{t('cashOnDelivery')}</p>
                        <p className="text-sm text-gray-600">{t('payOnReceive')}</p>
                    </div>
                    <span className="ml-auto text-emerald-600 text-2xl">✓</span>
                  </div>

                  {/* Trust Badges - Desktop Only */}
                  <div className="hidden lg:grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <span className="text-2xl">🚚</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t('fastDelivery')}</p>
                        <p className="text-xs text-gray-500">{t('within24Hours')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <span className="text-2xl">🔄</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t('easyReturn')}</p>
                        <p className="text-xs text-gray-500">{t('returnPolicy')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Customer Info Form */}
                <div>
                  {/* Error Display */}
                  {hasError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                      <p className="font-bold">{fetcher.data?.error}</p>
                      {fetcher.data?.details && (
                        <ul className="text-sm mt-2 list-disc list-inside">
                          {Object.entries(fetcher.data.details).map(([field, errors]) => (
                            <li key={field}>{field}: {errors.join(', ')}</li>
                          ))}
                        </ul>
                      )}
                      {/* Debug info for troubleshooting */}
                      {(fetcher.data as { debug?: string })?.debug && (
                        <div className="mt-3 p-2 bg-red-100 rounded text-xs font-mono">
                          <p><strong>Debug:</strong> {(fetcher.data as { debug?: string }).debug}</p>
                          {(fetcher.data as { debugType?: string })?.debugType && (
                            <p><strong>Type:</strong> {(fetcher.data as { debugType?: string }).debugType}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📋</span> {t('deliveryInfoTitle')}
                    </h3>

                    {/* Name */}
                    <div className={validationErrors.customer_name ? 'field-error' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('yourNameLabel')}</label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={formData.customer_name}
                        onChange={(e) => {
                          setFormData(d => ({ ...d, customer_name: e.target.value }));
                          if (validationErrors.customer_name) {
                            setValidationErrors(v => ({ ...v, customer_name: '' }));
                          }
                        }}
                        placeholder={t('enterFullName')}
                        className={`w-full px-5 py-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg ${
                          validationErrors.customer_name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {validationErrors.customer_name && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.customer_name}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className={validationErrors.phone ? 'field-error' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('mobileNumberLabel')}</label>
                      <input
                        type="tel"
                        required
                        minLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData(d => ({ ...d, phone: e.target.value }));
                          if (validationErrors.phone) {
                            setValidationErrors(v => ({ ...v, phone: '' }));
                          }
                        }}
                        placeholder="০১XXXXXXXXX"
                        className={`w-full px-5 py-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg ${
                          validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.phone}</p>
                      )}
                    </div>

                    {/* Division Selector - Inside/Outside Dhaka */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">🗺️ ডেলিভারি এলাকা</label>
                      <select
                        value={formData.division}
                        onChange={(e) => setFormData(d => ({ ...d, division: e.target.value as DivisionValue }))}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                      >
                        {BD_DIVISIONS.map((div) => (
                          <option key={div.value} value={div.value}>
                            {div.label}
                          </option>
                        ))}
                      </select>
                      {/* Shipping cost preview */}
                      {(() => {
                        const shippingResult = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, product.price * formData.quantity);
                        const divInfo = BD_DIVISIONS.find(d => d.value === formData.division);
                        return (
                          <div className={`mt-3 p-3 rounded-lg flex items-center justify-between ${divInfo?.isInsideDhaka ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{divInfo?.isInsideDhaka ? '🏙️' : '🌍'}</span>
                              <div>
                                <p className={`text-sm font-medium ${divInfo?.isInsideDhaka ? 'text-green-700' : 'text-blue-700'}`}>
                                  {divInfo?.isInsideDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {divInfo?.isInsideDhaka ? '২৪ ঘণ্টায় ডেলিভারি' : '২-৩ দিনে ডেলিভারি'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">ডেলিভারি চার্জ</p>
                              <p className={`font-bold ${shippingResult.isFree ? 'text-green-600' : 'text-gray-900'}`}>
                                {shippingResult.isFree ? 'ফ্রি!' : `৳${shippingResult.cost}`}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Address - CRITICAL FIELD */}
                    <div className={validationErrors.address ? 'field-error' : ''}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📍 {t('shippingAddressLabel')} <span className="text-red-500 text-xs">{t('requiredField')}</span>
                      </label>
                      <textarea
                        required
                        minLength={10}
                        rows={4}
                        value={formData.address}
                        onChange={(e) => {
                          setFormData(d => ({ ...d, address: e.target.value }));
                          if (validationErrors.address) {
                            setValidationErrors(v => ({ ...v, address: '' }));
                          }
                        }}
                        placeholder={t('addressPlaceholder')}
                        className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg resize-none ${
                          validationErrors.address 
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {validationErrors.address ? (
                        <p className="text-red-600 text-sm mt-1 font-bold flex items-center gap-1">
                          <span>⚠️</span> {validationErrors.address}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">{t('addressHelp')}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white text-2xl font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02]"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('pleaseWait')}
                        </span>
                      ) : (
                        `✓ ${t('confirmOrderBtn')} - ${formatPrice(totalPrice)}`
                      )}
                    </button>

                    <p className="text-center text-gray-500 text-sm">
                      🔒 {t('infoSecure')}
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Sticky Footer - Scroll to Form */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${theme.isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t p-4 shadow-2xl safe-area-pb`}>
        <a
          href="#order-form"
          className={`w-full py-4 ${theme.ctaBg} ${theme.ctaText} text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3`}
        >
          <span className="text-2xl">🛒</span>
          {editableConfig.ctaText || 'অর্ডার করুন'} - {formatPrice(product.price)}
        </a>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="lg:hidden h-24" />

      {/* Footer */}
      <footer className={`${theme.footerBg} ${theme.footerText} py-8 border-t ${theme.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-semibold text-white mb-2">{storeName}</p>
          <p className="text-sm mb-4">© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          {/* Policy Links */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="/policies/privacy" className="hover:text-white transition">Privacy Policy</a>
            <span className="opacity-50">•</span>
            <a href="/policies/terms" className="hover:text-white transition">Terms of Service</a>
            <span className="opacity-50">•</span>
            <a href="/policies/refund" className="hover:text-white transition">Refund Policy</a>
          </div>
        </div>
      </footer>

      {/* AI Sales Agent Widget - Temporarily disabled */}
      {/* {isCustomerAiEnabled && storeId && (
        <ChatWidget 
          mode="customer" 
          storeId={storeId}
          accentColor="#f97316"
        />
      )} */}

      {/* Social Proof Popup - Shows "X just ordered" notifications */}
      {editableConfig.showSocialProof && (
        <SocialProofPopup
          productName={product.title}
          interval={editableConfig.socialProofInterval || 15}
        />
      )}

      {/* WhatsApp Floating Button - Shows on all devices */}
      {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
        <WhatsAppButton
          phoneNumber={editableConfig.whatsappNumber}
          message={editableConfig.whatsappMessage || `হ্যালো, আমি ${product.title} প্রোডাক্টটি সম্পর্কে জানতে চাই।`}
          storeName={storeName}
        />
      )}
    </div>
  );
}
