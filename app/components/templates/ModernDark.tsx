/**
 * Modern Dark Template - High Converting Sales Page
 * 
 * ID: 'modern-dark'
 * Style: Bold fonts, urgency colors (Red/Orange), dark gradients
 */

import { useState, useEffect } from 'react';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import type { TemplateProps } from '~/templates/registry';
import { getButtonStyles } from './theme-utils';
import { MODERN_DARK_THEME, applyCustomColors } from './sections/types';

export function ModernDarkTemplate({
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

  const theme = applyCustomColors(MODERN_DARK_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  const modernDarkOrder = editableConfig.sectionOrder || [
    'modern-dark-hero',
    'guarantee',
    'features',
    'gallery',
    'testimonials',
    'faq',
    'order-form'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white selection:bg-orange-500/30">
      {/* Urgency Bar */}
      {editableConfig.urgencyText && (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-bold animate-pulse sticky top-0 z-[60]">
          🔥 {editableConfig.urgencyText}
        </div>
      )}

      <SectionRenderer
        sectionOrder={modernDarkOrder}
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
        onUpdate={handleSectionUpdate}
      />

      {/* Sticky Mobile Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 animate-in fade-in slide-in-from-bottom duration-500">
        <button
          onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={getButtonStyles(theme.primary)}
        >
          🛒 অর্ডার করুন - {formatPrice(product.price)}
        </button>
      </div>

      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-bold text-xl mb-2">{storeName}</p>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} All Rights Reserved.</p>
          
          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-10 pt-6 border-t border-gray-900 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=modern-dark-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-500">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
