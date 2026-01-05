/**
 * Template Preview Component
 * 
 * Shows a preview of how each landing page template looks with actual layout/design.
 * Features:
 * - Full template preview in modal/iframe
 * - Shows actual template structure (Modern Dark, Minimal Light, Video Focus)
 * - Mock product data for realistic preview
 */

import { X, ExternalLink, Maximize2, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import type { LandingConfig } from '@db/types';

// Mock product for preview
const MOCK_PRODUCT = {
  id: 1,
  storeId: 1,
  title: 'Premium Wireless Headphones Pro',
  description: 'Experience crystal-clear audio with our flagship wireless headphones. Features active noise cancellation, 40-hour battery life, and premium comfort.',
  price: 4999,
  compareAtPrice: 7999,
  imageUrl: null,
};

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  storeName: string;
  currency?: string;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  storeName,
  currency = 'BDT',
}: TemplatePreviewModalProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  if (!isOpen) return null;

  // Get template-specific preview content
  const getTemplatePreview = () => {
    switch (templateId) {
      case 'modern-dark':
        return <ModernDarkPreview storeName={storeName} currency={currency} />;
      case 'minimal-light':
        return <MinimalLightPreview storeName={storeName} currency={currency} />;
      case 'video-focus':
        return <VideoFocusPreview storeName={storeName} currency={currency} />;
      default:
        return <ModernDarkPreview storeName={storeName} currency={currency} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Preview Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Template Preview</h3>
              <p className="text-sm text-gray-400">
                Previewing: <span className="font-medium text-emerald-400">{templateName}</span>
              </p>
            </div>
          </div>
          
          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded-md transition ${
                deviceView === 'desktop' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded-md transition ${
                deviceView === 'mobile' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-4">
          <div 
            className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
              deviceView === 'mobile' 
                ? 'w-[375px] min-h-[667px]' 
                : 'w-full max-w-5xl'
            }`}
          >
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              {getTemplatePreview()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            👆 This shows how the <strong>{templateName}</strong> landing page template will look
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
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

// ============================================================================
// MODERN DARK TEMPLATE PREVIEW
// ============================================================================
function ModernDarkPreview({ storeName, currency }: { storeName: string; currency: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
            {storeName[0]}
          </div>
          <span className="font-bold text-lg">{storeName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <span className="hover:text-white cursor-pointer">Home</span>
          <span className="hover:text-white cursor-pointer">Features</span>
          <span className="hover:text-white cursor-pointer">Reviews</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <span className="inline-block px-4 py-1 bg-red-600/20 text-red-400 text-sm font-bold rounded-full mb-4">
          🔥 50% OFF - Limited Time Only!
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          {MOCK_PRODUCT.title}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          {MOCK_PRODUCT.description}
        </p>
        
        {/* Product Image Placeholder */}
        <div className="max-w-md mx-auto aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mb-8">
          <span className="text-6xl">🎧</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-4xl font-bold text-emerald-400">
            ৳{MOCK_PRODUCT.price.toLocaleString()}
          </span>
          <span className="text-xl text-gray-500 line-through">
            ৳{MOCK_PRODUCT.compareAtPrice?.toLocaleString()}
          </span>
        </div>

        {/* CTA */}
        <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform">
          Buy Now - 50% OFF
        </button>
        
        {/* Urgency */}
        <p className="mt-4 text-red-400 text-sm">
          ⚡ Only 12 left in stock - Order now!
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-12 bg-gray-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-sm text-gray-400">Nationwide delivery</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-sm text-gray-400">100% secure checkout</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">↩️</div>
            <h3 className="font-semibold">Easy Returns</h3>
            <p className="text-sm text-gray-400">30-day money back</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        © 2026 {storeName}. All rights reserved.
      </footer>
    </div>
  );
}

// ============================================================================
// MINIMAL LIGHT TEMPLATE PREVIEW
// ============================================================================
function MinimalLightPreview({ storeName, currency }: { storeName: string; currency: string }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="font-serif text-xl font-semibold tracking-wide">{storeName}</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Shop</span>
          <span className="hover:text-gray-900 cursor-pointer">About</span>
          <span className="hover:text-gray-900 cursor-pointer">Contact</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">New Arrival</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-6 leading-tight">
          {MOCK_PRODUCT.title}
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          {MOCK_PRODUCT.description}
        </p>

        {/* Product Image Placeholder */}
        <div className="max-w-lg mx-auto aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-10 border border-gray-100">
          <span className="text-8xl opacity-80">🎧</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-3xl font-light">
            ৳{MOCK_PRODUCT.price.toLocaleString()}
          </span>
          <span className="text-lg text-gray-400 line-through">
            ৳{MOCK_PRODUCT.compareAtPrice?.toLocaleString()}
          </span>
        </div>

        {/* CTA */}
        <button className="px-10 py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition">
          Add to Cart
        </button>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl mb-3">✨</div>
            <h3 className="font-medium mb-1">Premium Quality</h3>
            <p className="text-sm text-gray-500">Crafted with care</p>
          </div>
          <div>
            <div className="text-2xl mb-3">📦</div>
            <h3 className="font-medium mb-1">Free Delivery</h3>
            <p className="text-sm text-gray-500">On all orders</p>
          </div>
          <div>
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-medium mb-1">24/7 Support</h3>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        © 2026 {storeName}. Designed with simplicity.
      </footer>
    </div>
  );
}

// ============================================================================
// VIDEO FOCUS TEMPLATE PREVIEW
// ============================================================================
function VideoFocusPreview({ storeName, currency }: { storeName: string; currency: string }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Video Placeholder - Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-pink-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">▶️</span>
              </div>
              <p className="text-white/80 text-sm">Video would play here</p>
            </div>
          </div>
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-end p-8">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
            <span className="font-bold text-xl">{storeName}</span>
            <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm hover:bg-white/20 transition">
              Shop Now
            </button>
          </div>
          
          {/* Hero Text */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {MOCK_PRODUCT.title}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {MOCK_PRODUCT.description}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">৳{MOCK_PRODUCT.price.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">৳{MOCK_PRODUCT.compareAtPrice?.toLocaleString()}</span>
              </div>
              <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🎵', label: 'Hi-Fi Sound' },
              { icon: '🔋', label: '40h Battery' },
              { icon: '🎤', label: 'Clear Calls' },
              { icon: '🔇', label: 'ANC Pro' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-gray-900 rounded-xl">
                <div className="text-3xl mb-2">{item.icon}</div>
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Premium Audio?</h2>
          <p className="text-gray-300 mb-8">Join thousands of happy customers worldwide.</p>
          <button className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition">
            Order Now - 50% OFF
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 text-sm">
        © 2026 {storeName}. Powered by Multi-Store SaaS
      </footer>
    </div>
  );
}
