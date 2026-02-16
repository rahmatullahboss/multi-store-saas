import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, Link, useSubmit, useNavigation } from '@remix-run/react';
import { getCustomerOrdersWithItems } from '~/services/customer-account.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { Button } from '~/components/ui/button';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  Clock,
  Hourglass,
  ArrowRight,
  RefreshCcw,
  ShoppingBag,
  Home
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { SerializeFrom } from '@remix-run/cloudflare';


export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { store, storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const pageParam = Number(url.searchParams.get('page') || '1');
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const status = url.searchParams.get('status') || 'all';
  const search = (url.searchParams.get('q') || '').trim();

  const db = createDb(env.DB);
  const { orders, pagination } = await getCustomerOrdersWithItems(
    customerId,
    storeId,
    db,
    page,
    10,
    status,
    search
  );

  return json({ orders, pagination, storeCurrency: store.currency, status, search });
}

function OrderCard({ order, currency }: { order: SerializeFrom<typeof loader>['orders'][number], currency: string }) {
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    
    // Helper to determine display status
    const getStatusInfo = (paymentStatus: string | null, orderStatus: string | null) => {
        // Check order status first for cancellation
        if (orderStatus === 'cancelled') {
             return {
                label: 'Cancelled',
                colorClass: 'bg-red-100 text-red-700',
                icon: RefreshCcw,
                progress: 0,
                progressColor: 'bg-red-500',
                message: 'Order has been cancelled.',
                messageIcon: RefreshCcw,
                messageIconColor: 'text-red-500'
            };
        }

        // Check fulfillment status
        if (orderStatus === 'delivered') {
             return {
                label: 'Delivered',
                colorClass: 'bg-green-100 text-green-700',
                icon: CheckCircle2,
                progress: 100,
                progressColor: 'bg-green-500',
                message: `Package was delivered on ${order.updatedAt ? format(new Date(order.updatedAt), 'MMM d, yyyy') : ''}`,
                messageIcon: Home,
                messageIconColor: 'text-green-600'
            };
        }

        const status = paymentStatus || 'pending';

        switch (status) {
            case 'paid':
                 return {
                    label: 'Paid', // or Processing if we want to show it's moving
                    colorClass: 'bg-emerald-100 text-emerald-700',
                    icon: CheckCircle2,
                    progress: 25,
                    progressColor: 'bg-emerald-500',
                    message: 'Payment received. Order is being processed.',
                    messageIcon: CheckCircle2,
                    messageIconColor: 'text-emerald-600'
                };
            case 'processing': 
                return {
                    label: 'Processing',
                    colorClass: 'bg-amber-100 text-amber-700',
                    icon: Package,
                    progress: 35,
                    progressColor: 'bg-primary',
                    message: 'Seller is preparing your package.',
                    messageIcon: Hourglass,
                    messageIconColor: 'text-amber-500'
                };
            default: // pending
                return {
                    label: 'Pending',
                    colorClass: 'bg-slate-100 text-slate-600',
                    icon: Clock,
                    progress: 10,
                    progressColor: 'bg-slate-400',
                    message: 'Awaiting confirmation.',
                    messageIcon: Clock,
                    messageIconColor: 'text-slate-400'
                };
        }
    };

    const statusInfo = getStatusInfo(order.paymentStatus, order.status);
    const StatusIcon = statusInfo.icon;
    const MessageIcon = statusInfo.messageIcon;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Order ID</span>
                        <p className="text-sm font-bold text-slate-900">#{order.orderNumber}</p>
                    </div>
                     <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                     <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date Placed</span>
                        <p className="text-sm font-medium text-slate-700">{format(date, 'MMM d, yyyy')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold", statusInfo.colorClass)}>
                        <StatusIcon className="w-3.5 h-3.5 mr-1" />
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            {/* Progress Bar Section */}
            {order.status !== 'cancelled' && (
                <div className="mb-8 px-2">
                    <div className="relative">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                            <div 
                                className={cn("shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-500", statusInfo.progressColor)} 
                                style={{ width: `${statusInfo.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-400 relative">
                            <div className={cn(statusInfo.progress >= 10 && "text-primary font-bold")}>Placed</div>
                            <div className={cn(statusInfo.progress >= 35 && "text-primary font-bold")}>Packed</div>
                            <div className={cn(statusInfo.progress >= 75 && "text-primary font-bold")}>Shipped</div>
                            <div className={cn(statusInfo.progress >= 100 && "text-green-600 font-bold")}>Delivered</div>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                        <MessageIcon className={cn("text-base", statusInfo.messageIconColor)} />
                        {statusInfo.message}
                    </p>
                </div>
            )}

            {/* Product & Actions */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                {/* Product List / Preview */}
                {order.items && order.items.length > 0 && (
                    <div className="flex gap-4 items-center">
                        {order.items.length === 1 ? (
                            // Single Item View
                            <>
                                <div className="h-20 w-20 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                    {order.items[0].image ? (
                                        <img 
                                            src={order.items[0].image} 
                                            alt={order.items[0].title} 
                                            className="h-full w-full object-cover" 
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                                            <Package className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">{order.items[0].title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">x{order.items[0].quantity}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Multi Item View
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="h-14 w-14 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className="h-14 w-14 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                                            +{order.items.length - 2}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-semibold text-slate-900">
                                        {order.items[0].title} & {order.items.length - 1} other items
                                    </h4>
                                    <p className="text-sm text-slate-500">Bundle</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Price & Primary Action */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4 md:gap-8 ml-auto w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-slate-900">
                            {currency === 'BDT' ? '৳' : '$'} {order.total}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button asChild variant="outline" className="flex-1 sm:flex-none rounded-full border-slate-200">
                            <Link to={`/account/orders/${order.id}`}>Details</Link>
                        </Button>
                        <Button asChild className="flex-1 sm:flex-none rounded-full shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
                            <Link to={`/account/orders/${order.id}`}>
                                Track Order <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AccountOrders() {
  const {
    orders,
    pagination,
    storeCurrency,
    status: currentStatus,
    search: currentSearch,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  // Status Tabs Configuration
  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'To Pay' },
    { id: 'processing', label: 'To Ship' },
    { id: 'shipped', label: 'To Receive' },
    { id: 'delivered', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  // Function to handle tab change
  const handleTabChange = (statusId: string) => {
    // preserve other params? usually just status reset page
    const params = new URLSearchParams(searchParams);
    if (statusId === 'all') {
      params.delete('status');
    } else {
      params.set('status', statusId);
    }
    params.set('page', '1'); // Reset to page 1
    submit(params); // Using GET default
  };

  return (
    <div className="flex-1 min-w-0 font-display animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">{t('orderHistory') || 'Order History'}</h1>
           <p className="text-slate-500 mt-2 text-lg">
             {t('ordersSubtitle') || 'View and manage your past orders.'}
           </p>
        </div>
        
        {/* Search within orders */}
        <div className="relative w-full sm:w-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <Form method="get" className="w-full">
            {currentStatus !== 'all' && <input type="hidden" name="status" value={currentStatus} />}
            <input type="hidden" name="page" value="1" />
            <input
              name="q"
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
              placeholder={t('searchOrders') || "Search orders..."}
              type="text"
              defaultValue={currentSearch}
            />
          </Form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = (currentStatus || 'all') === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className={cn("space-y-6", isLoading && "opacity-50 pointer-events-none")}>
        {orders.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
             <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="h-8 w-8" />
             </div>
             <p className="text-slate-500 text-lg font-medium">{t('noOrdersFound') || "No orders found"}</p>
             <p className="text-slate-400 max-w-sm mx-auto mt-2 mb-6">We couldn't find any orders matching your criteria.</p>
             <Button asChild variant="default" className="mt-2 text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-8">
                <Link to="/collections/all">Start Shopping</Link>
             </Button>
           </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} currency={storeCurrency || 'BDT'} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
            <Link
              to={`?page=${Math.max(1, pagination.page - 1)}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ''}`}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors",
                pagination.page <= 1 && "pointer-events-none opacity-50"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const p = i + 1; 
                const isActive = p === pagination.page;
                return (
                    <Link
                        key={p}
                        to={`?page=${p}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ''}`}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-full transition-colors",
                            isActive 
                                ? "bg-primary text-white font-medium shadow-md shadow-primary/30" 
                                : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        {p}
                    </Link>
                )
            })}
            
            <Link
              to={`?page=${Math.min(pagination.totalPages, pagination.page + 1)}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}${currentSearch ? `&q=${encodeURIComponent(currentSearch)}` : ''}`}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors",
                pagination.page >= pagination.totalPages && "pointer-events-none opacity-50"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
