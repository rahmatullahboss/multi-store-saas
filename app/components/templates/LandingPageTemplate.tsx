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

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { LandingConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { Phone } from 'lucide-react';
import { FloatingButtons } from './FloatingButtons';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { SectionRenderer } from './SectionRenderer';
import { CountdownTimer } from '~/components/landing';
import { 
  ThemeConfig, 
  MODERN_DARK_THEME, 
  MINIMAL_LIGHT_THEME, 
  VIDEO_FOCUS_THEME,
  applyCustomColors 
} from './sections/types';

// ============================================================================
// TEMPLATE THEME CONFIGURATIONS - Using preset themes from types.ts
// ============================================================================
const TEMPLATE_THEMES: Record<string, ThemeConfig> = {
  'modern-dark': MODERN_DARK_THEME,
  'minimal-light': MINIMAL_LIGHT_THEME,
  'video-focus': VIDEO_FOCUS_THEME,
};

// Get theme or default to minimal-light
function getTheme(templateId?: string): ThemeConfig {
  return TEMPLATE_THEMES[templateId || 'minimal-light'] || TEMPLATE_THEMES['minimal-light'];
}


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
  // Product variants for variant selection
  productVariants?: Array<{
    id: number;
    option1Name: string | null;
    option1Value: string | null;
    option2Name: string | null;
    option2Value: string | null;
    price: number | null;
    inventory: number | null;
    isAvailable: boolean | null;
  }>;
  // Order Bumps - add-on offers during checkout
  orderBumps?: Array<{
    id: number;
    title: string;
    description?: string | null;
    discount: number;
    bumpProduct: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string | null;
    };
  }>;
  planType?: string;
  // Custom HTML sections
  customSections?: Array<{
    id: string;
    name: string;
    html: string;
    css?: string;
    position?: string;
  }>;
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
  productVariants = [],
  orderBumps = [],
  planType = 'free',
  customSections = [],
}: LandingPageTemplateProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = (fetcher.data as any)?.success;
  const hasError = (fetcher.data as any) && !(fetcher.data as any).success;

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

  // Custom colors from config (overrides theme defaults)
  const ctaButtonStyle = editableConfig.primaryColor 
    ? { backgroundColor: editableConfig.primaryColor } 
    : undefined;

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

      {/* Custom Sections - Before Hero position */}
      <CustomSectionRenderer customSections={customSections} position="before-hero" />

      {/* Dynamic Sections Renderer */}
      <SectionRenderer
        sectionOrder={editableConfig.sectionOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        storeId={storeId}
        isPreview={isPreview}
        isEditMode={isEditMode}
        onUpdate={handleSectionUpdate}
        lang={editableConfig.landingLanguage}
        currency={currency}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={productVariants}
        orderBumps={orderBumps}
        templateId={editableConfig.templateId}
      />

      {/* Mobile Sticky Footer - Scroll to Form */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${theme.isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t p-4 shadow-2xl safe-area-pb`}>
        <a
          href="#order-form"
          className={`w-full py-4 ${ctaButtonStyle ? '' : theme.ctaBg} ${theme.ctaText} text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3`}
          style={ctaButtonStyle}
        >
          <span className="text-2xl">🛒</span>
          {editableConfig.ctaText || 'অর্ডার করুন'} - {formatPrice(product.price)}
        </a>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="lg:hidden h-24" />

      {/* Custom Sections - Before Footer position */}
      <CustomSectionRenderer customSections={customSections} position="before-footer" />

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

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-4 border-t border-gray-100/10 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=landing-page-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-white">Ozzyl</span>
              </a>
            </div>
          )}
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

      {/* Social Proof Popup - REMOVED: Fake buyer notifications are misleading */}

      {/* Floating Action Buttons - WhatsApp and Call */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage || `হ্যালো, আমি ${product.title} প্রোডাক্টটি সম্পর্কে জানতে চাই।`}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
