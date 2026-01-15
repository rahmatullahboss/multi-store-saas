
/**
 * TurboSale Template (BD - High Urgency)
 * 
 * Target: Bangladesh Drop-shipping & Single Product Sales
 * Features:
 * - Comparison Tables
 * - Video First
 * - Sticky Footer for Mobile
 * - High Contrast (Red/Green/Yellow)
 */

import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { TURBO_SALE_THEME } from './styles/tokens';
import { GhorerBazarHeader } from '~/components/store-templates/ghorer-bazar/sections/Header';
import { GhorerBazarFooter } from '~/components/store-templates/ghorer-bazar/sections/Footer';
import { Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from '@remix-run/react';

export function TurboSaleTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  isPreview,
  planType
}: StoreTemplateProps) {
  
  // Default Sections optimized for BD Market
  const defaultSections = [
    {
       id: 'urgency-top',
       type: 'urgency-bar',
       settings: {
          message: 'সারা দেশে ফ্রি হোম ডেলিভারি!',
          stockLeft: 12,
          backgroundColor: TURBO_SALE_THEME.primary,
          textColor: '#FFFFFF'
       }
    },
    {
      id: 'turbo-hero',
      type: 'turbo-hero',
      settings: {
        heading: 'সমস্যার স্থায়ী সমাধান চান?',
        subheading: 'মাত্র ৭ দিনে পরিবর্তন লক্ষ্য করুন। ১০০% অরজিনাল পণ্য।',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        offerText: 'ধামাকা অফার',
        primaryAction: { label: 'অর্ডার করতে ক্লিক করুন', url: '/products' }
      }
    },
    {
      id: 'features-list',
       type: 'features',
       settings: {
          heading: 'আমাদের পণ্য কেন সেরা?',
          backgroundColor: '#FFF'
       }
    },
    {
      id: 'main-products',
      type: 'product-grid',
      settings: {
        heading: 'জনপ্রিয় পণ্যসমূহ',
        productCount: 12,
        paddingTop: 'medium',
        paddingBottom: 'medium'
      }
    },
    {
       id: 'faq-section',
       type: 'faq',
       settings: {
          heading: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
          backgroundColor: '#F9FAFB'
       }
    }
  ];

  const sectionsToRender = (config?.sections && config.sections.length > 0) 
    ? config.sections 
    : defaultSections;

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<div className="min-h-screen bg-gray-50"><SkeletonLoader /></div>}>
          {() => (
            <div 
              className="min-h-screen flex flex-col pb-20 md:pb-0"
              style={{ 
                backgroundColor: TURBO_SALE_THEME.background,
                color: TURBO_SALE_THEME.text,
                fontFamily: TURBO_SALE_THEME.fontFamily
              }}
            >
              <GhorerBazarHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={isPreview}
                config={config}
                socialLinks={socialLinks}
                businessInfo={businessInfo}
              />

              <main className="flex-1">
                {sectionsToRender.map((section: any) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  
                  if (!SectionComponent) return null;

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={TURBO_SALE_THEME}
                      products={products}
                      categories={categories}
                      storeId={storeId}
                      currency={currency}
                      store={{
                        name: storeName,
                        email: businessInfo?.email,
                        phone: businessInfo?.phone,
                        address: businessInfo?.address,
                        currency: currency
                      }}
                    />
                  );
                })}
              </main>

              <GhorerBazarFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={categories}
                planType={planType}
              />

              {/* Mobile Sticky Footer */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                 <Link 
                   to="/products"
                   className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 animate-pulse"
                 >
                    <ShoppingBag size={20} />
                    অর্ডার করুন
                 </Link>
                 <a 
                   href={`tel:${businessInfo?.phone || config?.floatingCallNumber}`}
                   className="w-14 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                 >
                    <Phone size={24} />
                 </a>
              </div>
              
              {/* Global Styles */}
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Tiro+Bangla&display=swap');
                
                body {
                  font-family: 'Hind Siliguri', sans-serif;
                }
                
                h1, h2, h3, h4, h5, h6 {
                  font-family: 'Hind Siliguri', sans-serif;
                }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}
