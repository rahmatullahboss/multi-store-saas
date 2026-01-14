import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { LandingConfig } from '@db/types';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SectionRenderer } from './SectionRenderer';
import { LUXE_THEME, applyCustomColors } from './sections/types';
import { CustomSectionRenderer } from './CustomSectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import { getButtonStyles } from './theme-utils';
import { Star, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import type { TemplateProps } from '~/templates/registry';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

export function LuxeTemplate({
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

  const theme = applyCustomColors(LUXE_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  return (
    <div className="font-sans text-white bg-black min-h-screen selection:bg-amber-500 selection:text-black">
      {/* 
        NOTE: Ideally we would load the font via a Link in the root, 
        but for dynamic templates we might need to inject it or assume it's global.
        For now, let's use a standard serif stack that looks decent, 
        or inject Google Fonts via style tag.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-serif-display { font-family: 'Playfair Display', serif; }
      `}</style>
      
      <SectionRenderer
        sectionOrder={editableConfig.sectionOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={[]}
        orderBumps={[]}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
        templateId="luxury"
        onUpdate={handleSectionUpdate}
      />

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-zinc-800 p-4 shadow-2xl safe-area-pb">
        <a
          href="#order-form"
          className="w-full py-4 text-black font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-2 transition-colors hover:opacity-90"
          style={getButtonStyles(editableConfig.primaryColor || '#f59e0b')}
        >
          Order Now — {formatPrice(product.price)}
        </a>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="md:hidden h-20" />

      {/* Footer */}
      <footer className="bg-black text-zinc-500 py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-serif-display text-white mb-2">{storeName}</p>
          <p className="text-sm mb-4">© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-wider">
            <a href="/policies/privacy" className="hover:text-amber-500 transition">{t('privacyPolicy')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/terms" className="hover:text-amber-500 transition">{t('termsOfService')}</a>
            <span className="opacity-50">•</span>
            <a href="/policies/refund" className="hover:text-amber-500 transition">{t('refundPolicy')}</a>
          </div>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-center items-center">
              <a 
                href="https://ozzyl.com?utm_source=luxe-campaign-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-amber-500 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-zinc-400">Ozzyl</span>
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
    </div>
  );
}
