/**
 * Thank You Page
 * 
 * Displays order confirmation after successful order submission.
 * Route: /thank-you/$orderId
 * 
 * Includes Purchase tracking for FB Pixel and GA4.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { useEffect, useRef } from 'react';
import { trackingEvents } from '~/utils/tracking';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.order ? `অর্ডার কনফার্মড - ${data.order.orderNumber}` : 'অর্ডার কনফার্মড' },
    { name: 'robots', content: 'noindex' }, // Don't index thank you pages
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const orderId = params.orderId;
  
  if (!orderId || isNaN(Number(orderId))) {
    throw new Response('Order not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch order with items
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(orderId)))
    .limit(1);

  if (order.length === 0) {
    throw new Response('Order not found', { status: 404 });
  }

  // Fetch order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, Number(orderId)));

  // Fetch store info
  const store = await db
    .select({ name: stores.name, currency: stores.currency, planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, order[0].storeId))
    .limit(1);

  return json({
    order: order[0],
    items,
    storeName: store[0]?.name || 'Store',
    currency: store[0]?.currency || 'BDT',
    planType: store[0]?.planType || 'free',
  });
}

export default function ThankYouPage() {
  const { order, items, storeName, currency, planType } = useLoaderData<typeof loader>();
  const hasTracked = useRef(false);
  
  // Track Purchase event (FB Pixel + GA4) - only once on mount
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    
    trackingEvents.purchase({
      orderId: order.orderNumber,
      value: order.total,
      currency: currency,
      shipping: order.shipping || 0,
      tax: order.tax || 0,
      items: items.map(item => ({
        id: String(item.productId || item.id),
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.variantTitle || undefined,
        currency: currency,
      })),
    });
    
    console.log('[Tracking] Purchase event fired:', order.orderNumber, order.total);
  }, [order, items, currency]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-gray-900 text-white">
      {/* Success Animation */}
      <div className="container-store py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500 text-white text-5xl mb-6 animate-bounce">
              ✓
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              অর্ডার সফল হয়েছে! 🎉
            </h1>
            <p className="text-emerald-300 text-lg">
              ধন্যবাদ! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Order Header */}
            <div className="bg-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">অর্ডার নম্বর</p>
                <p className="text-xl font-bold text-emerald-400">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">তারিখ</p>
                <p className="font-medium">{order.createdAt ? formatDate(order.createdAt) : '-'}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold mb-3">অর্ডার আইটেম</h3>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-400">
                    {formatPrice(item.total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 border-b border-gray-700 space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>সাবটোটাল</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shipping && order.shipping > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>ডেলিভারি</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                <span>মোট</span>
                <span className="text-emerald-400">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold mb-3">ডেলিভারি তথ্য</h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="text-gray-500">নাম:</span> {order.customerName}
                </p>
                <p>
                  <span className="text-gray-500">ফোন:</span> {order.customerPhone}
                </p>
                <p>
                  <span className="text-gray-500">ঠিকানা:</span> {order.shippingAddress}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-4">
                <span className="text-3xl">💵</span>
                <div>
                  <p className="font-semibold">ক্যাশ অন ডেলিভারি</p>
                  <p className="text-sm text-gray-400">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mt-8 bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-center">এরপর কি হবে?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl mb-2">📞</div>
                <p className="text-sm text-gray-300">শীঘ্রই আমরা কল করে অর্ডার কনফার্ম করবো</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-sm text-gray-300">অর্ডার প্যাকেজিং ও শিপিং করা হবে</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🚚</div>
                <p className="text-sm text-gray-300">২-৫ দিনের মধ্যে ডেলিভারি পাবেন</p>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition"
            >
              ← আরও শপিং করুন
            </Link>
          </div>

          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} {storeName}</p>
            <p className="mt-1">যেকোনো প্রশ্নে কল করুন: 01XXXXXXXXX</p>

            {/* Viral Loop / Branding */}
            {planType === 'free' && (
              <div className="mt-8 pt-4 border-t border-gray-700/50 flex justify-center items-center">
                <a 
                  href="https://ozzyl.com?utm_source=thank-you-branding&utm_medium=referral" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 grayscale hover:grayscale-0"
                >
                  <span>Powered by</span>
                  <span className="font-bold tracking-tight text-sm text-gray-400">Ozzyl</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
