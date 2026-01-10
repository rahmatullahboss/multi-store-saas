import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, Outlet, useLocation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { Sparkles, MessageSquare, Settings, Book, Bot } from 'lucide-react';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB, { schema });

  // Check if store has Agent enabled
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    columns: { isCustomerAiEnabled: true }
  });

  if (!store?.isCustomerAiEnabled) {
    // In real app, redirect to upgrade page or show marketing
    // For now, allow access but show warning
  }

  // Fetch Agent
  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });

  // If no agent exists, we might want to create a default one or show setup
  // but for now just return what we have
  
  return json({ 
    agent, 
    isLocked: !store?.isCustomerAiEnabled 
  });
};

export default function AgentDashboard() {
  const { agent, isLocked } = useLoaderData<typeof loader>();
  const location = useLocation();

  const tabs = [
    { name: 'Overview', to: '/app/agent', icon: Bot, exact: true },
    { name: 'Configuration', to: '/app/agent/config', icon: Settings },
    { name: 'Chat Simulator', to: '/app/agent/chat', icon: MessageSquare },
    { name: 'Knowledge Base', to: '/app/agent/knowledge', icon: Book },
  ];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
        <p className="text-gray-500 max-w-md mb-6">
          AI Agent is a premium feature. Upgrade your plan to enable 24/7 automated customer support.
        </p>
        <Link 
          to="/app/billing" 
          className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-emerald-600" />
            AI Agent Manager
          </h1>
          <p className="text-gray-500">Manage your virtual assistant and support automation.</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${agent?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {agent?.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = tab.exact 
                ? location.pathname === tab.to
                : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.name}
                to={tab.to}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Child Routes */}
      <div className="min-h-[500px]">
        {location.pathname === '/app/agent' ? (
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h3>
                
                {!agent ? (
                     <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No agent configured yet.</p>
                        <Link 
                            to="/app/agent/config" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Setup Agent
                        </Link>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-sm text-gray-500">Total Conversations</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">0</div>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-sm text-gray-500">Messages Processed</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">0</div>
                         </div>
                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-sm text-gray-500">Leads Collected</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">0</div>
                         </div>
                    </div>
                )}
             </div>
        ) : (
             <Outlet />
        )}
      </div>
    </div>
  );
}
