/**
 * Full Store Template
 * 
 * Traditional e-commerce layout with navigation, banners, and product grid.
 */

import { Link } from '@remix-run/react';
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
}

export function FullStoreTemplate({
  storeName,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
}: FullStoreTemplateProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const primaryColor = config?.primaryColor || '#6366f1';
  const accentColor = config?.accentColor || '#f59e0b';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Announcement Bar */}
      {config?.announcement && (
        <div 
          className="text-white text-center py-2 text-sm"
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
      <header className="store-header">
        <div className="container-store py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {logo && (
                <img src={logo} alt={storeName} className="h-10 w-auto" />
              )}
              <span className="text-2xl font-bold text-gray-900">{storeName}</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">Shop</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="cart-badge" id="cart-count">0</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {config?.bannerUrl && (
        <section className="relative h-[400px] md:h-[500px]">
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              {config.bannerText && (
                <h1 className="text-4xl md:text-6xl font-bold mb-6">{config.bannerText}</h1>
              )}
              <Link 
                to="/products"
                className="btn btn-primary text-lg px-8 py-3"
                style={{ backgroundColor: primaryColor }}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Collections */}
      {config?.collections && config.collections.length > 0 && (
        <section className="container-store py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Collections</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/?category=${encodeURIComponent(collection.name)}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200"
              >
                {collection.imageUrl && (
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{collection.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Nav */}
      {categories.length > 0 && (
        <nav className="bg-white border-b border-gray-100">
          <div className="container-store py-3">
            <div className="flex items-center gap-4 overflow-x-auto">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !currentCategory
                    ? 'text-white'
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
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    currentCategory === cat
                      ? 'text-white'
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
      <main className="container-store py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentCategory || 'All Products'}
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <Link to={`/products/${product.id}`}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-image flex items-center justify-center bg-gray-100">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>
                
                <div className="product-info">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="product-title">{product.title}</h3>
                  </Link>
                  
                  <div className="flex items-center mt-1">
                    <span className="product-price" style={{ color: primaryColor }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="product-price-compare">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  
                  <AddToCartButton productId={product.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-store">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">{storeName}</h4>
              <p className="text-sm">Quality products, delivered to your door.</p>
            </div>
            
            {config?.footerLinks && config.footerLinks.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-4">Links</h4>
                <ul className="space-y-2 text-sm">
                  {config.footerLinks.map((link, i) => (
                    <li key={i}>
                      <Link to={link.url} className="hover:text-white">{link.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
