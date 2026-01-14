/**
 * Video Focus Template - Video-First Sales Page
 * ID: 'video-focus'
 * Style: Full-width video hero, dark mode, overlay text
 */

import { useState, useEffect } from 'react';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import type { TemplateProps } from '~/templates/registry';
import { getButtonStyles } from './theme-utils';
import { VIDEO_FOCUS_THEME, applyCustomColors } from './sections/types';

export function VideoFocusTemplate({
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

  const theme = applyCustomColors(VIDEO_FOCUS_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  const videoFocusOrder = editableConfig.sectionOrder || [
    'video-focus-hero',
    'guarantee',
    'features',
    'testimonials',
    'social-proof',
    'order-form'
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <SectionRenderer
        sectionOrder={videoFocusOrder}
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

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md border-t border-gray-800 animate-in fade-in slide-in-from-bottom duration-500">
        <button
          onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={getButtonStyles(theme.primary)}
        >
          <span>🛒 Order Now</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
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
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-xl mb-2">{storeName}</p>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
          
          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-10 pt-6 border-t border-zinc-900 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=video-focus-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-zinc-500">Ozzyl</span>
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
