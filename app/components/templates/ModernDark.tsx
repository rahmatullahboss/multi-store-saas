/**
 * Modern Dark Template - High Converting Sales Page
 * 
 * ID: 'modern-dark'
 * Style: Bold fonts, urgency colors (Red/Orange), dark gradients
 * Features:
 * - Sticky mobile footer with CTA
 * - Inline order form (Cash on Delivery)
 * - useFetcher for AJAX submission
 * - Video embed support (YouTube/Vimeo)
 */

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Helper function to convert Vimeo URL to embed URL
function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice } from '~/contexts/LanguageContext';
import type { TemplateProps } from '~/templates/registry';

export function ModernDarkTemplate({
  storeName,
  storeId,
  product,
  config,
}: TemplateProps) {
  const fetcher = useFetcher<{
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    error?: string;
    details?: Record<string, string[]>;
  }>();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    quantity: 1,
  });

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data && !fetcher.data.success;

  // Format price using context (responds to language/currency toggle)
  const formatPrice = useFormatPrice();

  // Calculate discount
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const totalPrice = product.price * formData.quantity;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    fetcher.submit(
      {
        store_id: storeId,
        product_id: product.id,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        quantity: formData.quantity,
      },
      {
        method: 'POST',
        action: '/api/create-order',
        encType: 'application/json',
      }
    );
  };

  // Redirect to thank-you page on success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      // Redirect to thank-you page
      window.location.href = `/thank-you/${fetcher.data.orderId}`;
    }
  }, [fetcher.data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Urgency Bar */}
      {config.urgencyText && (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-bold animate-pulse">
          🔥 {config.urgencyText}
        </div>
      )}

      {/* Hero Section */}
      <section className="container-store py-8 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {config.headline}
            </span>
          </h1>
          
          {config.subheadline && (
            <p className="text-lg md:text-xl text-gray-300 text-center mb-8 max-w-2xl mx-auto">
              {config.subheadline}
            </p>
          )}

          {/* Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Product Image */}
            <div className="relative">
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  {discount}% OFF!
                </div>
              )}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-700 shadow-2xl ring-4 ring-yellow-500/20">
                {product.imageUrl ? (
                  <OptimizedImage
                    src={product.imageUrl}
                    alt={product.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-8xl">📦</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info & Order Form */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">{product.title}</h2>
              
              {product.description && (
                <p className="text-gray-300 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price Display */}
              <div className="flex items-center gap-4 py-4 border-y border-gray-700">
                <span className="text-4xl md:text-5xl font-extrabold text-emerald-400">
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
                <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-gray-300">
                    <strong className="text-white">{config.socialProof.count}+</strong> {config.socialProof.text}
                  </span>
                </div>
              )}

              {/* Features */}
              {config.features && config.features.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {config.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-gray-300">{feature.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Desktop Order Button */}
              <div className="hidden lg:block">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  🛒 অর্ডার করুন - {formatPrice(product.price)}
                </button>
                {config.ctaSubtext && (
                  <p className="text-center text-gray-400 text-sm mt-2">
                    ✓ {config.ctaSubtext}
                  </p>
                )}
              </div>

              {/* Guarantee Badge */}
              {config.guaranteeText && (
                <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <span className="text-emerald-400 font-medium">🛡️ {config.guaranteeText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="bg-gray-800/50 py-12">
          <div className="container-store">
            <h3 className="text-2xl font-bold text-center mb-8">আমাদের সন্তুষ্ট গ্রাহক</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {config.testimonials.map((t, i) => (
                <div key={i} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                  <p className="text-gray-300 mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-yellow-400">
                      {t.name[0]}
                    </div>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Embed Section */}
      {config.videoUrl && (
        <section className="py-12 bg-gray-900">
          <div className="container-store">
            <h3 className="text-2xl font-bold text-center mb-8">🎬 পণ্যের ভিডিও দেখুন</h3>
            <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-500/20">
              {config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(config.videoUrl)}
                  title="Product Video"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : config.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={getVimeoEmbedUrl(config.videoUrl)}
                  title="Product Video"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={config.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Order Form Modal/Section */}
      {(showForm || isSuccess) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end lg:items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-t-2xl lg:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            {isSuccess ? (
              // Success Message
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                  অর্ডার সম্পন্ন হয়েছে!
                </h3>
                <p className="text-gray-300 mb-4">
                  অর্ডার নম্বর: <strong className="text-white">{fetcher.data?.orderNumber}</strong>
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => {
                    setShowForm(false);
                    // Reset fetcher
                    window.location.reload();
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  বন্ধ করুন
                </button>
              </div>
            ) : (
              // Order Form
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">অর্ডার ফর্ম</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-800 rounded-full"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Summary */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <OptimizedImage
                        src={product.imageUrl}
                        alt={product.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{product.title}</p>
                    <p className="text-emerald-400 font-bold">{formatPrice(product.price)}</p>
                  </div>
                </div>

                {/* Error Display */}
                {hasError && (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
                    <p className="font-medium">{fetcher.data?.error}</p>
                    {fetcher.data?.details && (
                      <ul className="text-sm mt-2 list-disc list-inside">
                        {Object.entries(fetcher.data.details).map(([field, errors]) => (
                          <li key={field}>{field}: {errors.join(', ')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">পরিমাণ</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold w-12 text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(d => ({ ...d, quantity: Math.min(10, d.quantity + 1) }))}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold"
                      >
                        +
                      </button>
                      <span className="ml-auto text-emerald-400 font-bold">
                        = {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={formData.customer_name}
                      onChange={(e) => setFormData(d => ({ ...d, customer_name: e.target.value }))}
                      placeholder="সম্পূর্ণ নাম লিখুন"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      minLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))}
                      placeholder="০১XXXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">সম্পূর্ণ ঠিকানা *</label>
                    <textarea
                      required
                      minLength={10}
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData(d => ({ ...d, address: e.target.value }))}
                      placeholder="বাড়ি নং, রাস্তা, এলাকা, শহর"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-medium">ক্যাশ অন ডেলিভারি</p>
                      <p className="text-sm text-gray-400">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white text-lg font-bold rounded-xl shadow-lg transition"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        অপেক্ষা করুন...
                      </span>
                    ) : (
                      `✓ অর্ডার কনফার্ম করুন - ${formatPrice(totalPrice)}`
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 p-4 safe-area-pb">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <span>🛒 অর্ডার করুন</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {formatPrice(product.price)}
          </span>
        </button>
      </div>

      {/* Footer Spacer for Mobile */}
      <div className="lg:hidden h-24" />

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container-store text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p className="mt-2">
            Powered by <span className="text-orange-400">Multi-Store SaaS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
