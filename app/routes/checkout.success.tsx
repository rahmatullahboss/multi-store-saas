/**
 * Checkout Success Page
 * 
 * Route: /checkout/success
 * 
 * Displayed after successful payment
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders, stores } from '@db/schema';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Payment Successful - Thank You!' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  const trxID = url.searchParams.get('trxID');

  if (!orderId) {
    return json({ order: null, store: null, trxID: null });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.id, parseInt(orderId)))
    .limit(1);

  if (orderResult.length === 0) {
    return json({ order: null, store: null, trxID });
  }

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, orderResult[0].storeId))
    .limit(1);

  return json({
    order: orderResult[0],
    store: storeResult[0] || null,
    trxID,
  });
}

export default function CheckoutSuccessPage() {
  const { order, store, trxID } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('paymentSuccessful')} 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          {t('thankYouOrder')}
        </p>

        {/* Order Details */}
        {order && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">{t('orderDetails')}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('orderNumber')}</span>
                <span className="font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              {trxID && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium text-gray-900">{trxID}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t('total')}</span>
                <span className="font-bold text-emerald-600">৳{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-emerald-700">
            ✓ We've received your payment and will start processing your order shortly.
          </p>
        </div>

        {/* Continue Shopping */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
        >
          {t('continueShopping')}
          <ArrowRight className="w-4 h-4" />
        </Link>

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
