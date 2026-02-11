import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerOrderWithDetails } from '~/services/customer-account.server';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { format } from 'date-fns';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Receipt,
  AlertCircle
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
  if (isNaN(orderId)) throw new Response('Invalid Order ID', { status: 400 });

  const db = drizzle(env.DB, { schema });
  const orderData = await getCustomerOrderWithDetails(orderId, customerId, storeId, db);

  if (!orderData) throw new Response('Order not found', { status: 404 });

  return json({ 
    ...orderData, 
    storeCurrency: store.currency 
  });
}

function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const statusConfig: Record<string, any> = {
    pending: { label: t('statusPending'), icon: Clock, className: 'text-amber-700 border-amber-200', bgClass: 'bg-amber-50' },
    confirmed: { label: t('statusConfirmed'), icon: CheckCircle2, className: 'text-blue-700 border-blue-200', bgClass: 'bg-blue-50' },
    processing: { label: t('statusProcessing'), icon: Package, className: 'text-indigo-700 border-indigo-200', bgClass: 'bg-indigo-50' },
    shipped: { label: t('statusShipped'), icon: Truck, className: 'text-purple-700 border-purple-200', bgClass: 'bg-purple-50' },
    delivered: { label: t('statusDelivered'), icon: CheckCircle2, className: 'text-emerald-700 border-emerald-200', bgClass: 'bg-emerald-50' },
    cancelled: { label: t('statusCancelled'), icon: XCircle, className: 'text-red-700 border-red-200', bgClass: 'bg-red-50' },
    returned: { label: t('statusReturned'), icon: AlertCircle, className: 'text-gray-700 border-gray-200', bgClass: 'bg-gray-50' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', config.bgClass, config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  );
}

export default function OrderDetails() {
  const { order, items, shipment, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null;
  const pricing = order.pricingJson ? JSON.parse(order.pricingJson as string) : null;

  // Timeline Steps
  const steps = [
    { key: 'pending', label: 'Order Placed', date: order.createdAt },
    { key: 'confirmed', label: 'Confirmed', date: null },
    { key: 'processing', label: 'Processing', date: null },
    { key: 'shipped', label: 'Shipped', date: shipment?.shippedAt },
    { key: 'delivered', label: 'Delivered', date: shipment?.deliveredAt },
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
            <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status || 'pending'} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Placed on {format(new Date(order.createdAt || new Date()), 'PPpp')}
          </p>
        </div>
        
        {/* Actions - e.g. Cancel allowed only if pending */}
        {order.status === 'pending' && (
           <Button variant="destructive" size="sm" className="hidden">Cancel Order</Button> 
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Items ({items.length})
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
                        Qty: {item.quantity}
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
                Order Timeline
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
                            <span className="font-semibold">Courier:</span> {shipment.courierProvider}<br/>
                            <span className="font-semibold">Tracking ID:</span> {shipment.trackingCode || 'N/A'}
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
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 text-red-700 dark:text-red-400">
               <div className="flex items-center gap-3 mb-2">
                 <XCircle className="h-5 w-5" />
                 <h3 className="font-semibold">Order Cancelled</h3>
               </div>
               <p className="text-sm opacity-90">This order has been cancelled. If you have any questions, please contact support.</p>
            </div>
          )}

        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Order Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{storeCurrency} {pricing?.subtotal || order.total}</span>
                </div>
                {pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- {storeCurrency} {pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{storeCurrency} {pricing?.shipping || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>Total</span>
                  <span>{storeCurrency} {order.total}</span>
                </div>
              </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Address
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
                <p className="text-sm text-muted-foreground">No address information</p>
              )}
          </div>
          
           {/* Payment Info */}
           <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Method
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-muted px-2 py-1 rounded border font-medium uppercase">
                  {order.paymentMethod || 'COD'}
                </div>
                <span className="text-muted-foreground">
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
