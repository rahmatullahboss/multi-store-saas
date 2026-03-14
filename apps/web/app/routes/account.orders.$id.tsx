import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerOrderWithDetails } from '~/services/customer-account.server';
import { OrderStatusBadge } from '~/components/account/OrderStatusBadge';
import { Separator } from '~/components/ui/separator';
import { format } from 'date-fns';
import {
  ShoppingBag,
  XCircle,
  Truck,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Receipt,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { cn } from '~/lib/utils';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { store, storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const orderId = Number(params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) throw new Response('Invalid Order ID', { status: 400 });

  const db = drizzle(env.DB, { schema });
  const orderData = await getCustomerOrderWithDetails(orderId, customerId, storeId, db);

  if (!orderData) throw new Response('Order not found', { status: 404 });

  return json({ 
    ...orderData, 
    storeCurrency: store.currency 
  });
}



export default function OrderDetails() {
  const { order, items, shipment, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const shippingAddress = (() => {
    if (!order.shippingAddress) return null;
    try {
      return JSON.parse(order.shippingAddress as string) as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        zip?: string;
      };
    } catch {
      return null;
    }
  })();

  const pricing = (() => {
    if (!order.pricingJson) return null;
    try {
      return JSON.parse(order.pricingJson as string) as {
        subtotal?: number;
        discount?: number;
        shipping?: number;
      };
    } catch {
      return null;
    }
  })();
  const pricingSubtotal = pricing?.subtotal ?? order.total;
  const pricingDiscount = pricing?.discount ?? 0;
  const pricingShipping = pricing?.shipping ?? 0;

  // Timeline Steps
  const steps = [
    { key: 'pending', label: t('orderPlaced') || 'Order Placed', date: order.createdAt },
    { key: 'confirmed', label: t('statusConfirmed') || 'Confirmed', date: null },
    { key: 'processing', label: t('statusProcessing') || 'Processing', date: null },
    { key: 'shipped', label: t('statusShipped') || 'Shipped', date: shipment?.shippedAt },
    { key: 'delivered', label: t('statusDelivered') || 'Delivered', date: shipment?.deliveredAt },
  ];

  // Determine current step index
  let currentStepIndex = 0;
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  if (order.status === 'cancelled') {
    currentStepIndex = -1; // Special case
  } else {
    currentStepIndex = statusOrder.indexOf(order.status || 'pending');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link to="/account/orders" className="hover:text-primary transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-3 w-3" />
              {t('backToOrders')}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{t('orderHash') || 'Order'} #{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status || 'pending'} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {t('placedOn') || 'Placed on'} {format(new Date(order.createdAt || new Date()), 'PPpp')}
          </p>
        </div>
        

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                {t('items') || 'Items'} ({items.length})
              </h3>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="h-20 w-20 rounded-lg border bg-secondary/30 flex-shrink-0 overflow-hidden">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productTitle || ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.productTitle}</p>
                    <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm border rounded px-2 py-0.5 bg-background">
                        {t('qty') || 'Qty'}: {item.quantity}
                      </div>
                      <div className="font-medium">
                        {storeCurrency} {item.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                {t('orderTimeline') || 'Order Timeline'}
              </h3>
              <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div className={cn(
                        "z-10 flex h-2.5 w-2.5 translate-y-1.5 items-center justify-center rounded-full ring-4 ring-background transition-all",
                        isCompleted ? "bg-primary" : "bg-muted",
                        isCurrent && "scale-125 ring-primary/20"
                      )} />
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-sm font-medium leading-none", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                          {t('status' + step.label.replace(' ', '')) || step.label}
                        </p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(step.date), 'PP p')}
                          </p>
                        )}
                        {/* Show extra info for current step */}
                        {isCurrent && step.key === 'shipped' && shipment && (
                          <div className="mt-2 text-xs bg-muted/50 p-2 rounded border">
                            <span className="font-semibold">{t('courier') || 'Courier'}:</span> {shipment.courier}<br/>
                            <span className="font-semibold">{t('trackingId') || 'Tracking ID'}:</span> {shipment.trackingNumber || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
               <div className="flex items-center gap-3 mb-2">
                 <XCircle className="h-5 w-5" />
                 <h3 className="font-semibold">{t('orderCancelled') || 'Order Cancelled'}</h3>
               </div>
               <p className="text-sm opacity-90">{t('orderCancelledDesc') || 'This order has been cancelled. If you have any questions, please contact support.'}</p>
            </div>
          )}

        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                {t('orderSummary') || 'Order Summary'}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('subtotal') || 'Subtotal'}</span>
                  <span>{storeCurrency} {pricingSubtotal}</span>
                </div>
                {pricingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('discount') || 'Discount'}</span>
                    <span>- {storeCurrency} {pricingDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('shipping') || 'Shipping'}</span>
                  <span>{storeCurrency} {pricingShipping}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>{t('total') || 'Total'}</span>
                  <span>{storeCurrency} {order.total}</span>
                </div>
              </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {t('deliveryAddress') || 'Delivery Address'}
              </h3>
              {shippingAddress ? (
                <div className="text-sm space-y-1 text-muted-foreground">
                   <p className="font-medium text-foreground">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                   <p>{shippingAddress.phone}</p>
                   <p>{shippingAddress.address1}</p>
                   {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                   <p>
                     {shippingAddress.city}
                     {shippingAddress.state ? `, ${shippingAddress.state}` : ''} 
                     {shippingAddress.zip ? ` - ${shippingAddress.zip}` : ''}
                   </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noAddressInfo') || 'No address information'}</p>
              )}
          </div>
          
           {/* Payment Info */}
           <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                {t('paymentMethod') || 'Payment Method'}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-muted px-2 py-1 rounded border font-medium uppercase">
                  {order.paymentMethod || 'COD'}
                </div>
                <span className="text-muted-foreground">
                  {order.paymentStatus === 'paid' ? (t('paid') || 'Paid') : (t('paymentPending') || 'Payment Pending')}
                </span>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
