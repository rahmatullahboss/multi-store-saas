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
import { BDSHOP_THEME } from './BDShopTheme';




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
  businessInfo,
  isPreview,
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const count = useCartCount();
  const { count: wishlistCount } = useWishlist(); 
  
  // Close drawers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDrawerOpen) {
        const drawer = document.getElementById('category-drawer');
        if (drawer && !drawer.contains(e.target as Node)) {
          setCategoryDrawerOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDrawerOpen]);

  const featuredCategories = categories.filter(Boolean).slice(0, 12);

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<SkeletonLoader />}>
          {() => (
            <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: BDSHOP_THEME.background, fontFamily: "'Inter', 'NotoSans', Arial, sans-serif" }}>
      {/* Top Bar - Desktop Only */}
      <div style={{ backgroundColor: BDSHOP_THEME.secondary }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-white/90">
          <div className="flex items-center gap-4">
            <span className="opacity-80">Welcome to {storeName}</span>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <Sparkles className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="opacity-50">|</span>
            {!isPreview && (
              <Link to="/auth/login" className="hover:text-white transition flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: BDSHOP_THEME.cardBg }} className="sticky top-0 z-50 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-3 md:px-4 flex items-center h-14 md:h-16 gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" style={{ color: BDSHOP_THEME.text }} /> : <Menu className="h-6 w-6" style={{ color: BDSHOP_THEME.text }} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded flex items-center justify-center" style={{ backgroundColor: BDSHOP_THEME.primary }}>
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-bold text-lg md:text-xl hidden sm:block" style={{ color: BDSHOP_THEME.primary }}>{storeName}</span>
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 md:h-10 pl-4 pr-12 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <button 
                className="absolute right-0 top-0 h-full px-3 md:px-4 rounded-r-lg text-white transition hover:opacity-90"
                style={{ backgroundColor: BDSHOP_THEME.primary }}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90 relative" style={{ backgroundColor: BDSHOP_THEME.purple }}>
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white text-black"
                >
                  {wishlistCount}
                </span>
              )}
            </button>
            <button className="px-3 py-2 rounded-lg text-white text-xs font-medium transition hover:opacity-90" style={{ backgroundColor: BDSHOP_THEME.green }}>
              New Arrival
            </button>
          </div>

          {/* Cart - Desktop */}
          <Link
            to="/cart"
            className="hidden md:flex relative p-2 hover:bg-gray-100 rounded-lg transition items-center gap-1"
          >
            <ShoppingCart className="h-6 w-6" style={{ color: BDSHOP_THEME.text }} />
            <span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: BDSHOP_THEME.accent }}
            >
              {count}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t" style={{ backgroundColor: BDSHOP_THEME.cardBg }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-6 text-sm">
            <Link to="/" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_THEME.text }}>Home</Link>
            <button 
              onClick={() => setCategoryDrawerOpen(!categoryDrawerOpen)}
              className="font-medium hover:text-blue-600 transition flex items-center gap-1"
              style={{ color: BDSHOP_THEME.text }}
            >
              Categories
              <ChevronDown className="w-4 h-4" />
            </button>
            <Link to="/?sale=true" className="font-medium transition" style={{ color: '#EF4444' }}>Sale</Link>
            <Link to="/about" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_THEME.text }}>About</Link>
            <Link to="/contact" className="font-medium hover:text-blue-600 transition" style={{ color: BDSHOP_THEME.text }}>Contact</Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute left-0 right-0 top-14 shadow-lg z-40 max-h-[70vh] overflow-y-auto border-t">
            <div className="p-3 space-y-1">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_THEME.text }}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCategoryDrawerOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: BDSHOP_THEME.text }}
              >
                <Grid3X3 className="w-5 h-5" />
                Categories
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              <Link 
                to="/?sale=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                style={{ color: '#EF4444' }}
              >
                <Zap className="w-5 h-5" />
                Sale
              </Link>
              {!isPreview && (
                <Link 
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition hover:bg-gray-50"
                  style={{ color: BDSHOP_THEME.text }}
                >
                  <User className="w-5 h-5" />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Category Drawer - Mobile */}
      {categoryDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCategoryDrawerOpen(false)} />
          <div 
            id="category-drawer"
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl overflow-y-auto animate-slide-in"
          >
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg" style={{ color: BDSHOP_THEME.text }}>Shop by Category</h2>
              <button onClick={() => setCategoryDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2">
              <Link
                to="/"
                onClick={() => setCategoryDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                style={{ 
                  backgroundColor: !currentCategory ? `${BDSHOP_THEME.primary}10` : 'transparent',
                  color: !currentCategory ? BDSHOP_THEME.primary : BDSHOP_THEME.text 
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">All Products</span>
              </Link>
              {featuredCategories.map((category) => {
                const isActive = currentCategory === category;
                return (
                  <Link
                    key={category}
                    to={`?category=${encodeURIComponent(category!)}`}
                    onClick={() => setCategoryDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                    style={{ 
                      backgroundColor: isActive ? `${BDSHOP_THEME.primary}10` : 'transparent',
                      color: isActive ? BDSHOP_THEME.primary : BDSHOP_THEME.text 
                    }}
                  >
                    <Grid3X3 className="w-5 h-5" style={{ color: isActive ? BDSHOP_THEME.primary : BDSHOP_THEME.muted }} />
                    <span className="font-medium">{category}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

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

      {/* Footer */}
      <footer style={{ backgroundColor: BDSHOP_THEME.footerBg }} className="text-white pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-4">
                 <div className="h-8 w-8 rounded flex items-center justify-center bg-white/10">
                   <ShoppingBag className="w-5 h-5 text-white" />
                 </div>
                 <span className="font-bold text-xl">{storeName}</span>
               </div>
               <p className="text-sm text-white/70 max-w-xs mb-6">
                 Your one-stop destination for quality products at best prices. We ensure authentic products and fast delivery.
               </p>
               <div className="flex flex-col gap-2 text-sm text-white/70">
                 {businessInfo?.phone && (
                   <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-2 hover:text-white transition">
                     <Phone className="w-4 h-4" />
                     {businessInfo.phone}
                   </a>
                 )}
                 {businessInfo?.email && (
                   <a href={`mailto:${businessInfo.email}`} className="flex items-center gap-2 hover:text-white transition">
                     <Mail className="w-4 h-4" />
                     {businessInfo.email}
                   </a>
                 )}
                 {businessInfo?.address && (
                   <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4 shrink-0" />
                     {businessInfo.address}
                   </div>
                 )}
               </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Customer Care</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/track" className="hover:text-white transition">Track Order</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Newsletter</h3>
              <p className="text-sm text-white/70 mb-4">Subscribe to get special offers and updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white/10 border-white/20 text-white text-sm rounded px-3 py-2 w-full focus:outline-none focus:border-white/50" />
                <button style={{ backgroundColor: BDSHOP_THEME.primary }} className="px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition">
                  Join
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
            <div className="flex gap-4">
               {socialLinks?.facebook && <a href={socialLinks.facebook} className="text-white/70 hover:text-white"><Facebook className="w-5 h-5"/></a>}
               {socialLinks?.twitter && <a href={socialLinks.twitter} className="text-white/70 hover:text-white"><div className="w-5 h-5 font-bold flex items-center justify-center">X</div></a>}
               {socialLinks?.instagram && <a href={socialLinks.instagram} className="text-white/70 hover:text-white"><Sparkles className="w-5 h-5"/></a>}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
            <HomeIcon className="w-5 h-5" style={{ color: !currentCategory ? BDSHOP_THEME.primary : BDSHOP_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: !currentCategory ? BDSHOP_THEME.primary : BDSHOP_THEME.muted }}>Home</span>
          </Link>
          <button 
            onClick={() => setCategoryDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <Grid3X3 className="w-5 h-5" style={{ color: BDSHOP_THEME.muted }} />
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_THEME.muted }}>Categories</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
            <ShoppingCart className="w-5 h-5" style={{ color: BDSHOP_THEME.muted }} />
            <span 
              className="absolute -top-1 right-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: BDSHOP_THEME.accent }}
            >
              {count}
            </span>
            <span className="text-[10px] font-medium" style={{ color: BDSHOP_THEME.muted }}>Cart</span>
          </Link>
          {!isPreview && (
              <Link to="/auth/login" className="flex flex-col items-center gap-0.5 py-1 px-3">
                <User className="w-5 h-5" style={{ color: BDSHOP_THEME.muted }} />
                <span className="text-[10px] font-medium" style={{ color: BDSHOP_THEME.muted }}>Account</span>
              </Link>
            )}
        </div>
      </nav>

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
