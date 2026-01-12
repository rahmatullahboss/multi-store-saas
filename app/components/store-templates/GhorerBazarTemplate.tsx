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
import { GHORER_BAZAR_THEME } from './GhorerBazarTheme';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';

export function GhorerBazarTemplate({
  storeName,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  businessInfo,
  storeId,
  isPreview
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const count = useCartCount();
  
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
      {/* Top Bar - Orange */}
      <div 
        className="text-white text-center py-2 text-sm"
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{businessInfo?.phone || '০১XXX-XXXXXX'}</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>হেল্প ডেস্ক</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: headerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primary }}>
                  {storeName}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition relative">
              <ShoppingBag className="h-5 w-5 text-gray-600" />
              <span 
                className="absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {count}
              </span>
            </Link>
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="border-t border-gray-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <Link 
                to="/"
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  !currentCategory 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                style={!currentCategory ? { backgroundColor: primary } : {}}
              >
                সব প্রোডাক্ট
              </Link>
              {categories.filter(Boolean).map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    currentCategory === category 
                      ? 'text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  style={currentCategory === category ? { backgroundColor: primary } : {}}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <nav className="px-4 space-y-2">
              {categories.filter(Boolean).map((category) => (
                <Link
                  key={category}
                  to={`?category=${encodeURIComponent(category!)}`}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

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
              image: config?.bannerUrl,
              layout: 'simple_centered',
              alignment: 'center'
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
            id: 'features',
            type: 'features',
            settings: {
              heading: 'কেন আমাদের থেকে কিনবেন?',
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

      {/* Footer */}
      <footer className="border-t border-gray-200" style={{ backgroundColor: footerBg }}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: primary }}>
                    {storeName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                আমরা সেরা মানের পণ্য সেরা দামে সরবরাহ করি। আপনার সন্তুষ্টি আমাদের অঙ্গীকার।
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primary }}>COMPANY</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>

            {/* Quick Help */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primary }}>QUICK HELP</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/returns" className="text-gray-600 hover:text-gray-900">Return Policy</Link></li>
                <li><Link to="/refund" className="text-gray-600 hover:text-gray-900">Refund Policy</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primary }}>CONTACT</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {businessInfo?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {businessInfo.phone}
                  </li>
                )}
                {businessInfo?.email && (
                  <li>📧 {businessInfo.email}</li>
                )}
                {businessInfo?.address && (
                  <li>📍 {businessInfo.address}</li>
                )}
              </ul>
              
              {/* Social Links */}
              {(socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp) && (
                <div className="flex gap-3 mt-4">
                  {socialLinks?.facebook && (
                    <a 
                      href={socialLinks.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a 
                      href={socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {socialLinks?.whatsapp && (
                    <a 
                      href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Orange */}
        <div 
          className="text-white py-4"
          style={{ backgroundColor: primary }}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {socialLinks?.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: !currentCategory ? primary : GHORER_BAZAR_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? primary : GHORER_BAZAR_THEME.muted }}>হোম</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: GHORER_BAZAR_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: GHORER_BAZAR_THEME.muted }}>ক্যাটেগরি</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: GHORER_BAZAR_THEME.muted }} />
            <span
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: GHORER_BAZAR_THEME.muted }}>কার্ট</span>
          </Link>
          {!isPreview && (
            <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
              <User className="w-5 h-5" style={{ color: GHORER_BAZAR_THEME.muted }} />
              <span className="text-[10px] font-medium" style={{ color: GHORER_BAZAR_THEME.muted }}>অ্যাকাউন্ট</span>
            </Link>
          )}
        </div>
      </nav>

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
