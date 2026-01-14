
import { useState, useEffect } from 'react';
import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { MODERN_DARK_THEME, applyCustomColors } from './sections/types';
import { FloatingButtons } from './FloatingButtons';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { getButtonStyles } from './theme-utils';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export function ShowcaseTemplate({
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

  const theme = applyCustomColors(MODERN_DARK_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  // Default section order for Showcase if not provided
  const showcaseOrder = editableConfig.sectionOrder || [
    'showcase-hero',
    'showcase-gallery-grid',
    'features',
    'gallery',
    'benefits',
    'comparison',
    'trust',
    'social',
    'testimonials',
    'delivery',
    'faq',
    'guarantee',
    'cta'
  ];

  return (
    <div className="font-sans text-white bg-[#0a0a0a] min-h-screen selection:bg-rose-500 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Manrope:wght@300;400;600;800&display=swap');
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-rose-900/20 border-b border-rose-900/30 text-center py-2 px-4 backdrop-blur-sm">
        <p className="text-rose-200 text-xs md:text-sm tracking-widest uppercase font-medium">
          {editableConfig.urgencyText || "Premium Collection • Limited Stock Available"}
        </p>
      </div>

      <SectionRenderer
        sectionOrder={showcaseOrder}
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
      />

      {/* 6. BRAND FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-12 text-center">
         <div className="container mx-auto px-6">
            <h3 className="font-heading text-2xl text-white mb-4">{storeName}</h3>
            <p className="text-zinc-600 text-sm max-w-md mx-auto mb-8">
               Experience premium quality and exceptional service. 
               We are dedicated to providing you with the best.
            </p>
            
            {/* Social / Contact Links would go here */}
            {editableConfig.whatsappEnabled && editableConfig.whatsappNumber && (
               <a 
                  href={`https://wa.me/${editableConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
               >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight size={14} />
               </a>
            )}
            
            <p className="text-zinc-800 text-xs mt-12">
               &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>

            {/* Viral Loop / Branding */}
            {planType === 'free' && (
              <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-center items-center">
                <a 
                  href="https://ozzyl.com?utm_source=showcase-campaign-branding&utm_medium=referral" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-600 hover:text-rose-500 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
                >
                  <span>Powered by</span>
                  <span className="font-bold tracking-tight text-sm text-zinc-400">Ozzyl</span>
                </a>
              </div>
            )}
         </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 p-4 pb-safe">
        <a
          href="#order-form"
          className="block w-full text-white text-center font-bold py-3 rounded uppercase tracking-wider hover:opacity-90"
          style={getButtonStyles(editableConfig.primaryColor || '#e11d48')}
        >
          Order Now
        </a>
      </div>
      <div className="md:hidden h-20" />

      {/* Floating Action Buttons - WhatsApp and Call */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
