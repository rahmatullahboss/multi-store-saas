/**
 * Theme Preview Component
 * 
 * Shows a live preview of how the storefront will look with the selected theme.
 * Features:
 * - Mini storefront mockup
 * - Real-time theme color application
 * - Product card preview
 * - Header/Footer preview
 */

import { presetThemes, fontOptions, type ThemeColors } from '~/lib/theme';
import { X, ShoppingBag, Heart, Star, Home, Search } from 'lucide-react';

interface ThemePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  fontFamily: string;
  storeName: string;
  logo?: string | null;
}

export function ThemePreview({
  isOpen,
  onClose,
  theme,
  fontFamily,
  storeName,
  logo,
}: ThemePreviewProps) {
  if (!isOpen) return null;

  // Get theme colors
  const colors: ThemeColors = presetThemes[theme] || presetThemes.default;
  const font = fontOptions.find(f => f.value === fontFamily) || fontOptions[0];
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Preview Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme Preview</h3>
            <p className="text-sm text-gray-500">
              Previewing: <span className="font-medium capitalize">{theme}</span> theme with <span className="font-medium">{font.label}</span> font
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Font Link */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={font.url} rel="stylesheet" />

        {/* Preview Content */}
        <div 
          className="overflow-hidden"
          style={{ fontFamily: font.family }}
        >
          {/* Mini Storefront Preview */}
          <div 
            className="min-h-[500px]"
            style={{ 
              backgroundColor: colors.background,
              color: colors.textPrimary,
            }}
          >
            {/* Preview Header */}
            <header 
              className="border-b shadow-sm"
              style={{ 
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
              }}
            >
              <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img 
                      src={logo} 
                      alt={storeName} 
                      className="w-8 h-8 object-contain rounded"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {storeName[0]}
                    </div>
                  )}
                  <span 
                    className="font-bold text-lg"
                    style={{ color: colors.textPrimary }}
                  >
                    {storeName}
                  </span>
                </div>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-6">
                  {['Home', 'Products', 'Categories', 'Contact'].map((item) => (
                    <span 
                      key={item}
                      className="text-sm font-medium cursor-pointer transition hover:opacity-80"
                      style={{ color: colors.textSecondary }}
                    >
                      {item}
                    </span>
                  ))}
                </nav>

                {/* Cart */}
                <div className="flex items-center gap-3">
                  <div 
                    className="relative p-2 rounded-full cursor-pointer transition"
                    style={{ color: colors.textSecondary }}
                  >
                    <Search className="w-5 h-5" />
                  </div>
                  <div 
                    className="relative p-2 rounded-full cursor-pointer transition"
                    style={{ color: colors.textSecondary }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span 
                      className="absolute -top-1 -right-1 w-4 h-4 text-xs text-white rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.accent }}
                    >
                      3
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section 
              className="py-12 px-4"
              style={{ 
                background: isDark 
                  ? `linear-gradient(135deg, ${colors.primary}30, ${colors.accent}20)`
                  : `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)`,
              }}
            >
              <div className="max-w-4xl mx-auto text-center">
                <h1 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  Welcome to {storeName}
                </h1>
                <p 
                  className="text-lg mb-6 max-w-xl mx-auto"
                  style={{ color: colors.textSecondary }}
                >
                  Discover our amazing collection of premium products
                </p>
                <button
                  className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: colors.primary }}
                >
                  Shop Now
                </button>
              </div>
            </section>

            {/* Products Section */}
            <section className="py-8 px-4">
              <div className="max-w-4xl mx-auto">
                <h2 
                  className="text-xl font-bold mb-6"
                  style={{ color: colors.textPrimary }}
                >
                  Featured Products
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Mock Product Cards */}
                  {[
                    { name: 'Premium Headphones', price: 2999, oldPrice: 3999 },
                    { name: 'Smart Watch Pro', price: 4599, oldPrice: null },
                    { name: 'Wireless Earbuds', price: 1299, oldPrice: 1999 },
                    { name: 'Laptop Stand', price: 899, oldPrice: 1199 },
                  ].map((product, i) => (
                    <div 
                      key={i}
                      className="rounded-xl overflow-hidden border transition hover:shadow-lg"
                      style={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      {/* Product Image Placeholder */}
                      <div 
                        className="aspect-square relative"
                        style={{ 
                          background: isDark 
                            ? `linear-gradient(135deg, ${colors.primary}20, ${colors.accent}10)`
                            : `linear-gradient(135deg, ${colors.primary}10, ${colors.accent}05)`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-16 h-16 rounded-full opacity-50 flex items-center justify-center"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <ShoppingBag className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        {product.oldPrice && (
                          <span 
                            className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white rounded"
                            style={{ backgroundColor: colors.accent }}
                          >
                            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                          </span>
                        )}
                        <button 
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition"
                        >
                          <Heart className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 
                          className="font-medium text-sm mb-1 line-clamp-2"
                          style={{ color: colors.textPrimary }}
                        >
                          {product.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, j) => (
                            <Star 
                              key={j} 
                              className="w-3 h-3" 
                              fill={j < 4 ? '#facc15' : 'transparent'}
                              stroke={j < 4 ? '#facc15' : colors.textSecondary}
                            />
                          ))}
                          <span 
                            className="text-xs ml-1"
                            style={{ color: colors.textSecondary }}
                          >
                            (24)
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-bold"
                            style={{ color: colors.primary }}
                          >
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.oldPrice && (
                            <span 
                              className="text-xs line-through"
                              style={{ color: colors.textSecondary }}
                            >
                              ৳{product.oldPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart */}
                        <button
                          className="w-full mt-3 py-2 text-xs font-medium text-white rounded-lg transition hover:opacity-90"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer Preview */}
            <footer 
              className="py-6 px-4 border-t"
              style={{ 
                backgroundColor: isDark ? '#111827' : '#1f2937',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-sm text-gray-400">
                  © 2026 {storeName}. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Powered by Multi-Store SaaS
                </p>
              </div>
            </footer>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            👆 This is how your store will look with the <strong className="capitalize">{theme}</strong> theme
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Close Preview
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
