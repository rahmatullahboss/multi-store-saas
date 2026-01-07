/**
 * Super Admin Layout
 * 
 * Route: /admin (layout for all /admin/* routes)
 * 
 * Features:
 * - Protected route (requires super_admin role)
 * - Dark sidebar to differentiate from user app
 * - Navigation for super admin functions
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Shield, 
  Users, 
  Radio, 
  Activity, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Store,
  Bell,
  CreditCard,
  Globe,
  Ticket
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Super Admin - Control Panel' }];
};

// ============================================================================
// LOADER - Require Super Admin access
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  
  // Require super admin access - will redirect if not authorized
  const { userId, userEmail } = await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  const userResult = await drizzleDb
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return json({
    user: {
      id: userId,
      email: userEmail,
      name: userResult[0]?.name || 'Super Admin',
    },
  });
}

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================
const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/stores', label: 'All Stores', icon: Store },
  { to: '/admin/domains', label: 'Domain Health', icon: Globe },
  { to: '/admin/billing', label: 'Billing', icon: CreditCard },
  { to: '/admin/marketing', label: 'Marketing', icon: Ticket },
  { to: '/admin/broadcasts', label: 'Broadcasts', icon: Radio },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Theme */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Super Admin</h2>
                  <p className="text-xs text-slate-400">Control Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition
                    ${active 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-red-400' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-red-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </Form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              Super Admin
            </h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
