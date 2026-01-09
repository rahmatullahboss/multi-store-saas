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
  Minus
} from 'lucide-react';
import { AddToCartButton } from '~/components/AddToCartButton';
import type { StoreTemplateProps } from '~/templates/store-registry';

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
}: StoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const productGridRef = useRef<HTMLDivElement>(null);
  
  // Theme colors
  const primaryColor = '#F28C38'; // Orange
  const cyanBadge = '#00BCD4'; // ON SALE badge
  const redDiscount = '#E53935'; // Discount badge
  
  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('en-BD')}`;
  };

  // Calculate discount amount
  const getDiscountAmount = (price: number, compareAtPrice: number | null) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return compareAtPrice - price;
  };

  // Get products for different sections
  const allProducts = products;
  const featuredProducts = products.slice(0, 12);

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
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Bar - Orange */}
      <div 
        className="text-white text-center py-2 text-sm"
        style={{ backgroundColor: primaryColor }}
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
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Logo - Centered */}
            <Link to="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  {storeName}
                </span>
              )}
            </Link>

            {/* User & Cart Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <User className="h-5 w-5 text-gray-600" />
              </button>
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: redDiscount }}
                  id="cart-count"
                >
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 overflow-x-auto py-3 scrollbar-hide">
              <Link
                to="/"
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  !currentCategory 
                    ? 'text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                style={!currentCategory ? { backgroundColor: primaryColor } : {}}
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
                  style={currentCategory === category ? { backgroundColor: primaryColor } : {}}
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

      {/* Hero Banner */}
      {config?.bannerUrl && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={config.bannerUrl}
              alt="Banner"
              className="w-full h-auto object-cover"
            />
            {config.bannerText && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h2 className="text-white text-2xl md:text-4xl font-bold text-center px-4">
                  {config.bannerText}
                </h2>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Default Hero if no banner */}
      {!config?.bannerUrl && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div 
            className="rounded-xl p-8 md:p-12 text-center text-white"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` 
            }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {storeName} এ স্বাগতম
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              সেরা মানের পণ্য সেরা দামে
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg font-bold transition hover:bg-gray-100"
              style={{ color: primaryColor }}
            >
              এখনই কিনুন
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Section Header */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {currentCategory || 'সব প্রোডাক্ট'}
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: primaryColor }}
          >
            সব দেখুন
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-8" ref={productGridRef}>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {featuredProducts.map((product) => {
              const discountAmount = getDiscountAmount(product.price, product.compareAtPrice);
              const isOnSale = discountAmount > 0;
              
              return (
                <article
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`} className="block relative">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Brand Logo Badge (top-left) */}
                    {logo && (
                      <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="" className="w-6 h-6 object-contain" />
                      </div>
                    )}

                    {/* ON SALE Badge (top-right) */}
                    {isOnSale && (
                      <div 
                        className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: cyanBadge }}
                      >
                        ON SALE
                      </div>
                    )}

                    {/* Discount Circle */}
                    {isOnSale && (
                      <div 
                        className="absolute bottom-2 right-2 w-14 h-14 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: redDiscount }}
                      >
                        <span>৳{discountAmount}</span>
                        <span className="text-[10px]">ছাড়</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-3">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quick Add Button */}
                    <AddToCartButton
                      productId={product.id}
                      className="w-full py-2 rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Quick Add
                    </AddToCartButton>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <ShoppingBag className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">শীঘ্রই আসছে!</h3>
            <p className="text-gray-500">নতুন পণ্য আসছে খুব শীঘ্রই।</p>
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">কেন আমাদের থেকে কিনবেন?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                ✨
              </div>
              <h3 className="text-lg font-bold mb-2">১০০% আসল পণ্য</h3>
              <p className="text-gray-600 text-sm">
                আমরা শুধুমাত্র খাঁটি এবং মানসম্পন্ন পণ্য বিক্রি করি।
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                🚚
              </div>
              <h3 className="text-lg font-bold mb-2">দ্রুত ডেলিভারি</h3>
              <p className="text-gray-600 text-sm">
                ঢাকায় ২৪ ঘণ্টা এবং সারা দেশে ২-৩ দিনে ডেলিভারি।
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                💰
              </div>
              <h3 className="text-lg font-bold mb-2">ক্যাশ অন ডেলিভারি</h3>
              <p className="text-gray-600 text-sm">
                পণ্য হাতে পেয়ে টাকা দিন। কোনো অগ্রিম টাকা নয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
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
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>COMPANY</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>

            {/* Quick Help */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>QUICK HELP</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/returns" className="text-gray-600 hover:text-gray-900">Return Policy</Link></li>
                <li><Link to="/refund" className="text-gray-600 hover:text-gray-900">Refund Policy</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold mb-4" style={{ color: primaryColor }}>CONTACT</h3>
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
          style={{ backgroundColor: primaryColor }}
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

      {/* Floating Contact Buttons from Config */}
      {config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber && (
        <a
          href={`https://wa.me/${config.floatingWhatsappNumber.replace(/\D/g, '').replace(/^01/, '8801')}?text=${encodeURIComponent(config.floatingWhatsappMessage || `হ্যালো ${storeName}, আমি জানতে চাই...`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="WhatsApp এ মেসেজ করুন"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
        </a>
      )}
      {config?.floatingCallEnabled && config?.floatingCallNumber && (
        <a
          href={`tel:${config.floatingCallNumber}`}
          className={`fixed bottom-20 ${config?.floatingWhatsappEnabled && config?.floatingWhatsappNumber ? 'right-20' : 'right-4'} z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
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
          className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition z-50"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition hover:opacity-90 z-50"
          style={{ backgroundColor: primaryColor }}
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
  );
}
