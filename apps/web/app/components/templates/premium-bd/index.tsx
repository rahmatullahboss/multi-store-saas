/**
 * Premium BD Template - Trusted High-Performance Design (Isolated)
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { PremiumBDSectionRenderer } from './SectionRenderer';
import { PREMIUM_BD_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';

export function PremiumBDTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  planType = 'free',
  productVariants = [],
  orderBumps = [],
  isEditMode = false,
}: TemplateProps) {
  const formatPrice = useFormatPrice();
  const theme = applyCustomColors(PREMIUM_BD_THEME, config.primaryColor, config.accentColor);

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header/Logo */}
      <nav className="bg-white border-b border-gray-100 py-6 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-center">
          <h1 className="text-3xl font-black tracking-tight text-gray-950 uppercase italic underline decoration-orange-500 decoration-4 underline-offset-4">
            {storeName}
          </h1>
        </div>
      </nav>

      <PremiumBDSectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections}
        config={config}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={productVariants}
        orderBumps={orderBumps}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        isEditMode={isEditMode}
        planType={planType}
      />

      <footer className="bg-gray-950 py-20 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-black text-white mb-6 uppercase italic tracking-tighter decoration-orange-500 underline decoration-2 underline-offset-4">{storeName}</h3>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10 font-bold">
            {config.orderFormText?.footerTagline || 'অরিজিনাল এবং প্রিমিয়াম প্রডাক্টের নির্ভরযোগ্য প্রতিষ্ঠান। প্রতিটি ডেলিভারি আমাদের জন্য বিশেষ।'}
          </p>
          
          <div className="text-gray-600 text-xs font-black uppercase tracking-[0.3em] mb-12" suppressHydrationWarning>
            {config.orderFormText?.footerCopyright ? (
              <span dangerouslySetInnerHTML={{ __html: config.orderFormText.footerCopyright }} />
            ) : (
              <>© {new Date().getFullYear()} • {storeName} • Trusted e-Commerce BD</>
            )}
          </div>

          {planType === 'free' && (
            <div className="pt-10 border-t border-gray-900 flex justify-center">
              <a 
                href="https://ozzyl.com?utm_source=premium-bd-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-white transition-all flex items-center gap-2 grayscale hover:grayscale-0"
              >
                <span className="uppercase tracking-[0.1em]">Build with</span>
                <span className="font-bold tracking-tight text-xl text-orange-500">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "অর্ডার করতে ক্লিক করুন"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />

      <div className="md:hidden h-28" />

      <FloatingButtons
        whatsappEnabled={config.whatsappEnabled}
        whatsappNumber={config.whatsappNumber}
        whatsappMessage={config.whatsappMessage}
        callEnabled={config.callEnabled}
        callNumber={config.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}

export default PremiumBDTemplate;
