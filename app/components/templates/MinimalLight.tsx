/**
 * Minimal Light Template - Clean & Elegant Sales Page
 * ID: 'minimal-light'
 * Style: White background, centered typography, large hero image
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useFormatPrice } from '~/contexts/LanguageContext';
import type { TemplateProps } from '~/templates/registry';

export function MinimalLightTemplate({ storeName, storeId, product, config }: TemplateProps) {
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {config.urgencyText && <div className="bg-emerald-600 text-white text-center py-2.5 px-4 text-sm font-medium">✨ {config.urgencyText}</div>}
      <header className="border-b border-gray-100 py-4"><div className="max-w-6xl mx-auto px-4"><h1 className="text-xl font-semibold text-center">{storeName}</h1></div></header>

      <section className="py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{config.headline}</h2>
            {config.subheadline && <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">{config.subheadline}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              {discount > 0 && <div className="absolute top-4 right-4 z-10 bg-rose-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">-{discount}%</div>}
              <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-sm">
                {product.imageUrl ? <OptimizedImage src={product.imageUrl} alt={product.title} width={700} height={700} className="w-full h-full object-cover" priority /> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><span className="text-8xl text-gray-300">📦</span></div>}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{product.title}</h3>
                {product.description && <p className="text-gray-600 text-lg">{product.description}</p>}
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-emerald-600">{formatPrice(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
              </div>
              {config.features && config.features.length > 0 && <div className="space-y-3">{config.features.slice(0, 4).map((f, i) => <div key={i} className="flex items-center gap-3"><span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-lg">{f.icon}</span><span className="font-medium">{f.title}</span></div>)}</div>}
              {config.socialProof && <div className="flex items-center gap-2 text-gray-600"><span className="text-yellow-500">★★★★★</span><span><strong className="text-gray-900">{config.socialProof.count}+</strong> {config.socialProof.text}</span></div>}
              <div>
                <button onClick={() => setShowForm(true)} className="w-full py-4 px-8 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all hover:shadow-xl">{config.ctaText || 'Order Now'} — {formatPrice(product.price)}</button>
                {config.ctaSubtext && <p className="text-center text-gray-500 text-sm mt-3">✓ {config.ctaSubtext}</p>}
              </div>
              {config.guaranteeText && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center"><span className="text-emerald-700 font-medium">🛡️ {config.guaranteeText}</span></div>}
            </div>
          </div>
        </div>
      </section>

      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-10">What Our Customers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.testimonials.map((t, i) => <div key={i} className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-gray-600 mb-4 italic">"{t.text}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-600">{t.name[0]}</div><span className="font-medium">{t.name}</span></div></div>)}
            </div>
          </div>
        </section>
      )}

      {(showForm || isSuccess) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end lg:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl lg:rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✓</span></div>
                <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-4">Order Number: <strong>{fetcher.data?.orderNumber}</strong></p>
                <button onClick={() => { setShowForm(false); window.location.reload(); }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">Order Form</h3><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">✕</button></div>
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">{product.imageUrl ? <OptimizedImage src={product.imageUrl} alt={product.title} width={64} height={64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}</div>
                  <div className="flex-1"><p className="font-medium line-clamp-1">{product.title}</p><p className="text-emerald-600 font-bold">{formatPrice(product.price)}</p></div>
                </div>
                {hasError && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-4"><p className="font-medium">{fetcher.data?.error}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label><div className="flex items-center gap-3"><button type="button" onClick={() => setFormData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-xl font-medium">-</button><span className="text-xl font-semibold w-12 text-center">{formData.quantity}</span><button type="button" onClick={() => setFormData(d => ({ ...d, quantity: Math.min(10, d.quantity + 1) }))} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl text-xl font-medium">+</button><span className="ml-auto text-emerald-600 font-bold">= {formatPrice(totalPrice)}</span></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label><input type="text" required minLength={2} value={formData.customer_name} onChange={(e) => setFormData(d => ({ ...d, customer_name: e.target.value }))} placeholder="Full name" className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none border-0" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label><input type="tel" required minLength={10} value={formData.phone} onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none border-0" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label><textarea required minLength={10} rows={3} value={formData.address} onChange={(e) => setFormData(d => ({ ...d, address: e.target.value }))} placeholder="House, Street, Area, City" className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none border-0 resize-none" /></div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3"><span className="text-2xl">💵</span><div><p className="font-medium">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when you receive your order</p></div></div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-lg font-semibold rounded-xl shadow-lg">{isSubmitting ? 'Processing...' : `Confirm Order — ${formatPrice(totalPrice)}`}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 safe-area-pb"><button onClick={() => setShowForm(true)} className="w-full py-4 bg-gray-900 text-white text-lg font-semibold rounded-xl shadow-lg flex items-center justify-center gap-3"><span>Order Now</span><span className="bg-white/20 px-3 py-1 rounded-full text-sm">{formatPrice(product.price)}</span></button></div>
      <div className="lg:hidden h-24" />
      <footer className="bg-gray-50 border-t border-gray-100 py-8"><div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm"><p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p></div></footer>
    </div>
  );
}
