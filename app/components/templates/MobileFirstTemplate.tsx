import { useState, useEffect, useRef } from 'react';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { MOBILE_FIRST_THEME, applyCustomColors } from './sections/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { getButtonStyles } from './theme-utils';
import { FloatingButtons } from './FloatingButtons';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export function MobileFirstTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  isEditMode = false,
  onConfigChange,
  planType = 'free',
}: TemplateProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();

  // Local config state for Magic Editor
  const [editableConfig, setEditableConfig] = useState(config);

  // Update when parent config changes
  useEffect(() => {
    setEditableConfig(config);
  }, [config]);

  // Magic Editor Update Handler
  const handleSectionUpdate = (sectionId: string, newData: unknown) => {
    const newConfig = { ...editableConfig, [sectionId]: newData };
    setEditableConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const theme = applyCustomColors(MOBILE_FIRST_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  const mobileFirstOrder = editableConfig.sectionOrder || [
    'mobile-first-hero',
    'trust',
    'features',
    'video',
    'social',
    'delivery',
    'testimonials',
    'gallery',
    'benefits',
    'comparison',
    'faq',
    'guarantee',
    'cta'
  ];

  // Sticky Footer Logic (Show when form is NOT visible)
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const orderFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide footer when order form comes into view
        setIsFooterVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (orderFormRef.current) {
      observer.observe(orderFormRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-gray-900 bg-white pb-24 md:pb-8 selection:bg-emerald-100 selection:text-emerald-900">
      
      <SectionRenderer
        sectionOrder={mobileFirstOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={(product as any).variants || []}
        orderBumps={(editableConfig as any).orderBumps || []}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
        onUpdate={handleSectionUpdate}
        templateId="mobile-first"
      />

      {/* STICKY FOOTER (Mobile Only Action) */}
      <AnimatePresence>
        {isFooterVisible && (
           <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             exit={{ y: 100 }}
             className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden"
           >
              <div className="flex gap-3">
                 <button 
                    onClick={scrollToOrder}
                    className="flex-1 text-white font-bold text-lg h-[50px] rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                    style={getButtonStyles(editableConfig.primaryColor)}
                 >
                    <span>অর্ডার করুন</span>
                    <span className="bg-emerald-700 px-2 py-0.5 rounded text-sm min-w-[60px]">
                      {formatPrice(product.price)}
                    </span>
                 </button>
                 {editableConfig.callEnabled && editableConfig.callNumber && (
                   <a 
                     href={`tel:${editableConfig.callNumber}`}
                     className="h-[50px] w-[50px] bg-red-100 text-red-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                   >
                     <Phone size={24} />
                   </a>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons - WhatsApp and Call */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800 md:block hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-semibold text-white mb-2">{storeName}</p>
          <p className="text-sm mb-4">© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="/policies/privacy" className="hover:text-white transition">{t('privacyPolicy')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/terms" className="hover:text-white transition">{t('termsOfService')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/refund" className="hover:text-white transition">{t('refundPolicy')}</a>
          </div>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=mobile-first-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-400">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>
      
    </div>
  );
}
