/**
 * Artisan Market Store Template
 *
 * Warm, organic design for handmade & artisanal products.
 * Features: Brown + Amber accents, rustic typography, textured backgrounds.
 */

import { Link } from '@remix-run/react';
import {
  ShoppingBasket,
  Search,
  Menu,
  X,
  Heart,
  Leaf,
  ChevronRight,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Home as HomeIcon,
  Grid3X3,
  User,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useFormatPrice, useTranslation } from '~/contexts/LanguageContext';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { useCartCount } from '~/hooks/useCartCount';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { useProductPrice } from '~/hooks/useProductPrice';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { useWishlist } from '~/hooks/useWishlist';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { PreviewSafeLink, usePreviewUrl } from '~/components/PreviewSafeLink';

import { ARTISAN_MARKET_THEME } from './theme';
import { ArtisanMarketHeader } from './sections/Header';
import { ArtisanMarketFooter } from './sections/Footer';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ArtisanMarketTemplate({
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
  planType = 'free',
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const formatPrice = useFormatPrice();
  const { t } = useTranslation();
  const count = useCartCount();

  // Filter valid categories
  const validCategories = (categories || []).filter((c): c is string => Boolean(c));

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div
              className="min-h-screen pb-16 md:pb-0"
              style={{
                backgroundColor: ARTISAN_MARKET_THEME.background,
                fontFamily: "'Work Sans', sans-serif",
              }}
            >
              {/* Google Fonts */}
              <link
                href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap"
                rel="stylesheet"
              />

              <ArtisanMarketHeader
                storeName={storeName ?? ''}
                logo={logo}
                categories={validCategories}
                currentCategory={currentCategory}
                config={config}
                count={count}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />

              {/* ==================== DYNAMIC SECTIONS ==================== */}
              {(
                config?.sections ?? [
                  {
                    id: 'hero',
                    type: 'hero',
                    settings: {
                      heading: config?.bannerText || `Artisan Goods from ${storeName}`,
                      subheading:
                        'Each piece tells a story. Discover unique handmade products crafted by skilled artisans using traditional techniques.',
                      primaryAction: { label: 'Browse Products', url: '/#products' },
                      secondaryAction: { label: 'Explore Categories', url: '/#categories' },
                      image: config?.bannerUrl,
                      layout: 'standard',
                      alignment: 'left',
                    },
                  },
                  {
                    id: 'features',
                    type: 'features',
                    settings: {
                      heading: 'Why Artisan Market',
                      subheading: 'Handcrafted quality with ethical sourcing.',
                      backgroundColor: 'white',
                      features: [
                        {
                          icon: 'Leaf',
                          title: 'Sustainable',
                          description: 'Eco-friendly materials and packaging.',
                        },
                        {
                          icon: 'ThumbsUp',
                          title: 'Handmade Quality',
                          description: 'Crafted by skilled artisans.',
                        },
                        {
                          icon: 'Gift',
                          title: 'Perfect Gifting',
                          description: 'Unique gifts for loved ones.',
                        },
                        {
                          icon: 'Shield',
                          title: 'Secure Payments',
                          description: 'Trusted checkout options.',
                        },
                      ],
                    },
                  },
                  {
                    id: 'categories',
                    type: 'category-list',
                    settings: {
                      layout: 'pills',
                      limit: 8,
                    },
                  },
                  {
                    id: 'products',
                    type: 'product-grid',
                    settings: {
                      heading: currentCategory || 'Our Products',
                      productCount: 12,
                      paddingTop: 'large',
                      paddingBottom: 'large',
                    },
                  },
                  {
                    id: 'story',
                    type: 'rich-text',
                    settings: {
                      heading: 'Handcrafted with Passion',
                      text: 'Every product in our collection is made by skilled artisans who pour their heart and soul into their craft. We believe in sustainable practices, fair wages, and preserving traditional techniques that have been passed down through generations.',
                      alignment: 'center',
                      backgroundColor: ARTISAN_MARKET_THEME.cream,
                    },
                  },
                  {
                    id: 'banner',
                    type: 'banner',
                    settings: {
                      heading: 'Limited Edition Drops',
                      subheading: 'Small-batch collections inspired by local artisans.',
                      primaryAction: { label: 'Shop New', url: '/products?sort=newest' },
                      image:
                        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80',
                    },
                  },
                  {
                    id: 'faq',
                    type: 'faq',
                    settings: {
                      heading: 'Artisan FAQs',
                      faqs: [
                        {
                          question: 'Are products handmade?',
                          answer:
                            'Yes, each item is crafted by artisans with traditional techniques.',
                        },
                        {
                          question: 'Do you offer returns?',
                          answer: 'We offer a 7-day return window on eligible items.',
                        },
                        {
                          question: 'How long does shipping take?',
                          answer: 'Delivery typically takes 2-5 business days.',
                        },
                      ],
                    },
                  },
                  {
                    id: 'newsletter',
                    type: 'newsletter',
                    settings: {
                      heading: 'Join the Artisan Circle',
                      subheading: 'Get early access to new collections.',
                      alignment: 'center',
                    },
                  },
                ]
              ).map((section: any) => {
                const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                if (!SectionComponent) return null;

                return (
                  <SectionComponent
                    key={section.id}
                    settings={section.settings}
                    theme={ARTISAN_MARKET_THEME}
                    products={products}
                    categories={categories}
                    storeId={storeId}
                    currency={currency}
                    store={{
                      name: storeName,
                      email: businessInfo?.email,
                      phone: businessInfo?.phone,
                      address: businessInfo?.address,
                      currency: currency,
                    }}
                    ProductCardComponent={(props: any) => (
                      <ArtisanProductCard {...props} isPreview={isPreview} />
                    )}
                    isPreview={isPreview}
                  />
                );
              })}

              <ArtisanMarketFooter
                storeName={storeName ?? ''}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                socialLinks={socialLinks}
                planType={planType}
                categories={validCategories}
              />

              {/* Mobile Bottom Navigation */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex items-center justify-around h-14">
                  <PreviewSafeLink
                    to="/"
                    isPreview={isPreview}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <HomeIcon
                      className="w-5 h-5"
                      style={{
                        color: !currentCategory
                          ? ARTISAN_MARKET_THEME.accent
                          : ARTISAN_MARKET_THEME.muted,
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: !currentCategory
                          ? ARTISAN_MARKET_THEME.accent
                          : ARTISAN_MARKET_THEME.muted,
                      }}
                    >
                      Home
                    </span>
                  </PreviewSafeLink>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-0.5 py-1 px-3"
                  >
                    <Grid3X3 className="w-5 h-5" style={{ color: ARTISAN_MARKET_THEME.muted }} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: ARTISAN_MARKET_THEME.muted }}
                    >
                      Browse
                    </span>
                  </button>
                  <PreviewSafeLink
                    to="/cart"
                    isPreview={isPreview}
                    className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                  >
                    <ShoppingCart
                      className="w-5 h-5"
                      style={{ color: ARTISAN_MARKET_THEME.muted }}
                    />
                    <span
                      className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: ARTISAN_MARKET_THEME.accent }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: ARTISAN_MARKET_THEME.muted }}
                    >
                      Basket
                    </span>
                  </PreviewSafeLink>
                  {!isPreview && (
                    <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
                      <User className="w-5 h-5" style={{ color: ARTISAN_MARKET_THEME.muted }} />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: ARTISAN_MARKET_THEME.muted }}
                      >
                        Account
                      </span>
                    </Link>
                  )}
                </div>
              </nav>

              {/* Floating Contact Buttons */}
              {!isPreview && (
                <>
                  {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
                    <a
                      href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `Hello ${storeName}, I'd like to know...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fixed bottom-20 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle className="h-7 w-7 text-white" />
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
                    </a>
                  )}
                  {config?.floatingCallEnabled && config?.floatingCallNumber && (
                    <a
                      href={`tel:${config.floatingCallNumber}`}
                      className={`fixed bottom-20 md:bottom-8 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
                      title="Call us"
                    >
                      <Phone className="h-7 w-7 text-white" />
                      <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}

// ============================================================================
// ARTISAN PRODUCT CARD COMPONENT
// ============================================================================
interface ArtisanProductCardProps {
  product: NonNullable<StoreTemplateProps['products']>[0];
  storeId: number;
  formatPrice: (price: number) => string;
  isPreview?: boolean;
}

function ArtisanProductCard({ product, storeId, formatPrice, isPreview }: ArtisanProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const {
    price,
    compareAtPrice: displayCompareAt,
    isFlashSale,
    isOnSale,
    discountPercentage,
  } = useProductPrice(product);
  const getPreviewUrl = usePreviewUrl(isPreview);

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      style={{ border: '1px solid #e7e5e4' }}
    >
      {/* Image */}
      <PreviewSafeLink
        to={`/product/${product.id}`}
        isPreview={isPreview}
        className="block relative aspect-square overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: ARTISAN_MARKET_THEME.cream }}
          >
            <span className="text-6xl">🫙</span>
          </div>
        )}

        {/* Discount Badge */}
        {isOnSale && (
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: isFlashSale ? '#EF4444' : ARTISAN_MARKET_THEME.accent,
              color: 'white',
            }}
          >
            {isFlashSale && <span className="mr-1">⚡</span>}
            {discountPercentage}% Off
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Heart
            className="w-5 h-5 transition-colors"
            style={{
              color: isLiked ? '#ef4444' : ARTISAN_MARKET_THEME.muted,
              fill: isLiked ? '#ef4444' : 'none',
            }}
          />
        </button>
      </PreviewSafeLink>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        {product.category && (
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: ARTISAN_MARKET_THEME.accent }}
          >
            {product.category}
          </span>
        )}

        {/* Title */}
        <PreviewSafeLink to={`/product/${product.id}`} isPreview={isPreview}>
          <h3
            className="font-semibold mt-2 mb-3 line-clamp-2 hover:opacity-70 transition-opacity"
            style={{
              fontFamily: "'Newsreader', serif",
              color: ARTISAN_MARKET_THEME.text,
              fontSize: '1.125rem',
            }}
          >
            {product.title}
          </h3>
        </PreviewSafeLink>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-semibold" style={{ color: ARTISAN_MARKET_THEME.primary }}>
            {formatPrice(price)}
          </span>
          {isOnSale && displayCompareAt && (
            <span className="text-sm line-through" style={{ color: ARTISAN_MARKET_THEME.muted }}>
              {formatPrice(displayCompareAt)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <AddToCartButton
          productId={product.id}
          storeId={storeId}
          className="w-full py-3 rounded-full font-medium transition-all hover:scale-[1.02]"
          style={{ backgroundColor: ARTISAN_MARKET_THEME.accent, color: 'white' }}
          isPreview={isPreview}
        >
          Add to Basket
        </AddToCartButton>
      </div>
    </div>
  );
}
