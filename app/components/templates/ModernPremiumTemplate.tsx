/**
 * Modern Premium Template - High-End Conversational Sales Page
 * 
 * ID: 'modern-premium'
 * Style: Glassmorphism, premium typography, dark/light toggle support
 */

import { useState, useEffect } from 'react';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import type { TemplateProps } from '~/templates/registry';
import { MODERN_PREMIUM_THEME, applyCustomColors } from './sections/types';

export function ModernPremiumTemplate({
  storeName,
  storeId,
  product,
  config,
  onConfigChange,
  isPreview,
  planType = 'free',
}: TemplateProps) {
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

  const theme = applyCustomColors(MODERN_PREMIUM_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  const modernPremiumOrder = editableConfig.sectionOrder || [
    'hero',
    'trust',
    'features',
    'gallery',
    'testimonials',
    'faq',
    'order-form'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white selection:bg-blue-500/30">
      {/* Premium Announcement Bar */}
      {editableConfig.urgencyText && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 px-4 text-xs font-black uppercase tracking-widest sticky top-0 z-[60] shadow-lg">
          ✨ {editableConfig.urgencyText}
        </div>
      )}

      <SectionRenderer
        sectionOrder={modernPremiumOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={(product as any).variants || []}
        orderBumps={(editableConfig as any).orderBumps || []}
        currency={(product as any).currency || 'BDT'}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
        templateId="modern-premium"
        onUpdate={handleSectionUpdate}
      />

      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-black py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-black text-2xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">{storeName}</p>
          <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} Quality Experience. All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-900 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=modern-premium-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span>Built on</span>
                <span className="font-bold tracking-tight text-sm text-gray-600 dark:text-gray-400">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
