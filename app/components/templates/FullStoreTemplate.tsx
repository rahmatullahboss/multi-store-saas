/**
 * Full Store Template
 * 
 * Traditional e-commerce layout with navigation, banners, and product grid.
 * Rich design with multiple sections for conversion.
 */

import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ThemeConfig } from '@db/types';
import { AddToCartButton } from '~/components/AddToCartButton';

// Serialized product type (JSON converts Date to string)
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  inventory: number | null;
  sku: string | null;
  imageUrl: string | null;
  images: string | null;
  category: string | null;
  tags: string | null;
  isPublished: boolean | null;
}

interface FullStoreTemplateProps {
  storeName: string;
  logo?: string | null;
  products: SerializedProduct[];
  categories: (string | null)[];
  currentCategory?: string | null;
  config: ThemeConfig | null;
  currency: string;
  planType?: string;
}

export function FullStoreTemplate({
  storeName,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  planType = 'free',
}: FullStoreTemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const primaryColor = config?.primaryColor || '#6366f1';
  const accentColor = config?.accentColor || '#f59e0b';

  // Get featured/new products
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      {config?.announcement && (
        <div 
          className="text-white text-center py-2.5 text-sm font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          {config.announcement.link ? (
            <Link to={config.announcement.link} className="hover:underline">
              {config.announcement.text}
            </Link>
          ) : (
            config.announcement.text
          )}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {logo && (
                <img src={logo} alt={storeName} className="h-10 w-auto" />
              )}
              <span className="text-2xl font-bold text-gray-900">{storeName}</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900 font-medium">Shop</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</Link>
            </nav>
            
            <div className="flex items-center gap-2">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg transition active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              
              <Link to="/cart" className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-full transition active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" id="cart-count">0</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition active:scale-[0.98]"
              >
                Home
              </Link>
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition active:scale-[0.98]"
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition active:scale-[0.98]"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[44px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition active:scale-[0.98]"
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Banner */}
      {config?.bannerUrl ? (
        <section className="relative h-[400px] md:h-[600px]">
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-xl">
                {config.bannerText && (
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">{config.bannerText}</h1>
                )}
                <p className="text-xl text-white/90 mb-8">Discover our latest collection with premium quality and style.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/products"
                    className="px-8 py-4 min-h-[48px] text-lg font-semibold rounded-xl text-white transition transform hover:scale-105 active:scale-95 shadow-lg text-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Shop Now
                  </Link>
                  <Link 
                    to="/about"
                    className="px-8 py-4 min-h-[48px] bg-white/20 backdrop-blur-sm hover:bg-white/30 active:scale-95 text-white text-lg font-semibold rounded-xl transition text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Welcome to {storeName}</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Discover our amazing products with the best quality and prices.</p>
            <Link 
              to="/products"
              className="inline-flex items-center px-8 py-4 min-h-[48px] text-lg font-semibold rounded-xl text-white transition transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Explore Products
            </Link>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-bold text-gray-900">Free Shipping</h4>
              <p className="text-sm text-gray-500">On orders over ৳1000</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">💯</div>
              <h4 className="font-bold text-gray-900">Original Products</h4>
              <p className="text-sm text-gray-500">100% Authentic</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">💵</div>
              <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-bold text-gray-900">Easy Returns</h4>
              <p className="text-sm text-gray-500">7-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      {config?.collections && config.collections.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 text-lg">Browse our curated collections</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {config.collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/?category=${encodeURIComponent(collection.name)}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-lg"
                >
                  {collection.imageUrl && (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                    <div className="p-6 w-full">
                      <span className="text-white font-bold text-xl">{collection.name}</span>
                      <p className="text-white/80 text-sm mt-1">Shop Now →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-2">Our most popular items</p>
              </div>
              <Link 
                to="/products" 
                className="hidden md:flex items-center gap-2 font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredProducts.map((product) => (
                <article key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl transition-shadow">
                  <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="p-5">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 hover:underline">{product.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xl font-bold" style={{ color: primaryColor }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-white active:scale-95 transition"
                style={{ backgroundColor: primaryColor }}
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Nav */}
      {categories.length > 0 && (
        <nav className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <span className="text-gray-500 font-medium flex-shrink-0">Filter:</span>
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !currentCategory
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={!currentCategory ? { backgroundColor: primaryColor } : {}}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`?category=${encodeURIComponent(cat!)}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    currentCategory === cat
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={currentCategory === cat ? { backgroundColor: primaryColor } : {}}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products Grid */}
      <main className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {currentCategory || 'All Products'}
            </h2>
            <p className="text-gray-500">{products.length} products</p>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-xl">No products found</p>
              <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <article key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl transition-shadow">
                  <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="p-5">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 hover:underline">{product.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xl font-bold" style={{ color: primaryColor }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 text-lg mb-8">Subscribe to get special offers, free giveaways, and updates.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
            />
            <button 
              type="submit"
              className="px-8 py-4 min-h-[48px] rounded-xl font-semibold transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">We're committed to providing the best shopping experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${primaryColor}20` }}>
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600">We carefully select each product to ensure the highest quality standards.</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${primaryColor}20` }}>
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep within 24-48 hours.</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${primaryColor}20` }}>
                💬
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is always ready to help you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {logo && <img src={logo} alt={storeName} className="h-10 w-auto" />}
                <span className="text-2xl font-bold text-white">{storeName}</span>
              </div>
              <p className="text-gray-400 mb-6">Quality products with excellent customer service. We're here to make your shopping experience amazing.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <span className="text-lg">📸</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <span className="text-lg">🐦</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Shop</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Customer Service</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white transition">Returns & Exchange</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">We accept:</span>
              <span>💵 Cash</span>
              <span>📱 bKash</span>
              <span>💳 Card</span>
            </div>
          </div>

          {/* Viral Loop / Branding */}
          {planType === 'free' && (
            <div className="mt-8 pt-4 border-t border-gray-800 flex justify-center items-center">
              <a 
                href="https://ozzy.com?utm_source=full-store-branding&utm_medium=referral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
              >
                <span>Powered by</span>
                <span className="font-bold tracking-tight text-sm text-gray-400">Ozzyl</span>
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
