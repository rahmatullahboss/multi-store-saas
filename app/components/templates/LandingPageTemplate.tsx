/**
 * Landing Page Template
 * 
 * High-converting single-product sales page.
 * No navigation, focused on conversion with direct checkout.
 */

import { Link } from '@remix-run/react';
import type { LandingConfig } from '@db/types';
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

interface LandingPageTemplateProps {
  storeName: string;
  product: SerializedProduct;
  config: LandingConfig;
  currency: string;
}

export function LandingPageTemplate({ 
  storeName, 
  product, 
  config, 
  currency 
}: LandingPageTemplateProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Urgency Bar */}
      {config.urgencyText && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium animate-pulse">
          🔥 {config.urgencyText}
        </div>
      )}

      {/* Hero Section */}
      <section className="container-store py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {config.headline}
          </h1>
          {config.subheadline && (
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              {config.subheadline}
            </p>
          )}
        </div>
      </section>

      {/* Product Showcase */}
      <section className="container-store py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <div className="relative">
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                {discount}% OFF
              </div>
            )}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-700 shadow-2xl">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 text-6xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info & CTA */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              {product.title}
            </h2>
            
            {product.description && (
              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-emerald-400">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-2xl text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Social Proof */}
            {config.socialProof && (
              <div className="flex items-center gap-2 text-yellow-400">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="text-white">
                  {config.socialProof.count}+ {config.socialProof.text}
                </span>
              </div>
            )}

            {/* CTA Button */}
            <div className="space-y-3">
              <AddToCartButton 
                productId={product.id} 
                size="large"
              />
              {config.ctaSubtext && (
                <p className="text-center text-gray-400 text-sm">
                  ✓ {config.ctaSubtext}
                </p>
              )}
            </div>

            {/* Guarantee */}
            {config.guaranteeText && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <span className="text-emerald-400">🛡️ {config.guaranteeText}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      {config.features && config.features.length > 0 && (
        <section className="container-store py-16 border-t border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">Why Choose Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.features.map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="container-store py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">What People Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.testimonials.map((t, i) => (
                <div key={i} className="bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span>{t.name[0]}</span>
                      )}
                    </div>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {config.videoUrl && (
        <section className="container-store py-16">
          <div className="max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden bg-gray-700">
            <iframe
              src={config.videoUrl}
              title="Product Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="container-store py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <div className="flex justify-center">
            <AddToCartButton productId={product.id} size="large" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8">
        <div className="container-store text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
