/**
 * GhorerBazar Template
 * 
 * A template inspired by ghorerbazar.com design.
 * Features:
 * - Orange primary color scheme (#F28C38)
 * - Clean product cards with Quick Add buttons
 * - ON SALE and discount badges
 * - COD-focused checkout flow
 * - Bengali language support
 */

import { Link } from '@remix-run/react';
import { useState, useRef } from 'react';
import { useCartCount } from '~/hooks/useCartCount';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Phone, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  MessageCircle,
  Facebook,
  Instagram,
  ShoppingBag,
  Plus,
  Minus,
  Grid3X3,
  Home as HomeIcon
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { GHORER_BAZAR_THEME } from './theme';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { GhorerBazarHeader } from './sections/Header';
import { GhorerBazarFooter } from './sections/Footer';

export function GhorerBazarTemplate({
  storeName,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  storeId,
  isPreview
}: StoreTemplateProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Theme colors from valid theme object
  const { primary, secondary, accent, headerBg, footerBg } = GHORER_BAZAR_THEME;
  
  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen for scroll to show/hide scroll-to-top button
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 500);
    });
  }

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
           <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: GHORER_BAZAR_THEME.background }}>
      <GhorerBazarHeader
        storeName={storeName}
        logo={logo}
        categories={categories}
        currentCategory={currentCategory}
        isPreview={isPreview}
        config={config}
        businessInfo={businessInfo}
        socialLinks={socialLinks}
      />

      {/* Main Content with SectionRenderer */}
      <main className="min-h-[60vh]">
        {(config?.sections ?? [
          {
            id: 'hero',
            type: 'hero',
            settings: {
              heading: config?.bannerText || `${storeName} এ স্বাগতম`,
              subheading: 'সেরা মানের পণ্য সেরা দামে',
              primaryAction: { label: 'এখনই কিনুন', url: '/products' },
              secondaryAction: { label: 'ক্যাটাগরি দেখুন', url: '/#categories' },
              image: config?.bannerUrl,
              layout: 'standard',
              alignment: 'center'
            }
          },
          {
            id: 'categories',
            type: 'category-list',
            settings: {
              heading: 'ক্যাটাগরি অনুযায়ী পণ্য',
              layout: 'grid',
              limit: 12
            }
          },
          {
            id: 'scroll',
            type: 'product-scroll',
            settings: {
              heading: 'বেস্ট সেলার',
              limit: 10,
              mode: 'default'
            }
          },
          {
            id: 'products',
            type: 'product-grid',
            settings: {
              heading: currentCategory || 'সব প্রোডাক্ট',
              productCount: 12,
              paddingTop: 'medium',
              paddingBottom: 'medium'
            }
          },
          {
            id: 'banner',
            type: 'banner',
            settings: {
              heading: 'বিশেষ অফার',
              subheading: 'পছন্দের পণ্যে বিশেষ ছাড়',
              primaryAction: { label: 'অফার দেখুন', url: '/products?sort=popular' },
              image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80'
            }
          },
          {
            id: 'features',
            type: 'features',
            settings: {
              heading: 'কেন আমাদের থেকে কিনবেন?',
              subheading: 'দ্রুত ডেলিভারি, সহজ রিটার্ন, নিরাপদ পেমেন্ট।',
              backgroundColor: 'white'
            }
          },
          {
            id: 'faq',
            type: 'faq',
            settings: {
              heading: 'সাধারণ প্রশ্নাবলী',
              faqs: [
                { question: 'ক্যাশ অন ডেলিভারি আছে?', answer: 'হ্যাঁ, বেশিরভাগ স্থানে ক্যাশ অন ডেলিভারি পাওয়া যায়।' },
                { question: 'ডেলিভারি সময় কত?', answer: 'ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।' },
                { question: 'রিটার্ন পলিসি কি?', answer: '৭ দিনের মধ্যে রিটার্ন করা যায়।' }
              ]
            }
          },
          {
            id: 'newsletter',
            type: 'newsletter',
            settings: {
              heading: 'অফার জানতে সাবস্ক্রাইব করুন',
              subheading: 'নতুন অফার আর আপডেট পেতে ইমেইল দিন।',
              alignment: 'center'
            }
          }
        ]).map((section: any) => {
          const SectionComponent = SECTION_REGISTRY[section.type]?.component;
          if (!SectionComponent) return null;
          
          return (
            <SectionComponent
              key={section.id}
              settings={section.settings}
              theme={GHORER_BAZAR_THEME}
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
      />

      {/* Floating Contact Buttons from Config - Above bottom nav on mobile */}
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
              <MessageCircle className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
            </a>
          )}
          {config?.floatingCallEnabled && config?.floatingCallNumber && (
            <a
              href={`tel:${config.floatingCallNumber}`}
              className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
              title="কল করুন"
            >
              <Phone className="h-7 w-7 text-white" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
            </a>
          )}
          {/* Fallback: WhatsApp from socialLinks if no config */}
          {!config?.floatingWhatsappEnabled && socialLinks?.whatsapp && (
            <a
              href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 md:bottom-8 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition z-40"
            >
              <MessageCircle className="h-7 w-7" />
            </a>
          )}
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition hover:opacity-90 z-50"
          style={{ backgroundColor: primary }}
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      {/* CSS for hiding scrollbar */}
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
