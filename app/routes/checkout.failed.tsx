/**
 * Checkout Failed Page
 * 
 * Route: /checkout/failed
 * 
 * Displayed when payment fails
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Payment Failed' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  const error = url.searchParams.get('error');

  if (!orderId) {
    return json({ order: null, store: null, error: error || 'Payment failed' });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, parseInt(orderId)))
    .limit(1);

  if (orderResult.length === 0) {
    return json({ order: null, store: null, error: error || 'Order not found' });
  }

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, orderResult[0].storeId))
    .limit(1);

  return json({
    order: orderResult[0],
    store: storeResult[0] || null,
    error: error || 'Payment failed',
  });
}

export default function CheckoutFailedPage() {
  const { order, store, error } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Failed Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't process your payment. Please try again.
        </p>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-700">
            {error === 'payment_failed' ? 'The payment was not completed.' :
             error === 'execution_failed' ? 'Payment verification failed.' :
             error === 'verification_failed' ? 'Could not verify the payment.' :
             error}
          </p>
        </div>

        {/* Order Info */}
        {order && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
            <span className="text-gray-500">Order: </span>
            <span className="font-medium text-gray-900">{order.orderNumber}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {order && (
            <Link
              to={`/checkout?orderId=${order.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
          )}
          
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Store
          </Link>
        </div>

        {/* Store Name */}
        {store && (
          <p className="mt-6 text-sm text-gray-400">
            {store.name}
          </p>
        )}
      </div>
    </div>
  );
}
