import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, or, desc } from 'drizzle-orm';
import { orders, stores, orderItems, products } from '@db/schema';
import { OrderStatusTimeline } from '~/components/OrderStatusTimeline';
import { formatCurrency } from '~/utils/money';
import { MessageCircle, Store, Package } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.order ? `Track Order ${data.order.orderNumber}` : 'Track Order' },
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const orderIdentifier = params.orderId;
  if (!orderIdentifier) {
    throw new Response('Order not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Try to find order by orderNumber or ID
  const isNumeric = !isNaN(Number(orderIdentifier));
  const orderResult = await db
    .select()
    .from(orders)
    .where(
      isNumeric
        ? or(
            eq(orders.orderNumber, orderIdentifier),
            eq(orders.id, Number(orderIdentifier))
          )
        : eq(orders.orderNumber, orderIdentifier)
    )
    .limit(1);

  if (orderResult.length === 0) {
    throw new Response('Order not found', { status: 404 });
  }

  const order = orderResult[0];

  // Fetch store info
  const storeResult = await db
    .select({
      name: stores.name,
      logo: stores.logo,
      currency: stores.currency,
      socialLinks: stores.socialLinks,
    })
    .from(stores)
    .where(eq(stores.id, order.storeId))
    .limit(1);

  const store = storeResult[0];

  // Parse social links to get WhatsApp
  let whatsappNumber = null;
  if (store?.socialLinks) {
    try {
      const links = JSON.parse(store.socialLinks);
      whatsappNumber = links.whatsapp;
    } catch (e) {
      // Ignore parse error
    }
  }

  // Fetch order items with product imagery
  const items = await db
    .select({
      title: orderItems.title,
      quantity: orderItems.quantity,
      imageUrl: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    order: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    },
    store: {
      name: store?.name || 'Store',
      logo: store?.logo,
      currency: store?.currency || 'BDT',
      whatsapp: whatsappNumber,
    },
    items,
  };
}

export default function TrackOrder() {
  const { order, store, items } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Store Header */}
        <div className="flex flex-col items-center mb-8">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              className="h-16 w-auto object-contain mb-4 rounded-lg"
            />
          ) : (
            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-400">
              <Store className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              {order.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customer</p>
              <p className="text-base text-gray-900">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-10 h-10 rounded object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-base font-semibold text-gray-900">Total</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(order.total, store.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Component */}
        <OrderStatusTimeline
          status={order.status as any}
          createdAt={order.createdAt || new Date()}
        />

        {/* Contact WhatsApp */}
        {store.whatsapp ? (
          <a
            href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, I have a question about my order #${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#20bd5a] transition shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Store on WhatsApp
          </a>
        ) : (
          <div className="text-center text-sm text-gray-500 mt-4">
            Need help? Contact {store.name} support.
          </div>
        )}
      </div>
    </div>
  );
}
