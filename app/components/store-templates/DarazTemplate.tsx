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
import { useWishlist } from '~/hooks/useWishlist';
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
import { DARAZ_THEME } from './DarazTheme';

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
  businessInfo,
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist();
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
      {/* Top Bar */}
      <div style={{ backgroundColor: DARAZ_THEME.topBarBg }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition">Save More on App</span>
            <span className="hover:text-white cursor-pointer transition">Become a Seller</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" />
              Help & Support
            </span>
            {!isPreview && (
              <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: DARAZ_THEME.primary }} className="sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-10 object-contain bg-white rounded" />
            ) : (
              <div className="h-10 w-10 bg-white rounded flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" style={{ color: DARAZ_THEME.primary }} />
              </div>
            )}
            <span className="text-white font-bold text-xl hidden sm:block">{storeName}</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative flex">
              <input
                type="text"
                placeholder={`Search in ${storeName}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-l text-sm border-0 focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ backgroundColor: DARAZ_THEME.cardBg }}
              />
              <button 
                className="h-10 px-6 rounded-r font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: '#E04E05' }} // darker orange
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 text-white hover:bg-white/10 rounded transition flex items-center gap-1"
            >
              <ShoppingCart className="h-6 w-6" />
              <span 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#FFD700', color: DARAZ_THEME.text }}
              >
                {count}
              </span>
            </Link>
            <button className="hidden md:flex p-2 text-white hover:bg-white/10 rounded transition relative">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#FFD700', color: DARAZ_THEME.text }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-16 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium"
                style={{ 
                  backgroundColor: currentCategory ? 'transparent' : `${DARAZ_THEME.primary}15`, 
                  color: currentCategory ? DARAZ_THEME.text : DARAZ_THEME.primary 
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                All Categories
              </Link>
              {featuredCategories.map((category) => {
                const isActive = currentCategory === category;
                return (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category!)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition"
                    style={{ 
                      backgroundColor: isActive ? `${DARAZ_THEME.primary}15` : 'transparent', 
                      color: isActive ? DARAZ_THEME.primary : DARAZ_THEME.text 
                    }}
                  >
                    <Grid3X3 className="w-5 h-5" />
                    {category}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

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

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Customer Care */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Customer Care</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
                <li><Link to="/help" className="hover:text-orange-500 transition">Help Center</Link></li>
                <li><Link to="/returns" className="hover:text-orange-500 transition">Returns & Refunds</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
                <li><Link to="/track" className="hover:text-orange-500 transition">Track Order</Link></li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>{storeName}</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
                <li><Link to="/about" className="hover:text-orange-500 transition">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-orange-500 transition">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Popular Categories</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
                {featuredCategories.slice(0, 5).map(cat => (
                  <li key={cat}>
                    <Link to={`?category=${encodeURIComponent(cat!)}`} className="hover:text-orange-500 transition">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Contact</h3>
              <ul className="space-y-2 text-sm" style={{ color: DARAZ_THEME.muted }}>
                {businessInfo?.phone && <li className="flex items-center gap-2">📞 {businessInfo.phone}</li>}
                {businessInfo?.email && <li className="flex items-center gap-2">📧 {businessInfo.email}</li>}
                {businessInfo?.address && <li className="flex items-start gap-2">📍 {businessInfo.address}</li>}
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold mb-4 text-sm" style={{ color: DARAZ_THEME.text }}>Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">bKash</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Nagad</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Visa</span>
                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium">Mastercard</span>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {storeName}. All Rights Reserved.
            </p>
            <div className="flex gap-4 text-gray-400">
               {socialLinks?.facebook && <a href={socialLinks.facebook} className="text-white/70 hover:text-orange-500"><div className="w-5 h-5 font-bold flex items-center justify-center">F</div></a>}
               {socialLinks?.twitter && <a href={socialLinks.twitter} className="text-white/70 hover:text-orange-500"><div className="w-5 h-5 font-bold flex items-center justify-center">X</div></a>}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <ShoppingBag className="w-5 h-5" style={{ color: !currentCategory ? DARAZ_THEME.primary : DARAZ_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? DARAZ_THEME.primary : DARAZ_THEME.muted }}>Home</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: DARAZ_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: DARAZ_THEME.muted }}>Categories</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: DARAZ_THEME.muted }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: DARAZ_THEME.primary }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: DARAZ_THEME.muted }}>Cart</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
              <User className="w-5 h-5" style={{ color: DARAZ_THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: DARAZ_THEME.muted }}>Account</span>
            </Link>
          )}
        </div>
      </nav>

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
