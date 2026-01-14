import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { LandingConfig } from '@db/types';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { PREMIUM_BD_THEME, applyCustomColors } from './sections/types';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import { getGradientButtonStyles } from './theme-utils';
import { ShoppingBag, Star, ChevronRight, Leaf } from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function PremiumBDTemplate({
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
  const fetcher = useFetcher();
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

  const theme = applyCustomColors(PREMIUM_BD_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  // Sticky Footer Visibility
  const [isFooterVisible, setIsFooterVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
      observer.observe(orderForm);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-gray-50 pb-24 md:pb-0 selection:bg-emerald-100 selection:text-emerald-900">
      
      <SectionRenderer
        sectionOrder={editableConfig.sectionOrder}
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
        templateId="premium-bd"
        onUpdate={handleSectionUpdate}
      />

      {/* 6. MOBILE STICKY FOOTER */}
      <AnimatePresence>
        {isFooterVisible && (
          <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             exit={{ y: 100 }}
             className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-2xl z-50 md:hidden flex items-center gap-3 px-4"
          >
             <div className="flex-1">
               <p className="text-xs text-gray-500">সর্বমোট মূল্য</p>
               <p className="text-xl font-bold text-emerald-600 leading-none">{formatPrice(product.price)}</p>
             </div>
             <div>
               <a 
                 href="#order-form"
                 className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30 animate-pulse"
               >
                 অর্ডার করুন
               </a>
             </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
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
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-300">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Floating Action Buttons - WhatsApp and Call */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />

      <style>{`
        @keyframes shimmer {
          100% { left: 100% }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
