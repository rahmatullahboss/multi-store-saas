/**
 * Video Focus Template - Video-First Sales Page
 * ID: 'video-focus'
 * Style: Full-width video hero, dark mode, overlay text
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice } from '~/contexts/LanguageContext';
import type { TemplateProps } from '~/templates/registry';

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1` : url;
}

export function VideoFocusTemplate({ storeName, storeId, product, config }: TemplateProps) {
  const fetcher = useFetcher<{ success: boolean; orderId?: number; orderNumber?: string; error?: string; details?: Record<string, string[]> }>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', phone: '', address: '', quantity: 1 });
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data && !fetcher.data.success;
  const formatPrice = useFormatPrice();
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const totalPrice = product.price * formData.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit({ store_id: storeId, product_id: product.id, customer_name: formData.customer_name, phone: formData.phone, address: formData.address, quantity: formData.quantity }, { method: 'POST', action: '/api/create-order', encType: 'application/json' });
  };

  useEffect(() => { if (fetcher.data?.success && fetcher.data?.orderId) window.location.href = `/thank-you/${fetcher.data.orderId}`; }, [fetcher.data]);

  const hasVideo = config.videoUrl && (config.videoUrl.includes('youtube') || config.videoUrl.includes('youtu.be') || config.videoUrl.includes('vimeo') || config.videoUrl.endsWith('.mp4'));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Hero Section */}
      <section className="relative">
        {hasVideo ? (
          <div className="relative w-full aspect-video max-h-[70vh]">
            {config.videoUrl!.includes('youtube') || config.videoUrl!.includes('youtu.be') ? (
              <iframe src={getYouTubeEmbedUrl(config.videoUrl!)} title="Product Video" className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : config.videoUrl!.includes('vimeo') ? (
              <iframe src={getVimeoEmbedUrl(config.videoUrl!)} title="Product Video" className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            ) : (
              <video src={config.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">{config.headline}</h1>
                {config.subheadline && <p className="text-lg md:text-xl text-gray-200 max-w-2xl">{config.subheadline}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-video max-h-[70vh] bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
            <div className="text-center p-6">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">{config.headline}</h1>
              {config.subheadline && <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">{config.subheadline}</p>}
            </div>
          </div>
        )}
      </section>

      {/* Product Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Product Image */}
            <div className="relative">
              {discount > 0 && <div className="absolute top-4 left-4 z-10 bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">{discount}% OFF</div>}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-purple-500/30">
                {product.imageUrl ? <OptimizedImage src={product.imageUrl} alt={product.title} width={600} height={600} className="w-full h-full object-cover" priority /> : <div className="w-full h-full flex items-center justify-center bg-gray-800"><span className="text-8xl">📦</span></div>}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold">{product.title}</h2>
              {product.description && <p className="text-gray-400 text-lg">{product.description}</p>}
              <div className="flex items-center gap-4 py-4 border-y border-gray-700">
                <span className="text-4xl md:text-5xl font-extrabold text-purple-400">{formatPrice(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-2xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>}
              </div>
              {config.socialProof && <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg"><span className="text-yellow-400">★★★★★</span><span className="text-gray-300"><strong className="text-white">{config.socialProof.count}+</strong> {config.socialProof.text}</span></div>}
              {config.features && config.features.length > 0 && <div className="grid grid-cols-2 gap-3">{config.features.slice(0, 4).map((f, i) => <div key={i} className="flex items-center gap-2 text-sm"><span className="text-xl">{f.icon}</span><span className="text-gray-300">{f.title}</span></div>)}</div>}
              <button onClick={() => setShowForm(true)} className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02]">🛒 {config.ctaText || 'Order Now'} — {formatPrice(product.price)}</button>
              {config.ctaSubtext && <p className="text-center text-gray-500 text-sm">✓ {config.ctaSubtext}</p>}
              {config.guaranteeText && <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center"><span className="text-purple-400 font-medium">🛡️ {config.guaranteeText}</span></div>}
            </div>
          </div>
        </div>
      </section>

      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-16 bg-gray-900">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-10">Customer Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.testimonials.map((t, i) => <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"><p className="text-gray-300 mb-4">"{t.text}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center font-bold text-purple-300">{t.name[0]}</div><span className="font-medium">{t.name}</span></div></div>)}
            </div>
          </div>
        </section>
      )}

      {/* Order Form Modal */}
      {(showForm || isSuccess) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end lg:items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-t-2xl lg:rounded-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-700">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Order Confirmed!</h3>
                <p className="text-gray-300 mb-4">Order Number: <strong className="text-white">{fetcher.data?.orderNumber}</strong></p>
                <button onClick={() => { setShowForm(false); window.location.reload(); }} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">Order Form</h3><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-800 rounded-full">✕</button></div>
                <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">{product.imageUrl ? <OptimizedImage src={product.imageUrl} alt={product.title} width={64} height={64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}</div>
                  <div className="flex-1"><p className="font-medium line-clamp-1">{product.title}</p><p className="text-purple-400 font-bold">{formatPrice(product.price)}</p></div>
                </div>
                {hasError && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4"><p className="font-medium">{fetcher.data?.error}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label><div className="flex items-center gap-3"><button type="button" onClick={() => setFormData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold">-</button><span className="text-xl font-bold w-12 text-center">{formData.quantity}</span><button type="button" onClick={() => setFormData(d => ({ ...d, quantity: Math.min(10, d.quantity + 1) }))} className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold">+</button><span className="ml-auto text-purple-400 font-bold">= {formatPrice(totalPrice)}</span></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Your Name *</label><input type="text" required minLength={2} value={formData.customer_name} onChange={(e) => setFormData(d => ({ ...d, customer_name: e.target.value }))} placeholder="Full name" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label><input type="tel" required minLength={10} value={formData.phone} onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Delivery Address *</label><textarea required minLength={10} rows={3} value={formData.address} onChange={(e) => setFormData(d => ({ ...d, address: e.target.value }))} placeholder="House, Street, Area, City" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" /></div>
                  <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3"><span className="text-2xl">💵</span><div><p className="font-medium">Cash on Delivery</p><p className="text-sm text-gray-400">Pay when you receive</p></div></div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white text-lg font-bold rounded-xl shadow-lg">{isSubmitting ? 'Processing...' : `Confirm Order — ${formatPrice(totalPrice)}`}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 p-4 safe-area-pb">
        <button onClick={() => setShowForm(true)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"><span>🛒 Order Now</span><span className="bg-white/20 px-3 py-1 rounded-full text-sm">{formatPrice(product.price)}</span></button>
      </div>
      <div className="lg:hidden h-24" />

      <footer className="bg-black border-t border-gray-800 py-8"><div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm"><p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p></div></footer>
    </div>
  );
}
