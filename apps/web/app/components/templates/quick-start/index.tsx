/**
 * Quick Builder Template - High-Conversion Landing Page
 */

import type { TemplateProps } from '~/templates/registry';
import { useFormatPrice } from '~/contexts/LanguageContext';
import { FloatingButtons } from '../_core/FloatingButtons';
import { QuickStartSectionRenderer } from './SectionRenderer';
import { QUICK_START_THEME } from './theme';
import { applyCustomColors } from '../_core/types';
import { StickyBuyButton } from '../_core/StickyBuyButton';
import { Header, Footer } from './Footer';

export function QuickStartTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  isPreview = false,
  planType = 'free',
  productVariants = [],
  orderBumps = [],
}: TemplateProps) {
  const formatPrice = useFormatPrice();
  // Apply user custom colors if provided, otherwise use default theme
  const theme = applyCustomColors(QUICK_START_THEME, config.primaryColor, config.accentColor);

  return (
    <div className={`min-h-screen font-sans ${theme.bgPrimary} ${theme.textPrimary} selection:bg-[#E63946] selection:text-white`}>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white py-3 px-4 text-center text-sm font-medium animate-pulse">
        🎉 বিশেষ অফার! আজকে অর্ডার করলে <strong>ফ্রি ডেলিভারি</strong> + <strong>৫০০ টাকা ছাড়</strong> 🎉
      </div>

      <Header storeName={storeName} config={config} />

      <QuickStartSectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections || []}
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
        planType={planType}
      />

      <Footer 
         storeName={storeName} 
         config={config} 
         planType={planType}
         product={product}
         theme={theme}
         formatPrice={formatPrice}
      />

      {/* Mobile Sticky Buy Button */}
      <StickyBuyButton
        ctaText={config.ctaText || "অর্ডার করতে ক্লিক করুন"}
        price={product.price}
        formatPrice={formatPrice}
        theme={theme}
        isPreview={isPreview}
      />
      
      {/* Add padding for sticky button */}
      <div className="md:hidden h-24" />

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

export default QuickStartTemplate;
