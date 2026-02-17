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
import { requireUserId, getStoreId, getSession, commitSession } from '~/services/auth.server';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Tag,
  Truck,
  Warehouse,
  ShoppingBag,
  FileText,
  Mail,
  Layers,
  Eye,
  CreditCard,
  Palette,
  Globe,
  Crown,
  ExternalLink,
  Home,
  MessageSquare,
  Info,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  Users,
  Bell,
  Ticket,
} from 'lucide-react';
import { LanguageSelector } from '~/components/LanguageSelector';
import { useTranslation } from '~/contexts/LanguageContext';
import DashboardChatWidget from '~/components/dashboard/DashboardChatWidget';
import { useState, useEffect } from 'react';
import type { TranslationKey } from '~/utils/i18n/index';

// Custom Ozzyl Icon Component (for nav)
const OzzylIcon = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <img
      src="/brand/icon.png"
      alt={String(t('landingFinalCTA_aiAssistantName'))}
      className={className || 'w-5 h-5'}
    />
  );
};

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard - Ozzyl' }];
};

// ============================================================================
// LOADER - Protect route and fetch user/store data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Require authentication
    let userId;
    try {
      userId = await requireUserId(request, context.cloudflare.env);
    } catch (authError) {
      if (authError instanceof Response) {
        // Expected for expired/missing session; avoid noisy [object Response] error logs.
        console.warn(
          '[app.loader] Authentication required:',
          `status=${authError.status}`,
          `location=${authError.headers.get('Location') || 'n/a'}`
        );
      } else {
        console.error('[app.loader] Authentication failed:', authError);
      }
      throw authError; // Re-throw to trigger redirect
    }

    let storeId;
    try {
      storeId = await getStoreId(request, context.cloudflare.env);
    } catch (storeIdError) {
      console.error('[app.loader] Failed to get storeId from session:', storeIdError);
      throw new Response('Session error. Please login again.', { status: 401 });
    }

    // Check database connection
    if (!context.cloudflare?.env?.DB) {
      console.error('[app.loader] Database not available in context');
      throw new Response('Service temporarily unavailable.', { status: 503 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    if (!storeId) {
      console.error('[app.loader] No storeId in session for user:', userId);

      // Self-heal: recover storeId from DB when session is partially stale.
      const userWithStore = await db
        .select({ storeId: users.storeId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const recoveredStoreId = userWithStore[0]?.storeId;
      if (typeof recoveredStoreId === 'number' && recoveredStoreId > 0) {
        const session = await getSession(request, context.cloudflare.env);
        session.set('storeId', recoveredStoreId);

        const currentUrl = new URL(request.url);
        console.warn(
          '[app.loader] Recovered missing storeId from DB and re-committing session:',
          recoveredStoreId
        );

        return redirect(`${currentUrl.pathname}${currentUrl.search}`, {
          headers: {
            'Set-Cookie': await commitSession(session, context.cloudflare.env),
          },
        });
      }

      // User is logged in but has no store in DB - send to onboarding.
      return redirect('/onboarding');
    }

    // Fetch store info with error handling

    let storeResult;
    try {
      storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    } catch (storeDbError) {
      console.error('[app.loader] Database error fetching store:', storeDbError);
      const errorMessage =
        storeDbError instanceof Error ? storeDbError.message : String(storeDbError);
      throw new Response(`Database error: ${errorMessage}`, { status: 500 });
    }

    // Fetch user info with error handling

    let userResult;
    try {
      userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
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
    const onboardingStatus =
      (store as { onboardingStatus?: string }).onboardingStatus || 'completed';
    if (onboardingStatus !== 'completed') {
      throw redirect('/onboarding');
    }

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
    } catch {
      // Table might not exist yet, ignore
      // Table might not exist yet, ignore
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
        storeEnabled: store.storeEnabled ?? true, // Hybrid mode: show store items if enabled
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
// NAVIGATION ITEMS - Grouped by Category (World-class IA with store gating)
// ============================================================================
type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard | React.ComponentType<{ className?: string }>;
  isPaidOnly?: boolean; // Feature requires paid plan
  storeOnly?: boolean; // Only show when storeEnabled=true
  isExternal?: boolean; // Opens in new tab (for builder.ozzyl.com)
};

type NavSection = {
  titleKey: TranslationKey;
  items: NavItem[];
  storeOnly?: boolean; // Hide entire section if store disabled
};

const navSections: NavSection[] = [
  // === HOME ===
  {
    titleKey: 'sidebarHome',
    items: [
      { to: '/app/dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
      { to: '/app/tutorials', labelKey: 'navTutorials', icon: BookOpen },
    ],
  },
  // === ORDERS ===
  {
    titleKey: 'sidebarOrders',
    items: [
      { to: '/app/orders', labelKey: 'navAllOrders', icon: ShoppingCart },
      { to: '/app/abandoned-carts', labelKey: 'navAbandonedCarts', icon: ShoppingBag },
    ],
  },
  // === CUSTOMERS ===
  {
    titleKey: 'sidebarCustomers',
    items: [{ to: '/app/customers', labelKey: 'navCustomers', icon: Users }],
  },
  // === CATALOG ===
  {
    titleKey: 'sidebarCatalog',
    items: [
      { to: '/app/products', labelKey: 'navProducts', icon: Package },
      { to: '/app/inventory', labelKey: 'navInventory', icon: Warehouse },
    ],
  },
  // === ONLINE STORE (Pages & Theme) ===
  {
    titleKey: 'sidebarOnlineStore',
    items: [
      { to: '/app/store/settings', labelKey: 'navTheme', icon: Palette },
      { to: '/app/new-builder', labelKey: 'navPages', icon: FileText },
      { to: '/app/page-builder', labelKey: 'navDragDropBuilder', icon: Layers },
    ],
  },
  // === MARKETING ===
  {
    titleKey: 'sidebarMarketing',
    items: [
      { to: '/app/campaigns', labelKey: 'navCampaigns', icon: Mail },
      { to: '/app/leads', labelKey: 'navLeadInbox', icon: Users },
      { to: '/app/support', labelKey: 'navSupport', icon: Ticket },
      { to: '/app/agent', labelKey: 'landingFinalCTA_aiAssistantName', icon: OzzylIcon },
      { to: '/app/subscribers', labelKey: 'navSubscribers', icon: Mail },
      { to: '/app/push', labelKey: 'navPushNotifications', icon: Bell },
      { to: '/app/discounts', labelKey: 'navDiscounts', icon: Tag },
      { to: '/app/reviews', labelKey: 'navReviews', icon: MessageSquare },
      { to: '/app/analytics', labelKey: 'navAnalytics', icon: BarChart3 },
    ],
  },
  // === SETTINGS ===
  {
    titleKey: 'sidebarSettings',
    items: [
      { to: '/app/settings', labelKey: 'navGeneral', icon: Settings },
      { to: '/app/settings/homepage', labelKey: 'navStorefront', icon: Home },
      { to: '/app/settings/business-mode', labelKey: 'navBusinessMode', icon: Layers },
      { to: '/app/settings/lead-gen', labelKey: 'navLeadGenSettings', icon: Palette },
      { to: '/app/settings/domain', labelKey: 'navDomain', icon: Globe },
      { to: '/app/settings/shipping', labelKey: 'navShipping', icon: Truck },
      { to: '/app/settings/payment', labelKey: 'navPayments', icon: CreditCard },
      { to: '/app/billing', labelKey: 'navPlanBilling', icon: Crown },
      { to: '/app/settings/team', labelKey: 'navTeam', icon: Users },
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
  const {
    store,
    user,
    saasDomain,
    systemNotifications: notifications,
    isImpersonating,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>([]);

  // Load dismissed notifications from localStorage AFTER hydration to prevent mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dismissedNotifications');
        if (saved) {
          setDismissedNotifications(JSON.parse(saved));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Build store URL
  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  // Filter out dismissed notifications
  const visibleNotifications = (notifications || []).filter(
    (n) => !dismissedNotifications.includes(n.id)
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

  // Check if we're on a full-screen builder route (hide sidebar)
  const isBuilderRoute =
    location.pathname.startsWith('/app/new-builder/') ||
    location.pathname === '/app/page-builder' ||
    location.pathname.startsWith('/app/page-builder/') ||
    location.pathname.startsWith('/app/landing-builder');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SHADOW MODE BANNER */}
      {isImpersonating && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="font-bold">
              {t('shadowModeActive')}: {t('viewingAs')} {store.name}
            </span>
          </div>
          <Form method="post" action="/admin/stop-impersonation">
            <button
              type="submit"
              className="bg-white text-red-600 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-red-50 transition"
            >
              {t('exit')}
            </button>
          </Form>
        </div>
      )}

      {/* Mobile Sidebar Overlay - hide on builder routes */}
      {!isBuilderRoute && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hide on builder routes */}
      {!isBuilderRoute && (
        <aside
          className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white/90 backdrop-blur-xl border-r border-white/20
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Store Header */}
            <div className="p-4 border-b border-white/10">
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
                className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/80 text-emerald-700 font-medium rounded-lg transition text-sm backdrop-blur-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {t('goToStore')}
              </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
              {navSections
                // Filter out entire sections that are storeOnly when store is disabled
                .filter((section) => !section.storeOnly || store.storeEnabled)
                .map((section) => {
                  // Filter out individual storeOnly items within sections
                  const visibleItems = section.items.filter(
                    (item) => !item.storeOnly || store.storeEnabled
                  );

                  // Skip rendering section if no visible items
                  if (visibleItems.length === 0) return null;

                  return (
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
                        {visibleItems.map((item) => {
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
                              ${
                                active
                                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
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
                  );
                })}

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
                        ${
                          active
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
            <div className="p-4 border-t border-white/10 bg-white/30 backdrop-blur-sm">
              {/* Language Selector - Temporarily disabled - Bengali is default */}
              {/* <div className="mb-3">
              <LanguageSelector variant="pills" size="sm" className="w-full" />
            </div> */}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-white/50 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-sm font-medium text-gray-600">
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      'U'}
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
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </Form>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content - no left padding on builder routes */}
      <div className={isBuilderRoute ? '' : 'lg:pl-64'}>
        {/* Mobile Header - hide on builder routes */}
        {!isBuilderRoute && (
          <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 px-4 py-3">
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
        )}

        {/* Desktop Header with Language Toggle - hide on builder routes */}
        {!isBuilderRoute && (
          <header className="hidden lg:block sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/20 px-8 py-3">
            <div className="flex items-center justify-end">
              <LanguageSelector variant="pills" size="sm" />
            </div>
          </header>
        )}

        {/* System Notifications - hide on builder routes */}
        {!isBuilderRoute && visibleNotifications.length > 0 && (
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

        {/* Page Content - full width on builder routes */}
        <main className={isBuilderRoute ? '' : 'p-4 lg:p-8'}>
          <div className={isBuilderRoute ? 'w-full h-full' : 'max-w-7xl mx-auto w-full'}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Co-pilot Widget - hide on builder routes */}
      {!isBuilderRoute && (
        <DashboardChatWidget
          userName={user.name || undefined}
          storeName={store.name}
          isLocked={false}
        />
      )}
    </div>
  );
}
