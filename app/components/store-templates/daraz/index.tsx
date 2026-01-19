/**
 * Daraz Template
 * 
 * A Daraz Bangladesh-inspired e-commerce template with:
 * - Orange theme header (#F85606)
 * - Category sidebar navigation
 * - Flash sale section with countdown
 * - Product grid layout
 * - Multi-column footer
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
// useWishlist must be used inside WishlistProvider - removed from top level
import { useTranslation } from '~/contexts/LanguageContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { 
  Menu, X, Search, ShoppingCart, 
  Heart, User, ShoppingBag, Headphones, Grid3X3, ChevronRight 
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { DARAZ_THEME } from './theme';
import { DarazHeader } from './sections/Header';
import { DarazFooter } from './sections/Footer';

export function DarazTemplate({
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
}: StoreTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const count = useCartCount();
  const { t } = useTranslation();


  // Get products for different sections
  const allProducts = currentCategory 
    ? products.filter(p => p.category === currentCategory) 
    : products;
  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: DARAZ_THEME.background, fontFamily: "'Roboto', 'NotoSans', Arial, sans-serif" }}>
      <DarazHeader
        storeName={storeName}
        logo={logo}
        categories={categories}
        currentCategory={currentCategory}
        isPreview={isPreview}
        config={config}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 min-h-[60vh]">
      {(config?.sections ?? [
         {
           id: 'hero',
           type: 'hero',
           settings: {
             heading: config?.bannerText || 'Amazing Deals Await!',
             subheading: 'Shop the best products at unbeatable prices',
             primaryAction: { label: 'SHOP NOW', url: '/?category=all' },
             image: config?.bannerUrl,
             layout: 'marketplace',
             alignment: 'left'
           }
         },
         {
           id: 'flash-sale',
           type: 'product-scroll',
           settings: {
             heading: 'Flash Sale',
             mode: 'flash-sale',
             limit: 10
           }
         },
         {
           id: 'categories',
           type: 'category-list',
           settings: {
             layout: 'grid',
             limit: 16
           }
         },
         {
           id: 'products',
           type: 'product-grid',
           settings: {
             heading: currentCategory || 'Just For You',
             productCount: 18,
             paddingTop: 'medium',
             paddingBottom: 'medium'
           }
         },
         {
           id: 'features',
           type: 'features',
           settings: {
             heading: '',
             backgroundColor: 'white'
           }
         }
       ]).map((section: any) => {
        const SectionComponent = SECTION_REGISTRY[section.type]?.component;
        if (!SectionComponent) return null;
        
        return (
          <SectionComponent
            key={section.id}
            settings={section.settings}
            theme={DARAZ_THEME}
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

      <DarazFooter
        storeName={storeName}
        logo={logo}
        socialLinks={socialLinks}
        footerConfig={footerConfig}
        businessInfo={businessInfo}
        categories={categories}
      />


      {/* Floating Contact Buttons - Positioned above bottom nav on mobile */}
      {!isPreview && (
        <>
          {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
            <a
              href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `হ্যালো ${storeName}, আমি জানতে চাই...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
              title="WhatsApp এ মেসেজ করুন"
            >
              <span className="text-white text-2xl">💬</span>
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="কল করুন"
            >
              <span className="text-white text-2xl">📞</span>
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
        </>
      )}

      {/* Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}
