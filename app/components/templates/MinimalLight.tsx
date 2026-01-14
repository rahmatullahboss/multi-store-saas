/**
 * Minimal Light Template - Clean & Elegant Sales Page
 * ID: 'minimal-light'
 * Style: White background, centered typography, large hero image
 */

import { useState, useEffect } from 'react';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import type { TemplateProps } from '~/templates/registry';
import { getButtonStyles } from './theme-utils';
import { MINIMAL_LIGHT_THEME, applyCustomColors } from './sections/types';

export function MinimalLightTemplate({
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

  const theme = applyCustomColors(MINIMAL_LIGHT_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  const minimalLightOrder = editableConfig.sectionOrder || [
    'hero',
    'features',
    'social-proof',
    'testimonials',
    'order-form'
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100">
      {/* Urgency Bar */}
      {editableConfig.urgencyText && (
        <div className="bg-emerald-600 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
          ✨ {editableConfig.urgencyText}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-100 py-4 bg-white/80 backdrop-blur-md sticky top-0 lg:top-auto z-50 lg:relative">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl font-bold text-center tracking-tight text-gray-900">{storeName}</h1>
        </div>
      </header>

      <SectionRenderer
        sectionOrder={minimalLightOrder}
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 animate-in fade-in slide-in-from-bottom duration-500">
        <button
          onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={getButtonStyles(theme.primary)}
        >
          <span>অর্ডার করুন</span>
          <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm">
            {formatPrice(product.price)}
          </span>
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
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-900 font-semibold mb-2">{storeName}</p>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=minimal-light-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-500">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Spacer for sticky footer */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
