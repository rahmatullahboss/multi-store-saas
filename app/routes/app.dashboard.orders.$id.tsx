/**
 * Order Detail Page
 * 
 * Route: /app/dashboard/orders/:id
 * 
 * Features:
 * - View order details
 * - Update order status
 * - Customer info display
 * - Order items list
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, Link, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders, orderItems, products } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { ArrowLeft, Package, User, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.order ? `Order ${data.order.orderNumber}` : 'Order Details' }];
};

// ============================================================================
// LOADER - Fetch order with items
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const orderId = parseInt(params.id || '0');
  if (!orderId) {
    throw new Response('Order not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch order
  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  if (orderResult.length === 0) {
    throw new Response('Order not found', { status: 404 });
  }

  const order = orderResult[0];

  // Fetch order items with product info
  const items = await db
    .select({
      id: orderItems.id,
      title: orderItems.title,
      quantity: orderItems.quantity,
      price: orderItems.price,
      total: orderItems.total,
      productId: orderItems.productId,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  // Get product images for items
  const itemsWithImages = await Promise.all(
    items.map(async (item) => {
      if (item.productId) {
        const product = await db
          .select({ imageUrl: products.imageUrl })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        return { ...item, imageUrl: product[0]?.imageUrl };
      }
      return { ...item, imageUrl: null };
    })
  );

  return json({ order, items: itemsWithImages });
}

// ============================================================================
// ACTION - Update order status
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = parseInt(params.id || '0');
  if (!orderId) {
    return json({ error: 'Order not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const status = formData.get('status') as string;

  if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  await db
    .update(orders)
    .set({ 
      status: status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      updatedAt: new Date() 
    })
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

  return json({ success: true });
}

// ============================================================================
// STATUS CONFIG
// ============================================================================
const statusOptions = [
  { value: 'pending', label: 'অপেক্ষমান (Pending)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'confirmed', label: 'কনফার্মড (Confirmed)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'processing', label: 'প্রসেসিং (Processing)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'shipped', label: 'শিপড (Shipped)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'delivered', label: 'ডেলিভার্ড (Delivered)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'cancelled', label: 'বাতিল (Cancelled)', color: 'bg-red-100 text-red-800 border-red-300' },
];

function StatusBadge({ status }: { status: string }) {
  const option = statusOptions.find(o => o.value === status) || statusOptions[0];
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${option.color}`}>
      {option.label}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OrderDetailPage() {
  const { order, items } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isUpdating = navigation.state === 'submitting';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
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

  // Parse shipping address if it's a JSON string
  let shippingAddress: { address?: string; city?: string; postalCode?: string } = {};
  try {
    if (order.shippingAddress) {
      shippingAddress = typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress;
    }
  } catch {
    shippingAddress = {};
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/app/dashboard/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-gray-600">{formatDate(order.createdAt as Date)}</p>
          </div>
          <StatusBadge status={order.status || 'pending'} />
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
        <Form method="post" className="flex flex-wrap gap-3">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="submit"
              name="status"
              value={option.value}
              disabled={isUpdating || order.status === option.value}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium transition
                ${order.status === option.value 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {order.status === option.value && <CheckCircle className="w-4 h-4 inline mr-1" />}
              {option.label.split(' ')[0]}
            </button>
          ))}
          {isUpdating && <Loader2 className="w-5 h-5 animate-spin text-emerald-600 self-center" />}
        </Form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            Customer
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href={`tel:${order.customerPhone}`} className="font-medium text-emerald-600 hover:underline">
                  {order.customerPhone || 'N/A'}
                </a>
              </div>
            </div>
            {order.customerEmail && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            Shipping Address
          </h2>
          <div className="space-y-1 text-gray-700">
            {shippingAddress.address && <p>{shippingAddress.address}</p>}
            {shippingAddress.city && <p>{shippingAddress.city}</p>}
            {shippingAddress.postalCode && <p>Postal: {shippingAddress.postalCode}</p>}
            {!shippingAddress.address && !shippingAddress.city && <p className="text-gray-400">No address provided</p>}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900">{formatPrice(order.shipping || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">{formatPrice(order.tax || 0)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-500" />
            Items ({items.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
