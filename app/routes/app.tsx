/**
 * Dashboard Layout
 * 
 * Route: /app (layout for all /app/* routes)
 * 
 * Features:
 * - Protected route (requires authentication)
 * - Responsive sidebar with navigation
 * - Logout functionality
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users, systemNotifications } from '@db/schema';
import { requireUserId, getStoreId, getSession } from '~/services/auth.server';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  BarChart3,
  Tag,
  Truck,
  Warehouse,
  ShoppingBag,
  FileText,
  Mail,
  Eye,
  CreditCard,
  Palette,
  Globe,
  Crown,
  ExternalLink,
  Sparkles,
  Home,
  MessageSquare,
  Info,
  AlertTriangle,
  Rocket,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { LanguageSelector } from '~/components/LanguageSelector';
import { useTranslation } from '~/contexts/LanguageContext';
import DashboardChatWidget from '~/components/dashboard/DashboardChatWidget';
import { useState } from 'react';
import type { TranslationKey } from '~/utils/i18n/index';

// Custom Ozzyl Icon Component (for nav)
const OzzylIcon = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return <img src="/brand/icon.png" alt={String(t('landingFinalCTA_aiAssistantName'))} className={className || 'w-5 h-5'} />;
};


export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Ozzyl' }];
};

// ============================================================================
// LOADER - Protect route and fetch user/store data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  console.log('[app.loader] Dashboard loader started');
  
  try {
    // Require authentication
    let userId;
    try {
      userId = await requireUserId(request, context.cloudflare.env);
      console.log('[app.loader] User authenticated - UserID:', userId);
    } catch (authError) {
      console.error('[app.loader] Authentication failed:', authError);
      throw authError; // Re-throw to trigger redirect
    }
    
    let storeId;
    try {
      storeId = await getStoreId(request, context.cloudflare.env);
      console.log('[app.loader] StoreID from session:', storeId);
    } catch (storeIdError) {
      console.error('[app.loader] Failed to get storeId from session:', storeIdError);
      throw new Response('Session error. Please login again.', { status: 401 });
    }

    if (!storeId) {
      console.error('[app.loader] No storeId in session for user:', userId);
      throw new Response('Store not found. Please contact support.', { status: 404 });
    }

    // Check database connection
    if (!context.cloudflare?.env?.DB) {
      console.error('[app.loader] Database not available in context');
      throw new Response('Service temporarily unavailable.', { status: 503 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    // Fetch store info with error handling
    console.log('[app.loader] Fetching store info for storeId:', storeId);
    let storeResult;
    try {
      storeResult = await db
        .select()
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);
      console.log('[app.loader] Store query completed. Found:', storeResult.length, 'store(s)');
    } catch (storeDbError) {
      console.error('[app.loader] Database error fetching store:', storeDbError);
      const errorMessage = storeDbError instanceof Error ? storeDbError.message : String(storeDbError);
      throw new Response(`Database error: ${errorMessage}`, { status: 500 });
    }

    // Fetch user info with error handling
    console.log('[app.loader] Fetching user info for userId:', userId);
    let userResult;
    try {
      userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      console.log('[app.loader] User query completed. Found:', userResult.length, 'user(s)');
    } catch (userDbError) {
      console.error('[app.loader] Database error fetching user:', userDbError);
      const errorMessage = userDbError instanceof Error ? userDbError.message : String(userDbError);
      throw new Response(`Database error: ${errorMessage}`, { status: 500 });
    }

    const store = storeResult[0];
    const user = userResult[0];

    if (!store) {
      console.error('[app.loader] Store not found in database. StoreID:', storeId);
      
      // CRITICAL: If store is deleted, session is invalid. Logout and redirect with info.
      const session = await getSession(request, context.cloudflare.env);
      const { destroySession } = await import('~/services/auth.server');
      
      throw redirect('/auth/login?error=store_not_found', {
        headers: {
          'Set-Cookie': await destroySession(session, context.cloudflare.env),
        },
      });
    }

    if (!user) {
      console.error('[app.loader] User not found in database. UserID:', userId);
      throw new Response('Your account could not be found. Please login again.', { status: 404 });
    }

    // Check onboarding status - force redirect if not completed
    const onboardingStatus = (store as { onboardingStatus?: string }).onboardingStatus || 'completed';
    if (onboardingStatus !== 'completed') {
      console.log('[app.loader] Onboarding not complete, redirecting to /onboarding');
      throw redirect('/onboarding');
    }

    console.log('[app.loader] Dashboard data loaded successfully for store:', store.name);
    
    // Get SAAS_DOMAIN for store URL
    const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'ozzyl.com';
    
    // Fetch active system notifications
    let activeNotifications: { id: number; message: string; type: string | null }[] = [];
    try {
      const notificationsResult = await db
        .select({
          id: systemNotifications.id,
          message: systemNotifications.message,
          type: systemNotifications.type,
        })
        .from(systemNotifications)
        .where(eq(systemNotifications.isActive, true));
      activeNotifications = notificationsResult;
    } catch (e) {
      // Table might not exist yet, ignore
      // Table might not exist yet, ignore
      console.log('[app.loader] Could not fetch system notifications');
    }
    
    // Check for impersonation
    const session = await getSession(request, context.cloudflare.env);
    const isImpersonating = session.has('originalAdminId');
    
    return json({
      store: {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        planType: store.planType || 'free',
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      saasDomain,
      systemNotifications: activeNotifications,
      isImpersonating,
    });
    
  } catch (error) {
    // Re-throw Response errors (redirects, etc.)
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('[app.loader] Unhandled error in dashboard loader:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[app.loader] Error message:', errorMessage);
    if (errorStack) {
      console.error('[app.loader] Error stack:', errorStack);
    }
    
    throw new Response(`Dashboard error: ${errorMessage}`, { status: 500 });
  }
}

// ============================================================================
// NAVIGATION ITEMS - Grouped by Category (Shopify-inspired)
// ============================================================================
type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  isPaidOnly?: boolean; // Feature requires paid plan
};

type NavSection = {
  titleKey: TranslationKey;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    titleKey: 'sidebarHome',
    items: [
      { to: '/app/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
      { to: '/app/tutorials', labelKey: 'navTutorials', icon: BookOpen },
    ],
  },
  {
    titleKey: 'sidebarCatalog',
    items: [
      { to: '/app/products', labelKey: 'navProducts', icon: Package },
      { to: '/app/inventory', labelKey: 'navInventory', icon: Warehouse },
      { to: '/app/discounts', labelKey: 'navDiscounts', icon: Tag },
    ],
  },
  {
    titleKey: 'sidebarOrders',
    items: [
      { to: '/app/orders', labelKey: 'navAllOrders', icon: ShoppingCart },
      { to: '/app/abandoned-carts', labelKey: 'navAbandonedCarts', icon: ShoppingBag },
    ],
  },
  {
    titleKey: 'sidebarMarketing',
    items: [
      { to: '/app/campaigns', labelKey: 'navCampaigns', icon: Mail },
      { to: '/app/agent', labelKey: 'landingFinalCTA_aiAssistantName', icon: OzzylIcon as any },
      { to: '/app/subscribers', labelKey: 'navSubscribers', icon: Mail },
      { to: '/app/reviews', labelKey: 'navReviews', icon: MessageSquare },
    ],
  },
  {
    titleKey: 'sidebarAnalytics',
    items: [
      { to: '/app/analytics', labelKey: 'navOverview', icon: BarChart3 },
      { to: '/app/reports', labelKey: 'navReports', icon: FileText },
    ],
  },
  {
    titleKey: 'sidebarSettings',
    items: [
      { to: '/app/page-builder', labelKey: 'navPageBuilder' as any, icon: Rocket },
      { to: '/app/store-design', labelKey: 'navStoreTemplates', icon: Palette },
      { to: '/app/settings/homepage', labelKey: 'navHomepage', icon: Home },
      { to: '/app/settings/shipping', labelKey: 'navShipping', icon: Truck },
      { to: '/app/settings/domain', labelKey: 'navDomain', icon: Globe },
      { to: '/app/billing', labelKey: 'navBilling', icon: CreditCard },
      { to: '/app/credits', labelKey: 'navCredits', icon: Sparkles },
      { to: '/app/settings', labelKey: 'navAllSettings', icon: Settings },
      { to: '/landing-live-editor', labelKey: 'navStoreEditor', icon: AlertTriangle },
    ],
  },
];

// Admin-only navigation items
const adminNavItems: NavItem[] = [
  { to: '/app/admin/plans', labelKey: 'navPlanManagement', icon: Crown },
  { to: '/app/admin/payouts', labelKey: 'navPayouts', icon: CreditCard },
  { to: '/app/admin/domains', labelKey: 'navDomainRequests', icon: Globe },
];


// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AppLayout() {
  const { store, user, saasDomain, systemNotifications: notifications, isImpersonating } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>(() => {
    // Load dismissed notifications from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dismissedNotifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Build store URL
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;
  
  // Filter out dismissed notifications
  const visibleNotifications = (notifications || []).filter(
    n => !dismissedNotifications.includes(n.id)
  );
  
  const dismissNotification = (id: number) => {
    const updated = [...dismissedNotifications, id];
    setDismissedNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedNotifications', JSON.stringify(updated));
    }
  };
  
  const getNotificationStyle = (type: string | null) => {
    switch (type) {
      case 'warning':
        return { bg: 'bg-amber-500', icon: AlertTriangle };
      case 'critical':
        return { bg: 'bg-red-500', icon: AlertCircle };
      default:
        return { bg: 'bg-blue-500', icon: Info };
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SHADOW MODE BANNER */}
      {isImpersonating && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="font-bold">{t('shadowModeActive')}: {t('viewingAs')} {store.name}</span>
          </div>
          <Form method="post" action="/admin/stop-impersonation">
            <button type="submit" className="bg-white text-red-600 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-red-50 transition">
              {t('exit')}
            </button>
          </Form>
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Store Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <img src="/brand/icon.png" alt="Ozzyl" className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 truncate max-w-[140px]">
                    {store.name}
                  </h2>
                  <p className="text-xs text-gray-500">{store.subdomain}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Go to Store Button */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              {t('goToStore')}
            </a>
          </div>


          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.titleKey}>
                {/* Section Header - hide for Home */}
                {section.titleKey !== 'sidebarHome' && (
                  <div className="px-3 pb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {t(section.titleKey)}
                    </span>
                  </div>
                )}
                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);
                    const isLocked = item.isPaidOnly && store.planType === 'free';
                    
                    // Locked items - show disabled state with upgrade prompt
                    if (isLocked) {
                      const featureName = item.to.split('/').pop() || 'marketing';
                      return (
                        <Link
                          key={item.to}
                          to={`/app/upgrade?feature=${featureName}`}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition opacity-50 text-gray-400 hover:opacity-70 hover:bg-gray-50 group"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1">{t(item.labelKey)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium group-hover:bg-amber-200">
                            {t('upgrade')}
                          </span>
                        </Link>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition
                          ${active 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : ''}`} />
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Admin Section */}
            {user.role === 'admin' && (
              <>
                <div className="pt-4 pb-2">
                  <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {t('sidebarAdmin')}
                  </span>
                </div>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition
                        ${active 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : ''}`} />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            {/* Language Selector - Temporarily disabled - Bengali is default */}
            {/* <div className="mb-3">
              <LanguageSelector variant="pills" size="sm" className="w-full" />
            </div> */}
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'Merchant'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </Form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-gray-900">{store.name}</h1>
            <LanguageSelector variant="toggle" size="sm" />
          </div>
        </header>

        {/* Desktop Header with Language Toggle */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-3">
          <div className="flex items-center justify-end">
            <LanguageSelector variant="pills" size="sm" />
          </div>
        </header>

        {/* System Notifications */}
        {visibleNotifications.length > 0 && (
          <div className="px-4 lg:px-8 pt-4 space-y-2">
            {visibleNotifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const Icon = style.icon;
              return (
                <div
                  key={notification.id}
                  className={`${style.bg} text-white px-4 py-3 rounded-lg flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-white/80 hover:text-white p-1"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Co-pilot Widget */}
      <DashboardChatWidget 
        userName={user.name || undefined}
        storeName={store.name}
        isLocked={false}
      />
    </div>
  );
}
