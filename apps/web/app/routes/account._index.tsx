import { json, type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId, getCustomer } from '~/services/customer-auth.server';
import { 
  getCustomerStats, 
  getCustomerRecentOrdersWithImages, 
  getCustomerOrders, 
  getWishlistCount 
} from '~/services/customer-account.server';
import {
  Package,
  ShoppingBag,
  Truck,
  Heart,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Plus,
  ArrowRight
} from 'lucide-react';
import { createDb } from '~/lib/db.server';
import { products } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { useTranslation } from '~/contexts/LanguageContext';

// Helper component for Order Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-800',
    REVERSED: 'bg-orange-100 text-orange-800'
  };
  
  const normalizedStatus = status ? status.toUpperCase() : 'PENDING';
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[normalizedStatus] || styles.PENDING)}>
      {status}
    </span>
  );
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const storeContext = await resolveStore(context, request);
  const customerId = await getCustomerId(request, env);

  if (!storeContext?.store || !customerId) {
    throw redirect('/account/login');
  }

  const { store, storeId } = storeContext;
  const db = createDb(env.DB);
  
  // Get full customer details
  const user = await getCustomer(request, env, env.DB);
  if (!user) throw redirect('/account/login');

  // Fetch recent orders with images
  const recentOrders = await getCustomerRecentOrdersWithImages(customerId, storeId, db, 5);
  
  // Calculate stats
  // getCustomerStats returns totalOrders, totalSpent, loyaltyPoints
  const customerStats = await getCustomerStats(customerId, storeId, db);
  
  // We need rough active count - fetching 100 latest orders to check status 
  const allOrders = await getCustomerOrders(customerId, storeId, db, 100, 0);
  const activeOrdersCount = allOrders.filter((o: { paymentStatus: string | null; status: string | null }) => 
    (o.paymentStatus !== null && o.paymentStatus !== 'paid' && 
    o.paymentStatus !== 'refunded' && 
    o.paymentStatus !== 'reversed') &&
    (o.status !== null && o.status !== 'delivered' && 
    o.status !== 'cancelled' &&
    o.status !== 'returned')
  ).length;
  
  // Wishlist count
  const wishlistCount = await getWishlistCount(customerId, storeId, db);

  // Fetch Recommended Products (Latest 2 for now)
  const recommendedProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      category: products.category,
      inventory: products.inventory,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .orderBy(desc(products.createdAt))
    .limit(2);

  // Fetch Popular Products (Next 10)
  const popularProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      category: products.category,
      inventory: products.inventory,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .orderBy(desc(products.updatedAt)) 
    .limit(10);

  return json({
    user,
    stats: {
      totalOrders: customerStats.totalOrders,
      loyaltyPoints: customerStats.loyaltyPoints,
      pendingReviews: 0
    },
    recentOrders,
    activeOrdersCount,
    wishlistCount,
    storeCurrency: store.currency || 'USD',
    recommendedProducts,
    popularProducts
  });
}



export default function AccountDashboard() {
  const { stats, recentOrders, activeOrdersCount, wishlistCount, storeCurrency, user, recommendedProducts, popularProducts } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 isolate">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t('welcomeUser', { name: user.name?.split(' ')[0] }) || `Welcome back, ${user.name?.split(' ')[0]}!`}
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
              {t('dashboardWelcomeMessage') || 'Track your orders, manage your account, and discover new products all in one place.'}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Button 
                variant="secondary" 
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md transition-all duration-300" 
                onClick={() => navigate('/collections/all')}
              >
                {t('browseOffers') || 'Browse Offers'}
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300" 
                onClick={() => navigate('/account/orders')}
              >
                {t('viewOrders') || 'View Orders'}
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner rotate-3 transition-transform hover:rotate-6 duration-500">
              <Package className="w-12 h-12 text-white/90" />
            </div>
            {/* Decorative elements behind icon */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-400/30 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-100">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">All time</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalOrders}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('totalOrders') || 'Total Orders'}</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-amber-100">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">Active</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeOrdersCount}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('activeOrders') || 'Active Orders'}</p>
          </div>
        </div>

        {/* Wishlist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-pink-100">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-pink-50 text-pink-600 rounded-lg border border-pink-100">Saved</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{wishlistCount}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('wishlist') || 'Wishlist'}</p>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">Points</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-emerald-600 tracking-tight">{stats.loyaltyPoints}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('walletPoints') || 'Wallet Points'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders - Takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              {t('recentOrders') || 'Recent Orders'}
            </h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 font-medium group" onClick={() => navigate('/account/orders')}>
              {t('viewAll') || 'View All'}
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500">{t('orderId') || 'Order ID'}</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">{t('date') || 'Date'}</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">{t('amount') || 'Amount'}</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">{t('status') || 'Status'}</th>
                    <th className="px-6 py-4 font-semibold text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <tr 
                        key={order.id} 
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer" 
                        onClick={() => navigate(`/account/orders/${order.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">#{order.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                            {storeCurrency === 'BDT' ? '৳' : '$'}{order.total}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.paymentStatus || 'PENDING'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">{t('noOrdersYet') || 'No orders found'}</h3>
                        <p className="mb-4 text-slate-400">Looks like you havent placed any orders yet.</p>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" onClick={() => navigate('/collections/all')}>
                          {t('startShopping') || 'Start Shopping'}
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column: Recommendations */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
            {t('recommendedForYou') || 'Recommended'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            {recommendedProducts.length > 0 ? (
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <Link 
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2">{product.title}</h4>
                      <div className="flex items-center justify-between">
                         <span className="font-bold text-slate-900">{storeCurrency === 'BDT' ? '৳' : '$'}{product.price}</span>
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Plus className="w-4 h-4" />
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                <Button variant="outline" className="w-full rounded-xl mt-2 border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30" onClick={() => navigate('/collections/all')}>
                  {t('viewMore') || 'View More Products'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <p>{t('noRecommendations') || 'No recommendations yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Products Carousel */}
      <section className="pt-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
             {t('popularProducts') || 'Trending Now'}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {popularProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popularProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" 
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <ShoppingBag className="w-10 h-10 opacity-20" />
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                     <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                       SALE
                     </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate px-1">
                  {product.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 truncate px-1">{product.category || 'General'}</p>
                
                <div className="flex items-center justify-between px-1 pb-1">
                  <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {storeCurrency === 'BDT' ? '৳' : '$'}{product.price}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {storeCurrency === 'BDT' ? '৳' : '$'}{product.compareAtPrice}
                        </span>
                      )}
                  </div>
                  <button className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">{t('noPopularProducts') || 'No products found'}</p>
            </div>
        )}
      </section>
    </div>
  );
}
