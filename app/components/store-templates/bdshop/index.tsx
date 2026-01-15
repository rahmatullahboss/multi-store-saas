/**
 * BDShop Template
 * 
 * A BDShop Bangladesh-inspired e-commerce template with:
 * - Navy blue theme header with orange accents
 * - Mobile-first responsive design with bottom navigation
 * - Category sidebar navigation (desktop) / drawer (mobile)
 * - Top Deals carousel with discount badges
 * - "Specially for You" product grid
 * - FAQ accordion section
 * - Trust bar with guarantees
 * - Dark footer with newsletter
 */

import { Link, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { useWishlist } from '~/hooks/useWishlist';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { 
  Menu, X, Search, ShoppingCart, 
  Heart, User, ShoppingBag, 
  Zap,
  MapPin, Mail, Phone, Facebook, Sparkles,
  Grid3X3, ChevronDown, ChevronRight, Package, Home as HomeIcon, MessageCircle
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { BDSHOP_THEME } from './theme';
import { BDShopHeader } from './sections/Header';
import { BDShopFooter } from './sections/Footer';




export function BDShopTemplate({
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

  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: BDSHOP_THEME.background, fontFamily: "'Inter', 'NotoSans', Arial, sans-serif" }}>
      <BDShopHeader
        storeName={storeName}
        logo={logo}
        categories={categories}
        currentCategory={currentCategory}
        isPreview={isPreview}
        config={config}
      />


      {/* Main Content with Dynamic Sections */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
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
           id: 'categories',
           type: 'category-list',
           settings: {
             layout: 'scroll',
             limit: 10
           }
         },
         {
           id: 'flash-sale', // Top Deals
           type: 'product-scroll',
           settings: {
             heading: 'Top Deals',
             mode: 'flash-sale', // Using flash sale mode for countdown or distinct look if preferred, or default
             limit: 12
           }
         },
         {
           id: 'products', // Specially for You
           type: 'product-grid',
           settings: {
             heading: currentCategory || 'Specially for You',
             productCount: 18,
             paddingTop: 'medium',
             paddingBottom: 'medium'
           }
         },
         {
           id: 'faq',
           type: 'faq',
           settings: {
             heading: 'Frequently Asked Questions',
             faqs: [
                { question: 'What payment methods do you accept?', answer: 'We accept bKash, Nagad, Visa, Mastercard, and Cash on Delivery (COD) for all orders within Bangladesh.' },
                { question: 'What are your delivery times and charges?', answer: 'Delivery within Dhaka takes 1-2 business days. Outside Dhaka takes 3-5 business days. Free delivery on orders over ৳500.' }
             ]
           }
         },
         {
           id: 'features', // Trust Bar
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
            theme={BDSHOP_THEME}
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

      <BDShopFooter
        storeName={storeName}
        logo={logo}
        socialLinks={socialLinks}
        footerConfig={footerConfig}
        businessInfo={businessInfo}
        categories={categories}
      />

      {/* Floating Contact Buttons */}
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
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="কল করুন"
            >
              <Phone className="w-7 h-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
        </>
      )}

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}
