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
  Plus,
  Wallet,
  User,
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { createDb } from '~/lib/db.server';
import { products, orders } from '@db/schema';
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
  const activeOrdersCount = allOrders.filter((o: any) => 
    o.paymentStatus !== 'paid' && 
    o.paymentStatus !== 'refunded' && 
    o.paymentStatus !== 'reversed' &&
    o.status !== 'delivered' && 
    o.status !== 'cancelled' &&
    o.status !== 'returned'
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

function MobileDashboard() {
  const { stats, activeOrdersCount, wishlistCount, storeCurrency, user, recentOrders, recommendedProducts, popularProducts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="md:hidden pb-24">
      {/* Header Section */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
             {/* Avatar removed as specific avatar field is not in schema, using placeholder */}
             <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200 shadow-sm">
                <User className="w-8 h-8" />
             </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background-light dark:border-background-dark rounded-full"></div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('goodMorning') || 'Good Morning,'}</p>
            <h1 className="text-xl font-bold text-slate-900">{t('welcomeUser', { name: user.name?.split(' ')[0] }) || `Welcome, ${user.name}`}!</h1>
          </div>
        </div>
        <button className="relative p-2.5 rounded-full bg-white shadow-soft border border-slate-100 hover:scale-105 transition-transform">
          <Link to="/account/notifications">
            <span className="sr-only">Notifications</span> 
            <span className="material-icons-round text-slate-600">notifications_none</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Link>
        </button>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mt-2">
        {/* Stat Card 1 */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-start gap-3 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalOrders}</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{t('totalOrders') || 'Total Orders'}</p>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-start gap-3 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{activeOrdersCount}</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{t('activeOrders') || 'Active Orders'}</p>
          </div>
        </div>
        {/* Stat Card 3 */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-start gap-3 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{wishlistCount}</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{t('wishlist') || 'Wishlist'}</p>
          </div>
        </div>
        {/* Stat Card 4 */}
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-start gap-3 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
             <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.loyaltyPoints}</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{t('walletPoints') || 'Points'}</p>
          </div>
        </div>
      </section>

      {/* Banner Ad / Promo */}
      <div className="mt-6 w-full h-32 rounded-2xl bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/20 relative overflow-hidden flex items-center px-6 text-white">
        <div className="z-10">
          <p className="text-xs font-medium opacity-90 mb-1">{t('specialOffer') || 'Special Offer'}</p>
          <h2 className="text-lg font-bold leading-tight">{t('newCollection') || 'New Collection'}<br/>{t('upToOff', { percent: '50%' }) || 'Up to 50% Off!'}</h2>
          <Button size="sm" variant="secondary" className="mt-3 text-xs font-bold h-8" onClick={() => navigate('/products')}>{t('shopNow') || 'Shop Now'}</Button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20">
          <svg className="w-full h-full fill-current" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,87.6,-6.9C85.1,6.6,77.4,19.3,68.9,31.2C60.4,43.1,51.1,54.2,40.1,62.8C29.1,71.4,16.4,77.5,2.6,73.1C-11.2,68.7,-26.1,53.8,-38.3,42.5C-50.5,31.2,-60,23.5,-66.9,13.1C-73.8,2.7,-78.1,-10.4,-75.4,-22.7C-72.7,-35,-63,-46.5,-51.7,-54.6C-40.4,-62.7,-27.5,-67.4,-14.7,-71.4C-1.9,-75.4,14.6,-78.7,30.5,-83.6" transform="translate(100 100)"></path>
          </svg>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('recentOrders') || 'Recent Orders'}</h2>
          <Link to="/account/orders" className="text-sm font-medium text-primary hover:text-primary/80">{t('viewAll') || 'View All'}</Link>
        </div>
        <div className="flex flex-col space-y-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">{t('noOrdersYet') || 'No orders yet'}</div>
          ) : (
            recentOrders.map((order: any) => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-soft border border-slate-100 flex items-center gap-4" onClick={() => navigate(`/account/orders/${order.id}`)}>
                <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {order.firstItem?.imageUrl ? (
                    <img alt={order.firstItem?.title || 'Product'} className="w-full h-full object-cover" src={order.firstItem.imageUrl} />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-400">#{order.orderNumber}</span>
                    <StatusBadge status={order.paymentStatus || 'PENDING'} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                   {order.firstItem?.title || `Order #${order.orderNumber}`}
                  </h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">{storeCurrency === 'BDT' ? '৳' : '$'}{order.total}</p>
                </div>
                <Link to={`/account/orders/${order.id}`} className="shrink-0 p-2 text-slate-400 hover:text-primary transition-colors">
                  <ChevronRight className="text-xl" />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommended Products (Mobile) */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('recommendedForYou') || 'Recommended for you'}</h2>
        <div className="space-y-4">
          {recommendedProducts.map((product) => (
            <Link 
              key={product.id}
              to={`/products/${product.id}`}
              className="group relative bg-white rounded-xl p-3 flex gap-4 shadow-sm border border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                 <h4 className="font-medium text-slate-900 line-clamp-2">{product.title}</h4>
                 <p className="text-sm font-bold text-slate-900 mt-1">
                   {storeCurrency === 'BDT' ? '৳' : '$'}{product.price}
                 </p>
              </div>
            </Link>
          ))}
          {recommendedProducts.length === 0 && (
            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg">{t('noRecommendations') || 'No recommendations'}</div>
          )}
        </div>
      </section>

      {/* Popular Products (Mobile) */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('popularProducts') || 'Popular Products'}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {popularProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm" onClick={() => navigate(`/products/${product.id}`)}>
              <div className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <ShoppingBag className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-slate-800 text-sm mb-1 truncate">{product.title}</h3>
              <p className="font-bold text-primary text-sm">
                {storeCurrency === 'BDT' ? '৳' : '$'}{product.price}
              </p>
            </div>
          ))}
          {popularProducts.length === 0 && (
            <div className="col-span-2 text-center py-8 bg-slate-50 rounded-xl text-slate-500">
              {t('noPopularProducts') || 'No popular products'}
            </div>
          )}
        </div>
      </section>

      {/* Account Settings Quick Links */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('settings') || 'Settings'}</h2>
        <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden divide-y divide-slate-100">
          <Link to="/account/profile" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-700">{t('editProfile') || 'Edit Profile'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link to="/account/addresses" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-700">{t('addresses') || 'Addresses'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
        <form action="/store/auth/logout" method="post" className="w-full mt-6">
          <button type="submit" className="w-full py-3 rounded-xl border border-red-200 text-red-500 bg-red-50 font-medium text-sm hover:bg-red-100 transition-colors">
            {t('logOut') || 'Log Out'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function AccountDashboard() {
  const { stats, recentOrders, activeOrdersCount, wishlistCount, storeCurrency, user, recommendedProducts, popularProducts } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      {/* Mobile View */}
      <MobileDashboard />

      {/* Desktop View */}
      <div className="hidden md:block space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-violet-600 rounded-xl p-8 text-white shadow-lg">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('welcomeUser', { name: user.name?.split(' ')[0] }) || `Welcome back, ${user.name?.split(' ')[0]}!`}</h1>
              <p className="text-white/90 text-lg max-w-xl">{t('dashboardWelcomeMessage') || 'Track your orders, manage your account, and discover new products all in one place.'}</p>
              
              <div className="flex gap-4 mt-6">
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 border-none shadow-md" onClick={() => navigate('/products')}>
                  {t('browseOffers') || 'Browse Offers'}
                </Button>
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white" onClick={() => navigate('/account/orders')}>
                  {t('viewOrders') || 'View Orders'}
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/20">
                <Package className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">All time</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalOrders}</h3>
            <p className="text-slate-500 text-sm mt-1">{t('totalOrders') || 'Total Orders'}</p>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-full"> In progress</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{activeOrdersCount}</h3>
            <p className="text-slate-500 text-sm mt-1">{t('activeOrders') || 'Active Orders'}</p>
          </div>

          {/* Wishlist */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Saved items</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{wishlistCount}</h3>
            <p className="text-slate-500 text-sm mt-1">{t('wishlist') || 'Wishlist'}</p>
          </div>

          {/* Wallet */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-violet-50 text-violet-700 rounded-full">Points</span>
            </div>
            <h3 className="text-2xl font-bold text-primary">{stats.loyaltyPoints}</h3>
            <p className="text-slate-500 text-sm mt-1">{t('walletPoints') || 'Wallet Points'}</p>
          </div>
        </div>

        {/* Recent Orders & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{t('recentOrders') || 'Recent Orders'}</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5" onClick={() => navigate('/account/orders')}>
                {t('viewAll') || 'View All'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">{t('orderId') || 'Order ID'}</th>
                    <th className="px-6 py-4">{t('date') || 'Date'}</th>
                    <th className="px-6 py-4">{t('amount') || 'Amount'}</th>
                    <th className="px-6 py-4">{t('status') || 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/account/orders/${order.id}`)}>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {storeCurrency === 'BDT' ? '৳' : '$'}{order.total}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border",
                            order.paymentStatus === 'paid' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>{t('noOrdersYet') || 'No orders found'}</p>
                        <Button variant="link" className="text-primary mt-2" onClick={() => navigate('/products')}>
                          {t('startShopping') || 'Start Shopping'}
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t('recommendedForYou') || 'Recommended for you'}</h2>
            <div className="flex-1 space-y-4">
              {recommendedProducts.length > 0 ? (
                recommendedProducts.map((product) => (
                  <Link 
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group relative bg-slate-50 rounded-lg p-3 flex gap-4 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/20"
                  >
                    <div className="w-16 h-16 bg-slate-200 rounded-md flex-shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <ShoppingBag className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h4>
                      <p className="text-sm text-slate-500 mb-1">{product.category || 'Product'}</p>
                      <p className="font-bold text-slate-900">
                        {storeCurrency === 'BDT' ? '৳' : '$'}{product.price}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>{t('noRecommendations') || 'No recommendations yet'}</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/products')}>
              {t('viewMore') || 'View More'}
            </Button>
          </div>
        </div>

        {/* Bottom Product Carousel / Grid - Featured Products */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{t('popularProducts') || 'Popular Products'}</h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Product Grid */}
          {popularProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {popularProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="aspect-square bg-slate-50 rounded-lg mb-4 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                        <ShoppingBag className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-medium text-slate-800 text-sm mb-1 truncate">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 truncate">{product.category || 'General'}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {storeCurrency === 'BDT' ? '৳' : '$'}{product.price}
                    </span>
                    <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">{t('noPopularProducts') || 'No products found'}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
